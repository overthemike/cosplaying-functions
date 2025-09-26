# Cosplay & Wiretapping: JavaScript’s Hidden Superpowers

> NOTE: I also turned this into an experimental reactive state management library for React: https://github.com/overthemike/ripplio

A tiny **teaching demo** that shows how JavaScript can:
 - **Cosplay** as primitives via `Symbol.toPrimitive`
 - **Wiretap** object access with `Proxy`
 - Create **live primitive references** that keep resolving against the *current* state—even after object replacement

**This is not a production library.** It’s a self-contained demo to learn how these tricks work.

---

## 🚀 Quick Start

~~~bash
# If files live in ./src
node src/main.js

# If files live at the repo root, use:
# node main.js
~~~

- No dependencies, no build steps—just Node.
- Watch the console output; it logs what’s happening under the hood.

---

## 🪄 The “Impossible” Behavior (What you’ll see)

~~~js
import { createLiveTrackingProxy, computed } from "./reactive.js";

const state = createLiveTrackingProxy({
  user: { firstName: "Ada", lastName: "Lovelace" },
});

// Extract once…
const first = state.user.firstName;   // <-- “live primitive”
const last  = state.user.lastName;

// Use as if they were strings…
console.log(`${first} ${last}`); // "Ada Lovelace"

// Now replace the whole subtree:
state.user = { firstName: "Grace", lastName: "Hopper" };

// …the *previously extracted variables* still resolve to the new values:
console.log(`${first} ${last}`); // "Grace Hopper"

// Computeds track dependencies by path:
computed("fullName", () => `${first} ${last}`);
~~~

**Why it feels impossible:** `first` and `last` are *functions* masquerading as primitives. When coerced (string template / `+` / comparison), they read the *current* value at the recorded path in the original state object. Proxies wiretap property access and return these “live” sentinels instead of raw strings.

---

## 🧭 Folder Map
```bash
src/
  reactive.js # the example implementation (proxy + live primitive + computed graph)
  main.js     # runnable demo covering direct/chained extraction, replacement, computeds, async reads
```

---

## 🧩 How It Works (90-second tour)

1. **Proxy wiretaps** every `get` and returns either:
   - a new proxy (for objects), or
   - a **live primitive** function (for leaf values).
2. The live primitive has a `Symbol.toPrimitive` that:
   - records a dependency on the current **path** (e.g., `user.firstName`),
   - then reads the latest value from the *original* state object.
3. **Computed** values run inside a “current computation” context, so any coercion of live primitives during that run gets recorded in a dependency graph.
4. When the state changes (including **object replacement**), we figure out which paths were touched and rerun any computeds that depend on matching prefixes.
5. Re-coercing a previously extracted live primitive always resolves the newest value at its path.

---

## 🧪 What to Play With

- Replace `state.user`, then log previously extracted variables.
- Build a computed that depends on another computed (e.g., `greeting` depends on `fullName`).
- Change nested fields (`state.user.firstName = "Linus"`) and watch recomputes.
- Try async reassignments and observe dependency tracking.

---

## ⚠️ Limitations (by design; this is a teaching demo)

- **TypeScript** can’t model this dynamic coercion precisely; types collapse to `any` quickly.
- `JSON.stringify` on a live primitive (which is a function) won’t give you the string value unless you coerce first.
- **Equality**: strict `===` on a live primitive vs literal string will be `false` (one is a function). Coerce first (template literal / `String(live)`), or expose a `.value` getter if you add one.
- **Arrays**: index/`length` changes can feel noisy; a production system would normalize notifications to the collection path.
- **Not for production**—debuggability and maintainability drop off fast with heavy meta-programming. The point here is learning.

---

## 🙋 FAQ

**Q: Why do “strings” I pulled earlier update after I replace the object?**  
They aren’t strings—they’re *functions* with `Symbol.toPrimitive`. Coercion makes them look/behave like strings, but each use re-reads the current value at the recorded path.

**Q: Why not just use a framework?**  
Exactly. Frameworks do this kind of thing for you. The goal here is to show *how the magic can work* using only built-ins.

**Q: Can I use this at work?**  
Please don’t ship it. Take the ideas—path-based dependency tracking, coercion tricks, proxy interception—and apply them judiciously where appropriate.

---

## Appendix: Concepts

1. **Cosplay (`Symbol.toPrimitive`)**  
   A method objects/functions can implement to decide how they convert to a primitive (string/number/default). Template literals and arithmetic trigger it.

2. **Wiretapping (`Proxy`)**  
   Intercepts operations like `get`/`set` on a target object. Perfect for returning dynamic placeholders (like our live primitives) instead of plain values.

3. **Path-based Dependency Graph**  
   During a computed run, any coercion of a live primitive records its path (e.g., `user.firstName`) as a dependency of that computed. When a path changes, recompute any dependents whose dependency is a prefix/suffix match.
