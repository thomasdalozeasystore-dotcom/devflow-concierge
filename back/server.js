import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for widget testing
  credentials: true
}));
app.use(express.json());

// PostgreSQL connection pool
const pool = new pg.Pool({
  user: process.env.POSTGRES_USER || 'devflow',
  host: process.env.POSTGRES_HOST || 'postgres',
  database: process.env.POSTGRES_DB || 'devflow_db',
  password: process.env.POSTGRES_PASSWORD || 'devflow123',
  port: process.env.POSTGRES_PORT || 5432,
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, email, created_at FROM users ORDER BY created_at DESC');
    res.json({ success: true, users: result.rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT id, username, email, created_at FROM users WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user' });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Missing email or password' });
    }
    
    // Query user by email
    const result = await pool.query(
      'SELECT id, username, email, created_at, password_hash FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    // NOTE: In production, use bcrypt.compare() to verify hashed password!
    // For now, we're doing simple string comparison for testing
    if (user.password_hash !== password) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    // Don't send password hash to client
    const { password_hash, ...userWithoutPassword } = user;
    
    res.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// Create new user
app.post('/api/users', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    
    // NOTE: In production, hash the password with bcrypt!
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, email, password]
    );
    
    res.status(201).json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error('Error creating user:', error);
    
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ success: false, error: 'Email already exists' });
    }
    
    res.status(500).json({ success: false, error: 'Failed to create user' });
  }
});

// Widget chat endpoint
app.post('/api/widget/chat', async (req, res) => {
  try {
    const { session_id, message, metadata } = req.body;
    
    if (!session_id || !message) {
      return res.status(400).json({ success: false, error: 'Missing session_id or message' });
    }
    
    await pool.query(
      `INSERT INTO chat_logs (session_id, service_type, company_name, role, content, timestamp, metadata) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [session_id, 'WIDGET', metadata?.website_domain || 'unknown', 'user', message, new Date().toISOString(), JSON.stringify(metadata || {})]
    );
    
    const aiResponse = `Thank you for your message: "${message}". How can I help you further?`;
    
    await pool.query(
      `INSERT INTO chat_logs (session_id, service_type, company_name, role, content, timestamp, metadata) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [session_id, 'WIDGET', metadata?.website_domain || 'unknown', 'model', aiResponse, new Date().toISOString(), JSON.stringify(metadata || {})]
    );
    
    res.json({ success: true, response: aiResponse, session_id });
  } catch (error) {
    console.error('Error in widget chat:', error);
    res.status(500).json({ success: false, error: 'Failed to process message' });
  }
});

// Get widget chat history
app.get('/api/widget/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const result = await pool.query(
      `SELECT role, content, timestamp, metadata FROM chat_logs 
       WHERE session_id = $1 AND service_type = 'WIDGET' ORDER BY timestamp ASC`,
      [sessionId]
    );
    res.json({ success: true, messages: result.rows });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch history' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  pool.end();
  process.exit(0);
});
