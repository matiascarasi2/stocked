import { describe, expect, it } from "@jest/globals";
import {
  formatBoundLabel,
  isWithinCooldown,
  shouldTriggerCrossing,
} from "./alert-matcher.js";

describe("shouldTriggerCrossing", () => {
  it("returns false when previous price is unknown", () => {
    expect(shouldTriggerCrossing(null, 100, 90, null)).toBe(false);
  });

  it("triggers minPrice cross down through floor", () => {
    expect(shouldTriggerCrossing(105, 95, 100, null)).toBe(true);
    expect(shouldTriggerCrossing(95, 90, 100, null)).toBe(false);
  });

  it("triggers maxPrice cross up through ceiling", () => {
    expect(shouldTriggerCrossing(95, 105, null, 100)).toBe(true);
    expect(shouldTriggerCrossing(105, 110, null, 100)).toBe(false);
  });

  it("triggers when price enters the band", () => {
    expect(shouldTriggerCrossing(90, 100, 95, 105)).toBe(true);
    expect(shouldTriggerCrossing(110, 100, 95, 105)).toBe(true);
    expect(shouldTriggerCrossing(100, 102, 95, 105)).toBe(false);
  });
});

describe("isWithinCooldown", () => {
  it("returns false when never triggered", () => {
    expect(isWithinCooldown(null, 60_000)).toBe(false);
  });

  it("returns true inside cooldown window", () => {
    const now = Date.now();
    const last = new Date(now - 30_000);
    expect(isWithinCooldown(last, 60_000, now)).toBe(true);
  });

  it("returns false after cooldown window", () => {
    const now = Date.now();
    const last = new Date(now - 120_000);
    expect(isWithinCooldown(last, 60_000, now)).toBe(false);
  });
});

describe("formatBoundLabel", () => {
  it("formats single and double bounds", () => {
    expect(formatBoundLabel(100, null)).toContain("100");
    expect(formatBoundLabel(100, 200)).toContain("100");
    expect(formatBoundLabel(100, 200)).toContain("200");
  });
});
