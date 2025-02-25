/**
 * Type definition for host ranking based on number of listings
 *
 * Represents a host's ranking information including identifier, name,
 * and the count of their listings in the filtered set.
 *
 * @typedef {Object} HostRanking
 * @property {string} host_id - Unique identifier for the host
 * @property {string} host_name - Name of the host
 * @property {number} listingCount - Number of listings owned by the host in the filtered set
 */
export type HostRanking = {
  host_id: string;
  host_name: string;
  listingCount: number;
};
