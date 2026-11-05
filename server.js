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
// Preview the photo instantly after taking it
function previewCapturedImage(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const preview = document.getElementById('photoPreview');
      preview.src = e.target.result;
      preview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  }
}

// Call this inside your login/registration submit handler
async function saveStudentPhotoAndLogin(rollNumber) {
  const fileInput = document.getElementById('cameraInput');
  if (fileInput.files.length === 0) {
    alert("Please take a profile photo using the camera before logging in.");
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();
  
  reader.onloadend = async function () {
    const base64Image = reader.result; // Converts image to string format to store safely

    try {
      // Send to your backend server.js to update Supabase
      const response = await fetch('/api/update-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollNumber, avatarUrl: base64Image })
      });

      const result = await response.json();
      if (result.success) {
        alert("Photo saved successfully! Logging in...");
        // Proceed to dashboard view...
      } else {
        alert("Error saving photo: " + result.error);
      }
    } catch (err) {
      console.error("Network error:", err);
    }
  };
  
  reader.readAsDataURL(file);
}
// Endpoint to save captured student profile photo
app.post('/api/update-avatar', async (req, res) => {
  try {
    const { rollNumber, avatarUrl } = req.body;

    const { data, error } = await supabase
      .from('users')
      .update({ avatar_url: avatarUrl })
      .eq('roll_number', rollNumber);

    if (error) throw error;

    res.json({ success: true, message: 'Profile photo updated successfully!' });
  } catch (err) {
    console.error('Error updating avatar:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});
