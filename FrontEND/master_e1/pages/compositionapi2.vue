<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="4">
        <v-text-field v-model="firstname" label="First name"></v-text-field>
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="lastname"
          label="Last name"
          required
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field v-model="email" label="E-mail"></v-text-field>
      </v-col>
    </v-row>
    <v-btn class="mt-2" type="submit" block @click="login">Login</v-btn>
  </v-container>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router"; // สำหรับการนำทางด้วย router

// การใช้งาน Vue Router
const router = useRouter();

const firstname = ref("");
const lastname = ref("");
const email = ref("");

const login = async () => {
  console.log("Login");
  const dataMember = {
    firstname: firstname.value, // เข้าถึงค่าด้วย .value
    lastname: lastname.value,
    email: email.value,
  };
  console.log("dataMember=", dataMember);
  const response = await axios.get("http://localhost:7000?f="+firstname.value);
  const data = response.data;
};
</script>
