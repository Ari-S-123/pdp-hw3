# Functional Programming Usage Examples

This document provides examples of how functional programming principles are used in this project, along with counter-examples that demonstrate what would break these principles.

## Functional Programming Principles Applied

### 1. Pure Functions

Pure functions are functions that:

- Given the same input, always return the same output
- Have no side effects
- Don't modify external state

**Example from our codebase:**

```typescript
// Pure function from airbnb-data-handler.ts
const parseRow = (row: string): Listing => {
  const values = row.split(",");

  // Clean price value - remove $ and any non-numeric characters except decimal point
  const priceStr = values[9] ? values[9].replace(/[$,]/g, "") : "0";
  const price = parseFloat(priceStr);

  return {
    id: values[0] || "",
    name: values[1] || "",
    host_id: values[2] || "",
    host_name: values[3] || "",
    neighbourhood_group: values[4] || "",
    neighbourhood: values[5] || "",
    latitude: parseFloat(values[6] || "0"),
    longitude: parseFloat(values[7] || "0"),
    room_type: values[8] || "",
    price: isNaN(price) ? 0 : price, // Default to 0 if price is NaN
    minimum_nights: parseInt(values[10] || "0"),
    number_of_reviews: parseInt(values[11] || "0"),
    last_review: values[12] || "",
    reviews_per_month: parseFloat(values[13] || "0") || 0,
    calculated_host_listings_count: parseInt(values[14] || "0"),
    availability_365: parseInt(values[15] || "0"),
    number_of_reviews_ltm: parseInt(values[16] || "0"),
    license: values[17] || ""
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

**Example from our codebase:**

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

**Example from our codebase:**

```typescript
// Method chaining in airbnb-data-handler.ts
// Each method returns the handler object for further chaining

const filter = (criteria: FilterCriteria) => {
  state.filteredListings = state.allListings.filter((listing) => {
    // Filter logic...
    return true;
  });

  // Reset statistics and rankings when filtering
  state.statistics = null;
  state.hostRankings = null;

  return handler; // Return handler for method chaining
};

// Usage example (from test.ts)
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

**Example from our codebase:**

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

### 2. Using Shared, Mutable State

```typescript
// BAD EXAMPLE - DO NOT USE
// This uses a shared mutable state which leads to unpredictable behavior
class ListingManager {
  private listings: Listing[] = [];
  private filteredListings: Listing[] = [];
  private statistics: Statistics | null = null;

  constructor(filePath: string) {
    // Load listings from file
    // Direct mutation of instance property
    this.listings = loadListingsFromFile(filePath);
    this.filteredListings = this.listings;
  }

  filterListings(criteria: FilterCriteria) {
    // Directly modifies the shared state
    this.filteredListings = this.listings.filter((listing) => {
      // Filter logic
      return listing.price >= (criteria.minPrice || 0);
    });

    // Side effect: modifying unrelated state
    this.statistics = null;
  }

  getListings() {
    // Returns a reference to the mutable array, not a copy
    return this.filteredListings;
  }

  computeStatistics() {
    // Direct mutation of instance property
    this.statistics = {
      count: this.filteredListings.length,
      averagePricePerRoom: {}
    };

    // More calculations with mutations...
  }
}
```

### 3. Using Classes and Inheritance Instead of Composition

```typescript
// BAD EXAMPLE - DO NOT USE
// Using classes and inheritance instead of function composition
class BaseHandler {
  protected allListings: Listing[] = [];
  protected filteredListings: Listing[] = [];

  constructor(filePath: string) {
    // Load data
    this.allListings = loadDataFromFile(filePath);
    this.filteredListings = [...this.allListings];
  }

  getListings() {
    return this.filteredListings;
  }
}

class FilterHandler extends BaseHandler {
  filterByPrice(minPrice: number) {
    this.filteredListings = this.filteredListings.filter((listing) => listing.price >= minPrice);
    return this;
  }

  filterByRoomType(roomType: string) {
    this.filteredListings = this.filteredListings.filter((listing) => listing.room_type === roomType);
    return this;
  }

  filterByName(name: string) {
    this.filteredListings = this.filteredListings.filter((listing) =>
      listing.name.toLowerCase().includes(name.toLowerCase())
    );
    return this;
  }
}

class StatsHandler extends FilterHandler {
  private statistics: Statistics | null = null;

  computeStats() {
    // Compute stats logic with mutation
    this.statistics = {
      count: this.filteredListings.length,
      averagePricePerRoom: {}
    };

    // More calculations...
    return this;
  }

  getStatistics() {
    return this.statistics; // Returning a reference, not a copy
  }
}

// Usage with inheritance
const handler = new StatsHandler("listings.csv");
handler.filterByPrice(200).filterByRoomType("Entire home/apt").computeStats();
```

