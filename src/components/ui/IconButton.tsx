import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { colors, radius } from "./theme";

interface IconButtonProps {
    icon: keyof typeof Ionicons.glyphMap;
    /** Rótulo para leitores de tela — obrigatório porque o botão não tem texto. */
    label: string;
    onPress: () => void;
    color?: string;
    size?: number;
}

export function IconButton({ icon, label, onPress, color = colors.muted, size = 20 }: IconButtonProps) {
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={label}
            hitSlop={4}
            style={({ pressed }) => [styles.base, pressed && styles.pressed]}
        >
            <Ionicons name={icon} size={size} color={color} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    base: {
        width: 40,
        height: 40,
        borderRadius: radius.sm,
        alignItems: "center",
        justifyContent: "center",
    },
    pressed: {
        backgroundColor: colors.divider,
    },
});
