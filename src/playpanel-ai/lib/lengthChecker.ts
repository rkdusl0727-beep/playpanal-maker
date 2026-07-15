export function isWithinPlaypanelLength(text: string): boolean {
  const count = [...text.trim()].length;
  return count >= 150 && count <= 180;
}
