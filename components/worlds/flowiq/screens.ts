/**
 * The four things the user app does, in the order of the project's own
 * pipeline (citizen app, maps and directions, challans, payment). Pure data.
 * The wording stays inside what the project's entry says: it names the
 * screens and what they are built on, and nothing about how they look.
 */
export const SCREENS = [
  {
    key: "signin",
    label: "Sign in",
    caption: "The Flutter user app. Sign-in and the app's data run on Supabase.",
  },
  {
    key: "route",
    label: "Route",
    caption: "Routing, built on the Google Maps and Directions integration.",
  },
  {
    key: "challan",
    label: "Challan",
    caption: "The challan view. A challan is a traffic fine.",
  },
  {
    key: "payment",
    label: "Payment",
    caption: "The payment screens, where a challan is paid.",
  },
] as const;

export type ScreenKey = (typeof SCREENS)[number]["key"];

/** Where the cards on the challan sketch sit: the top edge of each, in the sketch's own units. */
export const CHALLAN_CARDS = [58, 138, 218];
