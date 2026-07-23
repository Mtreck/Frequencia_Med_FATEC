import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth, authReadyPromise } from "../services/firebase";
import { getUserProfile } from "../services/users";

type Role = "coordinator" | "preceptor";

function homeForRole(role?: string) {
  return role === "coordinator" ? "/coordinator/list" : "/preceptor/create";
}

/**
 * Só as telas de nível "/", por trás do expo-router, decidiam pra onde ir —
 * as demais renderizavam pra qualquer um que abrisse a URL direto (link
 * antigo, aba compartilhada), sem checar login nem papel. Esse hook trava
 * o conteúdo até confirmar sessão + papel no Firestore.
 */
export function useAuthGuard(requiredRole?: Role) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    let unsub = () => {};
    setReady(false);

    // Espera a migração de persistência (sessão antiga derrubada, se for o
    // caso) antes de checar quem está logado.
    authReadyPromise.then(() => {
      if (!active) return;
      unsub = onAuthStateChanged(auth, async (u) => {
        if (!active) return;

        if (!u) {
          router.replace("/login");
          return;
        }

        try {
          const profile: any = await getUserProfile(u.uid);
          if (!active) return;

          if (profile?.active === false) {
            router.replace("/login");
            return;
          }

          if (requiredRole && profile?.role !== requiredRole) {
            router.replace(homeForRole(profile?.role) as any);
            return;
          }

          setReady(true);
        } catch {
          if (!active) return;
          // Sem confirmar o papel, não libera telas restritas — mas não
          // derruba a sessão por causa de uma falha passageira de rede.
          if (requiredRole) {
            router.replace(homeForRole(undefined) as any);
          } else {
            setReady(true);
          }
        }
      });
    });

    return () => {
      active = false;
      unsub();
    };
  }, [requiredRole]);

  return { ready };
}
