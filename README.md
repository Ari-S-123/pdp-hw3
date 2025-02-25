# AirBnB Data Processor

A functional programming application for processing AirBnB listings data. This project demonstrates functional programming principles using TypeScript and the Bun runtime.

## TODO

- [ ] Add creative addition
- [ ] Document AI usage
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

- **Rank hosts** by number of listings

  - Sort hosts by the number of listings they have
  - Display top hosts with listing counts

- **Export results** to a JSON file

  - Save filtered listings, statistics, and host rankings

- **Interactive command-line interface**
  - User-friendly menu system
  - Guided filtering process

## Setup

1. Clone Repo

2. Make sure you are using the latest Node LTS version at the time of the last commit [v22.x].

3. Run `npm i -g bun` to install Bun.

4. Run `bun i` to install the dependencies.

## Usage

The application accepts a CSV file containing AirBnB listings data as input:

```bash
bun run src/index.ts <path_to_csv_file>
```

### Data Source

The application is designed to work with CSV data from the [AirBnB Get the Data page](https://insideairbnb.com/get-the-data/). Download a listings file, unzip it, and provide the path to the unzipped CSV file when running the application.

### Command Line Interface

The application provides an interactive command-line interface with the following options:

1. **Filter listings**: Apply various filter criteria to narrow down listings
2. **Compute statistics**: Calculate statistics on the currently filtered listings
3. **Rank hosts**: Generate a ranking of hosts by number of listings
4. **Export results**: Export the current results to a JSON file
5. **Display results**: Show a sample of the current filtered listings
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
- **Type Definitions**: Using TypeScript types instead of interfaces

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

## Running Tests

A test script is included to demonstrate the functionality:

```bash
bun run src/test.ts
```

This creates a sample dataset and demonstrates filtering, computing statistics, ranking hosts, and exporting results.

## Video

TODO

## AI Usage

TODO

I used Cursor with `claude-3.7-sonnet-thinking` to help me generate documentation, tests, and some type definitions.
