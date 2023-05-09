<template>
  <div class="about">
    <n-h1>Create a new agent</n-h1>

    <n-divider />
    <div class="form-box">
      <div style="width: 100%">
        <n-form-item label="Agent Type">
          <n-select v-model:value="tempid" :options="options"></n-select>
        </n-form-item>
      </div>
      <div style="width: 100%">
        <AgentInner :id="tempid" v-if="tempid != ''" />
      </div>
      <n-divider/>
      <n-button @click="$router.go(-1)"
        >Back<template #icon>
          <n-icon> <ArrowBack /> </n-icon></template
      ></n-button>
    </div>
    <div style="width: calc(100% - 500px); display: inline-block"></div>
  </div>
</template>
<script setup lang="tsx">
import AgentInner from "@/components/AgentInner.vue";
import { ArrowBackFilled as ArrowBack } from "@vicons/material";
import detector from "element-resize-detector";
import { ref, reactive, watch } from "vue";
const tempid = ref("");
const det = detector();
const options = ref([
  { label: "Schedule Agent", value: 1 },
  { label: "Http Agent", value: 2 },
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
