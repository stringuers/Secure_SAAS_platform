# 🚀 Complete Setup & Deployment Guide

## 📋 Prerequisites

- Node.js 16+ and npm installed
- Wireshark installed (for packet capture)
- Terminal access

## 🏗️ Project Structure

```
secure-auth-demo/
├── src/                    # React frontend
│   ├── pages/
│   │   ├── Index.tsx       # Landing page
│   │   ├── Register.tsx    # Registration
│   │   ├── Login.tsx       # Login
│   │   └── Dashboard.tsx   # Protected dashboard
│   ├── components/         # UI components
│   └── index.css          # Design system
├── backend/               # Node.js HTTPS server
│   ├── server.js          # Main server file
│   ├── generate-cert.js   # SSL cert generator
│   ├── package.json       # Backend dependencies
│   └── ssl/              # SSL certificates (generated)
└── DEPLOYMENT.md         # This file
```

## 🔧 Setup Instructions

### Step 1: Install Frontend Dependencies

```bash
# From project root
npm install
```

### Step 2: Setup Backend

```bash
# Navigate to backend folder
cd backend

# Install backend dependencies
npm install

# Generate self-signed SSL certificate
npm run generate-cert
```

Expected output:
```
🔐 Generating self-signed SSL certificate...
✅ SSL certificate generated successfully!
📁 Location: backend/ssl/
```

### Step 3: Start Backend Server

```bash
# In backend/ folder
npm run dev
```

Expected output:
```
🔒 HTTPS Server running on https://localhost:3001
📊 Ready to capture with Wireshark!

Endpoints:
  POST /api/auth/register - Register new user
  POST /api/auth/login    - Login user
  GET  /api/user/profile  - Get user profile (requires JWT)
  GET  /api/health        - Health check
```

### Step 4: Start Frontend

```bash
# In new terminal, from project root
npm run dev
```

Frontend runs on: **http://localhost:8080**

## 🔍 Wireshark Capture Guide

### Setup Wireshark

1. **Open Wireshark**
2. **Select Interface**: Choose "Loopback: lo0" (macOS/Linux) or "Loopback" (Windows)
3. **Apply Display Filter**: 
   ```
   tcp.port == 3001
   ```
4. **Start Capture**: Click the blue shark fin icon

### Capture Authentication Flow

#### Phase 1: Registration

1. Navigate to http://localhost:8080/register
2. Fill in email and password
3. Click "Register"
4. **In Wireshark**: 
   - Look for TLS handshake packets
   - Filter: `tls.handshake.type == 1`
   - Notice: No plain text password visible!

#### Phase 2: Login

1. Navigate to http://localhost:8080/login
2. Enter credentials
3. Click "Login"
4. **In Wireshark**:
   - Filter: `tls.record.content_type == 23` (Application Data)
   - All HTTP data is encrypted
   - Password transmission is secure

#### Phase 3: Dashboard Access

1. After login, you're redirected to dashboard
2. JWT token is stored in localStorage
3. **In Wireshark**:
   - Future requests include encrypted JWT
   - Filter: `http2` to see HTTP/2 over TLS

### Key Packets to Analyze

| Packet Type | Wireshark Filter | What to Observe |
|------------|------------------|-----------------|
| TLS Handshake | `tls.handshake` | Certificate exchange, cipher suite negotiation |
| Client Hello | `tls.handshake.type == 1` | Client's supported ciphers |
| Server Hello | `tls.handshake.type == 2` | Selected cipher suite |
| Application Data | `tls.record.content_type == 23` | Encrypted HTTP traffic |
| Certificate | `tls.handshake.certificate` | Server's SSL certificate |

### Compare: HTTP vs HTTPS

To demonstrate the danger of unencrypted traffic:

**Option A**: Add HTTP server (for educational comparison only)

Edit `backend/server.js` to add:
```javascript
// WARNING: Insecure comparison only!
const http = require('http');
http.createServer(app).listen(3002, () => {
  console.log('⚠️ INSECURE HTTP server on http://localhost:3002');
});
```

Update frontend to use HTTP endpoint temporarily, then:
- Filter: `http and tcp.port == 3002`
- You'll see passwords in PLAIN TEXT!

## 🔐 Security Analysis

### bcrypt in Action

**Server logs show**:
```
Hashing password with bcrypt...
Password hashed successfully
User registered: user@example.com (ID: 1234567890)
```

**What happens**:
1. Password: `MySecurePass123`
2. bcrypt generates random salt
3. Performs 2^10 (1024) hashing iterations
4. Stores: `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`

**Security**: Even with database access, attacker cannot reverse hash to get password.

### JWT Token Structure

