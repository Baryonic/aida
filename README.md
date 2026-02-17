# AidaBooks – Children's Books Author & Teacher Website

A production-ready Node.js + Express website for a children's-books author and teacher, with a book catalogue, shopping cart, contact form, and immersive JavaScript animations.

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | HTML5, CSS3, Vanilla JavaScript   |
| Backend    | Node.js 18+, Express 4            |
| Database   | SQLite (via better-sqlite3)       |
| Server OS  | Ubuntu 22.04 LTS                  |

---

## Project Structure

```
/aida
├── server.js                 # Express entry point
├── package.json
├── .env                      # Environment variables (not committed)
├── .env.example              # Template for .env
│
├── /models
│   ├── database.js           # SQLite connection & schema
│   ├── Book.js               # Book data-access layer
│   ├── Contact.js            # Contact message data-access layer
│   ├── CartItem.js           # Server-side cart data-access layer
│   └── seed.js               # Seed script – sample books
│
├── /controllers
│   ├── booksController.js
│   ├── cartController.js
│   └── contactController.js
│
├── /routes
│   ├── books.js
│   ├── cart.js
│   └── contact.js
│
├── /middleware
│   ├── logger.js             # Colour-coded request logger
│   └── errorHandler.js       # Centralised error handler
│
├── /views
│   ├── index.html            # Home page
│   ├── books.html            # All books
│   ├── cart.html             # Shopping cart
│   ├── contact.html          # Contact form
│   └── 404.html              # Not found
│
└── /public
    ├── /css
    │   ├── style.css         # Global styles
    │   └── animations.css    # Keyframes & animation helpers
    ├── /js
    │   ├── main.js           # Page-specific logic
    │   ├── cart.js            # Client-side cart (localStorage)
    │   ├── navigation.js     # Navbar behaviour
    │   └── animations.js     # Scroll reveals, parallax, particles
    └── /images               # Book covers (add your own)
```

---

## Quick Start (Development)

```bash
# 1. Clone the repository
git clone <repo-url> aida && cd aida

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.example .env

# 4. Seed the database with sample books
npm run seed

# 5. Start the development server (auto-reload)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## API Endpoints

| Method   | Endpoint               | Description                          |
|----------|------------------------|--------------------------------------|
| `GET`    | `/api/books`           | List all books                       |
| `GET`    | `/api/books/featured`  | List featured books                  |
| `GET`    | `/api/books/:id`       | Get a single book by ID              |
| `GET`    | `/api/books/slug/:slug`| Get a single book by URL slug        |
| `GET`    | `/api/cart?session=X`  | Get cart items for a session         |
| `POST`   | `/api/cart`            | Add item `{ session, bookId, qty }`  |
| `PATCH`  | `/api/cart/:id`        | Update quantity `{ session, qty }`   |
| `DELETE` | `/api/cart/:id?session=X` | Remove item from cart             |
| `DELETE` | `/api/cart?session=X`  | Clear entire cart                    |
| `POST`   | `/api/cart/checkout`   | Checkout placeholder                 |
| `POST`   | `/api/contact`         | Submit contact form                  |
| `GET`    | `/api/contact`         | List contact messages (admin)        |

---

## Deployment on Ubuntu 22.04 LTS

### 1. Server Preparation

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+ (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install build tools (needed for better-sqlite3)
sudo apt install -y build-essential python3

# Verify
node -v   # v18.x+
npm -v    # 9.x+
```

### 2. Deploy the Application

```bash
# Clone / upload your project
cd /var/www
sudo git clone <repo-url> aida
sudo chown -R $USER:$USER /var/www/aida
cd /var/www/aida

# Install production dependencies
npm ci --omit=dev

# Create environment file
cp .env.example .env
nano .env
# → set NODE_ENV=production
# → set a strong SESSION_SECRET
# → set PORT=3000 (or your preferred port)

# Seed the database
npm run seed
```

### 3. Run with PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the app
pm2 start server.js --name aida-books

# Save the process list & enable startup on reboot
pm2 save
pm2 startup
# → Run the command PM2 prints out (sudo ...)
```

### 4. Alternative: systemd Service

Create `/etc/systemd/system/aida-books.service`:

```ini
[Unit]
Description=AidaBooks - Children's Books Website
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/aida
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable aida-books
sudo systemctl start aida-books
sudo systemctl status aida-books
```

### 5. Reverse Proxy with Nginx

```bash
sudo apt install -y nginx

sudo nano /etc/nginx/sites-available/aida-books
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache static assets
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|woff2?)$ {
        proxy_pass http://127.0.0.1:3000;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/aida-books /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## Environment Variables

| Variable        | Default             | Description                       |
|-----------------|---------------------|-----------------------------------|
| `PORT`          | `3000`              | Server port                       |
| `NODE_ENV`      | `development`       | `development` or `production`     |
| `SESSION_SECRET` | —                  | Random secret (used for future auth) |
| `DB_PATH`       | `./data/aida.db`    | Path to the SQLite database file  |

---

## Adding Book Cover Images

1. Place images in `public/images/` (e.g., `book-whispering-woods.jpg`).
2. The seed data references filenames like `/images/book-whispering-woods.jpg`.
3. Recommended size: **600×800 px**, JPEG or WebP, optimised for web.

---

## Future Enhancements

- [ ] Payment gateway integration (Stripe / PayPal) at `/api/cart/checkout`
- [ ] Admin dashboard for managing books and messages
- [ ] User authentication
- [ ] Book detail pages with full descriptions and reviews
- [ ] Email notifications for contact form submissions

---

## License

ISC
