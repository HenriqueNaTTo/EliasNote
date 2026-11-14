export function cleanZoomLabel(zoom: number): string {
  const percent = zoom * 100;
  if (percent >= 100) return String(Math.round(percent));
  return String(Math.round(percent * 10) / 10).replace(".0", "");
}
