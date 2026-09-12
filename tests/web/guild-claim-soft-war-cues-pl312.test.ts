import { describe, expect, it } from "vitest";
import {
  SFX_PRESETS,
  createGameAudio,
  sfxStepsFor,
  shouldPlaySfx,
  type TonePlayer,
  type ToneStep,
} from "../../apps/web/lib/game-audio";
import {
  GUILD_CLAIM_SUCCESS_CUE,
  GUILD_COLLECT_SUCCESS_CUE_PREFIX,
  GUILD_DELIVER_SUCCESS_CUE_PREFIX,
  SOFT_WAR_START_SUCCESS_CUE,
  SUCCESS_CUE_MS,
  guildClaimSuccessCueText,
  guildCollectSuccessCueText,
  guildDeliverSuccessCueText,
  isCoreSuccessCueText,
  softWarStartSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

function mockPlayer() {
  const played: ToneStep[][] = [];
  const player: TonePlayer = {
    playSteps(steps) {
      played.push(steps);
    },
    startDrone() {
      return () => undefined;
    },
  };
  return { player, played };
}

/**
 * PL31.2 — Guild claim / soft-war brief cues (ephemeral; sticky setInfo replaced).
 */
describe("CityLands PL31.2 guild claim / soft-war brief cues", () => {
  it("ships guild_claim / soft_war SFX + short cues (happy)", () => {
    expect(SFX_PRESETS.guild_claim.length).toBeGreaterThan(0);
    expect(SFX_PRESETS.soft_war.length).toBeGreaterThan(0);
    expect(SFX_PRESETS.guild_claim).not.toEqual(SFX_PRESETS.quest_claim);
    expect(SFX_PRESETS.soft_war).not.toEqual(SFX_PRESETS.guild_claim);

    expect(guildClaimSuccessCueText()).toBe(GUILD_CLAIM_SUCCESS_CUE);
    expect(guildClaimSuccessCueText()).toBe("Grove claimed");
    expect(softWarStartSuccessCueText()).toBe(SOFT_WAR_START_SUCCESS_CUE);
    expect(softWarStartSuccessCueText()).toBe("Soft war");
    expect(guildCollectSuccessCueText(5)).toBe("Collected · 5");
    expect(guildCollectSuccessCueText(5)?.startsWith(GUILD_COLLECT_SUCCESS_CUE_PREFIX)).toBe(
      true,
    );
    expect(guildDeliverSuccessCueText(3)).toBe("Delivered · 3");
    expect(guildDeliverSuccessCueText(3)?.startsWith(GUILD_DELIVER_SUCCESS_CUE_PREFIX)).toBe(
      true,
    );

    expect(isCoreSuccessCueText(guildClaimSuccessCueText())).toBe(true);
    expect(isCoreSuccessCueText(softWarStartSuccessCueText())).toBe(true);
    expect(isCoreSuccessCueText(guildCollectSuccessCueText(5))).toBe(true);
    expect(isCoreSuccessCueText(guildDeliverSuccessCueText(3))).toBe(true);

    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    expect(audio.playSfx("guild_claim")).toBe(true);
    expect(audio.playSfx("soft_war")).toBe(true);
    expect(played).toEqual([SFX_PRESETS.guild_claim, SFX_PRESETS.soft_war]);
    expect(sfxStepsFor("guild_claim")).toEqual(SFX_PRESETS.guild_claim);
    expect(sfxStepsFor("soft_war")).toEqual(SFX_PRESETS.soft_war);
  });

  it("keeps soft gain and brief SUCCESS_CUE_MS (edge)", () => {
    for (const id of ["guild_claim", "soft_war"] as const) {
      for (const step of SFX_PRESETS[id]) {
        expect(step.gain).toBeLessThanOrEqual(0.1);
        expect(step.durationSec).toBeLessThanOrEqual(0.15);
      }
    }
    expect(SUCCESS_CUE_MS).toBeGreaterThanOrEqual(800);
    expect(SUCCESS_CUE_MS).toBeLessThanOrEqual(2500);
    expect(guildCollectSuccessCueText(5.9)).toBe("Collected · 5");
  });

  it("stays silent on bad qty / sticky prose / mute (failure)", () => {
    expect(guildCollectSuccessCueText(0)).toBeNull();
    expect(guildCollectSuccessCueText(-1)).toBeNull();
    expect(guildCollectSuccessCueText(null)).toBeNull();
    expect(guildCollectSuccessCueText(undefined)).toBeNull();
    expect(guildCollectSuccessCueText(Number.NaN)).toBeNull();
    expect(guildDeliverSuccessCueText(0)).toBeNull();
    expect(guildDeliverSuccessCueText(null)).toBeNull();

    expect(
      isCoreSuccessCueText("Your guild claimed the Wild Grove."),
    ).toBe(false);
    expect(
      isCoreSuccessCueText(
        "Soft war started — deliver wood at the beacon to score.",
      ),
    ).toBe(false);
    expect(
      isCoreSuccessCueText("Collected 5 from the claim."),
    ).toBe(false);
    expect(
      isCoreSuccessCueText(
        "Delivered 3 wood · contest score 12.",
      ),
    ).toBe(false);
    expect(isCoreSuccessCueText(null)).toBe(false);

    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    audio.setMuted(true);
    expect(shouldPlaySfx(true, "guild_claim")).toBe(false);
    expect(shouldPlaySfx(true, "soft_war")).toBe(false);
    expect(audio.playSfx("guild_claim")).toBe(false);
    expect(audio.playSfx("soft_war")).toBe(false);
    expect(played).toHaveLength(0);
  });
});
