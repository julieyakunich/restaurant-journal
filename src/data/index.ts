/**
 * Public entry point for the data layer. Components should import from here
 * (`import { getRestaurants } from '../data'`) rather than reaching into
 * individual service files, so the internal structure can change freely.
 */

export * from './types';
export * from './allergens';
export * from './matching';

export * as restaurantService from './restaurantService';
export * as profileService from './profileService';
export * as tripService from './tripService';
export * as allergyCardService from './allergyCardService';

// Also re-export the individual functions for convenience.
export {
  getRestaurants,
  getRestaurantById,
  getRestaurantsByIds,
  getRestaurantsWithSafeSnacks,
  getCities,
  addReview,
} from './restaurantService';
export {
  getUserProfile,
  saveUserProfile,
  setTriggers,
  setMcasMode,
  emptyProfile,
} from './profileService';
export {
  getDestinations,
  getTrips,
  getTripById,
  getActiveTrip,
  saveTrip,
  addRestaurantToTrip,
  removeRestaurantFromTrip,
  deleteTrip,
} from './tripService';
export { generateAllergyCard, getCardLanguages } from './allergyCardService';
