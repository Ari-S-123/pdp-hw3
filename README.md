# AirBnB Data Processor

A functional programming application for processing AirBnB listings data. This project demonstrates functional programming principles using TypeScript and the Bun runtime.

## TODO

- [x] Add creative addition: Paginated browsing of listings
- [x] Document AI usage
- [ ] Add demo video

## Features

- **Filter listings** based on multiple criteria:

  - Listing name (partial text match)
  - Price range (minimum/maximum)
  - Number of reviews (minimum/maximum)
  - Number of reviews in last 12 months (minimum/maximum)
  - Room type (Entire home/apt, Private room, Shared room, Hotel room)
  - Neighbourhood (partial text match)
  - Minimum nights requirement (minimum/maximum values)
  - Availability (minimum/maximum days per year)
  - Host name (partial text match)

- **Compute statistics** on filtered listings:

  - Total count of filtered listings
  - Average price per room type
  - Average number of reviews per listing
  - Average number of reviews in the last 12 months
  - Average minimum nights required for booking
  - Average availability out of 365 days
  - Average reviews per month (non-null values only)
  - Average number of listings per host
  - Median price of all listings
  - Minimum price among listings
  - Maximum price among listings

- **Rank hosts** by number of listings

  - Sort hosts by the number of listings they have
  - Display top hosts with listing counts

- **Export results** to file formats:

  - JSON format (includes listings, statistics, and host rankings)
  - CSV format (includes only the listings data)
  - Includes automatic creation of a descriptive file with applied filters

- **Interactive command-line interface**
  - User-friendly menu system
  - Guided filtering process
  - Creative Addition: Paginated browsing of listings

## Setup

1. Clone repository.

2. Make sure you are using the latest Node LTS version at the time of the last commit [v22.x].

3. Run `npm i -g bun` to install Bun.

4. Run `bun i` to install the dependencies.

## Usage

The application accepts a CSV file containing AirBnB listings data as input:

```bash
bun run src/index.ts <path_to_csv_file>
```

To use the provided `listings.csv` file, run:

```bash
bun start
```

Exports are located in the `exports` directory which is created if it doesn't exist and also ignored by git.

### Data Source

The application is designed to work with CSV data from the [AirBnB Get the Data page](https://insideairbnb.com/get-the-data/). Download a listings file, unzip it, and provide the path to the unzipped CSV file when running the application.

### Command Line Interface

The application provides an interactive command-line interface with the following options:

1. **Filter listings**: Apply various filter criteria to narrow down listings
2. **Compute statistics**: Calculate statistics on the currently filtered listings
3. **Rank hosts**: Generate a ranking of hosts by number of listings
4. **Export results**: Export the current results to a JSON or CSV file
5. **Display results**: Show paginated view of filtered listings with navigation controls:
   - Browse through listings with next/previous page options
   - Jump to a specific page
   - View complete listing details
6. **Exit**: Exit the application

## Project Structure

- `src/airbnb-data-handler.ts`: Core module for processing AirBnB data using functional programming
- `src/cli.ts`: Command-line interface module
- `src/index.ts`: Main entry point that integrates the modules
- `src/test.ts`: Test script that demonstrates core functionality
- `src/types/`: Directory containing all TypeScript type definitions
  - `listing.ts`: Type definition for AirBnB listing data
  - `filter-criteria.ts`: Type definition for filter criteria
  - `statistics.ts`: Type definition for computed statistics
  - `host-ranking.ts`: Type definition for host rankings
  - `data-handler-state.ts`: Type definition for internal state
  - `airbnb-data-handler.ts`: Type definition for the data handler
  - `cli.ts`: Type definition for the CLI interface
  - `index.ts`: Exports all types

## Functional Programming Concepts Used

This project demonstrates several functional programming concepts:

- **Pure Functions**: Functions that always return the same output for the same input and have no side effects
- **High-Order Functions**: Functions that take functions as arguments or return functions (map, filter, reduce)
- **Function Composition**: Building complex logic by combining simpler functions
- **Method Chaining**: Enabling fluent APIs through function chaining
- **Immutability**: Avoiding direct mutation of data structures

For more details on the functional programming concepts used, please refer to the [FP Usage](FP%20Usage.md) file.

## Documentation

The code is thoroughly documented using comprehensive JSDoc style comments. Each module, function, type, and property has detailed documentation explaining its purpose, parameters, return values, and potential exceptions.

Documentation includes:

- Module descriptions
- Function signatures with parameter and return type information
- Type definitions with property descriptions
- Private/internal function documentation
- Usage examples

This documentation provides both developer guidance and enables better IDE support with improved autocompletion, type checking, and inline documentation.

## Development

This project uses:

- **TypeScript**: For static typing
- **Bun**: As the JavaScript/TypeScript runtime
- **ES Modules**: For module system
- **Prettier**: For code formatting
- **ESLint**: For linting
- **Fast-CSV**: For CSV parsing and formatting

## Running Tests

A test script is included to demonstrate the functionality:

```bash
bun run src/test.ts
```

This creates a sample dataset and demonstrates filtering, computing statistics, ranking hosts, and exporting results.

## Video

TODO

## AI Usage

I used Cursor Composer in Agent mode with `claude-3.7-sonnet-thinking` and also Tab Autocomplete to help me with various aspects of this project:

1. **Documentation Generation**: AI assisted with creating comprehensive JSDoc comments for functions, types, and modules.

2. **Type Definitions**: AI helped design and implement well-structured TypeScript type definitions for the application.

3. **Code Refactoring**: AI provided suggestions for refactoring code to better adhere to functional programming principles.

4. **Test Creation**: AI helped write the test script that demonstrates the core functionality of the application.

5. **Bug Detection**: AI identified potential logical issues and type mismatches that were fixed during development.

AI assistance was particularly valuable for establishing consistent documentation patterns and ensuring the functional programming paradigm was properly applied throughout the codebase.

Some prompts I used:

- Write a script that I can use to test this application.
- Update @handleComputeStatistics to show every statistic and not just count and average price.
- Can you figure out why there is a double input bug in the pagination navigation menu? Can you also help me fix it?
- Update the import and export functionality in @airbnb-data-handler.ts and @cli.ts to use the fast-csv package.
- Can you update @README.md and @FP%20Usage.md to reflect all the changes we've made to the codebase together today?

Everything generated by the Agent was manually verified and/or edited by me to ensure it was correct and worked as expected.
