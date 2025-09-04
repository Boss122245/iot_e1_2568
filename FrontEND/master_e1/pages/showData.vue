<template>
  <div class="user-dashboard">
    <!-- Header -->
    <v-app-bar flat color="green-lighten-5" class="header-bar">
      <v-toolbar-title class="title">
        <v-icon color="green-darken-3" start>mdi-leaf</v-icon>
        ระบบจัดการสมาชิก
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn
        color="green-darken-2"
        class="me-2"
        variant="flat"
        rounded
        @click="goDashboard"
      >
        <v-icon start>mdi-view-dashboard</v-icon>
        Dashboard
      </v-btn>

      <v-btn
        color="red-darken-2"
        class="me-2"
        variant="flat"
        rounded
        @click="logout"
      >
        <v-icon start>mdi-logout</v-icon>
        Logout
      </v-btn>

      <v-btn
        color="green-accent-4"
        class="me-2"
        variant="elevated"
        rounded
        prepend-icon="mdi-plus"
        @click="add"
      >
        เพิ่มสมาชิก
      </v-btn>
    </v-app-bar>

    <!-- Data Table -->
    <v-container class="mt-6">
      <v-card rounded="lg" elevation="2">
        <v-data-table
          :headers="headers"
          :items="books"
          class="custom-table"
          :hide-default-footer="books.length < 11"
        >
          <!-- Actions -->
          <template v-slot:item.actions="{ item }">
            <div class="d-flex justify-end">
              <v-btn icon variant="text" color="blue-darken-2" @click="edit(item.id)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn icon variant="text" color="red-darken-1" @click="remove(item.id)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </div>
          </template>

          <!-- No Data -->
          <template v-slot:no-data>
            <div class="text-center pa-4">
              <v-icon size="40" color="grey-lighten-1">mdi-database-remove</v-icon>
              <div class="mt-2 mb-4">ไม่มีข้อมูล</div>
              <v-btn
                color="green-darken-2"
                prepend-icon="mdi-backup-restore"
                variant="outlined"
                rounded
                @click="reset"
              >
                โหลดข้อมูลใหม่
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-card>
    </v-container>

    <!-- Dialog -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card rounded="lg" elevation="4">
        <v-card-title class="text-h6 d-flex align-center">
          <v-icon class="me-2" color="green-darken-2">
            {{ isEditing ? 'mdi-pencil' : 'mdi-account-plus' }}
          </v-icon>
          {{ isEditing ? 'แก้ไขสมาชิก' : 'เพิ่มสมาชิกใหม่' }}
        </v-card-title>

        <v-card-text>
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                v-model="record.email"
                label="E-mail"
                prepend-inner-icon="mdi-email"
                clearable
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="record.password"
                label="Password"
                type="password"
                prepend-inner-icon="mdi-lock"
                clearable
              />
            </v-col>

            <v-col cols="12">
              <v-select
                v-model="record.status"
                label="Status"
                :items="['1', '0']"
                prepend-inner-icon="mdi-check-circle"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="record.dep"
                label="Department"
                prepend-inner-icon="mdi-office-building"
                clearable
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="justify-end">
          <v-btn variant="text" color="grey" @click="dialog = false">ยกเลิก</v-btn>
          <v-btn color="green-darken-2" @click="save">บันทึก</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      books: [],
      dialog: false,
      isEditing: false,
      record: { email: "", password: "", status: "1", dep: "" },
      headers: [
        { title: "ID", key: "id", align: "start" },
        { title: "E-mail", key: "email" },
        { title: "Password", key: "password" },
        { title: "Status", key: "status" },
        { title: "Department", key: "dep" },
        { title: "Actions", key: "actions", align: "end", sortable: false },
      ],
    };
  },

  async mounted() {
    const token = localStorage.getItem("token");
    if (!token) {
      this.$router.push("/login");
    }
    await this.loadData();
  },

  methods: {
    async loadData() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:7000/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.books = response.data;
      } catch (error) {
        console.error("Error loading data:", error);
      }
    },

    goDashboard() {
      this.$router.push("/dashboard");
    },

    logout() {
      localStorage.removeItem("token");
      this.$router.push("/login");
    },

    add() {
      this.isEditing = false;
      this.record = { email: "", password: "", status: "1", dep: "" };
      this.dialog = true;
    },

    edit(id) {
      this.isEditing = true;
      const found = this.books.find((b) => b.id === id);
      this.record = { ...found };
      this.dialog = true;
    },

    async remove(id) {
      const confirmDelete = window.confirm("คุณแน่ใจว่าต้องการลบผู้ใช้นี้หรือไม่?");
      if (!confirmDelete) return;

      try {
        await axios.delete(`http://localhost:7000/delete-user/${id}`);
        await this.loadData();
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    },

    async save() {
      try {
        if (this.isEditing) {
          await axios.post(`http://localhost:7000/edit-user/${this.record.id}`, this.record, {
            headers: { "Content-Type": "application/json" },
          });
        } else {
          await axios.post("http://localhost:7000/insert", this.record, {
            headers: { "Content-Type": "application/json" },
          });
        }
        this.dialog = false;
        await this.loadData();
      } catch (error) {
        console.error("Error saving user:", error);
      }
    },

    reset() {
      this.dialog = false;
      this.record = { email: "", password: "", status: "1", dep: "" };
      this.loadData();
    },
  },
};
</script>

<style scoped>
.user-dashboard {
  background: linear-gradient(to bottom right, #f0fdf4, #e8f5e9);
  min-height: 100vh;
  font-family: system-ui, sans-serif;
}

.header-bar {
  border-bottom: 1px solid #c8e6c9;
}

.title {
  font-weight: 600;
  color: #2e7d32;
}

/* Table */
.custom-table {
  background: white;
  border-radius: 12px;
}

.v-data-table-header {
  background-color: #e0f2f1 !important;
  color: #004d40 !important;
  font-weight: 600;
}
</style>
