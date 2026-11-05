require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static(__dirname));
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/CampusPass.html');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// Record a call verification for a leave request
app.post('/api/verify-call/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { verificationType, verifiedBy, notes } = req.body; // 'phone' or 'video'

    // Update your leave requests or audit logs table in Supabase
    const { data, error } = await supabase
      .from('leave_requests')
      .update({
        verification_type: verificationType,
        verification_status: 'Verified',
        verified_by: verifiedBy,
        verified_at: new Date().toISOString(),
        verification_notes: notes || ''
      })
      .eq('id', requestId);

    if (error) throw error;

    res.json({ success: true, message: 'Verification recorded successfully!' });
  } catch (err) {
    console.error('Error recording verification:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});
