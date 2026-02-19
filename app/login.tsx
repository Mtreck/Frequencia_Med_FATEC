import { router } from "expo-router";
import { useState } from "react";
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { login } from "../src/components/services/auth";
import { ScreenContainer } from "../src/components/ui/ScreenContainer";

const COLORS = {
  primary: "#0E3A5E",
  white: "#FFFFFF",
  text: "#0B1220",
  border: "#E2E8F0",
  muted: "#64748B",
  bg: "#FFFFFF",
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    try {
      setLoading(true);
      await login(email.trim(), password);
      router.replace("/"); // ✅ deixa o index decidir a rota
    } catch (e: any) {
      Alert.alert("Erro", e?.message || "Falha no login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.centerContent}>
      <View style={styles.card}>
        <Image source={require("../assets/images/logoFatec.png")} style={styles.logo} resizeMode="contain" />

        <Text style={styles.title}>Frequência Medicina</Text>
        <Text style={styles.subtitle}>Controle de presença (UBS)</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={COLORS.muted}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor={COLORS.muted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={[styles.button, loading && { opacity: 0.7 }]} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Entrando..." : "Entrar"}</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centerContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: COLORS.bg,
    borderRadius: 20,
    padding: 24,
  },
  logo: { width: 140, height: 140, alignSelf: "center", marginBottom: 10 },
  title: { fontSize: 26, fontWeight: "900", textAlign: "center", color: COLORS.text },
  subtitle: { marginTop: 4, marginBottom: 18, textAlign: "center", color: COLORS.muted, fontWeight: "700" },
  input: { borderWidth: 1, borderColor: COLORS.border, padding: 12, borderRadius: 12, marginBottom: 12, color: COLORS.text },
  button: { backgroundColor: COLORS.primary, padding: 14, borderRadius: 12, alignItems: "center" },
  buttonText: { color: COLORS.white, fontWeight: "900" },
});
