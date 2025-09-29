export const getGridConfig = () => {
    const isMobile = window.innerWidth < 768;
    return {
        CIRCLE_SIZE            : isMobile ? 32 : 40,
        MIN_SPACING            : isMobile ? 32 : 15,  // Minimum spacing, will scale up proportionally
        PADDING                : isMobile ? 32 : 50,
        MAX_CELLS              : 100,                  // Maximum total cells
        TARGET_MULE_PERCENTAGE : 0.25,      // 25% of cells should be mules
    };
};

export const MULE_ACCOUNTS = 25;

export const TRANSACTION_CONFIG = {
    STARTING_AMOUNT         : 10000000,  // ₹1,00,00,000
    TRANSACTIONS_PER_SECOND : 2,         // Number of new transactions per second
    SCALE_TIME_MS           : 500,       // Time to scale up/down in milliseconds
    TRANSACTION_TIME_MS     : 2000,      // Time to fly between nodes in milliseconds
    MAX_CONCURRENT          : 10,        // Maximum concurrent transactions for performance
};