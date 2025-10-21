# Manual Deposit Implementation Guide

## Overview
This guide focuses on the manual deposit functionality and how MT5Transaction entries are automatically stored in the database when deposit requests are made.

## Manual Deposit Flow

### 1. User Creates Manual Deposit Request
**Endpoint:** `POST /api/manual-deposit/create`

**Required Fields:**
- `mt5AccountId` - User's MT5 account ID
- `amount` - Deposit amount (must be > 0)

**Optional Fields:**
- `transactionHash` - Transaction hash/reference
- `proofFileUrl` - URL to uploaded proof file

**What Happens:**
1. ✅ **Deposit** record created with:
   - userId, mt5AccountId, amount
   - currency: 'USD'
   - method: 'manual'
   - status: 'pending'
   - depositAddress: 'Twinxa7902309skjhfsdlhflksjdhlkLL'

2. ✅ **Transaction** record created with:
   - userId, type: 'deposit', amount
   - status: 'pending'
   - depositId (linked to Deposit)

3. ✅ **MT5Transaction** record created with:
   - type: 'Deposit'
   - amount, currency: 'USD'
   - status: 'pending'
   - paymentMethod: 'manual'
   - transactionId: transactionHash or deposit.id
   - depositId (linked to Deposit)
   - userId, mt5AccountId

**Response:**
```json
{
  "success": true,
  "message": "Deposit request created successfully",
  "data": {
    "id": "deposit-uuid",
    "userId": "user-uuid",
    "mt5AccountId": "12345678",
    "amount": 1000,
    "currency": "USD",
    "method": "manual",
    "status": "pending",
    ...
  }
}
```

### 2. User Views Their Deposits
**Endpoint:** `GET /api/manual-deposit/user`

**Response:**
```json
{
  "success": true,
  "message": "Deposits retrieved successfully",
  "data": [
    {
      "id": "deposit-uuid",
      "amount": 1000,
      "status": "pending",
      "createdAt": "2025-10-22T...",
      "transactions": [...]
    }
  ]
}
```

### 3. Admin Approves Deposit
**Endpoint:** `PUT /api/manual-deposit/:depositId/status`

**Request Body:**
```json
{
  "status": "approved"
}
```

**What Happens:**
1. ✅ **Deposit** updated:
   - status: 'approved'
   - approvedBy: admin.id
   - approvedAt: current timestamp
   - processedAt: current timestamp

2. ✅ MT5 API called to add funds to user's account

3. ✅ **MT5Transaction** updated:
   - status: 'completed' (if MT5 API succeeds)
   - status: 'failed' (if MT5 API fails)
   - processedBy: admin.id
   - processedAt: current timestamp
   - comment: Updated with result

4. ✅ **Transaction** updated:
   - status: 'completed' or 'failed'

5. ✅ **Activity Log** created to track admin action

### 4. Admin Rejects Deposit
**Endpoint:** `PUT /api/manual-deposit/:depositId/status`

**Request Body:**
```json
{
  "status": "rejected",
  "rejectionReason": "Invalid proof of payment"
}
```

**What Happens:**
1. ✅ **Deposit** updated:
   - status: 'rejected'
   - rejectionReason: provided reason
   - rejectedAt: current timestamp

2. ✅ **MT5Transaction** updated:
   - status: 'rejected'
   - comment: rejection reason
   - processedBy: admin.id
   - processedAt: current timestamp

3. ✅ **Transaction** updated:
   - status: 'rejected'

4. ✅ **Activity Log** created

## Database Tables Involved

### MT5Transaction (Main Focus)
Stores every deposit transaction with complete tracking:

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| type | String | "Deposit" |
| amount | Float | Deposit amount |
| currency | String | "USD" |
| status | String | pending/completed/rejected/failed |
| paymentMethod | String | "manual" |
| transactionId | String | Transaction hash or deposit ID |
| comment | String | Status comments |
| depositId | UUID | Link to Deposit record |
| userId | UUID | User who made deposit |
| mt5AccountId | UUID | MT5 account (internal ID) |
| processedBy | UUID | Admin who processed |
| processedAt | DateTime | When processed |
| createdAt | DateTime | When created |
| updatedAt | DateTime | Last update |

