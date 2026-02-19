import React, { ReactNode } from "react";
import {
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    useWindowDimensions,
    View
} from "react-native";

interface AppModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    footer?: ReactNode;
}

export function AppModal({ visible, onClose, title, children, footer }: AppModalProps) {
    const { width, height } = useWindowDimensions();
    const isWebWide = width >= 768; // Helper for web responsiveness

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.backdrop}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === "ios" ? "padding" : "height"}
                            style={[
                                styles.modalContainer,
                                isWebWide && styles.modalContainerWeb,
                                { maxHeight: height * 0.9 } // 90% of screen height
                            ]}
                        >
                            {/* Prevent closing when clicking inside the modal */}
                            <TouchableWithoutFeedback>
                                <View style={styles.innerContent}>
                                    {/* Header */}
                                    <View style={styles.header}>
                                        <Text style={styles.title}>{title}</Text>
                                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                            <Text style={styles.closeText}>✕</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* Scrollable Body */}
                                    <ScrollView
                                        style={styles.body}
                                        contentContainerStyle={styles.bodyContent}
                                        keyboardShouldPersistTaps="handled"
                                    >
                                        {children}
                                    </ScrollView>

                                    {/* Fixed Footer */}
                                    {footer && (
                                        <View style={styles.footer}>
                                            {footer}
                                        </View>
                                    )}
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
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end", // Bottom sheet style on mobile
        alignItems: "center",
    },
    modalContainer: {
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    modalContainerWeb: {
        width: 600, // Fixed width on large screens
        marginBottom: "auto", // Center vertically on web
        marginTop: "auto",
        borderRadius: 20, // Full rounded corners on web
    },
    innerContent: {
        width: "100%",
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
        backgroundColor: "#FFFFFF",
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#0F172A",
    },
    closeBtn: {
        padding: 8,
    },
    closeText: {
        fontSize: 20,
        color: "#64748B",
    },
    body: {
        // Removed flex: 1 to allow content to define height
    },
    bodyContent: {
        padding: 16,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
        backgroundColor: "#F8FAFC",
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 12,
    },
});
