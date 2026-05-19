export function formatAlertDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatAlertPrice(value: number | null | undefined): string {
  if (value == null) {
    return "";
  }
  return String(value);
}
