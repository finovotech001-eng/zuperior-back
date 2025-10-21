# Start Backend Server - Quick Instructions

## Your Frontend is Already Running ✅

I can see your frontend is running on http://localhost:3000

## Now Start the Backend

### Open a NEW Terminal/Command Prompt

**Important:** Don't close your frontend terminal! Open a NEW one.

### Navigate to Backend Directory

```bash
cd "D:\CRM Dashboard\zuperior-back"
```

### Start Backend Server

```bash
npm start
```

**OR** double-click this file in Windows Explorer:
```
START_BACKEND_WITH_LOGS.bat
```

## What You'll See

When the backend starts, you should see:
```
✅ Database connected successfully
✅ Server running on port 5000
✅ Routes loaded successfully
```

## Test Manual Deposit

1. Go to http://localhost:3000/deposit (you're already there!)
2. Fill in the deposit form:
   - Select your MT5 account
   - Enter amount (e.g., 100)
   - Enter transaction hash (e.g., "TEST123")
   - Upload proof file (optional)
3. Click Submit

## Watch the Backend Terminal

You'll see detailed logs like:

```
═══════════════════════════════════════════════════════════
🚀 NEW MANUAL DEPOSIT REQUEST RECEIVED
═══════════════════════════════════════════════════════════
📥 Request body: {
  "mt5AccountId": "...",
  "amount": 100,
  "transactionHash": "TEST123"
}
📋 Extracted data:
   - Transaction Hash: TEST123
   - Proof File URL: ...

✅✅✅ MT5Transaction CREATED SUCCESSFULLY! ✅✅✅
📋 MT5Transaction ID: ...
📋 MT5Transaction full record: { ... }
```

## If Something Goes Wrong

Look for:
```
❌❌❌ FAILED TO CREATE MT5Transaction! ❌❌❌
❌ Error: [exact error message here]
```

The error message will tell you exactly what's wrong!

---

**TL;DR: Open new terminal → cd to zuperior-back → npm start → Create deposit on frontend**

