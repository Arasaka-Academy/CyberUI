/** A local clock with an explicit disposer. It never executes tools or network requests. */
export function startSimulation(tick: () => void, interval = 90) {
  const timer = setInterval(tick, interval);
  return () => clearInterval(timer);
}
