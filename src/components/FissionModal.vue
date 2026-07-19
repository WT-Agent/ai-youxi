<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-content">
      <h3>免费额度已用完</h3>
      <p>扫码关注或将当前页面分享至朋友圈，即可解锁今日无限次免费生成体验。</p>
      
      <div class="qr-code-placeholder">
        <!-- 纯 SVG 绘制的高保真二维码 -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
          <rect width="100" height="100" fill="white"/>
          <!-- 左上角定位图 -->
          <rect x="5" y="5" width="25" height="25" fill="#110e24"/>
          <rect x="9" y="9" width="17" height="17" fill="white"/>
          <rect x="13" y="13" width="9" height="9" fill="#110e24"/>
          <!-- 右上角定位图 -->
          <rect x="70" y="5" width="25" height="25" fill="#110e24"/>
          <rect x="74" y="9" width="17" height="17" fill="white"/>
          <rect x="78" y="13" width="9" height="9" fill="#110e24"/>
          <!-- 左下角定位图 -->
          <rect x="5" y="70" width="25" height="25" fill="#110e24"/>
          <rect x="9" y="74" width="17" height="17" fill="white"/>
          <rect x="13" y="78" width="9" height="9" fill="#110e24"/>
          <!-- 数据点模拟 -->
          <rect x="35" y="10" width="8" height="8" fill="#110e24"/>
          <rect x="48" y="5" width="6" height="12" fill="#110e24"/>
          <rect x="60" y="15" width="5" height="5" fill="#110e24"/>
          <rect x="35" y="35" width="10" height="10" fill="#110e24"/>
          <rect x="50" y="45" width="15" height="8" fill="#110e24"/>
          <rect x="40" y="70" width="8" height="16" fill="#110e24"/>
          <rect x="55" y="65" width="10" height="10" fill="#110e24"/>
          <rect x="75" y="40" width="12" height="12" fill="#110e24"/>
          <rect x="75" y="75" width="15" height="15" fill="#110e24"/>
          <rect x="45" y="80" width="8" height="8" fill="#110e24"/>
        </svg>
      </div>

      <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1.5rem;">
        微信号: <span style="color: var(--primary-color); font-weight: bold;">{{ wechatId }}</span>
      </div>

      <button class="modal-btn" @click="handleShared">我已完成分享</button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean;
  wechatId: string;
}>();

const emit = defineEmits<{
  (e: 'unlocked'): void;
}>();

const handleShared = () => {
  localStorage.setItem('shared_fission', 'true');
  emit('unlocked');
};
</script>
