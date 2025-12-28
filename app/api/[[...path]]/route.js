import { NextResponse } from 'next/server';
import pool, { initializeDatabase } from '@/lib/db';
import { hashPassword, verifyPassword, generateToken, verifyToken, maskPhoneNumber, sendOTP, verifyOTP } from '@/lib/auth';
import { generateBarcode } from '@/lib/barcode';
import { saveFile, saveMultipleFiles } from '@/lib/upload';

// Initialize database on first API call
let dbInitialized = false;
async function ensureDbInitialized() {
  if (!dbInitialized) {
    await initializeDatabase();
    dbInitialized = true;
  }
}

// Middleware to verify JWT token
function authenticate(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  return verifyToken(token);
}

// Role-based middleware
function requireRole(user, allowedRoles) {
  if (!user) {
    return { error: 'Unauthorized', status: 401 };
  }
  if (!allowedRoles.includes(user.role)) {
    return { error: 'Forbidden', status: 403 };
  }
  return null;
}

// GET handler
export async function GET(request) {
  await ensureDbInitialized();
  
  const { pathname } = new URL(request.url);
  const path = pathname.replace('/api/', '');

  try {
    // Health check
    if (path === '' || path === 'health') {
      return NextResponse.json({ 
        status: 'ok', 
        message: 'Chaarpaisa API is running',
        timestamp: new Date().toISOString()
      });
    }

    const user = authenticate(request);

    // Get verified sellers (public)
    if (path === 'sellers/verified') {
      const result = await pool.query(`
        SELECT sp.*, u.name, u.email, u.phone_number
        FROM seller_profiles sp
        JOIN users u ON sp.user_id = u.id
        WHERE sp.verified = true
        ORDER BY sp.created_at DESC
      `);

      return NextResponse.json({ success: true, sellers: result.rows });
    }

    // Get seller store (public)
    if (path.startsWith('seller-store/')) {
      const sellerId = path.split('/')[1];
      
      // Get seller profile
      const sellerResult = await pool.query(`
        SELECT sp.*, u.name, u.email, u.phone_number
        FROM seller_profiles sp
        JOIN users u ON sp.user_id = u.id
        WHERE sp.id = $1 AND sp.verified = true
      `, [sellerId]);

      if (sellerResult.rows.length === 0) {
        return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
      }

      const seller = sellerResult.rows[0];

      // Get seller's items
      const itemsResult = await pool.query(`
        SELECT * FROM items 
        WHERE owner_id = $1 AND status = 'listed'
        ORDER BY created_at DESC
      `, [seller.user_id]);

      return NextResponse.json({ 
        success: true, 
        seller,
        items: itemsResult.rows 
      });
    }

    // Get all items (public or filtered)
    if (path === 'items') {
      const { searchParams } = new URL(request.url);
      const category = searchParams.get('category');
      const location = searchParams.get('location');
      const minPrice = searchParams.get('minPrice');
      const maxPrice = searchParams.get('maxPrice');
      const status = searchParams.get('status') || 'listed';
      const search = searchParams.get('search');

      let query = `
        SELECT i.*, u.name as owner_name, u.phone_number as owner_phone
        FROM items i
        JOIN users u ON i.owner_id = u.id
        WHERE i.status = $1
      `;
      const params = [status];
      let paramCount = 1;

      if (category) {
        paramCount++;
        query += ` AND i.category = $${paramCount}`;
        params.push(category);
      }
      if (location) {
        paramCount++;
        query += ` AND i.location ILIKE $${paramCount}`;
        params.push(`%${location}%`);
      }
      if (minPrice) {
        paramCount++;
        query += ` AND i.expected_price >= $${paramCount}`;
        params.push(minPrice);
      }
      if (maxPrice) {
        paramCount++;
        query += ` AND i.expected_price <= $${paramCount}`;
        params.push(maxPrice);
      }
      if (search) {
        paramCount++;
        query += ` AND (i.name ILIKE $${paramCount} OR i.description ILIKE $${paramCount})`;
        params.push(`%${search}%`);
      }

      query += ' ORDER BY i.created_at DESC';

      const result = await pool.query(query, params);
      
      // Mask phone numbers for non-authenticated users
      const items = result.rows.map(item => ({
        ...item,
        owner_phone: user ? item.owner_phone : maskPhoneNumber(item.owner_phone)
      }));

      return NextResponse.json({ success: true, items });
    }

    // Get single item by ID
    if (path.startsWith('items/')) {
      const itemId = path.split('/')[1];
      const result = await pool.query(`
        SELECT i.*, u.name as owner_name, u.phone_number as owner_phone, u.id as owner_user_id
        FROM items i
        JOIN users u ON i.owner_id = u.id
        WHERE i.id = $1
      `, [itemId]);

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }

      const item = result.rows[0];
      item.owner_phone = user ? item.owner_phone : maskPhoneNumber(item.owner_phone);

      return NextResponse.json({ success: true, item });
    }

    // Get user's items (any authenticated user)
    if (path === 'my-items') {
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const result = await pool.query(`
        SELECT * FROM items 
        WHERE owner_id = $1 
        ORDER BY created_at DESC
      `, [user.id]);

      return NextResponse.json({ success: true, items: result.rows });
    }

    // Get offers for an item (appusers only)
    if (path.startsWith('items/') && path.includes('/offers')) {
      const roleCheck = requireRole(user, ['appusers', 'seller', 'admin']);
      if (roleCheck) return NextResponse.json(roleCheck, { status: roleCheck.status });

      const itemId = path.split('/')[1];
      
      const result = await pool.query(`
        SELECT o.*, u.name as seller_name, u.phone_number as seller_phone, i.name as item_name
        FROM offers o
        JOIN users u ON o.seller_id = u.id
        JOIN items i ON o.item_id = i.id
        WHERE o.item_id = $1
        ORDER BY o.created_at DESC
      `, [itemId]);

      const offers = result.rows.map(offer => ({
        ...offer,
        seller_phone: maskPhoneNumber(offer.seller_phone)
      }));

      return NextResponse.json({ success: true, offers });
    }

    // Get seller's offers
    if (path === 'my-offers') {
      const roleCheck = requireRole(user, ['seller', 'admin']);
      if (roleCheck) return NextResponse.json(roleCheck, { status: roleCheck.status });

      const result = await pool.query(`
        SELECT o.*, i.name as item_name, i.images, i.expected_price, u.name as owner_name
        FROM offers o
        JOIN items i ON o.item_id = i.id
        JOIN users u ON o.owner_id = u.id
        WHERE o.seller_id = $1
        ORDER BY o.created_at DESC
      `, [user.id]);

      return NextResponse.json({ success: true, offers: result.rows });
    }

    // Get single offer
    if (path.startsWith('offers/')) {
      const roleCheck = requireRole(user, ['renter', 'seller', 'admin']);
      if (roleCheck) return NextResponse.json(roleCheck, { status: roleCheck.status });

      const offerId = path.split('/')[1];
      const result = await pool.query(`
        SELECT o.*, i.name as item_name, i.images, 
               s.name as seller_name, s.phone_number as seller_phone,
               ow.name as owner_name, ow.phone_number as owner_phone
        FROM offers o
        JOIN items i ON o.item_id = i.id
        JOIN users s ON o.seller_id = s.id
        JOIN users ow ON o.owner_id = ow.id
        WHERE o.id = $1
      `, [offerId]);

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
      }

      const offer = result.rows[0];
      
      // Show full phone numbers only after acceptance
      if (offer.status !== 'accepted' && offer.status !== 'locked') {
        offer.seller_phone = maskPhoneNumber(offer.seller_phone);
        offer.owner_phone = maskPhoneNumber(offer.owner_phone);
      }

      return NextResponse.json({ success: true, offer });
    }

    // Get user profile
    if (path === 'profile') {
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const result = await pool.query(
        'SELECT id, name, email, role, phone_number, verified, created_at FROM users WHERE id = $1',
        [user.id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, user: result.rows[0] });
    }

    // Get seller profile
    if (path === 'seller-profile') {
      const roleCheck = requireRole(user, ['seller', 'admin']);
      if (roleCheck) return NextResponse.json(roleCheck, { status: roleCheck.status });

      const result = await pool.query(
        'SELECT * FROM seller_profiles WHERE user_id = $1',
        [user.id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, profile: result.rows[0] });
    }

    // Admin: Get all users
    if (path === 'admin/users') {
      const roleCheck = requireRole(user, ['admin']);
      if (roleCheck) return NextResponse.json(roleCheck, { status: roleCheck.status });

      const result = await pool.query(`
        SELECT id, name, email, role, phone_number, verified, created_at 
        FROM users 
        ORDER BY created_at DESC
      `);

      return NextResponse.json({ success: true, users: result.rows });
    }

    // Admin: Get all sellers pending verification
    if (path === 'admin/sellers/pending') {
      const roleCheck = requireRole(user, ['admin']);
      if (roleCheck) return NextResponse.json(roleCheck, { status: roleCheck.status });

      const result = await pool.query(`
        SELECT sp.*, u.name, u.email, u.phone_number
        FROM seller_profiles sp
        JOIN users u ON sp.user_id = u.id
        WHERE sp.verified = false
        ORDER BY sp.created_at DESC
      `);

      return NextResponse.json({ success: true, sellers: result.rows });
    }

    // Get revenue stats (any authenticated user)
    if (path === 'revenue') {
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const result = await pool.query(`
        SELECT 
          COUNT(*) as total_items,
          COUNT(CASE WHEN status = 'listed' THEN 1 END) as listed_items,
          COUNT(CASE WHEN status = 'rented' THEN 1 END) as rented_items,
          COALESCE(SUM(CASE WHEN status = 'rented' THEN expected_price ELSE 0 END), 0) as total_revenue
        FROM items
        WHERE owner_id = $1
      `, [user.id]);

      return NextResponse.json({ success: true, stats: result.rows[0] });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: error.message 
    }, { status: 500 });
  }
}

