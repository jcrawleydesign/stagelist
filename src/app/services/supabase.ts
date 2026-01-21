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
    
    // Check if token is expired or about to expire (within 5 minutes)
    if (session?.expires_at) {
      const expiresAt = session.expires_at * 1000; // Convert to milliseconds
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      
      if (expiresAt - now < fiveMinutes) {
        console.log('⏰ Token expired or expiring soon, refreshing...');
        const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.error('❌ Error refreshing session:', refreshError);
          return null;
        }
        if (newSession) {
          console.log('✅ Token refreshed successfully');
          return newSession;
        }
      }
    }
    
    return session;
  },

  async signIn(email: string, password: string) {
    console.log('🔐 Attempting sign in for:', email);
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
      const errorData = await response.json();
      console.error('❌ Sign up error:', errorData);
      throw new Error(errorData.error || 'Sign up failed');
    }
    
    const result = await response.json();
    console.log('✅ Sign up successful:', result);
    
    // Now sign in to get a session
    return this.signIn(email, password);
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