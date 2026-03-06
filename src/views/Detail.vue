<template>
  <div class="detail-container">
    <van-sticky>
      <van-nav-bar
        title="反馈详情"
        left-text="返回"
        left-arrow
        @click-left="$router.back()"
      />
    </van-sticky>
    <div style="margin: 12px 0;">
      <van-skeleton
          :loading="loading"
          :row="3"
          avatar
          title
      >
        <!--      <div style="">-->
        <van-cell-group inset>
          <van-cell title="反馈标题" :value="detail.title" />
          <van-cell title="反馈内容" :label="detail.content" />

          <van-cell title="反馈类型">
            <template #right-icon>
              <van-tag type="primary">{{ getTypeText(detail.type) }}</van-tag>
            </template>
          </van-cell>

          <van-cell title="昵称" :value="detail.nickname" />
          <van-cell title="联系电话" :value="detail.phone" />
          <van-cell title="发生地点" :value="detail.location" />
          <van-cell title="发生日期" :value="formatDate(detail.date)" />
          <van-cell title="提交时间" :value="formatDateTime(detail.createdAt)" />
        </van-cell-group>
        <!--      </div>-->

        <div v-if="detail.attachments?.length > 0" class="attachments">
          <p class="section-title">附件</p>
          <div class="attachment-list">
            <div
                v-for="(item, index) in detail.attachments"
                :key="index"
                class="attachment-item"
                @click="handleAttachment(item)"
            >
              <van-image
                  v-if="isImage(item)"
                  :src="getImageUrl(item.url)"
                  width="80"
                  height="80"
                  fit="cover"
                  class="attachment-thumb"
              >
                <template #loading>
                  <van-loading type="spinner" size="20" />
                </template>
                <template #error>
                  <van-icon name="photo-o" size="30" color="#999" />
                </template>
              </van-image>
              <div v-else class="attachment-file">
                <van-icon name="file-o" size="40" color="#1989fa" />
                <span class="file-name">{{ getFileName(item.name) }}</span>
              </div>
            </div>
          </div>
        </div>

        <van-cell-group inset v-if="detail.adminNotes">
          <h3 class="section-title">管理员备注</h3>
          <van-cell :label="detail.adminNotes" />
        </van-cell-group>

        <div v-if="detail.attachments?.length > 0" class="tips">
          <van-notice-bar
              left-icon="info-o"
              text="点击图片可预览，点击其他文件可下载"
              :scrollable="false"
          />
        </div>
      </van-skeleton>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { showToast, showImagePreview } from 'vant';
import axios from 'axios';
import dayjs from 'dayjs';
import request from "@/utils/request.js";

const route = useRoute();
const loading = ref(true);

const detail = ref({});

const getTypeText = (type) => {
  const types = { 0: '其它', 1: '交警', 2: '路政', 3: '地保办' };
  return types[type] || '其它';
};

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD');
};

const formatDateTime = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  // 如果是相对路径，添加 API 服务地址
  if (url.startsWith('/')) {
    return url;
  }
  return url;
};

const isImage = (item) => {
  if (!item) return false;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
  const name = (item.name || '').toLowerCase();
  const type = (item.type || '').toLowerCase();

  return type.startsWith('image/') ||
    imageExtensions.some(ext => name.endsWith(ext));
};

const getFileName = (name) => {
  if (!name) return '未知文件';
  if (name.length > 20) {
    return name.substring(0, 10) + '...' + name.substring(name.length - 10);
  }
  return name;
};

const handleAttachment = (item) => {
  if (isImage(item)) {
    showImagePreview({
      images: [getImageUrl(item.url)],
    });
  } else {
    // 下载文件
    const link = document.createElement('a');
    link.href = getImageUrl(item.url);
    link.download = item.name;
    link.target = '_blank';
    link.click();
  }
};

const previewImage = (index) => {
  const urls = detail.value.attachments.map(item => getImageUrl(item.url));
  showImagePreview({
    images: urls,
    startPosition: index
  });
};

const fetchDetail = async () => {
  try {
    loading.value = true;
    const res = await request.get(`/api/feedback/${route.params.id}`);

    if (res.data.success) {
      detail.value = res.data.data;
    }
  } catch (error) {
    console.error('Fetch detail error:', error);
    showToast(error?.response?.data?.message || '加载失败');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchDetail();
});
</script>

<style lang="less" scoped>
.detail-container {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.attachments {
  margin: 15px;
  padding: 16px;
  background-color: #fff;
  border-radius: 8px;

  .section-title {
    font-size: 15px;
    //font-weight: 600;
    margin-bottom: 10px;
    color: #323233;
  }

  .attachment-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .attachment-item {
    width: 100px;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f7f8fa;
    border-radius: 8px;
    cursor: pointer;

    .attachment-thumb {
      border-radius: 8px;
    }

    .attachment-file {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 10px;

      .file-name {
        font-size: 12px;
        color: #666;
        margin-top: 5px;
        text-align: center;
        word-break: break-all;
      }
    }
  }
}

.section-title {
  //padding: 15px 16px 5px;
  font-size: 15px;
  //font-weight: 100;
  color: #323233;
}

.tips {
  padding: 0 15px 15px;
}
</style>
