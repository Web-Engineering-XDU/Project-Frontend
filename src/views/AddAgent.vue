<template>
  <div class="about">
    <n-h1>Create a new agent</n-h1>

    <n-divider />
    <div class="form-box">
      <div style="width: 100%">
        <n-form-item label="Agent Type">
          <n-select :options="options"></n-select>
        </n-form-item>
      </div>
      <div style="width: 100%"></div>
      <n-button @click="$router.go(-1)"
        >Back<template #icon>
          <n-icon> <ArrowBack /> </n-icon></template
      ></n-button>
    </div>
  </div>
</template>
<script setup lang="tsx">
import { ArrowBackFilled as ArrowBack } from "@vicons/material";
import { ref } from "vue";
const options = ref([
  { label: "Schedule Agent", value: "1" },
  { label: "Http Agent", value: "2" },
]);
</script>
<style scoped>
.about {
  padding-top: 20px;
}

.svg {
  height: 30px !important;
  width: 30px !important;
  margin-top: -20px !important;
}

.form-box {
  width: 500px;
  max-width: 90vw;
  flex-wrap: wrap;
  display: inline-flex;
  justify-content: flex-start;
  margin: 0 auto;
}
</style>
