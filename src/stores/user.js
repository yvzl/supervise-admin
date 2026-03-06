import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(null);

  const setUserInfo = (info) => {
    userInfo.value = info;
  };

  const logout = () => {
    userInfo.value = null;
    localStorage.removeItem('admin_token');
  };

  return {
    userInfo,
    setUserInfo,
    logout
  };
});
