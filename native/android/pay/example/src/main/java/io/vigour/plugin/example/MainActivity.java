package io.vigour.plugin.example;

import android.app.Activity;
import android.support.v7.app.ActionBarActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.TextView;

import java.util.HashMap;
import java.util.Map;

import io.vigour.plugin.pay.PayPlugin;
import io.vigour.plugin.statusbar.MapWrapper;
import io.vigour.plugin.statusbar.StatusBarPlugin;


public class MainActivity extends Activity {

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
        textView.setText(plugin.getProducts("{}"));
    }

    public void buySingle(View v) {
        textView.setText("clicked buySingle");
        textView.setText(plugin.buy("single"));
    }

    public void buyMonthly(View v) {
        textView.setText("clicked buyMonthly");
        textView.setText(plugin.buy("monthly"));
    }

    public void buyYearly(View v) {
        textView.setText("clicked buyYearly");
        textView.setText(plugin.buy("yearly"));
    }
}
