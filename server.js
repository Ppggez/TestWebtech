const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 1. ประกาศตัวแปร db ไว้ที่ชั้นนอกสุดเพื่อให้ทุกส่วนเข้าถึงได้
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    console.log("🛠️  Initializing Database...");
    
    // สร้าง Table
    db.run("CREATE TABLE products (id INT, name TEXT, category TEXT, price REAL, image TEXT, stock INT)");

    // 2. ระบุ Path (ใช้ Path ที่ระบบแจ้งว่าเจอไฟล์)
    const jsonPath = path.join(__dirname, 'furnish-1.0.0', 'data', 'products.json');

    try {
        if (!fs.existsSync(jsonPath)) {
            throw new Error(`ไม่พบไฟล์ในตำแหน่ง ${jsonPath}`);
        }

        const rawData = fs.readFileSync(jsonPath, 'utf8');
        const products = JSON.parse(rawData);
        
        console.log(`📦 เจอสินค้าทั้งหมด ${products.length} รายการ!`);

        // 3. เตรียมคำสั่ง INSERT
        const stmt = db.prepare("INSERT INTO products VALUES (?, ?, ?, ?, ?, ?)");
        products.forEach(p => {
            stmt.run(p.id, p.name, p.category, p.price, p.image, p.stock || 0);
        });
        stmt.finalize();
        
        console.log("✅ ข้อมูลถูกนำเข้า SQLite เรียบร้อยแล้ว");
        console.log("🚀 SERVER IS ALIVE!");

    } catch (err) {
        console.error("❌ เกิดข้อผิดพลาด:", err.message);
    }
});

// 4. API Endpoint สำหรับดึงข้อมูล
app.get('/api/products', (req, res) => {
    const category = req.query.category;
    let sql = "SELECT * FROM products";
    let params = [];

    if (category) {
        sql += " WHERE category = ?";
        params.push(category);
    }

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "success", data: rows });
    });
});

app.listen(PORT, () => {
    console.log(`👉 API URL: http://localhost:${PORT}/api/products`);
});