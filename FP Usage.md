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
// From CLI module - a pure function for pagination calculations
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
```

This function is pure because:

- It always returns the same output for the same input parameters
- It doesn't modify any state outside its scope
- It has no side effects - it only computes and returns a new value

Another pure function example:

```typescript
// Pure function to format listings in the CLI module
const formatListing = (listing: Listing, index: number): string => {
  // Format price as currency with 2 decimal places
  const formattedPrice = listing.price === undefined || isNaN(listing.price) ? "N/A" : `$${listing.price.toFixed(2)}`;

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
```

### 2. High-Order Functions

High-order functions are functions that:

- Take one or more functions as arguments
- Return a function as a result

**Example from the codebase:**

```typescript
// Using high-order functions like filter, map, and reduce in airbnb-data-handler.ts

// When filtering listings:
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

  // More conditions...
  return true;
});

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
  state.statistics = undefined;
  state.hostRankings = undefined;

  return handler; // Return handler for method chaining
};

// From test.ts - example of actual method chaining used in the codebase
console.log(
  "Filtering listings with price >= 200, reviews >= 20, room type 'Entire home/apt', and maximum minimum nights of 3..."
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

const getStatistics = (): Statistics | undefined => {
  return state.statistics ? { ...state.statistics } : undefined; // Return a copy of the object
};

const getHostRankings = (): HostRanking[] | undefined => {
  return state.hostRankings ? [...state.hostRankings] : undefined; // Return a copy of the array
};

const getLastAppliedFilters = (): FilterCriteria | undefined => {
  return state.lastAppliedFilters ? { ...state.lastAppliedFilters } : undefined; // Return a copy
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
// Compare with the pure calculatePagination function

let currentPage = 1; // Global state
let listings = []; // More global state

const impureCalculatePagination = (totalItems: number, pageSize: number) => {
  // Using and modifying external state
  if (currentPage < 1) currentPage = 1;

  // Modify global state as a side effect
  const totalPages = Math.ceil(totalItems / pageSize);
  if (currentPage > totalPages) currentPage = totalPages;

  // Log as a side effect
  console.log(`Showing page ${currentPage} of ${totalPages}`);

  // Modify the global listings array as a side effect
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  // Return value that depends on global state
  return {
    currentPage, // Uses external state
    startIndex,
    endIndex
  };
};

// Usage would involve modifying global state:
// currentPage = 3; // Set the global page
// const pagination = impureCalculatePagination(100, 10);
```

### 2. Impure Formatting Function (Alternative to formatListing)

```typescript
// BAD EXAMPLE - DO NOT USE
// This breaks purity by using global state and causing side effects
// Compare with the pure formatListing function

let formattedListings = []; // Global state to store formatted listings
let formattingOptions = { showPrice: true, showReviews: true }; // Global configuration

const impureFormatListing = (listing: Listing, index: number): string => {
  // Side effect: logging
  console.log(`Formatting listing: ${listing.id}`);

  // Using global state to determine output
  const formattedPrice = formattingOptions.showPrice
    ? listing.price === undefined || isNaN(listing.price)
      ? "N/A"
      : `$${listing.price.toFixed(2)}`
    : "Price hidden";

  const output = `\n${index}. ${listing.name} (ID: ${listing.id})
   Host: ${listing.host_name} (ID: ${listing.host_id})
   Price: ${formattedPrice}`;

  // Side effect: modifying global state
  formattedListings.push(output);

  // Return value, but also had side effects
  return output;
};
```

### 3. Using Loops and Mutations Instead of Higher-Order Functions

```typescript
// BAD EXAMPLE - DO NOT USE
// Using loops and mutations instead of higher-order functions

// Instead of using filter for filtering listings:
const badFilter = (allListings: Listing[], criteria: FilterCriteria) => {
  const filteredListings = [];

  // Imperative approach with loops
  for (let i = 0; i < allListings.length; i++) {
    const listing = allListings[i];
    let shouldInclude = true;

    // Price filter checks
    if (criteria.minPrice !== undefined && listing.price < criteria.minPrice) {
      shouldInclude = false;
    }

    if (shouldInclude && criteria.maxPrice !== undefined && listing.price > criteria.maxPrice) {
      shouldInclude = false;
    }

    // Review count checks
    if (shouldInclude && criteria.minReviews !== undefined && listing.number_of_reviews < criteria.minReviews) {
      shouldInclude = false;
    }

    // Add more conditions...

    if (shouldInclude) {
      filteredListings.push(listing);
    }
  }

  return filteredListings;
};

// Instead of using reduce and method chains for host rankings:
const badComputeHostRankings = (
  listings: Listing[]
): Array<{ host_id: string; host_name: string; listingCount: number }> => {
  const hostCounts = {};

  // Manual loop instead of reduce
  for (let i = 0; i < listings.length; i++) {
    const listing = listings[i];
    if (!hostCounts[listing.host_id]) {
      hostCounts[listing.host_id] = {
        count: 0,
        name: listing.host_name
      };
    }
    hostCounts[listing.host_id].count++;
  }

  // Manual array creation instead of map
  const rankings = [];
  for (const hostId in hostCounts) {
    rankings.push({
      host_id: hostId,
      host_name: hostCounts[hostId].name,
      listingCount: hostCounts[hostId].count
    });
  }

  // Manual sorting instead of sort method
  for (let i = 0; i < rankings.length; i++) {
    for (let j = i + 1; j < rankings.length; j++) {
      if (rankings[i].listingCount < rankings[j].listingCount) {
        const temp = rankings[i];
        rankings[i] = rankings[j];
        rankings[j] = temp;
      }
    }
  }

  return rankings;
};
```

### 4. Procedural Method Chaining Alternative

```typescript
// BAD EXAMPLE - DO NOT USE
// Breaking method chaining with procedural approach

class AirBnBProcessor {
  private allListings: Listing[] = [];
  private filteredListings: Listing[] = [];
  private statistics: Statistics | undefined = undefined;
  private rankings: HostRanking[] | undefined = undefined;

  constructor(filePath: string) {
    // Load listings from file
  }

  filter(criteria: FilterCriteria): void {
    this.filteredListings = this.allListings.filter(/* filter logic */);
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

  // Procedural usage (compare with the fluent method chaining in test.ts):
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

const badGetStatistics = (): Statistics | undefined => {
  return state.statistics; // Returning direct reference, not a copy
};

const badGetHostRankings = (): HostRanking[] | undefined => {
  return state.hostRankings; // Returning direct reference, not a copy
};

const badGetLastAppliedFilters = (): FilterCriteria | undefined => {
  return state.lastAppliedFilters; // Returning direct reference, not a copy
};

// This would allow the caller to mutate internal state directly:
// const listings = badGetFilteredListings();
// listings.pop(); // This would modify state.filteredListings!
//
// const stats = badGetStatistics();
// if (stats) {
//   stats.count = 0; // This would modify state.statistics!
// }
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
