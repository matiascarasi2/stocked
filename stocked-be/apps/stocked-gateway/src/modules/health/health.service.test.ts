import { describe, expect, it, jest } from "@jest/globals";
import type { HealthRepository } from "./health.repository.js";
import { HealthService } from "./health.service.js";

function createMockRepository(
  overrides: Partial<jest.Mocked<HealthRepository>> = {},
): jest.Mocked<HealthRepository> {
  return {
    pingDatabase: jest.fn(),
    ...overrides,
  };
}

describe("HealthService", () => {
  it("returns ok when database ping succeeds", async () => {
    const repository = createMockRepository({
      pingDatabase: jest.fn().mockResolvedValue(undefined),
    });
    const service = new HealthService(repository);

    await expect(service.check()).resolves.toEqual({
      status: "ok",
      database: "connected",
    });
    expect(repository.pingDatabase).toHaveBeenCalled();
  });

  it("propagates error when database ping fails", async () => {
    const error = new Error("connection refused");
    const repository = createMockRepository({
      pingDatabase: jest.fn().mockRejectedValue(error),
    });
    const service = new HealthService(repository);

    await expect(service.check()).rejects.toThrow("connection refused");
  });
});
