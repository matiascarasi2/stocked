import { prisma } from "@stocked/schema";

export class HealthRepository {
  async pingDatabase(): Promise<void> {
    await prisma.$queryRaw`SELECT 1`;
  }
}
