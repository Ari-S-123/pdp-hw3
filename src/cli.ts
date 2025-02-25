/**
 * CLI Module
 *
 * A module to provide a command line interface for interacting with the AirBnBDataHandler.
 * Implements a basic readline UI for the user to perform operations on AirBnB data.
 *
 * @module CLI
 */

import * as readline from "readline/promises";
import type { AirBnBDataHandler, Listing, HostRanking } from "./types/index";

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
    const rl = readline.createInterface({
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
          handleDisplayResults();
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
  const handleFiltering = async (rl: readline.Interface): Promise<void> => {
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

    console.log(`Number of listings: ${stats.count}`);
    console.log("\nAverage price per room type:");

    Object.entries(stats.averagePricePerRoom)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([roomType, price]) => {
        // Format price as currency with 2 decimal places, handle NaN values
        const formattedPrice = isNaN(price as number) ? "N/A" : `$${(price as number).toFixed(2)}`;
        console.log(`${roomType}: ${formattedPrice}`);
      });
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
   * Prompts the user for a file path and exports the current results
   *
   * @param {readline.Interface} rl - The readline interface for user input
   * @returns {Promise<void>} A promise that resolves when the export is complete
   */
  const handleExport = async (rl: readline.Interface): Promise<void> => {
    console.log("\n=== EXPORT RESULTS ===");

    const outputPath = await rl.question("Enter the output file path: ");
    if (!outputPath) {
      console.log("Export cancelled.");
      return;
    }

    try {
      await dataHandler.exportResults(outputPath);
      console.log(`Results successfully exported to ${outputPath}`);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  /**
   * Handles displaying current results
   * Shows a summary of the currently filtered listings
   *
   * @returns {void}
   */
  const handleDisplayResults = (): void => {
    console.log("\n=== CURRENT RESULTS ===");

    const listings = dataHandler.getFilteredListings();
    console.log(`Current filtered listings: ${listings.length}`);

    if (listings.length > 0) {
      console.log("\nSample of listings:");
      listings.slice(0, 5).forEach((listing: Listing, index: number) => {
        console.log(`\n${index + 1}. ${listing.name} (ID: ${listing.id})`);
        console.log(`   Host: ${listing.host_name} (ID: ${listing.host_id})`);
        // Format price as currency with 2 decimal places
        const formattedPrice = isNaN(listing.price) ? "N/A" : `$${listing.price.toFixed(2)}`;
        console.log(`   Price: ${formattedPrice}`);
        console.log(`   Room type: ${listing.room_type}`);
        console.log(`   Location: ${listing.neighbourhood}`);
        console.log(`   Minimum nights: ${listing.minimum_nights}`);
        console.log(`   Reviews: ${listing.number_of_reviews}`);
        console.log(`   Reviews in last 12 months: ${listing.number_of_reviews_ltm}`);
        console.log(`   Availability (days/year): ${listing.availability_365}`);
      });

      if (listings.length > 5) {
        console.log(`\n... and ${listings.length - 5} more listings.`);
      }
    }
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
  const getNumberInput = async (
    rl: readline.Interface,
    prompt: string,
    allowEmpty = false
  ): Promise<number | undefined> => {
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

  return { startCLI };
};

/**
 * Type definition for the CLI interface
 *
 * @typedef {Object} CLI
 * @property {Function} startCLI - Function to start the command line interface
 */
export type CLI = ReturnType<typeof createCLI>;
