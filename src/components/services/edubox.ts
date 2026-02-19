function extractAllHiddenInputs(html: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /<input[^>]+type=["']hidden["'][^>]*>/gi;
  const inputs = html.match(re) || [];

  for (const tag of inputs) {
    const name = tag.match(/name=["']([^"']+)["']/i)?.[1];
    const value = tag.match(/value=["']([\s\S]*?)["']/i)?.[1] ?? "";
    if (name) out[name] = value;
  }
  return out;
}

export async function sendRollcallToEdubox({
  url,
  csvText,
}: {
  url: string;
  csvText: string;
}) {
  // ✅ 1) POST do conteúdo
  const res1 = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      Accept: "application/json, text/html;q=0.9,*/*;q=0.8",
    },
    body: csvText,
  });

  const text1 = await res1.text();
  if (!res1.ok) throw new Error(`Falha no upload (${res1.status}): ${text1 || "sem detalhes"}`);

  // Pode vir JSON {status, data, log}
  let html = text1;
  try {
    const parsed = JSON.parse(text1);
    if (parsed?.data) html = parsed.data;
  } catch {}

  // ✅ 2) Extrai todos hidden inputs (sql e outros que o sistema possa exigir)
  const hidden = extractAllHiddenInputs(html);
  if (!hidden.sql) {
    throw new Error("Edubox não retornou o campo hidden 'sql' para confirmar (Salvar).");
  }

  // ✅ 3) POST do "Salvar" para A MESMA URL ORIGINAL (com ?dtu&key)
  const form = new URLSearchParams();
  for (const [k, v] of Object.entries(hidden)) form.set(k, v);

  const res2 = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
      Accept: "text/html,application/json;q=0.9,*/*;q=0.8",
    },
    body: form.toString(),
  });

  const text2 = await res2.text().catch(() => "");
  if (!res2.ok) throw new Error(`Falha ao confirmar (Salvar) (${res2.status}): ${text2 || "sem detalhes"}`);

  return { step1: text1, step2: text2 };
}
