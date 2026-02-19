import { Stack, router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions
} from "react-native";

import { logout } from "../src/components/services/auth";
import { createPreceptor, deletePreceptor, listPreceptors } from "../src/components/services/preceptor";
import { listRollcalls } from "../src/components/services/rollcalls";
import { createUBS, deleteUBS, listUBS } from "../src/components/services/ubs";
import { AppModal } from "../src/components/ui/AppModal";
import { ScreenContainer } from "../src/components/ui/ScreenContainer";

const COLORS = {
  primary: "#0E3A5E",
  white: "#FFFFFF",
  text: "#0B1220",
  border: "#E2E8F0",
  muted: "#64748B",
  bg: "#FFFFFF",
  danger: "#EF4444",
  surface: "#F8FAFC",
};

function confirmDelete(message: string, onYes: () => void) {
  if (Platform.OS === "web") {
    const ok = window.confirm(message);
    if (ok) onYes();
    return;
  }

  Alert.alert("Confirmar", message, [
    { text: "Cancelar", style: "cancel" },
    { text: "Excluir", style: "destructive", onPress: onYes },
  ]);
}

export default function AdminPage() {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  const [rollcalls, setRollcalls] = useState<any[]>([]);
  const [loadingCalls, setLoadingCalls] = useState(true);

  const [ubsList, setUbsList] = useState<any[]>([]);
  const [ubsModal, setUbsModal] = useState(false);
  const [ubsName, setUbsName] = useState("");

  const [preceptors, setPreceptors] = useState<any[]>([]);
  const [precModal, setPrecModal] = useState(false);
  const [precName, setPrecName] = useState("");
  const [precEmail, setPrecEmail] = useState("");
  const [precPass, setPrecPass] = useState("");

  async function loadAll() {
    setLoadingCalls(true);
    const [calls, u, p] = await Promise.all([listRollcalls(), listUBS(), listPreceptors()]);
    setRollcalls(calls);
    setUbsList(u);
    setPreceptors(p);
    setLoadingCalls(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  async function handleCreateUbs() {
    const name = ubsName.trim();
    if (!name) return Alert.alert("Atenção", "Informe o nome da UBS.");
    await createUBS(name);
    setUbsName("");
    setUbsModal(false);
    await loadAll();
  }

  async function handleDeleteUbs(id: string) {
    confirmDelete("Deseja excluir esta UBS?", async () => {
      await deleteUBS(id);
      await loadAll();
    });
  }

  async function handleCreatePreceptor() {
    const name = precName.trim();
    const email = precEmail.trim().toLowerCase();
    const password = precPass.trim();

    if (!name || !email || !password) return Alert.alert("Atenção", "Informe nome, email e senha.");
    if (password.length < 6) return Alert.alert("Senha fraca", "A senha precisa ter pelo menos 6 caracteres.");

    await createPreceptor({ name, email, password });
    setPrecName("");
    setPrecEmail("");
    setPrecPass("");
    setPrecModal(false);
    await loadAll();

    Alert.alert("OK", "Preceptor criado no Auth e salvo no banco.");
  }

  async function handleDeletePreceptor(id: string) {
    confirmDelete("Deseja excluir este preceptor?", async () => {
      await deletePreceptor(id);
      await loadAll();
    });
  }

  return (
    <ScreenContainer scrollable={false} containerStyle={{ backgroundColor: COLORS.bg }}>
      <Stack.Screen
        options={{
          title: "Administrador",
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerRight: () => (
            <TouchableOpacity onPress={handleLogout} style={{ paddingHorizontal: 12 }}>
              <Text style={{ color: COLORS.white, fontWeight: "900" }}>Sair</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <View style={[styles.container, isWide && styles.containerWide]}>
        {/* ✅ BARRA DE AÇÕES (BOTÕES) */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => setUbsModal(true)}>
            <Text style={styles.btnText}>Cadastrar UBS</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnPrimary} onPress={() => setPrecModal(true)}>
            <Text style={styles.btnText}>Cadastrar Preceptor</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnGhost} onPress={loadAll}>
            <Text style={styles.btnGhostText}>{loadingCalls ? "Carregando..." : "Atualizar"}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Chamadas</Text>

        <View style={styles.box}>
          <FlatList
            data={rollcalls}
            keyExtractor={(x) => x.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.callCard} onPress={() => router.push(`/coordinator/${item.id}`)}>
                <Text style={styles.callTitle}>{item.ubsName}</Text>
                <Text style={styles.callMeta}>
                  {item.date} • {String(item.shift).toUpperCase()} • RAs: {(item.ras || []).length}
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              !loadingCalls ? <Text style={{ color: COLORS.muted }}>Nenhuma chamada salva.</Text> : null
            }
          />
        </View>

        {/* MODAL UBS */}
        <AppModal
          visible={ubsModal}
          onClose={() => setUbsModal(false)}
          title="Cadastrar UBS"
          footer={
            <>
              <TouchableOpacity style={styles.btnGhost} onPress={() => setUbsModal(false)}>
                <Text style={styles.btnGhostText}>Fechar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimary} onPress={handleCreateUbs}>
                <Text style={styles.btnText}>Salvar</Text>
              </TouchableOpacity>
            </>
          }
        >
          <TextInput
            value={ubsName}
            onChangeText={setUbsName}
            placeholder="Nome da UBS"
            placeholderTextColor={COLORS.muted}
            style={styles.input}
          />

          <Text style={styles.modalSubtitle}>UBS cadastradas</Text>

          <View style={styles.modalList}>
            {ubsList.length === 0 ? (
              <Text style={{ color: COLORS.muted }}>Nenhuma UBS cadastrada.</Text>
            ) : (
              ubsList.map((item) => (
                <View key={item.id} style={styles.row}>
                  <Text style={styles.rowText}>{item.name}</Text>
                  <TouchableOpacity onPress={() => handleDeleteUbs(item.id)}>
                    <Text style={styles.danger}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </AppModal>

        {/* MODAL PRECEPTOR */}
        <AppModal
          visible={precModal}
          onClose={() => setPrecModal(false)}
          title="Cadastrar Preceptor"
          footer={
            <>
              <TouchableOpacity style={styles.btnGhost} onPress={() => setPrecModal(false)}>
                <Text style={styles.btnGhostText}>Fechar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimary} onPress={handleCreatePreceptor}>
                <Text style={styles.btnText}>Salvar</Text>
              </TouchableOpacity>
            </>
          }
        >
          <TextInput
            value={precName}
            onChangeText={setPrecName}
            placeholder="Nome"
            placeholderTextColor={COLORS.muted}
            style={styles.input}
          />
          <TextInput
            value={precEmail}
            onChangeText={setPrecEmail}
            placeholder="Email"
            placeholderTextColor={COLORS.muted}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
          <TextInput
            value={precPass}
            onChangeText={setPrecPass}
            placeholder="Senha (mínimo 6)"
            placeholderTextColor={COLORS.muted}
            secureTextEntry
            style={styles.input}
          />

          <Text style={styles.modalSubtitle}>Preceptores cadastrados</Text>

          <View style={styles.modalList}>
            {preceptors.length === 0 ? (
              <Text style={{ color: COLORS.muted }}>Nenhum preceptor cadastrado.</Text>
            ) : (
              preceptors.map((item) => (
                <View key={item.id} style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowText}>{item.name}</Text>
                    <Text style={styles.rowSub}>{item.email}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDeletePreceptor(item.id)}>
                    <Text style={styles.danger}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </AppModal>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 0 }, // Reduced padding as ScreenContainer handles it
  containerWide: { maxWidth: 1000, alignSelf: "center", width: "100%" },

  actions: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 },

  btnPrimary: { backgroundColor: COLORS.primary, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12 },
  btnText: { color: COLORS.white, fontWeight: "900" },

  btnGhost: { backgroundColor: "#F1F5F9", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12 },
  btnGhostText: { color: COLORS.text, fontWeight: "900" },

  sectionTitle: { fontSize: 18, fontWeight: "900", color: COLORS.text, marginBottom: 8 },

  box: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, padding: 10, backgroundColor: COLORS.surface },

  callCard: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  callTitle: { fontWeight: "900", color: COLORS.text },
  callMeta: { marginTop: 4, color: COLORS.muted, fontWeight: "800" },

  modalSubtitle: { marginTop: 12, fontWeight: "900", color: COLORS.text },

  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 12, marginTop: 10, color: COLORS.text },

  modalList: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, padding: 10, marginTop: 10, maxHeight: 240 },

  row: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowText: { fontWeight: "900", color: COLORS.text },
  rowSub: { color: COLORS.muted, fontWeight: "700", marginTop: 2 },

  danger: { color: COLORS.danger, fontWeight: "900" },
});
