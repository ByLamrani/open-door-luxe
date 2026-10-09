import { describe, expect, it } from "vitest";
import { canAdvanceFulfillment, isOwnerProfile } from "@/lib/backofficeRules";

describe("BackOffice requirements", () => {
  it("allows an unavailable fulfillment check with a recorded reason", () => {
    expect(canAdvanceFulfillment(false, "Courier selected by customer later")).toBe(true);
    expect(canAdvanceFulfillment(false, "   ")).toBe(false);
    expect(canAdvanceFulfillment(true, "")).toBe(true);
  });
  it("keeps Adil out of the agent listing without hiding other agents", () => {
    const profiles = [{ email: "adil.lamrani.ejjouti@gmail.com" }, { email: "agent@example.com" }];
    expect(profiles.filter((profile) => !isOwnerProfile(profile))).toEqual([{ email: "agent@example.com" }]);
  });
});