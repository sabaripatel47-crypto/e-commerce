<template>
  <div class="expressManage_refundHandle">
    <el-tabs v-model="activeTab" @tab-click="handleClick">
      <el-tab-pane label="处理" name="handle">
        <HandleContent v-if="activeTab == 'handle'"></HandleContent>
      </el-tab-pane>
      <el-tab-pane label="查看" name="check">
        <CheckContent v-if="activeTab == 'check'"></CheckContent>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import CheckContent from './components/CheckContent'
import HandleContent from './components/HandleContent'
export default {
  name: 'RefundHandle',
  components: {
    CheckContent,
    HandleContent,
  },
  data() {
    return {
      activeTab: 'handle',
    }
  },
  methods: {
    // tab切换
    handleClick(tab, event) {
      this.activeTab = tab.paneName
    },
  },
}
</script>

<style lang="scss" scoped>
.expressManage_refundHandle {
  padding: 40px;
}
</style>
