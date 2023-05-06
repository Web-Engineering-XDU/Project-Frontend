<template>
  <div class="form">
    <n-h1 prefix="bar" type="info">
      <n-text type="info"> Log In </n-text>
    </n-h1>
    <n-divider />
    <n-form style="padding-top: 20px" ref="formRef" :label-width="80" :model="formValue">
      <n-form-item label="Username">
        <n-input v-model:value="formValue.user.name" placeholder="输入姓名" />
      </n-form-item>
      <n-form-item label="Password">
        <n-input v-model:value="formValue.user.password" placeholder="输入年龄" />
      </n-form-item>
      Remember me<n-switch
        style="margin-left: 10px"
        v-model:value="formValue.remember"
        placeholder="电话号码"
      />
      <n-form-item>
        <n-button> Log in</n-button>
      </n-form-item>
    </n-form>
    Do not have an account?<n-a @click="$router.push('/user/signup')"> Sign up</n-a> now!
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
const formRef = ref();
const formValue = ref({
  user: {
    name: "",
    password: "",
  },
  remember: false,
});
</script>
<style scoped>
.form {
  padding-left: 10vw;
  padding-right: 10vw;
  padding-top: 20px;
}
</style>
