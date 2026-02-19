import { Stack, router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { deleteRollcall, getRollcall, updateRollcallRAs } from "../../src/components/services/rollcalls";

const COLORS = {
  primary: "#0E3A5E",
  white: "#FFFFFF",
  text: "#0B1220",
  muted: "#64748B",
  border: "#E2E8F0",
  bg: "#FFFFFF",
  danger: "#EF4444",
  surface: "#F8FAFC",
  blue: "#2563EB",
  green: "#16A34A",
};

export default function CoordinatorDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const rollcallId = String(id);

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<any>(null);

  const [newRa, setNewRa] = useState("");
  const [rasDraft, setRasDraft] = useState<string[]>([]);
  const count = rasDraft.length;

  async function load() {
    setLoading(true);
    const data = await getRollcall(rollcallId);
    setItem(data);
    setRasDraft(Array.isArray(data?.ras) ? data.ras : []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [rollcallId]);

  const filename = useMemo(() => {
    if (!item) return "";
    const shift = String(item.shift || "").toLowerCase();
    const ubs = String(item.ubsName || "ubs").toLowerCase().replace(/\s+/g, "-");
    return `${item.date}_${shift}_${ubs}.csv`;
  }, [item]);

  function addRa() {
    const ra = newRa.trim();
    if (!ra) return;
    if (rasDraft.includes(ra)) {
      Alert.alert("Atenção", "RA já está na lista.");
      return;
    }
    setRasDraft((prev) => [ra, ...prev]);
    setNewRa("");
  }

  function removeRa(ra: string) {
    setRasDraft((prev) => prev.filter((x) => x !== ra));
  }

  function clearAll() {
    Alert.alert("Confirmar", "Deseja limpar toda a lista?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Limpar", style: "destructive", onPress: () => setRasDraft([]) },
    ]);
  }

  async function saveChanges() {
    try {
      await updateRollcallRAs(rollcallId, rasDraft);
      Alert.alert("OK", "Alterações salvas.");
      await load();
    } catch (e: any) {
      Alert.alert("Erro", e?.message || "Falha ao salvar.");
    }
  }

  async function removeRollcall() {
    const run = async () => {
      await deleteRollcall(rollcallId);
      router.replace("/coordinator/list");
    };

    if (Platform.OS === "web") {
      const ok = window.confirm("Tem certeza que deseja excluir esta chamada?");
      if (ok) await run();
      return;
    }

    Alert.alert("Excluir chamada", "Tem certeza? Isso não pode ser desfeito.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: () => run() },
    ]);
  }

  if (loading || !item) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <Stack.Screen
          options={{
            title: "Detalhes",
            headerStyle: { backgroundColor: COLORS.primary },
            headerTintColor: COLORS.white,
          }}
        />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: COLORS.muted, fontWeight: "800" }}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Detalhes",
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
        }}
      />

      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>{item.ubsName}</Text>
            <Text style={styles.meta}>
              {item.date} • {String(item.shift).toUpperCase()}
            </Text>

            {/* AÇÕES PRINCIPAIS (MOBILE FRIENDLY) */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={() => router.push({ pathname: "/coordinator/import-edubox", params: { id: rollcallId } })}
              >
                <Text style={styles.btnText}>Enviar para o Edubox</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnDangerGhost} onPress={removeRollcall}>
                <Text style={styles.btnDangerText}>Excluir</Text>
              </TouchableOpacity>
            </View>

            {/* ADD RA */}
            <View style={styles.addRow}>
              <TextInput
                value={newRa}
                onChangeText={setNewRa}
                placeholder="Adicionar RA manualmente"
                placeholderTextColor={COLORS.muted}
                style={styles.input}
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={addRa}
              />
              <TouchableOpacity style={styles.btnDark} onPress={addRa}>
                <Text style={styles.btnText}>Adicionar</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.listHeader}>
              <Text style={styles.sectionTitle}>RAs ({count})</Text>
              <TouchableOpacity onPress={clearAll}>
                <Text style={styles.dangerLink}>Limpar lista</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.box}>
              <FlatList
                data={rasDraft}
                keyExtractor={(x) => x}
                scrollEnabled={false}
                renderItem={({ item: ra }) => (
                  <View style={styles.raRow}>
                    <Text style={styles.raText}>{ra}</Text>
                    <TouchableOpacity onPress={() => removeRa(ra)}>
                      <Text style={styles.blueLink}>Remover</Text>
                    </TouchableOpacity>
                  </View>
                )}
                ListEmptyComponent={<Text style={{ color: COLORS.muted }}>Nenhum RA registrado.</Text>}
              />
            </View>

            <TouchableOpacity style={styles.btnSave} onPress={saveChanges}>
              <Text style={styles.btnText}>Salvar alterações</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 14, paddingBottom: 24 },
  title: { fontSize: 32, fontWeight: "900", color: COLORS.text, marginTop: 6 },
  meta: { marginTop: 6, color: COLORS.muted, fontWeight: "900", fontSize: 16 },
  meta2: { marginTop: 6, color: COLORS.muted, fontWeight: "800" },

  actions: { marginTop: 14, gap: 10 },
  btnPrimary: { backgroundColor: COLORS.primary, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, alignItems: "center" },
  btnDangerGhost: { paddingVertical: 10, alignItems: "center" },
  btnDangerText: { color: COLORS.danger, fontWeight: "900" },
  btnDark: { backgroundColor: "#0F172A", padding: 14, borderRadius: 12, alignItems: "center", minWidth: 120 },
  btnSave: { backgroundColor: COLORS.green, padding: 16, borderRadius: 12, alignItems: "center", marginTop: 14 },
  btnText: { color: COLORS.white, fontWeight: "900" },

  addRow: { marginTop: 14, flexDirection: "row", gap: 10, alignItems: "center" },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },

  listHeader: { marginTop: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 18, fontWeight: "900", color: COLORS.text },
  dangerLink: { color: COLORS.danger, fontWeight: "900" },
  blueLink: { color: COLORS.blue, fontWeight: "900" },

  box: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 10,
  },
  raRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#E5E7EB", flexDirection: "row", justifyContent: "space-between" },
  raText: { fontSize: 22, fontWeight: "900", color: COLORS.text },
});
