import { CameraView, useCameraPermissions } from "expo-camera";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { createRollcall } from "../../src/components/services/rollcalls";

const COLORS = {
  primary: "#0E3A5E",
  white: "#FFFFFF",
  text: "#0B1220",
  muted: "#64748B",
  border: "#E2E8F0",
  bg: "#FFFFFF",
};

export default function ScanPage() {
  const params = useLocalSearchParams();

  const date = String(params.date || "");
  const shift = String(params.shift || "");
  const ubsName = String(params.ubsName || "");
  const ubsSlug = String(params.ubsSlug || "");
  const createdBy = String(params.createdBy || "");

  const [permission, requestPermission] = useCameraPermissions();
  const [ras, setRas] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);
  const [saving, setSaving] = useState(false);

  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission]);

  const count = useMemo(() => ras.length, [ras]);

  function onBarcodeScanned({ data }: any) {
    if (locked) return;

    const ra = String(data || "").trim();

    // RA puro: apenas números
    if (!/^\d+$/.test(ra)) {
      setLocked(true);
      Alert.alert("QR inválido", "O QR precisa conter apenas o RA (números).");
      setTimeout(() => setLocked(false), 900);
      return;
    }

    setRas((prev) => {
      if (prev.includes(ra)) return prev;
      return [ra, ...prev];
    });

    // trava rápida para evitar leitura repetida
    setLocked(true);
    setTimeout(() => setLocked(false), 700);
  }

  async function handleSave() {
    try {
      if (ras.length === 0) {
        Alert.alert("Sem alunos", "Escaneie pelo menos 1 RA antes de salvar.");
        return;
      }

      setSaving(true);
      await createRollcall({ date, shift, ubsName, ubsSlug, createdBy, ras });

      Alert.alert("Salvo", "Chamada enviada para o coordenador.");
      router.replace("/preceptor/create");
    } catch (e: any) {
      Alert.alert("Erro ao salvar", e?.message || "Falha ao enviar chamada.");
    } finally {
      setSaving(false);
    }
  }

  function handleClear() {
    Alert.alert("Limpar lista", "Deseja remover todos os RAs escaneados?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Limpar", style: "destructive", onPress: () => setRas([]) },
    ]);
  }

  // Se ainda não tem permissão de câmera
  if (!permission?.granted) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
          <Text style={{ marginBottom: 10, color: COLORS.text, fontWeight: "800" }}>
            Precisamos da permissão da câmera.
          </Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={requestPermission}>
            <Text style={styles.btnPrimaryText}>Permitir câmera</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <>
        <Stack.Screen
          options={{
            title: "Escanear RAs",
            headerStyle: { backgroundColor: COLORS.primary },
            headerTintColor: COLORS.white,
          }}
        />

        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.meta}>
                {date} • {shift.toUpperCase()} • {ubsName}
              </Text>
              <Text style={styles.count}>RAs: {count}</Text>
            </View>

            <TouchableOpacity onPress={handleClear}>
              <Text style={styles.clear}>Limpar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cameraBox}>
            <CameraView
              style={StyleSheet.absoluteFill}
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={onBarcodeScanned}
            />

            <View style={styles.overlay}>
              <Text style={styles.overlayText}>Aponte para o QR da carteirinha</Text>
            </View>
          </View>

          <FlatList
            data={ras}
            keyExtractor={(x) => x}
            contentContainerStyle={{ paddingBottom: 140 }} // garante que a lista não some atrás do botão
            renderItem={({ item }) => (
              <View style={styles.raRow}>
                <Text style={styles.ra}>{item}</Text>
                <TouchableOpacity onPress={() => setRas((prev) => prev.filter((r) => r !== item))}>
                  <Text style={styles.remove}>Remover</Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <Text style={{ color: COLORS.muted, padding: 14, fontWeight: "700" }}>
                Nenhum RA escaneado ainda.
              </Text>
            }
          />

          <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <TouchableOpacity
              style={[styles.save, saving && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveText}>{saving ? "Salvando..." : "Salvar chamada"}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  meta: { color: COLORS.text, fontWeight: "900" },
  count: { marginTop: 2, color: COLORS.muted, fontWeight: "800" },
  clear: { color: "#EF4444", fontWeight: "900" },

  cameraBox: { height: 250, backgroundColor: "#111827" },
  overlay: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 12,
  },
  overlayText: { color: COLORS.white, fontWeight: "900", textAlign: "center" },

  raRow: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#F1F5F9",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ra: { fontWeight: "900", fontSize: 16, color: COLORS.text },
  remove: { color: COLORS.primary, fontWeight: "900" },

  bottomBar: {
    paddingHorizontal: 14,
    paddingTop: 10,
    backgroundColor: COLORS.bg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  save: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  saveText: { color: COLORS.white, fontWeight: "900", fontSize: 16 },

  btnPrimary: { backgroundColor: COLORS.primary, padding: 14, borderRadius: 12 },
  btnPrimaryText: { color: COLORS.white, fontWeight: "900" },
});
