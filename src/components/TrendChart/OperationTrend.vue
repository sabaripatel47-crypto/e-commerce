<template>
  <div style="width: 100%;">
    <!-- SKU信息展示区域 -->
    <div
      v-loading="skuInfoLoading"
      style="margin-bottom: 15px; padding: 10px; background: #f5f7fa; border-radius: 4px"
    >
      <span style="margin-right: 20px">
        <span style="color: #909399">产品名称：</span>
        <span style="font-weight: 500">{{ skuInfo.spuShowName || '-' }}</span>
      </span>
      <span style="margin-right: 20px">
        <span style="color: #909399">SKU编码：</span>
        <span style="font-weight: 500">{{ skuInfo.skuCode || '-' }}</span>
      </span>
      <span>
        <span style="color: #909399">规格名称：</span>
        <span style="font-weight: 500">{{ skuInfo.specsName || '-' }}</span>
      </span>
    </div>

    <!-- 趋势数据表格 -->
    <el-table
      v-loading="tableLoading"
      border
      max-height="400"
      :data="tableData"
      empty-text="暂无数据"
      style="margin-bottom: 20px"
    >
      <el-table-column width="80" prop="sortName" align="center"></el-table-column>
      <el-table-column label="销售量" prop="saleNum" align="center">
        <template v-slot="{ row }">
          <span>
            {{
            typeof row.saleNum === 'number'
            ? row.saleNum
            : '-'
            }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="退货量" prop="refundNum" align="center">
        <template v-slot="{ row }">
          <span>
            {{
            typeof row.refundNum === 'number'
            ? row.refundNum
            : '-'
            }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="实际销售量" prop="actualNum" align="center">
        <template v-slot="{ row }">
          <span>
            {{
            typeof row.actualNum === 'number'
            ? row.actualNum
            : '-'
            }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="平均每日销售量" prop="avgSaleNum" align="center">
        <template v-slot="{ row }">
          <span>
            {{
            typeof row.avgSaleNum === 'number' ? row.avgSaleNum.toFixed(2) : '-'
            }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="平均每日退货量" prop="avgRefundNum" align="center">
        <template v-slot="{ row }">
          <span>
            {{
            typeof row.avgRefundNum === 'number'
            ? row.avgRefundNum.toFixed(2)
            : '-'
            }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="平均每日实际销售量" prop="avgActualNum" align="center">
        <template v-slot="{ row }">
          <span>
            {{
            typeof row.avgActualNum === 'number'
            ? row.avgActualNum.toFixed(2)
            : '-'
            }}
          </span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 趋势折线图 -->
    <div v-loading="chartLoading">
      <trend-line-chart ref="lineChartRef" :option="lineChartOption" :height="'400px'"></trend-line-chart>
    </div>
  </div>
</template>

<script>
import TrendLineChart from './TrendLineChart.vue'
import { getFormatDate } from '@/utils/common'
// 运营管理相关接口
import {
  getTrendTableList,
  getTrendLineList,
} from '@/api/operationManage/common'
// SKU信息接口
import { getTrendInfo } from '@/api/purchasingManagement/common'

/**
 * 运营趋势图组件
 * 用于运营相关模块的趋势图展示
 * 包含：SKU信息、趋势数据表格、折线图
 *
 * 使用场景：
 * - 停止打爆审核
 * - 运营申请
 * - 爆品申请
 * - 补单申请
 */
export default {
  name: 'OperationTrend',
  components: {
    TrendLineChart,
  },
  props: {
    // SKU的UUID（必填）
    skuUuid: {
      type: String,
      default: '',
    },
    // 链接ID（必填）
    linkId: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      lineChartOption: null, // 折线图配置
      chartLoading: false, // 折线图加载状态
      tableData: [], // 表格数据
      tableLoading: false, // 表格加载状态
      skuInfo: {}, // SKU信息
      skuInfoLoading: false, // SKU信息加载状态
    }
  },
  watch: {
    skuUuid: {
      handler(newVal) {
        // 当弹窗打开且参数齐全时，立即加载数据
        // 注意：使用v-if时，组件创建时props已有值，watch会立即触发
        if (newVal) {
          this.$nextTick(() => {
            this.initData()
          })
        }
      },
      immediate: true,
    },
  },
  methods: {
    /**
     * 弹窗打开后的回调
     * 作为@opened事件的备用触发机制
     */
    handleDialogOpened() {
      this.$nextTick(() => {
        if (this.skuUuid) {
          this.initData()
        } else {
          console.warn('OperationTrendDialog: skuUuid为空')
        }
      })
    },

    /**
     * 初始化数据
     * 并行加载SKU信息、表格数据、折线图数据
     */
    async initData() {
      if (!this.skuUuid) {
        this.$message.warning('缺少SKU标识，无法查看趋势图')
        return
      }
      await Promise.all([
        this.getSkuInfo(),
        this.getTableData(),
        this.getLineChartOption(),
      ])
    },

    /**
     * 获取SKU信息
     * 接口：/server/purchase/getTrendInfo
     * 参数：linkId（必填）、skuUuid（必填）
     */
    async getSkuInfo() {
      this.skuInfoLoading = true
      try {
        const res = await getTrendInfo({
          linkId: this.linkId,
          skuUuid: this.skuUuid,
        })
        if (res && res.code === 200 && res.data) {
          this.skuInfo = res.data
        } else {
          this.skuInfo = {}
        }
      } catch (error) {
        console.error('获取SKU信息失败:', error)
        this.skuInfo = {}
      } finally {
        this.skuInfoLoading = false
      }
    },

    /**
     * 获取趋势图表格数据
     * 接口：/server/operation/getTrendTable
     * 参数：linkId、skuUuid
     */
    async getTableData() {
      this.tableLoading = true
      try {
        const params = { linkId: this.linkId, skuUuid: this.skuUuid }
        const res = await getTrendTableList(params)
        if (res && res.code === 200) {
          if (Array.isArray(res.data)) {
            this.tableData = res.data || []
          } else if (res.data && typeof res.data === 'object') {
            this.tableData = [res.data]
          } else {
            this.tableData = []
          }
        } else {
          this.tableData = []
        }
      } catch (error) {
        console.error('获取趋势图表格数据失败:', error)
        this.$message.error('获取趋势图表格数据失败')
        this.tableData = []
      } finally {
        this.tableLoading = false
      }
    },

    /**
     * 获取折线图数据并生成ECharts配置
     * 接口：/server/operation/getLineChart
     * 参数：linkId、skuUuid
     */
    async getLineChartOption() {
      this.chartLoading = true
      try {
        const params = { linkId: this.linkId, skuUuid: this.skuUuid }
        const res = await getTrendLineList(params)
        let data = []
        if (res && res.code === 200) {
          data = res.data || []
        }

        if (!data || data.length === 0) {
          this.$message.warning('暂无趋势图数据')
          this.chartLoading = false
          return
        }

        // 构建ECharts配置
        const option = {
          tooltip: {
            trigger: 'axis',
            formatter: function (params) {
              let result = params[0].axisValue + '<br/>'
              params.forEach(function (item) {
                result +=
                  item.marker + item.seriesName + ': ' + item.value + '<br/>'
              })
              return result
            },
          },
          legend: {
            left: 'center',
            data: ['实际数量', '退货数量', '销售数量'],
          },
          xAxis: {
            type: 'category',
            data: data.map((item) => this.getFormatDate(item.saleTime)),
          },
          yAxis: {
            type: 'value',
          },
          series: [
            {
              name: '实际数量',
              type: 'line',
              data: data.map((item) => {
                return typeof item.actualQuantity === 'number'
                  ? Number(item.actualQuantity.toFixed(2))
                  : 0
              }),
            },
            {
              name: '退货数量',
              type: 'line',
              data: data.map((item) => {
                return typeof item.returnQuantity === 'number'
                  ? Number(item.returnQuantity.toFixed(2))
                  : 0
              }),
            },
            {
              name: '销售数量',
              type: 'line',
              data: data.map((item) => {
                return typeof item.saleQuantity === 'number'
                  ? Number(item.saleQuantity.toFixed(2))
                  : 0
              }),
            },
          ],
        }

        this.$nextTick(() => {
          this.lineChartOption = { ...option }
        })
      } catch (error) {
        console.error('获取趋势图折线数据失败:', error)
        this.$message.error('获取趋势图折线数据失败')
      } finally {
        this.chartLoading = false
      }
    },

    /**
     * 时间戳格式化
     * @param {Number} timeStamp - 时间戳
     * @returns {String} 格式化后的日期字符串
     */
    getFormatDate(timeStamp) {
      return getFormatDate(+timeStamp)
    },
  },
}
</script>

<style lang="scss" scoped></style>
