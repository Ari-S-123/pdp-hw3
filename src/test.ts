/**
 * Test script to demonstrate the AirBnB Data Processor
 *
 * This script creates a sample dataset and tests the AirBnBDataHandler functionality.
 * It demonstrates the core features of the data handler including filtering,
 * computing statistics, ranking hosts, and exporting results.
 *
 * @module test
 */

import { writeFile } from "fs/promises";
import { createAirBnBDataHandler } from "./airbnb-data-handler";

/**
 * Generate a sample CSV file for testing
 *
 * Creates a CSV file with sample AirBnB listings data that can be used
 * to test the functionality of the AirBnBDataHandler.
 *
 * @returns {Promise<string>} A promise that resolves to the path of the created file
 * @throws {Error} If the file could not be written
 */
const generateSampleData = async (): Promise<string> => {
  // CSV header
  const header =
    "id,name,host_id,host_name,neighbourhood_group,neighbourhood,latitude,longitude,room_type,price,minimum_nights,number_of_reviews,last_review,reviews_per_month,calculated_host_listings_count,availability_365,number_of_rooms,review_score";

  // Sample data rows
  const rows = [
    "1,Cozy Studio in Downtown,101,John Doe,Manhattan,Chelsea,40.7456,-73.9989,Entire home/apt,150,2,25,2022-10-15,3.5,2,300,1,4.8",
    "2,Luxury Penthouse,101,John Doe,Manhattan,Midtown,40.7580,-73.9855,Entire home/apt,500,3,15,2022-09-21,2.1,2,220,3,4.9",
    "3,Budget Room,102,Jane Smith,Brooklyn,Williamsburg,40.7128,-73.9566,Private room,75,1,42,2022-10-10,4.2,3,350,1,4.5",
    "4,Family Apartment,103,Bob Johnson,Queens,Astoria,40.7635,-73.9235,Entire home/apt,200,2,18,2022-08-05,2.0,1,180,2,4.7",
    "5,Luxury Suite,102,Jane Smith,Manhattan,Upper East Side,40.7736,-73.9566,Entire home/apt,450,2,30,2022-10-01,3.0,3,270,2,4.9",
    "6,Cozy Room,104,Sarah Williams,Brooklyn,Park Slope,40.6782,-73.9442,Private room,80,1,35,2022-09-15,3.8,1,330,1,4.6",
    "7,Modern Loft,105,Michael Brown,Manhattan,SoHo,40.7248,-74.0018,Entire home/apt,350,3,22,2022-10-12,2.5,1,200,2,4.8",
    "8,Historic Brownstone,103,Bob Johnson,Brooklyn,Brooklyn Heights,40.6975,-73.9935,Entire home/apt,280,2,19,2022-07-20,2.2,1,250,3,4.7",
    "9,Skyline View Studio,106,Lisa Garcia,Manhattan,Financial District,40.7077,-74.0116,Entire home/apt,220,2,28,2022-10-05,3.1,1,290,1,4.6",
    "10,Charming 1BR,107,David Miller,Queens,Long Island City,40.7447,-73.9485,Entire home/apt,180,2,32,2022-09-28,3.5,2,310,1,4.5"
  ];

  // Combine header and rows
  const data = [header, ...rows].join("\n");

  // Write to a file
  const filePath = "./sample_listings.csv";
  await writeFile(filePath, data, "utf-8");

  console.log(`Sample data written to ${filePath}`);
  return filePath;
};

/**
 * Run tests on the AirBnBDataHandler
 *
 * Tests the core functionality of the AirBnBDataHandler:
 * 1. Creating a data handler with sample data
 * 2. Filtering listings based on criteria
 * 3. Computing statistics on filtered listings
 * 4. Ranking hosts by number of listings
 * 5. Exporting results to a JSON file
 *
 * @returns {Promise<void>} A promise that resolves when all tests are complete
 */
const runTests = async () => {
  try {
    // Generate sample data
    const filePath = await generateSampleData();

    // Create data handler
    console.log("Creating data handler...");
    const dataHandler = await createAirBnBDataHandler(filePath);

    // Test filtering
    console.log(
      "\nFiltering listings with price >= 200, reviews >= 20, room type 'Entire home/apt', and maximum minimum nights of 3..."
    );
    dataHandler.filter({
      minPrice: 200,
      minReviews: 20,
      roomType: "Entire home/apt",
      maxMinimumNights: 3
    });
    console.log(`Filtered listings: ${dataHandler.getFilteredListings().length}`);

    // Test computing statistics
    console.log("\nComputing statistics...");
    dataHandler.computeStats();
    console.log("Statistics:", JSON.stringify(dataHandler.getStatistics(), null, 2));

    // Test host rankings
    console.log("\nComputing host rankings...");
    dataHandler.computeHostRankings();
    console.log("Host rankings:", JSON.stringify(dataHandler.getHostRankings(), null, 2));

    // Test exporting results
    console.log("\nExporting results as JSON...");
    const filterCriteria = {
      minPrice: 200,
      minReviews: 20,
      roomType: "Entire home/apt",
      maxMinimumNights: 3
    };
    await dataHandler.exportResults("./sample_results.json", "json", filterCriteria);

    // Test CSV export
    console.log("\nExporting results as CSV...");
    await dataHandler.exportResults("./sample_results.csv", "csv", filterCriteria);
  } catch (error) {
    console.error("Test failed:", error);
  }
};

// Run the tests
runTests();
