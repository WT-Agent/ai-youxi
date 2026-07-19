<template>
  <div class="glass-card ticker-card">
    <div class="ticker-wrapper">
      <div v-for="(item, index) in tickerItems" :key="index" class="ticker-item">
        <span>{{ item.text }}</span>
        <span style="color: var(--success-color); font-weight: bold;">[生成成功]</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const tickerItems = ref([
  { text: '用户 135****4829 成功生成了文案' },
  { text: '用户 173****9238 成功合成了图像' },
  { text: '用户 189****1102 成功解析了数据' },
  { text: '用户 130****8739 成功翻译了内容' },
  { text: '用户 152****2394 成功生成了朋友圈文案' },
]);
</script>
