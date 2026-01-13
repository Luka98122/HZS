/**
 * Utility function to hash passwords with 'hzs' prefix
 * Uses SHA-256 for secure hashing
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    // Prefix the password with 'hzs'
    const prefixedPassword = 'hzs' + password;
    
    // Encode the string as UTF-8
    const encoder = new TextEncoder();
    const data = encoder.encode(prefixedPassword);
    
    // Hash the data using SHA-256
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    
    // Convert the hash buffer to a hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
};

/**
 * Utility function to verify a password against a hash
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const hashedPassword = await hashPassword(password);
  return hashedPassword === hash;
};