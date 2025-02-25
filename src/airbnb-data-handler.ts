/**
 * AirBnBDataHandler Module
 *
 * A functional module for processing AirBnB listings data.
 * Implements method chaining and uses pure functions for data manipulation.
 *
 * @module AirBnBDataHandler
 */

import { readFile, writeFile } from "fs/promises";
import type { Listing, FilterCriteria, Statistics, HostRanking, DataHandlerState } from "./types/index";

/**
 * Creates a new AirBnBDataHandler instance
 *
 * @param {string} filePath - Path to the CSV file containing AirBnB data
 * @returns {Promise<AirBnBDataHandler>} A promise that resolves to an AirBnBDataHandler instance
 * @throws {Error} If the data could not be loaded from the file
 */
export const createAirBnBDataHandler = async (filePath: string) => {
  /**
   * Internal state of the data handler
   * @type {DataHandlerState}
   * @private
   */
  const state: DataHandlerState = {
    allListings: [],
    filteredListings: [],
    statistics: null,
    hostRankings: null,
    lastAppliedFilters: null
  };

  /**
   * Parses a CSV row into a Listing object
   *
   * @param {string} row - CSV row as a string
   * @returns {Listing} A Listing object with parsed data
   * @private
   */
  const parseRow = (row: string): Listing => {
    const values = row.split(",");

    // Clean price value - remove $ and any non-numeric characters except decimal point
    const priceStr = values[9] ? values[9].replace(/[$,]/g, "") : "0";
    const price = parseFloat(priceStr);

    return {
      id: values[0] || "",
      name: values[1] || "",
      host_id: values[2] || "",
      host_name: values[3] || "",
      neighbourhood_group: values[4] || "",
      neighbourhood: values[5] || "",
      latitude: parseFloat(values[6] || "0"),
      longitude: parseFloat(values[7] || "0"),
      room_type: values[8] || "",
      price: isNaN(price) ? 0 : price, // Default to 0 if price is NaN
      minimum_nights: parseInt(values[10] || "0"),
      number_of_reviews: parseInt(values[11] || "0"),
      last_review: values[12] || "",
      reviews_per_month: parseFloat(values[13] || "0") || 0,
      calculated_host_listings_count: parseInt(values[14] || "0"),
      availability_365: parseInt(values[15] || "0"),
      number_of_reviews_ltm: parseInt(values[16] || "0"),
      license: values[17] || ""
    };
  };

  /**
   * Loads data from the CSV file into the internal state
   *
   * @returns {Promise<void>} A promise that resolves when the data has been loaded
   * @throws {Error} If the data could not be loaded from the file
   * @private
   */
  const loadData = async (): Promise<void> => {
    try {
      const content = await readFile(filePath, "utf-8");
      const rows = content.split("\n");

      // Skip header row and parse each data row
      state.allListings = rows
        .slice(1)
        .filter((row) => row.trim())
        .map(parseRow);

      state.filteredListings = [...state.allListings];
    } catch (error) {
      console.error("Error loading data:", error);
      throw new Error(`Failed to load data from ${filePath}`);
    }
  };

  // Load the data when creating the handler
  await loadData();

  /**
   * Filters listings based on provided criteria
   *
   * @param {FilterCriteria} criteria - Filter criteria to apply to the listings
   * @returns {AirBnBDataHandler} The updated data handler for method chaining
   */
  const filter = (criteria: FilterCriteria) => {
    state.filteredListings = state.allListings.filter((listing) => {
      // Filter by price
      if (criteria.minPrice !== undefined && listing.price < criteria.minPrice) {
        return false;
      }
      if (criteria.maxPrice !== undefined && listing.price > criteria.maxPrice) {
        return false;
      }

      // Filter by number of reviews
      if (criteria.minReviews !== undefined && listing.number_of_reviews < criteria.minReviews) {
        return false;
      }
      if (criteria.maxReviews !== undefined && listing.number_of_reviews > criteria.maxReviews) {
        return false;
      }

      // Filter by number of reviews in last 12 months
      if (criteria.minReviewsLtm !== undefined && listing.number_of_reviews_ltm < criteria.minReviewsLtm) {
        return false;
      }
      if (criteria.maxReviewsLtm !== undefined && listing.number_of_reviews_ltm > criteria.maxReviewsLtm) {
        return false;
      }

      // Filter by room type
      if (criteria.roomType !== undefined && listing.room_type !== criteria.roomType) {
        return false;
      }

      // Filter by name (partial match, case insensitive)
      if (criteria.name !== undefined && !listing.name.toLowerCase().includes(criteria.name.toLowerCase())) {
        return false;
      }

      // Filter by neighbourhood
      if (
        criteria.neighbourhood !== undefined &&
        !listing.neighbourhood.toLowerCase().includes(criteria.neighbourhood.toLowerCase())
      ) {
        return false;
      }

      // Filter by availability
      if (criteria.minAvailability !== undefined && listing.availability_365 < criteria.minAvailability) {
        return false;
      }
      if (criteria.maxAvailability !== undefined && listing.availability_365 > criteria.maxAvailability) {
        return false;
      }

      // Filter by minimum nights
      if (criteria.minMinimumNights !== undefined && listing.minimum_nights < criteria.minMinimumNights) {
        return false;
      }
      if (criteria.maxMinimumNights !== undefined && listing.minimum_nights > criteria.maxMinimumNights) {
        return false;
      }

      // Filter by host name (partial match, case insensitive)
      if (
        criteria.hostName !== undefined &&
        !listing.host_name.toLowerCase().includes(criteria.hostName.toLowerCase())
      ) {
        return false;
      }

      return true;
    });

    // Store the applied filters (make a copy to avoid external mutation)
    state.lastAppliedFilters = { ...criteria };

    // Reset statistics and rankings when filtering
    state.statistics = null;
    state.hostRankings = null;

    return handler; // Return handler for method chaining
  };

  /**
   * Computes statistics on the filtered listings
   *
   * @returns {AirBnBDataHandler} The updated data handler for method chaining
   */
  const computeStats = () => {
    const count = state.filteredListings.length;

    // Define valid room types
    const validRoomTypes = ["Entire home/apt", "Private room", "Shared room", "Hotel room"];

    // Group listings by room type and calculate average price for each group
    const roomTypePrices: Record<string, number[]> = {};

    // Initialize with valid room types
    validRoomTypes.forEach((type) => {
      roomTypePrices[type] = [];
    });

    // Collect prices for each room type
    state.filteredListings.forEach((listing) => {
      if (validRoomTypes.includes(listing.room_type) && !isNaN(listing.price)) {
        roomTypePrices[listing.room_type].push(listing.price);
      }
    });

    // Calculate average price per room type
    const averages: Record<string, number> = {};
    for (const [roomType, prices] of Object.entries(roomTypePrices)) {
      if (prices.length > 0) {
        const total = prices.reduce((sum, price) => sum + price, 0);
        averages[roomType] = total / prices.length;
      }
    }

    state.statistics = {
      count,
      averagePricePerRoom: averages
    };

    return handler; // Return handler for method chaining
  };

  /**
   * Computes the ranking of hosts by number of listings
   *
   * @returns {AirBnBDataHandler} The updated data handler for method chaining
   */
  const computeHostRankings = () => {
    // Count listings per host
    const hostCounts = state.filteredListings.reduce<Record<string, { count: number; name: string }>>(
      (acc, listing) => {
        if (!acc[listing.host_id]) {
          acc[listing.host_id] = { count: 0, name: listing.host_name };
        }
        acc[listing.host_id].count += 1;
        return acc;
      },
      {}
    );

    // Convert to array and sort by count (descending)
    state.hostRankings = Object.entries(hostCounts)
      .map(([host_id, { count, name }]) => ({
        host_id,
        host_name: name,
        listingCount: count
      }))
      .sort((a, b) => b.listingCount - a.listingCount);

    return handler; // Return handler for method chaining
  };

  /**
   * Exports the current results to a file in the specified format
   *
   * @param {string} outputPath - Path to the output file
   * @param {string} format - Format of the output file ('json' or 'csv')
   * @param {FilterCriteria | null} appliedFilters - The filters that were applied to the data
   * @returns {Promise<void>} A promise that resolves when export is complete
   * @throws {Error} If the results could not be exported to the specified file
   */
  const exportResults = async (
    outputPath: string,
    format: "json" | "csv" = "json",
    appliedFilters: FilterCriteria | null = null
  ): Promise<void> => {
    try {
      // Create exports directory if it doesn't exist
      const fs = await import("fs");
      const path = await import("path");
      const exportsDir = "exports";

      // Using fs.promises API for async file operations
      if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
      }

      // Construct full path in exports directory
      const fileName = path.basename(outputPath);
      const exportPath = path.join(exportsDir, fileName);

      // Prepare the data for export
      const results = {
        filteredListings: state.filteredListings,
        statistics: state.statistics,
        hostRankings: state.hostRankings
      };

      // Export in the specified format
      if (format === "json") {
        await exportAsJson(exportPath, results);
      } else if (format === "csv") {
        await exportAsCsv(exportPath, state.filteredListings);
      } else {
        throw new Error(`Unsupported export format: ${format}`);
      }

      // Create description file with applied filters, passing the format
      await createFilterDescriptionFile(exportPath, appliedFilters, format);

      // No logging here, handled by CLI
    } catch (error) {
      console.error("Error exporting results:", error);
      throw new Error(`Failed to export results to ${outputPath}`);
    }
  };

  /**
   * Exports data as JSON
   *
   * @param {string} filePath - Path to the output file
   * @param {Record<string, unknown>} data - Data to export
   * @returns {Promise<void>} A promise that resolves when export is complete
   * @private
   */
  const exportAsJson = async (filePath: string, data: Record<string, unknown>): Promise<void> => {
    await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  };

  /**
   * Exports listings as CSV
   *
   * @param {string} filePath - Path to the output file
   * @param {Listing[]} listings - Listings to export
   * @returns {Promise<void>} A promise that resolves when export is complete
   * @private
   */
  const exportAsCsv = async (filePath: string, listings: Listing[]): Promise<void> => {
    if (listings.length === 0) {
      await writeFile(filePath, "", "utf-8");
      return;
    }

    // Get headers from the first listing
    const headers = Object.keys(listings[0]);

    // Convert listings to CSV rows
    const rows = listings.map((listing) => {
      return headers
        .map((header) => {
          const value = listing[header as keyof Listing];
          // Handle special cases for CSV formatting
          if (value === null || value === undefined) {
            return "";
          }
          // These rules being disabled are necessary in this case because this was giving me too many headaches
          // eslint-disable-next-line quotes
          if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
            // Escape quotes and wrap in quotes if the string contains commas or quotes
            // eslint-disable-next-line quotes
            return `"${value.replace(/"/g, '""')}"`;
          }
          return String(value);
        })
        .join(",");
    });

    // Combine headers and rows
    const csvContent = [headers.join(","), ...rows].join("\n");

    await writeFile(filePath, csvContent, "utf-8");
  };

  /**
   * Creates a description file listing all applied filters
   *
   * @param {string} exportPath - Path to the exported data file
   * @param {FilterCriteria | null} filters - The filters that were applied
   * @param {string} format - Format of the exported data
   * @returns {Promise<void>} A promise that resolves when the file is created
   * @private
   */
  const createFilterDescriptionFile = async (
    exportPath: string,
    filters: FilterCriteria | null,
    format: string
  ): Promise<void> => {
    const path = await import("path");

    // Generate the description file path by adding format indicator and changing the extension to .txt
    let descriptionFileName = `${path.basename(exportPath, path.extname(exportPath))}_filters.txt`;

    // If format is CSV, add _csv to the filename
    if (format === "csv") {
      descriptionFileName = `${path.basename(exportPath, path.extname(exportPath))}_csv_filters.txt`;
    }

    const descriptionPath = path.join(path.dirname(exportPath), descriptionFileName);

    // Generate filter description content
    let content = "Applied Filters:\n\n";

    if (!filters || Object.keys(filters).length === 0) {
      content += "No filters were applied. All listings are included.\n";
    } else {
      // Add each filter to the description
      Object.entries(filters).forEach(([key, value]) => {
        // Format the filter key for better readability
        let formattedKey = key
          .replace(/([A-Z])/g, " $1") // Add spaces before capital letters
          .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter

        // Special case handling for min/max prefixes
        formattedKey = formattedKey.replace(/Min /, "Minimum ").replace(/Max /, "Maximum ");

        // Special case for "minimum nights" to avoid redundancy
        if (key === "minMinimumNights") {
          formattedKey = "Minimum Nights";
        } else if (key === "maxMinimumNights") {
          formattedKey = "Maximum Nights";
        }

        content += `${formattedKey}: ${value}\n`;
      });
    }

    await writeFile(descriptionPath, content, "utf-8");
  };

  /**
   * Gets the filtered listings
   *
   * @returns {Listing[]} A copy of the filtered listings
   */
  const getFilteredListings = (): Listing[] => {
    return [...state.filteredListings];
  };

  /**
   * Gets the computed statistics
   *
   * @returns {Statistics | null} A copy of the computed statistics or null if not computed
   */
  const getStatistics = (): Statistics | null => {
    return state.statistics ? { ...state.statistics } : null;
  };

  /**
   * Gets the host rankings
   *
   * @returns {HostRanking[] | null} A copy of the host rankings or null if not computed
   */
  const getHostRankings = (): HostRanking[] | null => {
    return state.hostRankings ? [...state.hostRankings] : null;
  };

  /**
   * Gets the total number of listings
   *
   * @returns {number} The total number of listings in the dataset
   */
  const getTotalListingsCount = (): number => {
    return state.allListings.length;
  };

  /**
   * Gets the last applied filters
   *
   * @returns {FilterCriteria | null} A copy of the last applied filters or null if no filters applied
   */
  const getLastAppliedFilters = (): FilterCriteria | null => {
    return state.lastAppliedFilters ? { ...state.lastAppliedFilters } : null;
  };

  /**
   * The AirBnBDataHandler object with all the methods for data manipulation
   *
   * @type {AirBnBDataHandler}
   */
  const handler = {
    filter,
    computeStats,
    computeHostRankings,
    exportResults,
    getFilteredListings,
    getStatistics,
    getHostRankings,
    getTotalListingsCount,
    getLastAppliedFilters
  };

  return handler;
};

/**
 * Type definition for the AirBnBDataHandler
 *
 * @typedef {Object} AirBnBDataHandler
 */
export type AirBnBDataHandler = Awaited<ReturnType<typeof createAirBnBDataHandler>>;