### 4. Side Effects in Core Logic

```typescript
// BAD EXAMPLE - DO NOT USE
// Function with side effects
const computeAndSaveStats = (listings: Listing[]): Statistics => {
  // Calculate room type prices
  const roomTypePrices: Record<string, number[]> = {};

  listings.forEach((listing) => {
    if (!roomTypePrices[listing.room_type]) {
      roomTypePrices[listing.room_type] = [];
    }
    roomTypePrices[listing.room_type].push(listing.price);
  });

  const averages: Record<string, number> = {};

  // Side effect: writing to console inside core logic
  console.log(`Calculating statistics for ${listings.length} listings`);

  for (const [roomType, prices] of Object.entries(roomTypePrices)) {
    if (prices.length > 0) {
      const total = prices.reduce((sum, price) => sum + price, 0);
      averages[roomType] = total / prices.length;

      // Side effect: writing to console inside calculations
      console.log(`Average price for ${roomType}: $${averages[roomType].toFixed(2)}`);
    }
  }

  const statistics = {
    count: listings.length,
    averagePricePerRoom: averages
  };

  // Side effect: Writing to filesystem inside business logic
  const fs = require("fs");
  fs.writeFileSync("./latest-stats.json", JSON.stringify(statistics));

  return statistics;
};
```

### 5. Imperative Instead of Declarative Approach

```typescript
// BAD EXAMPLE - DO NOT USE
// Imperative approach with loops and mutable variables for host rankings
const badComputeHostRankings = (listings: Listing[]) => {
  const hostCounts: Record<string, { count: number; name: string }> = {};

  // Imperative loop with mutation
  for (let i = 0; i < listings.length; i++) {
    const listing = listings[i];
    const hostId = listing.host_id;

    if (hostCounts[hostId]) {
      hostCounts[hostId].count++; // Mutation
    } else {
      hostCounts[hostId] = {
        count: 1,
        name: listing.host_name
      };
    }
  }

  // Convert to array with another imperative loop
  const rankings: HostRanking[] = [];
  for (const hostId in hostCounts) {
    rankings.push({
      host_id: hostId,
      host_name: hostCounts[hostId].name,
      listingCount: hostCounts[hostId].count
    });
  }

  // Sort with a manual bubble sort implementation
  for (let i = 0; i < rankings.length; i++) {
    for (let j = i + 1; j < rankings.length; j++) {
      if (rankings[i].listingCount < rankings[j].listingCount) {
        // Swap with mutation
        const temp = rankings[i];
        rankings[i] = rankings[j];
        rankings[j] = temp;
      }
    }
  }

  return rankings;
};
```

## Conclusion

The counter-examples demonstrate practices that break functional programming principles by:

- Mutating shared state
- Causing side effects
- Using imperative instead of declarative approaches
- Relying on classes and inheritance instead of function composition
- Mixing concerns that should be separate

By avoiding these anti-patterns, our actual implementation remains true to functional programming paradigms, resulting in code that is more predictable, testable, and maintainable.

Our codebase demonstrates the power of functional programming through:

1. Method chaining that allows operations to be composed seamlessly
2. Immutable data structures that prevent unexpected side effects
3. Pure functions that are easy to test and reason about
4. Higher-order functions that enable powerful data transformations
5. Declarative programming that focuses on what to do rather than how to do it
