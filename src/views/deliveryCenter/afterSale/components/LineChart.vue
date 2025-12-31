<template>
  <div>
    <div class="line-chat" ref="LineChart" :style="{height:height}"></div>
  </div>
</template>

<script>
// import { init } from 'echarts'
export default {
  name: 'LineChart',
  data(){
    return{
      chart: null,
      height: '300px',
      chartData: {}
    }
  },
  props:{
    xData: {
        type: Array,
        default: () => []
      },
      TableData: {
        type:Array,
        default: () => []
      },
      chartName: {
        type: String,
        default: () => ''
      },
  },
  mounted(){
    this.init()
  },
  created(){
    this.handleData()
  },
  methods:{
    init() {
      if (this.chart === null) {
        this.chart = this.$echarts.init(this.$refs.LineChart)
      }
      this.chart.setOption(this.chartData)
    },
    handleData() {
      let options = {
        xAxis: {
          type: 'category',
          data: this.xData
        },
        yAxis: {
type: 'value'
        },
        legend: {
          orient: 'horizontal',
          left: 'center',
        },
        grid: {
          left: "2%",
          containLabel: true
        },
        series: [
          {
            name: this.chartName,
            type: 'line',
            data:this.TableData,
            label: {
              show: true,       // 启用数据标签
              position: 'top',  // 标签位置（在柱子顶部）
              valueAnimation: true, // 启用数值的动画效果
              formatter: '{c}'  // 格式化标签内容，这里直接显示数值
            }
          },
        ]
      }
      this.chartData = {...options}
    },
  }
}
</script>

<style>

</style>