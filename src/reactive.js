export const computedRegistry = new Map();
export const dependencyGraph = new Map();
let currentComputation = null;

// Helper to get value at a path in an object
const getValueAtPath = (obj, path) => {
  return path.reduce((current, key) => current?.[key], obj);
};

// Create a live tracking primitive that always resolves against original state
export const createLiveTrackingPrimitive = (originalState, path, onDependencyAccess) => {
  const trackingFn = () => getValueAtPath(originalState, path);
  
  trackingFn.__tracking = { path, isLive: true };
  trackingFn.__originalState = originalState;
  
  trackingFn[Symbol.toPrimitive] = (hint) => {
    const currentValue = getValueAtPath(originalState, path);
    onDependencyAccess?.(path);
    console.log(`🔥 Live tracking: ${path.join('.')} (${hint}) = ${currentValue}`);
    return currentValue;
  };
  
  trackingFn.valueOf = () => {
    const currentValue = getValueAtPath(originalState, path);
    onDependencyAccess?.(path);
    console.log(`🔥 Live valueOf: ${path.join('.')} = ${currentValue}`);
    return currentValue;
  };
  
  trackingFn.toString = () => {
    const currentValue = getValueAtPath(originalState, path);
    onDependencyAccess?.(path);
    console.log(`🔥 Live toString: ${path.join('.')} = ${currentValue}`);
    return String(currentValue);
  };
  
  return trackingFn;
};

// Create tracking proxy that maintains original state reference and path context
export const createLiveTrackingProxy = (target, originalState = null, basePath = []) => {
  // If this is the root call, originalState is the target itself
  if (originalState === null) {
    originalState = target;
  }
  
  return new Proxy(target, {
    get(obj, prop) {
      if (typeof prop === 'symbol') return obj[prop];
      
      const value = obj[prop];
      const currentPath = [...basePath, String(prop)];
      
      // For primitives, return live tracking function that points to originalState
      if (isPrimitive(value)) {
        return createLiveTrackingPrimitive(originalState, currentPath, (path) => {
          if (currentComputation) {
            recordDependency(path);
          }
        });
      }
      
      // For objects, return NEW proxy with originalState reference and extended path
      if (typeof value === 'object' && value !== null) {
        console.log(`🔗 Creating chained proxy for ${currentPath.join('.')}`);
        return createLiveTrackingProxy(value, originalState, currentPath);
      }
      
      return value;
    },
    
    set(obj, prop, newValue) {
      obj[prop] = newValue;
      
      const changedPath = [...basePath, String(prop)];
      console.log(`🔄 Live state changed: ${changedPath.join('.')} = ${newValue}`);
      
      // Trigger recomputations for affected dependencies
      triggerRecomputations(changedPath);
      return true;
    }
  });
};

export const isPrimitive = (value) => {
  return value === null || 
         value === undefined || 
         typeof value === 'string' || 
         typeof value === 'number' || 
         typeof value === 'boolean';
};

export const recordDependency = (path) => {
  if (!currentComputation) return;
  
  const pathKey = path.join('.');
  
  if (!dependencyGraph.has(currentComputation)) {
    dependencyGraph.set(currentComputation, new Set());
  }
  
  dependencyGraph.get(currentComputation).add(pathKey);
  console.log(`📝 Live dependency: ${currentComputation} → ${pathKey}`);
};

export const triggerRecomputations = (changedPath) => {
  const pathKey = changedPath.join('.');
  
  for (const [computationName, deps] of dependencyGraph.entries()) {
    const shouldRecompute = Array.from(deps).some(dep => 
      dep === pathKey || dep.startsWith(pathKey + '.') || pathKey.startsWith(dep + '.')
    );
    
    if (shouldRecompute) {
      console.log(`🚀 Live recomputing: ${computationName}`);
      runComputation(computationName);
    }
  }
};

export const runComputation = (name) => {
  const computation = computedRegistry.get(name);
  if (!computation) return;
  
  dependencyGraph.set(name, new Set());
  currentComputation = name;
  
  try {
    const result = computation.fn();
    computation.lastResult = result;
    computation.lastRun = Date.now();
    
    console.log(`✅ Live computed ${name} = ${result}`);
    return result;
  } finally {
    currentComputation = null;
  }
};

export const computed = (name, fn) => {
  computedRegistry.set(name, {
    fn,
    lastResult: undefined,
    lastRun: 0,
    subscribers: []
  });
  
  return runComputation(name);
};

// Subscribe to computed value changes
export const subscribe = (computationName, callback) => {
  const computation = computedRegistry.get(computationName);
  if (computation) {
    computation.subscribers.push(callback);
  }
};

// Helper to get computed value and track inter-computed dependencies
export const getComputed = (name) => {
  if (currentComputation) {
    recordDependency(['__computed__', name]);
  }
  return computedRegistry.get(name)?.lastResult;
};