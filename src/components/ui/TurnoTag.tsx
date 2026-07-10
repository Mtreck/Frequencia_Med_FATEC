import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { colors, radius, spacing } from "./theme";

/**
 * Tag do turno para identificação de bater o olho, dentro da paleta do app:
 * Manhã em azul claro (tingido), Tarde em navy sólido.
 */
export function TurnoTag({ turno, style }: { turno: string; style?: ViewStyle }) {
    const s = String(turno || "").toLowerCase();
    if (s !== "manha" && s !== "tarde") return null;

    const manha = s === "manha";
    const bg = manha ? colors.primaryTint : colors.primary;
    const fg = manha ? colors.primary : colors.white;

    return (
        <View style={[styles.tag, { backgroundColor: bg }, style]}>
            <Ionicons name={manha ? "sunny" : "partly-sunny"} size={13} color={fg} />
            <Text style={[styles.text, { color: fg }]}>{manha ? "Manhã" : "Tarde"}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    tag: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        gap: spacing.xs,
        borderRadius: radius.pill,
        paddingHorizontal: spacing.sm + 2,
        paddingVertical: 3,
    },
    text: {
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 0.3,
        textTransform: "uppercase",
    },
});
