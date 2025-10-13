const https = require('https');
const http = require('http');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'your-secret-key-change-in-production';
const USE_HTTPS = process.env.USE_HTTPS !== 'false'; // Default to HTTPS

// In-memory database (replace with real database in production)
const users = [];

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'https://localhost:8080'],
  credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', { ...req.body, password: req.body.password ? '[REDACTED]' : undefined });
  }
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
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash password with bcrypt (10 rounds)
    console.log('Hashing password with bcrypt...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    // Create user
    const user = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.push(user);
    console.log(`User registered: ${email} (ID: ${user.id})`);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password with bcrypt
    console.log('Verifying password with bcrypt...');
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      console.log('Password verification failed');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Password verified successfully');

    // Generate JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log(`User logged in: ${email}`);
    console.log(`JWT Token generated (first 20 chars): ${token.substring(0, 20)}...`);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Protected route example
app.get('/api/user/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    id: user.id,
    email: user.email,
    createdAt: user.createdAt
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'HTTPS server running',
    timestamp: new Date().toISOString()
  });
});

// Start server (HTTP or HTTPS based on configuration)
if (USE_HTTPS) {
  // Create HTTPS server with self-signed certificate
  const sslDir = path.join(__dirname, 'ssl');

  // Check if SSL certificates exist
  if (!fs.existsSync(path.join(sslDir, 'key.pem')) || !fs.existsSync(path.join(sslDir, 'cert.pem'))) {
    console.error('\n❌ SSL certificates not found!');
    console.error('Please run: npm run generate-cert');
    console.error('Or start in HTTP mode: USE_HTTPS=false npm run dev\n');
    process.exit(1);
  }

  const httpsOptions = {
    key: fs.readFileSync(path.join(sslDir, 'key.pem')),
    cert: fs.readFileSync(path.join(sslDir, 'cert.pem'))
  };

  https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log('\n🔒 HTTPS Server running on https://localhost:' + PORT);
    console.log('📊 Ready to capture with Wireshark!');
    console.log('\n⚠️  Browser Warning: You may need to accept the self-signed certificate');
    console.log('   Visit https://localhost:3001/api/health in your browser first');
    console.log('   Click "Advanced" → "Proceed to localhost"\n');
    console.log('Endpoints:');
    console.log('  POST /api/auth/register - Register new user');
    console.log('  POST /api/auth/login    - Login user');
    console.log('  GET  /api/user/profile  - Get user profile (requires JWT)');
    console.log('  GET  /api/health        - Health check\n');
  });
} else {
  // Create HTTP server (for development without SSL issues)
  http.createServer(app).listen(PORT, () => {
    console.log('\n🌐 HTTP Server running on http://localhost:' + PORT);
    console.log('⚠️  Running in HTTP mode - no encryption!');
    console.log('   For HTTPS/TLS demo: USE_HTTPS=true npm run dev\n');
    console.log('Endpoints:');
    console.log('  POST /api/auth/register - Register new user');
    console.log('  POST /api/auth/login    - Login user');
    console.log('  GET  /api/user/profile  - Get user profile (requires JWT)');
    console.log('  GET  /api/health        - Health check\n');
  });
}
