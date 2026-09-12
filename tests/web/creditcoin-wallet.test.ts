import { describe, expect, it } from "vitest";
import {
  pickEthereumProvider,
  type EthereumProvider,
} from "../../apps/web/lib/creditcoin-wallet";

function stubProvider(
  flags: Partial<EthereumProvider> = {},
): EthereumProvider {
  return {
    request: async () => null,
    ...flags,
  };
}

describe("pickEthereumProvider", () => {
  it("prefers MetaMask over Brave when both inject (happy)", () => {
    const metamask = stubProvider({ isMetaMask: true });
    const brave = stubProvider({ isMetaMask: true, isBraveWallet: true });
    const root = stubProvider({
      isBraveWallet: true,
      isMetaMask: true,
      providers: [brave, metamask],
    });
    expect(pickEthereumProvider(root)).toBe(metamask);
  });

  it("uses a lone Brave provider when MetaMask is absent (edge)", () => {
    const brave = stubProvider({ isMetaMask: true, isBraveWallet: true });
    expect(pickEthereumProvider(brave)).toBe(brave);
  });

  it("does not pick Brave when it claims isMetaMask (failure)", () => {
    const brave = stubProvider({ isMetaMask: true, isBraveWallet: true });
    const metamask = stubProvider({ isMetaMask: true, isBraveWallet: false });
    const root = stubProvider({ providers: [brave, metamask] });
    expect(pickEthereumProvider(root)).not.toBe(brave);
    expect(pickEthereumProvider(root)).toBe(metamask);
  });
});
