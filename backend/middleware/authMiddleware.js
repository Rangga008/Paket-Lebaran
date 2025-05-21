// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Ambil token dari header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ 
      message: 'Invalid token',
      error: error.message 
    });
  }
};