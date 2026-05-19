import { authenticatedRequest } from "@/lib/api/authenticated";
import type { Alert, CreateAlertBody, UpdateAlertBody } from "@/lib/api/types";

export function listAlerts(options?: {
  includeInactive?: boolean;
}): Promise<Alert[]> {
  const params = new URLSearchParams();
  if (options?.includeInactive !== undefined) {
    params.set("includeInactive", String(options.includeInactive));
  }
  const query = params.toString();
  return authenticatedRequest<Alert[]>(query ? `/alerts?${query}` : "/alerts");
}

export function getAlert(id: string): Promise<Alert> {
  return authenticatedRequest<Alert>(`/alerts/${encodeURIComponent(id)}`);
}

export function createAlert(body: CreateAlertBody): Promise<Alert> {
  return authenticatedRequest<Alert>("/alerts", {
    method: "POST",
    body,
  });
}

export function updateAlert(id: string, body: UpdateAlertBody): Promise<Alert> {
  return authenticatedRequest<Alert>(`/alerts/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body,
  });
}

export function deleteAlert(id: string): Promise<Alert> {
  return authenticatedRequest<Alert>(`/alerts/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
