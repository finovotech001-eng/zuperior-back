# Quick Test - Is Backend Receiving Requests?

Let me verify the backend is receiving requests properly.

## Test with cURL (Run this in a terminal):

```bash
# Get a valid token first (you'll need to login and get your token)
# Then test the endpoint:

curl -X POST http://localhost:5000/api/manual-deposit/create \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "mt5AccountId=19876953" \
  -F "amount=100" \
  -F "transactionHash=TEST123"
```

## Or check the backend terminal

When you click "Create Payment Request", check the backend terminal (the one where you ran `npm start`).

You should see:
```
═══════════════════════════════════════════════════════════
🚀 NEW MANUAL DEPOSIT REQUEST RECEIVED
═══════════════════════════════════════════════════════════
📥 Request body type: object
📥 Request body: { mt5AccountId: '19876953', amount: '756', ... }
```

## If you see NOTHING in the backend terminal:

That means the request is NOT reaching the backend. The issue is in the Next.js proxy route.

## If you see the request but with errors:

The backend will show exactly what's wrong.

