import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp } from "firebase/firestore";
import { slugify } from "../utils/slugify";
import { db } from "./firebase";

const COL = "ubss";

export async function createUBS(name) {
  const ubsSlug = slugify(name);
  await addDoc(collection(db, COL), {
    name,
    ubsSlug,
    active: true,
    createdAt: serverTimestamp(),
  });
}

export async function listUBS() {
  const q = query(collection(db, COL), orderBy("name", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(x => x.active !== false);
}

export async function deleteUBS(id) {
  await deleteDoc(doc(db, COL, id));
}
