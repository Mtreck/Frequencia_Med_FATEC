import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    ViewStyle,
} from "react-native";
import { colors, radius, spacing, touchTarget, type } from "./theme";

type Variant = "primary" | "secondary" | "danger" | "plain";

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: Variant;
    icon?: keyof typeof Ionicons.glyphMap;
    loading?: boolean;
    disabled?: boolean;
    small?: boolean;
    style?: ViewStyle;
}

const BG: Record<Variant, { rest: string; pressed: string; text: string }> = {
    primary: { rest: colors.primary, pressed: colors.primaryPressed, text: colors.white },
    secondary: { rest: colors.primaryTint, pressed: colors.primaryTintPressed, text: colors.primary },
    danger: { rest: colors.dangerTint, pressed: colors.dangerTintPressed, text: colors.danger },
    plain: { rest: "transparent", pressed: colors.divider, text: colors.primary },
};

export function Button({
    title,
    onPress,
    variant = "primary",
    icon,
    loading = false,
    disabled = false,
    small = false,
    style,
}: ButtonProps) {
    const palette = BG[variant];
    const isDisabled = disabled || loading;

    return (
        <Pressable
            onPress={onPress}
            disabled={isDisabled}
            accessibilityRole="button"
            accessibilityState={{ disabled: isDisabled, busy: loading }}
            style={({ pressed }) => [
                styles.base,
                small && styles.small,
                { backgroundColor: pressed ? palette.pressed : palette.rest },
                isDisabled && styles.disabled,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator size="small" color={palette.text} />
            ) : (
                icon && <Ionicons name={icon} size={18} color={palette.text} />
            )}
            <Text style={[type.button, { color: palette.text }]}>{title}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    base: {
        minHeight: touchTarget,
        borderRadius: radius.md,
        paddingHorizontal: spacing.lg,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.sm,
    },
    small: {
        minHeight: 40,
        paddingHorizontal: spacing.md,
    },
    disabled: {
        opacity: 0.5,
    },
});
