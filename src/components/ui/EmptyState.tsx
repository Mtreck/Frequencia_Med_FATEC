import { Ionicons } from "@expo/vector-icons";
import React, { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, type } from "./theme";

interface EmptyStateProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description?: string;
    /** Ação opcional (ex.: um Button) exibida abaixo do texto. */
    children?: ReactNode;
}

export function EmptyState({ icon, title, description, children }: EmptyStateProps) {
    return (
        <View style={styles.container}>
            <View style={styles.iconCircle}>
                <Ionicons name={icon} size={26} color={colors.muted} />
            </View>
            <Text style={styles.title}>{title}</Text>
            {description ? <Text style={styles.description}>{description}</Text> : null}
            {children ? <View style={styles.action}>{children}</View> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        paddingVertical: spacing.xxl,
        paddingHorizontal: spacing.xl,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.divider,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing.md,
    },
    title: {
        ...type.itemTitle,
        textAlign: "center",
    },
    description: {
        ...type.meta,
        textAlign: "center",
        marginTop: spacing.xs,
        maxWidth: 280,
        lineHeight: 18,
    },
    action: {
        marginTop: spacing.lg,
    },
});
