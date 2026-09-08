// Format an amount the Indian way
export const formatAmount = (amount : number) => {
    return `₹${amount.toLocaleString("en-IN")}`;
};
/**
 * A balance, shortened for the chip under an account.
 *
 * Small balances stay exact, because "a few hundred rupees" is the whole tell of the
 * low-balance pattern and ₹400 has to read as ₹400. Larger ones collapse to lakhs and
 * crores, which keeps every chip about the same narrow width — they sit under
 * accounts a fixed distance apart, and a chip is meant to be read at a glance from
 * across a kiosk, not counted digit by digit.
 *
 * Transaction amounts are deliberately not shortened: the player is comparing the
 * sum arriving against the sum leaving, and that comparison needs the real figures.
 * See amountLabel below for the one place that has to give way.
 */
export const formatBalance = (amount : number) => {
    if (amount < 10000) {
        return `₹${amount.toLocaleString("en-IN")}`;
    }

    if (amount < 100000) {
        // Floored, so a balance a whisker under a lakh reads as ₹99K rather than
        // rounding up to a ₹100K that never appears anywhere else
        return `₹${Math.floor(amount / 1000)}K`;
    }

    if (amount < 10000000) {
        const lakhs = amount / 100000;
        return `₹${lakhs.toFixed(lakhs < 10 ? 1 : 0)}L`;
    }

    return `₹${(amount / 10000000).toFixed(1)}Cr`;
};

/**
 * The figure on a payment crossing the board.
 *
 * The kiosk shows it in full, for the reason above — the player is comparing what
 * went in against what came out.
 *
 * A phone cannot. `₹1,33,570` is about half the width of the screen and sits on a
 * 34px account, so the capsule hides the very board it is crossing. There it
 * collapses to `₹1.3L`: enough to compare two sums at a glance, and small enough
 * that the pattern underneath is still visible. Decided once when the payment is
 * created rather than per card, so a busy board is not running a media query
 * forty times a second.
 */
export const amountLabel = (amount : number) =>
    (typeof window !== "undefined" && window.innerWidth < 768)
        ? formatBalance(amount)
        : formatAmount(amount);
