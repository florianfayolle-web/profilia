// Single source for the subscription price shown on the site and charged at
// checkout (single tests read tests.price_cents). Change it here only.
export const SUBSCRIPTION_PRICE_CENTS = 999;
export const SUBSCRIPTION_PRICE_LABEL = "9,99";

// One-off unlock of a guest result (express test): same price as a single
// test report so the site shows one per-test price everywhere.
export const GUEST_UNLOCK_PRICE_CENTS = 199;

// Pack: two reports in one payment, for a logged-in buyer, when both tests
// cost the standard per-test price (the second one is then 1 EUR).
export const PACK_PRICE_CENTS = 299;
export const PACK_BASE_PRICE_CENTS = 199;
