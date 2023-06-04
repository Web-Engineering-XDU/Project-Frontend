<script setup lang="tsx">
import { RouterLink, RouterView } from "vue-router";
import { onMounted, reactive, ref, useCssModule, watch } from "vue";
import type { MenuOption } from "naive-ui";
import { Run } from "@vicons/carbon";
import { useCounterStore } from "./stores/counter";
import router from "./router";
const store = useCounterStore();
const activeKey = ref<string>("");
const style = useCssModule();
const search = ref<string>("");
const menuOptions: MenuOption[] = reactive([
  {
    label: () => (
      <RouterLink to={"/"} class={[style.Home]}>
        Home
      </RouterLink>
    ),
    key: "home",
  },
]);

//已登录才显示下面两个
if (store.logged) {
  menuOptions.push({
    label: () => (
      <RouterLink to={"/agents"} class={style.etc}>
        Agents
      </RouterLink>
    ),
    key: "agents",
  });
  menuOptions.push({
    label: () => (
      <RouterLink to={"/events"} class={style.etc}>
        Events
      </RouterLink>
    ),
    key: "events",
  });
}
watch(
  () => store.logged,
  () => {
    if (store.logged && menuOptions.length == 1) {
      menuOptions.push({
        label: () => (
          <RouterLink to={"/agents"} class={style.etc}>
            Agents
          </RouterLink>
        ),
        key: "agents",
      });
      menuOptions.push({
        label: () => (
          <RouterLink to={"/events"} class={style.etc}>
            Events
          </RouterLink>
        ),
        key: "events",
      });
    }
  }
);
watch(
  () => router.currentRoute.value.path,
  (path) => {
    activeKey.value = path.split("/")[1];
  }
);
activeKey.value = window.location.pathname.split("/")[1];
</script>

<template>
  <n-message-provider>
    <n-dialog-provider>
    <n-layout class="out">
      <n-layout-header class="header">
        <div class="container">
          <n-menu class="menu" v-model:value="activeKey" mode="horizontal" :options="menuOptions" />
          <div class="right-box">
            <n-input
              v-if="store.logged&&false"
              :class="style.phoneAdjust"
              size="small"
              v-model:value="search"
              round
              placeholder="Search"
            />
            <Transition
              enter-active-class="animate__animated animate__fadeIn"
              leave-active-class="animate__animated animate__fadeOut"
            >
              <n-tag
                type="info"
                v-if="store.count > 0 && store.logged"
                style="margin-left: 20px"
                size="small"
                round
              >
                <div style="display: flex; align-items: center">
                  <n-icon style="padding-right: 3px" size="12"><Run /></n-icon
                  >{{ store.count }}
                </div>
              </n-tag>
            </Transition>
            <n-popover v-if="false" trigger="click" placement="bottom-end"
              ><template #trigger>
                <div :class="style.etc" style="margin-left: 20px; cursor: pointer">
                  Account
                </div>
              </template>
              <n-list style="min-width: 130px; font-size: 13px"
                ><n-list-item class="item" v-if="store.logged">Profile</n-list-item
                ><n-list-item
                  class="item"
                  v-if="!store.logged"
                  @click="$router.push('/user/signup')"
                  >Signup</n-list-item
                ><n-list-item
                  class="item"
                  v-if="!store.logged"
                  @click="$router.push('/user/login')"
                  >Login</n-list-item
                ><n-list-item
                  @click="
                    store.logged = false;
                    $router.push('/');
                  "
                  class="item"
                  v-if="store.logged"
                  >Logout</n-list-item
                ></n-list
              >
            </n-popover>
          </div>
        </div>
      </n-layout-header>
      <n-scrollbar style="max-height: calc(100vh - 50px); margin-top: 50px">
        <n-layout-content class="body" content-style="padding: 24px;"
          ><div class="content">
            <div class="inner">
              <router-view v-slot="{ Component }">
                <transition
                  enter-active-class="animate__animated animate__fadeIn animate_faster"
                  leave-active-class="animate__animated animate__fadeOut animate_faster"
                  mode="out-in"
                >
                  <component :is="Component" />
                </transition>
              </router-view>
            </div>
          </div>
        </n-layout-content>
        <div style="display: flex; justify-content: center;margin-right:10px">
          <n-h4
            style="
              text-align: right;
              margin-top: 10px;
              height: 30px;
              
              margin-bottom: 10px;
              width: var(--width);
            "
            >©2023 SE Web Engineering</n-h4
          >
        </div>
      </n-scrollbar>
    </n-layout></n-dialog-provider></n-message-provider
  >
</template>

<style scoped>
.menu{
  margin-left:-20px;
}
@media  (max-width: 500px) {
  .menu{
    margin-left:0px;
  }
}
  

.item:hover {
  background-color: rgb(245, 245, 245);
}
.item:active {
  background-color: rgb(230, 230, 230);
  transition: 0s;
}
.item {
  cursor: pointer;
  transition: 0.6s;
}
.header {
  height: 50px;
  width: 100vw;
  background-color: rgb(250, 250, 250);
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgb(230, 230, 230);
  position: fixed;

}
.container {
  width: var(--width);
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  max-width: 1500px;
  position: relative;

}
.body {
  width: 100vw;
  min-height: calc(100vh - 130px);
  display: flex;
  box-sizing: border-box;
  justify-content: center;
}
.content {
  width: calc(100vw - 48px);
  display: flex;
  justify-content: center;
}
.content .inner {
  width: var(--width);
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
.phoneAdjust{
  display: unset;
}
@media  (max-width: 500px) {
  .phoneAdjust {
    display: none;
  }
}
  
</style>
<style>
:root {
  --width: 70vw;
  --animate-duration: 0.8s;
}
@media screen and (max-width: 1400px) {
  :root {
    --width: 80vw;
  }
}
@media screen and (max-width: 1000px) {
  :root {
    --width: 95vw;
  }
}
@media screen and (max-width: 500px) {
  :root {
    --width: 99vw;
  }
}
.n-list-item__divider {
  display: none;
}
.n-list-item {
  padding: 10px !important;
  padding-left: 20px !important;
  padding-right: 20px !important;
}
.v-binder-follower-content {
  margin-top: 6px;
}
.n-popover-arrow-wrapper {
  display: none;
}
.n-popover-shared {
  padding: 0px !important;
}
body{
  overflow-x: hidden;
}
</style>
