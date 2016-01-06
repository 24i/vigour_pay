package io.vigour.plugin.statusbar;

/**
 * Created by michielvanliempt on 13/12/15.
 */
public class StatusBarInfo {
    AlphaColor background = new AlphaColor();
    AlphaColor text = new AlphaColor();
    String display = "top";

    public class AlphaColor {
        String color = "#ffffff";
        Float opacity = 1.f;
    }
}
