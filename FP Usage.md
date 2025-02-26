# Functional Programming Usage Examples

This document provides examples of how functional programming principles are used in this project, along with counter-examples that demonstrate what would break these principles.

## Functional Programming Principles Applied

### 1. Pure Functions

Pure functions are functions that:

- Given the same input, always return the same output
- Have no side effects
- Don't modify external state

**Example from the codebase:**

```typescript
// Pure function from airbnb-data-handler.ts
const parseRow = (row: string): Listing => {
  // More robust CSV parsing that handles quoted values with commas
  const values: string[] = [];
  let currentValue = "";
  let insideQuotes = false;
  let i = 0;

  while (i < row.length) {
    const char = row[i];

    // This is giving me too many headaches
    // eslint-disable-next-line quotes
    if (char === '"' && (i === 0 || row[i - 1] !== "\\")) {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      values.push(currentValue);
      currentValue = "";
    } else {
      currentValue += char;
    }

    i++;
  }

  // Add the last value
  values.push(currentValue);

  // Clean up values - remove surrounding quotes and unescape embedded quotes
  const cleanValues = values.map((value) => {
    let cleanValue = value.trim();
    // If value starts and ends with quotes, remove them
    // This is giving me too many headaches
    // eslint-disable-next-line quotes
    if (cleanValue.startsWith('"') && cleanValue.endsWith('"')) {
      cleanValue = cleanValue.slice(1, -1);
    }
    // Replace double quotes with single quotes - using double quotes for string literals
    // This is giving me too many headaches
    // eslint-disable-next-line quotes
    cleanValue = cleanValue.replace(/""/g, '"');
    return cleanValue;
  });

  // Clean price value - remove $ and any non-numeric characters except decimal point
  const priceStr = cleanValues[9] ? cleanValues[9].replace(/[$,]/g, "") : "0";
  const price = parseFloat(priceStr);

  // Parse reviews_per_month, but preserve empty values
  let reviewsPerMonth: number | null = null;
  if (cleanValues[13] && cleanValues[13].trim() !== "") {
    reviewsPerMonth = parseFloat(cleanValues[13]);
    if (isNaN(reviewsPerMonth)) {
      reviewsPerMonth = 0;
    }
  }

  return {
    id: cleanValues[0] || "",
    name: cleanValues[1] || "",
    host_id: cleanValues[2] || "",
    host_name: cleanValues[3] || "",
    neighbourhood_group: cleanValues[4] || "",
    neighbourhood: cleanValues[5] || "",
    latitude: parseFloat(cleanValues[6] || "0"),
    longitude: parseFloat(cleanValues[7] || "0"),
    room_type: cleanValues[8] || "",
    price: isNaN(price) ? 0 : price, // Default to 0 if price is NaN
    minimum_nights: parseInt(cleanValues[10] || "0"),
    number_of_reviews: parseInt(cleanValues[11] || "0"),
    last_review: cleanValues[12] || "",
    reviews_per_month: reviewsPerMonth,
    calculated_host_listings_count: parseInt(cleanValues[14] || "0"),
    availability_365: parseInt(cleanValues[15] || "0"),
    number_of_reviews_ltm: parseInt(cleanValues[16] || "0"),
    license: cleanValues[17] || ""
  };
};
```

This function is pure because:

- It always returns the same output for the same input string
- It doesn't modify any state outside its scope
- It has no side effects

### 2. High-Order Functions

High-order functions are functions that:

- Take one or more functions as arguments
- Return a function as a result

**Example from the codebase:**

```typescript
// Using high-order functions like filter, map, and reduce in airbnb-data-handler.ts

// When loading data:
state.allListings = rows
  .slice(1)
  .filter((row) => row.trim())
  .map(parseRow);

// When computing host rankings:
const hostCounts = state.filteredListings.reduce<Record<string, { count: number; name: string }>>((acc, listing) => {
  if (!acc[listing.host_id]) {
    acc[listing.host_id] = { count: 0, name: listing.host_name };
  }
  acc[listing.host_id].count += 1;
  return acc;
}, {});

// Transform and sort in a chain
state.hostRankings = Object.entries(hostCounts)
  .map(([host_id, { count, name }]) => ({
    host_id,
    host_name: name,
    listingCount: count
  }))
  .sort((a, b) => b.listingCount - a.listingCount);
```