// POST handler
export async function POST(request) {
  await ensureDbInitialized();
  
  const { pathname } = new URL(request.url);
  const path = pathname.replace('/api/', '');

  try {
    // User signup
    if (path === 'signup') {
      const body = await request.json();
      const { name, email, password, role, phone_number } = body;

      if (!name || !email || !password) {
        return NextResponse.json({ 
          error: 'Name, email and password are required' 
        }, { status: 400 });
      }

      // Check if user exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return NextResponse.json({ 
          error: 'User already exists with this email' 
        }, { status: 400 });
      }

      // Create user
      const passwordHash = hashPassword(password);
      const result = await pool.query(
        `INSERT INTO users (name, email, password_hash, role, phone_number) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, name, email, role, phone_number, verified, created_at`,
        [name, email, passwordHash, role || 'renter', phone_number]
      );

      const newUser = result.rows[0];
      const token = generateToken(newUser);

      return NextResponse.json({ 
        success: true, 
        user: newUser, 
        token 
      }, { status: 201 });
    }

    // User login
    if (path === 'login') {
      const body = await request.json();
      const { email, password } = body;

      if (!email || !password) {
        return NextResponse.json({ 
          error: 'Email and password are required' 
        }, { status: 400 });
      }

      // Find user
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ 
          error: 'Invalid credentials' 
        }, { status: 401 });
      }

      const user = result.rows[0];

      // Verify password
      if (!verifyPassword(password, user.password_hash)) {
        return NextResponse.json({ 
          error: 'Invalid credentials' 
        }, { status: 401 });
      }

      const token = generateToken(user);
      delete user.password_hash;

      return NextResponse.json({ 
        success: true, 
        user, 
        token 
      });
    }

    const user = authenticate(request);

    // Seller registration
    if (path === 'seller/register') {
      const roleCheck = requireRole(user, ['appusers', 'seller']);
      if (roleCheck) return NextResponse.json(roleCheck, { status: roleCheck.status });

      const formData = await request.formData();
      const store_name = formData.get('store_name');
      const store_description = formData.get('store_description');
      const categories = formData.get('categories')?.split(',') || [];
      const location = formData.get('location');
      const store_image = formData.get('store_image');
      const store_video = formData.get('store_video');

      if (!store_name) {
        return NextResponse.json({ 
          error: 'Store name is required' 
        }, { status: 400 });
      }

      // Save uploaded files
      let imageUrl = null;
      let videoUrl = null;

      if (store_image) {
        imageUrl = await saveFile(store_image, 'uploads/stores');
      }

      if (store_video) {
        videoUrl = await saveFile(store_video, 'uploads/stores');
      }

      // Check if seller profile already exists
      const existing = await pool.query(
        'SELECT id FROM seller_profiles WHERE user_id = $1',
        [user.id]
      );

      if (existing.rows.length > 0) {
        return NextResponse.json({ 
          error: 'Seller profile already exists' 
        }, { status: 400 });
      }

      // Create seller profile
      const result = await pool.query(
        `INSERT INTO seller_profiles 
         (user_id, store_name, store_description, store_image, store_video, categories, location) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING *`,
        [user.id, store_name, store_description, imageUrl, videoUrl, categories, location]
      );

      // Update user role to seller
      await pool.query(
        'UPDATE users SET role = $1 WHERE id = $2',
        ['seller', user.id]
      );

      return NextResponse.json({ 
        success: true, 
        profile: result.rows[0],
        message: 'Seller profile created. Pending admin verification.'
      }, { status: 201 });
    }

    // Create item (any authenticated user can list items)
    if (path === 'items') {
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const formData = await request.formData();
      const name = formData.get('name');
      const category = formData.get('category');
      const description = formData.get('description');
      const location = formData.get('location');
      const expected_price = formData.get('expected_price');
      const rental_price_per_day = formData.get('rental_price_per_day');
      const rental_days_min = formData.get('rental_days_min');
      const rental_days_max = formData.get('rental_days_max');
      const age = formData.get('age');
      const condition = formData.get('condition');
      
      const images = formData.getAll('images');

      if (!name || !category || !expected_price) {
        return NextResponse.json({ 
          error: 'Name, category and expected price are required' 
        }, { status: 400 });
      }

      // Save uploaded images
      let imageUrls = [];
      if (images && images.length > 0) {
        imageUrls = await saveMultipleFiles(images, 'uploads/items');
      }

      const result = await pool.query(
        `INSERT INTO items 
         (owner_id, name, category, description, location, expected_price, rental_price_per_day, rental_days_min, rental_days_max, age, condition, images) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
         RETURNING *`,
        [user.id, name, category, description, location, expected_price, rental_price_per_day, rental_days_min, rental_days_max, age, condition, imageUrls]
      );

      return NextResponse.json({ 
        success: true, 
        item: result.rows[0] 
      }, { status: 201 });
    }

    // Create offer (seller)
    if (path === 'offers') {
      const roleCheck = requireRole(user, ['seller', 'admin']);
      if (roleCheck) return NextResponse.json(roleCheck, { status: roleCheck.status });

      const body = await request.json();
      const { item_id, offer_price, message } = body;

      if (!item_id || !offer_price) {
        return NextResponse.json({ 
          error: 'Item ID and offer price are required' 
        }, { status: 400 });
      }

      // Get item and owner
      const itemResult = await pool.query(
        'SELECT owner_id, status FROM items WHERE id = $1',
        [item_id]
      );

      if (itemResult.rows.length === 0) {
        return NextResponse.json({ 
          error: 'Item not found' 
        }, { status: 404 });
      }

      const item = itemResult.rows[0];

      if (item.status !== 'listed') {
        return NextResponse.json({ 
          error: 'Item is not available for offers' 
        }, { status: 400 });
      }

      // Create offer
      const result = await pool.query(
        `INSERT INTO offers 
         (item_id, seller_id, owner_id, offer_price, message) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
        [item_id, user.id, item.owner_id, offer_price, message]
      );

      return NextResponse.json({ 
        success: true, 
        offer: result.rows[0] 
      }, { status: 201 });
    }

    // Counter offer (renter)
    if (path.startsWith('offers/') && path.endsWith('/counter')) {
      const roleCheck = requireRole(user, ['renter', 'admin']);
      if (roleCheck) return NextResponse.json(roleCheck, { status: roleCheck.status });

      const offerId = path.split('/')[1];
      const body = await request.json();
      const { counter_price, message } = body;

      if (!counter_price) {
        return NextResponse.json({ 
          error: 'Counter price is required' 
        }, { status: 400 });
      }

      // Update offer
      const result = await pool.query(
        `UPDATE offers 
         SET counter_price = $1, status = 'countered', updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2 AND owner_id = $3 
         RETURNING *`,
        [counter_price, offerId, user.id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ 
          error: 'Offer not found or unauthorized' 
        }, { status: 404 });
      }

      // Add message if provided
      if (message) {
        await pool.query(
          'INSERT INTO messages (offer_id, sender_id, message) VALUES ($1, $2, $3)',
          [offerId, user.id, message]
        );
      }

      return NextResponse.json({ 
        success: true, 
        offer: result.rows[0] 
      });
    }

    // Accept offer (renter)
    if (path.startsWith('offers/') && path.endsWith('/accept')) {
      const roleCheck = requireRole(user, ['renter', 'admin']);
      if (roleCheck) return NextResponse.json(roleCheck, { status: roleCheck.status });

      const offerId = path.split('/')[1];

      // Get offer details
      const offerResult = await pool.query(
        'SELECT * FROM offers WHERE id = $1 AND owner_id = $2',
        [offerId, user.id]
      );

      if (offerResult.rows.length === 0) {
        return NextResponse.json({ 
          error: 'Offer not found or unauthorized' 
        }, { status: 404 });
      }

      const offer = offerResult.rows[0];

      // Update offer status
      await pool.query(
        `UPDATE offers 
         SET status = 'accepted', updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1`,
        [offerId]
      );

      // Update item status
      await pool.query(
        `UPDATE items 
         SET status = 'accepted', updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1`,
        [offer.item_id]
      );

      return NextResponse.json({ 
        success: true, 
        message: 'Offer accepted. Item locked for this seller.',
        offer_id: offerId
      });
    }

    // Lock deal and generate barcode (seller)
    if (path.startsWith('offers/') && path.endsWith('/lock')) {
      const roleCheck = requireRole(user, ['seller', 'admin']);
      if (roleCheck) return NextResponse.json(roleCheck, { status: roleCheck.status });

      const offerId = path.split('/')[1];

      // Get offer details
      const offerResult = await pool.query(
        'SELECT * FROM offers WHERE id = $1 AND seller_id = $2 AND status = $3',
        [offerId, user.id, 'accepted']
      );

      if (offerResult.rows.length === 0) {
        return NextResponse.json({ 
          error: 'Offer not found, unauthorized, or not accepted' 
        }, { status: 404 });
      }

      const offer = offerResult.rows[0];

      // Generate barcode
      const barcodeData = `CHAARPAISA-${offer.item_id}-${offerId}`;
      const barcodeImage = await generateBarcode(barcodeData);

      // Update offer and item
      await pool.query(
        `UPDATE offers 
         SET status = 'locked', updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1`,
        [offerId]
      );

      await pool.query(
        `UPDATE items 
         SET status = 'locked', barcode = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2`,
        [barcodeData, offer.item_id]
      );

      return NextResponse.json({ 
        success: true, 
        message: 'Deal locked successfully',
        barcode: barcodeImage,
        barcode_data: barcodeData
      });
    }

    // Send OTP for verification
    if (path === 'send-otp') {
      const body = await request.json();
      const { phone_number } = body;

      if (!phone_number) {
        return NextResponse.json({ 
          error: 'Phone number is required' 
        }, { status: 400 });
      }

      const otpResponse = await sendOTP(phone_number);

      return NextResponse.json({ 
        success: true, 
        message: 'OTP sent successfully',
        otp: process.env.NODE_ENV === 'development' ? otpResponse.otp : undefined
      });
    }

    // Verify OTP
    if (path === 'verify-otp') {
      const body = await request.json();
      const { otp } = body;

      if (!otp) {
        return NextResponse.json({ 
          error: 'OTP is required' 
        }, { status: 400 });
      }

      const isValid = verifyOTP(otp);

      if (!isValid) {
        return NextResponse.json({ 
          error: 'Invalid OTP' 
        }, { status: 400 });
      }

      return NextResponse.json({ 
        success: true, 
        message: 'OTP verified successfully'
      });
    }

    // Admin: Approve seller
    if (path.startsWith('admin/sellers/') && path.endsWith('/approve')) {
      const roleCheck = requireRole(user, ['admin']);
      if (roleCheck) return NextResponse.json(roleCheck, { status: roleCheck.status });

      const sellerId = path.split('/')[2];

      await pool.query(
        'UPDATE seller_profiles SET verified = true WHERE id = $1',
        [sellerId]
      );

      return NextResponse.json({ 
        success: true, 
        message: 'Seller approved successfully'
      });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: error.message 
    }, { status: 500 });
  }
}

// PUT handler
export async function PUT(request) {
  await ensureDbInitialized();
  
  const { pathname } = new URL(request.url);
  const path = pathname.replace('/api/', '');

  try {
    const user = authenticate(request);

    // Update item status (owner/seller)
    if (path.startsWith('items/') && path.endsWith('/status')) {
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const itemId = path.split('/')[1];
      const body = await request.json();
      const { status } = body;

      if (!status) {
        return NextResponse.json({ 
          error: 'Status is required' 
        }, { status: 400 });
      }

      // Validate status values
      const validStatuses = ['listed', 'accepted', 'locked', 'rented', 'sold', 'unavailable'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ 
          error: 'Invalid status' 
        }, { status: 400 });
      }

      const result = await pool.query(
        `UPDATE items 
         SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND owner_id = $3
         RETURNING *`,
        [status, itemId, user.id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ 
          error: 'Item not found or unauthorized' 
        }, { status: 404 });
      }

      return NextResponse.json({ 
        success: true, 
        item: result.rows[0] 
      });
    }

    // Update item (any authenticated user for their own items)
    if (path.startsWith('items/')) {
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const itemId = path.split('/')[1];
      const body = await request.json();
      const { name, category, description, location, expected_price, rental_price_per_day, rental_days_min, rental_days_max, age, condition } = body;

      const result = await pool.query(
        `UPDATE items 
         SET name = COALESCE($1, name),
             category = COALESCE($2, category),
             description = COALESCE($3, description),
             location = COALESCE($4, location),
             expected_price = COALESCE($5, expected_price),
             rental_price_per_day = COALESCE($6, rental_price_per_day),
             rental_days_min = COALESCE($7, rental_days_min),
             rental_days_max = COALESCE($8, rental_days_max),
             age = COALESCE($9, age),
             condition = COALESCE($10, condition),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $11 AND owner_id = $12
         RETURNING *`,
        [name, category, description, location, expected_price, rental_price_per_day, rental_days_min, rental_days_max, age, condition, itemId, user.id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ 
          error: 'Item not found or unauthorized' 
        }, { status: 404 });
      }

      return NextResponse.json({ 
        success: true, 
        item: result.rows[0] 
      });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: error.message 
    }, { status: 500 });
  }
}

// DELETE handler
export async function DELETE(request) {
  await ensureDbInitialized();
  
  const { pathname } = new URL(request.url);
  const path = pathname.replace('/api/', '');

  try {
    const user = authenticate(request);

    // Delete item (any authenticated user for their own items)
    if (path.startsWith('items/')) {
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const itemId = path.split('/')[1];

      const result = await pool.query(
        'DELETE FROM items WHERE id = $1 AND owner_id = $2 RETURNING id',
        [itemId, user.id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ 
          error: 'Item not found or unauthorized' 
        }, { status: 404 });
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Item deleted successfully'
      });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: error.message 
    }, { status: 500 });
  }
}
