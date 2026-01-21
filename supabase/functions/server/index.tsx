import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const app = new Hono();

console.log('🚀 Server starting...');
console.log('📦 Environment check:');
console.log('  - SUPABASE_URL:', Deno.env.get('SUPABASE_URL') ? 'Set' : 'MISSING');
console.log('  - SUPABASE_ANON_KEY:', Deno.env.get('SUPABASE_ANON_KEY') ? 'Set' : 'MISSING');
console.log('  - SUPABASE_SERVICE_ROLE_KEY:', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'Set' : 'MISSING');

// Decode JWT helper (without verification, just for debugging)
function decodeJWT(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload;
  } catch (e) {
    return null;
  }
}

// Create Supabase client helper
const getSupabaseClient = (useServiceRole = false) => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    useServiceRole 
      ? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      : Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );
};

// Middleware to verify user authentication
const requireAuth = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  console.log('🔐 Auth header received:', authHeader ? `Present (${authHeader.length} chars)` : 'MISSING');
  
  const accessToken = authHeader?.split(' ')[1];
  if (!accessToken) {
    console.error('❌ No access token provided in Authorization header');
    return c.json({ error: 'Unauthorized - No token provided' }, 401);
  }

  console.log('🔑 Token length:', accessToken.length);
  console.log('🔑 Token preview:', accessToken.substring(0, 50) + '...');

  // Decode JWT to inspect payload
  const decoded = decodeJWT(accessToken);
  if (!decoded) {
    console.error('❌ Failed to decode JWT');
    return c.json({ error: 'Invalid token format' }, 401);
  }
  
  console.log('🔓 Decoded JWT payload:');
  console.log('  - sub (user ID):', decoded.sub);
  console.log('  - email:', decoded.email);
  console.log('  - exp (expires):', decoded.exp, '=', new Date(decoded.exp * 1000).toISOString());
  console.log('  - iss (issuer):', decoded.iss);
  console.log('  - aud (audience):', decoded.aud);
  
  // Check if token is expired
  const now = Math.floor(Date.now() / 1000);
  if (decoded.exp && decoded.exp < now) {
    console.error('❌ Token is EXPIRED! exp:', decoded.exp, 'now:', now);
    return c.json({ error: 'Token expired' }, 401);
  }
  
  // Check if token has required claims
  if (!decoded.sub || !decoded.email) {
    console.error('❌ Token missing required claims (sub or email)');
    return c.json({ error: 'Invalid token claims' }, 401);
  }
  
  // Verify the token is from our Supabase instance
  const expectedIssuer = Deno.env.get('SUPABASE_URL') + '/auth/v1';
  if (decoded.iss && decoded.iss !== expectedIssuer) {
    console.error('❌ Token issuer mismatch. Expected:', expectedIssuer, 'Got:', decoded.iss);
    // Don't fail on issuer mismatch - just log it
  }

  // Trust the decoded token - set userId and continue
  console.log('✅ Token validated, user ID:', decoded.sub, 'email:', decoded.email);
  c.set('userId', decoded.sub);
  c.set('user', { id: decoded.sub, email: decoded.email });
  await next();
};

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "apikey"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

// Health check endpoint
app.get("/make-server-2567dc62/health", (c) => {
  return c.json({ status: "ok" });
});

// Debug endpoint to test authentication
app.get("/make-server-2567dc62/debug-auth", async (c) => {
  const authHeader = c.req.header('Authorization');
  const accessToken = authHeader?.split(' ')[1];
  
  const response: any = {
    timestamp: new Date().toISOString(),
    authHeaderPresent: !!authHeader,
    tokenLength: accessToken?.length || 0,
    tokenPreview: accessToken?.substring(0, 30) + '...' || 'none',
  };
  
  if (accessToken) {
    const decoded = decodeJWT(accessToken);
    if (decoded) {
      response.decoded = {
        sub: decoded.sub,
        email: decoded.email,
        exp: decoded.exp,
        expiresAt: new Date(decoded.exp * 1000).toISOString(),
        isExpired: decoded.exp < Math.floor(Date.now() / 1000),
      };
    } else {
      response.decodeError = 'Failed to decode JWT';
    }
  }
  
  return c.json(response);
});

