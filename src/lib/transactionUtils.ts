// Helper function to generate random transaction amount
export const generateRandomAmount = () => {
    const randomAmount = Math.floor(Math.random() * (1000000 - 1000 + 1)) + 1000; // Random between 1000 and 1000000
    return `₹${randomAmount.toLocaleString("en-IN")}`; // Format with Indian number system
};

// Helper function to parse amount from string (₹1,23,456 -> 123456)
export const parseAmount = (amountString : string) => {
    return parseInt(amountString.replace(/[₹,]/g, ""), 10);
};

// Helper function to format amount to string
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
