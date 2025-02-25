/**
 * Type definition for statistics computed from AirBnB listings
 *
 * @typedef {Object} Statistics
 * @property {number} count - Total number of listings in the filtered set
 * @property {Object} averagePricePerRoom - Average price for each room type
 * @property {number} averagePricePerRoom[roomType] - Average price for a specific room type
 */
export type Statistics = {
  count: number;
  averagePricePerRoom: Record<string, number>;
};
