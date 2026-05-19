export type ParsedAlertPrices = {
  minPrice: number | null;
  maxPrice: number | null;
};

export class AlertValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AlertValidationError";
  }
}

export function parsePriceInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    throw new AlertValidationError("Price must be a valid number");
  }

  if (parsed <= 0) {
    throw new AlertValidationError("Price must be greater than 0");
  }

  return parsed;
}

export function validateAlertPrices(
  minPrice: number | null,
  maxPrice: number | null,
): void {
  if (minPrice === null && maxPrice === null) {
    throw new AlertValidationError(
      "At least one of minimum or maximum price is required",
    );
  }

  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    throw new AlertValidationError(
      "Minimum price must be less than or equal to maximum price",
    );
  }
}

export function parseAlertPrices(
  minPriceInput: string,
  maxPriceInput: string,
): ParsedAlertPrices {
  const minPrice = parsePriceInput(minPriceInput);
  const maxPrice = parsePriceInput(maxPriceInput);
  validateAlertPrices(minPrice, maxPrice);
  return { minPrice, maxPrice };
}

export function parseStockSymbol(value: string): string {
  const trimmed = value.trim().toUpperCase();
  if (!trimmed) {
    throw new AlertValidationError("Stock symbol is required");
  }
  return trimmed;
}
