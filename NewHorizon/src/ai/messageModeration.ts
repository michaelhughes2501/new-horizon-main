import { moderateMessage } from "./moderation";

const MAX_MESSAGE_LENGTH = 2000;

/**
 * Validates an outgoing message before it is sent.
 * Throws a descriptive Error (not an ApiError) so the UI can catch and
 * display the message directly to the user.
 *
 * @returns true when the message passes all checks.
 */
export function validateOutgoingMessage(message: string): true {
  if (message.trim().length === 0) {
    throw new Error("Message cannot be empty.");
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    throw new Error(
      `Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters.`
    );
  }

  const moderation = moderateMessage(message);

  if (!moderation.allowed) {
    throw new Error(moderation.reason ?? "Message blocked.");
  }

  return true;
}
