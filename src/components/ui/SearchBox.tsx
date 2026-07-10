import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Platform, StyleSheet, TextInput, View, ViewStyle } from "react-native";
import { IconButton } from "./IconButton";
import { colors, radius, spacing, touchTarget } from "./theme";

interface SearchBoxProps {
    value: string;
    onChangeText: (v: string) => void;
    placeholder?: string;
    style?: ViewStyle;
}

export function SearchBox({
    value,
    onChangeText,
    placeholder = "Buscar...",
    style,
}: SearchBoxProps) {
    const [focused, setFocused] = useState(false);

    return (
        <View style={[styles.box, focused && styles.boxFocused, style]}>
            <Ionicons name="search-outline" size={18} color={colors.muted} />
            <TextInput
                value={value}
                onChangeText={onChangeText}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder={placeholder}
                placeholderTextColor={colors.muted}
                accessibilityLabel={placeholder}
                style={styles.input}
            />
            {value.length > 0 && (
                <IconButton
                    icon="close-circle"
                    label="Limpar busca"
                    size={18}
                    onPress={() => onChangeText("")}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    box: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        minHeight: touchTarget,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        paddingLeft: spacing.md,
        paddingRight: spacing.xs,
    },
    boxFocused: {
        borderColor: colors.primary,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: colors.ink,
        paddingVertical: spacing.sm,
        ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as object) : null),
    },
});
