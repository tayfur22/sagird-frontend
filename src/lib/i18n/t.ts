import { defaultLocale } from "./config";
import { getDictionary } from "./get-dictionary";

/**
 * The active dictionary. Only Azerbaijani ships today; when `en`/`ru`
 * dictionaries are added, this is the single place to make locale-aware.
 */
export const t = getDictionary(defaultLocale);
