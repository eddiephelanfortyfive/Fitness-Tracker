// Heart rate percentage to BPM conversion utility

/**
 * Converts HR percentage strings to include BPM ranges
 * @param {string} hrText - Text containing HR percentages (e.g., "65-75% HR", "@ 60% HR")
 * @param {number|null} maxHR - Maximum heart rate in bpm
 * @returns {string} - Original text with BPM ranges added in parentheses
 */
export const convertHRPercentageToBPM = (hrText, maxHR) => {
  if (!hrText || typeof hrText !== 'string') {
    return hrText;
  }

  // If maxHR is not set or invalid, return original text
  if (!maxHR || typeof maxHR !== 'number' || maxHR < 100 || maxHR > 250) {
    return hrText;
  }

  // Pattern to match HR percentages:
  // - Single: "60% HR" or "@ 60% HR"
  // - Range: "65-75% HR" or "65-75% HR"
  // - Can appear anywhere in text
  const hrPattern = /(\d+(?:-\d+)?)\s*%\s*HR/gi;

  return hrText.replace(hrPattern, (match, percentagePart) => {
    // Calculate BPM for the percentage(s)
    if (percentagePart.includes('-')) {
      // Range: "65-75"
      const [minPercent, maxPercent] = percentagePart.split('-').map(p => parseFloat(p.trim()));
      if (!isNaN(minPercent) && !isNaN(maxPercent)) {
        const minBPM = Math.round((minPercent / 100) * maxHR);
        const maxBPM = Math.round((maxPercent / 100) * maxHR);
        return `${match} (${minBPM}-${maxBPM} bpm)`;
      }
    } else {
      // Single: "60"
      const percent = parseFloat(percentagePart);
      if (!isNaN(percent)) {
        const bpm = Math.round((percent / 100) * maxHR);
        return `${match} (${bpm} bpm)`;
      }
    }
    return match;
  });
};
