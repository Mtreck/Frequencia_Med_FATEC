export function makeCsvFromRAs(ras) {
  // 1 RA por linha, sem header
  return (ras || []).join("\n");
}

export function makeCsvFromRAsWithDate(ras, dateISO) {
  // RA;DATA por linha
  return ras.map((ra) => `${ra};${dateISO}`).join("\n");
}
export function formatDateBRFromISO(dateISO) {
  const [y, m, d] = String(dateISO).split("-");
  if (!y || !m || !d) return dateISO;
  return `${d}/${m}/${y}`; // DD/MM/YYYY
}

export function makeCsvFromRAsWithDateBR(ras, dateISO) {
  const dateBR = formatDateBRFromISO(dateISO);
  // ✅ \r\n e newline final (muitos PHP exigem isso)
  return ras.map((ra) => `${String(ra).trim()};${dateBR}`).join("\r\n") + "\r\n";
}

