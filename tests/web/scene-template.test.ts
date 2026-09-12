import { describe, expect, it } from "vitest";
import {
  sceneAllowsExpandPad,
  sceneTemplateForLandKind,
} from "../../apps/web/lib/scene-template";

describe("CityLands CL1.3 scene templates", () => {
  it("maps each canonical kind to its own template (happy)", () => {
    expect(sceneTemplateForLandKind("city")).toBe("city");
    expect(sceneTemplateForLandKind("player_land")).toBe("player_land");
    expect(sceneTemplateForLandKind("explore")).toBe("explore");
    expect(sceneTemplateForLandKind("warrior")).toBe("warrior");
    expect(new Set([
      sceneTemplateForLandKind("city"),
      sceneTemplateForLandKind("player_land"),
      sceneTemplateForLandKind("explore"),
      sceneTemplateForLandKind("warrior"),
    ]).size).toBe(4);
  });

  it("aliases legacy kinds and defaults empty land safely (edge)", () => {
    expect(sceneTemplateForLandKind("starter")).toBe("player_land");
    expect(sceneTemplateForLandKind("forest")).toBe("explore");
    expect(sceneTemplateForLandKind(null)).toBe("player_land");
    expect(sceneTemplateForLandKind(undefined)).toBe("player_land");
    expect(sceneAllowsExpandPad("player_land")).toBe(true);
    expect(sceneAllowsExpandPad("starter")).toBe(true);
    expect(sceneAllowsExpandPad("")).toBe(true);
  });

  it("rejects unknown kinds from expand pad / falls back to player land (failure)", () => {
    expect(sceneTemplateForLandKind("swamp")).toBe("player_land");
    expect(sceneAllowsExpandPad("city")).toBe(false);
    expect(sceneAllowsExpandPad("explore")).toBe(false);
    expect(sceneAllowsExpandPad("warrior")).toBe(false);
    expect(sceneAllowsExpandPad("swamp")).toBe(true);
  });
});
