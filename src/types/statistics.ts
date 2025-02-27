/**
 * Type definition for statistics computed from AirBnB listings
 *
 * @typedef {Object} Statistics
 * @property {number} count - Total number of listings in the filtered set
 * @property {Object} averagePricePerRoom - Average price for each room type
 * @property {number} averagePricePerRoom[roomType] - Average price for a specific room type
 * @property {number} averagePrice - Average price across all room types
 * @property {number} averageReviews - Average number of reviews per listing
 * @property {number} averageReviewsLtm - Average number of reviews in the last 12 months
 * @property {number} averageMinimumNights - Average minimum nights required for booking
 * @property {number} averageAvailability - Average availability out of 365 days
 * @property {number} averageReviewsPerMonth - Average reviews per month (non-null values only)
 * @property {number} averageHostListingsCount - Average number of listings per host
 * @property {number} medianPrice - Median price of all listings
 * @property {number} minPrice - Minimum price among listings
 * @property {number} maxPrice - Maximum price among listings
 */
export type Statistics = {
  count: number;
  averagePricePerRoom: Record<string, number>;
  averagePrice: number;
  averageReviews: number;
  averageReviewsLtm: number;
  averageMinimumNights: number;
  averageAvailability: number;
  averageReviewsPerMonth: number;
  averageHostListingsCount: number;
  medianPrice: number;
  minPrice: number;
  maxPrice: number;
};
