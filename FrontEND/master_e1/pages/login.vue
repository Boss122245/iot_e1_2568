<template>
  <v-app>
    <v-main class="login-page">
      <v-container class="d-flex align-center justify-center fill-height">
        <v-card class="login-card" elevation="12">
          <v-card-title class="title-text">
            🔐 Welcome Back
          </v-card-title>

          <v-card-text>
            <v-form ref="form" v-model="isValid">
              <!-- Email -->
              <v-text-field
                v-model="email"
                :rules="[rules.required, rules.email]"
                label="Email Address"
                placeholder="you@example.com"
                prepend-inner-icon="mdi-email-outline"
                variant="outlined"
                rounded
                clearable
                class="mb-4"
              ></v-text-field>

              <!-- Password -->
              <v-text-field
                v-model="password"
                :rules="[rules.required]"
                label="Password"
                placeholder="••••••••"
                type="password"
                prepend-inner-icon="mdi-lock-outline"
                variant="outlined"
                rounded
                clearable
              ></v-text-field>

              <!-- Buttons -->
              <v-btn
                class="mt-6 neon-btn"
                color="cyan accent-4"
                block
                size="large"
                rounded
                :disabled="!isValid"
                @click="doLogin"
              >
                Sign In
              </v-btn>
              <v-btn
                class="mt-3 reset-btn"
                block
                size="large"
                rounded
                variant="outlined"
                @click="reset"
              >
                Clear
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      email: "",
      password: "",
      isValid: false,
      rules: {
        required: (v) => !!v || "This field is required",
        email: (v) =>
          /.+@.+\..+/.test(v) || "E-mail must be valid",
      },
    };
  },
  methods: {
    async doLogin() {
      try {
        const res = await axios.post("http://localhost:7000/login", {
          email: this.email,
          password: this.password,
        });

        if (res.data.status === "ok") {
          localStorage.setItem("token", res.data.token);
          alert("Login successful!");
          this.$router.push("/showData");
        } else {
          alert("Invalid email or password.");
          this.reset();
        }
      } catch (err) {
        console.error(err);
        alert("Server error. Please try again later.");
      }
    },
    reset() {
      this.email = "";
      this.password = "";
    },
  },
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a2a3a, #1f1f2f);
  font-family: "Segoe UI", sans-serif;
}

.login-card {
  width: 400px;
  padding: 2.2rem;
  border-radius: 18px;
  backdrop-filter: blur(18px);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  text-align: center;
}

.title-text {
  justify-content: center;
  font-size: 1.7rem;
  font-weight: bold;
  color: #00eaff;
  text-shadow: 0 0 10px #00eaff, 0 0 30px #00eaff;
  margin-bottom: 1.5rem;
}

/* Neon Button */
.neon-btn {
  color: #fff;
  font-weight: bold;
  box-shadow: 0 0 10px rgba(0, 234, 255, 0.6);
  transition: 0.3s ease;
}
.neon-btn:hover {
  box-shadow: 0 0 25px rgba(0, 234, 255, 1);
}

/* Reset Button */
.reset-btn {
  border-color: rgba(255, 255, 255, 0.4);
  color: #ccc;
  transition: 0.3s ease;
}
.reset-btn:hover {
  color: #fff;
  border-color: #fff;
}
</style>