# KYC Module Implementation Guide

## Overview

This guide covers the complete KYC (Know Your Customer) verification system integrated with Shufti Pro API. The implementation includes:

- ✅ Document/Identity Verification
- ✅ Address Verification  
- ✅ AML (Anti-Money Laundering) Background Checks
- ✅ Webhook Processing for Automatic Status Updates
- ✅ Admin Dashboard for Manual Review
- ✅ Database Persistence
- ✅ Status Guards (Prevent Re-submission when Verified)
- ✅ Test Mode for Development

---

## Environment Configuration

### Backend (.env file)

Create or update `zuperior-back/.env` with the following:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345

# Database
DATABASE_URL="file:./dev.db"

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:5000

# KYC Verification - Shufti Pro Configuration
SHUFTI_PRO_CLIENT_ID=e5dcae22318477c3bfd1fb2d4da1194ef81cf59805fcf5fd329f3a3fce77c630
SHUFTI_PRO_SECRET_KEY=NCHAh7PE7HqlqSI9LvZ0sGMZ6pLL6Tbs
SHUFTI_PRO_CALLBACK_URL=http://localhost:3000/api/kyc/callback
SHUFTI_PRO_AML_CALLBACK_URL=http://localhost:3000/api/kyc/callback
```

### Frontend (.env.local file)

Create `zuperior-front/.env.local` with:

```env
# Shufti Pro Credentials
SHUFTI_PRO_CLIENT_ID=e5dcae22318477c3bfd1fb2d4da1194ef81cf59805fcf5fd329f3a3fce77c630
SHUFTI_PRO_SECRET_KEY=NCHAh7PE7HqlqSI9LvZ0sGMZ6pLL6Tbs
SHUFTI_PRO_CALLBACK_URL=http://localhost:3000/api/kyc/callback
SHUFTI_PRO_AML_CALLBACK_URL=http://localhost:3000/api/kyc/callback

# Backend API URL
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:5000/api

# Test Mode (set to true for development without calling Shufti Pro)
NEXT_PUBLIC_KYC_TEST_MODE=true

# Node Environment
NODE_ENV=development
```

---

## Database Setup

The KYC table already exists in your Prisma schema. Ensure your database is migrated:

```bash
cd zuperior-back
npx prisma migrate dev
npx prisma generate
```

---

## How It Works

### 1. User KYC Flow

#### Step 1: Identity/Document Verification

1. User navigates to `/kyc/identity-proof`
2. User fills in personal information
3. User uploads government-issued ID (Passport, ID Card, or Driving License)
4. Frontend sends document to `/api/kyc/document` which forwards to Shufti Pro
5. Shufti Pro processes verification and sends callback to `/api/kyc/callback`
6. Backend updates database with verification result
7. User sees success or failure message

#### Step 2: Address Verification

1. User navigates to `/kyc/address-proof`
2. User fills in address details
3. User uploads proof of address (Utility Bill, Bank Statement, or Rent Agreement)
4. Frontend sends document to `/api/kyc/address` which forwards to Shufti Pro
5. Shufti Pro processes verification and sends callback to `/api/kyc/callback`
6. Backend updates database with verification result
7. If both document and address are verified, status becomes "Verified"

### 2. AML Background Check

The AML (Anti-Money Laundering) check is performed automatically after document verification succeeds:

1. System extracts full name and date of birth from verified document
2. Sends AML screening request to Shufti Pro
3. Shufti Pro checks against sanctions lists, PEP (Politically Exposed Persons), and other databases
4. Result is stored in database

### 3. Status Management

**KYC statuses tracked in database:**

- `Pending` - Initial state, no verification done
- `Partially Verified` - Either document OR address verified (not both)
- `Verified` - Both document AND address verified successfully
- `Declined` - Verification failed or rejected
- `Cancelled` - Request timeout or invalid

**Status Guards:**

- Users with verified documents cannot re-submit identity verification
- Users with verified addresses cannot re-submit address verification
- Users must verify identity before verifying address
- Profile settings page shows real-time status from database

### 4. Admin Management

Admins can review and manage KYC requests:

1. Navigate to `/admin/kyc`
2. View all KYC requests with filtering and pagination
3. Click "View" to see detailed information
4. Approve or reject requests manually
5. Provide rejection reason when declining
6. All actions are logged in activity logs

---

## API Endpoints

### User Endpoints (Protected)

- `POST /api/kyc/create` - Create initial KYC record
- `PUT /api/kyc/update-document` - Update document verification status
- `PUT /api/kyc/update-address` - Update address verification status  
- `GET /api/kyc/status` - Get user's KYC status
- `POST /api/kyc/callback` - Webhook endpoint for Shufti Pro callbacks (no auth)

### Admin Endpoints (Admin Only)

- `GET /api/admin/kyc` - Get all KYC requests (with filtering)
- `GET /api/admin/kyc/:id` - Get single KYC request
- `PUT /api/admin/kyc/:id/status` - Update KYC status manually
- `PUT /api/admin/kyc/:id/approve` - Approve KYC request
- `PUT /api/admin/kyc/:id/reject` - Reject KYC request
- `GET /api/admin/kyc/:id/document-url` - Get document viewer URL
- `GET /api/admin/kyc/stats` - Get KYC statistics

### Frontend API Routes

- `POST /api/kyc/document/route.ts` - Document verification (calls Shufti Pro)
- `POST /api/kyc/address/route.ts` - Address verification (calls Shufti Pro)
- `POST /api/kyc/aml/route.ts` - AML screening (calls Shufti Pro)
- `POST /api/kyc/create-record/route.ts` - Create KYC record (proxies to backend)
- `PUT /api/kyc/update-document/route.ts` - Update document status (proxies to backend)
- `PUT /api/kyc/update-address/route.ts` - Update address status (proxies to backend)
- `GET /api/kyc/status/route.ts` - Get KYC status (proxies to backend)
- `POST /api/kyc/callback/route.ts` - Webhook callback handler (proxies to backend)

---

## Testing

### Test Mode

Set `NEXT_PUBLIC_KYC_TEST_MODE=true` in frontend `.env.local` to simulate successful verification without calling Shufti Pro API. This is useful for:

- Development without API credits
- UI testing
- Integration testing without external dependencies

### Production Testing with Shufti Pro

1. Set `NEXT_PUBLIC_KYC_TEST_MODE=false`
2. Ensure Shufti Pro credentials are correct
3. Configure webhook callback URL (use ngrok for local testing)

#### Using ngrok for Webhooks (Local Testing)

```bash
# Install ngrok
npm install -g ngrok

