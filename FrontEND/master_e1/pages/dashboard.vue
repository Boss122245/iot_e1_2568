<template>
  <v-app>
    <v-main class="dashboard-nature">
      <v-container>
        <!-- Header -->
        <header class="header d-flex align-center justify-space-between">
          <h1 class="title">🌱 Nature Power Control</h1>
          <v-btn class="btn-back" color="teal-darken-4" variant="flat" @click="$router.push('/showData')">
            <v-icon size="20" class="mr-1">mdi-arrow-left</v-icon>
            กลับ
          </v-btn>
        </header>

        <!-- Status Section -->
        <section class="status-wrapper d-flex flex-column align-center my-12">
          <div class="status-card" :class="{ on: power==='1' }">
            <v-icon class="status-icon pulse" size="110">
              {{ power==='1' ? 'mdi-white-balance-sunny' : 'mdi-weather-night' }}
            </v-icon>
            <p class="status-text">
              {{ power==='1' ? 'แสงไฟพร้อมใช้งาน 🌞' : 'พักผ่อนเถอะ 🌙' }}
            </p>
          </div>
        </section>

        <!-- Switch Control -->
        <section class="switch-control d-flex justify-center">
          <v-switch
            v-model="powerSwitch"
            inset
            color="lime-accent-4"
            hide-details
            class="switch-nature"
            @change="togglePower"
          >
            <template #label>
              <span class="switch-label">
                {{ power==='1' ? 'ปิดพลังงาน' : 'เปิดพลังงาน' }}
              </span>
            </template>
          </v-switch>
        </section>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import mqtt from "mqtt";

export default {
  data() {
    return {
      power: "0",
      powerSwitch: false,
      client: null,
      isConnected: false,
      POWER_TOPIC: "copter",
      POWER_RESP: "re_copter",
      MQTT_SERVER: "ws://broker.hivemq.com:8000/mqtt",
    };
  },
  mounted() {
    this.connectMQTT();
  },
  beforeUnmount() {
    if (this.client) this.client.end();
  },
methods: {
  // -------------------------------
  // ฟังก์ชันเชื่อมต่อ MQTT Broker
  // -------------------------------
  connectMQTT() {
    // สร้าง client MQTT และเชื่อมต่อไปยัง server ที่กำหนด
    this.client = mqtt.connect(this.MQTT_SERVER);

    // Event: เมื่อเชื่อมต่อกับ MQTT broker สำเร็จ
    this.client.on("connect", () => {
      this.isConnected = true; // อัพเดตสถานะว่าเชื่อมต่อสำเร็จ //เป็นการ อัพเดตตัวแปรใน Vue component ว่า “เราเชื่อมต่อกับ MQTT broker สำเร็จแล้ว”
      // สมัคร (subscribe) topic สำหรับรอรับสถานะไฟจาก ESP32
      this.client.subscribe(this.POWER_RESP);
    });

    // Event: เมื่อมีข้อความเข้ามาที่ client
    this.client.on("message", (topic, msg) => {
      // เช็คว่า topic ที่เข้ามาเป็น topic ที่เราสนใจหรือไม่
      if (topic === this.POWER_RESP) {
        // แปลงข้อความจาก byte เป็น string ("0" หรือ "1")
        this.power = msg.toString();
        // อัพเดต switch ใน UI ให้ตรงกับสถานะจริง
        this.powerSwitch = this.power === "1";
      }
    });

    // Event: หากเกิดข้อผิดพลาดจาก MQTT
    this.client.on("error", (err) => console.error("MQTT Error:", err));
  },

  // -------------------------------
  // ฟังก์ชันสลับสถานะไฟ (เปิด/ปิด)
  // -------------------------------
  togglePower() {
    // แปลงค่าของ switch (true/false) → "1" หรือ "0"
    const val = this.powerSwitch ? "1" : "0";

    // เช็คว่ามี client และเชื่อมต่ออยู่
    if (this.client && this.client.connected) {
      // ส่งข้อความไปที่ topic ของ ESP32 เพื่อเปิด/ปิดไฟ
      // qos: 1 → รับประกันส่งอย่างน้อยหนึ่งครั้ง
      // retain: true → broker เก็บข้อความล่าสุดไว้
      this.client.publish(this.POWER_TOPIC, val, { qos: 1, retain: true });

      // อัพเดตสถานะไฟใน UI ให้ตรงกับค่าที่ส่งไปทันที
      this.power = val;
    }
  },
},

};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;500;700&display=swap');

.dashboard-nature {
  min-height: 100vh;
  background: linear-gradient(135deg, #1b1f1c, #234e38);
  color: #e0f2f1;
  font-family: 'Prompt', sans-serif;
  padding: 2rem;
}

/* Header */
.header {
  margin-bottom: 2.5rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1rem;
}
.title {
  font-size: 2rem;
  font-weight: 700;
  color: #b9f6ca;
}
.btn-back {
  border-radius: 12px;
  font-size: 0.9rem;
  text-transform: none;
  background: #004d40;
  color: #b2dfdb;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
}

/* Status Section */
.status-wrapper { text-align: center; }
.status-card {
  background: #2e3b32;
  padding: 2rem;
  border-radius: 24px;
  width: 300px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.25);
  transition: all 0.4s ease-in-out;
}
.status-card.on {
  background: #4caf50;
}
.status-icon {
  color: #c8e6c9;
  margin-bottom: 1rem;
  transition: transform 0.3s ease;
}
.status-card.on .status-icon {
  color: #ffd600;
}
.status-text {
  font-size: 1.2rem;
  font-weight: 600;
  color: #ffffff;
}
.pulse {
  animation: pulse 1.5s infinite;
}

/* Switch Control */
.switch-control {
  margin-top: 3rem;
}
.switch-nature {
  transform: scale(1.5);
}
.switch-label {
  font-weight: 600;
  font-size: 1rem;
  color: #b9f6ca;
}

/* Animation */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
</style>