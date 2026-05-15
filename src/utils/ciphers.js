// src/utils/ciphers.js
// ─────────────────────────────────────────────────────────
// Two demo cipher functions used by CipherVault.
//
// ⚠️  For production use AES-256 encryption.
//     Integrate `crypto-js` or `react-native-quick-crypto`.
// ─────────────────────────────────────────────────────────

/**
 * Atbash Letter Cipher
 * Maps A↔Z, B↔Y, … for Latin letters.
 * Non-alpha characters are left untouched.
 *
 * @param {string} text – plaintext input
 * @returns {string}      ciphertext
 */
export const letterCipher = (text) => {
  return text
    .split('')
    .map((ch) => {
      const code = ch.charCodeAt(0);
      // Uppercase A-Z
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(90 - (code - 65));
      }
      // Lowercase a-z
      if (code >= 97 && code <= 122) {
        return String.fromCharCode(122 - (code - 97));
      }
      return ch;
    })
    .join('');
};

/**
 * Hieroglyph Mapping Cipher
 * Replaces Latin characters with CJK Unified Ideograph equivalents.
 * The mapping is deterministic: char code → offset inside CJK range U+4E00.
 *
 * @param {string} text – plaintext input
 * @returns {string}      ciphertext with CJK characters
 */
export const hieroglyphCipher = (text) => {
  const CJK_START = 0x4e00; // Start of CJK Unified Ideographs block
  return text
    .split('')
    .map((ch) => {
      const code = ch.charCodeAt(0);
      // Map printable ASCII (32-126) into the CJK block
      if (code >= 32 && code <= 126) {
        return String.fromCharCode(CJK_START + (code - 32));
      }
      return ch;
    })
    .join('');
};

/**
 * Apply chosen cipher to the full string content of a file.
 *
 * @param {string} content      – raw file content (UTF-8 string)
 * @param {'letter'|'hieroglyph'} method – cipher method key
 * @returns {string}              encrypted content
 */
export const encryptContent = (content, method) => {
  switch (method) {
    case 'letter':
      return letterCipher(content);
    case 'hieroglyph':
      return hieroglyphCipher(content);
    default:
      throw new Error(`Unknown cipher method: ${method}`);
  }
};
