// ---- Shared cart logic for Swaram Oil site ----
// Uses localStorage so the cart persists across pages on the live site.

const CART_KEY = 'swaram_cart';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
  if (window.supabaseClient && typeof saveCartToServer === 'function') {
    saveCartToServer().catch(() => {});
  }
}

// Used by the cross-device sync helper in supabase-client.js to replace
// the local cart (avoids an infinite save loop).
function saveCartFromServer(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(oil, oilName, size, qty, price) {
  const cart = getCart();
  const existing = cart.find(i => i.oil === oil && i.size === size);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ oil, oilName, size, qty, price: price || 0 });
  }
  saveCart(cart);
}

function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
}

function updateCartBadge() {
  const count = getCart().reduce((sum, i) => sum + i.qty, 0);
  document.querySelectorAll('.cart-badge').forEach(el => { el.textContent = count; });
}

function showToast(message) {
  let toast = document.getElementById('swaramToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'swaramToast';
    toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 bg-ink text-cream px-6 py-3 rounded-full text-sm font-medium shadow-lg z-50 transition-opacity duration-300 opacity-0 pointer-events-none';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = '1';
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 2200);
}

document.addEventListener('DOMContentLoaded', async () => {
  updateCartBadge();
  if (window.supabaseClient && typeof loadCartFromServer === 'function') {
    try { await loadCartFromServer(); } catch (e) { /* offline */ }
  }
});
