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
          type: 'value',
          axisLabel:{
            formatter:'{value}%'
          }
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
                show: true,  // 显示数据标签
                position: 'outside',  // 标签显示位置，可以选择 'inside' 或 'outside'
                formatter: function (params) {
                // 只有在数据大于0时才显示标签
                return params.value == 0 ? '' : (params.value + '%');
            },  // 标签显示的内容，{c} 代表当前柱子的值
            },
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