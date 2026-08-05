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

// Helper: get the logged-in user's profile (name/phone/address) or null
async function getProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  const { data } = await supabaseClient.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
  return data || null;
}

// Helper: save the logged-in user's profile
async function saveProfile(fields) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not signed in');
  const { error } = await supabaseClient.from('profiles').upsert(
    { user_id: user.id, ...fields, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' }
  );
  if (error) throw error;
}

// ---- Address book (admin must approve before checkout) ----
async function getAddresses() {
  const user = await getCurrentUser();
  if (!user) return [];
  const { data } = await supabaseClient.from('addresses').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
  return data || [];
}

async function addAddress(fields) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not signed in');
  const { error } = await supabaseClient.from('addresses').insert({ user_id: user.id, approved: false, ...fields });
  if (error) throw error;
}

async function deleteAddress(id) {
  const { error } = await supabaseClient.from('addresses').delete().eq('id', id);
  if (error) throw error;
}

// ---- Delivery pincodes (a live set maintained by the admin) ----
let _pinCache = null;
async function getServicePincodes() {
  if (_pinCache) return _pinCache;
  const { data } = await supabaseClient.from('service_pincodes').select('pincode');
  _pinCache = new Set((data || []).map(r => r.pincode));
  return _pinCache;
}

// ---- Per-oil reviews ----
async function getProductReviews(oil) {
  const { data } = await supabaseClient
    .from('product_reviews')
    .select('*')
    .eq('oil', oil)
    .order('created_at', { ascending: false });
  return data || [];
}

// ---- Cross-device cart sync ----
async function saveCartToServer() {
  const user = await getCurrentUser();
  if (!user) return;
  const items = JSON.stringify(getCart());
  try {
    await supabaseClient.from('carts').upsert(
      { user_id: user.id, items, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
  } catch (e) { /* offline */ }
}

async function loadCartFromServer() {
  const user = await getCurrentUser();
  if (!user) return;
  const { data } = await supabaseClient.from('carts').select('items').eq('user_id', user.id).maybeSingle();
  if (data && data.items && data.items.length) {
    try { saveCartFromServer(JSON.parse(data.items)); } catch (e) { /* ignore */ }
  }
}

// ---- Wishlist ----
async function toggleWishlist(oil) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not signed in');
  const { data: existing } = await supabaseClient.from('wishlist').select('oil').eq('user_id', user.id).eq('oil', oil).maybeSingle();
  if (existing) await supabaseClient.from('wishlist').delete().eq('user_id', user.id).eq('oil', oil);
  else await supabaseClient.from('wishlist').insert({ user_id: user.id, oil });
  return !existing;
}

async function isWishlisted(oil) {
  const user = await getCurrentUser();
  if (!user) return false;
  const { data } = await supabaseClient.from('wishlist').select('oil').eq('user_id', user.id).eq('oil', oil).maybeSingle();
  return !!data;
}
