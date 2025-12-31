<template>
  <div class="app-container">
    <el-row :gutter="40">
      <el-col :span="17">
        <!-- 搜索 -->
        <div class="head-container">
          <el-form class="page-search" inline ref="page-filter">
            <!--时间范围 -->
            <el-form-item label="时间范围：" style="margin-right: 20px;">
              <el-date-picker
                v-model="timeValueArr"
                :clearable="false"
                type="daterange"
                align="right"
                unlink-panels
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :picker-options="pickerOptions"
                value-format="timestamp"
                @change="changeTime"
                style="padding-right: 20px;"
              ></el-date-picker>
            </el-form-item>
            <el-form-item label="部门名称：" style="margin-right: 20px;">
              <el-cascader
                v-model="departments"
                :options="departOptions"
                :show-all-levels="false"
                :props="{ children: 'children', label: 'deptName', value: 'deptId', multiple: true, checkStrictly: true }"
                clearable
              ></el-cascader>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="el-icon-search" @click="updateDeptReports">搜索</el-button>
            </el-form-item>
          </el-form>
        </div>
        <!-- 总数据 -->
        <div class="left_top">
          <div class="text1 text">
            <div>总销售额</div>
            <div class="number">{{ allAmountData }} 元</div>
          </div>
          <div class="text">
            <div>总订单数</div>
            <div class="number">{{ allOrderNumData }} 个</div>
          </div>
          <div class="text1 text">
            <div>客单价</div>
            <div class="number">{{ customerPriceData }} 元</div>
          </div>
          <div class="text">
            <div>退款额</div>
            <div class="number">{{ refundAmountData }} 元</div>
          </div>
          <div class="text1 text">
            <div>退款数</div>
            <div class="number">{{ refundNumData }} 个</div>
          </div>
        </div>
        <!-- 图表内容 -->
        <el-row>
          <!-- 左边 -->
          <el-col :span="12">
            <!-- <div ref="pieChart" style="width: 450px; height: 300px;"></div> -->
            <!-- 订单数 -->
            <pie-chart :option="pieChartNumOption" :height="'350px'"></pie-chart>
            <!-- 订单额 -->
            <pie-chart :option="pieChartAmountOption" :height="'350px'"></pie-chart>
            <!-- 种菜 -->
            <pie-chart :option="pieChartBottomOption" :height="'350px'"></pie-chart>
          </el-col>

          <!--中间 -->
          <el-col :span="12">
            <!-- <div id="myChartjw" style="width:500px; height:400px;"></div> -->
            <!-- 柱状图 -->
            <div class="main-bar">
              <bar-chart :option="barChartOption" :height="'400px'"></bar-chart>
              <!-- 同比环比部分 -->
              <div class="main-table" v-show="amountYoyMom.length > 0">
                <el-table :data="percentageType">
                  <el-table-column prop="name" width="80" fixed align="center"></el-table-column>
                  <template v-for="item in amountYoyMom">
                    <el-table-column :label="item.time" align="center">
                      <template v-slot="{ row }">
                        {{ item[row.valueName] ? (item[row.valueName]).toFixed(2) : 0
                        }}
                      </template>
                    </el-table-column>
                  </template>
                </el-table>
              </div>
            </div>
            <!-- 折线图 -->
            <div class="main-line">
              <line-chart :option="lineChartOption" :height="'400px'"></line-chart>
              <!-- 同比环比部分 -->
              <div class="main-table" v-show="numYoyMom.length > 0">
                <el-table :data="percentageType">
                  <el-table-column prop="name" width="80" fixed align="center"></el-table-column>
                  <template v-for="item in numYoyMom">
                    <el-table-column :label="item.time" align="center">
                      <template v-slot="{ row }">
                        {{ item[row.valueName] ? (item[row.valueName]).toFixed(2) : 0
                        }}
                      </template>
                    </el-table-column>
                  </template>
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
              <el-table-column label="业务员" show-overflow-tooltip prop="line"></el-table-column>
              <el-table-column label="数量" prop="quantity"></el-table-column>
              <el-table-column label="金额" prop="paymentPrice"></el-table-column>
            </el-table>
          </div>

          <div class="table-bottom">
            <div class="table-title">退款退货排名</div>
            <el-radio-group v-model="selectedOptionRefund" @change="handleChange1" size="mini">
              <el-radio-button :label="3">金额排行</el-radio-button>
              <el-radio-button :label="4">数量排行</el-radio-button>
            </el-radio-group>
            <el-table v-loading="refundTableLoading" :data="tableDataRefund" border>
              <el-table-column label="序号" width="50" type="index" align="center"></el-table-column>
              <el-table-column label="业务员" show-overflow-tooltip prop="line" align="center"></el-table-column>
              <el-table-column label="数量" prop="quantity" align="center"></el-table-column>
              <el-table-column label="金额" prop="paymentPrice" align="center"></el-table-column>
            </el-table>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { getDepartmentList } from '@/api/publicDepartment'
