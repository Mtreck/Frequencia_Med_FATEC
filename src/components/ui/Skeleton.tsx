import React, { useEffect, useRef } from "react";
import { Animated, DimensionValue, ViewStyle } from "react-native";
import { colors, radius } from "./theme";

interface SkeletonProps {
    height?: number;
    width?: DimensionValue;
    style?: ViewStyle;
}

/** Placeholder pulsante para conteúdo em carregamento. */
export function Skeleton({ height = 16, width = "100%", style }: SkeletonProps) {
    const opacity = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: false }),
                Animated.timing(opacity, { toValue: 0.5, duration: 600, useNativeDriver: false }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, [opacity]);

    return (
        <Animated.View
            style={[
                { height, width, borderRadius: radius.sm, backgroundColor: colors.divider, opacity },
                style,
            ]}
        />
    );
}
