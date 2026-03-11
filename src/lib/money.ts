import Decimal from 'decimal.js';

// Configure decimal.js for strict financial rounding
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

/**
 * Standardizes any number/string input to a strict Decimal instance
 */
export const toMoney = (amount: number | string | Decimal): Decimal => {
  return new Decimal(amount);
};

/**
 * Adds two monetary amounts together with 100% accuracy
 */
export const addMoney = (a: number | string | Decimal, b: number | string | Decimal): string => {
  return toMoney(a).plus(toMoney(b)).toFixed(2);
};

/**
 * Subtracts two monetary amounts with 100% accuracy (a - b)
 */
export const subtractMoney = (a: number | string | Decimal, b: number | string | Decimal): string => {
  return toMoney(a).minus(toMoney(b)).toFixed(2);
};

/**
 * Multiplies money by a multiplier (e.g., for percentage operations)
 */
export const multiplyMoney = (amount: number | string | Decimal, multiplier: number | string | Decimal): string => {
  return toMoney(amount).times(toMoney(multiplier)).toFixed(2);
};

/**
 * Formats money into a human readable format (e.g. $10.00)
 */
export const formatMoney = (amount: number | string | Decimal, symbol: string = '$'): string => {
  return `${symbol}${toMoney(amount).toFixed(2)}`;
};

/**
 * Checks if amount A is exactly equal to amount B
 */
export const isMoneyEqual = (a: number | string | Decimal, b: number | string | Decimal): boolean => {
  return toMoney(a).equals(toMoney(b));
};

/**
 * Checks if amount A is greater than amount B
 */
export const isMoneyGreaterThan = (a: number | string | Decimal, b: number | string | Decimal): boolean => {
  return toMoney(a).greaterThan(toMoney(b));
};

/**
 * Checks if amount A is less than amount B
 */
export const isMoneyLessThan = (a: number | string | Decimal, b: number | string | Decimal): boolean => {
  return toMoney(a).lessThan(toMoney(b));
};
