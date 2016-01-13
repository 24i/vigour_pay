package io.vigour.plugin.pay;

import android.annotation.TargetApi;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.res.AssetManager;
import android.graphics.Color;
import android.os.Build;
import android.util.Log;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;

//import com.fasterxml.jackson.jr.ob.JSON;

import com.fasterxml.jackson.core.io.IOContext;
import com.fasterxml.jackson.core.io.OutputDecorator;
import com.fasterxml.jackson.jr.ob.JSON;
import com.fasterxml.jackson.jr.ob.JSONObjectException;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.Writer;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import io.vigour.nativewrapper.plugin.core.ActivityResultListener;
import io.vigour.nativewrapper.plugin.core.Plugin;
import io.vigour.plugin.pay.util.IabException;
import io.vigour.plugin.pay.util.IabHelper;
import io.vigour.plugin.pay.util.IabResult;
import io.vigour.plugin.pay.util.Inventory;
import io.vigour.plugin.pay.util.Purchase;
import io.vigour.plugin.pay.util.SkuDetails;
import io.vigour.plugin.statusbar.R;
import rx.Observable;
import rx.Subscriber;
import rx.android.schedulers.AndroidSchedulers;
import rx.schedulers.Schedulers;
import rx.subjects.BehaviorSubject;
import rx.subjects.PublishSubject;
import rx.subjects.Subject;

/**
 * Created by michielvanliempt on 09/04/15.
 */
public class PayPlugin extends Plugin implements ActivityResultListener {

    public static final int PURCHASE_REQUEST_CODE = 0x8a7; //"8a7" looks like "pay", right?

    private static final String TAG = "pay";
    private final IabHelper helper;
    Inventory inventory;
    Activity context;

    public PayPlugin(Activity context) {
        super("pay");
        Log.d(TAG, "calling plugin c'tor");

        this.context = context;
        String base64EncodedPublicKey = context.getResources().getString(R.string.billingKey);
        Log.d(TAG, base64EncodedPublicKey);

        // compute your public key and store it in base64EncodedPublicKey
        helper = new IabHelper(context, base64EncodedPublicKey);
        helper.enableDebugLogging(true, TAG);
        helper.startSetup(new IabHelper.OnIabSetupFinishedListener() {
            public void onIabSetupFinished(IabResult result) {
                if (!result.isSuccess()) {
                    // Oh noes, there was a problem.
                    Log.e(TAG, "Problem setting up In-app Billing: " + result);
                }
                Log.i(TAG, "setting up In-app Billing succesful: " + result);
            }
        });

    }

    public String getProducts(Object items) throws IabException, IOException {
        Log.d(TAG, "called getProducts with " + items.toString());
        Log.d(TAG, items.toString());

        if (!(items instanceof Map)) {
            throw new IllegalArgumentException("arg must be map<string, string>");
        }

        Map<String, String> asMap = (Map<String, String>) items;
        final Collection<String> skus = ((Map<String, String>) items).values();
        inventory = helper.queryInventory(true, new ArrayList<>(skus));
        Log.w("inventory", inventory.toDebugString());
        Map<String, Object> map = new HashMap<>();
        for (String sku : asMap.values()) {
            map.put(sku, createDataObject(inventory.getSkuDetails(sku), inventory.getPurchase(sku)));
        }
        return JSON.std.asString(map);
    }

    private Object createDataObject(SkuDetails skuDetails, Purchase purchase) {
        try {
            final Map<Object, Object> map = JSON.std.mapFrom(JSON.std.asString(skuDetails));
            if (purchase != null) {
                map.putAll(JSON.std.mapFrom(JSON.std.asString(purchase)));
                map.remove("originalJson");
                map.put("vendor", "google");
            }
            return map;
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    public Observable<String> buy(final Map<String, String> product) {
        if (inventory == null) {
            return Observable.error(new IllegalStateException("must first get products"));
        }
        final Observable<String> result = Observable.create(new Observable.OnSubscribe<String>() {
            @Override public void call(final Subscriber<? super String> subscriber) {
                final String sku = product.get("id");
                Log.d(TAG, "called buy with " + sku);
                SkuDetails details = inventory.getSkuDetails(sku);
                if (inventory.hasPurchase(sku)) {
                    try {
                        helper.consume(inventory.getPurchase(sku));
                        Thread.sleep(50); // have to give servers time to update
                    } catch (IabException e) {
                        e.printStackTrace();
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
                if (details == null) {
                    Log.w(TAG, "can't find details for " + product);
                }
                String message = String.format("buying %s...", details.getType(), details.getSku());
                Log.d(TAG, message);
                if (helper.isAsyncInProgress()) {
                    subscriber.onError(new IllegalStateException("operation already started"));
                    subscriber.onCompleted();
                    return;
                }
                Log.d(TAG, "buying...");
                helper.launchPurchaseFlow(context, sku, details.getType(), PURCHASE_REQUEST_CODE, new IabHelper.OnIabPurchaseFinishedListener() {
                    @Override
                    public void onIabPurchaseFinished(IabResult result, Purchase info) {
                        if (result.isSuccess()) {
                            try {
                                subscriber.onNext(JSON.std.asString(info));
                                inventory.addPurchase(info);
                                Thread.sleep(50);
                                helper.consume(info);
                                inventory.erasePurchase(sku);
                            } catch (IOException e) {
                                subscriber.onError(e);
                            } catch (IabException e) {
                                // caused by consuming, we don't care....
                            } catch (InterruptedException e) {
                                // caused by sleep, we don't care
                            }
                        } else {
                            subscriber.onError(new Exception("purchase failed " + result.getMessage()));
                        }
                        subscriber.onCompleted();
                    }
                }, null);
            }
        });
        return result.subscribeOn(Schedulers.io())
                     .observeOn(AndroidSchedulers.mainThread());
    }

    public void onDestroy() {
        if (helper != null) helper.dispose();
    }

    @Override public void onActivityResult(int requestCode, int resultCode, Object data) {
        helper.handleActivityResult(requestCode, resultCode, (Intent) data);
    }

    /*
    public void onPurchaseResult(int resultCode, Intent data) {
        if (!helper.handleActivityResult(PURCHASE_REQUEST_CODE, resultCode, data)) {
            Log.d(TAG, "onActivityResult not handled by IABUtil.");
        }
        else {
            Log.d(TAG, "onActivityResult handled by IABUtil.");
        }
    }

    public String listItems() {
        List<String> skus = new ArrayList<>();
        //get skus from strings or some other xml / json
        if (mHelper.isAsyncInProgress()) {
            debug("can't refresh: async in progress");
            return;
        }
        debug("refreshing...");
        mHelper.queryInventoryAsync(true, skus, new IabHelper.QueryInventoryFinishedListener() {
            @Override
            public void onQueryInventoryFinished(IabResult result, Inventory inv) {
                if (result.isFailure()) {
                    toast("loading items failed");
                    return;
                }

                toast(String.format("got items from store"));
//                output.setText(inv.toDebugString());
                List<SkuDetails> detailsList = new ArrayList<>();
                List<Purchase> haveList = new ArrayList<>();
                for (Items item : Items.values()) {
                    detailsList.add(inv.getSkuDetails(item.name));
                    Purchase purchase = inv.getPurchase(item.name);
                    if (purchase != null) {
                        haveList.add(purchase);
                    }
                }
                populateStoreList(detailsList);
                populateHaveList(haveList);
                debug("refresh done");
            }
        });
    }

    public void buyItem(SkuDetails details) {
    }


    */
}
