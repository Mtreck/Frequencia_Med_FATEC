import { getApp, getApps, initializeApp } from "firebase/app";
import { browserSessionPersistence, getAuth, setPersistence, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";

export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

const SESSION_FLAG = "authSessionStarted";

/**
 * No web, a sessão do Firebase Auth por padrão fica salva indefinidamente
 * (IndexedDB) — fechar o navegador e abrir o link de novo mantinha o login
 * antigo. Aqui a sessão passa a durar só enquanto a aba/navegador está
 * aberto, e qualquer sessão herdada de antes dessa mudança é derrubada na
 * primeira aba nova aberta depois do deploy. As telas devem esperar essa
 * promise resolver antes de assinar onAuthStateChanged.
 */
export const authReadyPromise =
  Platform.OS === "web" && typeof window !== "undefined" && window.sessionStorage
    ? (async () => {
        const isFreshBrowserSession = !window.sessionStorage.getItem(SESSION_FLAG);
        try {
          await setPersistence(auth, browserSessionPersistence);
          if (isFreshBrowserSession) {
            window.sessionStorage.setItem(SESSION_FLAG, "1");
            await signOut(auth);
          }
        } catch {
          // se falhar, segue sem migrar — login continua funcionando normalmente
        }
      })()
    : Promise.resolve();
