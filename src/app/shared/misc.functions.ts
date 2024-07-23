/**
 * Capitalizes the first letter of a given string.
 * @param {string} name - The input string.
 * @return {string} The input string with the first letter capitalized.
 */
export function upperCaseFirstLetter(name: string): string {
  return name.slice(0, 1).toLocaleUpperCase() + name.slice(1).toLowerCase();
}

/**
 * Converts a string input representing a generation into a formatted string.
 * @param {string} input - The input string representing a generation.
 * @return {string} The formatted generation string.
 */
export function formatGenerationString(input: string): string {
  const parts = input.split('-');
  const firstPart =
    parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
  const secondPart = parts[1].toUpperCase();
  return `${firstPart}-${secondPart}`;
}
