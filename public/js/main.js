/**
 * main.js – Page-specific logic: loads books, renders grids/carousels,
 * handles contact form submission, and renders the cart page.
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  /* ==================================================================
     Detect current page
     ================================================================== */
  const path = window.location.pathname;

  if (path === '/' || path === '/index.html')    initHome();
  if (path === '/books' || path === '/books.html') initBooksPage();
  if (path === '/cart'  || path === '/cart.html')  initCartPage();
  if (path === '/contact' || path === '/contact.html') initContactPage();
});

/* ====================================================================
   HOME PAGE
   ==================================================================== */

async function initHome() {
  try {
    const res  = await fetch('/api/books/featured');
    const json = await res.json();
    if (json.success) renderCarousel(json.data);
  } catch (err) {
    console.error('Failed to load featured books', err);
  }
}

function renderCarousel(books) {
  const track = document.querySelector('.carousel__track');
  const dotsContainer = document.querySelector('.carousel__dots');
  if (!track) return;

  track.innerHTML = books.map(bookCardHTML).join('');
  bindAddToCartButtons(track);

  // Carousel logic
  const slides      = track.querySelectorAll('.carousel__slide');
  const prevBtn     = document.querySelector('.carousel__btn--prev');
  const nextBtn     = document.querySelector('.carousel__btn--next');
  let currentIndex  = 0;

  const getSlideWidth = () => {
    if (!slides[0]) return 300;
    return slides[0].offsetWidth + 32; // gap
  };

  const updatePosition = () => {
    track.style.transform = `translateX(-${currentIndex * getSlideWidth()}px)`;
    // dots
    if (dotsContainer) {
      dotsContainer.querySelectorAll('.carousel__dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });
    }
  };

  // Create dots
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    books.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.className = 'carousel__dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => { currentIndex = i; updatePosition(); });
      dotsContainer.appendChild(dot);
    });
  }

  const maxIndex = () => {
    const visible = Math.floor(track.parentElement.offsetWidth / getSlideWidth());
    return Math.max(0, slides.length - visible);
  };

  if (prevBtn) prevBtn.addEventListener('click', () => {
    currentIndex = Math.max(0, currentIndex - 1);
    updatePosition();
  });
  if (nextBtn) nextBtn.addEventListener('click', () => {
    currentIndex = Math.min(maxIndex(), currentIndex + 1);
    updatePosition();
  });

  // Auto-advance every 5 s
  let autoplay = setInterval(() => {
    currentIndex = currentIndex >= maxIndex() ? 0 : currentIndex + 1;
    updatePosition();
  }, 5000);

  track.parentElement.addEventListener('mouseenter', () => clearInterval(autoplay));
  track.parentElement.addEventListener('mouseleave', () => {
    autoplay = setInterval(() => {
      currentIndex = currentIndex >= maxIndex() ? 0 : currentIndex + 1;
      updatePosition();
    }, 5000);
  });
}

/* ====================================================================
   BOOKS PAGE
   ==================================================================== */

async function initBooksPage() {
  const grid = document.querySelector('.books-grid');
  if (!grid) return;

  grid.innerHTML = '<div class="shimmer" style="height:320px"></div>'.repeat(6);

  try {
    const res  = await fetch('/api/books');
    const json = await res.json();
    if (json.success) {
      grid.innerHTML = json.data.map(bookCardHTML).join('');
      bindAddToCartButtons(grid);
      // Re-trigger reveal observer
      grid.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    }
  } catch (err) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;">Unable to load books. Please try again later.</p>';
    console.error(err);
  }
}

/* ====================================================================
   Shared: book card HTML
   ==================================================================== */

const PLACEHOLDER_GRADIENTS = [
  'linear-gradient(135deg, #ffecd2, #fcb69f)',
  'linear-gradient(135deg, #a1c4fd, #c2e9fb)',
  'linear-gradient(135deg, #fbc2eb, #a6c1ee)',
  'linear-gradient(135deg, #d4fc79, #96e6a1)',
  'linear-gradient(135deg, #fccb90, #d57eeb)',
  'linear-gradient(135deg, #e0c3fc, #8ec5fc)'
];

function bookCardHTML(book, index) {
  const gradient = PLACEHOLDER_GRADIENTS[index % PLACEHOLDER_GRADIENTS.length];
  const imageContent = book.cover_image
    ? `<img src="${escapeHTML(book.cover_image)}" alt="${escapeHTML(book.title)}" loading="lazy">`
    : `<div class="book-card__placeholder">${escapeHTML(book.title)}</div>`;

  return `
    <div class="carousel__slide book-card reveal" style="--i:${index}">
      <div class="book-card__image" style="background:${gradient}">
        ${imageContent}
        ${book.age_range ? `<span class="book-card__age">Ages ${escapeHTML(book.age_range)}</span>` : ''}
      </div>
      <div class="book-card__body">
        <h3 class="book-card__title">${escapeHTML(book.title)}</h3>
        <p class="book-card__desc">${escapeHTML(book.description || '')}</p>
        <div class="book-card__footer">
          <span class="book-card__price">$${Number(book.price).toFixed(2)}</span>
          <button class="book-card__add-btn" data-book='${JSON.stringify(book).replace(/'/g, '&#39;')}'>
            Add to Cart
          </button>
        </div>
      </div>
    </div>`;
}

