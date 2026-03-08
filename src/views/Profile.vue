<template>
  <div class="profile-container">
    <van-sticky>
      <van-nav-bar
        title="个人中心"
        left-text="返回"
        left-arrow
        @click-left="$router.back()"
      />
    </van-sticky>

    <div class="user-info">
      <div class="avatar-wrapper">
        <van-image
          round
          :src="userInfo?.avatar || defaultAvatar"
          width="80"
          height="80"
          fit="cover"
          @click="previewAvatar"
        />
        <div class="avatar-tip" @click="selectAvatar">
          <van-icon name="photograph" size="16" />
        </div>
      </div>
      <h2 class="nickname">{{ userInfo?.nickname || '管理员' }}</h2>
      <van-tag type="primary">{{ userInfo?.role === 'super' ? '超级管理员' : '管理员' }}</van-tag>
    </div>

    <van-cell-group inset>
      <van-cell
        title="账号"
        :value="userInfo?.username"
      />
      <van-cell
        title="昵称"
        :value="userInfo?.nickname"
        is-link
        @click="showEditForm('nickname')"
      />
      <van-cell
        title="修改密码"
        is-link
        @click="showPasswordForm = true"
      />
      <van-cell
          title="上次登录"
          :value="formatDateTime(userInfo?.lastLogin)"
      />
    </van-cell-group>

    <div class="logout-btn">
      <van-button
        type="danger"
        block
        round
        @click="handleLogout"
      >
        退出登录
      </van-button>
    </div>

    <van-dialog
      v-model:show="showEditDialog"
      :title="editTitle"
      show-cancel-button
      @confirm="confirmEdit"
    >
      <van-field
        v-model="editValue"
        :placeholder="`请输入${editTitle}`"
      />
    </van-dialog>

    <van-dialog
      v-model:show="showPasswordForm"
      title="修改密码"
      show-cancel-button
      @confirm="confirmPasswordChange"
    >
      <van-field
        v-model="passwordForm.newPassword"
        type="password"
        label="新密码"
        placeholder="请输入新密码"
      />
      <van-field
        v-model="passwordForm.confirmPassword"
        type="password"
        label="确认密码"
        placeholder="请再次输入新密码"
      />
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showDialog, showImagePreview } from 'vant';
import axios from 'axios';
import { useUserStore } from '@/stores/user';
import dayjs from 'dayjs';
import request from "@/utils/request.js";

const router = useRouter();
const userStore = useUserStore();

const defaultAvatar = 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg';

const userInfo = ref(null);
const showEditDialog = ref(false);
const showPasswordForm = ref(false);
const editType = ref('');
const editValue = ref('');

const passwordForm = reactive({
  newPassword: '',
  confirmPassword: ''
});

const editTitle = computed(() => {
  return '修改昵称';
});

const formatDateTime = (date) => {
  if (!date) return '暂无记录';
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

const fetchUserInfo = async () => {
  try {
    const res = await request.get('/api/admin/info');
    if (res.data.success) {
      userInfo.value = res.data.data;
      userStore.setUserInfo(res.data.data);
    }
  } catch (error) {
    showToast('获取信息失败');
  }
};

const showEditForm = (type) => {
  editType.value = type;
  editValue.value = userInfo.value?.nickname;
  showEditDialog.value = true;
};

const confirmEdit = async () => {
  if (!editValue.value.trim()) {
    showToast('内容不能为空');
    return;
  }

  try {
    const res = await request.put('/api/admin/info', {
      nickname: editValue.value
    });

    if (res.data.success) {
      showToast('修改成功');
      userInfo.value = res.data.data;
      userStore.setUserInfo(res.data.data);
    }
  } catch (error) {
    showToast('修改失败');
  }
};

const selectAvatar = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('头像大小不能超过 2MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await request.post('/api/admin/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        userInfo.value.avatar = res.data.data.avatar;
        userStore.setUserInfo(userInfo.value);
        showToast('头像更新成功');
        fetchUserInfo();
      }
    } catch (error) {
      showToast(error?.response?.data?.message || '上传失败');
    }
  };
  input.click();
};

const previewAvatar = () => {
  if (userInfo.value?.avatar) {
    showImagePreview({
      images: [userInfo.value.avatar],
    });
  }
};

const confirmPasswordChange = async () => {
  if (!passwordForm.newPassword) {
    showToast('请输入新密码');
    return;
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    showToast('两次输入的密码不一致');
    return;
  }

  if (passwordForm.newPassword.length < 6) {
    showToast('密码长度不能少于 6 位');
    return;
  }

  try {
    const res = await request.put('/api/admin/info', {
      password: passwordForm.newPassword
    });

    if (res.data.success) {
      showDialog({
        title: '提示',
        message: '密码修改成功，请重新登录',
        confirmButtonText: '确定'
      }).then(() => {
        userStore.logout();
        router.push('/login');
      });
    }
  } catch (error) {
    showToast('修改失败');
  }
};

const handleLogout = () => {
  showDialog({
    title: '确认退出',
    message: '确定要退出登录吗？',
    showCancelButton: true
  }).then(() => {
    userStore.logout();
    router.push('/login');
    showToast('已退出登录');
  }).catch(() => {});
};

onMounted(() => {
  fetchUserInfo();
});
</script>

<style lang="less" scoped>
.profile-container {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.user-info {
  padding: 40px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  text-align: center;
  color: #fff;
  margin-bottom: 16px;

  .avatar-wrapper {
    position: relative;
    display: inline-block;
    cursor: pointer;

    .avatar-tip {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 24px;
      height: 24px;
      background-color: rgba(255, 255, 255, 0.8);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #667eea;
    }
  }

  .nickname {
    margin: 15px 0 10px;
    font-size: 20px;
    font-weight: 600;
  }
}

.logout-btn {
  padding: 30px 20px;

  :deep(.van-button) {
    height: 48px;
  }
}
</style>
