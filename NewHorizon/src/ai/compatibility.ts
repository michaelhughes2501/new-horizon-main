export interface CompatibilityInput {
  interests: string[];
  relationshipGoal?: string;
  city?: string;
}

export interface CompatibilityResult {
  score: number;
  sharedInterests: string[];
}

export function calculateCompatibility(
  current: CompatibilityInput,
  candidate: CompatibilityInput
): CompatibilityResult {
  const sharedInterests = current.interests.filter((interest) =>
    candidate.interests.includes(interest)
  );

  let score = sharedInterests.length * 15;

  if (
    current.relationshipGoal &&
    current.relationshipGoal === candidate.relationshipGoal
  ) {
    score += 25;
  }

  if (
    current.city &&
    candidate.city &&
    current.city.toLowerCase() === candidate.city.toLowerCase()
  ) {
    score += 10;
  }

  return {
    score: Math.min(score, 100),
    sharedInterests,
  };
}
