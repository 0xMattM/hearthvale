import { describe, expect, it } from "vitest";
import {
  VILLAGER_AVATAR_SPECS,
  villagerAvatarPreloadUrls,
  villagerAvatarUrl,
} from "../../apps/web/lib/avatar-villager";

describe("avatar villager NPC", () => {
  it("maps every player to Hunter and tutors to Blacksmith (happy)", () => {
    expect(villagerAvatarUrl("local")).toBe("/models/villager/Hunter.fbx");
    expect(villagerAvatarUrl("remote")).toBe("/models/villager/Hunter.fbx");
    expect(villagerAvatarUrl("tutor")).toBe("/models/villager/Blacksmith.fbx");
    expect(VILLAGER_AVATAR_SPECS.local.file).toBe("Hunter.fbx");
  });

  it("preloads player and tutor models (edge)", () => {
    const urls = villagerAvatarPreloadUrls();
    expect(urls).toContain("/models/villager/Hunter.fbx");
    expect(urls).toContain("/models/villager/Blacksmith.fbx");
  });

  it("keeps feet near ground via yOffset (failure if unset)", () => {
    expect(VILLAGER_AVATAR_SPECS.local.yOffset).toBe(0);
    expect(VILLAGER_AVATAR_SPECS.remote.yOffset).toBe(0);
    expect(VILLAGER_AVATAR_SPECS.tutor.yOffset).toBe(0);
    expect(VILLAGER_AVATAR_SPECS.remote.file).not.toBe("Blacksmith.fbx");
  });
});
