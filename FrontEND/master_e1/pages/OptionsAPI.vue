<template>
  step0<input type="number" v-model="counter" >
  <h2>{{ title }}</h2>
  <div>
    <H1>step1:{{ counter }}</H1>
    <p>Counter: {{ counter }}</p>
    <p>Double: {{ doubleCounter }}</p>
    <div class="flex gap-2">
       fname<input type="text" v-model="fname">
       lname<input type="text" v-model="lname">
      <button @click="increment">Increment</button>
      ป้อนข้อมูล<input v-model="counter" type="number" />
    </div>
  </div>
</template>

<script>
export default {
  layout: 'admin',
  name: '',
  props: {
    title: {
      type: String,
      required: true,
    },
  },
  emits: {
    counterChanged: (value) => typeof value === "number",
  },
  data() {
    return {
      counter: 0,
    };
  },
  computed: {
    doubleCounter() {
      return this.counter * 4;
    },
  },
  watch: {
    counter(newValue, oldValue) {
      console.log(`Counter changed from ${oldValue} to ${newValue}`);
      this.$emit("counterChanged", newValue); // Emit event
    },
  },
  mounted() {
    console.log("เริ่ม load");
  },
  methods: {

    increment() {
      this.counter = this.counter + 1;
      console.log('ชื่อ=',this.fname)
      console.log('นามสกุล=',this.lname)
    },
  },
};
</script>
