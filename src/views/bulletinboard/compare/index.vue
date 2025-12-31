<template>
  <div class="app-container">
    <el-row :gutter="40">
      <el-col :span="17">
        <!-- 搜索 -->
        <div class="head-container">
          <el-form class="page-search" inline ref="page-filter">
            <!--时间范围 -->
            <el-form-item label="时间范围：" style="margin-right: 20px;">
              <div class="time-class">
                <div class="time-radio">
                  <el-radio-group v-model="deptReports.formatType" size="mini">
                    <el-radio-button :label="2">按日</el-radio-button>
                    <el-radio-button :label="1">按月</el-radio-button>
                  </el-radio-group>
                </div>
                <div class="time-pick">
                  <el-date-picker
                    ref="datePick"
                    v-model="timeValueArr"
                    :clearable="false"
                    :type="deptReports.formatType == 2 ? 'daterange' : 'monthrange'"
                    :key="deptReports.formatType == 2 ? 'daterange' : 'monthrange'"
                    align="right"
                    unlink-panels
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    :picker-options="deptReports.formatType == 2 ? pickerOptions : ''"
                    value-format="timestamp"
                    @change="changeTime"
                    style="padding-right: 20px;"
                  ></el-date-picker>
                </div>
              </div>
            </el-form-item>
            <el-form-item label="产品名称：" style="margin-right: 20px;">
              <el-select
                v-model="selectedProduct"
                filterable
                clearable
                placeholder="请选择产品名称"
                multiple
                style="flex: 1;"
              >
                <el-option
                  v-for="(item, index) in productList"
                  :key="index"
                  :label="item.name"
                  :value="item.code"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="el-icon-search" @click="updateDeptReports">搜索</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 图表内容 -->
        <el-row>
          <!--中间 -->
          <el-col :span="12">
            <div class="right-table">
              <div>
                <div class="table-title">销售和订单量排名</div>
                <el-radio-group v-model="selectedOptionOrder" @change="handleChange2" size="mini">
                  <el-radio-button :label="1">金额排行</el-radio-button>
                  <el-radio-button :label="2">数量排行</el-radio-button>
                </el-radio-group>
                <el-table
                  v-loading="numTableLoading"
                  :data="tableDataOrderNew"
                  border
                  style="width: 100%"
                >
                  <el-table-column label="序号" width="50" type="index"></el-table-column>
                  <el-table-column label="产品名称" show-overflow-tooltip prop="line"></el-table-column>
                  <el-table-column label="数量" prop="quantity"></el-table-column>
                  <el-table-column label="金额" prop="paymentPrice"></el-table-column>
                </el-table>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-col>
      <!--右边 -->
      <el-col :span="7">
        <div class="right-table">
          <div>
            <div class="table-title">销售和订单量排名</div>
            <el-radio-group v-model="selectedOptionOrder" @change="handleChange1" size="mini">
              <el-radio-button :label="1">金额排行</el-radio-button>
              <el-radio-button :label="2">数量排行</el-radio-button>
            </el-radio-group>
            <el-table v-loading="numTableLoading" :data="tableDataOrder" border style="width: 100%">
              <el-table-column label="序号" width="50" type="index"></el-table-column>
              <el-table-column label="产品名称" show-overflow-tooltip prop="line"></el-table-column>
              <el-table-column label="数量" prop="quantity"></el-table-column>
              <el-table-column label="金额" prop="paymentPrice"></el-table-column>
            </el-table>
          </div>
        </div>
        <!-- 
        <div class="table-bottom">
          <div class="table-title">退款退货排名</div>
          <el-radio-group v-model="selectedOptionRefund" @change="handleChange1" size="mini">
            <el-radio-button :label="3">金额排行</el-radio-button>
            <el-radio-button :label="4">数量排行</el-radio-button>
          </el-radio-group>
          <el-table v-loading="refundTableLoading" :data="tableDataRefund" border>
            <el-table-column label="序号" width="50" type="index" align="center"></el-table-column>
            <el-table-column label="产品名称" show-overflow-tooltip prop="line" align="center"></el-table-column>
            <el-table-column label="数量" prop="quantity" align="center"></el-table-column>
            <el-table-column label="金额" prop="paymentPrice" align="center"></el-table-column>
          </el-table>
        </div>
        -->
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { listSpuName } from '@/api/baseData/common'
import {
  getOrderRankingSale,
  getOrderRankingNum,
  getRefundRankingSale,
  getRefundRankingNum,
  getRankingNumNew,
  getRankingNumAmount,
} from '@/api/bulletinboard/compare'
import lineChart from '@/components/charts/LineChart.vue'
import pieChart from '@/components/charts/PieChart.vue'
import barChart from '@/components/charts/BarChart.vue'

