const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const supabase = require('../db/supabase');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// POST /api/auth/seed  — run once to populate users from DummyJSON
router.post('/seed', async (req, res) => {
  try {
    const response = await axios.get('https://dummyjson.com/users?limit=10');
    const dummyUsers = response.data.users;

    const defaultPassword = await bcrypt.hash('password123', 10);

    const users = dummyUsers.map((u, i) => ({
      name: `${u.firstName} ${u.lastName}`,
      email: u.email.toLowerCase(),
      role: i === 0 ? 'admin' : 'user', // first user becomes admin
      password_hash: defaultPassword,
    }));

    const { data, error } = await supabase
      .from('users')
      .upsert(users, { onConflict: 'email' })
      .select('id, name, email, role');

    if (error) throw error;

    res.json({
      message: `Seeded ${data.length} users. Admin: ${data[0].email} / password123`,
      users: data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
