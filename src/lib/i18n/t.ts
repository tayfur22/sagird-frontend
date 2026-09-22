import { defaultLocale, type Locale } from "./config";
import { getDictionary } from "./get-dictionary";

type Dictionary = ReturnType<typeof getDictionary>;

/** Current locale, defaulting to Azerbaijani until LocaleProvider restores a stored choice. */
let activeLocale: Locale = defaultLocale;
let activeDictionary: Dictionary = getDictionary(defaultLocale);

/**
 * Called by LocaleProvider whenever the user switches language, so that
 * plain `import { t } from "./t"` (used outside React components/hooks,
 * e.g. translate-error.ts) stays in sync with the active locale too.
 */
export function setActiveLocale(locale: Locale): void {
  activeLocale = locale;
  activeDictionary = getDictionary(locale);
}

export function getActiveLocale(): Locale {
  return activeLocale;
}

/**
 * Wraps a dictionary (or nested section of one) so every property read is
 * resolved against the *current* active dictionary instead of the one that
 * was active when the property was first accessed. This is what lets
 * `t.xxx.yyy` stay correct after `setActiveLocale` runs, even in modules
 * that captured a reference to `t` (or one of its nested objects) once at
 * import time.
 */
function reactive<T extends object>(getCurrent: () => T): T {
  return new Proxy({} as T, {
    get(_target, prop, receiver) {
         const value = Reflect.get(getCurrent(), prop, receiver);

      if (value !== null && typeof value === "object") {
        return reactive(
          () =>
            (getCurrent() as Record<PropertyKey, unknown>)[prop] as typeof value
        );
      }

      return value;
    },

    has(_target, prop) {
      return Reflect.has(getCurrent(), prop);
    },

    ownKeys(_target) {
      return Reflect.ownKeys(getCurrent());
    },

    getOwnPropertyDescriptor(_target, prop) {
      return Reflect.getOwnPropertyDescriptor(getCurrent(), prop);
    },
  });
}

/**
 * The active dictionary. Reading any property (at any depth) always
 * reflects whichever locale is currently active - components/modules can
 * keep doing `import { t } from "./t"` and read `t.foo.bar` at call time
 * without needing to re-import or subscribe to anything.
 *
 * Note: this only helps values read *at call/render time*. A module-scope
 * constant built once from `t` (e.g. `const X = { title: t.foo.title }`)
 * still freezes at import time - such cases must read `t` inside a
 * function instead.
 */
export const t: Dictionary = reactive(() => activeDictionary);