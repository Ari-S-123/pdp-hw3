import { createCLI } from "../cli";

/**
 * Type definition for the CLI interface
 *
 * Represents the command-line interface for interacting with the AirBnB data handler.
 * Provides methods for starting the CLI and handling user interactions.
 *
 * @typedef {Object} CLI
 * @property {Function} startCLI - Function to start the command line interface
 */
export type CLI = ReturnType<typeof createCLI>;
