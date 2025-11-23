require('./azure-monitor')(); // Initialize Azure Monitor first
const https = require('https');
const http = require('http');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');
const SecurityLogger = require('./securityLogger');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const USE_HTTPS = process.env.USE_HTTPS !== 'false'; // Default to HTTPS

// CORS origins - support environment variable for production
const CORS_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:8080', 'https://localhost:8080', 'http://localhost:5173', 'https://localhost:5173'];

// In-memory database
const users = [];

// Middleware
app.use(cors({
  origin: CORS_ORIGINS,
  credentials: true
}));
app.use(express.json());
// Serve static frontend files in production
const publicFrontendPath = path.join(__dirname, 'public-frontend');
if (fs.existsSync(publicFrontendPath)) {
  console.log('📂 Serving frontend from:', publicFrontendPath);
  app.use(express.static(publicFrontendPath));
} else {
  console.log('⚠️ Frontend build not found at:', publicFrontendPath);
}

// Create Server Instance (HTTP or HTTPS)
let server;
if (USE_HTTPS) {
  const sslDir = path.join(__dirname, 'ssl');
  if (!fs.existsSync(path.join(sslDir, 'key.pem')) || !fs.existsSync(path.join(sslDir, 'cert.pem'))) {
    console.error('\n❌ SSL certificates not found! Run: npm run generate-cert');
    process.exit(1);
  }
  const httpsOptions = {
    key: fs.readFileSync(path.join(sslDir, 'key.pem')),
    cert: fs.readFileSync(path.join(sslDir, 'cert.pem'))
  };
  server = https.createServer(httpsOptions, app);
} else {
  server = http.createServer(app);
}

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:8080', 'https://localhost:8080', 'http://localhost:5173', 'https://localhost:5173'],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Initialize Security Logger
const securityLogger = new SecurityLogger(io);

// Request logging middleware with Security Logger
app.use((req, res, next) => {
  const logData = {
    method: req.method,
    url: req.url,
    headers: {
      ...req.headers,
      authorization: req.headers.authorization ? 'Bearer [HIDDEN]' : undefined
    },
    secure: req.secure,
    ip: req.ip
  };

  // Emit request event
  io.emit('network-request', logData);

  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      securityLogger.logAuth('TOKEN_VALIDATION', { token: 'INVALID' }, 'FAILURE');
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    securityLogger.logAuth('TOKEN_VALIDATION', { user: user.email }, 'SUCCESS');
    next();
  });
};

// --- DEMO ENDPOINTS ---

app.post('/demo/encrypt-password', async (req, res) => {
  const { password } = req.body;
  const startTime = Date.now();

  securityLogger.logEncryption('HASH_START', { algorithm: 'bcrypt', rounds: 10 });

  // Simulate delay for visualization
  await new Promise(resolve => setTimeout(resolve, 500));

  const salt = await bcrypt.genSalt(10);
  securityLogger.logEncryption('SALT_GENERATED', { salt });

  await new Promise(resolve => setTimeout(resolve, 500));

  const hash = await bcrypt.hash(password, salt);
  const timeTaken = Date.now() - startTime;

  securityLogger.logEncryption('HASH_COMPLETE', { hash, timeTaken: `${timeTaken}ms` });

  res.json({
    original: "***hidden***",
    salt,
    hash,
    algorithm: "bcrypt",
    rounds: 10,
    time_taken: `${timeTaken}ms`
  });
});

app.post('/demo/simulate-attack', (req, res) => {
  const { type, payload } = req.body;

  securityLogger.logAttack(type, { payload }, true);

  res.json({
    status: 'BLOCKED',
    message: `Malicious ${type} attempt detected and blocked.`,
    details: 'Input sanitization active. WAF rules applied.'
  });
});

app.get('/demo/security-status', (req, res) => {
  res.json({
    https_enabled: USE_HTTPS,
    headers_active: ['Strict-Transport-Security', 'X-Content-Type-Options', 'X-Frame-Options'],
    encryption_at_rest: true,
    encryption_in_transit: true,
    authentication_method: "JWT",
    token_algorithm: "HS256"
  });
});

// --- AUTH ROUTES ---

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (users.find(u => u.email === email)) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Visualization events
    securityLogger.logEncryption('REGISTRATION_HASH_START', { email, passwordLength: password.length });
    const hashedPassword = await bcrypt.hash(password, 10);
    securityLogger.logEncryption('REGISTRATION_HASH_COMPLETE', { email, hash: hashedPassword });

    const user = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.push(user);
    securityLogger.logDb('INSERT', { table: 'users', encrypted: true });
    securityLogger.logAuth('REGISTER', { email }, 'SUCCESS');

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email);
    if (!user) {
      securityLogger.logAuth('LOGIN', { email }, 'FAILURE');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      securityLogger.logAuth('LOGIN', { email }, 'FAILURE');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    securityLogger.logEncryption('TOKEN_GENERATION_START', { email });
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    securityLogger.logEncryption('TOKEN_GENERATION_COMPLETE', { email, token: token.substring(0, 20) + '...' });

    securityLogger.logAuth('LOGIN', { email }, 'SUCCESS');

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/user/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ id: user.id, email: user.email, createdAt: user.createdAt });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server running', secure: USE_HTTPS });
});
// Catch-all route to serve React App (SPA)
app.get('*', (req, res) => {
  const indexHtml = path.join(__dirname, 'public-frontend', 'index.html');
  if (fs.existsSync(indexHtml)) {
    res.sendFile(indexHtml);
  } else {
    res.status(404).send('Frontend not found. Please build the frontend and restart the server.');
  }
});
// Start Server
server.listen(PORT, () => {
  console.log(`\n${USE_HTTPS ? '🔒 HTTPS' : '🌐 HTTP'} Server running on port ${PORT}`);
  console.log('✅ WebSocket Server ready');
  console.log('✅ Security Logger active');
});
