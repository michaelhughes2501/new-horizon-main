export interface ScamDetectionResult {
  flagged: boolean;
  reason?: string;
}

/**
 * Heuristic scam/fraud detection for profile bios and chat messages.
 *
 * This is a stub — the patterns array and scoring logic can be expanded,
 * or the function body replaced with an API call, without changing the
 * interface consumed by callers.
 */
const suspiciousPatterns: RegExp[] = [
  /\b(whatsapp|telegram|signal)\s*me\b/i,
  /\bsend\s+(me\s+)?(money|gift\s*card|crypto|btc|eth)\b/i,
  /\bclick\s+(here|this\s+link)\b/i,
  /\bverif(y|ication)\s+fee\b/i,
];

export function detectScam(text: string): ScamDetectionResult {
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(text)) {
      return {
        flagged: true,
        reason: "Content matches a known scam pattern.",
      };
    }
  }

  return { flagged: false };
}
