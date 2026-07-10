import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "./theme";

/**
 * Marca no cabeçalho: logo da FATEC tingida de branco sobre o header azul
 * + papel do usuário ao lado. Usar via headerTitle.
 */
export function HeaderBrand({ label }: { label?: string }) {
    return (
        <View style={styles.brandRow}>
            <Image
                source={require("../../../assets/images/logoFatecHeader.png")}
                style={styles.logo}
                resizeMode="contain"
                accessibilityLabel="Logotipo FATEC"
            />
            {label ? (
                <>
                    <View style={styles.divider} />
                    <Text style={styles.brandLabel}>{label}</Text>
                </>
            ) : null}
        </View>
    );
}

/** Botão de sair do cabeçalho: pílula com contorno, ícone e texto. */
export function HeaderLogout({ onPress }: { onPress: () => void }) {
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel="Sair da conta"
            style={({ pressed }) => [styles.logout, pressed && styles.logoutPressed]}
        >
            <Ionicons name="log-out-outline" size={17} color={colors.white} />
            <Text style={styles.logoutText}>Sair</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    brandRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
    },
    logo: {
        width: 152,
        height: 32,
        tintColor: colors.white,
    },
    divider: {
        width: 1,
        height: 22,
        backgroundColor: "rgba(255, 255, 255, 0.35)",
    },
    brandLabel: {
        color: colors.white,
        fontSize: 15,
        fontWeight: "600",
        opacity: 0.95,
    },
    logout: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        minHeight: 36,
        paddingHorizontal: spacing.md,
        marginRight: spacing.sm,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.45)",
        backgroundColor: "rgba(255, 255, 255, 0.12)",
    },
    logoutPressed: {
        backgroundColor: "rgba(255, 255, 255, 0.25)",
    },
    logoutText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: "600",
    },
});
