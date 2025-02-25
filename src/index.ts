/**
 * Main entry point for the AirBnB Data Processor application
 *
 * This module integrates the AirBnBDataHandler and CLI modules
 * to provide a command-line interface for processing AirBnB listings data.
 * It handles command-line arguments and initializes the application components.
 *
 * @module index
 */

import { createAirBnBDataHandler } from "./airbnb-data-handler";
import { createCLI } from "./cli";

/**
 * Main function to run the application
 *
 * Initializes the AirBnBDataHandler with the input file specified in command-line arguments,
 * then creates and starts the CLI interface for user interaction.
 *
 * @returns {Promise<void>} A promise that resolves when the application exits
 * @throws {Error} If there is an error loading the data or initializing the application
 */
const main = async () => {
  try {
    // Get the input file path from command line arguments
    const args = process.argv.slice(2);

    if (args.length < 1) {
      console.error("Usage: bun run src/index.ts <csv_file_path>");
      process.exit(1);
    }

    const filePath = args[0];
    console.log(`Loading data from: ${filePath}`);

    // Create a new data handler with the input file
    const dataHandler = await createAirBnBDataHandler(filePath);
    console.log("Data loaded successfully.");

    // Create and start the CLI
    const cli = createCLI(dataHandler);
    await cli.startCLI();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

// Run the application
main();
