// ============================================
// SWARAM OIL — Supabase client setup
//
// 1. Go to supabase.com → create a free account → "New project"
// 2. Once created, go to Project Settings → API
// 3. Copy your "Project URL" and "anon public" key (NOT the service_role key)
// 4. Paste them below
// ============================================

const SUPABASE_URL = "https://lrsgzxkqsomghvqxhekh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxyc2d6eGtxc29tZ2h2cXhoZWtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1Njk3NjMsImV4cCI6MjEwMTE0NTc2M30.BRFQGiUIGIWMdAyDoB2W2T10lmHiwEkT4BGjmOiIKDo";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Creates a URL within the currently deployed site.  On GitHub Pages this
// keeps the repository folder (for example, /swaram-oil-site/) in the URL.
function getSitePageUrl(pageName) {
  return new URL(pageName, window.location.href).href;
}

// Helper: get the currently logged-in user (or null)
async function getCurrentUser() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  return user;
}
