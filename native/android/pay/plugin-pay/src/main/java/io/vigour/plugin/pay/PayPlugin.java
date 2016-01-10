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

import com.fasterxml.jackson.jr.ob.JSON;
import com.fasterxml.jackson.jr.ob.JSONObjectException;

import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import io.vigour.nativewrapper.plugin.core.Plugin;
import io.vigour.plugin.pay.util.IabException;
import io.vigour.plugin.pay.util.IabHelper;
import io.vigour.plugin.pay.util.IabResult;
import io.vigour.plugin.pay.util.Inventory;
import io.vigour.plugin.pay.util.Purchase;
import io.vigour.plugin.pay.util.SkuDetails;
import io.vigour.plugin.statusbar.R;

/**
 * Created by michielvanliempt on 09/04/15.
 */
public class PayPlugin extends Plugin {

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

        final List<String> skus = Arrays.asList("mtvplay_android_single",
                                                "mtvplay_android_monthly",
                                                "mtvplay_android_yearly");
        inventory = helper.queryInventory(true, skus);
        Map<String, Object> map = new HashMap<>();
        map.put("mtvplay_android_single", inventory.getSkuDetails("mtvplay_android_single"));
        map.put("mtvplay_android_monthly", inventory.getSkuDetails("mtvplay_android_monthly"));
        map.put("mtvplay_android_yearly", inventory.getSkuDetails("mtvplay_android_yearly"));
        return JSON.std.asString(map);
    }

    public String buy(Map<String, String> product) {
        Log.d(TAG, "called buy with " + product.toString());
        SkuDetails details = inventory.getSkuDetails(product.get("id"));
        if (details == null) {
            Log.w(TAG, "can't find details for " + product);
        }
        String message = String.format("buying %s...", details.getType(), details.getSku());
        Log.d(TAG, message);
        if (helper.isAsyncInProgress()) {
            Log.d(TAG, "can't buy: async in progress...");
            return "error";
        }
        Log.d(TAG, "buying...");
        helper.launchPurchaseFlow(context, details.getSku(), details.getType(), PURCHASE_REQUEST_CODE, new IabHelper.OnIabPurchaseFinishedListener() {
            @Override
            public void onIabPurchaseFinished(IabResult result, Purchase info) {
                Log.i(TAG, "buy result: " + result + " --> " + info);
            }
        }, null);
        return "wait for it....";
    }

    public void onDestroy() {
        if (helper != null) helper.dispose();
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
