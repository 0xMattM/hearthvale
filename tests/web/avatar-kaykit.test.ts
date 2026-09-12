import { describe, expect, it } from "vitest";
import {
  KAYKIT_AVATAR_CLIPS,
  KAYKIT_AVATAR_SPECS,
  kaykitAvatarPreloadUrls,
  kaykitAvatarUrl,
} from "../../apps/web/lib/avatar-kaykit";

describe("avatar kaykit (chessnoth pipeline)", () => {
  it("points local and remote at distinct KayKit GLBs (happy)", () => {
    expect(kaykitAvatarUrl("local")).toBe("/models/kaykit/Rogue_Hooded.glb");
    expect(kaykitAvatarUrl("remote")).toBe("/models/kaykit/Rogue.glb");
    expect(KAYKIT_AVATAR_SPECS.local.scale).toBeGreaterThan(0.45);
  });

  it("preloads both peer models (edge)", () => {
    const urls = kaykitAvatarPreloadUrls();
    expect(urls).toContain("/models/kaykit/Rogue.glb");
    expect(urls).toContain("/models/kaykit/Rogue_Hooded.glb");
  });

  it("uses KayKit walk clips (failure if renamed)", () => {
    expect(KAYKIT_AVATAR_CLIPS.idle).toBe("Idle");
    expect(KAYKIT_AVATAR_CLIPS.walk).toBe("Walking_A");
  });
});
