import { v4 as uuidv4 } from "uuid";

/**
 * Card IDs are just UUIDs.
 */
export function generateCardId() {
  return uuidv4();
}
