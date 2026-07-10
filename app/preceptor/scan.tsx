import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { createRollcall } from "../../src/components/services/rollcalls";
import { Button } from "../../src/components/ui/Button";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { IconButton } from "../../src/components/ui/IconButton";
import { confirmAction, notify } from "../../src/components/ui/feedback";
import { colors, radius, spacing, type } from "../../src/components/ui/theme";
import { formatDateBR, shiftLabel } from "../../src/components/utils/format";

export default function ScanPage() {
  const params = useLocalSearchParams();

  const date = String(params.date || "");
  const shift = String(params.shift || "");
  const turno = String(params.turno || "");
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

  function onBarcodeScanned({ data }: any) {
    if (locked) return;

    const ra = String(data || "").trim();

    // RA puro: apenas números
    if (!/^\d+$/.test(ra)) {
      setLocked(true);
      notify("error", "QR inválido: precisa conter apenas o RA (números).");
      setTimeout(() => setLocked(false), 900);
      return;
    }

    setRas((prev) => {
      if (prev.includes(ra)) return prev;
      notify("success", `RA ${ra} registrado.`);
      return [ra, ...prev];
    });

    // trava rápida para evitar leitura repetida
    setLocked(true);
    setTimeout(() => setLocked(false), 700);
  }

  async function handleSave() {
    if (ras.length === 0) {
      notify("error", "Escaneie pelo menos 1 RA antes de salvar.");
      return;
    }
    try {
      setSaving(true);
      await createRollcall({ date, shift, turno, ubsName, ubsSlug, createdBy, ras });
      notify("success", "Chamada enviada para o coordenador.");
      router.replace("/preceptor/create");
    } catch (e: any) {
      notify("error", e?.message || "Falha ao enviar a chamada.");
    } finally {
      setSaving(false);
    }
  }

  async function handleClear() {
    const ok = await confirmAction({
      title: "Limpar lista",
      message: "Deseja remover todos os RAs escaneados?",
      confirmLabel: "Limpar",
      destructive: true,
    });
    if (ok) setRas([]);
  }

  if (!permission?.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <EmptyState
          icon="camera-outline"
          title="Precisamos da câmera"
          description="A câmera é usada para escanear o QR code da carteirinha dos alunos."
        >
          <Button title="Permitir câmera" icon="camera-outline" onPress={requestPermission} />
        </EmptyState>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      {/* Resumo da chamada */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{ubsName}</Text>
          <Text style={styles.headerMeta}>
            {formatDateBR(date)}
            {turno ? ` · ${shiftLabel(turno)}` : ""} · {shiftLabel(shift)}
          </Text>
        </View>
        <View style={styles.countBadge}>
          <Ionicons name="people-outline" size={15} color={colors.primary} />
          <Text style={styles.countText}>{ras.length}</Text>
        </View>
      </View>

      {/* Câmera */}
      <View style={styles.cameraBox}>
        <CameraView
          style={StyleSheet.absoluteFill}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={onBarcodeScanned}
        />
        <View style={styles.overlay}>
          <Ionicons name="qr-code-outline" size={16} color={colors.white} />
          <Text style={styles.overlayText}>Aponte para o QR da carteirinha</Text>
        </View>
      </View>

      {/* Lista de RAs escaneados */}
      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>Escaneados</Text>
        {ras.length > 0 && (
          <Button title="Limpar" variant="plain" small onPress={handleClear} />
        )}
      </View>

      <FlatList
        data={ras}
        keyExtractor={(x) => x}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => (
          <View style={styles.raRow}>
            <Text style={styles.ra}>{item}</Text>
            <IconButton
              icon="close-circle-outline"
              label={`Remover RA ${item}`}
              color={colors.muted}
              onPress={() => setRas((prev) => prev.filter((r) => r !== item))}
            />
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="scan-outline"
            title="Nenhum RA escaneado"
            description="Os RAs aparecem aqui conforme você escaneia as carteirinhas."
          />
        }
      />

      {/* Barra fixa de salvar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <Button
          title={
            saving
              ? "Salvando..."
              : `Salvar chamada${ras.length > 0 ? ` (${ras.length})` : ""}`
          }
          icon="checkmark"
          loading={saving}
          onPress={handleSave}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerInfo: { flex: 1 },
  headerTitle: {
    ...type.itemTitle,
  },
  headerMeta: {
    ...type.meta,
    marginTop: 2,
  },
  countBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.primaryTint,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  countText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
    fontVariant: ["tabular-nums"],
  },

  cameraBox: {
    height: 260,
    backgroundColor: colors.ink,
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
    overflow: "hidden",
  },
  overlay: {
    position: "absolute",
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: radius.md,
  },
  overlayText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "500",
  },

  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    ...type.sectionTitle,
  },

  raRow: {
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    paddingLeft: spacing.lg,
    paddingRight: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  ra: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.ink,
    fontVariant: ["tabular-nums"],
  },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
