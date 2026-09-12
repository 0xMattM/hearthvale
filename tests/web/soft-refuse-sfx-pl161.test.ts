import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import {
  SFX_PRESETS,
  createGameAudio,
  isSoftRefuseError,
  sfxStepsFor,
  shouldPlaySfx,
  type TonePlayer,
  type ToneStep,
} from "../../apps/web/lib/game-audio";

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
 * PL16.1 — Soft refuse SFX on busy / energy / already-here (mute + non-spam edge).
 */
describe("CityLands PL16.1 soft refuse SFX", () => {
  it("ships a quiet descending refuse preset distinct from success cues (happy)", () => {
    expect(SFX_PRESETS.refuse.length).toBeGreaterThan(0);
    expect(SFX_PRESETS.refuse).not.toEqual(SFX_PRESETS.craft);
    expect(SFX_PRESETS.refuse).not.toEqual(SFX_PRESETS.travel);
    expect(SFX_PRESETS.refuse).not.toEqual(SFX_PRESETS.visit);
    expect(SFX_PRESETS.refuse[0]!.freq).toBeGreaterThan(
      SFX_PRESETS.refuse[1]!.freq,
    );

    expect(isSoftRefuseError(ACTION_ERROR.stationBusy)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.notEnoughEnergy)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.travelAlreadyHere)).toBe(true);
    // PL21.2 — required-tool refuses also play soft refuse (mute ok)
    expect(isSoftRefuseError(ACTION_ERROR.needHammer)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.needHammerBroken)).toBe(true);
    // PL54.1–PL54.3 — too-far / coins / materials also soft-refuse
    expect(isSoftRefuseError(ACTION_ERROR.tooFar)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.notEnoughCoins)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.missingMaterials)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.notEnoughItems)).toBe(true);
    // PL58.2–PL58.3 — crop-not-ready / plot-occupied also soft-refuse
    expect(isSoftRefuseError(ACTION_ERROR.cropNotReady)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.plotNotEmpty)).toBe(true);
    // PL60.2 — ore cooldown also soft-refuse
    expect(isSoftRefuseError(ACTION_ERROR.oreNodeCooldown)).toBe(true);
    // PL63.1–PL63.4 — gather / hunt cooldown soft-refuse leftovers
    expect(isSoftRefuseError(ACTION_ERROR.woodStumpCooldown)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.fishingDockCooldown)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.animalPenCooldown)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.huntCooldown)).toBe(true);
    // PL64.2 — missing seed also soft-refuse
    expect(isSoftRefuseError(ACTION_ERROR.missingSeed)).toBe(true);

    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    expect(audio.playSfx("refuse")).toBe(true);
    expect(played).toEqual([SFX_PRESETS.refuse]);
    expect(sfxStepsFor("refuse")).toEqual(SFX_PRESETS.refuse);
  });

  it("keeps soft gain and only gates common refuse messages (edge)", () => {
    for (const step of SFX_PRESETS.refuse) {
      expect(step.gain).toBeLessThanOrEqual(0.1);
      expect(step.durationSec).toBeLessThanOrEqual(0.15);
    }
    // Success-path ids still resolve — refuse does not overwrite them
    expect(shouldPlaySfx(false, "craft")).toBe(true);
    expect(shouldPlaySfx(false, "gather")).toBe(true);
    expect(shouldPlaySfx(false, "travel")).toBe(true);
  });

  it("stays silent on mute, unknown, or non-common errors (failure)", () => {
    expect(isSoftRefuseError(null)).toBe(false);
    expect(isSoftRefuseError(undefined)).toBe(false);
    expect(isSoftRefuseError("")).toBe(false);
    expect(isSoftRefuseError(ACTION_ERROR.decorAlreadyPlaced)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.questNotReady)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.questLocked)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.questAlreadyClaimed)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.vendorWontBuy)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.vendorWontSell)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.claimNeedGuild)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.claimHeldByOther)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.claimNothingStored)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.claimWarAlreadyOpen)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.claimWarNeedMats)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.claimWarNotOpen)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.marketOwnListing)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.marketExpired)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.mailSelf)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.mailInboxFull)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.travelInProgress(7))).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.tradeSelf)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.tradeEmpty)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.tradePlayerMissing)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.tradeNotFound)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.tradeNotYours)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.tradeOnlyRecipient)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.tradeYouBroke)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.tradeSenderBroke)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.tradeYouMissingItems)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.tradeSenderMissingItems)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.mailEmpty)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.mailPlayerMissing)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.mailAlreadyClaimed)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.marketNotFound)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.marketNotYours)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.guildInviteInvalid)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.guildNameInvalid)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.mailNotFound)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.mailOnlyRecipient)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.mailOnlySender)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.marketNeedFee(12))).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.marketNotStackable)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.guildBankFull)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.guildBankEmpty)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.guildRankForbidden)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.guildInviteForbidden)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.guildAlreadyIn)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.guildNotIn)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.guildExists)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.claimWarNeedGuild)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.buildPlayerLandOnly)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.alreadyUpgraded)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.cannotUpgradeBuilding)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.needCoinsTravel(15))).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.cropMissing)).toBe(true);

    const { player, played } = mockPlayer();
    const audio = createGameAudio(player);
    audio.setMuted(true);
    expect(shouldPlaySfx(true, "refuse")).toBe(false);
    expect(audio.playSfx("refuse")).toBe(false);
    expect(audio.playSfx("refuse_boom")).toBe(false);
    expect(played).toHaveLength(0);
    expect(sfxStepsFor("refuse_boom")).toEqual([]);
  });
});
