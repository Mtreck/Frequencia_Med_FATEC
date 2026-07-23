import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getRollcall } from "../../src/components/services/rollcalls";
import { Button } from "../../src/components/ui/Button";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { notify } from "../../src/components/ui/feedback";
import { colors, radius, spacing } from "../../src/components/ui/theme";
import { useAuthGuard } from "../../src/components/utils/useAuthGuard";

function formatDateBRFromISO(dateISO: string) {
  // "2026-02-09" -> "09/02/2026"
  const [y, m, d] = String(dateISO).split("-");
  if (!y || !m || !d) return dateISO;
  return `${d}/${m}/${y}`;
}

/**
 * Número da aula para o CSV do Edubox: cada chamada pode ser lançada
 * uma vez por aula (1ª e 2ª) sem o Edubox acusar duplicidade.
 * Chamadas antigas: "manha" -> 1, "tarde" -> 2.
 */
function aulaNumber(shift: string): "1" | "2" {
  const s = String(shift || "").toLowerCase();
  return s === "aula2" || s === "tarde" ? "2" : "1";
}

function makeBodyRADateBR(ras: string[], dateISO: string, shift: string) {
  const dateBR = formatDateBRFromISO(dateISO);
  const aula = aulaNumber(shift);

  const lines = ras
    .map((ra) => String(ra).trim())
    .filter(Boolean)
    .map((ra) => `${ra};${dateBR};${aula}`);

  return lines.join("\r\n") + "\r\n";
}

function parseEduboxQrToUrl(data: string): string {
  const raw = String(data || "").trim();
  if (!raw.startsWith("http")) throw new Error("QR inválido: não é uma URL.");

  const u = new URL(raw);

  if (!u.hostname.includes("edubox.com.br")) throw new Error("QR inválido: domínio não é Edubox.");

  const key = u.searchParams.get("key");
  const dtu = u.searchParams.get("dtu");
  if (!key || !dtu) throw new Error("QR inválido: faltou key ou dtu.");

  return u.toString(); // URL completa do QR
}

async function postToEdubox(url: string, bodyText: string) {
  // Na web, o navegador bloqueia esse POST por CORS (o Edubox não libera
  // Access-Control-Allow-Origin), então passamos por uma function na Vercel
  // que faz a chamada server-to-server.
  if (Platform.OS === "web") {
    const res = await fetch("https://edubox-proxy-vercel.vercel.app/api/edubox-proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, bodyText }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || `Falha ao enviar (${res.status}).`);
    }
    return data;
  }

  // Enviar "raw text" igual Postman (não é form-data, não é json)
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      Accept: "*/*",
      // alguns servidores são chatos com user-agent
      "User-Agent": "Mozilla/5.0 (Mobile) FrequenciaMedicina/1.0",
      // evita cache intermediário
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
    body: bodyText,
  });

  const text = await res.text().catch(() => "");
  if (!res.ok) {
    throw new Error(`Falha ao enviar (${res.status}): ${text || "sem detalhes"}`);
  }

  // Se vier JSON do tipo {status, data, log}
  try {
    return JSON.parse(text);
  } catch {
    // Se vier HTML/texto puro
    return { status: "OK", data: text };
  }
}

export default function ImportEdubox() {
  const { ready } = useAuthGuard("coordinator");
  const { id } = useLocalSearchParams<{ id: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [locked, setLocked] = useState(false);
  const [sending, setSending] = useState(false);

  async function onScanned({ data }: any) {
    if (locked || sending) return;
    setLocked(true);

    try {
      setSending(true);

      const url = parseEduboxQrToUrl(String(data || ""));
      const rollcall: any = await getRollcall(String(id));
      const bodyText = makeBodyRADateBR(rollcall.ras || [], rollcall.date, rollcall.shift);

      await postToEdubox(url, bodyText);

      notify("success", "Presenças enviadas para o Edubox.");
      router.back();
    } catch (e: any) {
      notify("error", e?.message || "Falha ao enviar.");
      setLocked(false);
    } finally {
      setSending(false);
    }
  }

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!permission?.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <EmptyState
          icon="camera-outline"
          title="Precisamos da câmera"
          description="A câmera é usada para escanear o QR code do botão Importar do Edubox."
        >
          <Button title="Permitir câmera" icon="camera-outline" onPress={requestPermission} />
        </EmptyState>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraBox}>
        <CameraView
          style={StyleSheet.absoluteFill}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={onScanned}
        />

        <View style={styles.overlay}>
          {sending ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Ionicons name="qr-code-outline" size={16} color={colors.white} />
          )}
          <View style={styles.overlayTexts}>
            <Text style={styles.overlayText}>
              Escaneie o QR do botão “Importar” do Edubox
            </Text>
            <Text style={styles.overlayStatus}>
              {sending ? "Enviando presenças..." : "Pronto para escanear"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ink },
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: "center",
  },
  cameraBox: { flex: 1 },
  overlay: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    padding: spacing.lg,
    borderRadius: radius.md,
  },
  overlayTexts: { flex: 1 },
  overlayText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  overlayStatus: {
    color: "rgba(255, 255, 255, 0.75)",
    fontSize: 13,
    marginTop: 2,
  },
});
