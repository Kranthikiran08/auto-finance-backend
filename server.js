// server.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors'); // Essential for frontend/backend communication

const vehicleRoutes = require('./vehicleRoutes');

const app = express();
const PORT = 3000;

// --- Middlewares ---
// Allow cross-origin requests (so your frontend HTML can talk to this server)
app.use(cors()); 

// Parse incoming request bodies as JSON
app.use(bodyParser.json()); 

// --- Database Connection ---
// FIX: The URI MUST be enclosed in single or double quotes to be a valid string.
const mongoUri = 'mongodb+srv://kranthikiran_08:Kranthi2005@cluster0.8jmjbrr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mongoUri)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- Routes ---
// Use the vehicle routes for all /api/vehicles requests
app.use('/api/vehicles', vehicleRoutes);

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
