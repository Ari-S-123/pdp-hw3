/**
 * AirBnBDataHandler Module
 *
 * A functional module for processing AirBnB listings data.
 * Implements method chaining and uses pure functions for data manipulation.
 *
 * @module AirBnBDataHandler
 */

import { writeFile } from "fs/promises";
import { existsSync, mkdirSync, createReadStream, createWriteStream } from "fs";
import { basename, extname, join, dirname } from "path";
import { parse } from "@fast-csv/parse";
import { format } from "@fast-csv/format";
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
    statistics: undefined,
    hostRankings: undefined,
    lastAppliedFilters: undefined
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
      // Using fast-csv to parse the CSV file
      const listings: Listing[] = [];

      await new Promise<void>((resolve, reject) => {
        createReadStream(filePath)
          .pipe(parse({ headers: true, trim: true }))
          .on("error", (error) => reject(error))
          .on("data", (row) => {
            // Parse price, preserving undefined for missing values
            let price: number | undefined = undefined;
            if (row.price && row.price.trim() !== "") {
              const priceStr = row.price.replace(/[$,]/g, "");
              price = parseFloat(priceStr);
              if (isNaN(price)) {
                price = undefined;
              }
            }

            // Parse reviews_per_month, preserve undefined for missing values
            let reviewsPerMonth: number | undefined = undefined;
            if (row.reviews_per_month && row.reviews_per_month.trim() !== "") {
              reviewsPerMonth = parseFloat(row.reviews_per_month);
              if (isNaN(reviewsPerMonth)) {
                reviewsPerMonth = undefined;
              }
            }

            // Parse latitude, preserving undefined for missing values
            let latitude: number | undefined = undefined;
            if (row.latitude && row.latitude.trim() !== "") {
              latitude = parseFloat(row.latitude);
              if (isNaN(latitude)) {
                latitude = undefined;
              }
            }

            // Parse longitude, preserving undefined for missing values
            let longitude: number | undefined = undefined;
            if (row.longitude && row.longitude.trim() !== "") {
              longitude = parseFloat(row.longitude);
              if (isNaN(longitude)) {
                longitude = undefined;
              }
            }

            // Parse minimum_nights, preserving undefined for missing values
            let minimumNights: number | undefined = undefined;
            if (row.minimum_nights && row.minimum_nights.trim() !== "") {
              minimumNights = parseInt(row.minimum_nights);
              if (isNaN(minimumNights)) {
                minimumNights = undefined;
              }
            }

            // Parse number_of_reviews, preserving undefined for missing values
            let numberOfReviews: number | undefined = undefined;
            if (row.number_of_reviews && row.number_of_reviews.trim() !== "") {
              numberOfReviews = parseInt(row.number_of_reviews);
              if (isNaN(numberOfReviews)) {
                numberOfReviews = undefined;
              }
            }

            // Parse calculated_host_listings_count, preserving undefined for missing values
            let calculatedHostListingsCount: number | undefined = undefined;
            if (row.calculated_host_listings_count && row.calculated_host_listings_count.trim() !== "") {
              calculatedHostListingsCount = parseInt(row.calculated_host_listings_count);
              if (isNaN(calculatedHostListingsCount)) {
                calculatedHostListingsCount = undefined;
              }
            }

            // Parse availability_365, preserving undefined for missing values
            let availability365: number | undefined = undefined;
            if (row.availability_365 && row.availability_365.trim() !== "") {
              availability365 = parseInt(row.availability_365);
              if (isNaN(availability365)) {
                availability365 = undefined;
              }
            }

            // Parse number_of_reviews_ltm, preserving undefined for missing values
            let numberOfReviewsLtm: number | undefined = undefined;
            if (row.number_of_reviews_ltm && row.number_of_reviews_ltm.trim() !== "") {
              numberOfReviewsLtm = parseInt(row.number_of_reviews_ltm);
              if (isNaN(numberOfReviewsLtm)) {
                numberOfReviewsLtm = undefined;
              }
            }

            const listing: Listing = {
              id: row.id || "",
              name: row.name || "",
              host_id: row.host_id || "",
              host_name: row.host_name || "",
              neighbourhood_group: row.neighbourhood_group || "",
              neighbourhood: row.neighbourhood || "",
              latitude: latitude,
              longitude: longitude,
              room_type: row.room_type || "",
              price: price,
              minimum_nights: minimumNights,
              number_of_reviews: numberOfReviews,
              last_review: row.last_review || "",
              reviews_per_month: reviewsPerMonth,
              calculated_host_listings_count: calculatedHostListingsCount,
              availability_365: availability365,
              number_of_reviews_ltm: numberOfReviewsLtm,
              license: row.license || ""
            };

            listings.push(listing);
          })
          .on("end", () => {
            state.allListings = listings;
            state.filteredListings = [...listings];
            resolve();
          });
      });
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
      if (criteria.minPrice !== undefined && listing.price !== undefined && listing.price < criteria.minPrice) {
        return false;
      }
      if (criteria.maxPrice !== undefined && listing.price !== undefined && listing.price > criteria.maxPrice) {
        return false;
      }

      // Filter by number of reviews
      if (
        criteria.minReviews !== undefined &&
        listing.number_of_reviews !== undefined &&
        listing.number_of_reviews < criteria.minReviews
      ) {
        return false;
      }
      if (
        criteria.maxReviews !== undefined &&
        listing.number_of_reviews !== undefined &&
        listing.number_of_reviews > criteria.maxReviews
      ) {
        return false;
      }

      // Filter by number of reviews in last 12 months
      if (
        criteria.minReviewsLtm !== undefined &&
        listing.number_of_reviews_ltm !== undefined &&
        listing.number_of_reviews_ltm < criteria.minReviewsLtm
      ) {
        return false;
      }
      if (
        criteria.maxReviewsLtm !== undefined &&
        listing.number_of_reviews_ltm !== undefined &&
        listing.number_of_reviews_ltm > criteria.maxReviewsLtm
      ) {
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
      if (
        criteria.minAvailability !== undefined &&
        listing.availability_365 !== undefined &&
        listing.availability_365 < criteria.minAvailability
      ) {
        return false;
      }
      if (
        criteria.maxAvailability !== undefined &&
        listing.availability_365 !== undefined &&
        listing.availability_365 > criteria.maxAvailability
      ) {
        return false;
      }

      // Filter by minimum nights
      if (
        criteria.minMinimumNights !== undefined &&
        listing.minimum_nights !== undefined &&
        listing.minimum_nights < criteria.minMinimumNights
      ) {
        return false;
      }
      if (
        criteria.maxMinimumNights !== undefined &&
        listing.minimum_nights !== undefined &&
        listing.minimum_nights > criteria.maxMinimumNights
      ) {
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
    state.statistics = undefined;
    state.hostRankings = undefined;

    return handler; // Return handler for method chaining
  };

  /**
   * Computes statistics on the filtered listings
   *
   * @returns {AirBnBDataHandler} The updated data handler for method chaining
   */
  const computeStats = () => {
    const count = state.filteredListings.length;

    if (count === 0) {
      state.statistics = {
        count: 0,
        averagePricePerRoom: {},
        averagePrice: 0,
        averageReviews: 0,
        averageReviewsLtm: 0,
        averageMinimumNights: 0,
        averageAvailability: 0,
        averageReviewsPerMonth: 0,
        averageHostListingsCount: 0,
        medianPrice: 0,
        minPrice: 0,
        maxPrice: 0
      };
      return handler;
    }

    // Define valid room types
    const validRoomTypes = ["Entire home/apt", "Private room", "Shared room", "Hotel room"];

    // Group listings by room type and calculate average price for each group
    const roomTypePrices: Record<string, number[]> = {};

    // Initialize with valid room types
    validRoomTypes.forEach((type) => {
      roomTypePrices[type] = [];
    });

    // Collect numeric values for calculating averages
    let sumReviews = 0;
    let reviewsCount = 0;
    let sumReviewsLtm = 0;
    let reviewsLtmCount = 0;
    let sumMinimumNights = 0;
    let minimumNightsCount = 0;
    let sumAvailability = 0;
    let availabilityCount = 0;
    let sumReviewsPerMonth = 0;
    let reviewsPerMonthCount = 0;
    let sumHostListingsCount = 0;
    let hostListingsCount = 0;
    const validPrices: number[] = [];

    // Collect prices for each room type and calculate sums for averages
    state.filteredListings.forEach((listing) => {
      // Collect prices by room type if price is not undefined
      if (validRoomTypes.includes(listing.room_type) && listing.price !== undefined && !isNaN(listing.price)) {
        roomTypePrices[listing.room_type].push(listing.price);
        validPrices.push(listing.price);
      }

      // Sum values for averages, only counting non-undefined values
      if (listing.number_of_reviews !== undefined) {
        sumReviews += listing.number_of_reviews;
        reviewsCount++;
      }

      if (listing.number_of_reviews_ltm !== undefined) {
        sumReviewsLtm += listing.number_of_reviews_ltm;
        reviewsLtmCount++;
      }

      if (listing.minimum_nights !== undefined) {
        sumMinimumNights += listing.minimum_nights;
        minimumNightsCount++;
      }

      if (listing.availability_365 !== undefined) {
        sumAvailability += listing.availability_365;
        availabilityCount++;
      }

      if (listing.calculated_host_listings_count !== undefined) {
        sumHostListingsCount += listing.calculated_host_listings_count;
        hostListingsCount++;
      }

      // Only count non-undefined reviews_per_month values
      if (listing.reviews_per_month !== undefined) {
        sumReviewsPerMonth += listing.reviews_per_month;
        reviewsPerMonthCount++;
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

    // Calculate average price across all valid prices
    let averagePrice = 0;
    if (validPrices.length > 0) {
      const totalPriceSum = validPrices.reduce((sum, price) => sum + price, 0);
      averagePrice = totalPriceSum / validPrices.length;
    }

    // Sort prices for median calculation
    validPrices.sort((a, b) => a - b);

    // Calculate median price
    let medianPrice = 0;
    if (validPrices.length > 0) {
      const midIndex = Math.floor(validPrices.length / 2);
      if (validPrices.length % 2 === 0) {
        // Even number of prices, average the two middle values
        medianPrice = (validPrices[midIndex - 1] + validPrices[midIndex]) / 2;
      } else {
        // Odd number of prices, take the middle value
        medianPrice = validPrices[midIndex];
      }
    }

    state.statistics = {
      count,
      averagePricePerRoom: averages,
      averagePrice,
      averageReviews: reviewsCount > 0 ? sumReviews / reviewsCount : 0,
      averageReviewsLtm: reviewsLtmCount > 0 ? sumReviewsLtm / reviewsLtmCount : 0,
      averageMinimumNights: minimumNightsCount > 0 ? sumMinimumNights / minimumNightsCount : 0,
      averageAvailability: availabilityCount > 0 ? sumAvailability / availabilityCount : 0,
      averageReviewsPerMonth: reviewsPerMonthCount > 0 ? sumReviewsPerMonth / reviewsPerMonthCount : 0,
      averageHostListingsCount: hostListingsCount > 0 ? sumHostListingsCount / hostListingsCount : 0,
      medianPrice: medianPrice,
      minPrice: validPrices.length > 0 ? validPrices[0] : 0,
      maxPrice: validPrices.length > 0 ? validPrices[validPrices.length - 1] : 0
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
        // Skip listings without a valid host_id
        if (!listing.host_id) {
          return acc;
        }

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
   * @param {FilterCriteria | undefined} appliedFilters - The filters that were applied to the data
   * @returns {Promise<void>} A promise that resolves when export is complete
   * @throws {Error} If the results could not be exported to the specified file
   */
  const exportResults = async (
    outputPath: string,
    format: "json" | "csv" = "json",
    appliedFilters: FilterCriteria | undefined = undefined
  ): Promise<void> => {
    try {
      // Create exports directory if it doesn't exist
      const exportsDir = "exports";

      // Using fs.promises API for async file operations
      if (!existsSync(exportsDir)) {
        mkdirSync(exportsDir, { recursive: true });
      }

      // Construct full path in exports directory
      const fileName = basename(outputPath);
      const exportPath = join(exportsDir, fileName);

      // Automatically compute statistics and host rankings if not already computed
      if (state.statistics === undefined && format === "json") {
        computeStats();
      }

      if (state.hostRankings === undefined && format === "json") {
        computeHostRankings();
      }

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

    return new Promise<void>((resolve, reject) => {
      try {
        const csvStream = format({ headers: true });
        const writeStream = createWriteStream(filePath);

        writeStream.on("finish", () => resolve());
        writeStream.on("error", (error) => reject(error));

        csvStream.pipe(writeStream);

        // Write each listing
        listings.forEach((listing) => {
          csvStream.write(listing);
        });

        csvStream.end();
      } catch (error) {
        reject(error);
      }
    });
  };

  /**
   * Creates a description file listing all applied filters
   *
   * @param {string} exportPath - Path to the exported data file
   * @param {FilterCriteria | undefined} filters - The filters that were applied
   * @param {string} format - Format of the exported data
   * @returns {Promise<void>} A promise that resolves when the file is created
   * @private
   */
  const createFilterDescriptionFile = async (
    exportPath: string,
    filters: FilterCriteria | undefined,
    format: string
  ): Promise<void> => {
    // Generate the description file path by adding format indicator and changing the extension to .txt
    let descriptionFileName = `${basename(exportPath, extname(exportPath))}_filters.txt`;

    // If format is CSV, add _csv to the filename
    if (format === "csv") {
      descriptionFileName = `${basename(exportPath, extname(exportPath))}_csv_filters.txt`;
    }

    const descriptionPath = join(dirname(exportPath), descriptionFileName);

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
   * @returns {Statistics | undefined} A copy of the computed statistics or undefined if not computed
   */
  const getStatistics = (): Statistics | undefined => {
    return state.statistics ? { ...state.statistics } : undefined;
  };

  /**
   * Gets the host rankings
   *
   * @returns {HostRanking[] | undefined} A copy of the host rankings or undefined if not computed
   */
  const getHostRankings = (): HostRanking[] | undefined => {
    return state.hostRankings ? [...state.hostRankings] : undefined;
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
   * @returns {FilterCriteria | undefined} A copy of the last applied filters or undefined if no filters applied
   */
  const getLastAppliedFilters = (): FilterCriteria | undefined => {
    return state.lastAppliedFilters ? { ...state.lastAppliedFilters } : undefined;
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
