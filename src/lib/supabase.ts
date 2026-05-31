import { createClient } from "@supabase/supabase-js";

// Helper to strip quotes, whitespace, and trailing slashes from environment variables
function sanitizeSupabaseUrl(url: string): string {
  if (!url) return "";
  let clean = url.trim();
  // Strip double and single quotes
  if (clean.startsWith('"') && clean.endsWith('"')) {
    clean = clean.slice(1, -1);
  }
  if (clean.startsWith("'") && clean.endsWith("'")) {
    clean = clean.slice(1, -1);
  }
  clean = clean.trim();

  // Parse as URL if possible to clean up paths and remove endpoints like rest/v1/
  try {
    const parsed = new URL(clean);
    if (parsed.pathname.includes('/rest/v1')) {
      return parsed.origin;
    }
    // For standard Supabase URLs, any path is incorrect, so we only need the origin
    if (parsed.hostname.endsWith('.supabase.co') || parsed.hostname.endsWith('.supabase.in') || parsed.hostname.endsWith('.supabase.net')) {
      return parsed.origin;
    }
  } catch (e) {
    // Graceful fallback
  }

  // Regex replacement fallback to rip out /rest/v1/ and everything after it if user pasted API routes
  clean = clean.replace(/\/rest\/v1\b.*/i, "");

  // Strip trailing slashes
  while (clean.endsWith("/")) {
    clean = clean.slice(0, -1);
  }
  return clean;
}

function sanitizeSupabaseKey(key: string): string {
  if (!key) return "";
  let clean = key.trim();
  // Strip double and single quotes
  if (clean.startsWith('"') && clean.endsWith('"')) {
    clean = clean.slice(1, -1);
  }
  if (clean.startsWith("'") && clean.endsWith("'")) {
    clean = clean.slice(1, -1);
  }
  return clean.trim();
}

const RAW_URL = (import.meta as any).env?.VITE_SUPABASE_URL || "https://ccalbsgweohipcvxauli.supabase.co";
const RAW_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjYWxic2d3ZW9oaXBjdnhhdWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNDc5MjQsImV4cCI6MjA5NTYyMzkyNH0.olxAt361Hyb0cLSM_B5V2ZOMibWVgawYgFSmnPK0nuc";

const SUPABASE_URL = sanitizeSupabaseUrl(RAW_URL);
const SUPABASE_ANON_KEY = sanitizeSupabaseKey(RAW_KEY);

console.log("Supabase URL initialized:", SUPABASE_URL);

// Initialize Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Fetches all CMS settings or items from Supabase in a single, fast query.
 * Falls back to null if the table doesn't exist yet or if there's a connection issue.
 */
export async function getSupabaseCMSData(): Promise<Record<string, any> | null> {
  try {
    const { data, error } = await supabase
      .from("ansor_bogor_cms")
      .select("key, value");

    if (error) {
      console.warn("Supabase query warning (this is normal if table is not created yet):", error);
      return null;
    }

    if (data && data.length > 0) {
      const cmsMap: Record<string, any> = {};
      data.forEach((row) => {
        cmsMap[row.key] = row.value;
      });
      return cmsMap;
    }

    return {};
  } catch (err) {
    console.error("Failed to fetch CMS content from Supabase:", err);
    return null;
  }
}

/**
 * Saves or updates a specific CMS key's content in Supabase.
 * Returns an object containing the success status and any raw Supabase error.
 */
export async function setSupabaseCMSData(key: string, value: any): Promise<{ success: boolean; error?: any }> {
  try {
    const { error } = await supabase
      .from("ansor_bogor_cms")
      .upsert(
        { key, value, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );

    if (error) {
      console.warn(`Supabase upsert warning for key '${key}':`, error);
      return { success: false, error };
    }

    return { success: true };
  } catch (err: any) {
    console.error(`Failed to save CMS key '${key}' to Supabase:`, err);
    return { success: false, error: err };
  }
}
