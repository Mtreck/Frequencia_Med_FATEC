import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="login"
          options={{
            title: "Login",
            headerStyle: { backgroundColor: "#0E3A5E" },
            headerTintColor: "#FFFFFF",
          }}
        />
        <Stack.Screen
          name="preceptor/create"
          options={{
            title: "Criar chamada",
            headerStyle: { backgroundColor: "#0E3A5E" },
            headerTintColor: "#FFFFFF",
          }}
        />
        <Stack.Screen
          name="preceptor/scan"
          options={{
            title: "Escanear RAs",
            headerStyle: { backgroundColor: "#0E3A5E" },
            headerTintColor: "#FFFFFF",
          }}
        />
        <Stack.Screen
          name="coordinator/list"
          options={{
            title: "Chamadas (Coord.)",
            headerStyle: { backgroundColor: "#0E3A5E" },
            headerTintColor: "#FFFFFF",
          }}
        />
        <Stack.Screen
          name="coordinator/[id]"
          options={{
            title: "Detalhes",
            headerStyle: { backgroundColor: "#0E3A5E" },
            headerTintColor: "#FFFFFF",
          }}
        />
        <Stack.Screen
          name="admin"
          options={{
            title: "Administrador",
            headerStyle: { backgroundColor: "#0E3A5E" },
            headerTintColor: "#FFFFFF",
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
