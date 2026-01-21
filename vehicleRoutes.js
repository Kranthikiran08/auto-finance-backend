const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// --- 1. Define the Vehicle Schema ---
const vehicleSchema = new mongoose.Schema({
    surname: { type: String, required: true },
    firstName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    vehicleNumber: { type: String, required: true, unique: true, maxlength: 10 },
    loanAg: { type: String, required: true }, // 6-character limit removed in schema validation
    loanDate: { type: String, required: true },
    
    guarantor: { type: String, default: 'N/A' }, 
    
    maker: { type: String, required: true },
    classification: { type: String, required: true },
    model: { type: String, required: true },
    // drivingLicense field REMOVED from here
    chassis: { type: String, required: true },
    engine: { type: String, required: true },
    rto: { type: String, required: true },
    noc: { type: String, default: null }
});

// Create the model based on the schema
const Vehicle = mongoose.model('Vehicle', vehicleSchema);

// --- 2. API Endpoints (Routes) ---

// GET /api/vehicles - Read all vehicles
router.get('/', async (req, res) => {
    try {
        const vehicles = await Vehicle.find({});
        res.status(200).json(vehicles);
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving vehicles', error: err.message });
    }
});

// POST /api/vehicles - Create a new vehicle
router.post('/', async (req, res) => {
    try {
        // We create the vehicle with the data sent from the frontend.
        // Since drivingLicense is removed from frontend, it won't be in req.body.
        const newVehicle = new Vehicle(req.body);
        await newVehicle.save();
        res.status(201).json(newVehicle);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Vehicle number already exists.' });
        }
        res.status(400).json({ message: 'Error adding vehicle', error: err.message });
    }
});

// PATCH /api/vehicles/:vehicleNumber/noc - Update NOC for a vehicle
router.patch('/:vehicleNumber/noc', async (req, res) => {
    const { noc } = req.body;
    const { vehicleNumber } = req.params;

    try {
        const updatedVehicle = await Vehicle.findOneAndUpdate(
            { vehicleNumber: vehicleNumber },
            { $set: { noc: noc } },
            { new: true } 
        );

        if (!updatedVehicle) {
            return res.status(404).json({ message: 'Vehicle not found.' });
        }
        res.status(200).json(updatedVehicle);
    } catch (err) {
        res.status(500).json({ message: 'Error updating NOC', error: err.message });
    }
});

// DELETE /api/vehicles/:vehicleNumber - Delete a vehicle
router.delete('/:vehicleNumber', async (req, res) => {
    const { vehicleNumber } = req.params;

    try {
        const result = await Vehicle.deleteOne({ vehicleNumber: vehicleNumber });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Vehicle not found.' });
        }
        res.status(200).json({ message: `Vehicle ${vehicleNumber} deleted successfully.` });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting vehicle', error: err.message });
    }
});

module.exports = router;
