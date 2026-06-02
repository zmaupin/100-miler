// Thin namespaced wrapper around localStorage. JSON in/out, fails soft (private
// mode, quota, SSR) so the app never throws on a storage hiccup.

const PREFIX = '100m:'

export const storage = {
  get(key) {
    try {
      const v = localStorage.getItem(PREFIX + key)
      return v == null ? null : JSON.parse(v)
    } catch {
      return null
    }
  },
  set(key, val) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(val))
    } catch {
      /* ignore */
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(PREFIX + key)
    } catch {
      /* ignore */
    }
  },
}
