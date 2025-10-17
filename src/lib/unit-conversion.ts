
const KG_TO_LB = 2.20462;
const IN_TO_CM = 2.54;
const FT_TO_IN = 12;


type WeightUnit = 'kg' | 'lb';
type HeightUnit = 'cm' | 'ft_in';

/**
 * Converts a weight value from a source unit to a target unit.
 * @param value The numerical weight value to convert.
 * @param fromUnit The unit of the provided value ('kg' or 'lb').
 * @param toUnit The unit to convert to ('kg' or 'lb').
 * @returns The converted weight value.
 */
export const convertWeight = (value: number, fromUnit: WeightUnit, toUnit: WeightUnit): number => {
  if (fromUnit === toUnit || !value) {
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
 * Converts a height value from centimeters to feet and inches.
 * @param cm The height in centimeters.
 * @returns An object with feet and inches.
 */
export const convertCmToFtIn = (cm: number): { feet: number, inches: number } => {
    if (!cm) return { feet: 0, inches: 0 };
    const totalInches = cm / IN_TO_CM;
    const feet = Math.floor(totalInches / FT_TO_IN);
    const inches = Math.round(totalInches % FT_TO_IN);
    return { feet, inches };
};

/**
 * Converts a height value from feet and inches to centimeters.
 * @param feet The feet part of the height.
 * @param inches The inches part of the height.
 * @returns The height in centimeters.
 */
export const convertFtInToCm = (feet: number, inches: number): number => {
    const totalInches = (feet || 0) * FT_TO_IN + (inches || 0);
    return totalInches * IN_TO_CM;
}


/**
 * Rounds a number to a specified number of decimal places.
 * @param value The number to round.
 * @returns The rounded number.
 */
export const roundToTwo = (value: number): number => {
  if (isNaN(value)) return 0;
  return Math.round((value + Number.EPSILON) * 100) / 100;
};
