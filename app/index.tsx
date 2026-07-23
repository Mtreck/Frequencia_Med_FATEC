import { Redirect } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { auth, authReadyPromise } from "../src/components/services/firebase";
import { getUserProfile } from "../src/components/services/users";

export default function Index() {
  const [checking, setChecking] = useState(true);
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let unsub = () => {};

    // Espera a migração de persistência (sessão antiga derrubada, se for o
    // caso) antes de checar quem está logado — evita redirecionar pro
    // coordenador com uma sessão que já devia ter caído.
    authReadyPromise.then(() => {
      if (!active) return;
      unsub = onAuthStateChanged(auth, async (u) => {
        try {
          if (!u) {
            setTarget("/login");
            return;
          }

          // Papel decidido sempre pelo Firestore — nunca por UID fixo no código.
          const profile: any = await getUserProfile(u.uid);

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
    });

    return () => {
      active = false;
      unsub();
    };
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
