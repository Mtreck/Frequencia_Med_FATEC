export function parseEduboxQr(data: string): { url: string } {
  const raw = String(data || "").trim();

  if (!raw.startsWith("http")) {
    throw new Error("QR inválido: não é uma URL.");
  }

  const u = new URL(raw);

  // valida domínio e endpoint (opcional, mas ajuda a evitar erro)
  if (!u.hostname.includes("edubox.com.br")) {
    throw new Error("QR inválido: não parece ser do Edubox.");
  }

  const key = u.searchParams.get("key");
  const dtu = u.searchParams.get("dtu");

  if (!key || !dtu) {
    throw new Error("QR inválido: faltou key ou dtu na URL.");
  }

  return { url: u.toString() };
}
