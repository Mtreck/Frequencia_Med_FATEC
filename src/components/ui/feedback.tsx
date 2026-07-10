import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Modal,
    Platform,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "./Button";
import { colors, radius, shadow, spacing, type } from "./theme";

/**
 * Feedback cross-platform: Alert.alert é um no-op no react-native-web,
 * então toasts e confirmações usam este host próprio, montado no layout raiz.
 */

type ToastKind = "success" | "error" | "info";

export interface ConfirmOptions {
    title: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
}

let toastFn: ((kind: ToastKind, message: string) => void) | null = null;
let confirmFn: ((opts: ConfirmOptions) => Promise<boolean>) | null = null;

/** Mostra um toast não bloqueante (funciona em web e mobile). */
export function notify(kind: ToastKind, message: string) {
    toastFn?.(kind, message);
}

/** Diálogo de confirmação. Resolve true se o usuário confirmar. */
export function confirmAction(opts: ConfirmOptions): Promise<boolean> {
    if (confirmFn) return confirmFn(opts);
    // Fallback se o host ainda não montou
    if (Platform.OS === "web") {
        const text = opts.message ? `${opts.title}\n\n${opts.message}` : opts.title;
        return Promise.resolve(window.confirm(text));
    }
    return Promise.resolve(false);
}

const TOAST_ICON: Record<ToastKind, keyof typeof Ionicons.glyphMap> = {
    success: "checkmark-circle",
    error: "alert-circle",
    info: "information-circle",
};

const TOAST_ICON_COLOR: Record<ToastKind, string> = {
    success: "#4ADE80",
    error: "#F87171",
    info: "#7DD3FC",
};

export function FeedbackHost() {
    const insets = useSafeAreaInsets();

    const [toast, setToast] = useState<{ kind: ToastKind; message: string } | null>(null);
    const anim = useRef(new Animated.Value(0)).current;
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [confirm, setConfirm] = useState<{
        opts: ConfirmOptions;
        resolve: (v: boolean) => void;
    } | null>(null);

    useEffect(() => {
        toastFn = (kind, message) => {
            if (hideTimer.current) clearTimeout(hideTimer.current);
            setToast({ kind, message });
            Animated.timing(anim, { toValue: 1, duration: 180, useNativeDriver: false }).start();
            hideTimer.current = setTimeout(() => {
                Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: false }).start(
                    () => setToast(null)
                );
            }, 3200);
        };
        confirmFn = (opts) => new Promise<boolean>((resolve) => setConfirm({ opts, resolve }));

        return () => {
            toastFn = null;
            confirmFn = null;
            if (hideTimer.current) clearTimeout(hideTimer.current);
        };
    }, [anim]);

    function closeConfirm(result: boolean) {
        confirm?.resolve(result);
        setConfirm(null);
    }

    return (
        <>
            {toast && (
                <Animated.View
                    pointerEvents="none"
                    accessibilityLiveRegion="polite"
                    style={[
                        styles.toast,
                        {
                            bottom: Math.max(insets.bottom, spacing.lg) + spacing.sm,
                            opacity: anim,
                            transform: [
                                {
                                    translateY: anim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [12, 0],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    <Ionicons
                        name={TOAST_ICON[toast.kind]}
                        size={20}
                        color={TOAST_ICON_COLOR[toast.kind]}
                    />
                    <Text style={styles.toastText}>{toast.message}</Text>
                </Animated.View>
            )}

            <Modal
                visible={!!confirm}
                transparent
                animationType="fade"
                onRequestClose={() => closeConfirm(false)}
            >
                <View style={styles.confirmBackdrop}>
                    <View style={styles.confirmCard}>
                        <Text style={styles.confirmTitle}>{confirm?.opts.title}</Text>
                        {confirm?.opts.message ? (
                            <Text style={styles.confirmMessage}>{confirm.opts.message}</Text>
                        ) : null}
                        <View style={styles.confirmActions}>
                            <Button
                                title={confirm?.opts.cancelLabel || "Cancelar"}
                                variant="plain"
                                onPress={() => closeConfirm(false)}
                            />
                            <Button
                                title={confirm?.opts.confirmLabel || "Confirmar"}
                                variant={confirm?.opts.destructive ? "danger" : "primary"}
                                onPress={() => closeConfirm(true)}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    toast: {
        position: "absolute",
        alignSelf: "center",
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        backgroundColor: colors.ink,
        borderRadius: radius.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        maxWidth: 480,
        marginHorizontal: spacing.lg,
        ...shadow,
    },
    toastText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: "500",
        flexShrink: 1,
    },
    confirmBackdrop: {
        flex: 1,
        backgroundColor: colors.overlay,
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.xl,
    },
    confirmCard: {
        width: "100%",
        maxWidth: 400,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.xl,
        ...shadow,
    },
    confirmTitle: {
        ...type.sectionTitle,
    },
    confirmMessage: {
        ...type.body,
        marginTop: spacing.sm,
    },
    confirmActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: spacing.sm,
        marginTop: spacing.xl,
    },
});
