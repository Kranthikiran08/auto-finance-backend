const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const vehicleRoutes = require('./vehicleRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); 
app.use(bodyParser.json()); 

const mongoUri = 'mongodb+srv://kranthikiran_08:Kranthi2005@cluster0.8jmjbrr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mongoUri)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

const settingsSchema = new mongoose.Schema({
    key: { type: String, unique: true },
    value: { type: String }
});
const Settings = mongoose.model('Settings', settingsSchema);

// GET Endpoint
app.get('/api/settings/admin-password', async (req, res) => {
    try {
        const setting = await Settings.findOne({ key: 'admin_password' });
        res.json({ password: setting ? setting.value : 'Vehicle@2005' });
    } catch (err) {
        res.status(500).json({ message: "Error fetching password" });
    }
});

// PATCH Endpoint - Updated verification logic
app.patch('/api/settings/admin-password', async (req, res) => {
    try {
        const { newPassword, secretAnswer } = req.body;

        // Clean up the input string to avoid case/space matching issues
        const cleanAnswer = secretAnswer ? secretAnswer.trim().toUpperCase() : "";

        if (cleanAnswer !== "VR SIDDHARTHA") {
            return res.status(401).json({ message: "Incorrect secret answer" });
        }

        if (!newPassword || newPassword.length < 4) {
            return res.status(400).json({ message: "Password too short" });
        }

        const updatedSetting = await Settings.findOneAndUpdate(
            { key: 'admin_password' },
            { value: newPassword },
            { upsert: true, new: true } // 'new: true' returns the modified document
        );

        console.log("Password successfully changed in DB to:", newPassword);
        return res.json({ message: "Password updated successfully" });

    } catch (err) {
        console.error("Database Update Error:", err);
        return res.status(500).json({ message: "Server error saving password" });
    }
});

app.use('/api/vehicles', vehicleRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
