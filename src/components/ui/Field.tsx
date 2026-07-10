import React, { useState } from "react";
import {
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    View,
    ViewStyle,
} from "react-native";
import { colors, radius, spacing, touchTarget, type } from "./theme";

interface FieldProps extends TextInputProps {
    label?: string;
    error?: string | null;
    containerStyle?: ViewStyle;
}

export function Field({ label, error, containerStyle, style, ...inputProps }: FieldProps) {
    const [focused, setFocused] = useState(false);

    return (
        <View style={containerStyle}>
            {label ? <Text style={styles.label}>{label}</Text> : null}
            <TextInput
                placeholderTextColor={colors.muted}
                accessibilityLabel={label || inputProps.placeholder}
                {...inputProps}
                onFocus={(e) => {
                    setFocused(true);
                    inputProps.onFocus?.(e);
                }}
                onBlur={(e) => {
                    setFocused(false);
                    inputProps.onBlur?.(e);
                }}
                style={[
                    styles.input,
                    focused && styles.inputFocused,
                    !!error && styles.inputError,
                    style,
                ]}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    label: {
        ...type.label,
        marginBottom: spacing.xs + 2,
    },
    input: {
        minHeight: touchTarget,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        fontSize: 15,
        color: colors.ink,
        backgroundColor: colors.surface,
        ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as object) : null),
    },
    inputFocused: {
        borderColor: colors.primary,
        ...(Platform.OS === "web"
            ? ({ boxShadow: "0 0 0 3px rgba(14, 58, 94, 0.15)" } as object)
            : null),
    },
    inputError: {
        borderColor: colors.danger,
    },
    error: {
        ...type.meta,
        color: colors.danger,
        marginTop: spacing.xs,
    },
});
