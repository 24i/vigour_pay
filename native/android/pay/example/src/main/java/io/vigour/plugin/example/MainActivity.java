package io.vigour.plugin.example;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.widget.TextView;

import java.util.HashMap;
import java.util.Map;

import io.vigour.plugin.pay.PayPlugin;

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
        textView.setText(plugin.buy(map));
    }
}
