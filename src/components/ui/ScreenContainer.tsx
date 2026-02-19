import { StatusBar } from "expo-status-bar";
import React, { ReactNode } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    View,
    ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenContainerProps {
    children: ReactNode;
    /** If true, enables ScrollView. Default is false (static view). */
    scrollable?: boolean;
    /** Style for the outer container (SafeAreaView) */
    containerStyle?: ViewStyle;
    /** Style for the internal content container (ScrollView or View) */
    contentContainerStyle?: ViewStyle;
    /** Vertical offset for KeyboardAvoidingView. Default 0. */
    keyboardOffset?: number;
}

export function ScreenContainer({
    children,
    scrollable = false,
    containerStyle,
    contentContainerStyle,
    keyboardOffset = 0,
}: ScreenContainerProps) {
    return (
        <SafeAreaView style={[styles.container, containerStyle]}>
            <StatusBar style="auto" />
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={keyboardOffset}
            >
                {scrollable ? (
                    <ScrollView
                        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {children}
                    </ScrollView>
                ) : (
                    <View style={[styles.staticContent, contentContainerStyle]}>
                        {children}
                    </View>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF", // Default background
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 16,
    },
    staticContent: {
        flex: 1,
        padding: 16,
    },
});
