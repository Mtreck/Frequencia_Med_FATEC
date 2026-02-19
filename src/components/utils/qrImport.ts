export function parseImportQr(data: string): { url: string; key: string } {
  // caso 1: QR contém uma URL com query params
  // ex: https://site/import?key=ABC&token=XYZ
  if (data.startsWith("http")) {
    const u = new URL(data);
    const key = u.searchParams.get("key") || u.searchParams.get("token") || "";
    if (!key) throw new Error("QR inválido: não achei key/token.");
    return { url: u.toString(), key };
  }

  // caso 2: QR contém JSON
  // ex: {"url":"https://...","key":"ABC"}
  try {
    const obj = JSON.parse(data);
    if (!obj?.url || !obj?.key) throw new Error("JSON inválido");
    return { url: obj.url, key: obj.key };
  } catch {
    throw new Error("QR inválido: formato não reconhecido.");
  }
}