### Deposit
Main deposit record with user and payment details

### Transaction
General transaction record linked to deposits

## API Endpoints Summary

### User Endpoints
- `POST /api/manual-deposit/create` - Create manual deposit request
- `GET /api/manual-deposit/user` - Get user's deposits

### Admin Endpoints
- `GET /api/manual-deposit/all` - Get all deposits (with filters)
- `PUT /api/manual-deposit/:depositId/status` - Approve/Reject deposit

## Status Flow Diagram

```
User Creates Deposit
        ↓
   [PENDING] ← All 3 records created
        ↓
   Admin Reviews
        ↓
    ┌───────┴───────┐
    ↓               ↓
[APPROVED]     [REJECTED]
    ↓               ↓
MT5 API Call    MT5Transaction
    ↓           updated: rejected
 ┌──┴──┐
 ↓     ↓
[COMPLETED] [FAILED]
```

## Example cURL Commands

### Create Manual Deposit
```bash
curl -X POST http://localhost:5000/api/manual-deposit/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mt5AccountId": "12345678",
    "amount": 1000,
    "transactionHash": "0x123abc..."
  }'
```

### Get User Deposits
```bash
curl http://localhost:5000/api/manual-deposit/user \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Approve Deposit (Admin)
```bash
curl -X PUT http://localhost:5000/api/manual-deposit/DEPOSIT_ID/status \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved"
  }'
```

### Reject Deposit (Admin)
```bash
curl -X PUT http://localhost:5000/api/manual-deposit/DEPOSIT_ID/status \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "rejected",
    "rejectionReason": "Invalid proof"
  }'
```

## Console Logs to Watch

When a manual deposit is created, you'll see:
```
🔍 Looking up MT5 account: { mt5AccountId: '12345678', userId: 'user-uuid' }
✅ MT5 account verified: account-internal-id
🔄 Creating deposit record for user: user-uuid
📊 Deposit data: { userId, mt5AccountId, amount, ... }
✅ Deposit request created successfully: deposit-uuid
📋 Created deposit record: { ... }
```

When approved:
```
✅ Deposit approved and MT5 balance updated
```

When rejected:
```
✅ Deposit status updated to: rejected
```

## Next Steps to Test

1. **Stop the backend server** (if running)
2. Run `npx prisma generate` to regenerate Prisma client
3. **Restart the backend server**
4. Create a manual deposit request
5. Check database to see all 3 records created:
   - Deposit table
   - Transaction table
   - MT5Transaction table ← **KEY TABLE**
6. Approve/reject the deposit
7. Verify MT5Transaction updated with processedBy and processedAt

## Key Points

✅ MT5Transaction records are created **immediately** when deposit requested (status: pending)
✅ MT5Transaction records are **updated** when deposit approved/rejected
✅ All deposit tracking is automatic - no manual intervention needed
✅ Complete audit trail with timestamps and admin tracking
✅ Failed MT5 API calls are tracked separately (status: failed)

## Database Queries to Check

### View all MT5Transactions for a user
```sql
SELECT * FROM "MT5Transaction" 
WHERE "userId" = 'user-uuid' 
ORDER BY "createdAt" DESC;
```

### View pending deposits
```sql
SELECT d.*, mt5t.* 
FROM "Deposit" d
LEFT JOIN "MT5Transaction" mt5t ON mt5t."depositId" = d.id
WHERE d."status" = 'pending';
```

### View completed deposits with MT5 transaction
```sql
SELECT 
  d.id, 
  d.amount, 
  d.status AS deposit_status,
  mt5t.status AS mt5_status,
  mt5t."processedBy",
  mt5t."processedAt"
FROM "Deposit" d
LEFT JOIN "MT5Transaction" mt5t ON mt5t."depositId" = d.id
WHERE d."status" = 'approved';
```

## Notes

- Crypto currency deposits are **ignored** (as requested)
- Focus is on **manual deposits only**
- KYC status checks are **ignored** (as requested)
- All deposit entries are stored in MT5Transaction table automatically

