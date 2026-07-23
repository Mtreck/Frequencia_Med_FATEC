import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { Stack, router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { logout } from "../../src/components/services/auth";
import { auth } from "../../src/components/services/firebase";
import { listUBS } from "../../src/components/services/ubs";
import { HeaderBrand, HeaderLogout } from "../../src/components/ui/AppHeader";
import { Button } from "../../src/components/ui/Button";
import { ScreenContainer } from "../../src/components/ui/ScreenContainer";
import { notify } from "../../src/components/ui/feedback";
import { colors, radius, shadow, spacing, touchTarget, type } from "../../src/components/ui/theme";
import { formatDateBR, todayISO } from "../../src/components/utils/format";
import { getLastUbsId, setLastUbsId } from "../../src/components/utils/prefs";
import { slugify } from "../../src/components/utils/slugify";
import { useAuthGuard } from "../../src/components/utils/useAuthGuard";

export default function CreatePage() {
  const { ready } = useAuthGuard();
  const { width } = useWindowDimensions();
  const isWide = width >= 700;

  const [turno, setTurno] = useState<"manha" | "tarde">("manha");
  const [shift, setShift] = useState<"aula1" | "aula2">("aula1");
  const [ubsList, setUbsList] = useState<any[]>([]);
  const [ubsId, setUbsId] = useState<string>("");
  const [loadingUbs, setLoadingUbs] = useState(true);

  const date = useMemo(() => todayISO(), []);

  async function loadUbs() {
    try {
      setLoadingUbs(true);
      const data = await listUBS();
      setUbsList(data);
      if (!ubsId && data?.length) {
        // Restaura a última UBS usada pelo preceptor, se ainda existir
        const saved = await getLastUbsId();
        const remembered = saved && data.find((u: any) => u.id === saved);
        setUbsId(remembered ? saved : data[0].id);
      }
    } catch (e: any) {
      notify("error", e?.message || "Falha ao carregar as UBS.");
    } finally {
      setLoadingUbs(false);
    }
  }

  function selectUbs(id: string) {
    setUbsId(id);
    setLastUbsId(id); // lembra a escolha para as próximas chamadas
  }

  useEffect(() => {
    loadUbs();
  }, []);

  const ubsSelected = ubsList.find((u) => u.id === ubsId);
  const ubsName = ubsSelected?.name || "";
  const ubsSlug = slugify(ubsName);

  function goScan() {
    if (!ubsSelected) return;
    router.push({
      pathname: "/preceptor/scan",
      params: {
        date,
        shift,
        turno,
        ubsName,
        ubsSlug,
        createdBy: auth.currentUser?.uid || "",
      },
    });
  }

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.scroll}>
      <Stack.Screen
        options={{
          title: "Criar chamada",
          headerTitle: () => <HeaderBrand label="Preceptor" />,
          headerRight: () => <HeaderLogout onPress={handleLogout} />,
        }}
      />

      <View style={[styles.card, isWide && styles.cardWide]}>
        <Text style={styles.label}>Data</Text>
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={18} color={colors.primary} />
          <Text style={styles.value}>{formatDateBR(date)}</Text>
        </View>

        <Text style={[styles.label, styles.labelGap]}>Turno</Text>
        <View style={styles.segmentRow}>
          {(
            [
              { key: "manha", label: "Manhã", icon: "sunny-outline" },
              { key: "tarde", label: "Tarde", icon: "partly-sunny-outline" },
            ] as const
          ).map((opt) => {
            const active = turno === opt.key;
            return (
              <Pressable
                key={opt.key}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setTurno(opt.key)}
                style={({ pressed }) => [
                  styles.segment,
                  active && styles.segmentActive,
                  pressed && !active && styles.segmentPressed,
                ]}
              >
                <Ionicons
                  name={opt.icon}
                  size={17}
                  color={active ? colors.white : colors.body}
                />
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, styles.labelGap]}>Aula</Text>
        <View style={styles.segmentRow}>
          {(
            [
              { key: "aula1", label: "1ª Aula", icon: "book-outline" },
              { key: "aula2", label: "2ª Aula", icon: "library-outline" },
            ] as const
          ).map((opt) => {
            const active = shift === opt.key;
            return (
              <Pressable
                key={opt.key}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setShift(opt.key)}
                style={({ pressed }) => [
                  styles.segment,
                  active && styles.segmentActive,
                  pressed && !active && styles.segmentPressed,
                ]}
              >
                <Ionicons
                  name={opt.icon}
                  size={17}
                  color={active ? colors.white : colors.body}
                />
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, styles.labelGap]}>UBS</Text>
        {!loadingUbs && ubsList.length === 0 ? (
          <View style={styles.noUbsBox}>
            <Ionicons name="business-outline" size={18} color={colors.muted} />
            <Text style={styles.noUbsText}>
              Nenhuma UBS cadastrada. Peça ao coordenador para cadastrar uma UBS.
            </Text>
          </View>
        ) : (
          <View style={styles.pickerBox}>
            <Picker
              selectedValue={ubsId}
              onValueChange={(v) => selectUbs(String(v))}
              accessibilityLabel="Selecionar UBS"
              style={styles.picker}
            >
              {ubsList.map((u) => (
                <Picker.Item key={u.id} label={u.name} value={u.id} />
              ))}
            </Picker>
          </View>
        )}

        <Button
          title="Iniciar scanner"
          icon="qr-code-outline"
          onPress={goScan}
          disabled={!ubsSelected}
          style={styles.button}
        />

        <Button
          title="Atualizar lista de UBS"
          icon="refresh-outline"
          variant="plain"
          loading={loadingUbs}
          onPress={loadUbs}
          style={styles.refresh}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
  },
  card: {
    width: "100%",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.xl,
    ...shadow,
  },
  cardWide: {
    maxWidth: 520,
    alignSelf: "center",
  },

  label: {
    ...type.label,
    marginBottom: spacing.xs + 2,
  },
  labelGap: {
    marginTop: spacing.xl,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  value: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.ink,
  },

  segmentRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  segment: {
    flex: 1,
    minHeight: touchTarget,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  segmentActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  segmentPressed: {
    backgroundColor: colors.bg,
  },
  segmentText: {
    ...type.button,
    color: colors.body,
  },
  segmentTextActive: {
    color: colors.white,
  },

  pickerBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
  picker: {
    color: colors.ink,
    minHeight: touchTarget,
    borderWidth: 0,
    backgroundColor: "transparent",
    paddingHorizontal: spacing.md,
  },

  noUbsBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  noUbsText: {
    ...type.meta,
    flexShrink: 1,
    lineHeight: 18,
  },

  button: {
    marginTop: spacing.xxl,
  },
  refresh: {
    marginTop: spacing.sm,
  },
});