# Start ngrok tunnel
ngrok http 3000

# Copy the ngrok URL (e.g., https://abc123.ngrok.io)
# Update .env files:
SHUFTI_PRO_CALLBACK_URL=https://abc123.ngrok.io/api/kyc/callback
SHUFTI_PRO_AML_CALLBACK_URL=https://abc123.ngrok.io/api/kyc/callback
```

---

## Features Implemented

### ✅ KYC Status Management

- Real-time status loading from database on app initialization
- Redux store synced with database
- Status displayed in profile settings
- Verification status determines deposit limits

### ✅ Verification Guards

- Prevents re-submission of already verified documents
- Requires identity verification before address verification
- Clear error messages when trying to access locked pages

### ✅ Shufti Pro Integration

- Document/Identity verification with OCR
- Address verification
- AML/Background checks
- Webhook callback processing
- Automatic status updates

### ✅ Admin Dashboard

- View all KYC requests
- Filter by status (Pending, Verified, Declined, etc.)
- Search by user name, email, or client ID
- Pagination support
- Approve/Reject with reasons
- View detailed information
- Real-time statistics

### ✅ Database Persistence

- All verification data stored in PostgreSQL
- References stored for audit trail
- Timestamps for submissions
- Rejection reasons tracked
- Activity logging for admin actions

---

## File Structure

### Backend

```
zuperior-back/
├── src/
│   ├── controllers/
│   │   ├── kyc.controller.js          # User KYC endpoints
│   │   └── adminKyc.controller.js     # Admin KYC management
│   ├── services/
│   │   ├── db.service.js              # Database connection
│   │   └── shufti.service.js          # 🆕 Shufti Pro API integration
│   ├── routes/
│   │   ├── kyc.routes.js              # KYC routes
│   │   └── admin.routes.js            # Admin routes
│   └── middleware/
│       └── auth.middleware.js         # Authentication & authorization
├── prisma/
│   └── schema.prisma                  # Database schema with KYC model
├── .env                                # 🆕 Environment variables
└── env.template                        # ✏️ Updated template

