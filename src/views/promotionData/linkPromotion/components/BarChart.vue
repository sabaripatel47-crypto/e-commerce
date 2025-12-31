<template>
  <div
    class="bar-chat"
    ref="barChart"
    :style="{ width: width, height: height }"
  ></div>
</template>

<script>
export default {
  name: "BarChart",
  data() {
    return {
      chart: null,
      xAxisData: [],
      seriesData1: [],
      seriesData2: [],
      titleText: "",
    };
  },
  props: {
    width: {
      default: "600px",
    },
    height: {
      default: "300px",
    },
    option: {
      default: {},
    },
  },
  created() {
    this.handleData(this.option);
  },
  methods: {
    // 数据处理
    handleData(data) {
      this.titleText = data.categoryKeyUuid;
      this.xAxisData = data.maoCrowdAnalysisChartVO.map(
        (item) => item.categoryVlue
      );
      this.seriesData1 = data.maoCrowdAnalysisChartVO.map(
        (item) => item.analysisProportion
      );

      this.seriesData2 = data.maoCrowdAnalysisChartVO.map(
        (item) => item.comparisonProportion
      );
    },
    //
    init() {
      if (this.chart === null) {
        this.chart = this.$echarts.init(this.$refs.barChart);
      }
      // 在这里动态更新 x 轴数据和 series 数据
      this.chart.setOption({
        ...this.option,
        title: {
          text: this.titleText, // 使用传入的自定义标题
          left: "right",
        },
        xAxis: {
          ...this.option.xAxis,
          data: this.xAxisData, // 使用传入的 x 轴数据
          axisLabel: {
            rotate: 45, // 旋转45度
          },
        },
        yAxis: {
          type: "value",
          axisLabel: {
            formatter: "{value}%",
          },
        },
        legend: {
          data: ["分析人群占比", "对比人群占比"], // 设置图例的名称
          left: "left", // 可以调整图例的位置
          top: "top", // 设置图例在顶部显示
        },
        series: [
          {
            name: "分析人群占比", // 第一条柱状图
            type: "bar",
            data: this.seriesData1, // 使用传入的第一组数据
            label: {
              show: true,
              position: "outside",
              formatter: function (params) {
                // 只有在数据大于0时才显示标签
                return params.value === 0
                  ? ""
                  : (params.value * 100).toFixed(2) + "%";
              },
              fontSize: 10,
            },
            barCategoryGap: "20%", // 设置柱状图之间的间距
          },
          {
            name: "对比人群占比", // 第二条柱状图
            type: "bar",
            data: this.seriesData2, // 使用传入的第二组数据
            label: {
              show: true,
              position: "outside",
              formatter: function (params) {
                // 只有在数据大于0时才显示标签
                return params.value === 0
                  ? ""
                  : (params.value * 100).toFixed(2) + "%";
              },
              fontSize: 10,
            },
            barGap: "70%",
          },
        ],
      });
    },
  },
  mounted() {
    this.init();
  },
  watch: {
    option() {
      this.init();
    },
    xAxisData() {
      this.init();
    },
    // 当系列数据发生变化时重新初始化图表
    seriesData1() {
      this.init();
    },
    seriesData2() {
      this.init();
    },
    // 保留两位小数并转成百分比
    getPercentage(num) {
      if (!num) {
        return;
      }
      let numBer = Math.floor((num * 10000).toFixed(1)) / 100;
      numBer = numBer + "%";
      return numBer;
    },
  },
};
</script>

<style lang="less">
</style>
