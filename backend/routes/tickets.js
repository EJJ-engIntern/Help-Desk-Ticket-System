const express = require('express');
const router = express.Router();
const axios = require('axios');
const supabase = require('../db/supabase');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// GET /api/tickets — user sees own, admin sees all
router.get('/', authMiddleware, async (req, res) => {
  let query = supabase
    .from('tickets')
    .select(`
      id, title, description, status, category, created_at,
      users (id, name, email)
    `)
    .order('created_at', { ascending: false });

  if (req.user.role !== 'admin') {
    query = query.eq('user_id', req.user.id);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/tickets/:id — single ticket with comments
router.get('/:id', authMiddleware, async (req, res) => {
  const { data: ticket, error } = await supabase
    .from('tickets')
    .select(`
      id, title, description, status, category, created_at,
      users (id, name, email)
    `)
    .eq('id', req.params.id)
    .single();

  if (error || !ticket) return res.status(404).json({ error: 'Ticket not found' });

  // Non-admin can only view their own tickets
  if (req.user.role !== 'admin' && ticket.users.id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { data: comments } = await supabase
    .from('comments')
    .select('id, body, created_at, users (id, name)')
    .eq('ticket_id', req.params.id)
    .order('created_at', { ascending: true });

  res.json({ ...ticket, comments: comments || [] });
});

// POST /api/tickets — create ticket
router.post('/', authMiddleware, async (req, res) => {
  const { title, description, category } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const { data, error } = await supabase
    .from('tickets')
    .insert({ title, description, category, user_id: req.user.id, status: 'open' })
    .select('*, users (id, name, email)')
    .single();

  if (error) return res.status(500).json({ error: error.message });

  const webhookUrl = process.env.POWER_AUTOMATE_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await axios.post(webhookUrl, {
        ticketId: data.id,
        ticketTitle: data.title,
        newStatus: "Created",
        userEmail: data.users.email,
        userName: data.users.name,
      });
    } catch (webhookErr) {
      console.error('Webhook failed (non-blocking):', webhookErr.message);
    }
  }

  res.status(201).json(data);
});

// PATCH /api/tickets/:id — admin updates status
router.patch('/:id', authMiddleware, adminOnly, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['open', 'in_progress', 'closed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const { data, error } = await supabase
    .from('tickets')
    .update({ status })
    .eq('id', req.params.id)
    .select('*, users (id, name, email)')
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Trigger Power Automate webhook if configured
  const webhookUrl = process.env.POWER_AUTOMATE_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await axios.post(webhookUrl, {
        ticketId: data.id,
        ticketTitle: data.title,
        newStatus: status,
        userEmail: data.users.email,
        userName: data.users.name,
      });
    } catch (webhookErr) {
      console.error('Webhook failed (non-blocking):', webhookErr.message);
    }
  }

  res.json(data);
});

module.exports = router;
