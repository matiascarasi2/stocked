import { HealthRepository } from "./health.repository.js";

export class HealthService {
  constructor(private readonly repository = new HealthRepository()) {}

  async check(): Promise<{ status: "ok"; database: "connected" }> {
    await this.repository.pingDatabase();
    return { status: "ok", database: "connected" };
  }
}
