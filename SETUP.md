# Backend Setup Guide

## 🚨 IMPORTANT: Environment Configuration

The 401 authentication error you're experiencing is likely due to **missing environment variables**.

## Quick Fix

### Step 1: Create `.env` File

Create a file named `.env` in the `zuperior-back` directory with the following content:

```env
# Server Configuration
PORT=5000

# JWT Secret Key for Authentication
# IMPORTANT: This MUST be set for authentication to work
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345

# Database Configuration
DATABASE_URL="file:./dev.db"

# CORS Origins (comma-separated)
CORS_ORIGIN=http://localhost:3000,http://localhost:5000

# Environment
NODE_ENV=development
```

### Step 2: Restart Backend Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 3: Re-login

1. Clear your browser's localStorage (or use the debug tool)
2. Navigate to `/login`
3. Login with your credentials
4. The 401 error should now be resolved

## Why This Fixes the Issue

### The Problem
- The backend auth middleware requires `JWT_SECRET` to verify tokens
- Without `.env` file, it falls back to a default value: `'fallback-secret-key'`
- If tokens were created with a different secret (or no secret), they will fail verification
- This causes the **401 Unauthorized** error

### The Solution
- Creating `.env` file ensures consistent `JWT_SECRET` across all auth operations
- Both token **creation** (during login) and token **verification** (during API calls) use the same secret
- Restarting backend loads the new environment variables
- Re-logging creates a new token with the correct secret

## Verification

After following the steps above, test authentication:

### Test 1: Check Environment Variables
```javascript
// In backend terminal, run:
node -e "require('dotenv').config(); console.log('JWT_SECRET:', process.env.JWT_SECRET)"
```

You should see your JWT_SECRET value.

### Test 2: Test Login Endpoint
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}'
```

You should get a response with a `token` field.

### Test 3: Test Protected Endpoint
```bash
# Replace YOUR_TOKEN with the token from Test 2
curl http://localhost:5000/api/mt5/user-accounts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

You should get a successful response (not 401).

## Security Best Practices

### For Development
- Use a simple, memorable JWT_SECRET
- Keep the `.env` file out of version control (it's in `.gitignore`)

### For Production
- Generate a strong, random JWT_SECRET:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- Use environment variables or secrets management (AWS Secrets Manager, etc.)
- Never commit `.env` file to version control

## Common Issues

### Issue: Still getting 401 after creating .env
**Solution**: Make sure you **restarted the backend server** after creating `.env`

### Issue: Backend won't start after adding .env
**Solution**: Check for syntax errors in `.env` file (no quotes around multi-word values)

### Issue: Different secret between environments
**Solution**: Copy the same `JWT_SECRET` value to all environments (.env, production, etc.)

## Additional Configuration

### Database URL
If you're using PostgreSQL, MySQL, or another database:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/zuperior_crm"
```

### CORS Configuration
To allow requests from your frontend:
```env
CORS_ORIGIN=http://localhost:3000,https://your-production-domain.com
```

## Need Help?

If you're still experiencing issues after following this guide:

1. Check browser console for detailed error messages
2. Check backend logs for JWT verification errors
3. Use the debug tool: `window.debugAuth()` in browser console
4. Verify the token payload matches the user in database

## Files Modified

- ✅ `src/middleware/auth.middleware.js` - Now uses fallback JWT_SECRET
- ✅ Frontend error handling improved with auto-redirect
- ✅ Debug utilities added for troubleshooting


