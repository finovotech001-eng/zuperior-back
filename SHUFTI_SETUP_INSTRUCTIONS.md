# Shufti Pro KYC Integration Setup Instructions

## Environment Variables Setup

### Backend (.env file in `zuperior-back/`)

Add the following to your `.env` file:

```env
# Shufti Pro KYC Configuration
SHUFTI_PRO_CLIENT_ID=e5dcae22318477c3bfd1fb2d4da1194ef81cf59805fcf5fd329f3a3fce77c630
SHUFTI_PRO_SECRET_KEY=NCHAh7PE7HqlqSI9LvZ0sGMZ6pLL6Tbs
SHUFTI_PRO_CALLBACK_URL=http://localhost:3000/api/kyc/callback
SHUFTI_PRO_AML_CALLBACK_URL=http://localhost:3000/api/kyc/callback
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:5000/api
```

### Frontend (.env.local file in `zuperior-front/`)

Create or update your `.env.local` file:

```env
# Backend API URL
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:5000/api

# Shufti Pro KYC Configuration
SHUFTI_PRO_CLIENT_ID=e5dcae22318477c3bfd1fb2d4da1194ef81cf59805fcf5fd329f3a3fce77c630
SHUFTI_PRO_SECRET_KEY=NCHAh7PE7HqlqSI9LvZ0sGMZ6pLL6Tbs
SHUFTI_PRO_CALLBACK_URL=http://localhost:3000/api/kyc/callback
SHUFTI_PRO_AML_CALLBACK_URL=http://localhost:3000/api/kyc/callback

# Set to 'false' to use real Shufti Pro API
# Set to 'true' for testing without making real API calls
NEXT_PUBLIC_KYC_TEST_MODE=false
```

## Production Deployment

For production, update the callback URLs to your production domain:

```env
SHUFTI_PRO_CALLBACK_URL=https://yourdomain.com/api/kyc/callback
SHUFTI_PRO_AML_CALLBACK_URL=https://yourdomain.com/api/kyc/callback
NEXT_PUBLIC_KYC_TEST_MODE=false
```

## Shufti Pro Webhook Configuration

In your Shufti Pro dashboard, configure the webhook URL to:
- Development: `http://localhost:3000/api/kyc/callback`
- Production: `https://yourdomain.com/api/kyc/callback`

## Testing

1. Set `NEXT_PUBLIC_KYC_TEST_MODE=true` for local testing without API calls
2. Set `NEXT_PUBLIC_KYC_TEST_MODE=false` to test with real Shufti Pro API
3. Monitor the console logs for detailed verification flow

## Basic Auth Header

The system automatically creates the Basic Auth header using:
```
Authorization: Basic base64(CLIENT_ID:SECRET_KEY)
```

Your credentials:
- Client ID: `e5dcae22318477c3bfd1fb2d4da1194ef81cf59805fcf5fd329f3a3fce77c630`
- Secret Key: `NCHAh7PE7HqlqSI9LvZ0sGMZ6pLL6Tbs`

