
const KG_TO_LB = 2.20462;
const CM_TO_IN = 0.393701;
const FT_TO_CM = 30.48;

/**
 * Converts a weight value from a source unit to a target unit.
 * @param value The numerical weight value to convert.
 * @param fromUnit The unit of the provided value ('kg' or 'lb').
 * @param toUnit The unit to convert to ('kg' or 'lb').
 * @returns The converted weight value.
 */
export const convertWeight = (value: number, fromUnit: 'kg' | 'lb', toUnit: 'kg' | 'lb'): number => {
  if (fromUnit === toUnit || !value) {
    return value;
  }
  if (fromUnit === 'kg' && toUnit === 'lb') {
    return value * KG_TO_LB;
  }
  if (fromUnit === 'lb' && toUnit === 'kg') {
    return value / KG_TO_LB;
  }
  return value;
};

/**
 * Converts a height value from centimeters to feet and inches.
 * @param cm The height in centimeters.
 * @returns An object with feet and inches.
 */
export const convertCmToFtIn = (cm: number): { feet: number, inches: number } => {
    if (!cm) return { feet: 0, inches: 0 };
    const totalInches = cm * CM_TO_IN;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return { feet, inches };
};

/**
 * Converts a height value from feet and inches to centimeters.
 * @param feet The feet part of the height.
 * @param inches The inches part of the height.
 * @returns The height in centimeters.
 */
export const convertFtInToCm = (feet: number, inches: number): number => {
    const totalInches = (feet || 0) * 12 + (inches || 0);
    return totalInches / CM_TO_IN;
}

/**
 * Calculates BMI from weight in kg and height in cm.
 * @param weightKg Weight in kilograms.
 * @param heightCm Height in centimeters.
 * @returns The calculated BMI, or null if inputs are invalid.
 */
export const calculateBmi = (weightKg: number, heightCm: number): number | null => {
    if (!weightKg || !heightCm || heightCm <=0) return null;
    const heightM = heightCm / 100;
    return roundToTwo(weightKg / (heightM * heightM));
}

/**
 * Calculates a "healthy" weight range based on BMI.
 * @param heightCm Height in centimeters.
 * @param healthyBmiRange The BMI range considered healthy.
 * @returns A tuple [minWeight, maxWeight] in kg.
 */
export const getHealthyWeightRange = (heightCm: number, healthyBmiRange: [number, number] = [18.5, 25]): [number, number] => {
    if (!heightCm || heightCm <= 0) return [0, 0];
    const heightM = heightCm / 100;
    const minWeight = healthyBmiRange[0] * (heightM * heightM);
    const maxWeight = healthyBmiRange[1] * (heightM * heightM);
    return [roundToTwo(minWeight), roundToTwo(maxWeight)];
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
