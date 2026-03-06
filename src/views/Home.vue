<template>
  <div class="home-container">
    <van-sticky>
      <van-nav-bar
        title="反馈管理"
        right-text="个人中心"
        @click-right="$router.push('/profile')"
      >
        <template #right>
          <van-icon name="manager-o" size="20" />
        </template>
      </van-nav-bar>

      <div class="search-bar">
        <div class="search-left">
          <van-search
            v-model="searchKeyword"
            placeholder="搜索标题、内容或关键字"
            shape="round"
            @search="onSearch"
          />
        </div>
        <div class="search-right">
          <div class="filter-item" @click="showTypePicker = true">
            <span>{{ filterTypeText || '反馈类型' }}</span>
            <van-icon name="arrow" />
          </div>
        </div>
      </div>
    </van-sticky>

    <van-pull-refresh v-model="refreshLoading" @refresh="onRefresh">
      <van-list
        v-model:loading="listLoading"
        :finished="finished"
        finished-text="没有更多了"
        :disabled="refreshLoading"
        :immediate-check="false"
        @load="onLoad"
      >
        <van-cell
          v-for="item in feedbackList"
          :key="item._id"
          @click="goToDetail(item._id)"
        >
          <template #title>
            <div class="item-title">{{ item.title }}</div>
          </template>
          <template #label>
            <div class="item-content">{{ item.content }}</div>
            <div class="item-meta">
              <span>{{ getTypeText(item.type) }}</span>
              <span>{{ formatDate(item.date) }}</span>
            </div>
          </template>
        </van-cell>
      </van-list>
    </van-pull-refresh>
  </div>

  <van-popup v-model:show="showTypePicker" position="bottom">
    <van-picker
      :columns="typeOptions"
      @confirm="onTypeConfirm"
      @cancel="showTypePicker = false"
    />
  </van-popup>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import axios from 'axios';
import dayjs from 'dayjs';
import request from "@/utils/request.js";

const router = useRouter();

const searchKeyword = ref('');
const filterType = ref('');
const filterTypeText = ref('');

const showTypePicker = ref(false);

const refreshLoading = ref(false);
const listLoading = ref(false);
const finished = ref(false);
const page = ref(1);
const feedbackList = ref([]);

const typeOptions = [
  { text: '全部类型', value: '' },
  { text: '其它', value: '0' },
  { text: '交警', value: '1' },
  { text: '路政', value: '2' },
  { text: '地保办', value: '3' }
];

const getTypeText = (type) => {
  const types = { 0: '其它', 1: '交警', 2: '路政', 3: '地保办' };
  return types[type] || '其它';
};

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD');
};

const fetchList = async () => {
  try {
    const params = {
      page: page.value,
      limit: 10
    };

    if (filterType.value) params.type = filterType.value;
    if (searchKeyword.value) params.keyword = searchKeyword.value;

    const res = await request.get('/api/feedback/list', { params });

    if (res.data.success) {
      const { list, total } = res.data.data;

      if (page.value === 1) {
        feedbackList.value = list;
      } else {
        feedbackList.value = [...feedbackList.value, ...list];
      }

      // 判断是否加载完毕
      if (feedbackList.value.length >= total) {
        finished.value = true;
      } else {
        page.value++;
      }
    } else {
      finished.value = true;
    }
  } catch (error) {
    showToast('加载失败');
    finished.value = true;
  } finally {
    listLoading.value = false;
    refreshLoading.value = false;
  }
};

const onRefresh = () => {
  page.value = 1;
  finished.value = false;
  refreshLoading.value = true;
  listLoading.value = true;
  fetchList();
};

const onLoad = () => {
  if (finished.value) {
    listLoading.value = false;
    return;
  }
  fetchList();
};

const onSearch = () => {
  page.value = 1;
  finished.value = false;
  feedbackList.value = [];
  listLoading.value = true;
  fetchList();
};

const onTypeConfirm = ({ selectedOptions }) => {
  filterType.value = selectedOptions[0].value;
  filterTypeText.value = selectedOptions[0].text;
  showTypePicker.value = false;
  onSearch();
};

const goToDetail = (id) => {
  router.push(`/detail/${id}`);
};

onMounted(() => {
  listLoading.value = true;
  fetchList();
});
</script>

<style lang="less" scoped>
.home-container {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.search-bar {
  padding: 10px;
  background-color: #fff;
  display: flex;
  align-items: center;
  gap: 10px;

  .search-left {
    flex: 1;
    min-width: 0;

    :deep(.van-search) {
      padding: 0;
    }
  }

  .search-right {
    flex-shrink: 0;
  }

  .filter-item {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    font-size: 13px;
    color: #969799;
    background-color: #f7f8fa;
    border-radius: 4px;
    cursor: pointer;

    .van-icon {
      font-size: 12px;
    }
  }
}

.cell-label {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #969799;
  margin-top: 5px;
}

.item-title {
  font-size: 15px;
  color: #323233;
  font-weight: 500;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.item-content {
  font-size: 13px;
  color: #969799;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 8px;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #969799;
}
</style>
