export function formatarReal(valor) {
  const n = Number(valor) || 0;
  return "R$ " + n.toFixed(2).replace(".", ",");
}

export function formatarDataHora(iso) {
  const d = new Date(iso);
  const dois = (n) => String(n).padStart(2, "0");
  return (
    dois(d.getDate()) + "/" + dois(d.getMonth() + 1) + "/" + d.getFullYear() +
    " " + dois(d.getHours()) + ":" + dois(d.getMinutes())
  );
}
