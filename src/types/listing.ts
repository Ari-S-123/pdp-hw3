/**
 * Type definition for an AirBnB listing
 *
 * @typedef {Object} Listing
 * @property {string} id - Unique identifier for the listing
 * @property {string} name - Name/title of the listing
 * @property {string} host_id - Unique identifier for the host
 * @property {string} host_name - Name of the host
 * @property {string} neighbourhood_group - Larger geographical area (e.g., borough)
 * @property {string} neighbourhood - Specific neighborhood within the neighbourhood_group
 * @property {number|undefined} latitude - Geographic latitude coordinate
 * @property {number|undefined} longitude - Geographic longitude coordinate
 * @property {string} room_type - Type of room (e.g., "Entire home/apt", "Private room")
 * @property {number|undefined} price - Price per night in the local currency
 * @property {number|undefined} minimum_nights - Minimum number of nights required to book
 * @property {number|undefined} number_of_reviews - Total number of reviews received
 * @property {string} last_review - Date of the last review (ISO format)
 * @property {number|undefined} reviews_per_month - Average number of reviews per month
 * @property {number|undefined} calculated_host_listings_count - Number of listings the host has
 * @property {number|undefined} availability_365 - Number of days available in a year
 * @property {number|undefined} number_of_reviews_ltm - Number of reviews in the last 12 months
 * @property {string} license - License or registration information
 */
export type Listing = {
  id: string;
  name: string;
  host_id: string;
  host_name: string;
  neighbourhood_group: string;
  neighbourhood: string;
  latitude: number | undefined;
  longitude: number | undefined;
  room_type: string;
  price: number | undefined;
  minimum_nights: number | undefined;
  number_of_reviews: number | undefined;
  last_review: string;
  reviews_per_month: number | undefined;
  calculated_host_listings_count: number | undefined;
  availability_365: number | undefined;
  number_of_reviews_ltm: number | undefined;
  license: string;
};
