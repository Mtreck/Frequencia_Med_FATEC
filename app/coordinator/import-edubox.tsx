import { CameraView, useCameraPermissions } from "expo-camera";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getRollcall } from "../../src/components/services/rollcalls";

const COLORS = { primary: "#0E3A5E", white: "#FFF" };

function formatDateBRFromISO(dateISO: string) {
  // "2026-02-09" -> "09/02/2026"
  const [y, m, d] = String(dateISO).split("-");
  if (!y || !m || !d) return dateISO;
  return `${d}/${m}/${y}`;
}

function makeBodyRADateBR(ras: string[], dateISO: string) {
  const dateBR = formatDateBRFromISO(dateISO);

  const lines = ras
    .map((ra) => String(ra).trim())
    .filter(Boolean)
    .map((ra) => `${ra};${dateBR}`);

  // ✅ cabeçalho + dados
  return ["ra;data", ...lines].join("\r\n") + "\r\n";
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
  // ✅ Enviar “raw text” igual Postman (não é form-data, não é json)
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
  const { id } = useLocalSearchParams<{ id: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [locked, setLocked] = useState(false);
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  async function onScanned({ data }: any) {
    if (locked || sending) return;
    setLocked(true);

    try {
      setSending(true);

      const url = parseEduboxQrToUrl(String(data || ""));
      const rollcall = await getRollcall(String(id));
      const bodyText = makeBodyRADateBR(rollcall.ras || [], rollcall.date);

      const result = await postToEdubox(url, bodyText);
      setLastResult(result);

      Alert.alert("Enviado", "Arquivo enviado para o servidor do sistema acadêmico (Edubox).");
      // ✅ NÃO abre navegador, NÃO salva automaticamente, SÓ envia.
      router.back();
    } catch (e: any) {
      Alert.alert("Erro", e?.message || "Falha ao enviar.");
      setLocked(false);
    } finally {
      setSending(false);
    }
  }

  if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ marginBottom: 10 }}>Permita o uso da câmera.</Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text style={{ color: COLORS.primary, fontWeight: "900" }}>Permitir câmera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Enviar para Edubox",
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
        }}
      />

      <View style={styles.container}>
        <View style={styles.cameraBox}>
          <CameraView
            style={StyleSheet.absoluteFill}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={onScanned}
          />

          <View style={styles.overlay}>
            <Text style={styles.overlayText}>Escaneie o QR do botão “Importar” do Edubox</Text>
            <Text style={styles.overlayText2}>{sending ? "Enviando..." : "Pronto para escanear"}</Text>
          </View>
        </View>

        {/* Debug opcional (se você quiser ver o retorno antes de voltar, comente o router.back acima) */}
        {lastResult ? (
          <View style={styles.debug}>
            <Text style={styles.debugTitle}>Retorno (debug)</Text>
            <Text style={styles.debugText}>status: {String(lastResult?.status)}</Text>
            {!!lastResult?.log && <Text style={styles.debugText}>log: {String(lastResult?.log)}</Text>}
          </View>
        ) : null}


      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  cameraBox: { flex: 1, backgroundColor: "#111827" },
  overlay: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 12,
    borderRadius: 14,
  },
  overlayText: { color: "#fff", fontWeight: "900", textAlign: "center" },
  overlayText2: { color: "#fff", marginTop: 8, textAlign: "center" },
  btn: { backgroundColor: COLORS.primary, padding: 14, margin: 14, borderRadius: 14, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "900" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  debug: { marginHorizontal: 14, marginTop: 10, padding: 12, borderRadius: 12, backgroundColor: "#F1F5F9" },
  debugTitle: { fontWeight: "900", marginBottom: 6 },
  debugText: { color: "#0B1220" },
});
