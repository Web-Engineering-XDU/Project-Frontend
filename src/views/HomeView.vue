<script setup lang="tsx">
import { ref } from "vue";
import { useCounterStore } from "../stores/counter";
import type { AxiosResponse } from "axios";
import type { Agent, Event, Response } from "../types/index";
const store = useCounterStore();
const agentCount = ref(0);
const eventCount = ref(0);
useCounterStore()
  .Axios.get("/agent?page=0&number=0")
  .then((res: AxiosResponse<Response<Agent>>) => {
    agentCount.value = res.data.result.totalCount;
  });
  useCounterStore()
  .Axios.get("/event?page=0&number=0")
  .then((res: AxiosResponse<Response<Event>>) => {
    eventCount.value = res.data.result.totalCount;
  });
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
        <div style="display: inline-block; color: #2080f0">{{ agentCount }}</div>
        agents.
      </div>
      <n-button
        strong
        secondary
        type="primary"
        @click="$router.push('/agents')"
        style="margin-top: 10px"
      >
        View
      </n-button>
      <div style="margin-top: 50px">
        Your agents have recorded
        <div style="display: inline-block; color: #2080f0">{{ eventCount }}</div>
        events in total.
      </div>
      <n-button strong secondary type="primary" style="margin-top: 10px" @click="$router.push('/events')"> View </n-button>

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
