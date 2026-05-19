import type { Request } from "express";
import { ValidationError } from "./alerts.errors.js";
import type { CreateAlertInput, UpdateAlertInput } from "./alerts.types.js";

const SYMBOL_PATTERN = /^[A-Z0-9.-]+$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type ListAlertsQuery = {
  includeInactive: boolean;
};

export function parseListQuery(query: Request["query"]): ListAlertsQuery {
  const raw = query.includeInactive;
  if (raw === undefined) {
    return { includeInactive: false };
  }

  if (raw === "true") {
    return { includeInactive: true };
  }

  if (raw === "false") {
    return { includeInactive: false };
  }

  throw new ValidationError("includeInactive must be true or false");
}

export function parseIdParam(params: Request["params"]): string {
  const raw = params.id;
  const idValue = Array.isArray(raw) ? raw[0] : raw;
  if (typeof idValue !== "string" || !idValue.trim()) {
    throw new ValidationError("id is required");
  }

  const id = idValue.trim();
  if (!UUID_PATTERN.test(id)) {
    throw new ValidationError("id must be a valid UUID");
  }

  return id;
}

export function parseStockSymbol(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new ValidationError(`${fieldName} is required`);
  }

  const symbol = value.trim().toUpperCase();
  if (!SYMBOL_PATTERN.test(symbol)) {
    throw new ValidationError(`${fieldName} is invalid`);
  }

  return symbol;
}

export function parseOptionalPrice(
  value: unknown,
  fieldName: string,
): number | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new ValidationError(`${fieldName} must be a number`);
  }

  if (value <= 0) {
    throw new ValidationError(`${fieldName} must be greater than 0`);
  }

  return value;
}

export function parseCreateBody(body: unknown): CreateAlertInput {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Invalid request body");
  }

  const record = body as Record<string, unknown>;
  const stockSymbol = parseStockSymbol(record.stockSymbol, "stockSymbol");

  const hasMinPrice = "minPrice" in record;
  const hasMaxPrice = "maxPrice" in record;

  const minPrice = hasMinPrice
    ? parseOptionalPrice(record.minPrice, "minPrice") ?? null
    : null;
  const maxPrice = hasMaxPrice
    ? parseOptionalPrice(record.maxPrice, "maxPrice") ?? null
    : null;

  if (minPrice === null && maxPrice === null) {
    throw new ValidationError("At least one of minPrice or maxPrice is required");
  }

  return { stockSymbol, minPrice, maxPrice };
}

export function parseUpdateBody(body: unknown): UpdateAlertInput {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Invalid request body");
  }

  const record = body as Record<string, unknown>;
  const input: UpdateAlertInput = {};

  if ("minPrice" in record) {
    input.minPrice = parseOptionalPrice(record.minPrice, "minPrice") ?? null;
  }

  if ("maxPrice" in record) {
    input.maxPrice = parseOptionalPrice(record.maxPrice, "maxPrice") ?? null;
  }

  if ("isActive" in record) {
    if (typeof record.isActive !== "boolean") {
      throw new ValidationError("isActive must be a boolean");
    }
    input.isActive = record.isActive;
  }

  if (
    input.minPrice === undefined &&
    input.maxPrice === undefined &&
    input.isActive === undefined
  ) {
    throw new ValidationError("At least one field must be provided");
  }

  return input;
}
