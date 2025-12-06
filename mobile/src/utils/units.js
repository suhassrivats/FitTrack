import AsyncStorage from '@react-native-async-storage/async-storage';

// Get current unit system
export const getUnitSystem = async () => {
  try {
    const unitSystem = await AsyncStorage.getItem('unitSystem');
    return unitSystem || 'metric'; // Default to metric
  } catch (error) {
    console.error('Error getting unit system:', error);
    return 'metric';
  }
};

// Weight conversion (kg <-> lbs)
export const convertWeight = (kg, toSystem) => {
  if (toSystem === 'imperial') {
    return Math.round(kg * 2.20462 * 10) / 10; // kg to lbs
  }
  return kg;
};

export const formatWeight = async (kg) => {
  const system = await getUnitSystem();
  const value = convertWeight(kg, system);
  const unit = system === 'imperial' ? 'lbs' : 'kg';
  return `${value} ${unit}`;
};

// Height conversion (cm <-> feet & inches)
export const convertHeight = (cm, toSystem) => {
  if (toSystem === 'imperial') {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return { feet, inches };
  }
  return cm;
};

export const formatHeight = async (cm) => {
  const system = await getUnitSystem();
  if (system === 'imperial') {
    const { feet, inches } = convertHeight(cm, system);
    return `${feet}' ${inches}"`;
  }
  return `${cm} cm`;
};

// Get weight unit label
export const getWeightUnit = async () => {
  const system = await getUnitSystem();
  return system === 'imperial' ? 'lbs' : 'kg';
};

// Convert input value back to metric for database storage
export const parseWeightInput = async (value) => {
  const system = await getUnitSystem();
  const numValue = parseFloat(value);
  
  if (isNaN(numValue)) return 0;
  
  if (system === 'imperial') {
    return numValue / 2.20462; // lbs to kg
  }
  return numValue;
};

