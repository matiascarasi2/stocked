import { describe, expect, it, jest } from "@jest/globals";
import type { Alert } from "@stocked/schema";
import { NotFoundError as StocksNotFoundError } from "../stocks/stocks.errors.js";
import type { StocksService } from "../stocks/stocks.service.js";
import { NotFoundError, ValidationError } from "./alerts.errors.js";
import type { AlertsRepository } from "./alerts.repository.js";
import { AlertsService, validatePriceBounds } from "./alerts.service.js";

const USER_ID = "00000000-0000-4000-8000-000000000001";
const ALERT_ID = "00000000-0000-4000-8000-000000000002";

function decimal(value: number): { toNumber(): number } {
  return { toNumber: () => value };
}

function createAlert(overrides: Partial<Alert> = {}): Alert {
  return {
    id: ALERT_ID,
    userId: USER_ID,
    stockSymbol: "AAPL",
    minPrice: decimal(150),
    maxPrice: null,
    isActive: true,
    createdAt: new Date("2026-05-18T12:00:00.000Z"),
    updatedAt: new Date("2026-05-18T12:00:00.000Z"),
    lastTriggeredAt: null,
    ...overrides,
  };
}

function createMockRepository(
  overrides: Partial<jest.Mocked<AlertsRepository>> = {},
): jest.Mocked<AlertsRepository> {
  return {
    findMany: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    ...overrides,
  };
}

function createMockStocksService(
  overrides: Partial<jest.Mocked<Pick<StocksService, "getStock">>> = {},
): jest.Mocked<Pick<StocksService, "getStock">> {
  return {
    getStock: jest.fn(),
    ...overrides,
  };
}

describe("validatePriceBounds", () => {
  it("rejects when both prices are null", () => {
    expect(() => validatePriceBounds(null, null)).toThrow(ValidationError);
  });

  it("rejects when minPrice is greater than maxPrice", () => {
    expect(() => validatePriceBounds(200, 100)).toThrow(ValidationError);
  });

  it("allows a single-sided bound", () => {
    expect(() => validatePriceBounds(100, null)).not.toThrow();
    expect(() => validatePriceBounds(null, 200)).not.toThrow();
  });
});