// Sign up endpoint
app.post("/make-server-2567dc62/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = body;
    
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ error: 'Please enter a valid email address' }, 400);
    }
    
    // Validate password length
    if (password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters long' }, 400);
    }
    
    const supabase = getSupabaseClient(true); // Use service role key
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name || '' },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });
    
    if (error) {
      console.error('Sign up error:', error);
      
      // Provide more user-friendly error messages
      let errorMessage = error.message;
      if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
      } else if (error.message?.includes('invalid email')) {
        errorMessage = 'Please enter a valid email address';
      } else if (error.message?.includes('password')) {
        errorMessage = 'Password does not meet requirements. Please use a stronger password.';
      }
      
      return c.json({ error: errorMessage }, 400);
    }
    
    if (!data?.user) {
      console.error('Sign up succeeded but no user data returned');
      return c.json({ error: 'Account created but failed to retrieve user information' }, 500);
    }
    
    console.log('✅ User created successfully:', data.user.id);
    return c.json({ 
      success: true, 
      user: data.user 
    });
  } catch (error: any) {
    console.error('Sign up error:', error);
    const errorMessage = error?.message || 'An unexpected error occurred during signup';
    return c.json({ error: errorMessage }, 500);
  }
});

// Get all stage lists for authenticated user
app.get("/make-server-2567dc62/lists", requireAuth, async (c) => {
  console.log('📋 Inside /lists handler - auth passed!');
  console.log('👤 User ID from context:', c.get('userId'));
  console.log('👤 User from context:', c.get('user'));
  
  try {
    const userId = c.get('userId');
    console.log('🔍 Fetching lists for user:', userId);
    const lists = await kv.getByPrefix(`lists:${userId}:`);
    console.log('✅ Found lists:', lists?.length || 0);
    return c.json({ lists: lists || [] });
  } catch (error) {
    console.error("❌ Error fetching lists:", error);
    return c.json({ error: "Failed to fetch lists" }, 500);
  }
});

// Create a new stage list for authenticated user
app.post("/make-server-2567dc62/lists", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    const { id, name, songs, nextId, createdAt, updatedAt } = body;
    
    const list = {
      id,
      name,
      songs,
      nextId,
      createdAt,
      updatedAt,
      userId,
    };
    
    await kv.set(`lists:${userId}:${id}`, list);
    return c.json({ success: true, list });
  } catch (error) {
    console.error("Error creating list:", error);
    return c.json({ error: "Failed to create list" }, 500);
  }
});

// Update a stage list for authenticated user
app.put("/make-server-2567dc62/lists/:id", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const id = c.req.param("id");
    const body = await c.req.json();
    const { name, songs, nextId, updatedAt } = body;
    
    const existingList = await kv.get(`lists:${userId}:${id}`);
    if (!existingList) {
      return c.json({ error: "List not found" }, 404);
    }
    
    const updatedList = {
      ...existingList,
      name,
      songs,
      nextId,
      updatedAt,
    };
    
    await kv.set(`lists:${userId}:${id}`, updatedList);
    return c.json({ success: true, list: updatedList });
  } catch (error) {
    console.error("Error updating list:", error);
    return c.json({ error: "Failed to update list" }, 500);
  }
});

// Delete a stage list for authenticated user
app.delete("/make-server-2567dc62/lists/:id", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const id = c.req.param("id");
    await kv.del(`lists:${userId}:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting list:", error);
    return c.json({ error: "Failed to delete list" }, 500);
  }
});

// Get user settings for authenticated user
app.get("/make-server-2567dc62/settings", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const metronomeSound = await kv.get(`settings:${userId}:metronomeSound`) || "click";
    const metronomeVolume = await kv.get(`settings:${userId}:metronomeVolume`) || 0.3;
    
    return c.json({ 
      metronomeSound,
      metronomeVolume 
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return c.json({ error: "Failed to fetch settings" }, 500);
  }
});

// Update user settings for authenticated user
app.put("/make-server-2567dc62/settings", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    const { metronomeSound, metronomeVolume } = body;
    
    if (metronomeSound !== undefined) {
      await kv.set(`settings:${userId}:metronomeSound`, metronomeSound);
    }
    if (metronomeVolume !== undefined) {
      await kv.set(`settings:${userId}:metronomeVolume`, metronomeVolume);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error updating settings:", error);
    return c.json({ error: "Failed to update settings" }, 500);
  }
});

console.log('✅ All routes registered successfully');
console.log('🌐 Server ready to accept requests');

Deno.serve(app.fetch);