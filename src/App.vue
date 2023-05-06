<script setup lang="tsx">
import { RouterLink, RouterView } from "vue-router";
import { onMounted, ref, useCssModule } from "vue";
import type { MenuOption } from "naive-ui";
const activeKey = ref<string>("");
const style = useCssModule();
const menuOptions: MenuOption[] = [
  {
    label: () => (
      <RouterLink to={"/"} class={[style.Home]}>
        Home
      </RouterLink>
    ),
    key: "home",
  },
  {
    label: () => (
      <RouterLink to={"/agents"} class={style.etc}>
        Agents
      </RouterLink>
    ),
    key: "agents",
  },
  {
    label: () => (
      <RouterLink to={"/events"} class={style.etc}>
        Events
      </RouterLink>
    ),
    key: "events",
  },
];

activeKey.value = window.location.pathname.split("/")[1];
</script>

<template>
  <n-layout class="out">
    <n-layout-header class="header">
      <div class="container">
        <n-menu v-model:value="activeKey" mode="horizontal" :options="menuOptions" />
      </div>
      <div></div
    ></n-layout-header>
    <n-layout-content
      class="body"
      content-style="padding: 24px;"
      :native-scrollbar="false"
      ><div class="content">
        <div class="inner"><RouterView /></div>
      </div>
    </n-layout-content>
  </n-layout>
</template>

<style scoped>
.header {
  height: 50px;
  width: 100vw;
  background-color: rgb(250, 250, 250);
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgb(230, 230, 230);
}
.container {
  width: 70vw;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  max-width: 1500px;
}
.body {
  min-width: calc(100vh - 50px);
  width: 100vw;
  display: flex;
  justify-content: center;
}
.content {
  width: 100vw;
  display: flex;
  justify-content: center;
}
.content .inner {
  width: 70vw;
  max-width: 1500px;
}
</style>
<style module>
.Home {
  font-size: 20px;
  color: rgb(139, 138, 138) !important;
}
.etc {
  font-size: 13px;
  color: rgb(139, 138, 138);
}
</style>