import { getDeptTreeData } from '@/utils/common'
import { listSpuName } from '@/api/baseData/common'
import {
  getOverview,
  getOrderNum,
  getOrderSale,
  getOrderNumHistogram,
  getOrderSalesLineChart,
  getOrderRankingSale,
  getOrderRankingNum,
  getRefundRankingSale,
  getRefundRankingNum,
} from '@/api/bulletinboard/department'
import lineChart from '@/components/charts/LineChart.vue'
import pieChart from '@/components/charts/PieChart.vue'
import barChart from '@/components/charts/BarChart.vue'

export default {
  name: 'Department',
  data() {
    return {
      //部门人员的下拉框
      departments: [],
      // 部门级联多选
      departOptions: [], // 用于存储选中的平台
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
        deptId: [],
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
      // 订单量数据
      pieChartNumOption: {},

      // 种菜推广数据
      pieChartBottomOption: {},

      // 订单额数据
      pieChartAmountOption: {},

      // 中间柱状图数据
      barChartOption: {},

      // 中间折线图数据
      lineChartOption: {},
      // 单量同环比
      numYoyMom: [],

      // 单额同环比
      amountYoyMom: [],

      // 同比环比表格模板
      percentageType: [
        { name: '同比(%)', valueName: 'yoy' },
        { name: '环比(%)', valueName: 'mom' },
      ],

      // 获取数据总览
      allAmountData: '',
      allOrderNumData: '',
      customerPriceData: '',
      refundAmountData: '',
      refundNumData: '',
      promotionData: '',
      growVgetablesData: '',
    }
  },
  components: { lineChart, barChart, pieChart },
  async created() {
    await this.getMonthTime()
    await this.getProductList() // 产品下拉框
    await this.getDeptTree() // 部门下拉框
    await this.getOverviewList() // 数据总览
    await this.createChart() // 数量饼状图
    await this.progressBar() // 柱状图
    await this.createChartSale() // 金额饼状图
    await this.mounted() // 折线图
    await this.createChartVg() // 种菜饼状图
    await this.handleChange() // 排行榜
  },
  methods: {
    // 负责人组织架构数据
    async getDeptTree() {
      const res = await getDepartmentList()
      const newData = await getDeptTreeData(res.data)
      this.departOptions = newData
      console.log(this.departOptions)
    },
    updateDeptReports() {
      // 提取每个子数组的最后一个元素，形成一个新的集合
      const newArr = this.departments.map((subArray) => {
        return subArray[subArray.length - 1] // 获取每个子数组的最后一个元素
      })
      console.log(newArr)
      this.deptReports.deptId = newArr
      this.progressBar(this.deptReports)
      this.mounted(this.deptReports)
      this.getOverviewList(this.deptReports)
      this.createChart(this.deptReports)
      this.createChartSale(this.deptReports)
      this.createChartVg(this.deptReports)
      this.handleChange()
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

    // 排行榜
    async handleChange() {
      //销售
      const res = await getOrderRankingSale(this.deptReports)
      this.tableDataOrder = res.data

      //退款
      const resRefund = await getRefundRankingSale(this.deptReports)
      this.tableDataRefund = resRefund.data
    },
    //
    async handleChange1(value) {
      switch (value) {
        case 1:
          this.numTableLoading = true
          const resOrderRankingSale = await getOrderRankingSale(
            this.deptReports
          )
          this.tableDataOrder = resOrderRankingSale.data
          this.numTableLoading = false
          break
        case 2:
          this.numTableLoading = true
          const resOrderRankingNum = await getOrderRankingNum(this.deptReports)
          this.tableDataOrder = resOrderRankingNum.data
          this.numTableLoading = false
          break
        case 3:
          this.refundTableLoading = true
          const resRefundRankingSale = await getRefundRankingSale(
            this.deptReports
          )
          this.tableDataRefund = resRefundRankingSale.data
          this.refundTableLoading = false
          break
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
    // 折线图
    async mounted() {
      const res = await getOrderSalesLineChart(this.deptReports)
      console.log(res)
      const memberAmountData = res.data.map((item) => item.mermbAmount)
      // 提取渲染同比环比表格数据
      this.numYoyMom = memberAmountData
      // 指定图表的配置项和数据
      let option = {
        title: {
          text: '订单、退款额对比图',
          left: 'center',
        },
        tooltip: {},
        legend: {
          orient: 'vertical',
          left: 'left',
        },
        xAxis: {
          data: memberAmountData.map((item) => item.time), // 时间点集合
          data: memberAmountData.map((item) => item.time), // 时间点集合
        },
        yAxis: {},
        series: [
          {
            name: '订单额',
            type: 'line',
            data: memberAmountData.map((item) => item.orderAmount),
          },
          {
            name: '销售额',
            type: 'line',
            data: memberAmountData.map((item) => item.refundAmount),
          },
        ],
      }
      // 使用刚指定的配置项和数据显示图表
      this.lineChartOption = { ...option }
    },
    // 柱状图
    async progressBar() {
      const res = await getOrderNumHistogram(this.deptReports)
      const memberAmountData = res.data.map((item) => item.mermbAmount)
      // 提取渲染同比环比表格数据
      this.amountYoyMom = memberAmountData
      let option = {
        title: {
          text: '订单、退单量对比图',
          left: 'center',
        },
        tooltip: {},
        legend: {
          orient: 'vertical',
          left: 'left',
        },
        xAxis: {
          data: memberAmountData.map((item) => item.time), // 时间点集合
        },
        yAxis: {},
        series: [
          {
            name: '订单数',
            type: 'bar',
            data: memberAmountData.map((item) => item.orderNum), // 订单数集合
          },
          {
            name: '退单数',
            type: 'bar',
            itemStyle: { color: '#93DB70' },
            data: memberAmountData.map((item) => item.refundNum), // 退单数集合
          },
        ],
      }
      this.barChartOption = { ...option }
    },

    // 种菜饼状图、种菜的接口是订单数的
    async createChartVg() {
      const res = await getOrderNum(this.deptReports)
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)',
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: ['推广', '种菜'],
          data: ['推广', '种菜'],
        },
        series: [
          {
            type: 'pie',
            radius: '50%',
            avoidLabelOverlap: false,
            label: {
              show: true,
              position: 'outside',
              formatter: '{b} \n{c} \n({d})%',
              formatter: '{b} \n{c} \n({d})%',
            },
            labelLine: {
              show: true,
              length: 10,
              length2: 15,
              length2: 15,
            },
            data: [
              { value: res.data.orderData.orderNum, name: '推广' },
              { value: res.data.refundData.refundNum, name: '种菜' },
            ],
          },
        ],
      }

      this.pieChartBottomOption = { ...option }

      // myChart.setOption(option)
    },
    // 订单、退单量 饼状图
    async createChart() {
      const res = await getOrderNum(this.deptReports)
      // 订单、退单量 饼图数据
      let exampleOptions = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)',
        },
        legend: {
          orient: 'vertical',
          left: 'left',
        },
        series: [
          {
            type: 'pie',
            radius: '50%',
            center: ['50%', '50%'],
            data: [
              {
                value: res.data.orderData.orderNum,
                name: '订单数',
                itemStyle: { color: '#003399' },
              },
              {
                value: res.data.refundData.refundNum,
                name: '退单数',
                itemStyle: { color: '#33cccc' },
              },
            ],
            label: {
              show: true,
              position: 'outside',
              formatter: '{b} :\n{c} \n({d}%)',
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          },
        ],
      }
      this.pieChartNumOption = { ...exampleOptions }
    },

    // 订单、退款额 饼状图
    async createChartSale() {
      const res = await getOrderSale(this.deptReports)
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)',
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: ['退款额', '订单额'],
          data: ['退款额', '订单额'],
        },
        series: [
          {
            type: 'pie',
            radius: '50%',
            avoidLabelOverlap: false,
            label: {
              show: true,
              position: 'outside',
              formatter: '{b} \n{c} \n({d})%',
              formatter: '{b} \n{c} \n({d})%',
            },
            labelLine: {
              show: true,
              length: 10,
              length2: 15,
              length2: 15,
            },
            data: [
              {
                value: res.data.orderData.orderAmount,
                name: '订单额',
                itemStyle: { color: '#ff6600' },
              },
              {
                value: res.data.refundData.refundAmount,
                name: '退款额',
                itemStyle: { color: '#ffcc33' },
              },
            ],
          },
        ],
      }
      this.pieChartAmountOption = { ...option }
      // myChart.setOption(option)
    },
    // 获取数据总览
    async getOverviewList() {
      const data = {
        allAmountData: 0,
        allOrderNumData: 0,
        customerPriceData: 0,
        refundAmountData: 0,
        refundNumData: 0,
        promotionData: 0,
        growVgetablesData: 0,
      }
      const res = await getOverview(this.deptReports)
      const {
        allAmount,
        allOrderNum,
        customerPrice,
        refundAmount,
        refundNum,
        promotion,
        growVgetables,
      } = res.data
      // 更新 data 对象
      data.allAmountData = allAmount || 0
      data.allOrderNumData = allOrderNum || 0
      data.customerPriceData = customerPrice || 0
      data.refundAmountData = refundAmount || 0
      data.refundNumData = refundNum || 0
      data.promotionData = promotion || 0
      data.growVgetablesData = growVgetables || 0
      Object.assign(this, data)
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

.main-line {
  margin-top: 60px;
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