### 3. Function Composition and Method Chaining

Function composition enables creating new functions by combining existing ones.

**Example from the codebase:**

```typescript
// Method chaining in airbnb-data-handler.ts
// Each method returns the handler object for further chaining

const filter = (criteria: FilterCriteria) => {
  state.filteredListings = state.allListings.filter((listing) => {
    // Filter logic...
    // (Multiple filter conditions checked)
    return true;
  });

  // Store the applied filters (make a copy to avoid external mutation)
  state.lastAppliedFilters = { ...criteria };

  // Reset statistics and rankings when filtering
  state.statistics = null;
  state.hostRankings = null;

  return handler; // Return handler for method chaining
};

// Usage example (possible usage pattern):
dataHandler
  .filter({
    minPrice: 200,
    minReviews: 20,
    roomType: "Entire home/apt",
    maxMinimumNights: 3
  })
  .computeStats()
  .computeHostRankings();
```

### 4. Immutability

Immutability means that once a data structure is created, it cannot be changed.

**Example from the codebase:**

```typescript
// Getter functions return copies rather than references to internal state
// From airbnb-data-handler.ts

const getFilteredListings = (): Listing[] => {
  return [...state.filteredListings]; // Return a copy of the array
};

const getStatistics = (): Statistics | null => {
  return state.statistics ? { ...state.statistics } : null; // Return a copy of the object
};

const getHostRankings = (): HostRanking[] | null => {
  return state.hostRankings ? [...state.hostRankings] : null; // Return a copy of the array
};

// When setting applied filters, we make a copy to avoid external mutation
state.lastAppliedFilters = { ...criteria };
```

## Counter-Examples: Breaking Functional Programming Principles

### 1. Mutation of External State (Breaking Purity)

A non-functional approach would directly modify external state, causing side effects.

```typescript
// BAD EXAMPLE - DO NOT USE
// This breaks purity by mutating external state
let globalListings: Listing[] = [];

const badFilter = (criteria: FilterCriteria) => {
  for (let i = 0; i < globalListings.length; i++) {
    const listing = globalListings[i];

    // Direct mutation of the array during iteration
    if (criteria.minPrice !== undefined && listing.price < criteria.minPrice) {
      globalListings.splice(i, 1);
      i--; // Adjust index after removal
    } else if (criteria.name !== undefined && !listing.name.toLowerCase().includes(criteria.name.toLowerCase())) {
      globalListings.splice(i, 1);
      i--;
    }
    // More conditions with similar mutations...
  }

  // No return value for chaining
};
```

### 2. Impure CSV Parsing (Alternative to parseRow)

```typescript
// BAD EXAMPLE - DO NOT USE
// This breaks purity by using global state and causing side effects
let lastParsedRow: string = ""; // Global state

const impureParseRow = (row: string): Listing => {
  // Side effect: logging
  console.log(`Parsing row: ${row.substring(0, 50)}...`);

  // Side effect: mutating external state
  lastParsedRow = row;

  // Direct side effect: writing to file system
  require("fs").appendFileSync("parsing-log.txt", `Parsed row at ${new Date()}: ${row}\n`);

  const values = row.split(",");

  // Rest of parsing logic similar to before
  // ...

  return {
    id: values[0] || "",
    name: values[1] || ""
    // ...other fields
  };
};
```

### 3. Using Loops and Mutations Instead of Higher-Order Functions

