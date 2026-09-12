import { describe, expect, it } from "vitest";
import { applyEnvText } from "../../apps/server/src/load-env";

describe("server .env loader", () => {
  it("sets missing keys from text (happy)", () => {
    delete process.env.GAME_CREDITCOIN_MODE_TEST_A;
    applyEnvText("GAME_CREDITCOIN_MODE_TEST_A=local_dev\n");
    expect(process.env.GAME_CREDITCOIN_MODE_TEST_A).toBe("local_dev");
    delete process.env.GAME_CREDITCOIN_MODE_TEST_A;
  });

  it("keeps quoted values without the quotes (edge)", () => {
    delete process.env.GAME_CREDITCOIN_MODE_TEST_B;
    applyEnvText('GAME_CREDITCOIN_MODE_TEST_B="attestcoin"\n');
    expect(process.env.GAME_CREDITCOIN_MODE_TEST_B).toBe("attestcoin");
    delete process.env.GAME_CREDITCOIN_MODE_TEST_B;
  });

  it("does not overwrite an existing process env (failure)", () => {
    process.env.GAME_CREDITCOIN_MODE_TEST_C = "keep";
    applyEnvText("GAME_CREDITCOIN_MODE_TEST_C=replace\n");
    expect(process.env.GAME_CREDITCOIN_MODE_TEST_C).toBe("keep");
    delete process.env.GAME_CREDITCOIN_MODE_TEST_C;
  });
});
