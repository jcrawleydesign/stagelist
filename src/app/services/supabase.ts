import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;

console.log('🔧 Supabase client initialized');
console.log('🌐 Client Supabase URL:', supabaseUrl);
console.log('🔑 Client Anon Key preview:', publicAnonKey.substring(0, 30) + '...');

// Create client with explicit storage configuration
export const supabase = createClient(supabaseUrl, publicAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});

// Auth service methods
export const authService = {
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }
    
    if (!session) {
      return null;
    }
    
    // Check if session is valid (within 7 days)
    // Check both access token expiration and refresh token expiration
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    
    // Check if access token is expired or about to expire (within 5 minutes)
    if (session.expires_at) {
      const expiresAt = session.expires_at * 1000; // Convert to milliseconds
      const fiveMinutes = 5 * 60 * 1000;
      
      if (expiresAt - now < fiveMinutes) {
        console.log('⏰ Access token expired or expiring soon, refreshing...');
        const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.error('❌ Error refreshing session:', refreshError);
          // If refresh fails, check if session is still within 7 days
          // If session was created more than 7 days ago, it's invalid
          if (session.user.created_at) {
            const createdAt = new Date(session.user.created_at).getTime();
            if (now - createdAt > sevenDays) {
              console.log('❌ Session is older than 7 days, invalidating...');
              return null;
            }
          }
          return null;
        }
        if (newSession) {
          console.log('✅ Token refreshed successfully');
          return newSession;
        }
      }
    }
    
    // Validate session is not older than 7 days
    // Check when the session was created (using user creation time as proxy)
    // Note: Supabase doesn't expose session creation time directly,
    // but we can check if the refresh token is still valid
    // For now, we rely on Supabase's built-in refresh token expiration
    
    return session;
  },

  async signIn(email: string, password: string) {
    console.log('🔐 Attempting sign in for:', email);
    // Note: Session duration is configured on Supabase dashboard
    // The client uses refresh tokens to maintain sessions up to the configured duration (7 days)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('❌ Sign in error:', error);
      throw error;
    }
    
    console.log('✅ Sign in successful');
    console.log('📋 Session:', data.session);
    console.log('👤 User:', data.user);
    if (data.session?.expires_at) {
      console.log('⏰ Access token expires at:', new Date(data.session.expires_at * 1000).toLocaleString());
      console.log('💡 Note: Session duration (7 days) is configured on Supabase dashboard');
    }
    
    return data;
  },

  async signUp(email: string, password: string, name?: string) {
    console.log('📝 Attempting sign up for:', email);
    
    // Use the server endpoint for signup
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-2567dc62/signup`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': publicAnonKey,
        },
        body: JSON.stringify({ email, password, name }),
      }
    );
    
    if (!response.ok) {
      let errorMessage = 'Sign up failed';
      try {
        const errorData = await response.json();
        console.error('❌ Sign up error:', errorData);
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        // If response is not JSON, try to get text
        const text = await response.text();
        console.error('❌ Sign up error (non-JSON):', text);
        errorMessage = text || `Server returned ${response.status}`;
      }
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    console.log('✅ Sign up successful:', result);
    
    // Wait a brief moment to ensure user is fully created and available
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Now sign in to get a session - retry up to 3 times with delays
    let lastError: any = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`🔐 Attempting sign in (attempt ${attempt}/3)...`);
        const signInResult = await this.signIn(email, password);
        console.log('✅ Sign in successful after signup');
        return signInResult;
      } catch (error: any) {
        console.warn(`⚠️ Sign in attempt ${attempt} failed:`, error.message);
        lastError = error;
        // Wait before retrying (exponential backoff)
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    // If all retries failed, throw the last error
    throw new Error(lastError?.message || 'Failed to sign in after signup. Please try signing in manually.');
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  async getAccessToken() {
    const session = await this.getSession();
    if (!session?.access_token) {
      throw new Error('No access token available');
    }
    return session.access_token;
  },
};