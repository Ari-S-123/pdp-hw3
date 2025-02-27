/**
 * CLI Module
 *
 * A module to provide a command line interface for interacting with the AirBnBDataHandler.
 * Implements a basic readline UI for the user to perform operations on AirBnB data.
 *
 * @module CLI
 */

import { createInterface, Interface } from "readline/promises";
import type { AirBnBDataHandler, Listing, HostRanking, FilterCriteria } from "./types/index";

/**
 * Creates a CLI interface for interacting with the AirBnBDataHandler
 *
 * @param {AirBnBDataHandler} dataHandler - The AirBnBDataHandler instance to interact with
 * @returns {CLI} An object containing the startCLI function
 */
export const createCLI = (dataHandler: AirBnBDataHandler) => {
  /**
   * Displays the main menu and processes user commands
   *
   * @returns {Promise<void>} A promise that resolves when the CLI is closed
   */
  const startCLI = async (): Promise<void> => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log("\nAirBnB Data Processor");
    console.log(`Total listings loaded: ${dataHandler.getTotalListingsCount()}`);

    let running = true;
    while (running) {
      console.log("\n=== MENU ===");
      console.log("1. Filter listings");
      console.log("2. Compute statistics");
      console.log("3. Rank hosts");
      console.log("4. Export results");
      console.log("5. Display results");
      console.log("6. Exit");

      const choice = await rl.question("\nEnter your choice (1-6): ");

      switch (choice) {
        case "1":
          await handleFiltering(rl);
          break;
        case "2":
          handleComputeStats();
          break;
        case "3":
          handleHostRankings();
          break;
        case "4":
          await handleExport(rl);
          break;
        case "5":
          await handleDisplayResults(rl);
          break;
        case "6":
          running = false;
          console.log("Goodbye!");
          break;
        default:
          console.log("Invalid choice. Please try again.");
      }
    }

    rl.close();
  };

  /**
   * Handles the filtering operation by prompting the user for filter criteria
   *
   * @param {readline.Interface} rl - The readline interface for user input
   * @returns {Promise<void>} A promise that resolves when filtering is complete
   */
  const handleFiltering = async (rl: Interface): Promise<void> => {
    console.log("\n=== FILTER LISTINGS ===");

    // Name filter
    console.log("\n--- Name Filter ---");
    const name = await rl.question("Enter listing name (partial match, or leave empty): ");

    // Price filters
    console.log("\n--- Price Filters ---");
    const minPrice = await getNumberInput(rl, "Enter minimum price (or leave empty): ", true);
    const maxPrice = await getNumberInput(rl, "Enter maximum price (or leave empty): ", true);

    // Review filters
    console.log("\n--- Review Filters ---");
    const minReviews = await getNumberInput(rl, "Enter minimum number of reviews (or leave empty): ", true);
    const maxReviews = await getNumberInput(rl, "Enter maximum number of reviews (or leave empty): ", true);
    const minReviewsLtm = await getNumberInput(
      rl,
      "Enter minimum number of reviews in last 12 months (or leave empty): ",
      true
    );
    const maxReviewsLtm = await getNumberInput(
      rl,
      "Enter maximum number of reviews in last 12 months (or leave empty): ",
      true
    );

    // Room type filter
    console.log("\n--- Room Type Filter ---");
    const roomTypeOptions = ["", "Entire home/apt", "Private room", "Shared room", "Hotel room"];
    let roomTypePrompt = "Select room type (or leave empty):\n";
    roomTypeOptions.forEach((type, index) => {
      if (index > 0) {
        roomTypePrompt += `${index}. ${type}\n`;
      }
    });
    roomTypePrompt += "Enter selection (0-4): ";

    const roomTypeSelection = await getNumberInput(rl, roomTypePrompt, true);
    const roomType =
      roomTypeSelection !== undefined && roomTypeSelection > 0 && roomTypeSelection < roomTypeOptions.length
        ? roomTypeOptions[roomTypeSelection]
        : undefined;

    // Location filters
    console.log("\n--- Location Filters ---");
    const neighbourhood = await rl.question("Enter neighbourhood (partial match, or leave empty): ");

    // Minimum nights filters
    console.log("\n--- Minimum Nights Filters ---");
    const minMinimumNights = await getNumberInput(
      rl,
      "Enter minimum value for minimum nights (or leave empty): ",
      true
    );
    const maxMinimumNights = await getNumberInput(
      rl,
      "Enter maximum value for minimum nights (or leave empty): ",
      true
    );

    // Availability filters
    console.log("\n--- Availability Filters ---");
    const minAvailability = await getNumberInput(rl, "Enter minimum availability days (0-365, or leave empty): ", true);
    const maxAvailability = await getNumberInput(rl, "Enter maximum availability days (0-365, or leave empty): ", true);

    // Host filters
    console.log("\n--- Host Filters ---");
    const hostName = await rl.question("Enter host name (partial match, or leave empty): ");

    // Apply filters (only include criteria that are defined)
    const criteria = {
      ...(name !== "" && { name }),
      ...(minPrice !== undefined && { minPrice }),
      ...(maxPrice !== undefined && { maxPrice }),
      ...(minReviews !== undefined && { minReviews }),
      ...(maxReviews !== undefined && { maxReviews }),
      ...(minReviewsLtm !== undefined && { minReviewsLtm }),
      ...(maxReviewsLtm !== undefined && { maxReviewsLtm }),
      ...(roomType !== undefined && { roomType }),
      ...(neighbourhood !== "" && { neighbourhood }),
      ...(minMinimumNights !== undefined && { minMinimumNights }),
      ...(maxMinimumNights !== undefined && { maxMinimumNights }),
      ...(minAvailability !== undefined && { minAvailability }),
      ...(maxAvailability !== undefined && { maxAvailability }),
      ...(hostName !== "" && { hostName })
    };

    dataHandler.filter(criteria);

    const filteredCount = dataHandler.getFilteredListings().length;
    console.log(`\nFilter applied. ${filteredCount} listings match the criteria.`);
  };

  /**
   * Handles the compute statistics operation
   * Calculates and displays statistics for the currently filtered listings
   *
   * @returns {void}
   */
  const handleComputeStats = (): void => {
    console.log("\n=== COMPUTE STATISTICS ===");

    dataHandler.computeStats();

    const stats = dataHandler.getStatistics();
    if (!stats) {
      console.log("No statistics available. Try filtering listings first.");
      return;
    }

    // Display basic information
    console.log(`Number of listings: ${stats.count}`);

    // Display price statistics with formatting
    console.log("\n--- Price Statistics ---");
    console.log(`Average price across all rooms: $${stats.averagePrice.toFixed(2)}`);
    console.log(`Median price: $${stats.medianPrice.toFixed(2)}`);
    console.log(`Minimum price: $${stats.minPrice.toFixed(2)}`);
    console.log(`Maximum price: $${stats.maxPrice.toFixed(2)}`);

    // Display average price per room type
    console.log("\n--- Average Price per Room Type ---");
    Object.entries(stats.averagePricePerRoom)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([roomType, price]) => {
        // Format price as currency with 2 decimal places, handle NaN values
        const formattedPrice = isNaN(price as number) ? "N/A" : `$${(price as number).toFixed(2)}`;
        console.log(`${roomType}: ${formattedPrice}`);
      });

    // Display review-related statistics
    console.log("\n--- Review Statistics ---");
    console.log(`Average reviews per listing: ${stats.averageReviews.toFixed(2)}`);
    console.log(`Average reviews in last 12 months: ${stats.averageReviewsLtm.toFixed(2)}`);
    console.log(`Average reviews per month: ${stats.averageReviewsPerMonth.toFixed(2)}`);

    // Display other averages
    console.log("\n--- Other Statistics ---");
    console.log(`Average minimum nights required: ${stats.averageMinimumNights.toFixed(2)}`);
    console.log(`Average availability (days/year): ${stats.averageAvailability.toFixed(2)}`);
    console.log(`Average listings per host: ${stats.averageHostListingsCount.toFixed(2)}`);
  };

  /**
   * Handles the host rankings operation
   * Calculates and displays rankings of hosts by number of listings
   *
   * @returns {void}
   */
  const handleHostRankings = (): void => {
    console.log("\n=== HOST RANKINGS ===");

    dataHandler.computeHostRankings();

    const rankings = dataHandler.getHostRankings();
    if (!rankings) {
      console.log("No rankings available. Try filtering listings first.");
      return;
    }

    console.log("Top hosts by number of listings:");

    const topHosts = rankings.slice(0, 10); // Show top 10 hosts
    topHosts.forEach((host: HostRanking, index: number) => {
      console.log(`${index + 1}. ${host.host_name} (ID: ${host.host_id}): ${host.listingCount} listings`);
    });

    console.log(`\nDisplaying top ${topHosts.length} hosts out of ${rankings.length} total.`);
  };

  /**
   * Handles the export operation
   * Prompts the user for a file path and export format, then exports the current results
   *
   * @param {readline.Interface} rl - The readline interface for user input
   * @returns {Promise<void>} A promise that resolves when the export is complete
   */
  const handleExport = async (rl: Interface): Promise<void> => {
    console.log("\n=== EXPORT RESULTS ===");

    // Get output file path
    const outputPath = await rl.question("Enter the output file name (without extension): ");
    if (!outputPath) {
      console.log("Export cancelled.");
      return;
    }

    // Get export format
    console.log("\nChoose export format:");
    console.log("1. JSON (includes listings, statistics, and host rankings)");
    console.log("2. CSV (includes only listings)");

    const formatChoice = await rl.question("Enter your choice (1-2): ");
    let format: "json" | "csv";

    // Determine format based on user choice
    switch (formatChoice) {
      case "1":
        format = "json";
        break;
      case "2":
        format = "csv";
        break;
      default:
        console.log("Invalid choice. Defaulting to JSON format.");
        format = "json";
    }

    // Add appropriate extension if not already present
    const fileNameWithExt = outputPath.endsWith(`.${format}`) ? outputPath : `${outputPath}.${format}`;

    try {
      // Pass the current filters to exportResults
      // We need to get the filters that were last applied
      const currentFilters = getCurrentFilters();

      // Call exportResults with the format and filters
      await dataHandler.exportResults(fileNameWithExt, format, currentFilters);
      console.log(`\nResults successfully exported to exports/${fileNameWithExt}`);

      // Display the correct filter description file name based on format
      const filtersSuffix = format === "csv" ? "_csv_filters.txt" : "_filters.txt";
      console.log(`A description of applied filters has been saved to exports/${outputPath}${filtersSuffix}`);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  /**
   * Gets the currently applied filters
   *
   * @returns {FilterCriteria | undefined} The currently applied filters or undefined if no filters applied
   */
  const getCurrentFilters = (): FilterCriteria | undefined => {
    // Now we can directly get the last applied filters from the data handler
    return dataHandler.getLastAppliedFilters();
  };

  /**
   * Pure function to calculate pagination metadata
   *
   * @param {number} totalItems - Total number of items to paginate
   * @param {number} pageSize - Number of items per page
   * @param {number} currentPage - Current page number (1-based)
   * @returns {Object} Pagination metadata including start and end indices
   */
  const calculatePagination = (totalItems: number, pageSize: number, currentPage: number) => {
    const totalPages = Math.ceil(totalItems / pageSize);
    const normalizedPage = Math.max(1, Math.min(currentPage, totalPages));
    const startIndex = (normalizedPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);

    return {
      totalPages,
      currentPage: normalizedPage,
      startIndex,
      endIndex,
      hasPrevPage: normalizedPage > 1,
      hasNextPage: normalizedPage < totalPages
    };
  };

  /**
   * Pure function to generate navigation options text
   *
   * @returns {string} Formatted navigation menu text
   */
  const getNavigationOptions = (): string => {
    return [
      "\n=== NAVIGATION ===",
      "n: Next page",
      "p: Previous page",
      "g: Go to specific page",
      "q: Return to main menu"
    ].join("\n");
  };

  /**
   * Handles displaying current results
   * Shows paginated view of the currently filtered listings
   *
   * @param {readline.Interface} rl - The readline interface for user input
   * @returns {Promise<void>} A promise that resolves when the user exits the display
   */
  const handleDisplayResults = async (rl: Interface): Promise<void> => {
    console.log("\n=== CURRENT RESULTS ===");

    const listings = dataHandler.getFilteredListings();
    console.log(`Current filtered listings: ${listings.length}`);

    if (listings.length === 0) {
      return;
    }

    // Pagination configuration
    const pageSize = 5;
    let currentPage = 1;
    let exitDisplay = false;

    // Use the existing readline interface passed from the main menu
    // (No need to create a new one or close it when done)

    // Display listings with pagination
    while (!exitDisplay) {
      // Clear previous page (not supported in all terminals, but helps when it works)
      console.log("\n");

      // Use pure function to calculate pagination
      const pagination = calculatePagination(listings.length, pageSize, currentPage);
      currentPage = pagination.currentPage; // Normalized current page

      // Display page header
      console.log(`\nListings (Page ${pagination.currentPage}/${pagination.totalPages}):`);

      // Display listings for current page
      const currentPageListings = listings.slice(pagination.startIndex, pagination.endIndex);
      currentPageListings.forEach((listing: Listing, index: number) => {
        const absoluteIndex = pagination.startIndex + index;
        // Use the pure formatListing function and print the result
        console.log(formatListing(listing, absoluteIndex + 1));
      });

      // Display navigation options using pure function
      console.log(getNavigationOptions());

      // Get navigation input using the passed readline interface
      const choice = await rl.question("\nEnter your choice: ");

      // Process navigation choice
      let pageNum: number;
      let pageInput: string;

      switch (choice.toLowerCase()) {
        case "n":
          // Go to next page if possible
          if (pagination.hasNextPage) {
            currentPage++;
          } else {
            console.log("You are already at the last page.");
          }
          break;
        case "p":
          // Go to previous page if possible
          if (pagination.hasPrevPage) {
            currentPage--;
          } else {
            console.log("You are already at the first page.");
          }
          break;
        case "g":
          // Use the same readline interface for page input
          pageInput = await rl.question(`Enter page number (1-${pagination.totalPages}): `);

          pageNum = parseInt(pageInput);
          if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= pagination.totalPages) {
            currentPage = pageNum;
          } else {
            console.log(`Invalid page number. Please enter a number between 1 and ${pagination.totalPages}.`);
          }
          break;
        case "q":
          exitDisplay = true;
          break;
        default:
          console.log("Invalid choice. Please try again.");
      }
    }

    // Don't close the readline interface here as it was passed in
  };

  /**
   * Helper function to get numeric input from the user
   * Validates that the input is a number and handles empty inputs
   *
   * @param {readline.Interface} rl - The readline interface for user input
   * @param {string} prompt - The prompt to display to the user
   * @param {boolean} [allowEmpty=false] - Whether to allow empty input (returns undefined)
   * @returns {Promise<number | undefined>} A promise that resolves to the parsed number or undefined
   */
  const getNumberInput = async (rl: Interface, prompt: string, allowEmpty = false): Promise<number | undefined> => {
    while (true) {
      const input = await rl.question(prompt);

      if (input === "" && allowEmpty) {
        return undefined;
      }

      const num = Number(input);
      if (!isNaN(num)) {
        return num;
      }

      console.log("Please enter a valid number.");
    }
  };

  /**
   * Pure function to format and display a single listing
   *
   * @param {Listing} listing - The listing to display
   * @param {number} index - The display index of the listing
   * @returns {string} Formatted listing information
   */
  const formatListing = (listing: Listing, index: number): string => {
    // Format price as currency with 2 decimal places
    const formattedPrice = isNaN(listing.price) ? "N/A" : `$${listing.price.toFixed(2)}`;

    return [
      `\n${index}. ${listing.name} (ID: ${listing.id})`,
      `   Host: ${listing.host_name} (ID: ${listing.host_id})`,
      `   Price: ${formattedPrice}`,
      `   Room type: ${listing.room_type}`,
      `   Location: ${listing.neighbourhood}`,
      `   Minimum nights: ${listing.minimum_nights}`,
      `   Reviews: ${listing.number_of_reviews}`,
      `   Reviews in last 12 months: ${listing.number_of_reviews_ltm}`,
      `   Availability (days/year): ${listing.availability_365}`
    ].join("\n");
  };

  return { startCLI };
};

/**
 * Type definition for the CLI interface
 *
 * @typedef {Object} CLI
 * @property {Function} startCLI - Function to start the command line interface
 */
export type CLI = ReturnType<typeof createCLI>;
