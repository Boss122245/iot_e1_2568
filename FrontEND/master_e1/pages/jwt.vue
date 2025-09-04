<template>
  <div>
    <h2>Login</h2>
    <form @submit.prevent="login">
      <input v-model="username" placeholder="Username" />
      <input v-model="password" type="password" placeholder="Password" />
      <button type="submit">Login</button>
    </form>
    <div v-if="token">
      <p>JWT Token: {{ token }}</p>
    </div>
    <div v-if="error">
      <p style="color:red">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const username = ref('')
const password = ref('')
const token = ref('')
const error = ref('')

const login = async () => {
  error.value = ''
  try {
    const res = await axios.post('http://localhost:3000/api/login', {
      username: username.value,
      password: password.value
    })
    token.value = res.data.token
  } catch (err) {
    console.error(err)
    error.value = 'Login failed. Please check your credentials.'
  }
  } 
  </script>
