<template>
  <el-dialog
    :visible.sync="dialogVisible"
    title="SPU趋势图"
    width="70%"
    :append-to-body="appendToBody"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    @close="closeDialog"
    @opened="handleDialogOpened"
  >
    <!-- 货品名称 -->
    <div style="margin-bottom: 15px; padding: 10px; background: #f5f7fa; border-radius: 4px">
      <span style="color: #909399">货品名称：</span>
      <span style="font-weight: 500">{{ spuShowName || '-' }}</span>
    </div>

    <!-- 表格 -->
    <el-table v-loading="tableLoading" border max-height="400" :data="tableData" empty-text="暂无数据">
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

    <!-- 折线图 -->
    <div v-loading="chartLoading">
      <trend-line-chart ref="lineChartRef" :option="lineChartOption" :height="'400px'"></trend-line-chart>
    </div>
  </el-dialog>
</template>

<script>
import TrendLineChart from './TrendLineChart.vue'
import { getFormatDate } from '@/utils/common'
import {
  getSpuLineChart,
  getSpuTrendTable,
} from '@/api/purchasingManagement/common'

/**
 * SPU趋势图组件
 * 用于SPU销售报表的趋势图展示
 * 包含：货品名称、趋势数据表格、折线图
 *
 * 布局说明：
 * - 顶部：货品名称展示
 * - 中部：趋势数据表格（销售量、退货量、实际销售量、平均每日数据）
 * - 底部：趋势折线图（实际数量、退货数量、销售数量）
 *
 * 使用场景：
 * - SPU销售报表
 */
export default {
  name: 'SpuTrendChart',
  components: {
    TrendLineChart,
  },
  props: {
    // 控制弹窗显示
    showDialog: {
      type: Boolean,
      default: false,
    },
    // SPU的UUID（必填）
    spuUuid: {
      type: String,
      default: '',
    },
    // 货品名称（用于展示）
    spuShowName: {
      type: String,
      default: '',
    },
    // 是否追加到body
    appendToBody: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      dialogVisible: false, // 弹窗显示状态
      lineChartOption: null, // 折线图配置
      chartLoading: false, // 折线图加载状态
      tableData: [], // 表格数据
      tableLoading: false, // 表格加载状态
    }
  },
  watch: {
    showDialog: {
      handler(newVal) {
        this.dialogVisible = newVal
      },
      immediate: true,
    },
  },
  methods: {
    /**
     * 弹窗打开后的回调
     * 通过@opened事件触发
     */
    handleDialogOpened() {
      this.$nextTick(() => {
        if (this.spuUuid) {
          this.initData()
        } else {
          console.warn('SpuTrendChart: spuUuid 为空')
        }
      })
    },

    /**
     * 初始化数据
     * 并行加载表格数据和折线图数据
     */
    async initData() {
      if (!this.spuUuid) {
        this.$message.warning('缺少SPU标识，无法查看趋势图')
        return
      }
      await Promise.all([this.getTableData(), this.getLineChartOption()])
    },

    /**
     * 获取SPU趋势图表格数据
     * 接口：/server/purchase/getTrendTable
     * 参数：spuUuid
     * 返回：销售量、退货量、实际销售量、平均每日数据
     */
    async getTableData() {
      this.tableLoading = true
      try {
        const res = await getSpuTrendTable(this.spuUuid)
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
        console.error('获取SPU趋势图表格数据失败:', error)
        this.$message.error('获取SPU趋势图表格数据失败')
        this.tableData = []
      } finally {
        this.tableLoading = false
      }
    },

    /**
     * 获取SPU折线图数据并生成ECharts配置
     * 接口：/server/movement/spu_movement/chart
     * 参数：spuUuid
     * 返回：时间序列的实际数量、退货数量、销售数量
     */
    async getLineChartOption() {
      this.chartLoading = true
      try {
        const res = await getSpuLineChart(this.spuUuid)
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
        console.error('获取SPU趋势图折线数据失败:', error)
        this.$message.error('获取SPU趋势图折线数据失败')
      } finally {
        this.chartLoading = false
      }
    },

    /**
     * 关闭弹窗
     */
    closeDialog() {
      this.dialogVisible = false
      this.$emit('update:showDialog', false)
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
