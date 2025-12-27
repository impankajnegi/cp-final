# Chaarpaisa - Multi-Role Marketplace Platform

A full-stack marketplace application built with Next.js, PostgreSQL, and modern web technologies. Chaarpaisa enables users to list, browse, rent items, and facilitates seller-owner negotiations.

## Features

### Multi-Role System
- **Renter**: Browse items, rent items, list their own items for others to rent
- **Seller**: Verified businesses that help sell/rent items, negotiate offers
- **Admin**: Manage users, approve sellers, monitor transactions

### Core Functionality
- JWT-based authentication with role-based access control
- Item listing with image upload and detailed information
- Offer negotiation system (send, counter, accept, reject)
- Barcode generation for locked deals
- Masked phone numbers for privacy (revealed after deal acceptance)
- OTP verification system (static for development)
- SEO-optimized item pages with dynamic meta tags
- Responsive design with mobile-friendly UI

## Tech Stack

### Frontend
- Next.js 14 (React 18)
- Tailwind CSS
- shadcn/ui components
- Lucide React icons

### Backend
- Next.js API Routes
- PostgreSQL 15
- JWT authentication
- bcrypt password hashing

### Libraries
- pg (PostgreSQL client)
- jsonwebtoken
- bcryptjs
- bwip-js (barcode generation)
- razorpay (payment integration)

## Installation

### Prerequisites
- Node.js 18+ and yarn
- PostgreSQL 15+

### Setup

1. **Install dependencies**
```bash
cd /app
yarn install
```

2. **Configure environment variables**

The `.env` file is already configured with:
- PostgreSQL connection
- JWT secret
- Development OTP (123456)
- Razorpay placeholder keys
- Twilio placeholder keys

3. **Start PostgreSQL**
```bash
sudo service postgresql start
```

4. **Start the application**

The application runs via supervisor:
```bash
sudo supervisorctl restart nextjs
```

Or manually for development:
```bash
cd /app
yarn dev
```

5. **Access the application**
- Frontend: http://localhost:3000
- API: http://localhost:3000/api

## Database Schema

The database is automatically initialized on first API call. Tables include:

- **users**: User accounts with roles
- **seller_profiles**: Seller store information
- **items**: Listed items with details and images
- **offers**: Negotiation offers between sellers and owners
- **messages**: Offer-related messages
- **rentals**: Rental transactions and payments

## API Endpoints

### Authentication
- `POST /api/signup` - Create new user account
- `POST /api/login` - Login and get JWT token
- `POST /api/seller/register` - Register as seller (with files)

### Items
- `GET /api/items` - List all items (with filters)
- `GET /api/items/:id` - Get single item details
- `POST /api/items` - Create new item (owner only)
- `PUT /api/items/:id` - Update item (owner only)
- `DELETE /api/items/:id` - Delete item (owner only)
- `GET /api/my-items` - Get owner's items

### Offers
- `POST /api/offers` - Create offer (seller only)
- `GET /api/offers/:id` - Get offer details
- `GET /api/my-offers` - Get seller's offers
- `GET /api/items/:id/offers` - Get offers for item
- `POST /api/offers/:id/counter` - Counter offer (owner)
- `POST /api/offers/:id/accept` - Accept offer (owner)
- `POST /api/offers/:id/lock` - Lock deal and generate barcode (seller)

### Admin
- `GET /api/admin/users` - List all users
- `GET /api/admin/sellers/pending` - Pending seller approvals
- `POST /api/admin/sellers/:id/approve` - Approve seller

### Other
- `GET /api/profile` - Get user profile
- `GET /api/revenue` - Get owner revenue stats
- `POST /api/send-otp` - Send OTP
- `POST /api/verify-otp` - Verify OTP

## User Flows

### Renter Flow
1. Sign up with role "renter" (default)
2. Browse available items or list your own items
3. Search and filter by category, price, location
4. View item details
5. List your own items for rent
6. Manage offers from sellers

