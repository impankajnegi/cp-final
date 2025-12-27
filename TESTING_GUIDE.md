# Chaarpaisa Testing Guide

## Quick Start

### 1. Access the Application
Open your browser and navigate to: `http://localhost:3000`

### 2. Test Accounts

The database has been seeded with test accounts:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Admin | admin@chaarpaisa.com | admin123 | Full system access |
| Owner | owner@test.com | password123 | Can list items, manage offers |
| Renter | renter@test.com | password123 | Can browse and rent items |
| Seller | seller@test.com | password123 | Can make offers, lock deals |

**Development OTP:** `123456` (for any OTP verification)

---

## Testing Flows

### A. Owner Flow

1. **Login as Owner**
   - Go to `/login`
   - Email: `owner@test.com`
   - Password: `password123`

2. **View Dashboard**
   - After login, click on "My Items" tab
   - Or navigate to `/owner/dashboard`
   - You should see 4 pre-seeded items

3. **Add New Item**
   - Click "Add Item" button
   - Fill in the form:
     - Name: "Laptop"
     - Category: "Electronics"
     - Description: "Dell XPS 15"
     - Expected Price: "45000"
     - Condition: "good"
     - Location: "Mumbai"
   - Optionally upload images
   - Click "Add Item"

4. **View Offers** (if any)
   - Go to an item page
   - Click "View Offers" to see seller offers
   - Accept or Counter offers

5. **Revenue Stats**
   - Check dashboard for revenue statistics
   - View total items, listed items, and revenue

---

### B. Renter Flow

1. **Login as Renter**
   - Email: `renter@test.com`
   - Password: `password123`

2. **Browse Items**
   - Home page shows all available items
   - Use search bar to find items
   - Filter by category (Electronics, Furniture, Tools, etc.)

3. **View Item Details**
   - Click on any item card
   - See full details, images, owner info
   - Phone number is masked for privacy

4. **Request Rental**
   - Click "Request to Rent" (UI ready)
   - Payment integration with Razorpay is prepared

---

### C. Seller Flow

1. **Login as Seller**
   - Email: `seller@test.com`
   - Password: `password123`
   - Automatically redirects to seller dashboard

2. **Browse Available Items**
   - Left panel shows all listed items
   - Search for specific items
   - View item details

3. **Make an Offer**
   - Click "Make Offer" on any item
   - Enter your offer price
   - Add optional message
   - Submit offer

4. **Track Offers**
   - Right panel shows "My Offers"
   - See offer status: pending, countered, accepted, locked
   - View owner's counter offers

5. **Lock Deal & Generate Barcode**
   - When offer is accepted by owner
   - Click "Lock Deal & Generate Barcode"
   - Barcode is generated automatically
   - Save/print barcode for verification

---

### D. Admin Flow

1. **Login as Admin**
   - Email: `admin@chaarpaisa.com`
   - Password: `admin123`

2. **Manage Users**
   - View all registered users
   - See user roles and join dates

3. **Approve Sellers**
   - View pending seller registrations
   - Review store details, categories
   - Click "Approve" to activate seller

---

### E. New User Registration

1. **Sign Up**
   - Go to `/signup`
   - Fill in details:
     - Full Name
     - Email
     - Phone Number
     - Role: Owner or Renter
     - Password
   - Click "Create Account"

2. **Seller Registration**
   - After signup, go to `/seller/register`
   - Or click "Become a Seller" from login page
   - Fill seller form:
     - Store Name
     - Description
     - Location
     - Categories (select multiple)
     - Upload store image (optional)
     - Upload store video (optional)
   - Submit for admin approval

---

## API Testing

### Authentication

**Signup:**
```bash
curl -X POST http://localhost:3000/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "renter",
    "phone_number": "9876543214"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@test.com",
    "password": "password123"
  }'
```

### Items

**Get All Items:**
```bash
curl http://localhost:3000/api/items
```

**Get Single Item:**
```bash
curl http://localhost:3000/api/items/{ITEM_ID}
```

**Get My Items (Owner):**
```bash
curl http://localhost:3000/api/my-items \
  -H "Authorization: Bearer {TOKEN}"
```

### Offers

**Create Offer (Seller):**
```bash
curl -X POST http://localhost:3000/api/offers \
  -H "Authorization: Bearer {SELLER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "item_id": "{ITEM_ID}",
    "offer_price": 45000,
    "message": "Interested"
  }'
```

**Accept Offer (Owner):**
```bash
curl -X POST http://localhost:3000/api/offers/{OFFER_ID}/accept \
  -H "Authorization: Bearer {OWNER_TOKEN}"
```

**Lock Deal (Seller):**
```bash
curl -X POST http://localhost:3000/api/offers/{OFFER_ID}/lock \
  -H "Authorization: Bearer {SELLER_TOKEN}"
```

---

## Feature Checklist

### Authentication & Authorization ✅
- [x] User signup with role selection
- [x] JWT-based login
- [x] Role-based access control
- [x] Password hashing with bcrypt

### Owner Features ✅
- [x] Add items with images
- [x] Edit item details
- [x] Delete items
- [x] View all items
- [x] View revenue statistics
- [x] Receive and manage offers
- [x] Counter offers
- [x] Accept offers

### Renter Features ✅
- [x] Browse all items
- [x] Search items by name/description
- [x] Filter by category
- [x] Filter by price range
- [x] View item details
- [x] See masked phone numbers
- [x] Request rentals (UI ready)

### Seller Features ✅
- [x] Register as seller with verification
- [x] Browse available items
- [x] Search items
- [x] Send offers to owners
- [x] Track offer status
- [x] View counter offers
- [x] Lock accepted deals
- [x] Generate barcode on deal lock

### Admin Features ✅
- [x] View all users
- [x] Manage user roles
- [x] Review pending sellers
- [x] Approve/reject sellers
- [x] Monitor transactions

### Additional Features ✅
- [x] Phone number masking
- [x] Static OTP for development
- [x] Barcode generation (Code128)
- [x] File upload (images/videos)
- [x] Responsive design
- [x] SEO-optimized meta tags

---

## Known Limitations (MVP)

1. **Payment Integration**: Razorpay keys need to be added for live payments
2. **Real OTP**: Currently using static OTP (123456) for development
3. **Image Storage**: Local storage (consider cloud for production)
4. **Real-time Notifications**: Polling-based (WebSocket not implemented)
5. **Email Notifications**: Not implemented yet

---

## Troubleshooting

### Database Issues
```bash
# Check PostgreSQL
sudo service postgresql status

# Restart if needed
sudo service postgresql restart

# Re-seed database
yarn seed
```

### Application Not Starting
```bash
# Check logs
tail -f /var/log/supervisor/nextjs.out.log

# Restart application
sudo supervisorctl restart nextjs
```

### Clear Cache
```bash
rm -rf .next
yarn dev
```

---

## Next Steps

1. **Add Razorpay Keys**
   - Get keys from https://razorpay.com
   - Update `.env` file
   - Test payment flow

2. **Add Twilio Keys**
   - Get credentials from https://twilio.com
   - Update `.env` file
   - Set `NODE_ENV=production` to enable real OTP

3. **Deploy to Production**
   - Set up production database
   - Configure environment variables
   - Set up file storage (S3/Cloudinary)

4. **Enhanced Features**
   - Real-time messaging
   - Email notifications
   - Rating system
   - Advanced analytics

---

## Support

For issues or questions:
- Check README.md for detailed documentation
- Review API endpoints in `/app/app/api/[[...path]]/route.js`
- Check database schema in `/app/lib/db.js`
