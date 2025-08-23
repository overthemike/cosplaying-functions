import { createLiveTrackingProxy, computed, computedRegistry, dependencyGraph } from "./reactive.js";

const state = createLiveTrackingProxy({
  user: {
    firstName: "John",
    lastName: "Doe",
    profile: {
      email: "john@example.com",
      settings: {
        theme: "dark",
        notifications: true
      }
    }
  },
  app: {
    cart: {
      items: [],
      total: 0
    },
    ui: {
      sidebar: true,
      modal: null
    }
  }
});

console.log("=== Complete Live Reference System Demo ===");

// Test 1: Direct extraction (simple case)
console.log("\n1. === DIRECT EXTRACTION ===");
const firstName = state.user.firstName;
const lastName = state.user.lastName;
const total = state.app.cart.total;

console.log("Extracted variables work:");
console.log(`Name: ${firstName} ${lastName}`);
console.log(`Total: $${total}`);

// Test 2: Chained extraction (the revolutionary part!)
console.log("\n2. === CHAINED EXTRACTION ===");
const user = state.user;                    // Proxy for ['user']
const profile = user.profile;               // Proxy for ['user', 'profile']  
const settings = profile.settings;          // Proxy for ['user', 'profile', 'settings']
const theme = settings.theme;               // Live primitive for ['user', 'profile', 'settings', 'theme']
const notifications = settings.notifications; // Live primitive for ['user', 'profile', 'settings', 'notifications']

console.log("Chained extraction works:");
console.log(`Theme: ${theme}`);
console.log(`Notifications: ${notifications}`);

// Test 3: Deep chained extraction
console.log("\n3. === DEEP CHAINED EXTRACTION ===");
const app = state.app;
const cart = app.cart;
const cartTotal = cart.total;
const ui = app.ui;
const sidebar = ui.sidebar;

console.log("Deep chained extraction:");
console.log(`Cart total: ${cartTotal}`);
console.log(`Sidebar visible: ${sidebar}`);

// Test 4: Mixed extraction patterns
console.log("\n4. === MIXED PATTERNS ===");
const email = state.user.profile.email;     // Direct deep access
const uiModal = app.ui.modal;                // Chained then direct
const userTheme = user.profile.settings.theme; // All chained

console.log("Mixed patterns:");
console.log(`Email: ${email}`);
console.log(`Modal: ${uiModal}`);
console.log(`User theme: ${userTheme}`);

// Test 5: Create computations using all extraction patterns
console.log("\n5. === COMPUTED VALUES WITH LIVE VARIABLES ===");

computed('fullName', () => `${firstName} ${lastName}`);
computed('userSummary', () => `${firstName} (${email}) - Theme: ${theme}`);
computed('appState', () => `Cart: $${cartTotal}, Sidebar: ${sidebar}`);
computed('deepComputed', () => `${userTheme} theme, notifications: ${notifications}`);

// Test 6: replace entire objects
console.log("\n6. === THE BIG TEST: OBJECT REPLACEMENT ===");

console.log("🔥 Replacing entire user object...");
state.user = {
  firstName: "Jane",
  lastName: "Smith", 
  profile: {
    email: "jane@example.com",
    settings: {
      theme: "light",
      notifications: false
    }
  }
};

console.log("🔥 Replacing entire app object...");
state.app = {
  cart: {
    items: [{ name: "Book", price: 29.99 }],
    total: 29.99
  },
  ui: {
    sidebar: false,
    modal: "settings"
  }
};

console.log("\n7. === AFTER OBJECT REPLACEMENT ===");
console.log("All variables automatically updated:");

// Direct extraction variables
console.log(`firstName: ${firstName}`);        // "Jane"
console.log(`lastName: ${lastName}`);          // "Smith"
console.log(`total: ${total}`);               // 29.99

// Chained extraction variables  
console.log(`theme: ${theme}`);               // "light"
console.log(`notifications: ${notifications}`); // false
console.log(`cartTotal: ${cartTotal}`);       // 29.99
console.log(`sidebar: ${sidebar}`);           // false

// Mixed pattern variables
console.log(`email: ${email}`);               // "jane@example.com"
console.log(`uiModal: ${uiModal}`);           // "settings"
console.log(`userTheme: ${userTheme}`);       // "light"

console.log("\n8. === COMPUTED VALUES AFTER REPLACEMENT ===");
for (const [name, computation] of computedRegistry.entries()) {
  console.log(`${name}: ${computation.lastResult}`);
}

// Test 7: Cross-context usage with live references
console.log("\n9. === CROSS-CONTEXT USAGE ===");

const userData = {
  name: firstName,           // Live reference
  contact: email,            // Live reference
  preferences: {
    theme: theme,            // Live reference
    notify: notifications    // Live reference
  }
};

const processUserData = (data) => {
  return `${data.name} (${data.contact}) prefers ${data.preferences.theme} theme, notifications: ${data.preferences.notify}`;
};

console.log("Cross-context result:", processUserData(userData));

// Test 8: Async usage
setTimeout(() => {
  console.log("\n10. === ASYNC USAGE (Delayed) ===");
  console.log(`Async firstName: ${firstName}`);
  console.log(`Async theme: ${theme}`);
  console.log(`Async cartTotal: ${cartTotal}`);
}, 50);

// Test 9: Demonstrate that new extractions are equivalent to old ones
console.log("\n11. === EXTRACTION EQUIVALENCE ===");
const newFirstName = state.user.firstName;

console.log("Old and new extractions have same paths:");
console.log("firstName path:", JSON.stringify(firstName.__tracking.path));
console.log("newFirstName path:", JSON.stringify(newFirstName.__tracking.path));
console.log("Paths equal:", JSON.stringify(firstName.__tracking.path) === JSON.stringify(newFirstName.__tracking.path));

console.log("\n12. === FINAL DEPENDENCY ANALYSIS ===");
console.log("Dependency graph:");
for (const [computation, deps] of dependencyGraph.entries()) {
  console.log(`${computation}: [${Array.from(deps).join(', ')}]`);
}