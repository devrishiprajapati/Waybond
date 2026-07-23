/**
 * Utility for haptic feedback using the Web Vibration API.
 * Supports different intensities and patterns.
 */

export const haptics = {
  /**
   * Short, subtle vibration for light interactions (e.g., button clicks)
   */
  light: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(20);
    }
  },

  /**
   * Medium vibration for more significant actions
   */
  medium: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(40);
    }
  },

  /**
   * Strong vibration for heavy interactions
   */
  heavy: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(80);
    }
  },

  /**
   * Success pattern: two short pulses
   */
  success: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([20, 30, 20]);
    }
  },

  /**
   * Error pattern: one long pulse or multiple short ones
   */
  error: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([80, 50, 80]);
    }
  },

  /**
   * Custom vibration pattern
   * @param pattern Vibration pattern in ms (single value or array)
   */
  vibrate: (pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }
};
