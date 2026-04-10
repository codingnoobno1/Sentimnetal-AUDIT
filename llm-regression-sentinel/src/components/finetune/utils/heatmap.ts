// Heatmap color utilities for score-based visual encoding

/** Returns Tailwind class string for background/text/border based on score */
export const getHeatmapColor = (score: number): string => {
  if (score < 25) return "text-red-600 bg-red-500/10 border-red-500/30";
  if (score < 50) return "text-orange-500 bg-orange-500/10 border-orange-500/20";
  if (score < 70) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
  if (score < 85) return "text-lime-600 bg-lime-500/10 border-lime-500/20";
  return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
};

/** Returns a hex color for SVG/canvas rendering based on score */
export const getHeatmapHex = (score: number): string => {
  if (score < 25) return "#DC2626";
  if (score < 50) return "#F97316";
  if (score < 70) return "#F59E0B";
  if (score < 85) return "#84CC16";
  return "#10B981";
};

/** Returns a semantic label for the score */
export const getScoreLabel = (score: number): string => {
  if (score < 25) return "Critical";
  if (score < 50) return "Poor";
  if (score < 70) return "Fair";
  if (score < 85) return "Good";
  return "Excellent";
};

/** Returns a background gradient class for score badges */
export const getScoreBadgeClass = (score: number): string => {
  if (score < 25) return "bg-gradient-to-r from-red-600 to-red-500 text-white";
  if (score < 50) return "bg-gradient-to-r from-orange-500 to-amber-500 text-white";
  if (score < 70) return "bg-gradient-to-r from-amber-500 to-yellow-400 text-charcoal";
  if (score < 85) return "bg-gradient-to-r from-lime-500 to-emerald-400 text-white";
  return "bg-gradient-to-r from-emerald-500 to-teal-400 text-white";
};
