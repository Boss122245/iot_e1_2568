const express = require("express");
const mqtt = require("mqtt");
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "123456"; // !ควรเก็บไว้ใน .evn

const app = express();
const port = 7000;
const cors = require("cors");
app.use(cors());


function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer xxx"

  if (!token) return res.status(401).json({ message: "Missing token" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
}


const db = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "123456",
  database: 'iot68_e1'
});

const MQTT_SERVER = "mqtt://broker.hivemq.com";
const temp = "panupong/sensor/temp";
const hue = "panupong/sensor/hue";

const mqtt_id = "panupong" + Math.random().toString(16).substr(2, 8);
console.log(`กำลังเชื่อมต่อไปยัง MQTT Broker ที่: ${MQTT_SERVER}`);
const client = mqtt.connect(MQTT_SERVER, { clientId: mqtt_id });
client.on("connect", () => {
  console.log("เชื่อมต่อกับ MQTT Broker สำเร็จแล้ว!");
  client.subscribe("panupong/temp")
  client.subscribe("panupong/hue")
  client.subscribe([temp, hue], (err) => {
    if (!err) {
      console.log(`ตอนนี้กำลังฟังข้อมูลจากหัวข้อ: '${temp}' และ '${hue}'`);
    } else {
      console.error("เกิดข้อผิดพลาดในการสมัครฟังหัวข้อ:", err);
    }
  });
});

client.on('message', (topic, message) => {
   const msg = message.toString();
     const sensor1 = [27,69]
    const panupongsensor1 = JSON.stringify(sensor1)
    if (topic === temp) {
        console.log(`[อุณหภูมิ]: ${msg} °C`);
        // client.publish("repanupong/sensor/tempreture","32")
        client.publish("repanupong/sensor/temp",panupongsensor1)

    } else if (topic === hue) {
        console.log(`[ความชื้น]: ${msg} %`);
        client.publish("repanupong/sensor/hue","50")
    } else {
        console.log(`ได้รับข้อความจากหัวข้อที่ไม่รู้จัก ('${topic}'): ${msg}`);
    }
});

client.on('error', (err) => {
    console.error('เกิดข้อผิดพลาดกับ MQTT:', err);
});
client.on('disconnect', () => {
    console.log('ตัดการเชื่อมต่อจาก MQTT Broker แล้ว.');
});

app.use(express.json());

app.delete("/delete-user/:id", async (req, res) => {
  const userId = req.params.id;   
  try {
    const [result] = await db.query("DELETE FROM users WHERE id = ?", [userId]);
    console.log("ผลลัพธ์การลบ:", result); 
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้ที่ต้องการลบ" });
    }
    res.status(200).json({ message: "ลบข้อมูลผู้ใช้สำเร็จ" });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการลบข้อมูลผู้ใช้:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "เกิดข้อผิดพลาดในการลบข้อมูลผู้ใช้",
    });
  }
});

app.post("/edit-user/:id", async (req, res) => {
  const userId = req.params.id;
  const { email, password, status, dep } = req.body;
  try {
    const [result] = await db.query(
      "UPDATE users SET email = ?, password = ?, status = ?, dep = ? WHERE id = ?",
      [email, password, status, dep, userId]
    );
    console.log("ผลลัพธ์การแก้ไข:", result);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้ที่ต้องการแก้ไข" });
    }
    res.status(200).json({ message: "แก้ไขข้อมูลผู้ใช้สำเร็จ" });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการแก้ไขข้อมูลผู้ใช้:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "เกิดข้อผิดพลาดในการแก้ไขข้อมูลผู้ใช้",
    });
  }
})

app.post("/insert", async (req, res) => {
  console.log(req.body);

  try {
    const { email, password, status, dep } = req.body;
    const [result] = await db.query(
      "INSERT INTO users (email, password, status, dep) VALUES (?, ?, ?, ?)",
      [email, password, status, dep]
    );
    res.status(200).json({
      status: "ok",
      result: result,
    });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการเพิ่มข้อมูล:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "เกิดข้อผิดพลาดในการเพิ่มข้อมูล",
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    console.log("req.body");
    console.log(req.body);
    const rows = await db.query(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [req.body.email, req.body.password]
    );
    console.log("rows:", rows[0]);
    console.log("rows.length:", rows[0].length);
    if (rows[0].length === 0) {
      return res.status(401).json({
        status: "error",
        message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
      });
    }
    console.log("เข้าสู่ระบบสำเร็จ");
    const user = rows[0][0];
    console.log("user:", user); //แก้ log ด้วย
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" }); // ✅
    console.log("token=",token)
    res.status(200).json({
      status: "ok",
      data: rows[0],
      token: token ,
      message: "เข้าสู่ระบบสำเร็จ",
    });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการเข้าสู่ระบบ:", error);
    res.status(500).json({
      status: "error",
      message: error || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ",
    });
  }
});

app.get("/",authenticateToken, async (req, res) => {
  const [rows] = await db.query("SELECT * FROM users");
  console.log("ข้อมูลที่ดึงมา:", rows);
  res.json(rows);
});
// http://localhost:7000/list?fname=alonkorn
app.get("/list", (req, res) => {
  console.log(req.query);
  res.send({
    data: req.query.fname,
    status: true,
  });
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});