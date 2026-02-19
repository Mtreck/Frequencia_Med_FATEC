import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

const COL = "rollcalls";

export async function createRollcall({ date, shift, ubsName, ubsSlug, createdBy, ras }) {
  const ref = await addDoc(collection(db, COL), {
    date,
    shift,
    ubsName,
    ubsSlug,
    createdBy,
    ras: ras || [],
    createdAt: serverTimestamp(),
    status: "finalized",
  });
  return ref.id;
}

export async function listRollcalls() {
  const q = query(collection(db, COL), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getRollcall(id) {
  const ref = doc(db, COL, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function updateRollcallRAs(id, ras) {
  const ref = doc(db, COL, id);
  await updateDoc(ref, { ras });
}

export async function deleteRollcall(id) {
  const ref = doc(db, COL, id);
  await deleteDoc(ref);
}
