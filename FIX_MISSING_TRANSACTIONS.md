# Fix: No MT5Transaction Records Being Created

## Problem
Manual deposits are being created but **no MT5Transaction records** appear in the database.

## Root Cause
The Prisma client hasn't been regenerated with the new MT5Transaction columns. Your backend server is using the **old Prisma client** that doesn't know about:
- `currency`
- `depositId`
- `userId`
- `processedBy`
- `processedAt`
- `updatedAt`

## Solution (Follow These Steps Exactly)

### Step 1: Stop Your Backend Server ⚠️
**This is critical!** The Prisma client cannot be regenerated while the server is running.

Find your backend server terminal and:
- Press `Ctrl + C` to stop the server
- Wait for it to fully shut down

### Step 2: Regenerate Prisma Client

In the `zuperior-back` directory, run:

```bash
npx prisma generate
```

You should see output like:
```
✔ Generated Prisma Client (x.x.x) to .\node_modules\@prisma\client in xxx ms
```

**If this fails with "EPERM: operation not permitted":**
- Your server is still running - go back to Step 1
- OR another process is using the files - restart your computer

### Step 3: Verify Schema is Correct

Check your `schema.prisma` file has this MT5Transaction model:

```prisma
model MT5Transaction {
  id                    String      @id @default(uuid())
  type                  String
  amount                Float
  currency              String      @default("USD")        // ← Must have this
  status                String      @default("pending")
  paymentMethod         String?
  transactionId         String?
  comment               String?
  depositId             String?                            // ← Must have this
  withdrawalId          String?                            // ← Must have this
  userId                String?                            // ← Must have this
  processedBy           String?                            // ← Must have this
  processedAt           DateTime?                          // ← Must have this
  mt5Account            MT5Account  @relation(fields: [mt5AccountId], references: [id])
  mt5AccountId          String
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt             // ← Must have this

  @@index([mt5AccountId])
  @@index([userId])
  @@index([depositId])
  @@index([withdrawalId])
  @@index([status])
  @@index([type])
}
```

### Step 4: Restart Backend Server

```bash
npm start
# or
npm run dev
```

### Step 5: Test Manual Deposit

Create a new manual deposit and check the console logs for:

```
✅ Deposit request created successfully: <deposit-id>
```

**If you see an error** instead, it means the Prisma client still doesn't have the new columns.

### Step 6: Verify in Database

Run this query in your database:

```sql
SELECT * FROM "MT5Transaction" 
WHERE type = 'Deposit' 
ORDER BY "createdAt" DESC 
LIMIT 5;
```

You should see new records with:
- `currency` = 'USD'
- `depositId` = (uuid)
- `userId` = (uuid)
- `status` = 'pending'

## Alternative: Run the Regeneration Script

I've created a helper script. Double-click:
```
zuperior-back/regenerate-client.bat
```

This will:
1. Remind you to stop the server
2. Delete old Prisma client
3. Generate new Prisma client

## Troubleshooting

### Error: "EPERM: operation not permitted"
**Solution:** Backend server is still running. Stop it completely.

### Error: Column "depositId" does not exist
**Solution:** 
1. Check migrations applied: `npx prisma migrate status`
2. If not all applied: `npx prisma migrate deploy`
3. Then regenerate client: `npx prisma generate`

### No errors but still no MT5Transaction records
**Check:**
1. Is the manual deposit endpoint being called? Check console logs.
2. Are there ANY errors in the backend logs?
3. Try creating deposit again after regenerating client.

### How to verify Prisma client has new columns

After regenerating, check this file exists with new fields:
```
node_modules/.prisma/client/index.d.ts
```

Search for "MT5Transaction" and verify it has `depositId`, `userId`, etc.

## Quick Test Commands

### 1. Stop server (if running)
`Ctrl + C` in server terminal

### 2. Clean and regenerate
```bash
cd zuperior-back
npx prisma generate
```

### 3. Restart server
```bash
npm start
```

### 4. Create deposit (from frontend or curl)
```bash
curl -X POST http://localhost:5000/api/manual-deposit/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mt5AccountId": "12345678", "amount": 100}'
```

### 5. Check database
```sql
SELECT COUNT(*) FROM "MT5Transaction";
```

Should increase by 1 after each deposit.

## Expected Behavior After Fix

✅ Create manual deposit → See console log: "✅ Deposit request created successfully"
✅ Check database → New record in MT5Transaction table
✅ Record has: depositId, userId, currency, status='pending'
✅ Approve deposit → MT5Transaction status changes to 'completed'

## Files to Check

- ✅ `schema.prisma` - Has MT5Transaction with all columns
- ✅ `manualDeposit.controller.js` - Has MT5Transaction.create code (line 121)
- ✅ Database migrations - All applied
- ❌ Prisma client - **NEEDS REGENERATION**

## Still Having Issues?

Check backend console logs for errors when creating deposit. The error message will tell you exactly which column is missing.

Common errors:
- "Unknown arg `depositId`" → Prisma client not regenerated
- "Unknown arg `currency`" → Prisma client not regenerated
- "Column 'depositId' does not exist" → Migration not applied

---

**TL;DR: Stop server → Run `npx prisma generate` → Restart server → Test deposit**

