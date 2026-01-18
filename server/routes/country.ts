import { Router, Request, Response } from "express";

const router = Router();

// Exchange rates for all supported countries (USD base)
const EXCHANGE_RATES: Record<string, number> = {
  IN: 83.5, // India
  US: 1, // United States
  GB: 0.79, // United Kingdom
  CA: 1.36, // Canada
  AU: 1.53, // Australia
  NZ: 1.64, // New Zealand
  SG: 1.35, // Singapore
  AE: 3.67, // UAE
  DEFAULT: 1,
};

// Currency mapping for countries
const CURRENCY_MAP: Record<string, string> = {
  IN: "inr",
  US: "usd",
  GB: "gbp",
  CA: "cad",
  AU: "aud",
  NZ: "nzd",
  SG: "sgd",
  AE: "aed",
};

// Currency symbols
const CURRENCY_SYMBOLS: Record<string, string> = {
  usd: "$",
  inr: "₹",
  gbp: "£",
  cad: "C$",
  aud: "A$",
  nzd: "NZ$",
  sgd: "S$",
  aed: "AED",
};

// Country names
const COUNTRY_NAMES: Record<string, string> = {
  IN: "India",
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
  NZ: "New Zealand",
  SG: "Singapore",
  AE: "United Arab Emirates",
};

/**
 * Detect user's country based on request headers (Cloudflare, Replit, etc.)
 */
function detectCountryFromHeaders(req: Request): string {
  // Cloudflare headers
  if (req.headers["cf-ipcountry"]) {
    return (req.headers["cf-ipcountry"] as string).toUpperCase();
  }

  // Replit headers
  if (req.headers["x-forwarded-for"]) {
    // This is just the IP, we'd need an external service
    // For now, return default
  }

  // Default to US
  return "US";
}

/**
 * GET /api/country/detect
 * Detect user's country and return pricing info
 */
router.get("/detect", (req: Request, res: Response) => {
  try {
    const countryCode = detectCountryFromHeaders(req);
    const currency = CURRENCY_MAP[countryCode] || "usd";
    const currencySymbol = CURRENCY_SYMBOLS[currency] || "$";
    const countryName = COUNTRY_NAMES[countryCode] || "United States";
    const exchangeRate = EXCHANGE_RATES[countryCode] || 1;

    res.json({
      countryCode,
      countryName,
      currency,
      currencySymbol,
      exchangeRate,
      paymentProvider: "stripe", // All payments go through Stripe now
    });
  } catch (error) {
    console.error("Error detecting country:", error);
    res.status(500).json({
      error: "Failed to detect country",
      countryCode: "US",
      countryName: "United States",
      currency: "usd",
      currencySymbol: "$",
      exchangeRate: 1,
      paymentProvider: "stripe",
    });
  }
});

/**
 * GET /api/country/rates
 * Get all exchange rates for mobile app
 */
router.get("/rates", (req: Request, res: Response) => {
  res.json({
    baseUrl: "USD",
    rates: EXCHANGE_RATES,
    currencies: CURRENCY_MAP,
    symbols: CURRENCY_SYMBOLS,
    countries: COUNTRY_NAMES,
  });
});

export default router;
