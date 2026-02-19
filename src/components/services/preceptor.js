import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, firebaseConfig } from "./firebase";

import { getApps, initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, signOut } from "firebase/auth";

const COL = "preceptors";

function getSecondaryAuth() {
  const name = "secondary";
  const exists = getApps().some((a) => a.name === name);
  const secondaryApp = exists ? getApps().find((a) => a.name === name) : initializeApp(firebaseConfig, name);
  return getAuth(secondaryApp);
}

// acha registro do preceptor pelo email no Firestore
async function findPreceptorDocByEmail(email) {
  const q = query(collection(db, COL), where("email", "==", email), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, data: snap.docs[0].data() };
}

export async function createPreceptor({ name, email, password }) {
  const cleanEmail = String(email).trim().toLowerCase();
  const cleanName = String(name).trim();

  const secondaryAuth = getSecondaryAuth();

  try {
    const cred = await createUserWithEmailAndPassword(secondaryAuth, cleanEmail, password);
    const uid = cred.user.uid;

    await addDoc(collection(db, COL), {
      uid,
      name: cleanName,
      email: cleanEmail,
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await setDoc(
      doc(db, "users", uid),
      { role: "preceptor", active: true, name: cleanName, email: cleanEmail },
      { merge: true }
    );
  } catch (e) {
    // Se email já existe no Auth: não trava. Só garante o Firestore.
    if (e?.code === "auth/email-already-in-use") {
      const existing = await findPreceptorDocByEmail(cleanEmail);

      if (existing) {
        await updateDoc(doc(db, COL, existing.id), {
          name: cleanName,
          active: true,
          updatedAt: serverTimestamp(),
        });

        const uid = existing.data?.uid;
        if (uid) {
          await setDoc(
            doc(db, "users", uid),
            { role: "preceptor", active: true, name: cleanName, email: cleanEmail },
            { merge: true }
          );
        }
      } else {
        // Auth existe, mas Firestore não tem registro: cria sem uid
        await addDoc(collection(db, COL), {
          uid: null,
          name: cleanName,
          email: cleanEmail,
          active: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          note: "Auth já existia; criado via painel",
        });
      }
      return;
    }

    throw e;
  } finally {
    try {
      await signOut(secondaryAuth);
    } catch {}
  }
}

export async function listPreceptors({ includeInactive = false } = {}) {
  // ordena (se alguns docs antigos não tiverem createdAt, ainda funciona mas pode vir no fim)
  const q = query(collection(db, COL), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  const items = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      uid: data.uid ?? null,
      name: data.name ?? "",
      email: data.email ?? "",
      // ✅ se não tiver active, assume true (isso resolve “não aparece mas existe”)
      active: data.active === undefined ? true : data.active,
      createdAt: data.createdAt ?? null,
      updatedAt: data.updatedAt ?? null,
    };
  });

  return includeInactive ? items : items.filter((x) => x.active !== false);
}

export async function deletePreceptor(id) {
  // ✅ não apaga do Auth pelo client; só desativa no Firestore
  await updateDoc(doc(db, COL, id), {
    active: false,
    updatedAt: serverTimestamp(),
  });
}

export async function restorePreceptor(id) {
  await updateDoc(doc(db, COL, id), {
    active: true,
    updatedAt: serverTimestamp(),
  });
}