```

### Frontend

```
zuperior-front/
├── src/
│   ├── app/
│   │   ├── (protected)/
│   │   │   ├── layout.tsx                                # ✏️ Added KYC status loading
│   │   │   ├── kyc/
│   │   │   │   ├── identity-proof/page.tsx               # ✏️ Added verification guard
│   │   │   │   └── address-proof/page.tsx                # ✏️ Added verification guards
│   │   │   └── settings/page.tsx                         # Shows real KYC status
│   │   ├── admin/
│   │   │   └── kyc/page.tsx                              # ✏️ Complete admin dashboard
│   │   └── api/
│   │       ├── kyc/
│   │       │   ├── document/route.ts                     # ✏️ Enhanced Shufti Pro integration
│   │       │   ├── address/route.ts                      # ✏️ Enhanced Shufti Pro integration
│   │       │   ├── aml/route.ts                          # AML verification
│   │       │   ├── create-record/route.ts                # Create KYC record
│   │       │   ├── update-document/route.ts              # Update document status
│   │       │   ├── update-address/route.ts               # Update address status
│   │       │   ├── status/route.ts                       # Get KYC status
│   │       │   └── callback/route.ts                     # Webhook handler
│   │       └── admin/
│   │           └── kyc/
│   │               ├── route.ts                          # 🆕 Get all KYC requests
│   │               └── [id]/
│   │                   ├── route.ts                      # 🆕 Get/Update single KYC
│   │                   ├── approve/route.ts              # 🆕 Approve KYC
│   │                   └── reject/route.ts               # 🆕 Reject KYC
│   ├── services/
│   │   ├── kycService.ts                                 # User KYC operations
│   │   ├── documentVerification.ts                       # ✏️ Document verification
│   │   ├── addressVerification.ts                        # ✏️ Address verification
│   │   ├── amlVerification.ts                            # AML verification
│   │   └── adminKycService.ts                            # 🆕 Admin KYC operations
│   ├── store/
│   │   └── slices/
│   │       └── kycSlice.ts                               # ✏️ Added async status loading
│   └── components/
│       ├── admin/...                                     # Admin components
│       └── ui/...                                        # UI components
└── .env.local                                            # 🆕 Environment variables
```

**Legend:**
- 🆕 = New file created
- ✏️ = Existing file modified

---

## Production Deployment

### 1. Update Callback URLs

Replace `http://localhost:3000` with your production domain:

```env
SHUFTI_PRO_CALLBACK_URL=https://yourdomain.com/api/kyc/callback
SHUFTI_PRO_AML_CALLBACK_URL=https://yourdomain.com/api/kyc/callback
```

### 2. Disable Test Mode

```env
NEXT_PUBLIC_KYC_TEST_MODE=false
```

### 3. Secure Environment Variables

- Never commit `.env` or `.env.local` files
- Use environment variable management in your hosting platform
- Rotate secrets regularly
- Use different credentials for staging and production

### 4. Configure Webhook URL in Shufti Pro Dashboard

1. Log into Shufti Pro dashboard
2. Navigate to Settings > Webhooks
3. Add your production callback URL
4. Save and test the webhook

---

## Troubleshooting

### Issue: Webhooks not received

**Solutions:**
- Check that callback URL is publicly accessible
- Use ngrok for local testing
- Verify webhook configuration in Shufti Pro dashboard
- Check server logs for incoming webhook requests

### Issue: "Shufti Pro credentials not configured"

**Solutions:**
- Verify `.env` files exist and contain correct credentials
- Restart backend and frontend servers after changing `.env`
- Check that environment variables are loaded (console.log them)

### Issue: KYC status not updating

**Solutions:**
- Check webhook is being received (check backend logs)
- Verify database connection is working
- Check that reference IDs match between submission and callback
- Review callback payload structure

### Issue: Users can access KYC pages when already verified

**Solutions:**
- Ensure KYC status is loaded on app initialization
- Check Redux store has correct status
- Clear browser cache and local storage
- Verify `fetchKycStatus` is called in protected layout

---

## Security Considerations

1. **Authentication**: All KYC endpoints require valid JWT token
2. **Authorization**: Admin endpoints check for admin role
3. **Webhook Security**: Consider adding signature verification for Shufti Pro webhooks
4. **Data Privacy**: Store only necessary KYC data, comply with GDPR/privacy laws
5. **Rate Limiting**: Implement rate limiting on KYC submission endpoints
6. **Input Validation**: Validate all inputs before processing
7. **Error Handling**: Don't expose sensitive error details to users

---

## Support

For questions or issues:

1. Check Shufti Pro documentation: https://docs.shuftipro.com/
2. Review implementation logs in backend console
3. Check frontend browser console for errors
4. Verify environment variables are set correctly

---

## Changelog

### Version 1.0.0 (Current)

- ✅ Complete Shufti Pro integration
- ✅ Document and Address verification
- ✅ AML background checks
- ✅ Webhook processing
- ✅ Admin dashboard with approval/rejection
- ✅ Status guards to prevent re-submission
- ✅ Real-time status from database
- ✅ Test mode for development
- ✅ Profile settings integration
- ✅ Activity logging for admin actions

---

## Next Steps / Future Enhancements

- [ ] Email notifications for KYC status changes
- [ ] Document viewer integration to see submitted documents
- [ ] Face verification/liveness check
- [ ] SMS notifications
- [ ] Multi-language support
- [ ] Enhanced analytics and reporting
- [ ] Automated compliance checks
- [ ] Document expiry tracking
- [ ] Re-verification workflows

---

**Implementation completed successfully! ✅**

The KYC module is now fully operational with Shufti Pro integration, database persistence, admin management, and status guards.

