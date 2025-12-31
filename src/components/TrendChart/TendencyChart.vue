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

    <!-- 上方：左右两个表格 -->
    <div style="display: flex; gap: 20px; margin-bottom: 20px">
      <!-- 左侧表格：帮扶复核数据（占40%宽度） -->
      <div v-if="showLeftTable" style="flex: 0 0 40%; min-width: 0">
        <el-table
          v-loading="supportTableLoading"
          border
          max-height="400"
          :data="supportTableData"
          empty-text="暂无数据"
        >
          <el-table-column label="时间" prop="timeStamp" align="center" width="120">
            <template v-slot="{ row }">
              <span>{{ getFormaMonth(row.timeStamp) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="帮扶复核量" prop="supportNum" align="center">
            <template v-slot="{ row }">
              <span>{{ row.supportNum || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="实际销售量" prop="actualNum" align="center">
            <template v-slot="{ row }">
              <span>{{ row.actualNum || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="帮扶达成情况" prop="supportComplete" align="center" width="120">
            <template #header>
              <el-tooltip class="item" effect="dark" content="越趋近于1越好" placement="top-start">
                <span>
                  帮扶达成情况
                  <i class="el-icon-question"></i>
                </span>
              </el-tooltip>
            </template>
            <template v-slot="{ row }">
              <span>
                {{
                typeof row.supportComplete === 'number'
                ? row.supportComplete.toFixed(2) + '%'
                : '-'
                }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 右侧表格：平均数据（占60%宽度） -->
      <div style="flex: 1; min-width: 0">
        <el-table
          v-loading="tableLoading"
          border
          max-height="400"
          :data="tableData"
          empty-text="暂无数据"
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
      </div>
    </div>

    <!-- 下方：趋势折线图 -->
    <div v-loading="chartLoading">
      <trend-line-chart ref="lineChartRef" :option="lineChartOption" :height="'400px'"></trend-line-chart>
    </div>
  </div>
</template>

<script>
import TrendLineChart from './TrendLineChart.vue'
import { getFormatDate, getFormaMonth } from '@/utils/common'
// 采购管理相关接口
import {
  getLineChart,
  getTrendTable,
  getSupportTrendTable,
  getTrendInfo,
} from '@/api/purchasingManagement/common'

/**
 * SKU趋势图组件
 * 用于采购相关模块的趋势图展示
 * 包含：SKU信息、帮扶复核表格、平均数据表格、折线图
 *
 * 布局说明：
 * - 顶部：SKU基本信息（产品名称、SKU编码、规格名称）
 * - 中部：左右两个表格
 *   - 左表（40%）：帮扶复核数据（时间、帮扶复核量、实际销售量、帮扶达成情况）
 *   - 右表（60%）：平均数据（销售量、退货量、实际销售量、平均每日数据）
 * - 底部：趋势折线图（实际数量、退货数量、销售数量）
 *
 * 使用场景：
 * - 帮扶审核
 * - 帮扶复核
 * - 停止打爆申请
 * - 采购记录详情
 * - SKU销售报表
 */
export default {
  name: 'TendencyChart',
  components: {
    TrendLineChart,
  },
  props: {
    // SKU的UUID（必填）
    skuUuid: {
      type: String,
      default: '',
    },
    // 链接ID（可选，用于获取SKU信息）
    linkId: {
      type: String,
      default: '',
    },
    showLeftTable: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      lineChartOption: null, // 折线图配置
      chartLoading: false, // 折线图加载状态
      tableData: [], // 右侧表格数据（平均数据）
      tableLoading: false, // 右侧表格加载状态
      supportTableData: [], // 左侧表格数据（帮扶复核数据）
      supportTableLoading: false, // 左侧表格加载状态
      skuInfo: {}, // SKU信息
      skuInfoLoading: false, // SKU信息加载状态
    }
  },
  created() {
    // this.initData()
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
     * 初始化数据
     * 并行加载SKU信息、帮扶复核表格、平均数据表格、折线图数据
     */
    async initData() {
      if (!this.skuUuid) {
        this.$message.warning('缺少SKU标识，无法查看趋势图')
        return
      }
      await Promise.all([
        this.getSkuInfo(),
        this.getSupportTableData(),
        this.getTableData(),
        this.getLineChartOption(),
      ])
    },

    /**
     * 获取SKU信息
     * 接口：/server/purchase/getTrendInfo
     * 参数：linkId（可选）、skuUuid（必填）
     */
    async getSkuInfo() {
      this.skuInfoLoading = true
      try {
        const res = await getTrendInfo({
          linkId: this.linkId || '',
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
     * 获取帮扶复核表格数据（左侧表格）
     * 接口：/server/purchase/getSupportTrendTable
     * 参数：skuUuid
     * 返回：时间、帮扶复核量、实际销售量、帮扶达成情况
     */
    async getSupportTableData() {
      this.supportTableLoading = true
      try {
        const res = await getSupportTrendTable(this.skuUuid)
        if (res && res.code === 200) {
          if (Array.isArray(res.data)) {
            this.supportTableData = res.data || []
          } else if (res.data && typeof res.data === 'object') {
            this.supportTableData = [res.data]
          } else {
            this.supportTableData = []
          }
        } else {
          this.supportTableData = []
        }
      } catch (error) {
        console.error('获取帮扶复核表格数据失败:', error)
        this.supportTableData = []
      } finally {
        this.supportTableLoading = false
      }
    },

    /**
     * 获取平均数据表格（右侧表格）
     * 接口：/server/purchase/getTrendTable
     * 参数：skuUuid
     * 返回：销售量、退货量、实际销售量、平均每日数据
     */
    async getTableData() {
      this.tableLoading = true
      try {
        const res = await getTrendTable(this.skuUuid)
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
     * 接口：/server/purchase/getLineChart
     * 参数：skuUuid
     * 返回：时间序列的实际数量、退货数量、销售数量
     */
    async getLineChartOption() {
      this.chartLoading = true
      try {
        const res = await getLineChart(this.skuUuid)
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

    getFormaMonth(timeStamp) {
      return getFormaMonth(+timeStamp)
    },
  },
}
</script>

<style lang="scss" scoped></style>
