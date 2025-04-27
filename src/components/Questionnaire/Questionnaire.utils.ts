import { COUNTRIES_DATA, REGIONS } from './Questionnaire.data';
import type { Country } from './Questionnaire.types';

export const getAllCountries = (): Country[] => {
  return Object.values(COUNTRIES_DATA).flat();
};

export const getCountriesForRegion = (region: keyof typeof REGIONS): Country[] => {
  return COUNTRIES_DATA[region];
}; 