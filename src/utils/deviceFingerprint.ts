/**
 * Generate a device fingerprint based on user agent and screen resolution
 * This is used to match stored credentials to the device
 */
export function generateDeviceFingerprint(): string {
  const userAgent = navigator.userAgent || '';
  const screenWidth = window.screen.width || 0;
  const screenHeight = window.screen.height || 0;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  
  // Create a simple hash from device characteristics
  const fingerprint = `${userAgent}|${screenWidth}x${screenHeight}|${timezone}`;
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
}

/**
 * Store credentials for Remember Me feature
 */
export function storeCredentials(email: string, password: string): void {
  const deviceFingerprint = generateDeviceFingerprint();
  const credentials = {
    email,
    password, // Note: In production, consider encrypting this
    deviceFingerprint,
    storedAt: Date.now(),
  };
  
  localStorage.setItem('rememberMeCredentials', JSON.stringify(credentials));
}

/**
 * Get stored credentials if device matches
 */
export function getStoredCredentials(): { email: string; password: string } | null {
  try {
    const stored = localStorage.getItem('rememberMeCredentials');
    if (!stored) {
      return null;
    }
    
    const credentials = JSON.parse(stored);
    const currentFingerprint = generateDeviceFingerprint();
    
    // Check if device fingerprint matches
    if (credentials.deviceFingerprint !== currentFingerprint) {
      console.log('Device fingerprint mismatch - not auto-filling credentials');
      return null;
    }
    
    // Check if credentials are not too old (optional: 90 days)
    const maxAge = 90 * 24 * 60 * 60 * 1000; // 90 days
    if (Date.now() - credentials.storedAt > maxAge) {
      console.log('Stored credentials are too old - clearing');
      clearStoredCredentials();
      return null;
    }
    
    return {
      email: credentials.email,
      password: credentials.password,
    };
  } catch (error) {
    console.error('Error retrieving stored credentials:', error);
    return null;
  }
}

/**
 * Clear stored credentials
 */
export function clearStoredCredentials(): void {
  localStorage.removeItem('rememberMeCredentials');
}

