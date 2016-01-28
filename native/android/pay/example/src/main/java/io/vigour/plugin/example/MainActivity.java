package io.vigour.plugin.example;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.TextView;

import java.util.HashMap;
import java.util.Map;

import io.vigour.plugin.pay.PayPlugin;
import rx.functions.Action1;

public class MainActivity extends Activity {

    public static final String SINGLE = "mtvplay_android_single";
    public static final String MONTH = "mtvplay_android_monthly";
    public static final String YEAR = "mtvplay_android_yearly";

    PayPlugin plugin;
    TextView textView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        plugin = new PayPlugin(this);
        textView = (TextView) findViewById(R.id.screen);
    }

    public void getProducts(View v) {
        textView.setText("clicked getProducts");
        try {
            Map<String, String> map = new HashMap<>();
            map.put("single", SINGLE);
            map.put("monthly", MONTH);
            map.put("yearly", YEAR);
            textView.setText(plugin.getProducts(map));
        } catch (Exception e) {
            textView.setText(e.getMessage());
        }
    }

    public void buySingle(View v) {
        textView.setText("clicked buySingle");
        buy(SINGLE);
    }

    public void buyMonthly(View v) {
        textView.setText("clicked buyMonthly");
        buy(MONTH);
    }

    public void buyYearly(View v) {
        textView.setText("clicked buyYearly");
        buy(YEAR);
    }

    private void buy(String id) {
        Map<String, String> map = new HashMap<>();
        map.put("id", id);
        textView.setText("buying...");
        plugin.buy(map).subscribe(new Action1<String>() {
                                      @Override public void call(String s) {
                                          Log.i("receipt", s);
                                          textView.setText(s);
                                      }
                                  },
                                  new Action1<Throwable>() {
                                      @Override public void call(Throwable throwable) {
                                          textView.setText("error: " + throwable.getMessage());
                                      }
                                  });
    }

    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        plugin.onActivityResult(requestCode, resultCode, data);
    }
}