describe("AlertsService", () => {
  describe("createAlert", () => {
    it("creates an alert when symbol is known and bounds are valid", async () => {
      const created = createAlert();
      const repository = createMockRepository({
        create: jest.fn().mockResolvedValue(created),
      });
      const stocksService = createMockStocksService({
        getStock: jest.fn().mockResolvedValue({
          id: "aapl",
          symbol: "AAPL",
          name: "Apple Inc.",
        }),
      });
      const service = new AlertsService(
        repository,
        stocksService as StocksService,
      );

      const result = await service.createAlert(USER_ID, {
        stockSymbol: "AAPL",
        minPrice: 150,
        maxPrice: null,
      });

      expect(stocksService.getStock).toHaveBeenCalledWith("AAPL");
      expect(repository.create).toHaveBeenCalledWith({
        userId: USER_ID,
        stockSymbol: "AAPL",
        minPrice: 150,
        maxPrice: null,
      });
      expect(result).toEqual({
        id: ALERT_ID,
        stockSymbol: "AAPL",
        minPrice: 150,
        maxPrice: null,
        isActive: true,
        createdAt: "2026-05-18T12:00:00.000Z",
        updatedAt: "2026-05-18T12:00:00.000Z",
        lastTriggeredAt: null,
      });
    });

    it("rejects create when both prices are null", async () => {
      const repository = createMockRepository();
      const stocksService = createMockStocksService();
      const service = new AlertsService(
        repository,
        stocksService as StocksService,
      );

      await expect(
        service.createAlert(USER_ID, {
          stockSymbol: "AAPL",
          minPrice: null,
          maxPrice: null,
        }),
      ).rejects.toThrow(ValidationError);

      expect(repository.create).not.toHaveBeenCalled();
    });

    it("rejects create when minPrice exceeds maxPrice", async () => {
      const repository = createMockRepository();
      const stocksService = createMockStocksService();
      const service = new AlertsService(
        repository,
        stocksService as StocksService,
      );

      await expect(
        service.createAlert(USER_ID, {
          stockSymbol: "AAPL",
          minPrice: 200,
          maxPrice: 100,
        }),
      ).rejects.toThrow(ValidationError);

      expect(repository.create).not.toHaveBeenCalled();
    });

    it("rejects create for unknown symbols", async () => {
      const repository = createMockRepository();
      const stocksService = createMockStocksService({
        getStock: jest
          .fn()
          .mockRejectedValue(new StocksNotFoundError("Stock not found: FAKE")),
      });
      const service = new AlertsService(
        repository,
        stocksService as StocksService,
      );

      await expect(
        service.createAlert(USER_ID, {
          stockSymbol: "FAKE",
          minPrice: 10,
          maxPrice: null,
        }),
      ).rejects.toThrow("Unknown stock symbol");

      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe("updateAlert", () => {
    it("merges bounds and rejects clearing both prices", async () => {
      const existing = createAlert({
        minPrice: decimal(100),
        maxPrice: decimal(200),
      });
      const repository = createMockRepository({
        findById: jest.fn().mockResolvedValue(existing),
      });
      const stocksService = createMockStocksService();
      const service = new AlertsService(
        repository,
        stocksService as StocksService,
      );

      await expect(
        service.updateAlert(USER_ID, ALERT_ID, {
          minPrice: null,
          maxPrice: null,
        }),
      ).rejects.toThrow(ValidationError);

      expect(repository.update).not.toHaveBeenCalled();
    });

    it("updates alert when merged bounds remain valid", async () => {
      const existing = createAlert({
        minPrice: decimal(100),
        maxPrice: decimal(200),
      });
      const updated = createAlert({ maxPrice: decimal(250) });
      const repository = createMockRepository({
        findById: jest.fn().mockResolvedValue(existing),
        update: jest.fn().mockResolvedValue(updated),
      });
      const stocksService = createMockStocksService();
      const service = new AlertsService(
        repository,
        stocksService as StocksService,
      );

      const result = await service.updateAlert(USER_ID, ALERT_ID, {
        maxPrice: 250,
      });

      expect(repository.update).toHaveBeenCalledWith(ALERT_ID, USER_ID, {
        maxPrice: 250,
      });
      expect(result.maxPrice).toBe(250);
    });

    it("throws NotFoundError when alert does not belong to user", async () => {
      const repository = createMockRepository({
        findById: jest.fn().mockResolvedValue(null),
      });
      const stocksService = createMockStocksService();
      const service = new AlertsService(
        repository,
        stocksService as StocksService,
      );

      await expect(
        service.updateAlert(USER_ID, ALERT_ID, { maxPrice: 250 }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("deleteAlert", () => {
    it("soft deletes by setting isActive to false", async () => {
      const deleted = createAlert({ isActive: false });
      const repository = createMockRepository({
        softDelete: jest.fn().mockResolvedValue(deleted),
      });
      const stocksService = createMockStocksService();
      const service = new AlertsService(
        repository,
        stocksService as StocksService,
      );

      const result = await service.deleteAlert(USER_ID, ALERT_ID);

      expect(repository.softDelete).toHaveBeenCalledWith(ALERT_ID, USER_ID);
      expect(result.isActive).toBe(false);
    });

    it("throws NotFoundError when alert is missing", async () => {
      const repository = createMockRepository({
        softDelete: jest
          .fn()
          .mockRejectedValue(new NotFoundError("Alert not found")),
      });
      const stocksService = createMockStocksService();
      const service = new AlertsService(
        repository,
        stocksService as StocksService,
      );

      await expect(service.deleteAlert(USER_ID, ALERT_ID)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe("getAlert", () => {
    it("returns alert dto for owned alert", async () => {
      const alert = createAlert();
      const repository = createMockRepository({
        findById: jest.fn().mockResolvedValue(alert),
      });
      const stocksService = createMockStocksService();
      const service = new AlertsService(
        repository,
        stocksService as StocksService,
      );

      const result = await service.getAlert(USER_ID, ALERT_ID);

      expect(repository.findById).toHaveBeenCalledWith(ALERT_ID, USER_ID);
      expect(result.id).toBe(ALERT_ID);
    });
  });

  describe("listAlerts", () => {
    it("lists alerts for user", async () => {
      const alerts = [createAlert()];
      const repository = createMockRepository({
        findMany: jest.fn().mockResolvedValue(alerts),
      });
      const stocksService = createMockStocksService();
      const service = new AlertsService(
        repository,
        stocksService as StocksService,
      );

      const result = await service.listAlerts(USER_ID, false);

      expect(repository.findMany).toHaveBeenCalledWith(USER_ID, false);
      expect(result).toHaveLength(1);
    });
  });
});
