package io.vigour.plugin.example;

import android.support.v7.app.ActionBarActivity;
import android.os.Bundle;
import android.view.View;

import java.util.HashMap;
import java.util.Map;

import io.vigour.plugin.statusbar.MapWrapper;
import io.vigour.plugin.statusbar.StatusBarPlugin;


public class MainActivity extends ActionBarActivity {

    StatusBarPlugin plugin;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        plugin = new StatusBarPlugin(this, findViewById(R.id.screen));
    }

    public void hidden(View v) {
    }

    public void over(View v) {
    }

    public void top(View v) {
    }

    public void black(View v) {
    }

    public void white(View v) {
    }

    public void purple(View v) {
    }

    public void lime(View v) {
    }

    public void alpha0(View v) {
    }

    public void alpha1(View v) {
    }

    public void alpha04(View v) {
    }

    private Map<String, Object> makeMap(String... keyvals) {
        if (keyvals.length % 2 != 0) {
            throw new IllegalArgumentException("must have even amount of args");
        }
        HashMap<String, Object> map = new HashMap<>();
        for (int i = 0; i < keyvals.length; i+=2) {
            map.put(keyvals[i], keyvals[i+1]);
        }
        return map;
    }
}
