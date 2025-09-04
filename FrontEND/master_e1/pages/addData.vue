<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="4">
        <v-text-field v-model="email" label="E-mail"></v-text-field>
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field v-model="password" label="Password"></v-text-field>
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field v-model="status" label="Last name"></v-text-field>
      </v-col>
      <v-col cols="12" md="4">
        <input type="file" @change="onFileChange" />
      </v-col>
    </v-row>
    <v-btn class="mt-2" type="submit" block @click="addMember">SAVE</v-btn>
  </v-container>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router"; // สำหรับการนำทางด้วย router

// การใช้งาน Vue Router
const router = useRouter();
const email = ref("");
const password = ref("");
const status = ref("");
const file = ref(null);

const onFileChange = (e) => {
  file.value = e.target.files[0];
};

const addMember = async () => {
  console.log("Login");
  const formData = new FormData();
  formData.append("email", email.value); // เข้าถึงค่าด้วย .value
  formData.append("password", password.value);
  formData.append("status", status.value);
  formData.append("photo", file.value);

  console.log("dataMember=", formData);
  try {
    const response = await axios.post(
      "http://localhost:7000/add-user",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data", // ให้ axios ตั้ง header ที่ถูกต้อง
        },
      }
    );
    console.log("✅ Upload success:", response.data);
  } catch (err) {
    console.error("❌ Upload failed:", err);
  }
};
</script>
