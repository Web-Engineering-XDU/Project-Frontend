<template>
  <div class="form">
    <n-h1 prefix="bar" type="info">
      <n-text type="info"> Log In </n-text>
    </n-h1>
    <n-divider />
    <n-form style="padding-top: 20px" ref="formRef" :label-width="80" :model="formValue">
      <n-form-item label="Username">
        <n-input v-model:value="formValue.user.name" placeholder="" />
      </n-form-item>
      <n-form-item label="Password">
        <n-input v-model:value="formValue.user.password" placeholder="" />
      </n-form-item>
      Remember me<n-switch
        style="margin-left: 10px"
        v-model:value="formValue.remember"
        placeholder=""
      />
      <n-form-item>
        <n-button @click="login"> Log in</n-button>
      </n-form-item>
    </n-form>
    Do not have an account?<n-a @click="$router.push('/user/signup')"> Sign up</n-a> now!
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { useCounterStore } from "@/stores/counter";
import { useMessage } from "naive-ui";
import { useRouter } from "vue-router";
const axios = useCounterStore().Axios;
const router = useRouter();
const formRef = ref();
const formValue = ref({
  user: {
    name: "",
    password: "",
  },
  remember: false,
});
const message = useMessage();
const login = () => {
  message.success("Login success!");
  setTimeout(() => {
    useCounterStore().logged = true;
    router.push("/");
  }, 50);
};
</script>
<style scoped>
.form {
  padding-left: 10vw;
  padding-right: 10vw;
  padding-top: 20px;
}
</style>
