import fs from "node:fs";
import { describe, expect, it } from "vitest";
import path from "node:path";

/**
 * Quest log is a tracker — Claim lives on the NPC walk-up panel.
 */
describe("quest board cannot claim", () => {
  it("QuestPanel has no Claim button (happy)", () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), "apps/web/components/hud/QuestPanel.tsx"),
      "utf8",
    );
    expect(src).toContain("Talk to");
    expect(src).toContain("not from this log");
    expect(src).not.toMatch(/onClaim/);
    expect(src).not.toMatch(/>\s*Claim\s*</);
  });

  it("board API still exists but refuses claim (edge)", () => {
    const api = fs.readFileSync(
      path.join(process.cwd(), "apps/web/lib/api.ts"),
      "utf8",
    );
    expect(api).toContain("apiClaimQuest");
    const server = fs.readFileSync(
      path.join(process.cwd(), "apps/server/src/game/quests.ts"),
      "utf8",
    );
    expect(server).toContain("questClaimAtNpc");
  });

  it("NPC talk box still claims at the NPC, not as a dump window (failure)", () => {
    const panel = fs.readFileSync(
      path.join(process.cwd(), "apps/web/components/hud/TutorialNpcPanel.tsx"),
      "utf8",
    );
    const dialogue = fs.readFileSync(
      path.join(process.cwd(), "apps/web/lib/hud/tutorial-npc-dialogue.ts"),
      "utf8",
    );
    expect(dialogue).toContain("I'll find the Farmer");
    expect(panel).toContain("onClaim");
    expect(panel).toContain("tutorialNpcDialogueLines");
    expect(panel).not.toMatch(/Basics/);
    expect(panel).not.toMatch(/Tools needed/);
  });
});
