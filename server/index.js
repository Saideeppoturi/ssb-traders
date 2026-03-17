const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(bodyParser.json());

// --- MongoDB Configuration ---
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
        console.warn('⚠️ Server running WITHOUT database connection. Ensure MONGODB_URI is correct in .env');
    });

// --- Schemas & Models ---

const productSchema = new mongoose.Schema({
    id: String,
    name: String,
    category: String,
    price: Number,
    stock: Number,
    unit: String,
    image: String,
    description: String,
    details: [String]
}, { timestamps: true });

const Order = mongoose.model('Order', new mongoose.Schema({
    id: { type: String, unique: true },
    date: { type: Date, default: Date.now },
    customer: {
        name: String,
        phone: String,
        address: String,
        location: mongoose.Schema.Types.Mixed
    },
    items: [{
        id: String,
        name: String,
        price: Number,
        quantity: Number,
        unit: String
    }],
    subtotal: Number,
    transportFee: Number,
    total: Number,
    paymentMethod: String,
    paymentConfirmed: Boolean,
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Dispatched', 'Delivered'],
        default: 'Pending'
    },
    otp: String
}, { timestamps: true }));

const Product = mongoose.model('Product', productSchema);

// --- Bank Details Config ---
const BANK_DETAILS = {
    accountName: "Sri Sai Balaji Traders",
    accountNumber: "1234567890",
    ifscCode: "SBIN0001234",
    bankName: "State Bank of India",
    branch: "Sangareddy Branch",
    upiId: "ssbtraders@sbi"
};

// --- API Endpoints ---

// GET bank details
app.get('/api/bank-details', (req, res) => {
    res.json(BANK_DETAILS);
});

// GET products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// POST update product (Inventory Batch Update)
app.post('/api/products/update', async (req, res) => {
    try {
        // This endpoint currently replaces the whole set in local DB logic
        // For MongoDB, we'll clear and insert, or update matching ones.
        // Given the manager app's current behavior (sending the whole list), we'll do an upsert or replace.
        // For efficiency, we'll use bulk operations or simply replace the collection if that's the intent.

        // Simple implementation: clear and re-insert (not ideal but matches previous fs.write logic)
        await Product.deleteMany({});
        await Product.insertMany(req.body);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update products', details: err.message });
    }
});

// GET all orders
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ date: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// GET single order by ID
app.get('/api/orders/:id', async (req, res) => {
    try {
        const order = await Order.findOne({ id: req.params.id });
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching order' });
    }
});

// POST new order
app.post('/api/orders', async (req, res) => {
    try {
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const newOrder = new Order({
            ...req.body,
            id: `SSB-${Date.now()}`,
            otp: otp,
            paymentConfirmed: req.body.paymentMethod === 'onsite' ? true : false,
        });
        await newOrder.save();
        res.json({ success: true, order: newOrder });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create order', details: err.message });
    }
});

// PATCH order status
app.patch('/api/orders/:id/status', async (req, res) => {
    try {
        const validStatuses = ['Pending', 'Confirmed', 'Dispatched', 'Delivered'];
        const newStatus = req.body.status;
        if (!validStatuses.includes(newStatus)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const order = await Order.findOneAndUpdate(
            { id: req.params.id },
            { status: newStatus },
            { new: true }
        );
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// POST confirm payment
app.post('/api/orders/:id/confirm-payment', async (req, res) => {
    try {
        const order = await Order.findOneAndUpdate(
            { id: req.params.id },
            { paymentConfirmed: true },
            { new: true }
        );
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ error: 'Failed to confirm payment' });
    }
});

// POST verify OTP
app.post('/api/orders/:id/verify-otp', async (req, res) => {
    try {
        const order = await Order.findOne({ id: req.params.id });
        if (!order) return res.status(404).json({ error: 'Order not found' });

        if (order.otp === req.body.otp) {
            order.status = 'Delivered';
            await order.save();
            res.json({ success: true, message: 'OTP verified. Order marked as Delivered.' });
        } else {
            res.status(400).json({ error: 'Invalid OTP' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error verifying OTP' });
    }
});

app.listen(PORT, () => {
    console.log(`Shared API Server running on port ${PORT}`);
    console.log('Using MongoDB Atlas for data storage.');
});
