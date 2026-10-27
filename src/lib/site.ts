import { CONTACT_EMAIL } from "./legal";

/** The author, as the "Sobre mí" page presents him. Public information from his portfolio. */
export const AUTHOR = {
  name: "Dimas Javier Rodríguez Cabrera",
  shortName: "Dimas Rodríguez",
  role: "Ingeniero en Sistemas y desarrollador full stack",
  place: "Tegucigalpa, Honduras",
  links: [
    { label: "Portfolio", href: "https://portfolio.dimasjavier-0.workers.dev/" },
    { label: "GitHub", href: "https://github.com/dimasjavier0" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/dimas-javier-rodriguez-ba582b187/" },
  ],
} as const;

/** PayPal account that receives donations. */
export const DONATION_PAYPAL_EMAIL = CONTACT_EMAIL;

/** PayPal's donation page for that account: the donor picks the amount and pays on PayPal. */
export const DONATION_URL = `https://www.paypal.com/donate/?${new URLSearchParams({
  business: DONATION_PAYPAL_EMAIL,
  item_name: "Apoyo a LexFlow English",
  currency_code: "USD",
  no_recurring: "0",
}).toString()}`;

const ANDROID_APP_KEY = "lexflow.androidApp";

/**
 * Whether the page runs inside the Google Play app (a Trusted Web Activity). Chrome opens it with
 * an android-app:// referrer on the first load; the session remembers it for later navigations.
 * Google Play's payments policy does not allow donations to individuals through outside payment
 * systems, so the app hides them; the website keeps them.
 */
export function isAndroidApp(): boolean {
  const fromApp = document.referrer.startsWith("android-app://");
  try {
    if (fromApp) sessionStorage.setItem(ANDROID_APP_KEY, "1");
    return fromApp || sessionStorage.getItem(ANDROID_APP_KEY) === "1";
  } catch {
    return fromApp;
  }
}
