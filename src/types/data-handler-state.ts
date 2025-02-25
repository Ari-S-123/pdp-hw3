import type { Listing } from "./listing";
import type { Statistics } from "./statistics";
import type { HostRanking } from "./host-ranking";
import type { FilterCriteria } from "./filter-criteria";

/**
 * Type definition for the internal state of the AirBnB data handler
 *
 * Maintains the state of the data handler including all listings,
 * filtered listings, computed statistics, and host rankings.
 *
 * @typedef {Object} DataHandlerState
 * @property {Listing[]} allListings - All listings loaded from the data source
 * @property {Listing[]} filteredListings - Subset of listings after applying filters
 * @property {Statistics|null} statistics - Computed statistics or null if not computed
 * @property {HostRanking[]|null} hostRankings - Computed host rankings or null if not computed
 * @property {FilterCriteria|null} lastAppliedFilters - The most recently applied filter criteria or null if no filters applied
 */
export type DataHandlerState = {
  allListings: Listing[];
  filteredListings: Listing[];
  statistics: Statistics | null;
  hostRankings: HostRanking[] | null;
  lastAppliedFilters: FilterCriteria | null;
};
