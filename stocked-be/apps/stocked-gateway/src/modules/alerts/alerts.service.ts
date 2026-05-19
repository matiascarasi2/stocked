import { notifyAlertsWorkerSymbol } from "../../lib/alerts-worker.js";
import { NotFoundError as StocksNotFoundError } from "../stocks/stocks.errors.js";
import { StocksService } from "../stocks/stocks.service.js";
import { NotFoundError, ValidationError } from "./alerts.errors.js";
import { AlertsRepository } from "./alerts.repository.js";
import {
  type AlertDto,
  type CreateAlertInput,
  type UpdateAlertInput,
  toAlertDto,
} from "./alerts.types.js";

export class AlertsService {
  constructor(
    private readonly repository = new AlertsRepository(),
    private readonly stocksService = new StocksService(),
  ) {}

  async listAlerts(
    userId: string,
    includeInactive: boolean,
  ): Promise<AlertDto[]> {
    const alerts = await this.repository.findMany(userId, includeInactive);
    return alerts.map(toAlertDto);
  }

  async getAlert(userId: string, id: string): Promise<AlertDto> {
    const alert = await this.repository.findById(id, userId);
    if (!alert) {
      throw new NotFoundError("Alert not found");
    }
    return toAlertDto(alert);
  }

  async createAlert(userId: string, input: CreateAlertInput): Promise<AlertDto> {
    validatePriceBounds(input.minPrice, input.maxPrice);
    await this.assertKnownSymbol(input.stockSymbol);

    const alert = await this.repository.create({
      userId,
      stockSymbol: input.stockSymbol,
      minPrice: input.minPrice,
      maxPrice: input.maxPrice,
    });

    notifyAlertsWorkerSymbol(alert.stockSymbol);
    return toAlertDto(alert);
  }

  async updateAlert(
    userId: string,
    id: string,
    input: UpdateAlertInput,
  ): Promise<AlertDto> {
    const existing = await this.repository.findById(id, userId);
    if (!existing) {
      throw new NotFoundError("Alert not found");
    }

    const mergedMin =
      input.minPrice !== undefined
        ? input.minPrice
        : existing.minPrice?.toNumber() ?? null;
    const mergedMax =
      input.maxPrice !== undefined
        ? input.maxPrice
        : existing.maxPrice?.toNumber() ?? null;

    validatePriceBounds(mergedMin, mergedMax);

    const alert = await this.repository.update(id, userId, input);
    if (input.isActive !== undefined) {
      notifyAlertsWorkerSymbol(alert.stockSymbol);
    }
    return toAlertDto(alert);
  }

  async deleteAlert(userId: string, id: string): Promise<AlertDto> {
    const alert = await this.repository.softDelete(id, userId);
    notifyAlertsWorkerSymbol(alert.stockSymbol);
    return toAlertDto(alert);
  }

  private async assertKnownSymbol(symbol: string): Promise<void> {
    try {
      await this.stocksService.getStock(symbol);
    } catch (error) {
      if (error instanceof StocksNotFoundError) {
        throw new ValidationError("Unknown stock symbol");
      }
      throw error;
    }
  }
}

export function validatePriceBounds(
  minPrice: number | null,
  maxPrice: number | null,
): void {
  if (minPrice === null && maxPrice === null) {
    throw new ValidationError("At least one of minPrice or maxPrice is required");
  }

  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    throw new ValidationError("minPrice must be less than or equal to maxPrice");
  }
}
