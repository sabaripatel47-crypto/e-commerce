<template>
  <div class="trend-line-chart" ref="lineChartRef" :style="{ width: width, height: height }"></div>
</template>

<script>
export default {
  name: 'TrendLineChart',
  props: {
    width: {
      type: String,
      default: '100%',
    },
    height: {
      type: String,
      default: '400px',
    },
    option: {
      type: [Object, null],
      default: () => null,
    },
  },
  data() {
    return {
      chart: null,
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeChart)
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
  },
  watch: {
    option: {
      handler(newVal) {
        const hasValidData =
          newVal &&
          typeof newVal === 'object' &&
          Array.isArray(newVal.series) &&
          newVal.series.length > 0

        if (hasValidData) {
          if (this.chart) {
            this.chart.setOption(newVal, true)
          } else {
            this.$nextTick(() => {
              this.initChart()
            })
          }
        } else if (this.chart && newVal && Object.keys(newVal).length === 0) {
          this.chart.clear()
        }
      },
      deep: true,
      immediate: false,
    },
  },
  methods: {
    initChart() {
      if (!this.$refs.lineChartRef) {
        return
      }

      const container = this.$refs.lineChartRef
      if (
        !container ||
        container.offsetWidth === 0 ||
        container.offsetHeight === 0
      ) {
        setTimeout(() => {
          this.initChart()
        }, 100)
        return
      }

      if (this.chart) {
        this.chart.dispose()
        this.chart = null
      }

      try {
        this.chart = this.$echarts.init(this.$refs.lineChartRef)

        if (
          this.option &&
          typeof this.option === 'object' &&
          Array.isArray(this.option.series) &&
          this.option.series.length > 0
        ) {
          this.chart.setOption(this.option, true)
        }

        window.addEventListener('resize', this.resizeChart)
      } catch (error) {
        console.error('初始化图表失败:', error)
      }
    },

    resizeChart() {
      if (this.chart) {
        this.chart.resize()
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.trend-line-chart {
  width: 100%;
}
</style>
