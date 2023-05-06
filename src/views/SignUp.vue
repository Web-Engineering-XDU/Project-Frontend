<template>
  <div class="form">
    <n-h1 prefix="bar" type="info">
      <n-text type="info"> Sign up </n-text>
    </n-h1>
    <n-divider />
    <n-form style="padding-top: 20px" ref="formRef" :label-width="80" :model="formValue">
      <n-form-item label="Email">
        <n-input v-model:value="formValue.user.email" placeholder="输入姓名" />
      </n-form-item>
      <n-form-item label="Username">
        <n-input v-model:value="formValue.user.name" placeholder="输入姓名" />
      </n-form-item>
      <n-form-item label="Password">
        <n-input v-model:value="formValue.user.password" placeholder="输入年龄" />
      </n-form-item>
      <n-form-item label="Confirm">
        <n-input v-model:value="formValue.user.dpassword" placeholder="输入年龄" />
      </n-form-item>

      <n-form-item>
        <n-button> Log in</n-button>
      </n-form-item>
    </n-form>
    Already have an account,
    <n-a type="info" @click="$router.push('/user/login')"> Log in</n-a>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
const formValue = ref({
  user: {
    name: "",
    password: "",
    dpassword: "",
    email: "",
  },
});
</script>
<style scoped>
.form {
  padding-left: 10vw;
  padding-right: 10vw;
  padding-top: 20px;
}
</style>
