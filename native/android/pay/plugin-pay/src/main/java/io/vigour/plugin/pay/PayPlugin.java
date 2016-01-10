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

import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import io.vigour.nativewrapper.plugin.core.Plugin;
import io.vigour.plugin.pay.util.IabException;
import io.vigour.plugin.pay.util.IabHelper;
import io.vigour.plugin.pay.util.IabResult;
import io.vigour.plugin.pay.util.Inventory;
import io.vigour.plugin.statusbar.R;

/**
 * Created by michielvanliempt on 09/04/15.
 */
public class PayPlugin extends Plugin {

    private static final String TAG = "pay";
    private final IabHelper helper;
    public static final int PURCHASE_REQUEST_CODE = 1;

    public PayPlugin(Context context) {
        super("pay");
        Log.d(TAG, "calling plugin c'tor");

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

    public String getProducts(Object items) {
        Log.d(TAG, "called getProducts with " + items.toString());
        Log.d(TAG, items.toString());
        try {
            final List<String> skus = Arrays.asList("mtvplay_android_single",
                                                    "mtvplay_android_monthly",
                                                    "mtvplay_android_yearly");
            final Inventory inventory = helper.queryInventory(true, skus);
            return inventory.toDebugString();
        } catch (IabException e) {
            e.printStackTrace();
            return e.getMessage();
        }
    }

    public String buy(Object productId) {
        Log.d(TAG, "called buy with " + productId.toString());
        return productId.toString();
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

    public void onDestroy() {
        if (helper != null) helper.dispose();
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
        String toast = String.format("buying %s %s...", details.getType(), details.getSku());
        toast(toast);
        if (mHelper.isAsyncInProgress()) {
            debug("can't buy: async in progress...");
            return;
        }
        debug("buying...");
        mHelper.launchPurchaseFlow(this, details.getSku(), details.getType(), PURCHASE_REQUEST_CODE, new IabHelper.OnIabPurchaseFinishedListener() {
            @Override
            public void onIabPurchaseFinished(IabResult result, Purchase info) {
                onResult(result);
            }
        }, null);
    }


    */
}
