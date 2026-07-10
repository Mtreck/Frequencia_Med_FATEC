import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { FeedbackHost } from "../src/components/ui/feedback";
import { colors } from "../src/components/ui/theme";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: "600" },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: "Login", headerShown: false }} />
        <Stack.Screen name="preceptor/create" options={{ title: "Criar chamada" }} />
        <Stack.Screen name="preceptor/scan" options={{ title: "Escanear RAs" }} />
        <Stack.Screen name="coordinator/list" options={{ title: "Chamadas" }} />
        <Stack.Screen name="coordinator/[id]" options={{ title: "Detalhes da chamada" }} />
        <Stack.Screen name="coordinator/group" options={{ title: "Chamadas do dia" }} />
        <Stack.Screen name="coordinator/import-edubox" options={{ title: "Enviar para o Edubox" }} />
        <Stack.Screen name="admin" options={{ title: "Administração" }} />
      </Stack>
      <FeedbackHost />
    </SafeAreaProvider>
  );
}
