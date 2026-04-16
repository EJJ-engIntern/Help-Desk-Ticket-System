const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');
const { authMiddleware } = require('../middleware/auth');

// POST /api/comments — add a comment to a ticket
router.post('/', authMiddleware, async (req, res) => {
  const { ticket_id, body } = req.body;
  if (!ticket_id || !body) {
    return res.status(400).json({ error: 'ticket_id and body are required' });
  }

  // Verify ticket exists and user has access
  const { data: ticket } = await supabase
    .from('tickets')
    .select('id, user_id')
    .eq('id', ticket_id)
    .single();

  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  if (req.user.role !== 'admin' && ticket.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({ ticket_id, body, user_id: req.user.id })
    .select('id, body, created_at, users (id, name)')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

module.exports = router;
