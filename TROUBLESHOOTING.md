# Troubleshooting Guide

## "Failed to Fetch" Error During Registration/Login

This error occurs when the frontend cannot connect to the backend. Here are the solutions:

### Solution 1: Use HTTP Mode (Recommended for Development)

The easiest way to fix this is to run the backend in HTTP mode:

```bash
cd backend
npm run dev:http
```

This starts the server on `http://localhost:3001` without SSL certificates, avoiding browser security warnings.

### Solution 2: Use HTTPS with Self-Signed Certificate

If you want to demonstrate TLS/HTTPS encryption with Wireshark:

1. **Generate SSL certificates:**
   ```bash
   cd backend
   npm run generate-cert
   ```

2. **Start the HTTPS server:**
   ```bash
   npm run dev:https
   # or just: npm run dev
   ```

3. **Accept the self-signed certificate in your browser:**
   - Open https://localhost:3001/api/health in your browser
   - You'll see a security warning
   - Click "Advanced" → "Proceed to localhost (unsafe)"
   - This tells the browser to trust the self-signed certificate

4. **Now try registration again** - it should work!

### Solution 3: Configure Custom API URL

You can also configure a custom API URL using environment variables:

1. Create a `.env` file in the project root:
   ```
   VITE_API_URL=http://localhost:3001
   ```

2. Restart the frontend:
   ```bash
   npm run dev
   ```

## Common Issues

### Backend Not Running
**Error:** "Could not create account. Make sure backend is running."

**Solution:** Start the backend server:
```bash
cd backend
npm install  # if you haven't already
npm run dev:http
```

### Port Already in Use
**Error:** "EADDRINUSE: address already in use :::3001"

**Solution:** Kill the process using port 3001:
```bash
lsof -ti:3001 | xargs kill -9
```

### CORS Errors
**Error:** "Access to fetch at 'http://localhost:3001' from origin 'http://localhost:8080' has been blocked by CORS"

**Solution:** The backend is already configured to accept requests from both HTTP and HTTPS origins. Make sure:
- Backend is running
- You're accessing the frontend at http://localhost:8080 or https://localhost:8080

## Development vs Production

### Development (HTTP - No Encryption)
```bash
cd backend
npm run dev:http
```
- ✅ No SSL certificate issues
- ✅ Easy to develop and test
- ❌ No encryption (passwords visible in Wireshark)

### Production/Demo (HTTPS - Encrypted)
```bash
cd backend
npm run generate-cert  # First time only
npm run dev:https
```
- ✅ TLS encryption (passwords hidden in Wireshark)
- ✅ Demonstrates security best practices
- ⚠️ Requires accepting self-signed certificate in browser

## Quick Start Commands

**Terminal 1 - Backend (HTTP mode):**
```bash
cd backend
npm install
npm run dev:http
```

**Terminal 2 - Frontend:**
```bash
npm install
npm run dev
```

Then open http://localhost:8080 in your browser.

## Still Having Issues?

1. Check that both servers are running (backend on port 3001, frontend on port 8080)
2. Check browser console for specific error messages (F12 → Console tab)
3. Check backend terminal for request logs
4. Try clearing browser cache and localStorage
5. Restart both servers

## For Wireshark Demo

If you want to capture and analyze HTTPS traffic:

1. Use HTTPS mode: `npm run dev:https` in backend
2. Accept the certificate in browser (see Solution 2 above)
3. Start Wireshark and capture on loopback interface
4. Filter: `tcp.port == 3001`
5. Register/login and observe encrypted TLS traffic
