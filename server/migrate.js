const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DB_PATH = path.join(__dirname, '../data-store/db.json');
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI || MONGODB_URI.includes('PASSWORD')) {
    console.error('❌ Error: Please provide a valid MONGODB_URI in server/.env before running migration.');
    process.exit(1);
}

// --- Schemas (same as index.js for simplicity in script) ---

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
});

const orderSchema = new mongoose.Schema({
    id: String,
    date: Date,
    customer: mongoose.Schema.Types.Mixed,
    items: Array,
    subtotal: Number,
    transportFee: Number,
    total: Number,
    paymentMethod: String,
    paymentConfirmed: Boolean,
    status: String,
    otp: String
});

const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);

async function migrate() {
    try {
        console.log('🔄 Starting migration...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas');

        const dbData = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

        // Migrate Products
        console.log(`📦 Migrating ${dbData.products.length} products...`);
        await Product.deleteMany({}); // Clear existing to avoid duplicates in this one-time task
        await Product.insertMany(dbData.products);
        console.log('✅ Products migrated.');

        // Migrate Orders
        console.log(`📝 Migrating ${dbData.orders.length} orders...`);
        await Order.deleteMany({});
        await Order.insertMany(dbData.orders);
        console.log('✅ Orders migrated.');

        console.log('\n✨ MIGRATION COMPLETE! ✨');
        console.log('You can now start your server with "npm run server"');

        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    }
}

migrate();
