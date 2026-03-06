<template>
  <div class="login-container">
    <div class="logo">
      <van-icon name="manager-o" size="60" color="#1989fa" />
      <h1>施工反馈管理端</h1>
    </div>

    <van-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      @submit="onSubmit"
    >
      <van-cell-group inset>
        <van-field
          v-model="formData.username"
          name="username"
          label="账号"
          placeholder="请输入账号"
          :rules="formRules.username"
        >
          <template #left-icon>
            <van-icon name="user-o" size="20" />
          </template>
        </van-field>

        <van-field
          v-model="formData.password"
          type="password"
          name="password"
          label="密码"
          placeholder="请输入密码"
          :rules="formRules.password"
        >
          <template #left-icon>
            <van-icon name="lock" size="20" />
          </template>
        </van-field>
      </van-cell-group>

      <div class="btn-wrapper">
        <van-button
          type="primary"
          native-type="submit"
          block
          round
          :loading="loading"
        >
          登录
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import axios from 'axios';
import { useUserStore } from '@/stores/user';
import request from "@/utils/request.js";

const router = useRouter();
const userStore = useUserStore();
const formRef = ref(null);

const formData = reactive({
  username: '',
  password: ''
});

const formRules = {
  username: [{ required: true, message: '请输入账号' }],
  password: [{ required: true, message: '请输入密码' }]
};

const loading = ref(false);

const onSubmit = async () => {
  try {
    await formRef.value?.validate();
    loading.value = true;

    const res = await request.post('/api/admin/login', formData);

    if (res.data.success) {
      // 确保 token 是字符串
      const token = String(res.data.data.token);
      // 直接存储 token 字符串
      localStorage.setItem('admin_token', token);
      userStore.setUserInfo(res.data.data.admin);
      showToast('登录成功');
      router.push('/');
    } else {
      showToast(res.data.message || '登录失败');
    }
  } catch (error) {
    console.error('Login error:', error);
    showToast(error?.response?.data?.message || '登录失败');
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="less" scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
}

.logo {
  text-align: center;
  color: #fff;
  margin-bottom: 40px;

  h1 {
    font-size: 22px;
    margin-top: 15px;
    font-weight: 600;
  }
}

.btn-wrapper {
  padding: 30px 20px;

  :deep(.van-button) {
    height: 48px;
    font-size: 16px;
  }
}
</style>
