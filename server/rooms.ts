// ============================================
// Room Utilities
// ============================================

/**
 * Generates a random 6-character alphanumeric room code.
 * Uses uppercase letters and digits, avoiding ambiguous chars (O, 0, I, 1, L).
 */
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
