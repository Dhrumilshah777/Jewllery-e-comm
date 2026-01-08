const bcrypt = require('bcryptjs');

const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123', // Will be hashed in model or need to hash here if using insertMany directly without pre-save hook triggering?
    // Wait, insertMany does NOT trigger pre('save') middleware in Mongoose.
    // So I need to hash passwords here or use create().
    // Let's manually hash it for simplicity or use a loop with save().
    // Actually, let's just use the plain password and rely on the model logic?
    // No, insertMany bypasses middleware.
    // I will hash it here.
    role: 'admin',
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'user',
  },
];

module.exports = users;
