// AbbrTooltip.js
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";

export function abbr({
  children,
  title,
  tooltipMaxWidth = 260,
  tooltipBackgroundColor = "#111827",
  tooltipTextColor = "#FFFFFF",
  longPressDelayMs = 250,
}) {
  const [visible, setVisible] = useState(false);
  const [anchorWidth, setAnchorWidth] = useState(0);

  const tooltipStyle = useMemo(() => {
    // Best-effort centering relative to the trigger width.
    return {
      maxWidth: tooltipMaxWidth,
      left: anchorWidth / 2,
      transform: [{ translateX: -tooltipMaxWidth / 2 }],
    };
  }, [anchorWidth, tooltipMaxWidth]);

  useEffect(() => {
    if (Platform.OS !== "web") return;

    const onKeyDown = (ev) => {
      if (ev.key === "Escape") setVisible(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <View style={styles.wrap}>
      <Pressable
        onLongPress={() => setVisible(true)}
        onPressOut={() => setVisible(false)}
        delayLongPress={longPressDelayMs}
        onLayout={(e) => setAnchorWidth(e.nativeEvent.layout.width)}
        onHoverIn={Platform.OS === "web" ? () => setVisible(true) : undefined}
        onHoverOut={Platform.OS === "web" ? () => setVisible(false) : undefined}
        style={styles.trigger}
      >
        {children}
      </Pressable>

      {visible && (
        <View
          pointerEvents="none"
          style={[
            styles.tooltip,
            tooltipStyle,
            { backgroundColor: tooltipBackgroundColor },
          ]}
        >
          <Text style={[styles.tooltipText, { color: tooltipTextColor }]}>
            {title}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    // If a parent uses overflow: "hidden", the tooltip may be clipped.
  },
  trigger: {},
  tooltip: {
    position: "absolute",
    top: 28,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    zIndex: 9999,
  },
  tooltipText: {
    fontSize: 13,
    lineHeight: 16,
  },
});

