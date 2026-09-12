import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  ITEM_MISSING_REFUSE_CUE,
  NEEDS_STATION_REFUSE_CUE,
  UNKNOWN_STATION_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashItemMissingRefuseCue,
  shouldFlashNeedsStationRefuseCue,
  shouldFlashUnknownStationRefuseCue,
  unknownStationRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL108.2 — Unknown-station refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Build` instead of sticky long station prose.
 * Station build catalog unchanged; mute ok; distinct from craft Station.
 */
describe("CityLands PL108.2 unknown-station refuse ephemeral", () => {
  it("flashes Build for unknownStation (happy)", () => {
    expect(unknownStationRefuseCueText()).toBe(UNKNOWN_STATION_REFUSE_CUE);
    expect(unknownStationRefuseCueText()).toBe("Build");
    expect(
      shouldFlashUnknownStationRefuseCue(ACTION_ERROR.unknownStation),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.unknownStation)).toBe(true);
    expect(isCoreSuccessCueText("Build")).toBe(true);
    expect(ACTION_ERROR.unknownStation.toLowerCase()).toMatch(/station|build/);
  });

  it("stays quiet for needs-station and item-missing refuses (edge)", () => {
    expect(
      shouldFlashUnknownStationRefuseCue(
        ACTION_ERROR.needsStation("Kitchen"),
      ),
    ).toBe(false);
    expect(
      shouldFlashUnknownStationRefuseCue(ACTION_ERROR.itemMissing),
    ).toBe(false);
    expect(unknownStationRefuseCueText()).not.toBe(NEEDS_STATION_REFUSE_CUE);
    expect(unknownStationRefuseCueText()).not.toBe(ITEM_MISSING_REFUSE_CUE);
    expect(
      shouldFlashNeedsStationRefuseCue(ACTION_ERROR.unknownStation),
    ).toBe(false);
    expect(
      shouldFlashItemMissingRefuseCue(ACTION_ERROR.unknownStation),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent build rules (failure)", () => {
    expect(shouldFlashUnknownStationRefuseCue(null)).toBe(false);
    expect(shouldFlashUnknownStationRefuseCue(undefined)).toBe(false);
    expect(shouldFlashUnknownStationRefuseCue("")).toBe(false);
    expect(
      shouldFlashUnknownStationRefuseCue(ACTION_ERROR.buildBoardMissing),
    ).toBe(false);
    expect(unknownStationRefuseCueText()).not.toMatch(/\d/);
    expect(unknownStationRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.unknownStation.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.unknownStation)).toBe(false);
    expect(unknownStationRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
