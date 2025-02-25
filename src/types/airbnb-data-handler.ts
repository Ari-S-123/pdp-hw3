import { createAirBnBDataHandler } from "../airbnb-data-handler";

/**
 * Type definition for the AirBnBDataHandler
 *
 * Represents the interface for the AirBnB data handler, which provides
 * methods for filtering listings, computing statistics, ranking hosts,
 * exporting results, and retrieving data.
 *
 * @typedef {Object} AirBnBDataHandler
 * @property {Function} filter - Filters listings based on criteria
 * @property {Function} computeStats - Computes statistics on filtered listings
 * @property {Function} computeHostRankings - Computes host rankings by number of listings
 * @property {Function} exportResults - Exports results to a JSON file
 * @property {Function} getFilteredListings - Gets the filtered listings
 * @property {Function} getStatistics - Gets the computed statistics
 * @property {Function} getHostRankings - Gets the host rankings
 * @property {Function} getTotalListingsCount - Gets the total number of listings
 */
export type AirBnBDataHandler = Awaited<ReturnType<typeof createAirBnBDataHandler>>;
