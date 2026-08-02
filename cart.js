<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Swaram — Your Cart</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>
<link rel="stylesheet" href="styles.css">
<script>
  tailwind.config = { theme: { extend: { colors: {
    cream: '#F6F1E2', creamtwo: '#EFE7D2', ink: '#211C13',
    olive: '#37402A', olivedark: '#262D1B', gold: '#C6963C',
    goldlight: '#E7C978', rust: '#A6552A', card: '#FCFAF3'
  }}}}
</script>
<script src="assets.js"></script>
</head>
<body class="bg-cream text-ink min-h-screen flex flex-col">

<header class="bg-cream/90 border-b border-ink/10">
  <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
    <a href="index.html" class="flex items-center gap-3">
      <img src="images/logo-new-cropped.png" alt="Swaram logo" class="w-11 h-11 rounded-full object-cover object-top shadow-md bg-white">
      <div class="leading-tight">
        <div class="font-display text-lg tracking-wide">SWARAM</div>
        <div class="text-[10px] tracking-[0.2em] text-ink/50 -mt-1">COLD PRESSED · TIRUPUR</div>
      </div>
    </a>
    <a href="product.html" class="text-sm font-medium text-ink/70 hover:text-rust">← Continue shopping</a>
  </div>
</header>

<main class="flex-1 max-w-3xl mx-auto w-full px-6 py-14">
  <h1 class="font-display text-3xl mb-8">Your Cart</h1>
  <div id="cartItems" class="space-y-4 mb-10"></div>
  <div id="emptyState" class="hidden text-center py-16">
    <p class="text-ink/50 mb-6">Your cart is empty.</p>
    <a href="product.html" class="bg-olive text-cream px-7 py-3.5 rounded-full font-medium inline-block hover:bg-olivedark">Shop the range</a>
  </div>
  <div id="cartFooter" class="border-t border-ink/10 pt-6 hidden">
    <div class="flex items-center justify-between mb-6">
      <span class="text-ink/60">Total</span>
      <span id="cartTotal" class="font-display text-2xl">₹ 0</span>
    </div>
    <button class="w-full bg-olive text-cream py-3.5 rounded-full font-medium hover:bg-olivedark transition-colors">Proceed to checkout</button>
  </div>
</main>

<footer class="text-xs text-ink/40 text-center py-6">© 2026 Swaram Agro Products.</footer>

<script src="cart.js"></script>
<script>
  function render() {
    const cart = getCart();
    const wrap = document.getElementById('cartItems');
    wrap.innerHTML = '';
    if (cart.length === 0) {
      document.getElementById('emptyState').classList.remove('hidden');
      document.getElementById('cartFooter').classList.add('hidden');
      return;
    }
    document.getElementById('emptyState').classList.add('hidden');
    document.getElementById('cartFooter').classList.remove('hidden');
    cart.forEach((item, i) => {
      const row = document.createElement('div');
      row.className = 'flex items-center justify-between bg-card border border-ink/10 rounded-2xl p-4';
      row.innerHTML = `
        <div>
          <div class="font-medium">${item.oilName}</div>
          <div class="text-ink/50 text-sm">${item.size} · Qty ${item.qty} · ₹${item.price} each</div>
        </div>
        <div class="flex items-center gap-4">
          <span class="font-medium">₹ ${item.price * item.qty}</span>
          <button class="text-rust text-sm font-medium hover:underline" data-idx="${i}">Remove</button>
        </div>
      `;
      wrap.appendChild(row);
    });
    const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    document.getElementById('cartTotal').textContent = '₹ ' + total;
    wrap.querySelectorAll('button[data-idx]').forEach(btn => {
      btn.addEventListener('click', () => { removeFromCart(parseInt(btn.dataset.idx)); render(); });
    });
  }
  render();
</script>

</body>
</html>
