/**
 * Utility function to hash passwords with 'hzs' prefix
 * Uses SHA-256 for secure hashing
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const prefixedPassword = 'hzs' + password;
    
    const encoder = new TextEncoder();
    const data = encoder.encode(prefixedPassword);
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
};


export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const hashedPassword = await hashPassword(password);
  return hashedPassword === hash;
};