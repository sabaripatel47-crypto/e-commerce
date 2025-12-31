<template>
  <div class="app-container">
    <el-tabs v-model="activeTab" @tab-click="handleClick">
      <el-tab-pane label="赛道" name="track">
        <TrackContent v-if="activeTab == 'track'"></TrackContent>
      </el-tab-pane>
      <el-tab-pane label="品类" name="category">
        <CategoryContent v-if="activeTab == 'category'"></CategoryContent>
      </el-tab-pane>
      <el-tab-pane label="器型" name="shape">
        <ShapeContent v-if="activeTab == 'shape'"></ShapeContent>
      </el-tab-pane>
      <el-tab-pane label="人群" name="crowd">
        <CrowdContent v-if="activeTab == 'crowd'"></CrowdContent>
      </el-tab-pane>
      <el-tab-pane label="价格带" name="price">
        <PriceContent v-if="activeTab == 'price'"></PriceContent>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import ShapeContent from './components/ShapeContent.vue';
import CategoryContent from './components/CategoryContent'
import TrackContent from './components/TrackContent'
import CrowdContent from './components/CrowdContent.vue';
import PriceContent from './components/PriceContent.vue';
export default {
  name: 'Classification',
  components: {
    CategoryContent,
    TrackContent,
    ShapeContent,
    CrowdContent,
    PriceContent
  },
  data() {
    return {
      activeTab: 'track', // category症状  track部位
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

<style>
</style>