const KG_TO_LB = 2.20462;

type WeightUnit = 'kg' | 'lb';

/**
 * Converts a weight value from a source unit to a target unit.
 * @param value The numerical weight value to convert.
 * @param fromUnit The unit of the provided value ('kg' or 'lb').
 * @param toUnit The unit to convert to ('kg' or 'lb').
 * @returns The converted weight value.
 */
export const convertWeight = (value: number, fromUnit: WeightUnit, toUnit: WeightUnit): number => {
  if (fromUnit === toUnit) {
    return value;
  }
  if (fromUnit === 'kg' && toUnit === 'lb') {
    return value * KG_TO_LB;
  }
  if (fromUnit === 'lb' && toUnit === 'kg') {
    return value / KG_TO_LB;
  }
  // Should not happen with defined types
  return value;
};

/**
 * Rounds a number to a specified number of decimal places.
 * @param value The number to round.
 * @param decimalPlaces The number of decimal places to keep. Defaults to 2.
 * @returns The rounded number.
 */
export const roundToTwo = (value: number): number => {
  return Math.round((value + Number.EPSILON) * 100) / 100;
};
