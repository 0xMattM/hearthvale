import { describe, expect, it } from "vitest";
import { mergeRemotePresence } from "../../apps/web/lib/remotePresence";

describe("remote presence render F8.2", () => {
  it("keeps unique usernames (happy)", () => {
    const merged = mergeRemotePresence([
      { username: "bob", x: 1, z: 2 },
      { username: "cara", x: 3, z: 4 },
    ]);
    expect(merged).toHaveLength(2);
  });

  it("last position wins on duplicate username (edge)", () => {
    const merged = mergeRemotePresence([
      { username: "bob", x: 1, z: 1 },
      { username: "bob", x: 5, z: 5 },
    ]);
    expect(merged).toHaveLength(1);
    expect(merged[0].x).toBe(5);
  });

  it("drops empty usernames (failure)", () => {
    expect(mergeRemotePresence([{ username: "", x: 0, z: 0 }])).toHaveLength(0);
  });
});