```typescript
// BAD EXAMPLE - DO NOT USE
// Using loops and mutations instead of higher-order functions

// Instead of using filter and map for loading data:
const badLoadData = async (): Promise<void> => {
  const content = await readFile(filePath, "utf-8");
  const rows = content.split("\n");

  // Skip header row
  const dataRows = rows.slice(1);

  state.allListings = [];

  // Mutable approach with loops
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    if (row.trim()) {
      const listing = parseRow(row);
      state.allListings.push(listing);
    }
  }

  state.filteredListings = [];

  // Another mutation with copy loop
  for (let i = 0; i < state.allListings.length; i++) {
    state.filteredListings.push(state.allListings[i]);
  }
};

// Instead of using reduce and method chains for host rankings:
const badComputeHostRankings = (): void => {
  const hostCounts = {};

  // Manual loop instead of reduce
  for (let i = 0; i < state.filteredListings.length; i++) {
    const listing = state.filteredListings[i];
    if (!hostCounts[listing.host_id]) {
      hostCounts[listing.host_id] = {
        count: 0,
        name: listing.host_name
      };
    }
    hostCounts[listing.host_id].count++;
  }

  // Manual array creation instead of map
  state.hostRankings = [];
  for (const hostId in hostCounts) {
    state.hostRankings.push({
      host_id: hostId,
      host_name: hostCounts[hostId].name,
      listingCount: hostCounts[hostId].count
    });
  }

  // Manual sorting instead of sort method
  for (let i = 0; i < state.hostRankings.length; i++) {
    for (let j = i + 1; j < state.hostRankings.length; j++) {
      if (state.hostRankings[i].listingCount < state.hostRankings[j].listingCount) {
        const temp = state.hostRankings[i];
        state.hostRankings[i] = state.hostRankings[j];
        state.hostRankings[j] = temp;
      }
    }
  }
};
```

### 4. Procedural Method Chaining Alternative

```typescript
// BAD EXAMPLE - DO NOT USE
// Breaking method chaining with procedural approach

class AirBnBProcessor {
  private listings: Listing[] = [];
  private filteredListings: Listing[] = [];
  private statistics: Statistics | null = null;
  private rankings: HostRanking[] | null = null;

  constructor(filePath: string) {
    // Load listings from file
  }

  filter(criteria: FilterCriteria): void {
    this.filteredListings = this.listings.filter(/* filter logic */);
    // No return value for chaining
  }

  computeStats(): void {
    // Compute stats logic
    // No return value for chaining
  }

  computeHostRankings(): void {
    // Compute rankings logic
    // No return value for chaining
  }

  // Procedural usage:
  // const processor = new AirBnBProcessor("file.csv");
  // processor.filter({ minPrice: 200 });
  // processor.computeStats();
  // processor.computeHostRankings();
}
```

### 5. Breaking Immutability by Returning References

```typescript
// BAD EXAMPLE - DO NOT USE
// Returning references to internal state instead of copies

const badGetFilteredListings = (): Listing[] => {
  return state.filteredListings; // Returning direct reference, not a copy
};

const badGetStatistics = (): Statistics | null => {
  return state.statistics; // Returning direct reference, not a copy
};

const badGetHostRankings = (): HostRanking[] | null => {
  return state.hostRankings; // Returning direct reference, not a copy
};

// This would allow the caller to mutate internal state directly:
// const listings = badGetFilteredListings();
// listings.pop(); // This would modify state.filteredListings!
```

## Conclusion

The counter-examples demonstrate practices that break functional programming principles by:

- Mutating shared state
- Causing side effects
- Using imperative instead of declarative approaches
- Relying on classes and inheritance instead of function composition
- Mixing concerns that should be separate

By avoiding these anti-patterns, the actual implementation remains true to functional programming paradigms, resulting in code that is more predictable, testable, and maintainable.

The codebase demonstrates the power of functional programming through:

1. Method chaining that allows operations to be composed seamlessly
2. Immutable data structures that prevent unexpected side effects
3. Pure functions that are easy to test and reason about
4. Higher-order functions that enable powerful data transformations
5. Declarative programming that focuses on what to do rather than how to do it
