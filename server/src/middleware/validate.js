/**
 * Middleware helpers for request validation.
 */

/**
 * Returns true if the value is a finite integer (not a float, not NaN, not Infinity).
 */
function isPositiveInteger(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0;
}

module.exports = { isPositiveInteger };
