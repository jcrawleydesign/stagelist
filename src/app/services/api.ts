import { projectId, publicAnonKey } from '/utils/supabase/info';
import { authService } from './supabase';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-2567dc62`;

console.log('🌐 API Base URL:', API_BASE_URL);
console.log('🔑 API Key preview:', publicAnonKey.substring(0, 30) + '...');

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  // Always get a fresh session (with auto-refresh if needed)
  const session = await authService.getSession();
  
  if (!session?.access_token) {
    console.error('❌ No access token available for API request');
    throw new Error('Not authenticated');
  }

  console.log(`🌐 API Request: ${endpoint}`);
  console.log('🔑 Using token:', session.access_token.substring(0, 50) + '...');
  
  // Decode and log token info
  try {
    const tokenParts = session.access_token.split('.');
    if (tokenParts.length === 3) {
      const payload = JSON.parse(atob(tokenParts[1]));
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = payload.exp - now;
      console.log('🔓 Token info:', {
        exp: payload.exp,
        expiresAt: new Date(payload.exp * 1000).toISOString(),
        timeUntilExpiry: `${Math.floor(timeUntilExpiry / 60)} minutes`,
        isExpired: timeUntilExpiry < 0,
      });
    }
  } catch (e) {
    console.error('Failed to decode token for logging:', e);
  }

  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': publicAnonKey,
      ...options.headers,
    },
  });

  console.log(`📡 Response status: ${response.status}`);

  if (!response.ok) {
    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    console.error(`❌ API error response (${response.status}):`, errorData);
    throw new Error(`API request failed with status ${response.status}`);
  }

  const data = await response.json();
  console.log(`✅ API response:`, data);
  return data;
}

// Stage Lists API
export const listsAPI = {
  // Get all lists
  async getAll(): Promise<SavedStageList[]> {
    const data = await apiRequest('/lists');
    return data.lists;
  },

  // Create a new list
  async create(list: SavedStageList): Promise<SavedStageList> {
    const data = await apiRequest('/lists', {
      method: 'POST',
      body: JSON.stringify(list),
    });
    return data.list;
  },

  // Update a list
  async update(id: string, updates: Partial<SavedStageList>): Promise<SavedStageList> {
    const data = await apiRequest(`/lists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data.list;
  },

  // Delete a list
  async delete(id: string): Promise<void> {
    await apiRequest(`/lists/${id}`, {
      method: 'DELETE',
    });
  },
};

// Settings API
export const settingsAPI = {
  // Get settings
  async get(): Promise<{ metronomeSound: string; metronomeVolume: number }> {
    return await apiRequest('/settings');
  },

  // Update settings
  async update(settings: { metronomeSound?: string; metronomeVolume?: number }): Promise<void> {
    await apiRequest('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },
};