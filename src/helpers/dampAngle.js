/**
 * Smoothly interpolates an angle towards a target,
 * handling the -PI/PI wraparound correctly.
 */
export function dampAngle(current, target, smoothing, delta) {
  let diff = (target - current) % (Math.PI * 2)
  if (diff > Math.PI) diff -= Math.PI * 2
  if (diff < -Math.PI) diff += Math.PI * 2
  return current + diff * (1 - Math.exp(-smoothing * delta))
}
