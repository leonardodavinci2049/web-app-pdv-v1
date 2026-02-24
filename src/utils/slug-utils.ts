/**
 * Utilities for slug generation and manipulation
 */

/**
 * Generate a URL-friendly slug from a product name
 * This function handles Portuguese characters and ensures clean URLs
 *
 * @param name Product name to convert to slug
 * @returns Clean slug string
 */
export function generateSlugFromName(name: string): string {
  if (!name || typeof name !== "string") {
    return "";
  }

  return name
    .toLowerCase()
    .trim()
    .normalize("NFD") // Normalize unicode characters (handles accented characters)
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics (acentos, tildes, etc.)
    .replace(/[^\w\s-]/g, "") // Remove special characters except word chars, spaces, and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple consecutive hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove hyphens from start and end
}

/**
 * Validate if a slug follows the correct format
 *
 * @param slug Slug to validate
 * @returns True if slug is valid, false otherwise
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || typeof slug !== "string") {
    return false;
  }

  // Slug should only contain lowercase letters, numbers, and hyphens
  // Should not start or end with hyphens
  // Should not have consecutive hyphens
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length >= 2 && slug.length <= 100;
}

/**
 * Generate a unique slug by adding a suffix if needed
 * This can be used to ensure uniqueness in the database
 *
 * @param baseSlug Base slug generated from name
 * @param existingSlugs Array of existing slugs to check against
 * @returns Unique slug
 */
export function generateUniqueSlug(
  baseSlug: string,
  existingSlugs: string[] = [],
): string {
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  let counter = 1;
  let uniqueSlug = `${baseSlug}-${counter}`;

  while (existingSlugs.includes(uniqueSlug)) {
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }

  return uniqueSlug;
}

/**
 * Clean and normalize text for slug generation
 * Handles common Portuguese words and abbreviations
 *
 * @param text Text to clean
 * @returns Cleaned text ready for slug generation
 */
export function cleanTextForSlug(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  return (
    text
      .trim()
      // Remove common Portuguese articles and prepositions at the beginning
      .replace(
        /^(o|a|os|as|um|uma|uns|umas|de|da|do|das|dos|para|por|com|sem|em|na|no|nas|nos)\s+/i,
        "",
      )
      // Replace common abbreviations
      .replace(/\b(ltd|ltda|s\.a\.|sa|s\/a|me|epp|eireli)\b/gi, "")
      // Remove extra spaces
      .replace(/\s+/g, " ")
      .trim()
  );
}
