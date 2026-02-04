const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const vehicleRoutes = require('./vehicleRoutes');

const app = express();
const PORT = 3000;

app.use(cors()); 
app.use(bodyParser.json()); 

const mongoUri = 'mongodb+srv://kranthikiran_08:Kranthi2005@cluster0.8jmjbrr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mongoUri)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- SETTINGS SCHEMA FOR PASSWORD ---
const settingsSchema = new mongoose.Schema({
    key: { type: String, unique: true },
    value: { type: String }
});
const Settings = mongoose.model('Settings', settingsSchema);

// Route to get the current admin password
app.get('/api/settings/admin-password', async (req, res) => {
    try {
        const setting = await Settings.findOne({ key: 'admin_password' });
        res.json({ password: setting ? setting.value : 'Vehicle@2005' });
    } catch (err) {
        res.status(500).json({ message: "Error fetching password" });
    }
});

// Route to update the admin password
app.patch('/api/settings/admin-password', async (req, res) => {
    const { newPassword, secretAnswer } = req.body;
    // You can change the secret answer here
    if (secretAnswer !== "VR SIDDHARTHA") {
        return res.status(401).json({ message: "Incorrect secret answer" });
    }
    try {
        await Settings.findOneAndUpdate(
            { key: 'admin_password' },
            { value: newPassword },
            { upsert: true }
        );
        res.json({ message: "Password updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

app.use('/api/vehicles', vehicleRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
