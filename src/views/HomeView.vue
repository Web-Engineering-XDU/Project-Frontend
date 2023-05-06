<script setup lang="tsx">
import { useCounterStore } from "../stores/counter";
const store = useCounterStore();
</script>

<template>
  <div style="padding-top: 20px">
    <div v-if="store.logged">
      <n-h1 prefix="bar">
        <n-text type="primary"> Welcome to use </n-text>
      </n-h1>
      <n-divider />
      <n-h3>Info</n-h3>
      <div>
        You have created
        <div style="display: inline-block; color: #2080f0">{{ 1 }}</div>
        agents.
      </div>
      <n-button strong secondary type="primary" style="margin-top: 10px"> View </n-button>
      <div style="margin-top: 50px">
        Your agents have recorded
        <div style="display: inline-block; color: #2080f0">{{ 1 }}</div>
        events recently and {{ 2 }} events in total.
      </div>
      <n-button strong secondary type="primary" style="margin-top: 10px"> View </n-button>
      <n-h3 style="margin-top: 60px">Recent event</n-h3>
      Not found.
    </div>
    <div v-else style="padding-left: 10vw; padding-right: 10vw">
      <n-h1 prefix="bar" type="info">
        <n-text type="info">The system is waiting for you</n-text>
      </n-h1>
      <n-divider />
      <n-h4 style="padding-top: 20px">It will ease your life</n-h4>
      <div style="padding-top: 20px">
        <n-button
          quaternary
          style="margin-right: 20px"
          type="info"
          @click="$router.push('/user/login')"
        >
          Login
        </n-button>
        <n-button type="info" @click="$router.push('/user/signup')"> Signup</n-button>
      </div>
    </div>
  </div>
</template>
