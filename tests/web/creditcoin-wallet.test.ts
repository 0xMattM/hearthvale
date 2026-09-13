import { describe, expect, it } from "vitest";
import {
  pickEthereumProvider,
  requestWalletLinkSignature,
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

describe("requestWalletLinkSignature", () => {
  it("signs with an already-permitted account (happy)", async () => {
    const methods: string[] = [];
    const eth = stubProvider({
      request: async ({ method, params }) => {
        methods.push(method);
        if (method === "eth_accounts") return ["0xabc"];
        if (method === "personal_sign") {
          expect(params).toEqual(["Creditcoin Realm link", "0xabc"]);
          return "0xsig";
        }
        throw new Error(`unexpected ${method}`);
      },
    });
    await expect(requestWalletLinkSignature(eth, "Creditcoin Realm link")).resolves.toEqual({
      address: "0xabc",
      signature: "0xsig",
    });
    expect(methods).toEqual(["eth_accounts", "personal_sign"]);
  });

  it("requests accounts when none are permitted (edge)", async () => {
    const methods: string[] = [];
    const eth = stubProvider({
      request: async ({ method }) => {
        methods.push(method);
        if (method === "eth_accounts") return [];
        if (method === "eth_requestAccounts") return ["0xdef"];
        if (method === "personal_sign") return "0xsig2";
        throw new Error(`unexpected ${method}`);
      },
    });
    await expect(requestWalletLinkSignature(eth, "msg")).resolves.toEqual({
      address: "0xdef",
      signature: "0xsig2",
    });
    expect(methods).toEqual([
      "eth_accounts",
      "eth_requestAccounts",
      "personal_sign",
    ]);
  });

  it("never switches or adds a chain (failure)", async () => {
    const eth = stubProvider({
      request: async ({ method }) => {
        if (method.startsWith("wallet_")) {
          throw new Error(`blocked ${method}`);
        }
        if (method === "eth_accounts") return [];
        if (method === "eth_requestAccounts") return [];
        return null;
      },
    });
    await expect(requestWalletLinkSignature(eth, "msg")).rejects.toThrow(
      /No wallet account selected/,
    );
  });
});
