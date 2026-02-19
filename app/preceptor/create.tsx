import { Picker } from "@react-native-picker/picker";
import { router, Stack } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";

import { logout } from "../../src/components/services/auth";
import { auth } from "../../src/components/services/firebase";
import { listUBS } from "../../src/components/services/ubs";
import { slugify } from "../../src/components/utils/slugify";

const COLORS = {
  primary: "#0E3A5E",
  white: "#FFFFFF",
  text: "#0B1220",
  border: "#E2E8F0",
  muted: "#64748B",
  bg: "#FFFFFF",
  surface: "#F8FAFC",
};

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function CreatePage() {
  const { width } = useWindowDimensions();
  const isWebWide = width >= 900;

  const [shift, setShift] = useState<"manha" | "tarde">("manha");
  const [ubsList, setUbsList] = useState<any[]>([]);
  const [ubsId, setUbsId] = useState<string>("");

  const date = useMemo(() => todayISO(), []);

  async function loadUbs() {
    const data = await listUBS();
    setUbsList(data);
    if (!ubsId && data?.length) setUbsId(data[0].id);
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

  return (
    <>
      <Stack.Screen
        options={{
          title: "Criar chamada",
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerRight: () => (
            <TouchableOpacity onPress={handleLogout} style={{ paddingHorizontal: 12 }}>
              <Text style={{ color: COLORS.white, fontWeight: "900" }}>Sair</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.page}>
        <View style={[styles.card, isWebWide && { maxWidth: 520, alignSelf: "center", width: "100%" }]}>
          <Text style={styles.label}>Data</Text>
          <Text style={styles.value}>{date}</Text>

          <Text style={styles.label}>Turno</Text>
          <View style={styles.row}>
            <TouchableOpacity style={[styles.chip, shift === "manha" && styles.chipActive]} onPress={() => setShift("manha")}>
              <Text style={[styles.chipText, shift === "manha" && styles.chipTextActive]}>Manhã</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.chip, shift === "tarde" && styles.chipActive]} onPress={() => setShift("tarde")}>
              <Text style={[styles.chipText, shift === "tarde" && styles.chipTextActive]}>Tarde</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>UBS</Text>
          <View style={styles.pickerBox}>
            <Picker
              selectedValue={ubsId}
              onValueChange={(v) => setUbsId(String(v))}
              style={[
                { color: COLORS.text },
                Platform.OS === 'web' && ({
                  height: 50,
                  width: '100%',
                  borderWidth: 0,
                  backgroundColor: 'transparent',
                  paddingHorizontal: 10,
                  outlineStyle: 'none', // Removes the blue focus outline on web
                } as any)
              ]}
            >
              {ubsList.map((u) => (
                <Picker.Item key={u.id} label={u.name} value={u.id} />
              ))}
            </Picker>
          </View>

          <TouchableOpacity style={[styles.button, !ubsSelected && { opacity: 0.5 }]} onPress={goScan} disabled={!ubsSelected}>
            <Text style={styles.buttonText}>Iniciar scanner</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ marginTop: 12 }} onPress={loadUbs}>
            <Text style={styles.link}>Atualizar UBS</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.bg, padding: 16 },
  card: { backgroundColor: COLORS.bg },
  label: { marginTop: 12, color: COLORS.muted, fontWeight: "800" },
  value: { fontSize: 18, fontWeight: "900", color: COLORS.text },
  row: { flexDirection: "row", gap: 10, marginTop: 10 },
  chip: { borderWidth: 1, borderColor: COLORS.border, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999 },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontWeight: "900", color: COLORS.text },
  chipTextActive: { color: COLORS.white },

  pickerBox: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: COLORS.surface,
  },

  button: { marginTop: 16, backgroundColor: COLORS.primary, padding: 14, borderRadius: 12, alignItems: "center" },
  buttonText: { color: COLORS.white, fontWeight: "900" },
  link: { color: COLORS.primary, fontWeight: "900" },
});
