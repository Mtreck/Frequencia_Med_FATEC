import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { getRollcall } from "../../src/components/services/rollcalls";
import { Button } from "../../src/components/ui/Button";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { ScreenContainer } from "../../src/components/ui/ScreenContainer";
import { Skeleton } from "../../src/components/ui/Skeleton";
import { TurnoTag } from "../../src/components/ui/TurnoTag";
import { notify } from "../../src/components/ui/feedback";
import { colors, radius, shadow, spacing, type } from "../../src/components/ui/theme";
import { formatDateBR, shiftLabel } from "../../src/components/utils/format";

function aulaOrder(shift: string) {
  const s = String(shift || "").toLowerCase();
  return s === "aula2" || s === "tarde" ? 2 : 1;
}

/** Chamadas do mesmo dia/UBS lado a lado (1ª e 2ª aula), cada uma com seu envio. */
export default function RollcallGroup() {
  const { ids } = useLocalSearchParams<{ ids: string }>();
  const idList = useMemo(() => String(ids || "").split(",").filter(Boolean), [ids]);
  const { width } = useWindowDimensions();
  const isWide = width >= 700;

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Recarrega ao voltar para a tela (os RAs podem ter sido editados no detalhe)
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          setLoading(true);
          const data = await Promise.all(idList.map((id) => getRollcall(id)));
          const found = (data.filter(Boolean) as any[]).sort(
            (a, b) => aulaOrder(a.shift) - aulaOrder(b.shift)
          );
          if (active) setItems(found);
        } catch (e: any) {
          notify("error", e?.message || "Falha ao carregar as chamadas.");
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [idList])
  );

  const first = items[0];

  if (loading) {
    return (
      <ScreenContainer scrollable={false}>
        <View style={[styles.content, isWide && styles.contentWide]}>
          <Skeleton height={28} width="55%" />
          <Skeleton height={16} width="35%" style={{ marginTop: spacing.sm }} />
          <Skeleton height={180} style={{ marginTop: spacing.xl }} />
        </View>
      </ScreenContainer>
    );
  }

  if (!first) {
    return (
      <ScreenContainer scrollable={false} contentContainerStyle={{ justifyContent: "center" }}>
        <EmptyState
          icon="clipboard-outline"
          title="Chamadas não encontradas"
          description="Elas podem ter sido excluídas."
        >
          <Button
            title="Voltar para a lista"
            variant="secondary"
            small
            onPress={() => router.back()}
          />
        </EmptyState>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.scroll}>
      <View style={[styles.content, isWide && styles.contentWide]}>
        {/* Cabeçalho do dia */}
        <View style={styles.headerCard}>
          {first.turno ? <TurnoTag turno={first.turno} style={styles.turnoTag} /> : null}
          <Text style={styles.title}>{first.ubsName}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={15} color={colors.muted} />
            <Text style={styles.meta}>
              {formatDateBR(first.date)} · {items.length} chamada
              {items.length === 1 ? "" : "s"}
            </Text>
          </View>
        </View>

        {/* Painéis das aulas, lado a lado no desktop */}
        <View style={[styles.panels, isWide && styles.panelsWide]}>
          {items.map((it) => (
            <View key={it.id} style={[styles.panel, isWide && styles.panelWide]}>
              <View style={styles.aulaBadge}>
                <Ionicons name="book-outline" size={15} color={colors.primary} />
                <Text style={styles.aulaBadgeText}>{shiftLabel(it.shift)}</Text>
              </View>

              <Text style={styles.count}>{(it.ras || []).length}</Text>
              <Text style={styles.countLabel}>
                aluno{(it.ras || []).length === 1 ? "" : "s"} presente
                {(it.ras || []).length === 1 ? "" : "s"}
              </Text>

              <Button
                title="Enviar para o Edubox"
                icon="qr-code-outline"
                onPress={() =>
                  router.push({
                    pathname: "/coordinator/import-edubox",
                    params: { id: it.id },
                  })
                }
                style={styles.sendButton}
              />
              <Button
                title="Ver detalhes"
                icon="create-outline"
                variant="plain"
                onPress={() => router.push(`/coordinator/${it.id}`)}
                style={styles.detailButton}
              />
            </View>
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xxl },
  content: { width: "100%" },
  contentWide: { maxWidth: 760, alignSelf: "center" },

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

  panels: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  panelsWide: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  panel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: "center",
    ...shadow,
  },
  panelWide: {
    flex: 1,
  },

  aulaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.primaryTint,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  aulaBadgeText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },

  count: {
    fontSize: 40,
    fontWeight: "700",
    color: colors.ink,
    marginTop: spacing.lg,
    fontVariant: ["tabular-nums"],
  },
  countLabel: {
    ...type.meta,
    marginBottom: spacing.lg,
  },

  sendButton: {
    alignSelf: "stretch",
  },
  detailButton: {
    alignSelf: "stretch",
    marginTop: spacing.sm,
  },
});