export default {
  name: 'Compare',
  data() {
    return {
      tableDataOrderAmount: [],
      tableDataOrderNew: [],
      selectedProduct: [], // 用于存储选中的平台
      // 平台下拉框
      productList: [],
      // 订单排行版选择接收参数
      selectedOptionOrder: 1, // 销售排行榜
      selectedOptionRefund: 3, // 退款排行榜
      tableDataOrder: [], // 销售排行榜
      tableDataRefund: [], // 退款排行榜
      chartPie: null,

      // 公共入参
      deptReports: {
        formatType: 2, // 日期类型 1按月 2按日
        productName: [],
        startTime: '',
        endTime: '',
      },
      pickerOptions: {
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            },
          },
        ],
      },
      //
      timeValueArr: [],
      // 退单加载状态
      refundTableLoading: false,
      // 订单表格加载状态
      numTableLoading: false,
    }
  },
  components: { lineChart, barChart, pieChart },
  async created() {
    await this.getMonthTime()
    await this.getProductList()
    await this.handleChange() // 排行榜
    await this.handleChangeNew()
  },
  methods: {
    async updateDeptReports() {
      // 获取选中的平台名称，如果是多选需要遍历处理
      this.deptReports.productName = this.selectedProduct
      await this.handleChange()
      await this.handleChangeNew()
    },
    demoClick(value) {
      console.log('val', value)
    },

    // 设置默认时间
    getMonthTime() {
      const now = new Date()
      // 设置当月第一天
      now.setDate(1)
      // 设置时分秒为0
      now.setHours(0, 0, 0, 0)
      // 获取时间戳
      const timestamp = now.getTime() + ''
      this.timeValue = [timestamp, timestamp]
      this.deptReports.startTime = timestamp
      let endTime = new Date().getTime() + ''
      this.deptReports.endTime = endTime
      this.timeValueArr.push(timestamp)
      this.timeValueArr.push(endTime)

      // // 设置时间为4-8月(测试数据使用)
      // this.deptReports.startTime = 1711900800000
      // this.deptReports.endTime = 1724947200000
    },

    // 选择时间
    changeTime(val) {
      if (val) {
        this.deptReports.startTime = val[0]
        this.deptReports.endTime = val[1]
      }
    },

    // 获取平台
    async getProductList() {
      const res = await listSpuName()
      this.productList = res.data
    },

    // 排行榜数量-新的
    async handleChangeNew() {
      // 销售
      const res = await getRankingNumNew(this.deptReports)
      this.tableDataOrderNew = res.data

      // 销售
      const resData = await getRankingNumAmount(this.deptReports)
      this.tableDataOrderAmount = resData.data
    },

    // 排行榜
    async handleChange() {
      // 销售
      const res = await getOrderRankingSale(this.deptReports)
      this.tableDataOrder = res.data

      // 退款
      const resRefund = await getRefundRankingSale(this.deptReports)
      this.tableDataRefund = resRefund.data
    },
    // 表格排序方式切换
    async handleChange1(value) {
      switch (value) {
        // 销售金额
        case 1:
          this.numTableLoading = true
          const resOrderRankingSale = await getOrderRankingSale(
            this.deptReports
          )
          this.tableDataOrder = resOrderRankingSale.data
          this.numTableLoading = false
          break
        // 销售数量
        case 2:
          this.numTableLoading = true
          const resOrderRankingNum = await getOrderRankingNum(this.deptReports)
          this.tableDataOrder = resOrderRankingNum.data
          this.numTableLoading = false
          break
        // 退款金额
        case 3:
          this.refundTableLoading = true
          const resRefundRankingSale = await getRefundRankingSale(
            this.deptReports
          )
          this.tableDataRefund = resRefundRankingSale.data
          this.refundTableLoading = false
          break
        // 退款数量
        case 4:
          this.refundTableLoading = true
          const resRefundRankingNum = await getRefundRankingNum(
            this.deptReports
          )
          this.tableDataRefund = resRefundRankingNum.data
          this.refundTableLoading = false
          break
      }
    },
    async handleChange2(value) {
      switch (value) {
        // 销售金额
        case 1:
          this.numTableLoading = true
          const resOrderRankingSale = await getRankingNumAmount(
            this.deptReports
          )
          this.tableDataOrderNew = resOrderRankingSale.data
          this.numTableLoading = false
          break
        // 销售数量
        case 2:
          this.numTableLoading = true
          const resOrderRankingNum = await getRankingNumNew(this.deptReports)
          this.tableDataOrderNew = resOrderRankingNum.data
          this.numTableLoading = false
          break
        // 退款金额
        case 3:
          this.refundTableLoading = true
          const resRefundRankingSale = await getRefundRankingSale(
            this.deptReports
          )
          this.tableDataRefund = resRefundRankingSale.data
          this.refundTableLoading = false
          break
        // 退款数量
        case 4:
          this.refundTableLoading = true
          const resRefundRankingNum = await getRefundRankingNum(
            this.deptReports
          )
          this.tableDataRefund = resRefundRankingNum.data
          this.refundTableLoading = false
          break
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.left_top {
  display: flex;
  justify-content: center;
  margin: 20px 0;

  .text {
    font-size: 22px;
    margin-bottom: 10px;
    margin-right: 10px;
    border-radius: 5px;
    width: 11vw;
    height: 16vh;
    background-color: #d6ab4d;
    color: #fff;
    font-weight: 600;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .number {
      margin-top: 5px;
    }
  }

  .text1 {
    background-color: #4d7fff;
  }
}

.head-container {
  margin-top: 20px;

  .time-class {
    margin-top: -32px;

    .time-pick {
      margin-top: -4px;
    }
  }
}

.main-line {
  margin-top: 60px;
}

.main-table {
  margin-top: -20px;
}

.right-table {
  .table-top {
    margin-top: 20px;
  }

  .table-bottom {
    margin-top: 60px;
  }

  .table-title {
    font-weight: 600;
    margin-bottom: 15px;
  }
}

.compare {
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: center;

  .text {
    flex: 1;
    font-size: 16px;
  }

  .number {
    flex: 1;
  }
}
</style>
