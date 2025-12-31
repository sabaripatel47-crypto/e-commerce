<template>
  <div class="statistics">
    <div class="statistics-container">
      <el-table v-loading="tableLoading" :data="tableDataList" border style="width: 100%">
        <el-table-column type="index" width="40" show-overflow-tooltip></el-table-column>
        <el-table-column
          prop="skuCode"
          label="SKU编码"
          align="center"
          width="200"
          show-overflow-tooltip
        >
          <template slot-scope="{row}">
            <div>{{ formatTableItemCode(row.skuCode) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="spaceName"
          label="规格名称"
          align="center"
          width="200"
          show-overflow-tooltip
        >
          <template slot-scope="{row}">
            <div>{{ formatTableItemCode(row.spaceName) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="time"
          :label="item"
          v-for="(item, index) in timeTableArr"
          :key="`sku-${index}`"
          min-width="90"
        >
          <template slot-scope="{row}">
            <div v-if="STA_KEY_ARR.includes(statisticsType)">
              <div
                :class="{ 'item-red': setItemColor(row.origin[index][0]) === 'red', 'item-green': setItemColor(row.origin[index][0]) === 'green' }"
              >同比：{{ row.origin[index][0] }};</div>
              <div
                :class="{ 'item-red': setItemColor(row.origin[index][1]) === 'red', 'item-green': setItemColor(row.origin[index][1]) === 'green' }"
              >环比：{{ row.origin[index][1] }}</div>
            </div>
            <div v-else>{{ row[item] }}</div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="80" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              :disabled="STA_KEY_ARR.includes(statisticsType)"
              @click="getLinkSkuLineOptions(tableDataList , scope.row)"
            >趋势</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog
      width="70%"
      title="链接趋势"
      :visible.sync="showLinkSkuLine"
      append-to-body
      style="overflow-x: auto;"
    >
      <line-chart
        v-if="showLinkSkuLine"
        :option="lineChartOption"
        :chartData="lineChartOption"
        :height="'320px'"
      ></line-chart>
    </el-dialog>
  </div>
</template>

<script>
import lineChart from '@/components/charts/LineChart.vue'
import { setItemColor } from '@/utils/statisticsCommon.js'
export default {
  name: 'LinkSkuStatistic',
  components: { lineChart },
  props: {
    // 同比环比的数据配置key
    STA_KEY_ARR: {
      type: Array,
      default: () => {
        return []
      },
    },
    // 时间列头
    timeTableArr: {
      type: Array,
      default: () => {
        return []
      },
    },
    // 列表加载状态
    tableLoading: {
      type: Boolean,
      default: false,
    },
    // 统计类型
    statisticsType: {
      type: Number,
      default: null,
    },
    // 数据列表
    tableDataList: {
      type: Array,
      default: () => {
        return []
      },
    },
  },
  components: { lineChart },
  data() {
    return {
      // 展示链接趋势图
      showLinkSkuLine: false,
      // 趋势图折线数据
      lineChartOption: {},
    }
  },
  created() {},
  methods: {
    // 链接趋势图
    getLinkSkuLineOptions(data, row) {
      this.showLinkSkuLine = true
      this.lineChartOption = {}
      const option = {
        title: {
          text:
            row.spaceName +
            '-' +
            this.$store.state.statistics.GRADETYPE_NAME[this.statisticsType],
          left: 'center',
        },
        tooltip: {
          formatter:
            this.statisticsType === 7
              ? '{a} <br/>{b}  {c}%'
              : '{a} <br/>{b}  {c}',
        },
        legend: { orient: 'vertical', left: 'left', data: [] },
        xAxis: { data: this.timeTableArr }, // 时间点集合
        yAxis: { type: 'value' },
        series: [],
      }

      // 如果是退款率 去除退款率后的%
      if (this.statisticsType === 7) {
        row.origin = row.origin.map((el) => {
          if (el) {
            el = el.split('%').join('')
          }
          return el
        })
      }
      console.log('row.origin', row.origin)

      option.series.push({
        name: row.spaceName,
        type: 'line',
        data: [...row.origin],
      })

      this.$nextTick(() => {
        this.lineChartOption = { ...option }
      })
    },

    // 关闭明细页面
    closeDialog() {
      this.$emit('closeDialog')
    },

    // 转换表格内容空的为-
    formatTableItemCode(str) {
      return str ?? '-'
    },

    // 设置单元格颜色
    setItemColor(origin) {
      return setItemColor(origin)
    },
  },
}
</script>

<style lang="scss" scoped>
.statistics-container {
  .time-class {
    margin-top: -32px;

    .time-pick {
      margin-top: -4px;
    }
  }
  .item-red {
    color: red;
  }

  .item-green {
    color: green;
  }
}
</style>