<template>
  <div class="line-chat" ref="lineChart" :style="{width:width,height:height}"></div>
</template>

<script>
export default {
  name: 'LineChart',
  data() {
    return {
      chart: null,
    }
  },
  props: {
    width: {
      default: '100%',
    },
    height: {
      default: '420px',
    },
    option: {
      default: {},
    },
  },
  methods: {
    init() {
      // 如果图表已存在，先销毁
      if (this.chart) {
        this.chart.dispose()
        this.chart = null
      }

      // 重新初始化图表
      this.chart = this.$echarts.init(this.$refs.lineChart)
      this.chart.setOption(this.option)
    },
  },
  mounted() {},
  watch: {
    option() {
      this.init()
    },
  },
  beforeUnmount() {
    // 组件销毁前清理图表实例
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
  },
}
</script>

<style lang="less">
</style>