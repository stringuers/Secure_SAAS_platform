# Registration "Failed to Fetch" Error - Fix Summary

## Problem Identified

The registration form was showing a "failed to fetch" error due to two main issues:

1. **CORS Configuration Mismatch**: Backend only accepted requests from `http://localhost:8080`, but frontend was making requests to HTTPS endpoints
2. **Self-Signed SSL Certificate**: Browsers block fetch requests to HTTPS endpoints with untrusted self-signed certificates by default

## Changes Made

### 1. Backend CORS Configuration (`backend/server.js`)
- Updated CORS to accept both HTTP and HTTPS origins:
  ```javascript
  origin: ['http://localhost:8080', 'https://localhost:8080']
  ```

### 2. HTTP/HTTPS Mode Toggle (`backend/server.js`)
- Added environment variable support to run in HTTP or HTTPS mode
- Default: HTTPS (for Wireshark demo)
- HTTP mode: Bypasses SSL certificate issues during development

### 3. Centralized API Configuration (`src/config/api.ts`)
- Created a new config file for API endpoints
- Supports environment variable override: `VITE_API_URL`
- Default: `http://localhost:3001` (HTTP mode for easy development)

### 4. Updated Frontend Pages
- **Register.tsx**: Now uses `API_ENDPOINTS.register`
- **Login.tsx**: Now uses `API_ENDPOINTS.login`
- Both pages import from centralized config

### 5. New NPM Scripts (`backend/package.json`)
- `npm run dev:http` - Start in HTTP mode (no SSL issues)
- `npm run dev:https` - Start in HTTPS mode (for Wireshark demo)
- `npm run dev` - Default HTTPS mode

### 6. Documentation
- Created `TROUBLESHOOTING.md` with detailed solutions
- Updated backend startup messages with helpful instructions

## How to Use

### Quick Start (HTTP Mode - Recommended)

**Terminal 1 - Backend:**
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

Open http://localhost:8080 and register/login - it will work without any SSL issues!

### For Wireshark Demo (HTTPS Mode)

**Terminal 1 - Backend:**
```bash
cd backend
npm run generate-cert  # First time only
npm run dev:https
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

**Important:** Before using the app, visit https://localhost:3001/api/health in your browser and accept the self-signed certificate warning.

## Testing the Fix

The backend is currently running in HTTP mode on http://localhost:3001

You can test it with:
```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Test registration
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Why This Works

1. **HTTP Mode**: No SSL certificate validation needed, fetch requests work immediately
2. **CORS Fixed**: Backend now accepts requests from the frontend origin
3. **Centralized Config**: Easy to switch between HTTP/HTTPS by changing one variable
4. **Clear Instructions**: Users know exactly what to do if they encounter SSL issues

## Benefits

- ✅ Registration and login work out of the box
- ✅ No browser security warnings in development
- ✅ Can still demonstrate HTTPS/TLS for Wireshark when needed
- ✅ Better error messages guide users to solutions
- ✅ Flexible configuration via environment variables

## Next Steps

1. Start the frontend: `npm run dev` (in project root)
2. Open http://localhost:8080
3. Try registering a new account - it should work!
4. Check the backend terminal to see request logs

If you want to demonstrate TLS encryption with Wireshark, follow the HTTPS mode instructions in TROUBLESHOOTING.md.
