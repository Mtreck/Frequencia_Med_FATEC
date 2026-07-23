import React, { ReactNode } from "react";
import {
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    useWindowDimensions,
    View,
} from "react-native";
import { IconButton } from "./IconButton";
import { colors, radius, shadow, spacing, type } from "./theme";

interface AppModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    footer?: ReactNode;
}

export function AppModal({ visible, onClose, title, children, footer }: AppModalProps) {
    const { width, height } = useWindowDimensions();
    const isWide = width >= 640;

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={[styles.backdrop, isWide && styles.backdropWide]}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === "ios" ? "padding" : "height"}
                            style={[
                                styles.modalContainer,
                                isWide && styles.modalContainerWide,
                                { maxHeight: height * 0.9 },
                            ]}
                        >
                            {/* Impede fechar ao clicar dentro do modal */}
                            <TouchableWithoutFeedback>
                                <View style={styles.innerContent}>
                                    <View style={styles.header}>
                                        <Text style={styles.title}>{title}</Text>
                                        <IconButton icon="close" label="Fechar" onPress={onClose} />
                                    </View>

                                    <ScrollView
                                        style={styles.body}
                                        contentContainerStyle={styles.bodyContent}
                                        keyboardShouldPersistTaps="handled"
                                    >
                                        {children}
                                    </ScrollView>

                                    {footer && <View style={styles.footer}>{footer}</View>}
                                </View>
                            </TouchableWithoutFeedback>
                        </KeyboardAvoidingView>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: "flex-end", // bottom sheet no mobile
        alignItems: "center",
    },
    backdropWide: {
        justifyContent: "center",
        padding: spacing.xl,
    },
    modalContainer: {
        width: "100%",
        backgroundColor: colors.surface,
        borderTopLeftRadius: radius.lg,
        borderTopRightRadius: radius.lg,
        overflow: "hidden",
        ...shadow,
    },
    modalContainerWide: {
        maxWidth: 560,
        borderRadius: radius.lg,
    },
    innerContent: {
        width: "100%",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: spacing.md,
        paddingLeft: spacing.lg,
        paddingRight: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    title: {
        ...type.sectionTitle,
    },
    body: {
        flex: 1,
        minHeight: 0,
    },
    bodyContent: {
        padding: spacing.lg,
    },
    footer: {
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.divider,
        backgroundColor: colors.bg,
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: spacing.sm,
    },
});
