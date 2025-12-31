<template>
  <div class="bar-chat" ref="barChart" :style="{width:width,height:height}"></div>
</template>

<script>
export default {
  name: 'BarChart',
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
      if (this.chart === null) {
        this.chart = this.$echarts.init(this.$refs.barChart)
      }
      this.chart.setOption(this.option)
    },
  },
  mounted() {},
  watch: {
    option() {
      this.init()
    },
  },
}
</script>

<style lang="less">
</style>