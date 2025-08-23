## 🚀 Quick Start

```bash
node src/main.js
```

That's it! No dependencies, no build steps. Just pure JavaScript magic. Watch the console output to see exactly what's happening under the hood.

## 🪄 The "Impossible" Behavior

This system makes this seemingly impossible code work:

```javascript
const state = createLiveTrackingProxy({
  user: { name: "Alice", theme: "dark" }
});

const userName = state.user.name;    // "Alice"
const userTheme = state.user.theme;  // "dark"

// Later... completely replace the user object
state.user = { name: "Bob", theme: "light" };

console.log(userName);  // "Bob" 🤯
console.log(userTheme); // "light" 🤯
```

How do `userName` and `userTheme` get the new values? They look like regular variables, but they're secretly shape-shifting functions that know their path back to the root state.

## 🔍 What's Happening Under the Hood

### 1. Cosplaying Functions
When you access `state.user.name`, you don't get a string. You get a function that:
- Can be called like a function: `userName()`  
- Transforms into a primitive when needed: `"Hello " + userName`
- Always reads from the original state using its remembered path
- Uses `Symbol.toPrimitive` to seamlessly convert in any context

### 2. Proxy Chain
Each proxy in the chain remembers its ancestry:
- `state.user` creates a proxy at path `['user']`
- `state.user.profile` creates a proxy at path `['user', 'profile']`  
- `state.user.profile.name` returns a live function at path `['user', 'profile', 'name']`

### 3. Automatic Dependency Tracking
The system tracks which variables are accessed during computations and automatically updates them when dependencies change.

## 🎮 Try It Out

The demo shows several patterns that all work:

**Direct Extraction:**
```javascript
const firstName = state.user.firstName;
const theme = state.user.profile.settings.theme;
```

**Chained Extraction (Revolutionary!):**
```javascript
const user = state.user;           // Proxy for ['user']
const profile = user.profile;      // Proxy for ['user', 'profile']  
const settings = profile.settings; // Proxy for ['user', 'profile', 'settings']
const theme = settings.theme;      // Live function for ['user', 'profile', 'settings', 'theme']
```

**Computed Values:**
```javascript
computed('fullName', () => `${firstName} ${lastName}`);
// Automatically updates when firstName or lastName change!
```

All of these patterns create variables that survive complete object replacement.

## 🔧 Key Features

- **Live Variables**: Variables stay connected to their source paths
- **Deep Nesting**: Works with arbitrarily deep object structures  
- **Automatic Dependency Tracking**: Computations automatically update when dependencies change
- **Cross-Context Usage**: Live variables work in any context (async, callbacks, etc.)
- **Path Equivalence**: Multiple extractions of the same path create equivalent live references

## 🎯 Real-World Applications

While this demo is intentionally simple, these techniques power production libraries like:
- **Vue 3's reactivity system** - Uses proxies for observation
- **MobX** - Uses `Symbol.toPrimitive` for observable values  
- **Testing frameworks** - Proxy-based mocking and spying
- **Development tools** - Dynamic instrumentation and debugging

## ⚠️ The TypeScript Situation

This repo uses vanilla JavaScript because TypeScript struggles with these dynamic features:
- `Symbol.toPrimitive` decisions happen at runtime, not compile time
- Proxies dynamically create properties that TypeScript can't predict
- The path tracking is invisible to static analysis

Most production libraries solve this with typed facades that hide the dynamic implementation.

## 🔍 Explore the Code

- **`src/reactive.js`** - The complete implementation with dependency tracking
- **`src/main.js`** - Comprehensive demo showing all the patterns
- **Console output** - Watch the proxy chains and dependency tracking in real-time

## 🤓 Going Deeper

If you want to understand how this works:

1. **Start with the console output** - Every step is logged with emojis
2. **Read the comments** - The code is heavily documented  
3. **Modify the demo** - Try breaking things to see what happens
4. **Check the dependency graph** - See which computations depend on which paths

## 🎉 Have Fun!

This is JavaScript at its weirdest and most wonderful. The language's willingness to let you redefine fundamental operations is exactly what makes these elegant abstractions possible.

What will you build with these superpowers?