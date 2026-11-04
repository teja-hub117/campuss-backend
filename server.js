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