### Renter Flow
1. Sign up (default role is renter)
2. Browse and search items
3. List your own items with rental pricing options
4. Receive and manage offers from sellers
5. Accept/counter offers

### Seller Flow
1. Sign up with any role
2. Register as seller with store details
3. Wait for admin approval
4. Browse available items
5. Send offers to owners
6. Negotiate via counter offers
7. Lock accepted deals and generate barcode

### Admin Flow
1. Login with admin role
2. Review pending seller registrations
3. Approve/manage sellers
4. Monitor all users and transactions

## Development Notes

### OTP System
- Development mode uses static OTP: **123456**
- Set `NODE_ENV=development` for static OTP
- Twilio integration ready for production

### Phone Number Masking
- Public views show masked numbers (98******10)
- Full numbers revealed after offer acceptance

### File Uploads
- Images stored in `/public/uploads/items/`
- Store images/videos in `/public/uploads/stores/`
- Accessible via direct URL paths

### Barcode Generation
- Uses Code128 format
- Generated automatically on deal lock
- Format: `CHAARPAISA-{item_id}-{offer_id}`

## Testing

### Create Test Users

**Admin User**
```bash
curl -X POST http://localhost:3000/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@chaarpaisa.com",
    "password": "admin123",
    "role": "admin",
    "phone_number": "9876543210"
  }'
```

**Renter**
```bash
curl -X POST http://localhost:3000/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Renter",
    "email": "renter@test.com",
    "password": "password123",
    "role": "renter",
    "phone_number": "9876543212"
  }'
```

**Seller** (register after signup)
```bash
# First signup, then register as seller via API with token
```

## Razorpay Integration

To enable payments:
1. Get Razorpay API keys from https://razorpay.com
2. Update `.env` with your keys:
   ```
   RAZORPAY_KEY_ID=your_key_id
   RAZORPAY_KEY_SECRET=your_key_secret
   ```
3. Payment flow is ready for implementation in rental process

## Production Deployment

### Environment Variables
Update the following for production:
- `JWT_SECRET` - Use a strong secret key
- `DATABASE_URL` - Production PostgreSQL URL
- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- `NODE_ENV=production`

### Database
- Database schema auto-initializes
- Run migrations for schema updates
- Regular backups recommended

### File Storage
- Consider cloud storage (S3, Cloudinary) for production
- Update upload.js for cloud integration

## Project Structure

```
/app
├── app/
│   ├── api/[[...path]]/route.js    # API routes
│   ├── page.js                      # Home page
│   ├── login/page.js                # Login page
│   ├── signup/page.js               # Signup page
│   ├── items/[id]/page.js           # Item detail page
│   ├── owner/
│   │   ├── dashboard/page.js        # Owner dashboard
│   │   └── add-item/page.js         # Add item form
│   ├── seller/
│   │   ├── register/page.js         # Seller registration
│   │   └── dashboard/page.js        # Seller dashboard
│   └── admin/
│       └── dashboard/page.js        # Admin panel
├── components/ui/                   # shadcn components
├── lib/
│   ├── db.js                        # PostgreSQL connection
│   ├── auth.js                      # Auth utilities
│   ├── barcode.js                   # Barcode generation
│   └── upload.js                    # File upload handler
├── public/uploads/                  # Uploaded files
├── .env                             # Environment variables
└── package.json
```

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL status
sudo service postgresql status

# Restart PostgreSQL
sudo service postgresql restart

# Check database exists
sudo -u postgres psql -c "\l"
```

### Next.js Issues
```bash
# Clear cache and restart
rm -rf .next
sudo supervisorctl restart nextjs

# Check logs
tail -f /var/log/supervisor/nextjs.out.log
```

## Future Enhancements

- Real-time messaging (WebSocket)
- Email notifications
- Advanced search with Elasticsearch
- Rating and review system
- Payment history and invoicing
- Mobile app (React Native)
- Analytics dashboard
- Multi-language support

## License

MIT

## Support

For issues or questions, please create an issue in the repository.
