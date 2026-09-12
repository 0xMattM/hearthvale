import type { ReactNode } from "react";

export interface CreditcoinContractAddrs {
  realmToken?: string | null;
  landNft?: string | null;
  marketplace?: string | null;
}

/**
 * Opens a block explorer URL in a new tab.
 *
 * @param url - Absolute explorer URL.
 */
export function openCreditcoinExplorer(url: string): void {
  window.open(url, "_blank", "noopener");
}

/**
 * Status pill class for swap / listing rows.
 *
 * @param status - Server status string (minted, notarized, …).
 * @returns Combined status class names.
 */
export function creditcoinStatusClass(status: string): string {
  return `creditcoin-panel__status creditcoin-panel__status--${status}`;
}

/**
 * Labeled section inside the Creditcoin desk or REALM stall.
 *
 * @param props - Section copy and body.
 * @returns Section element.
 */
export function CreditcoinSection({
  label,
  hint,
  children,
  sectionId,
  emphasized = false,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  sectionId?: string;
  emphasized?: boolean;
}) {
  return (
    <section
      id={sectionId}
      data-testid={sectionId}
      className={`creditcoin-panel__section${
        emphasized ? " creditcoin-panel__section--focus" : ""
      }`}
    >
      <h4 className="creditcoin-panel__section-label">{label}</h4>
      {hint ? <p className="creditcoin-panel__hint">{hint}</p> : null}
      {children}
    </section>
  );
}
