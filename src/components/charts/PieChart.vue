<template>
  <div class="pie-chart" ref="pieChart" :style="{width:width,height:height}"></div>
</template>

<script>
export default {
  name: 'PieChart',
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
      default: '200px',
    },
    option: {
      default: {},
    },
  },
  methods: {
    init() {
      if (this.chart === null) {
        this.chart = this.$echarts.init(this.$refs.pieChart)
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