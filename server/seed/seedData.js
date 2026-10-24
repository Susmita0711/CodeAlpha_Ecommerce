const bcrypt = require('bcryptjs');
const { query, initDatabase } = require('../config/database');

const demoCategories = [
  { name: 'All Products', slug: 'all', icon: 'grid' },
  { name: 'Audio & Acoustics', slug: 'audio', icon: 'headphones' },
  { name: 'Smart Wearables', slug: 'wearables', icon: 'watch' },
  { name: 'PC & Gaming Gear', slug: 'gaming-pc', icon: 'cpu' },
  { name: 'Bags & Travel', slug: 'bags-travel', icon: 'briefcase' },
  { name: 'Home & Desk Decor', slug: 'home-desk', icon: 'home' }
];

const demoProducts = [
  {
    name: 'boAt Rockerz 550 Over-Ear Wireless Headphones',
    slug: 'boat-rockerz-550-wireless-headphones',
    category_slug: 'audio',
    category_name: 'Audio & Acoustics',
    description: 'Equipped with 50mm dynamic drivers for immersive punchy bass and signature sound. Features 20 hours of non-stop battery life, plush physical noise-isolating ear cushions, and dual wireless (Bluetooth 5.0) + AUX connectivity.',
    price: 1999,
    original_price: 4999,
    rating: 4.8,
    reviews_count: 1420,
    stock: 45,
    badge: 'Diwali Special',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    specs: {
      "Drivers": "50mm Neodymium Dynamic Drivers",
      "Playback Time": "Up to 20 Hours continuous",
      "Fast Charging": "10 min charge = 90 min playback",
      "Connectivity": "Bluetooth v5.0 + 3.5mm Aux",
      "Warranty": "1 Year boAt Official India Warranty"
    }
  },
  {
    name: 'Noise ColorFit Pro 5 Max Smartwatch (AMOLED Display)',
    slug: 'noise-colorfit-pro-5-max',
    category_slug: 'wearables',
    category_name: 'Smart Wearables',
    description: 'Stunning 1.96-inch Always-on HD AMOLED display with TruSync Bluetooth calling. Packed with 24/7 SpO2 blood oxygen tracking, heart rate, sleep monitor, 100+ sports modes, and metallic finish.',
    price: 2799,
    original_price: 5999,
    rating: 4.7,
    reviews_count: 980,
    stock: 35,
    badge: 'Trending in India',
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    specs: {
      "Display": "1.96\" AMOLED (410x502 px, 600 nits)",
      "Calling": "Advanced Bluetooth Calling with TruSync",
      "Health Tracking": "SpO2, 24/7 Heart Rate, Stress, Sleep",
      "Water Resistance": "IP68 Certified",
      "Battery Life": "Up to 7 Days typical use"
    }
  },
  {
    name: 'Cosmic Byte CB-GK-16 Firefly RGB Mechanical Keyboard',
    slug: 'cosmic-byte-firefly-mechanical-keyboard',
    category_slug: 'gaming-pc',
    category_name: 'PC & Gaming Gear',
    description: 'Engineered for Indian gamers and coders! Features tactile Outemu Blue mechanical switches, per-key customizable RGB backlighting, a compact tenkeyless (87 keys) design, and a braided nylon cable.',
    price: 2299,
    original_price: 3499,
    rating: 4.9,
    reviews_count: 2150,
    stock: 50,
    badge: 'Gamer Choice',
    image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    specs: {
      "Switches": "Outemu Blue Clicky Mechanical Switches",
      "Layout": "Tenkeyless Compact (87 Keys)",
      "Backlight": "Full Spectrum RGB (18 Preset Modes)",
      "Anti-Ghosting": "All-key Rollover",
      "Cable": "1.8m Braided USB Cable"
    }
  },
  {
    name: 'Portronics Toad 23 High-Precision Silent Wireless Mouse',
    slug: 'portronics-toad-23-wireless-mouse',
    category_slug: 'gaming-pc',
    category_name: 'PC & Gaming Gear',
    description: 'Whisper-quiet silent click switches combined with an ergonomic palm-fit contoured shell. Up to 1600 adjustable DPI optical tracking on almost any surface, with 30 million clicks lifespan.',
    price: 599,
    original_price: 1299,
    rating: 4.6,
    reviews_count: 760,
    stock: 80,
    badge: 'Super Saver',
    image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
    specs: {
      "Connectivity": "2.4 GHz USB Nano Dongle (10m range)",
      "DPI": "Adjustable 800 / 1200 / 1600 DPI",
      "Buttons": "Silent Click Left & Right + Scroll",
      "Battery": "1x AA (Up to 6 Months battery life)",
      "Weight": "Ultra-lightweight 72g"
    }
  },
  {
    name: 'Mivi Roam 2 Studio Sound 5W Portable Bluetooth Speaker',
    slug: 'mivi-roam-2-portable-speaker',
    category_slug: 'audio',
    category_name: 'Audio & Acoustics',
    description: 'Proudly Designed and Made in India! Delivers rich 24-bit audio with studio-tuned heavy bass. 24 hours of non-stop battery backup, aircraft-grade aluminum grille, and IPX7 waterproof rating.',
    price: 1099,
    original_price: 2999,
    rating: 4.8,
    reviews_count: 3120,
    stock: 60,
    badge: 'Made in India',
    image_url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
    specs: {
      "Output": "5W RMS with Bass Radiator",
      "Origin": "100% Made in India",
      "Battery": "24 Hours Playtime (2000mAh)",
      "Water Resistance": "IPX7 Waterproof & Drop-proof",
      "Mic": "Built-in HD Microphone for clear calls"
    }
  },
  {
    name: 'Wildcraft 35L Shield Pro Water-Resistant Laptop Backpack',
    slug: 'wildcraft-35l-commuter-backpack',
    category_slug: 'bags-travel',
    category_name: 'Bags & Travel',
    description: 'Durable, weather-resistant travel companion built for daily Indian commutes, college, and office. Shock-absorbing padded compartment fits up to 16-inch laptops, with ergonomic Ergo-Grip shoulder straps.',
    price: 1699,
    original_price: 2799,
    rating: 4.9,
    reviews_count: 890,
    stock: 40,
    badge: 'Best Seller',
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    specs: {
      "Capacity": "35 Liters (3 Large Compartments)",
      "Laptop Fit": "Fits up to 16\" Laptops & Tablets",
      "Material": "Super-durable 600D Coated Polyester",
      "Weatherproofing": "Water-repellent finish + Rain Cover",
      "Warranty": "5 Years Wildcraft India Warranty"
    }
  },
  {
    name: 'Handcrafted Khurja Ceramic Kulhad & Mug Warmer Set',
    slug: 'handcrafted-khurja-ceramic-warmer-set',
    category_slug: 'home-desk',
    category_name: 'Home & Desk Decor',
    description: 'Traditional Indian pottery craftsmanship meets modern desk utility. Authentic handcrafted Khurja ceramic chai mug with a constant 55°C smart warming coaster to keep your morning masala chai or coffee piping hot.',
    price: 899,
    original_price: 1499,
    rating: 4.8,
    reviews_count: 530,
    stock: 35,
    badge: 'Artisan Craft',
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    specs: {
      "Material": "Authentic Khurja Ceramic (Lead-Free)",
      "Capacity": "350 ml Kulhad Mug",
      "Heating Base": "55°C Constant Smart Coaster",
      "Safety": "Auto-shutoff with spill resistance",
      "Power": "18W Indian Plug Compatible"
    }
  },
  {
    name: 'Green Soul ErgoMount Dual Arm Heavy Duty Desk Mount',
    slug: 'green-soul-ergomount-dual-arm',
    category_slug: 'home-desk',
    category_name: 'Home & Desk Decor',
    description: 'Heavy-duty aircraft-grade aluminum dual gas-spring arms for dual monitor productivity. Full 360-degree rotation, +90°/-45° tilt, and integrated Indian cable management channels.',
    price: 2499,
    original_price: 4299,
    rating: 4.7,
    reviews_count: 640,
    stock: 25,
    badge: 'Hot Deal',
    image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
    specs: {
      "Screen Compatibility": "17\" to 32\" Monitors (VESA 75/100)",
      "Weight Capacity": "9 kg per arm",
      "Ergonomics": "360° Screen Rotation, 180° Swivel",
      "Mounting": "C-Clamp & Grommet base included",
      "Material": "Die-cast Solid Aluminum"
    }
  }
];

