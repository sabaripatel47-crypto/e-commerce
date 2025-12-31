<template>
  <div>
    <div class="line-chat" ref="BarChart" :style="{width:width,height:height}"></div>
  </div>
</template>

<script>
export default {
  name: 'BarChart',
  data() {
    return {
      chart: null,
      chartData: {},
      height: '300px',
      // width: '400px',
    }
  },
  props: {
    title: {
      type: String,
      default: '客户问题数量',
    },
    yData: {
      type: Array,
      required: true,
    },
    TableData: {
      type: Array,
      required: true,
    },
    width: {
      type: String,
      default: '400px',
    },
  },
  created() {
    this.handleData()
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      if (this.chart === null) {
        this.chart = this.$echarts.init(this.$refs.BarChart)
      }
      this.chart.setOption(this.chartData)
    },

    // 处理数据为chartjs格式
    async handleData() {
      let options = {
        xAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value}%',
          },
        },
        yAxis: {
          type: 'category',
          data: this.yData,
          axisLabel: {
            formatter: '{value}',
          },
        },
        legend: {
          orient: 'horizontal',
          left: 'center',
        },
        grid: {
          left: '15%',
          containLabel: true,
        },
        series: [
          {
            name: this.title,
            type: 'bar',
            data: this.TableData,
            label: {
              show: true, // 显示数据标签
              position: 'outside', // 标签显示位置，可以选择 'inside' 或 'outside'
              formatter: function (params) {
                // 只有在数据大于0时才显示标签
                return params.value == 0 ? '' : params.value + '%'
              }, // 标签显示的内容，{c} 代表当前柱子的值
              color: '#0000ff', // 标签文字颜色
            },
          },
        ],
      }
      this.chartData = { ...options }
    },
  },
}
</script>

<style>
</style>