import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { deleteRollcall, getRollcall, updateRollcallRAs } from "../../src/components/services/rollcalls";
import { Button } from "../../src/components/ui/Button";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { Field } from "../../src/components/ui/Field";
import { IconButton } from "../../src/components/ui/IconButton";
import { ScreenContainer } from "../../src/components/ui/ScreenContainer";
import { Skeleton } from "../../src/components/ui/Skeleton";
import { TurnoTag } from "../../src/components/ui/TurnoTag";
import { confirmAction, notify } from "../../src/components/ui/feedback";
import { colors, radius, shadow, spacing, type } from "../../src/components/ui/theme";
import { formatDateBR, shiftLabel } from "../../src/components/utils/format";

export default function CoordinatorDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const rollcallId = String(id);
  const { width } = useWindowDimensions();
  const isWide = width >= 700;

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const [newRa, setNewRa] = useState("");
  const [raError, setRaError] = useState<string | null>(null);
  const [rasDraft, setRasDraft] = useState<string[]>([]);

  const hasChanges = useMemo(() => {
    const original = Array.isArray(item?.ras) ? item.ras : [];
    if (original.length !== rasDraft.length) return true;
    return rasDraft.some((ra, i) => ra !== original[i]);
  }, [item, rasDraft]);

  async function load() {
    setLoading(true);
    try {
      const data: any = await getRollcall(rollcallId);
      setItem(data);
      setRasDraft(Array.isArray(data?.ras) ? data.ras : []);
    } catch (e: any) {
      notify("error", e?.message || "Falha ao carregar a chamada.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [rollcallId]);

  function addRa() {
    const ra = newRa.trim();
    if (!ra) return;
    if (rasDraft.includes(ra)) {
      setRaError("Este RA já está na lista.");
      return;
    }
    setRasDraft((prev) => [ra, ...prev]);
    setNewRa("");
    setRaError(null);
  }

  function removeRa(ra: string) {
    setRasDraft((prev) => prev.filter((x) => x !== ra));
  }

  async function clearAll() {
    const ok = await confirmAction({
      title: "Limpar lista",
      message: "Deseja remover todos os RAs desta chamada?",
      confirmLabel: "Limpar",
      destructive: true,
    });
    if (ok) setRasDraft([]);
  }

  async function saveChanges() {
    try {
      setSaving(true);
      await updateRollcallRAs(rollcallId, rasDraft);
      notify("success", "Alterações salvas.");
      await load();
    } catch (e: any) {
      notify("error", e?.message || "Falha ao salvar as alterações.");
    } finally {
      setSaving(false);
    }
  }

  async function removeRollcall() {
    const ok = await confirmAction({
      title: "Excluir chamada",
      message: "Tem certeza? Esta ação não pode ser desfeita.",
      confirmLabel: "Excluir",
      destructive: true,
    });
    if (!ok) return;
    try {
      await deleteRollcall(rollcallId);
      notify("success", "Chamada excluída.");
      router.replace("/coordinator/list");
    } catch (e: any) {
      notify("error", e?.message || "Falha ao excluir a chamada.");
    }
  }

  if (loading || !item) {
    return (
      <ScreenContainer scrollable={false}>
        <View style={[styles.content, isWide && styles.contentWide]}>
          <Skeleton height={28} width="55%" />
          <Skeleton height={16} width="35%" style={{ marginTop: spacing.sm }} />
          <Skeleton height={120} style={{ marginTop: spacing.xl }} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.scroll}>
      <View style={[styles.content, isWide && styles.contentWide]}>
        {/* Cabeçalho da chamada */}
        <View style={styles.headerCard}>
          {item.turno ? <TurnoTag turno={item.turno} style={styles.turnoTag} /> : null}
          <Text style={styles.title}>{item.ubsName}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={15} color={colors.muted} />
            <Text style={styles.meta}>
              {formatDateBR(item.date)} · {shiftLabel(item.shift)}
            </Text>
          </View>

          <View style={styles.headerActions}>
            <Button
              title="Enviar para o Edubox"
              icon="qr-code-outline"
              variant="secondary"
              small
              onPress={() =>
                router.push({ pathname: "/coordinator/import-edubox", params: { id: rollcallId } })
              }
            />
            <Button
              title="Excluir chamada"
              icon="trash-outline"
              variant="danger"
              small
              onPress={removeRollcall}
            />
          </View>
        </View>

        {/* Adicionar RA */}
        <View style={styles.addRow}>
          <Field
            placeholder="Adicionar RA manualmente"
            value={newRa}
            error={raError}
            onChangeText={(v) => {
              setNewRa(v);
              if (raError) setRaError(null);
            }}
            keyboardType="numeric"
            returnKeyType="done"
            onSubmitEditing={addRa}
            containerStyle={{ flex: 1 }}
          />
          <Button title="Adicionar" icon="add" variant="secondary" onPress={addRa} />
        </View>

        {/* Lista de RAs */}
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>
            Alunos presentes{" "}
            <Text style={styles.countText}>({rasDraft.length})</Text>
          </Text>
          {rasDraft.length > 0 && (
            <Button title="Limpar lista" variant="plain" small onPress={clearAll} />
          )}
        </View>

        <View style={styles.box}>
          {rasDraft.length === 0 ? (
            <EmptyState
              icon="people-outline"
              title="Nenhum RA registrado"
              description="Adicione um RA manualmente no campo acima."
            />
          ) : (
            rasDraft.map((ra, index) => (
              <View
                key={ra}
                style={[styles.raRow, index === rasDraft.length - 1 && styles.raRowLast]}
              >
                <Text style={styles.raText}>{ra}</Text>
                <IconButton
                  icon="close-circle-outline"
                  label={`Remover RA ${ra}`}
                  color={colors.muted}
                  onPress={() => removeRa(ra)}
                />
              </View>
            ))
          )}
        </View>

        <Button
          title={saving ? "Salvando..." : "Salvar alterações"}
          icon="checkmark"
          loading={saving}
          disabled={!hasChanges}
          onPress={saveChanges}
          style={styles.saveButton}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xxl },
  content: { width: "100%" },
  contentWide: { maxWidth: 640, alignSelf: "center" },

  headerCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.xl,
    ...shadow,
  },
  turnoTag: {
    marginBottom: spacing.sm,
  },
  title: {
    ...type.screenTitle,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  meta: {
    ...type.meta,
    fontSize: 14,
  },
  headerActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },

  addRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start",
    marginTop: spacing.xl,
  },

  listHeader: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    ...type.sectionTitle,
  },
  countText: {
    color: colors.muted,
    fontWeight: "400",
  },

  box: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  raRow: {
    paddingVertical: spacing.sm,
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  raRowLast: {
    borderBottomWidth: 0,
  },
  raText: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.ink,
    fontVariant: ["tabular-nums"],
  },

  saveButton: {
    marginTop: spacing.xl,
  },
});
