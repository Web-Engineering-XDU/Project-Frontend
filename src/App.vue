<script setup lang="tsx">
import { RouterLink, RouterView } from "vue-router";
import { ref, useCssModule } from "vue";
import type { MenuOption } from "naive-ui";
import { Run } from "@vicons/carbon";
const activeKey = ref<string>("");
const style = useCssModule();
const search = ref<string>("");
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
        <div class="right-box">
          <n-input size="small" v-model:value="search" round placeholder="Search" />
          <n-tag type="info" style="margin-left: 20px" size="small" round>
            <div style="display: flex; align-items: center">
              <n-icon style="padding-right: 3px" size="12"><Run /></n-icon>12
            </div>
          </n-tag>
          <n-popover trigger="click"
            ><template #trigger>
              <div :class="style.etc" style="margin-left: 20px; cursor: pointer">
                Account
              </div>
            </template>
            sddd
          </n-popover>
        </div>
      </div>
    </n-layout-header>
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
.right-box {
  display: inline-flex;
  align-items: center;
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
