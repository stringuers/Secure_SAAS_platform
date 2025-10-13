# Secure Authentication Backend

HTTPS + JWT + bcrypt authentication server for Wireshark demonstration.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Generate Self-Signed SSL Certificate

```bash
npm run generate-cert
```

This creates `ssl/cert.pem` and `ssl/key.pem` for HTTPS.

### 3. Start the Server

```bash
npm run dev
```

Server runs on **https://localhost:3001**

## 📡 API Endpoints

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

### Login User
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1234567890",
    "email": "user@example.com"
  }
}
```

### Get Profile (Protected)
```bash
GET /api/user/profile
Authorization: Bearer <JWT_TOKEN>
```

## 🔍 Wireshark Packet Capture Guide

### Setup

1. **Open Wireshark**
2. **Select Network Interface**: Choose your loopback interface (usually "Loopback: lo0" or "lo")
3. **Start Capture**: Click the blue shark fin icon

### Capture Filters

To focus on HTTPS traffic:
```
tcp.port == 3001
```

For TLS/SSL specific:
```
ssl or tls
```

### What to Look For

#### 1. **TLS Handshake** (Encrypted)
- Filter: `tls.handshake`
- You'll see: Client Hello, Server Hello, Certificate Exchange
- Notice: No plain text credentials visible

#### 2. **Application Data** (Encrypted)
- Filter: `tls.record.content_type == 23`
- This is your encrypted HTTP traffic
- Password and JWT tokens are NOT visible in plain text

#### 3. **Compare with HTTP** (Optional)
Start a regular HTTP server to see the difference:
```javascript
// Unencrypted comparison (DON'T USE IN PRODUCTION)
const http = require('http');
http.createServer(app).listen(3002);
```

Filter: `http and tcp.port == 3002`
- You'll see passwords in PLAIN TEXT! ⚠️

### Key Observations

✅ **With HTTPS (port 3001)**:
- All data encrypted with TLS 1.3
- Password hidden during transmission
- JWT token encrypted in transit

❌ **Without HTTPS (comparison)**:
- Password visible in clear text
- JWT token readable by anyone
- Complete security breach!

## 🔐 Security Features

### bcrypt Password Hashing
- **Cost Factor**: 10 rounds (2^10 iterations)
- **Salt**: Automatically generated per password
- **Output**: 60-character hash string
- **Verification**: Constant-time comparison

Example:
```
Plain: "SecurePass123"
Hash:  "$2a$10$abcdefghijklmnopqrstuvwxyz..."
```

### JWT Authentication
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Expiration**: 24 hours
- **Payload**: User ID and email
- **Signature**: Prevents tampering

Token Structure:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.      # Header
eyJpZCI6IjEyMzQiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20ifQ. # Payload
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c     # Signature
```

### HTTPS/TLS
- **Version**: TLS 1.3
- **Certificate**: Self-signed (development only)
- **Key Size**: 2048-bit RSA
- **Cipher Suite**: Modern, secure algorithms

## 📊 Testing Flow

1. **Start backend**: `npm run dev`
2. **Start frontend**: (in main project) `npm run dev`
3. **Open Wireshark**: Start capturing on loopback
4. **Register a user**: Fill the registration form
5. **Watch Wireshark**: See encrypted TLS handshake
6. **Login**: Submit credentials
7. **Observe**: Password transmission is encrypted
8. **View Dashboard**: See JWT token in use

## 🛠️ Folder Structure

```
backend/
├── server.js           # Main HTTPS server
├── generate-cert.js    # SSL certificate generator
├── package.json        # Dependencies
├── ssl/               # Generated certificates
│   ├── cert.pem       # Public certificate
│   └── key.pem        # Private key
└── README.md          # This file
```

## ⚠️ Important Notes

- **Self-Signed Certificate**: Browser will show security warning
  - Click "Advanced" → "Proceed to localhost"
  - This is expected for development
  
- **In-Memory Database**: Data lost on restart
  - Replace with real database for production
  
- **JWT Secret**: Change `JWT_SECRET` in production
  - Use environment variables
  - Keep it secure and complex

## 🎓 Educational Takeaways

This demo teaches:

1. **Why HTTPS matters**: Credentials encrypted in transit
2. **bcrypt strength**: Passwords impossible to reverse
3. **JWT benefits**: Stateless authentication
4. **Wireshark analysis**: How to verify security
5. **Attack prevention**: Man-in-the-middle protection

## 🔗 Resources

- [bcrypt npm package](https://www.npmjs.com/package/bcryptjs)
- [jsonwebtoken documentation](https://github.com/auth0/node-jsonwebtoken)
- [Wireshark User Guide](https://www.wireshark.org/docs/wsug_html_chunked/)
- [TLS 1.3 Specification](https://tools.ietf.org/html/rfc8446)
