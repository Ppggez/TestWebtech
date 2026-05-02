const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// สั่งให้ Server ส่งไฟล์หน้าเว็บ (HTML, CSS, JS) จากโฟลเดอร์ public
app.use(express.static(path.join(__dirname, 'public')));

// 1. สร้าง Database ใน Memory (หายเมื่อปิด Server) 
// หรือเปลี่ยนเป็น './database/furnish.db' ถ้าต้องการเก็บไฟล์ถาวร
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    console.log("🛠️  Initializing Database...");
    
    // สร้าง Table ให้ตรงกับข้อมูลใน JSON
    db.run("CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT, category TEXT, price REAL, image TEXT, stock INTEGER)");

    // 2. แก้ไข Path ให้ตรงกับที่นายย้ายไปไว้ใน public/data/products.json
    const jsonPath = path.join(__dirname, 'public', 'data', 'products.json');

    try {
        if (!fs.existsSync(jsonPath)) {
            throw new Error(`ไม่พบไฟล์ในตำแหน่ง: ${jsonPath}\nกรุณาตรวจสอบว่ามีโฟลเดอร์ public/data/ และไฟล์ products.json อยู่จริง`);
        }

        const rawData = fs.readFileSync(jsonPath, 'utf8');
        const products = JSON.parse(rawData);
        
        console.log(`📦 เจอสินค้าใน JSON ทั้งหมด ${products.length} รายการ!`);

        // 3. เตรียมคำสั่ง INSERT ข้อมูลลง SQLite
        const stmt = db.prepare("INSERT INTO products (id, name, category, price, image, stock) VALUES (?, ?, ?, ?, ?, ?)");
        products.forEach(p => {
            // ใช้คีย์ 'image' ตามไฟล์ JSON ล่าสุดของคุณ
            stmt.run(p.id, p.name, p.category, p.price, p.image, p.stock || 0);
        });
        stmt.finalize();
        
        console.log("✅ ข้อมูลถูกนำเข้า SQLite เรียบร้อยแล้ว");

    } catch (err) {
        console.error("❌ เกิดข้อผิดพลาดตอน Import ข้อมูล:", err.message);
    }
});

// 4. API สำหรับดึงข้อมูลสินค้าทั้งหมด หรือแยกตามหมวดหมู่
app.get('/api/products', (req, res) => {
    const category = req.query.category;
    let sql = "SELECT * FROM products";
    let params = [];

    // ถ้ามีการส่ง ?category=... มาใน URL[cite: 1]
    if (category && category !== 'all') {
        sql += " WHERE category = ?";
        params.push(category);
    }

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        // ส่งกลับในรูปแบบที่ใช้งานง่าย[cite: 1]
        res.json(rows); 
    });
});

// 5. API สำหรับจำลองการสั่งซื้อ (Checkout)[cite: 1]
app.post('/api/checkout', (req, res) => {
    const { items, total } = req.body;
    console.log('--- Order Received ---');
    console.log('Items:', items);
    console.log('Total:', total);
    res.json({ status: "success", message: "บันทึกคำสั่งซื้อเรียบร้อย!" });
});

app.listen(PORT, () => {
    console.log(`\n🚀 SERVER IS ALIVE!`);
    console.log(`👉 ดูหน้าเว็บได้ที่: http://localhost:${PORT}`);
    console.log(`👉 เช็ค API สินค้าได้ที่: http://localhost:${PORT}/api/products\n`);
});