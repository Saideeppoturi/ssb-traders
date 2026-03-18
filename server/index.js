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
let isConnected = false;
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB Atlas');
        isConnected = true;
    })
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
        console.warn('⚠️ Server will fallback to local db.json for data store.');
    });

// --- Local DB Fallback Helpers ---
const DB_PATH = path.join(__dirname, '../data-store/db.json');

const getLocalData = (collection) => {
    try {
        const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
        return data[collection] || [];
    } catch (err) {
        console.error(`❌ Error reading local ${collection}:`, err.message);
        return [];
    }
};

const saveLocalData = (collection, newData) => {
    try {
        const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
        data[collection] = newData;
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error(`❌ Error saving local ${collection}:`, err.message);
        return false;
    }
};

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
        if (isConnected) {
            const products = await Product.find();
            return res.json(products);
        } else {
            console.log('ℹ️ Fetching products from local db.json fallback.');
            return res.json(getLocalData('products'));
        }
    } catch (err) {
        console.error("Fetch products error:", err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// POST update product (Inventory Batch Update)
app.post('/api/products/update', async (req, res) => {
    try {
        if (isConnected) {
            await Product.deleteMany({});
            await Product.insertMany(req.body);
            return res.json({ success: true });
        } else {
            console.log('ℹ️ Updating products in local db.json fallback.');
            const success = saveLocalData('products', req.body);
            return res.json({ success });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to update products', details: err.message });
    }
});

// GET all orders
app.get('/api/orders', async (req, res) => {
    try {
        if (isConnected) {
            const orders = await Order.find().sort({ date: -1 });
            return res.json(orders);
        } else {
            const orders = getLocalData('orders').sort((a, b) => new Date(b.date) - new Date(a.date));
            return res.json(orders);
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// GET single order by ID
app.get('/api/orders/:id', async (req, res) => {
    try {
        if (isConnected) {
            const order = await Order.findOne({ id: req.params.id });
            if (!order) return res.status(404).json({ error: 'Order not found' });
            return res.json(order);
        } else {
            const orders = getLocalData('orders');
            const order = orders.find(o => o.id === req.params.id);
            if (!order) return res.status(404).json({ error: 'Order not found' });
            return res.json(order);
        }
    } catch (err) {
        res.status(500).json({ error: 'Error fetching order' });
    }
});

// POST new order
app.post('/api/orders', async (req, res) => {
    try {
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const newOrderId = `SSB-${Date.now()}`;
        const orderData = {
            ...req.body,
            id: newOrderId,
            otp: otp,
            date: new Date().toISOString(),
            paymentConfirmed: req.body.paymentMethod === 'onsite' ? true : false,
            status: 'Pending'
        };

        if (isConnected) {
            const newOrder = new Order(orderData);
            await newOrder.save();
            return res.json({ success: true, order: newOrder });
        } else {
            const orders = getLocalData('orders');
            orders.unshift(orderData);
            saveLocalData('orders', orders);
            return res.json({ success: true, order: orderData });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to create order', details: err.message });
    }
});

// PATCH order status
app.get('/api/orders', (req, res) => {
    res.json(BANK_DETAILS);
});

// PATCH order status
app.patch('/api/orders/:id/status', async (req, res) => {
    try {
        const validStatuses = ['Pending', 'Confirmed', 'Dispatched', 'Delivered'];
        const newStatus = req.body.status;
        if (!validStatuses.includes(newStatus)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        if (isConnected) {
            const order = await Order.findOneAndUpdate(
                { id: req.params.id },
                { status: newStatus },
                { new: true }
            );
            if (!order) return res.status(404).json({ error: 'Order not found' });
            return res.json({ success: true, order });
        } else {
            const orders = getLocalData('orders');
            const index = orders.findIndex(o => o.id === req.params.id);
            if (index === -1) return res.status(404).json({ error: 'Order not found' });
            orders[index].status = newStatus;
            saveLocalData('orders', orders);
            return res.json({ success: true, order: orders[index] });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// POST confirm payment
app.post('/api/orders/:id/confirm-payment', async (req, res) => {
    try {
        if (isConnected) {
            const order = await Order.findOneAndUpdate(
                { id: req.params.id },
                { paymentConfirmed: true },
                { new: true }
            );
            if (!order) return res.status(404).json({ error: 'Order not found' });
            return res.json({ success: true, order });
        } else {
            const orders = getLocalData('orders');
            const index = orders.findIndex(o => o.id === req.params.id);
            if (index === -1) return res.status(404).json({ error: 'Order not found' });
            orders[index].paymentConfirmed = true;
            saveLocalData('orders', orders);
            return res.json({ success: true, order: orders[index] });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to confirm payment' });
    }
});

// POST verify OTP
app.post('/api/orders/:id/verify-otp', async (req, res) => {
    try {
        if (isConnected) {
            const order = await Order.findOne({ id: req.params.id });
            if (!order) return res.status(404).json({ error: 'Order not found' });

            if (order.otp === req.body.otp) {
                order.status = 'Delivered';
                await order.save();
                return res.json({ success: true, message: 'OTP verified. Order marked as Delivered.' });
            } else {
                return res.status(400).json({ error: 'Invalid OTP' });
            }
        } else {
            const orders = getLocalData('orders');
            const index = orders.findIndex(o => o.id === req.params.id);
            if (index === -1) return res.status(404).json({ error: 'Order not found' });

            if (orders[index].otp === req.body.otp) {
                orders[index].status = 'Delivered';
                saveLocalData('orders', orders);
                return res.json({ success: true, message: 'OTP verified. Order marked as Delivered.' });
            } else {
                return res.status(400).json({ error: 'Invalid OTP' });
            }
        }
    } catch (err) {
        res.status(500).json({ error: 'Error verifying OTP' });
    }
});

app.listen(PORT, () => {
    console.log(`Shared API Server running on port ${PORT}`);
    console.log('Using MongoDB Atlas for data storage.');
});
