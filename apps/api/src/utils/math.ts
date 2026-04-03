/**
 * Poisson distribution utilities for Over/Under calculations
 */

/** Probability of exactly k events given mean lambda */
export function poissonPmf(k: number, lambda: number): number {
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

/** Factorial — safe for small numbers (k <= 20) */
function factorial(n: number): number {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

/** Probability of total goals <= threshold using Poisson */
export function poissonUnderProbability(
  lambdaHome: number,
  lambdaAway: number,
  threshold: number
): number {
  let prob = 0;
  for (let homeGoals = 0; homeGoals <= threshold; homeGoals++) {
    for (let awayGoals = 0; awayGoals <= threshold - homeGoals; awayGoals++) {
      prob += poissonPmf(homeGoals, lambdaHome) * poissonPmf(awayGoals, lambdaAway);
    }
  }
  return prob;
}

/** Calculate multiplier from probability with margin */
export function calculateMultiplier(
  probability: number,
  margin: number = 0.05,
  min: number = 1.05,
  max: number = 15.0
): number {
  if (probability <= 0) return max;
  if (probability >= 1) return min;
  const raw = (1 / probability) * (1 - margin);
  return Math.min(max, Math.max(min, parseFloat(raw.toFixed(2))));
}
