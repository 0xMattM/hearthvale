import { describe, expect, it } from "vitest";
import {
  CANONICAL_LAND_KINDS,
  LAND_DESTINATIONS,
  MAP_IDENTITY,
  currentMapChipLabel,
  mapIdentityForLandKind,
} from "@game/shared";
import { formatCurrentMapChip } from "../../apps/web/lib/hud/topbar-chrome";

/**
 * PL14.1 — Current-map chip (min HUD).
 * Quiet glyph/word for City / Land / Explore / Arena; warrior optional wording.
 */
describe("CityLands PL14.1 current-map chip", () => {
  it("shows short City / Land / Explore / Arena words that update per map (happy)", () => {
    expect(currentMapChipLabel("city")).toBe("City");
    expect(currentMapChipLabel("player_land")).toBe("Land");
    expect(currentMapChipLabel("explore")).toBe("Explore");
    expect(currentMapChipLabel("warrior")).toBe("Arena");

    expect(formatCurrentMapChip("city").word).toBe("City");
    expect(formatCurrentMapChip("player_land").word).toBe("Land");
    expect(formatCurrentMapChip("explore").word).toBe("Explore");
    expect(formatCurrentMapChip("warrior").word).toBe("Arena");

    for (const kind of CANONICAL_LAND_KINDS) {
      const chip = formatCurrentMapChip(kind);
      expect(chip.glyph.length).toBeGreaterThan(0);
      expect(chip.accent).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(chip.label).toBe(MAP_IDENTITY[kind].word);
      // Reason: chip stays compact vs TravelPanel full names (Your Land / Warrior Arena).
      expect(chip.word.length).toBeLessThanOrEqual(7);
    }

    const accents = new Set(
      CANONICAL_LAND_KINDS.map((k) => MAP_IDENTITY[k].accent.toLowerCase()),
    );
    expect(accents.size).toBe(4);
  });

  it("normalizes legacy aliases and keeps warrior optional Arena wording (edge)", () => {
    expect(currentMapChipLabel("starter")).toBe("Land");
    expect(currentMapChipLabel("forest")).toBe("Explore");
    expect(mapIdentityForLandKind("starter").word).toBe("Land");
    expect(mapIdentityForLandKind("forest").word).toBe("Explore");

    const arena = formatCurrentMapChip("warrior");
    expect(arena.word).toBe("Arena");
    expect(arena.word.toLowerCase()).not.toMatch(/warrior arena/);
    const travelName = LAND_DESTINATIONS.find((d) => d.kind === "warrior")!.name;
    expect(travelName).toMatch(/Warrior/);
    expect(arena.word).not.toBe(travelName);
  });

  it("falls back quietly for null / unknown kinds (failure)", () => {
    expect(currentMapChipLabel(null)).toBe("Land");
    expect(currentMapChipLabel(undefined)).toBe("Land");
    expect(currentMapChipLabel("")).toBe("Land");
    expect(currentMapChipLabel("not_a_map")).toBe("Land");
    expect(formatCurrentMapChip("bogus").word).toBe("Land");
    expect(formatCurrentMapChip(null).glyph).toBe(MAP_IDENTITY.player_land.glyph);
  });
});
