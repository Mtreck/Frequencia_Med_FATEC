import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { login } from "../src/components/services/auth";
import { Button } from "../src/components/ui/Button";
import { Field } from "../src/components/ui/Field";
import { ScreenContainer } from "../src/components/ui/ScreenContainer";
import { colors, radius, shadow, spacing, type } from "../src/components/ui/theme";

function loginErrorMessage(code?: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "E-mail inválido.";
    case "auth/user-disabled":
      return "Esta conta foi desativada.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "E-mail ou senha incorretos.";
    case "auth/too-many-requests":
      return "Muitas tentativas. Aguarde alguns minutos e tente de novo.";
    case "auth/network-request-failed":
      return "Sem conexão. Verifique sua internet.";
    default:
      return "Não foi possível entrar. Tente novamente.";
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError("Informe e-mail e senha.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await login(email.trim(), password);
      router.replace("/"); // o index decide a rota pelo perfil
    } catch (e: any) {
      setError(loginErrorMessage(e?.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.centerContent}>
      <View style={styles.card}>
        <Image
          source={require("../assets/images/logoFatec.png")}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Logotipo FATEC"
        />

        <Text style={styles.title}>Frequência Medicina</Text>
        <Text style={styles.subtitle}>Controle de presença nas UBS</Text>

        <Field
          label="E-mail"
          placeholder="seu@email.com"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            if (error) setError(null);
          }}
          containerStyle={styles.field}
        />

        <Field
          label="Senha"
          placeholder="Sua senha"
          secureTextEntry
          autoComplete="password"
          value={password}
          onChangeText={(v) => {
            setPassword(v);
            if (error) setError(null);
          }}
          onSubmitEditing={handleLogin}
          containerStyle={styles.field}
        />

        {error ? (
          <View style={styles.errorBox} accessibilityLiveRegion="polite">
            <Ionicons name="alert-circle" size={18} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Button
          title={loading ? "Entrando..." : "Entrar"}
          onPress={handleLogin}
          loading={loading}
          style={styles.button}
        />
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
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xxl,
    ...shadow,
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: "center",
    marginBottom: spacing.sm,
  },
  title: {
    ...type.screenTitle,
    textAlign: "center",
  },
  subtitle: {
    ...type.meta,
    fontSize: 14,
    textAlign: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  field: {
    marginBottom: spacing.lg,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.dangerTint,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    ...type.meta,
    color: colors.danger,
    flexShrink: 1,
  },
  button: {
    marginTop: spacing.xs,
  },
});