**Example token**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJpZCI6IjE3MDUwNjg5MzA0MjMiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE3MDUwNjg5MzAsImV4cCI6MTcwNTE1NTMzMH0.
mZ5Xg3lN8fQwH3Yh5Yn6bRkJwUXz9Bq4Tx5Kp2Zp7Wc
```

Decoded:
- **Header**: `{"alg":"HS256","typ":"JWT"}`
- **Payload**: `{"id":"...","email":"...","iat":...,"exp":...}`
- **Signature**: HMAC-SHA256 hash (prevents tampering)

### TLS Encryption

**Cipher Suite** (typical):
```
TLS_AES_256_GCM_SHA384
```

Breakdown:
- **TLS**: Transport Layer Security
- **AES_256**: 256-bit encryption
- **GCM**: Galois/Counter Mode (authenticated encryption)
- **SHA384**: 384-bit hash function

## 📸 Screenshots & Demonstrations

### 1. Landing Page
- Modern security-themed design
- Features overview
- Call-to-action buttons

### 2. Registration Flow
- Email and password inputs
- Password strength requirements
- Security information badge

### 3. Login Process
- Credential submission
- JWT token generation
- Redirect to dashboard

### 4. Protected Dashboard
- User information display
- JWT token viewer (truncated)
- Decoded payload inspection
- Security status indicators

### 5. Wireshark Analysis
- Encrypted TLS handshake
- Application data packets
- No plain text credentials visible

## 🧪 Testing Checklist

- [ ] Backend starts without errors on https://localhost:3001
- [ ] Frontend loads on http://localhost:8080
- [ ] Can register new user
- [ ] Registration creates bcrypt hash (check server logs)
- [ ] Can login with registered credentials
- [ ] JWT token appears in localStorage
- [ ] Dashboard displays user info and token
- [ ] Wireshark shows encrypted TLS traffic
- [ ] No plain text passwords in packet capture
- [ ] Logout clears token and redirects

## 🔧 Troubleshooting

### Issue: SSL Certificate Error

**Error**: `ENOENT: no such file or directory, open 'backend/ssl/key.pem'`

**Solution**:
```bash
cd backend
npm run generate-cert
```

### Issue: Browser Shows "Not Secure"

**Error**: Browser warning about self-signed certificate

**Solution**: 
- Click "Advanced" → "Proceed to localhost (unsafe)"
- This is expected for self-signed development certificates
- In production, use certificates from trusted CA

### Issue: CORS Error

**Error**: `Access to fetch at 'https://localhost:3001' from origin 'http://localhost:8080' has been blocked by CORS policy`

**Solution**: Backend is configured with CORS. If still occurring:
- Ensure backend is running
- Check `cors` configuration in `backend/server.js`
- Origin should be set to `http://localhost:8080`

### Issue: "Failed to Fetch"

**Cause**: Backend not running or wrong port

**Solution**:
```bash
cd backend
npm run dev
```

### Issue: Wireshark Shows No Packets

**Cause**: Wrong network interface selected

**Solution**:
- Select "Loopback: lo0" or "Loopback" interface
- Apply filter: `tcp.port == 3001`
- Ensure capture is running (blue icon should be pulsing)

## 🎓 Educational Objectives

After completing this demo, you'll understand:

1. **HTTPS Importance**: How TLS prevents credential interception
2. **Password Security**: Why plain text passwords are dangerous
3. **bcrypt Hashing**: How one-way hashing protects passwords
4. **JWT Authentication**: Stateless token-based auth
5. **Packet Analysis**: Using Wireshark to verify security
6. **Man-in-the-Middle Prevention**: How encryption defeats eavesdropping

## 📚 Additional Resources

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [JWT.io](https://jwt.io/) - JWT debugger and documentation
- [Wireshark University](https://www.wireshark.org/docs/)
- [bcrypt Explained](https://en.wikipedia.org/wiki/Bcrypt)

## ⚠️ Production Considerations

This is a **demonstration project**. For production:

- [ ] Replace self-signed cert with CA-issued certificate (Let's Encrypt)
- [ ] Use environment variables for secrets
- [ ] Implement rate limiting
- [ ] Add input validation and sanitization
- [ ] Use production-grade database (PostgreSQL, MongoDB)
- [ ] Implement refresh token rotation
- [ ] Add CSRF protection
- [ ] Enable security headers (Helmet.js)
- [ ] Log authentication events
- [ ] Implement account lockout after failed attempts

## 🎯 Next Steps

1. **Experiment**: Try different passwords, observe bcrypt hashes
2. **Analyze**: Use Wireshark to trace entire auth flow
3. **Learn**: Research TLS cipher suites
4. **Expand**: Add password reset functionality
5. **Secure**: Implement additional security measures

---

**Built for Security Education** 🔒
A hands-on demonstration of modern authentication best practices.
