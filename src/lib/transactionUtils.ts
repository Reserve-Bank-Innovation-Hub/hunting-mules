// Helper function to generate random transaction amount
export const generateRandomAmount = () => {
    const randomAmount = Math.floor(Math.random() * (100000 - 1000 + 1)) + 1000; // Random between 1000 and 100000
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