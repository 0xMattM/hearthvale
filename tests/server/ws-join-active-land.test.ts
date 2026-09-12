import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const attachSrc = fs.readFileSync(
  path.join(process.cwd(), "apps/server/src/ws/attach.ts"),
  "utf8",
);

describe("ws join land SEC-6", () => {
  it("joins the server active land (happy)", () => {
    expect(attachSrc).toContain("activeLandIdForUser(meta.userId)");
  });

  it("still requires auth before join (edge)", () => {
    expect(attachSrc).toContain("Auth first");
  });

  it("does not join the client-supplied landId (failure)", () => {
    expect(attachSrc).not.toContain("joinLand(socket, msg.landId)");
  });
});
