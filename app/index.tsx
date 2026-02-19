import { Redirect } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { auth } from "../src/components/services/firebase";
import { getUserProfile } from "../src/components/services/users";

// ✅ UID do coordenador (você passou)
const COORD_UID = "ZQGqgnsXQTWrPqxUlseq6bqjoiw2";

export default function Index() {
  const [checking, setChecking] = useState(true);
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      try {
        if (!u) {
          setTarget("/login");
          return;
        }

        // ✅ 1) Regra principal: se o UID é do coordenador, vai direto
        if (u.uid === COORD_UID) {
          setTarget("/coordinator/list");
          return;
        }

        // ✅ 2) Fallback: se tiver role no Firestore
        const profile = await getUserProfile(u.uid);

        if (profile?.active === false) {
          setTarget("/login");
          return;
        }

        if (profile?.role === "coordinator") {
          setTarget("/coordinator/list");
        } else {
          setTarget("/preceptor/create");
        }
      } catch (e) {
        // se der qualquer erro, manda pro preceptor (não trava)
        setTarget("/preceptor/create");
      } finally {
        setChecking(false);
      }
    });

    return () => unsub();
  }, []);

  if (checking || !target) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <Redirect href={target as any} />;
}
