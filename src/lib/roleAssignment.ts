// ============================================
// Role Assignment Engine
// Randomly maps participant names to {Player1}, {Player2}, etc.
// ============================================

/**
 * Fisher-Yates shuffle for cryptographically-fair randomization
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Assigns participant names to placeholders in a description template.
 *
 * @param template - String with {Player1}, {Player2}, etc. placeholders
 * @param participants - Array of participant display names
 * @returns The template with placeholders replaced by shuffled names
 *
 * @example
 * assignRoles(
 *   "{Player1} gently guides {Player2} into position...",
 *   ["Alex", "Jordan"]
 * )
 * // → "Jordan gently guides Alex into position..."
 */
export function assignRoles(
  template: string,
  participants: string[]
): string {
  const shuffled = shuffleArray(participants);

  let result = template;
  shuffled.forEach((name, i) => {
    const placeholder = `{Player${i + 1}}`;
    result = result.replaceAll(placeholder, name);
  });

  return result;
}

/**
 * Generates a tokenized description template from raw position data.
 * Used during seed to create {Player1}/{Player2} templates from keywords.
 */
export function generateTemplate(
  title: string,
  keywords: string[]
): string {
  const isManActive = keywords.includes('man active');
  const isWomanActive = keywords.includes('woman active');
  const isFaceToFace = keywords.includes('face to face');
  const hasKissing = keywords.includes('kissing');
  const isFromBehind = keywords.includes('from behind');
  const isDoggy = keywords.includes('doggy style');
  const isCowgirl = keywords.includes('cowgirl');
  const isOral = keywords.includes('oral sex');
  const isStanding = keywords.includes('standing');
  const isSitting = keywords.includes('sitting');
  const isLyingDown = keywords.includes('lying down');

  const parts: string[] = [];

  // Opening
  parts.push(`{Player1} and {Player2} explore the "${title}" position together.`);

  // Direction based on who leads
  if (isManActive && !isWomanActive) {
    parts.push(`{Player1} takes the lead, setting the rhythm and pace.`);
  } else if (isWomanActive && !isManActive) {
    parts.push(`{Player2} takes control, guiding the movement and intensity.`);
  } else {
    parts.push(`Both partners share the rhythm, moving in sync together.`);
  }

  // Body position cues
  if (isStanding) {
    parts.push(`Standing together, feel the energy of each other's bodies.`);
  } else if (isSitting) {
    parts.push(`Seated intimately, use this closeness to deepen the connection.`);
  } else if (isLyingDown) {
    parts.push(`Lying together, let gravity melt away the tension.`);
  }

  // Orientation / style
  if (isFaceToFace) {
    parts.push(`Facing each other, lock eyes and breathe together.`);
  } else if (isFromBehind || isDoggy) {
    parts.push(`{Player1} positions behind, hands exploring freely.`);
  } else if (isCowgirl) {
    parts.push(`{Player2} climbs on top, controlling the depth and angle.`);
  }

  // Intimacy enhancers
  if (hasKissing) {
    parts.push(`Let your lips find each other — kiss deeply and passionately.`);
  }

  if (isOral) {
    parts.push(`Use your mouth to discover what makes your partner shiver.`);
  }

  // Closing
  parts.push(`Communicate openly — whisper what feels incredible.`);

  return parts.join(' ');
}
