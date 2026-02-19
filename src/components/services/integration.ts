export async function postCsvToAcademicSystem({
  url,
  key,
  csvText,
}: {
  url: string;
  key: string;
  csvText: string;
}) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "X-Import-Key": key, // se o sistema usar header
    },
    body: csvText,
  });

  const text = await res.text().catch(() => "");
  if (!res.ok) {
    throw new Error(`Falha ao enviar (${res.status}): ${text || "sem detalhes"}`);
  }
  return text;
}
