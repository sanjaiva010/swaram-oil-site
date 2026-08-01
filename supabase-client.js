// ============================================
// SWARAM OIL — Supabase client setup
//
// 1. Go to supabase.com → create a free account → "New project"
// 2. Once created, go to Project Settings → API
// 3. Copy your "Project URL" and "anon public" key (NOT the service_role key)
// 4. Paste them below
// ============================================

const SUPABASE_URL = "PASTE_YOUR_PROJECT_URL_HERE";
const SUPABASE_ANON_KEY = "PASTE_YOUR_ANON_PUBLIC_KEY_HERE";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper: get the currently logged-in user (or null)
async function getCurrentUser() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  return user;
}
