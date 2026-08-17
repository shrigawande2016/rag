// riskScore is the average of 3 category scores (each capped at 100), so it
// stays well below 100 even for genuinely risky documents — thresholds are
// calibrated to that averaged scale, not a raw 0-100 severity scale.
export const riskFromScore = (score) => {
  if (typeof score !== 'number') return null
  if (score >= 40) return 'high'
  if (score >= 15) return 'caution'
  return 'safe'
}
