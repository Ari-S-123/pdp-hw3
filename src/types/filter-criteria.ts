/**
 * Type definition for filter criteria used to filter AirBnB listings
 *
 * @typedef {Object} FilterCriteria
 * @property {number} [minPrice] - Minimum price threshold for filtering listings
 * @property {number} [maxPrice] - Maximum price threshold for filtering listings
 * @property {number} [minReviews] - Minimum number of reviews threshold
 * @property {number} [maxReviews] - Maximum number of reviews threshold
 * @property {number} [minReviewsLtm] - Minimum number of reviews in last 12 months threshold
 * @property {number} [maxReviewsLtm] - Maximum number of reviews in last 12 months threshold
 * @property {string} [roomType] - Exact room type to filter by (e.g., "Entire home/apt", "Private room")
 * @property {string} [name] - Substring to match against listing names (case insensitive)
 * @property {string} [neighbourhood] - Substring to match against neighbourhood names (case insensitive)
 * @property {number} [minAvailability] - Minimum availability (in days) threshold
 * @property {number} [maxAvailability] - Maximum availability (in days) threshold
 * @property {number} [minMinimumNights] - Minimum value for the minimum_nights field
 * @property {number} [maxMinimumNights] - Maximum value for the minimum_nights field
 * @property {string} [hostName] - Substring to match against host names (case insensitive)
 */
export type FilterCriteria = {
  // Price filters
  minPrice?: number;
  maxPrice?: number;

  // Review filters
  minReviews?: number;
  maxReviews?: number;
  minReviewsLtm?: number;
  maxReviewsLtm?: number;

  // Room type filter
  roomType?: string;

  // Name filter (partial match)
  name?: string;

  // Location filters
  neighbourhood?: string;

  // Availability filters
  minAvailability?: number;
  maxAvailability?: number;

  // Minimum nights filters
  minMinimumNights?: number;
  maxMinimumNights?: number;

  // Host filters
  hostName?: string;
};
