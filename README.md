# 🇮🇳 BharatKart — India's Tech & Lifestyle Store

> **Fullstack Web Development Internship Project for CodeAlpha**  
> Developed with HTML5, Vanilla CSS3, JavaScript (ES6+), Node.js, Express.js, and SQLite3.

---

## 🌟 Overview

**BharatKart** is an authentic Indian fullstack e-commerce web platform tailored for Indian consumers, students, developers, and tech enthusiasts. The application features a catalog of popular Indian brands (boAt, Noise, Cosmic Byte, Portronics, Mivi, Wildcraft, Khurja pottery), Indian Rupee (`₹`) pricing, GST-inclusive calculations, free pan-India delivery gamification, instant UPI and RuPay checkout simulations, user authentication with bcrypt/JWT, and persistent SQLite database storage.

---

## 🚀 Key Features

### 1. 🛍️ Indian Curated Product Catalog
- **Products & Brands:** Includes boAt Rockerz ANC Headphones, Noise ColorFit AMOLED Smartwatch, Cosmic Byte RGB Mechanical Keyboard, Portronics Silent Mouse, Mivi Roam Made-in-India Speaker, Wildcraft Backpack, Khurja Artisan Ceramic Mug, and Green Soul ErgoMount.
- **Indian Pricing & Discounts:** Stored in INR (`₹`) with realistic festive discounts (e.g., ₹1,999 with 60% OFF MRP).
- **Festival & Quality Badges:** `Diwali Special`, `Trending in India`, `Made in India`, `Gamer Choice`, `Artisan Craft`.
- **Search & Filter:** Real-time debounced search, categories (*Audio & Acoustics*, *Smart Wearables*, *PC & Gaming Gear*, *Bags & Travel*, *Home & Desk Decor*), and sorting.

### 2. 🔍 Product Details & Specifications
- High-res photography, verified customer rating breakdowns, warehouse stock status indicators, technical specs tables, and PIN code delivery checks.
- Quantity picker with real-time inventory limits.

### 3. 🛒 Interactive Shopping Cart
- Slide-over cart drawer with persistent `localStorage` synchronization.
- **Free Delivery Across India:** Visual progress bar toward the ₹999 free shipping threshold (standard delivery: ₹49).
- **Festive Coupons:**
  - `DIWALI20` — 🪔 20% Festive Discount
  - `CODEALPHA10` — ⚡ 10% CodeAlpha Discount
  - `DESI100` — ₹100 Flat Savings

### 4. 💳 Indian Payment Ecosystem (Simulated Sandbox)
- **Instant UPI Payment:** Google Pay, PhonePe, Paytm, BHIM, Cred UPI with virtual payment address input (`rahul@okaxis`).
- **RuPay & Debit/Credit Cards:** Domestic RuPay, Visa, and Mastercard with CVV and expiry validation.
- **Net Banking:** State Bank of India (SBI), HDFC Bank, ICICI Bank, Axis Bank, PNB.
- **Cash on Delivery (COD):** Authentic pay-at-doorstep option.

### 5. 📦 Order Processing & Receipts
- Real-time stock reduction in SQLite upon order confirmation.
- Generates an Indian tracking code (`ORD-IND-XXXXXX-XXX`), itemized tax receipt, and 1–3 business days express delivery timeline.

### 6. 🔐 User Authentication (JWT + Bcrypt)
- Secure user signup and login.
- **1-Click Demo Login:** Instantly authenticate as **Rahul Sharma** (`rahul@codealpha.in` / `password123`) with one click from the hero banner or sign-in modal.
- **"My Orders" Modal:** Displays user's complete order history with live status (`Processing`, `Shipped`, `Delivered`).

---

## 🛠️ Technology Stack

| Component | Technologies |
|---|---|
| **Frontend** | HTML5, Vanilla CSS3 (Custom Design System, Flexbox, Grid), Vanilla JavaScript (ES6+ Modules) |
| **Icons & Fonts** | FontAwesome 6, Google Fonts (Plus Jakarta Sans & Inter) |
| **Backend** | Node.js, Express.js (REST API, static file serving) |
| **Database** | SQLite3 (`data/ecommerce.db`) |
| **Security** | `bcryptjs` password hashing, `jsonwebtoken` (JWT) authentication, `cors` |

---

## 📂 Project Architecture

```
CodeAlpha_Ecommerce/
├── package.json               # Node.js dependencies and scripts
├── .env                       # Environment configuration (PORT, JWT_SECRET)
├── README.md                  # Project documentation & presentation guide
├── data/
│   └── ecommerce.db           # SQLite database file
├── server/
│   ├── config/
│   │   └── database.js        # SQLite connection, schema tables & query helpers
│   ├── controllers/
│   │   ├── authController.js    # Register, login, profile endpoints
│   │   ├── productController.js # Product listings, details, categories
│   │   └── orderController.js   # Order processing, INR stock deduction, receipts
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT token validation
│   ├── routes/
│   │   ├── authRoutes.js      # /api/auth routes
│   │   ├── productRoutes.js   # /api/products routes
│   │   └── orderRoutes.js     # /api/orders routes
│   ├── seed/
│   │   └── seedData.js        # Seeds Indian products, users, and orders
│   └── app.js                 # Express server & static hosting
└── public/
    ├── index.html             # BharatKart storefront UI
    ├── css/
    │   └── style.css          # Modern UI stylesheet with Indian additions
    └── js/
        ├── api.js             # API communications
        ├── auth.js            # Authentication controller (Rahul Sharma)
        ├── cart.js            # Shopping cart controller (INR, UPI, coupons)
        └── app.js             # Main application orchestrator
```

---

## 🏃 Running the Project

```bash
# 1. Install dependencies
npm install

# 2. Seed Indian Database (runs automatically or standalone)
npm run seed

# 3. Start the Server
npm start
```
The store is live at: **`http://localhost:5000`**

---

## 👤 Demo Evaluation Credentials
- **Name:** Rahul Sharma
- **Email:** `rahul@codealpha.in`
- **Password:** `password123`
- **Address:** Flat 402, Shanti Heights, 100 Feet Rd, Indiranagar, Bengaluru, Karnataka - 560038
- *(Or simply click the **"1-Click Demo Login (Rahul)"** button on the hero banner)*