function bindAddToCartButtons(container) {
  container.querySelectorAll('.book-card__add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      try {
        const book = JSON.parse(btn.dataset.book);
        Cart.add(book);
        showToast(`"${book.title}" added to cart!`);
      } catch (err) {
        console.error('Add to cart error', err);
      }
    });
  });
}

/* ====================================================================
   CART PAGE
   ==================================================================== */

function initCartPage() {
  renderCart();
  window.addEventListener('cart:updated', renderCart);
}

function renderCart() {
  const items     = Cart.getItems();
  const container = document.getElementById('cart-items');
  const summary   = document.getElementById('cart-summary');
  const emptyMsg  = document.getElementById('cart-empty');
  if (!container) return;

  if (items.length === 0) {
    container.style.display = 'none';
    if (summary) summary.style.display = 'none';
    if (emptyMsg) emptyMsg.style.display = 'block';
    return;
  }
  container.style.display = '';
  if (summary) summary.style.display = '';
  if (emptyMsg) emptyMsg.style.display = 'none';

  const tbody = container.querySelector('tbody');
  if (tbody) {
    tbody.innerHTML = items.map(item => `
      <tr>
        <td>
          <div class="cart-item__info">
            <div class="cart-item__thumb" style="background:linear-gradient(135deg,#ffecd2,#fcb69f)">
              ${item.cover_image ? `<img src="${escapeHTML(item.cover_image)}" alt="">` : ''}
            </div>
            <span class="cart-item__title">${escapeHTML(item.title)}</span>
          </div>
        </td>
        <td>$${Number(item.price).toFixed(2)}</td>
        <td>
          <div class="cart-qty">
            <button class="cart-qty__btn" data-action="dec" data-id="${item.id}">−</button>
            <span class="cart-qty__value">${item.quantity}</span>
            <button class="cart-qty__btn" data-action="inc" data-id="${item.id}">+</button>
          </div>
        </td>
        <td>$${(item.price * item.quantity).toFixed(2)}</td>
        <td><button class="cart-remove-btn" data-id="${item.id}">Remove</button></td>
      </tr>
    `).join('');

    // Bind quantity buttons
    tbody.querySelectorAll('.cart-qty__btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);
        const current = Cart.getItems().find(i => i.id === id);
        if (!current) return;
        if (btn.dataset.action === 'inc') Cart.setQuantity(id, current.quantity + 1);
        else if (current.quantity > 1)     Cart.setQuantity(id, current.quantity - 1);
        else                               Cart.remove(id);
        renderCart();
      });
    });

    // Bind remove buttons
    tbody.querySelectorAll('.cart-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        Cart.remove(Number(btn.dataset.id));
        renderCart();
      });
    });
  }

  // Update summary
  const subtotal = Cart.getTotal();
  const totalEl  = document.getElementById('cart-total');
  const subEl    = document.getElementById('cart-subtotal');
  if (subEl)   subEl.textContent   = `$${subtotal.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `$${subtotal.toFixed(2)}`;
}

/* ====================================================================
   CONTACT PAGE
   ==================================================================== */

function initContactPage() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const successEl = form.querySelector('.form-success');
    const errorEl   = form.querySelector('.form-error');
    successEl.style.display = 'none';
    errorEl.style.display   = 'none';

    const name    = form.querySelector('[name="name"]').value.trim();
    const email   = form.querySelector('[name="email"]').value.trim();
    const message = form.querySelector('[name="message"]').value.trim();

    if (!name || !email || !message) {
      errorEl.textContent   = 'Please fill in all fields.';
      errorEl.style.display = 'block';
      return;
    }

    try {
      const res  = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });
      const json = await res.json();

      if (json.success) {
        successEl.textContent   = json.message || 'Message sent!';
        successEl.style.display = 'block';
        form.reset();
      } else {
        const msg = json.errors ? json.errors.map(e => e.msg).join(' ') : json.error;
        errorEl.textContent   = msg || 'Something went wrong.';
        errorEl.style.display = 'block';
      }
    } catch (err) {
      errorEl.textContent   = 'Network error. Please try again.';
      errorEl.style.display = 'block';
      console.error(err);
    }
  });
}

/* ====================================================================
   Utilities
   ==================================================================== */

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/** Simple toast notification */
function showToast(msg, duration = 3000) {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;';
    document.body.appendChild(toastContainer);
  }
  const toast = document.createElement('div');
  toast.textContent = msg;
  toast.style.cssText = `
    background:#2d3436;color:#fff;padding:14px 24px;border-radius:10px;
    font-size:.9rem;font-weight:600;box-shadow:0 4px 20px rgba(0,0,0,.15);
    opacity:0;transform:translateY(20px);transition:opacity .3s,transform .3s;
  `;
  toastContainer.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
