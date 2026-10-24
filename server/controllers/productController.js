const { query } = require('../config/database');

// Get all products with filtering, search, sorting
async function getProducts(req, res) {
  try {
    const { category, search, sort, minPrice, maxPrice } = req.query;

    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      sql += ' AND (category_name = ? OR category_id IN (SELECT id FROM categories WHERE slug = ?))';
      params.push(category, category);
    }

    if (search && search.trim() !== '') {
      sql += ' AND (name LIKE ? OR description LIKE ? OR category_name LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    if (minPrice) {
      sql += ' AND price >= ?';
      params.push(Number(minPrice));
    }

    if (maxPrice) {
      sql += ' AND price <= ?';
      params.push(Number(maxPrice));
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        sql += ' ORDER BY price ASC';
        break;
      case 'price_desc':
        sql += ' ORDER BY price DESC';
        break;
      case 'rating':
        sql += ' ORDER BY rating DESC';
        break;
      case 'reviews':
        sql += ' ORDER BY reviews_count DESC';
        break;
      case 'newest':
      default:
        sql += ' ORDER BY id DESC';
        break;
    }

    const rows = await query.all(sql, params);

    // Parse specs_json safely
    const products = rows.map((p) => {
      let specs = {};
      try {
        if (p.specs_json) specs = JSON.parse(p.specs_json);
      } catch (e) {}
      return {
        ...p,
        specs
      };
    });

    return res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('getProducts error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch products.' });
  }
}

// Get single product details
async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const product = await query.get('SELECT * FROM products WHERE id = ?', [id]);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    let specs = {};
    try {
      if (product.specs_json) specs = JSON.parse(product.specs_json);
    } catch (e) {}

    // Fetch related products in the same category
    const related = await query.all(
      'SELECT id, name, price, original_price, rating, image_url, badge FROM products WHERE category_id = ? AND id != ? LIMIT 4',
      [product.category_id, product.id]
    );

    return res.json({
      success: true,
      product: {
        ...product,
        specs,
        related
      }
    });
  } catch (error) {
    console.error('getProductById error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch product details.' });
  }
}

// Get all categories with product counts
async function getCategories(req, res) {
  try {
    const categories = await query.all(`
      SELECT c.*, COUNT(p.id) AS product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id
      ORDER BY c.id ASC
    `);

    // Total products count for 'all'
    const totalRow = await query.get('SELECT COUNT(*) AS total FROM products');
    const totalCount = totalRow ? totalRow.total : 0;

    return res.json({
      success: true,
      totalProducts: totalCount,
      categories
    });
  } catch (error) {
    console.error('getCategories error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
}

module.exports = {
  getProducts,
  getProductById,
  getCategories
};