async function seed() {
  await initDatabase();

  console.log('Seeding Indian demo database...');

  // 1. Clear previous products & categories to refresh with Indian catalog
  await query.run('DELETE FROM order_items');
  await query.run('DELETE FROM orders');
  await query.run('DELETE FROM products');
  await query.run('DELETE FROM categories');

  // 2. Seed Indian demo user (Rahul Sharma)
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);
  
  await query.run(`DELETE FROM users WHERE email = ?`, ['rahul@codealpha.in']);
  await query.run(`DELETE FROM users WHERE email = ?`, ['alex@codealpha.com']);

  const userResult = await query.run(`
    INSERT INTO users (name, email, password_hash, role)
    VALUES (?, ?, ?, ?)
  `, ['Rahul Sharma', 'rahul@codealpha.in', passwordHash, 'customer']);

  const userId = userResult.lastID;
  console.log('Created Indian demo user: rahul@codealpha.in (password: password123)');

  // 3. Seed categories
  const categoryMap = {};
  for (const cat of demoCategories) {
    const res = await query.run('INSERT INTO categories (name, slug, icon) VALUES (?, ?, ?)', [cat.name, cat.slug, cat.icon]);
    categoryMap[cat.slug] = res.lastID;
  }

  // 4. Seed Indian products
  for (const prod of demoProducts) {
    const catId = categoryMap[prod.category_slug] || null;
    await query.run(`
      INSERT INTO products (
        name, slug, category_id, category_name, description, price, original_price,
        rating, reviews_count, stock, image_url, badge, specs_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      prod.name,
      prod.slug,
      catId,
      prod.category_name,
      prod.description,
      prod.price,
      prod.original_price,
      prod.rating,
      prod.reviews_count,
      prod.stock,
      prod.image_url,
      prod.badge,
      JSON.stringify(prod.specs)
    ]);
  }
  console.log(`Seeded ${demoProducts.length} Indian products in INR.`);

  // 5. Seed sample Indian order for Rahul Sharma
  const sampleProd = await query.get('SELECT * FROM products LIMIT 1');
  if (sampleProd) {
    const orderRes = await query.run(`
      INSERT INTO orders (
        order_number, user_id, customer_name, customer_email, customer_phone,
        shipping_address, city, postal_code, subtotal, discount, shipping_fee, total_amount, payment_method, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'ORD-IND-' + Math.floor(100000 + Math.random() * 900000),
      userId,
      'Rahul Sharma',
      'rahul@codealpha.in',
      '+91 98765 43210',
      'Flat 402, Shanti Heights, 100 Feet Road, Indiranagar',
      'Bengaluru, Karnataka',
      '560038',
      sampleProd.price,
      200,
      0,
      sampleProd.price - 200,
      'UPI (Google Pay / PhonePe)',
      'Delivered'
    ]);

    await query.run(`
      INSERT INTO order_items (order_id, product_id, product_name, price, quantity, image_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      orderRes.lastID,
      sampleProd.id,
      sampleProd.name,
      sampleProd.price,
      1,
      sampleProd.image_url
    ]);
    console.log('Seeded sample Indian order with UPI payment.');
  }

  console.log('Indian eCommerce database seed completed successfully!');
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed error:', err);
      process.exit(1);
    });
}

module.exports = { seed };
