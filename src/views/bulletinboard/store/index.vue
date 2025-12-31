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
                  <el-radio-group v-model="vModelReqParams.formatType" size="mini">
                    <el-radio-button :label="2">按日</el-radio-button>
                    <el-radio-button :label="1">按月</el-radio-button>
                  </el-radio-group>
                </div>
                <div class="time-pick">
                  <el-date-picker
                    v-model="timeValueArr"
                    :clearable="false"
                    :type="vModelReqParams.formatType == 2 ? 'daterange' : 'monthrange'"
                    :key="vModelReqParams.formatType == 2 ? 'daterange' : 'monthrange'"
                    align="right"
                    unlink-panels
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    :picker-options="vModelReqParams.formatType == 2 ? pickerOptions : ''
                      "
                    value-format="timestamp"
                    class="time-pick-class"
                    @change="changeTime"
                    @blur="blurTime"
                  ></el-date-picker>
                </div>
              </div>
            </el-form-item>
            <el-form-item label="平台：" style="margin-right: 20px;">
              <el-select
                class="board-form-item-width"
                v-model="vModelReqParams.platform"
                filterable
                clearable
                placeholder="请选择平台"
                multiple
              >
                <el-option
                  v-for="(item, index) in platformList"
                  :key="index"
                  :label="item.name"
                  :value="item.code"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="店铺：" style="margin-right: 20px;">
              <el-select
                v-model="vModelReqParams.store"
                class="board-form-item-width"
                filterable
                clearable
                placeholder="请选择店铺"
                multiple
              >
                <el-option
                  v-for="(item, index) in storeList"
                  :key="index"
                  :label="item.name"
                  :value="item.code"
                ></el-option>
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" icon="el-icon-search" @click="getAllData">搜索</el-button>
            </el-form-item>
          </el-form>
        </div>
        <!-- 总数据 -->
        <div class="left_top">
          <div class="text1 text">
            <div>总销售额</div>
            <div class="number">{{ overViewData.allAmount || '0' }} 元</div>
          </div>
          <div class="text">
            <div>总订单数</div>
            <div class="number">{{ overViewData.allOrderNum || '0' }} 个</div>
          </div>
          <div class="text1 text">
            <div>客单价</div>
            <div class="number">{{ overViewData.customerPrice || '0' }} 元</div>
          </div>
          <div class="text">
            <div>总退款额</div>
            <div class="number">{{ overViewData.refundAmount || '0' }} 元</div>
          </div>
          <div class="text1 text">
            <div>总退款单数</div>
            <div class="number">{{ overViewData.refundNum || '0' }} 个</div>
          </div>
          <div class="text">
            <div>件单量</div>
            <div class="number">{{ overViewData.quantityPer || '0' }} 件</div>
          </div>
        </div>
        <!-- 图表内容 -->
        <el-row>
          <!-- 左边 -->
          <el-col :span="8">
            <!-- <div ref="pieChart" style="width: 450px; height: 300px;"></div> -->
            <!-- 订单数 -->
            <pie-chart :option="pieChartNumOption" :height="'350px'"></pie-chart>
            <!-- 订单额 -->
            <pie-chart :option="pieChartAmountOption" :height="'350px'"></pie-chart>
            <!-- 种菜 -->
            <!-- <pie-chart :option="pieChartBottomOption" :height="'350px'"></pie-chart> -->
          </el-col>

          <!--中间 -->
          <el-col :span="16">
            <!-- <div id="myChartjw" style="width:500px; height:400px;"></div> -->
            <el-row :gutter="20">
              <el-col :span="12">
                <!-- 柱状图 -->
                <div class="main-bar">
                  <bar-chart :option="barChartOption" :height="'300px'"></bar-chart>
                  <!-- 同比环比部分 -->
                  <div class="main-table" v-show="amountYoyMom.length > 0">
                    <el-table :data="percentageType">
                      <el-table-column prop="name" width="70" fixed align="center"></el-table-column>
                      <template v-for="item in amountYoyMom">
                        <el-table-column :label="item.time" width="90" align="center">
                          <template
                            v-slot="{ row }"
                          >{{ item[row.valueName] ? (item[row.valueName]*100).toFixed(2) : 0 }}</template>
                        </el-table-column>
                      </template>
                    </el-table>
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <!-- 折线图 -->
                <div>
                  <line-chart :option="lineChartOption" :height="'300px'"></line-chart>
                  <!-- 同比环比部分 -->
                  <div class="main-table" v-show="numYoyMom.length > 0">
                    <el-table :data="percentageType">
                      <el-table-column prop="name" width="70" fixed align="center"></el-table-column>
                      <template v-for="item in numYoyMom">
                        <el-table-column :label="item.time" width="90" align="center">
                          <template
                            v-slot="{ row }"
                          >{{ item[row.valueName] ? (item[row.valueName]*100).toFixed(2) : 0 }}</template>
                        </el-table-column>
                      </template>
                    </el-table>
                  </div>
                </div>
              </el-col>
            </el-row>
            <div class="main-line">
              <line-chart :option="refundLineChartOption" :height="'300px'"></line-chart>
            </div>
          </el-col>
        </el-row>
      </el-col>
      <!--右边 -->
      <el-col :span="7">
        <div class="right-table">
          <div>
            <div class="table-title">销售和订单量排名</div>
            <el-radio-group v-model="selectedOptionOrder" @change="amountOrNumChange" size="mini">
              <el-radio-button :label="1">金额排行</el-radio-button>
              <el-radio-button :label="2">数量排行</el-radio-button>
            </el-radio-group>
            <el-table
              v-loadmore="loadMoreTableData"
              v-loading="numTableLoading"
              :data="tableDataOrder"
              border
              style="width: 100%"
              :max-height="450"
            >
              <el-table-column label="序号" width="50" type="index" align="center"></el-table-column>
              <el-table-column label="所属店铺" show-overflow-tooltip align="center" prop="storeName"></el-table-column>
              <el-table-column label="数量" prop="quantity" align="center"></el-table-column>
              <el-table-column label="金额" prop="paymentPrice" align="center">
                <template v-slot="{row}">
                  <span>{{ row.paymentPrice.toFixed(2) }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="table-bottom">
            <div class="table-title">退款退货排名</div>
            <el-radio-group v-model="selectedOptionRefund" @change="amountOrNumChange" size="mini">
              <el-radio-button :label="3">金额排行</el-radio-button>
              <el-radio-button :label="4">数量排行</el-radio-button>
            </el-radio-group>
            <el-table
              v-loadmore="loadMoreRefundTableData"
              v-loading="refundTableLoading"
              :data="tableDataRefund"
              :max-height="450"
              border
            >
              <el-table-column label="序号" width="50" type="index" align="center"></el-table-column>
              <el-table-column label="所属店铺" show-overflow-tooltip prop="storeName" align="center"></el-table-column>
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
  getRefundLineChart,
} from '@/api/bulletinboard/store'
import { listPlatform, listStore } from '@/api/baseData/common'
import { getFormatDate, getFormaMonth } from '@/utils/common'
import lineChart from '@/components/charts/LineChart.vue'
import pieChart from '@/components/charts/PieChart.vue'
import barChart from '@/components/charts/BarChart.vue'
import { addDay, addDayEnd } from '@/utils/common.js'
import { debounce } from 'lodash'

export default {
  name: 'Store',
  components: { lineChart, barChart, pieChart },
  props: {
    rowParams: {
      type: Object,
      default: function () {
        return {}
      },
    },
  },
  directives: {
    loadmore: {
      bind(el, binding) {
        const selectWrap = el.querySelector('.el-table .el-table__body-wrapper')
        selectWrap.addEventListener('scroll', function () {
          const scrollDistance =
            this.scrollHeight - this.scrollTop - this.clientHeight
          if (scrollDistance <= 0.5) {
            binding.value() //执行在使用时绑定的函数
            // console.log('binding: ', binding);
          }
        })
      },
    },
  },

  data() {
    return {
      //平台下拉框
      platformList: [],
      //店铺下拉框
      storeList: [],
      // 订单排行版选择接收参数
      selectedOptionOrder: 1, // 销售排行榜
      selectedOptionRefund: 3, // 退款排行榜
      tableDataOrder: [], // 销售排行榜
      tableDataRefund: [], // 退款排行榜
      chartPie: null,
      // 公共入参
      deptReports: {
        platform: [],
        store: [],
        startTime: '',
        endTime: '',
        formatType: 2,
        page: 1,
        pageSize: 10,
      },
      // 搜索时数据双向绑定的入参
      vModelReqParams: {
        platform: [],
        store: [],
        startTime: '',
        endTime: '',
        formatType: 2,
        page: 1,
        pageSize: 10,
      },
      // 排行榜的分页
      pageData: {
        top: {
          page: 1,
          pageSize: 10,
        },
        bom: {
          page: 1,
          pageSize: 10,
        },
      },
      // 销售排行榜总条数
      orderTotal: 0,
      // 退款排行榜总条数
      refundTotal: 0,
      // 选中的开始时间
      startPickerTime: '',
      // 时间范围快捷选择
      pickerOptions: {
        shortcuts: [
          {
            text: '最近7天',
            onClick(picker) {
              const end = addDay(-1)
              const start = addDayEnd(-7)
              // start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: '最近14天',
            onClick(picker) {
              const end = addDay(-1)
              const start = addDayEnd(-14)
              // start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: '最近1个月',
            onClick(picker) {
              const end = addDay(-1)
              const start = addDayEnd(-30)
              // start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            },
          },
        ],
        // 当点击时 将时间拿来做禁用时间范围计算
        onPick: (timeObj) => {
          this.startPickerTime = new Date(timeObj.minDate).getTime()
        },
        disabledDate: (time) => {
          if (!this.startPickerTime) return false
          const now = this.startPickerTime
          // 31 * 24 * 3600 * 1000 是31天的毫秒数
          const minTime = now - 31 * 24 * 3600 * 1000
          const maxTime = now + 31 * 24 * 3600 * 1000

          return time.getTime() < minTime || time.getTime() > maxTime
        },
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
      // 中间退单量退单率折线图
      refundLineChartOption: {},
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
      overViewData: {},
    }
  },

  async created() {
    await this.getStoreList()
    await this.getPlatformList()
    // 提取路由传的值，赋值查询入参
    const { platformUuid, storeUuid, startTime, endTime, formatType } =
      this.rowParams
    // 结构的参数中，只要存在一项，说明是跳转来的
    if (platformUuid) {
      this.vModelReqParams.platform.push(platformUuid)
      this.vModelReqParams.store.push(storeUuid)
      this.vModelReqParams.startTime = startTime
      this.vModelReqParams.endTime = endTime
      this.vModelReqParams.formatType = formatType
      this.timeValueArr = [startTime, endTime]
    } else {
      this.vModelReqParams.startTime = addDay(-7)
      this.vModelReqParams.endTime = addDayEnd(-1)
      this.timeValueArr.push(this.vModelReqParams.startTime)
      this.timeValueArr.push(this.vModelReqParams.endTime)
    }

    await this.getAllData()
  },
  methods: {
    // 时间戳格式化
    getFormatDate(date) {
      return getFormatDate(date)
    },
    //获取店铺
    async getStoreList() {
      const res = await listStore()
      this.storeList = res.data
    },
    //获取平台
    async getPlatformList() {
      const res = await listPlatform()
      this.platformList = res.data
    },
    // 获取所有列表数据
    async getAllData() {
      this.deptReports = JSON.parse(JSON.stringify(this.vModelReqParams))
      this.getOverviewList() // 数据总览
      this.createChart() // 数量饼状图
      this.progressBar() // 柱状图
      this.mounted() // 折线图
      this.createChartSale() // 金额饼状图
      this.getRefundLineChart() // 退单量、退单率折线图
      this.getTableList() // 排行榜
      // this.createChartVg() // 种菜饼状图
    },

    // 选择时间
    changeTime(val) {
      if (val) {
        this.vModelReqParams.startTime = val[0]
        this.vModelReqParams.endTime = val[1]
      }
    },
    // 时间选择失焦时将startPickerTime置空 目的是清除禁用的时间范围
    blurTime() {
      this.startPickerTime = ''
    },

    // 加载销售更多表格数据
    loadMoreTableData: debounce(function () {
      if (this.tableDataOrder.length >= this.orderTotal) {
        return
      }
      this.amountOrNumChange(this.selectedOptionOrder, {
        page: ++this.pageData.top.page,
        pageSize: this.pageData.top.pageSize,
      })
    }, 200),
    // 加载退款更多表格数据
    loadMoreRefundTableData: debounce(function () {
      if (this.tableDataRefund.length >= this.refundTotal) {
        return
      }
      this.amountOrNumChange(this.selectedOptionRefund, {
        page: ++this.pageData.bom.page,
        pageSize: this.pageData.bom.pageSize,
      })
    }, 200),

    // 排行榜
    async getTableList() {
      this.pageData = {
        top: {
          page: 1,
          pageSize: 10,
        },
        bom: {
          page: 1,
          pageSize: 10,
        },
      }
      this.deptReports.page = 1
      this.deptReports.pageSize = 10

      // 销售
      const res = await getOrderRankingSale(this.deptReports)
      this.tableDataOrder = res.data.records
      this.orderTotal = res.data.total

      //退款
      const resRefund = await getRefundRankingSale(this.deptReports)
      this.tableDataRefund = resRefund.data.records
      this.refundTotal = resRefund.data.total
    },
    //
    async amountOrNumChange(value, pageObj) {
      if (value === 1 || value === 2) {
        if (!pageObj) {
          Object.assign(this.pageData.top, { page: 1, pageSize: 10 })
          this.tableDataOrder = []
        }
      } else {
        // pageObj ? pageObj :
        if (!pageObj) {
          Object.assign(this.pageData.bom, { page: 1, pageSize: 10 })
          this.tableDataRefund = []
        }
      }
      // console.log('pageObj', pageObj)

      this.deptReports.page = pageObj ? pageObj.page : 1
      this.deptReports.pageSize = pageObj ? pageObj.pageSize : 10

      switch (value) {
        case 1:
          // 销售金额
          this.numTableLoading = true
          const resOrderRankingSale = await getOrderRankingSale(
            this.deptReports
          )
          this.tableDataOrder = pageObj
            ? [...this.tableDataOrder, ...resOrderRankingSale.data.records]
            : resOrderRankingSale.data.records
          this.orderTotal = resOrderRankingSale.data.total
          this.numTableLoading = false
          break
        case 2:
          // 销售订单
          this.numTableLoading = true
          const resOrderRankingNum = await getOrderRankingNum(this.deptReports)
          this.tableDataOrder = pageObj
            ? [...this.tableDataOrder, ...resOrderRankingNum.data.records]
            : resOrderRankingNum.data.records
          this.orderTotal = resOrderRankingNum.data.total
          this.numTableLoading = false
          break
        case 3:
          // 退款金额
          this.refundTableLoading = true
          const resRefundRankingSale = await getRefundRankingSale(
            this.deptReports
          )
          this.tableDataRefund = pageObj
            ? [...this.tableDataRefund, ...resRefundRankingSale.data.records]
            : resRefundRankingSale.data.records
          this.refundTotal = resRefundRankingSale.data.total
          this.refundTableLoading = false
          break
        case 4:
          // 退款订单
          this.refundTableLoading = true
          const resRefundRankingNum = await getRefundRankingNum(
            this.deptReports
          )
          this.tableDataRefund = pageObj
            ? [...this.tableDataRefund, ...resRefundRankingNum.data.records]
            : resRefundRankingNum.data.records
          this.refundTotal = resRefundRankingNum.data.total
          this.refundTableLoading = false
          break
      }
    },
    // 订单、退款额 折线图
    async mounted() {
      const res = await getOrderSalesLineChart(this.deptReports)
      const memberAmountData = res.data.map((item) => item.mermbAmount)
      // 提取渲染同比环比表格数据
      this.numYoyMom = memberAmountData
      // 指定图表的配置项和数据
      let option = {
        title: {
          text: '订单、退款额对比图',
          textStyle: {
            fontSize: 16,
          },
          left: '30%',
        },
        tooltip: {},
        legend: {
          orient: 'vertical',
          left: 'left',
        },
        xAxis: {
          boundaryGap: true, // 设置 boundaryGap 为 true
          axisTick: {
            alignWithLabel: true, // 设置刻度线与标签对齐
          },
          data: memberAmountData.map((item) => item.time), // 时间点集合
        },
        yAxis: {},
        grid: {
          left: '4.5%',
          right: '5%',
          bottom: '2%',
          containLabel: true,
        },
        series: [
          {
            name: '订单额',
            type: 'line',
            data: memberAmountData.map((item) => item.orderAmount),
          },
          {
            name: '退款额',
            type: 'line',
            data: memberAmountData.map((item) => item.refundAmount),
          },
        ],
      }
      // 使用刚指定的配置项和数据显示图表
      this.lineChartOption = { ...option }
    },
    // 退单量、退单率 折线图
    async getRefundLineChart() {
      this.percentageType = []
      const res = await getRefundLineChart(this.deptReports)
      const memberAmountData = res.data.countRateVOList
      const formatType = res.data.formatType
      this.percentageType = [
        { name: '同比(%)', valueName: 'yoy' },
        { name: '环比(%)', valueName: 'mom' },
      ]
      // 指定图表的配置项和数据
      let option = {
        title: {
          text: '退单量、退单率对比图',
          textStyle: {
            fontSize: 16,
          },
          left: '30%',
        },
        tooltip: {
          show: true,
          trigger: 'item',
          formatter: (params) => {
            if (params.seriesName === '退单率') {
              return (
                params.name +
                '<br/>' +
                params.seriesName +
                '：' +
                params.value +
                '%'
              )
            } else {
              return (
                params.name + '<br/>' + params.seriesName + '：' + params.value
              )
            }
          },
        },
        legend: {
          orient: 'vertical',
          left: 'left',
        },
        xAxis: {
          boundaryGap: true, // 设置 boundaryGap 为 true
          axisTick: {
            alignWithLabel: true, // 设置刻度线与标签对齐
          },
          data: memberAmountData.map((item) => {
            // 时间格式化 2 按日 1按月
            if (formatType == 1) {
              return getFormaMonth(+item.dayTime)
            } else {
              return getFormatDate(+item.dayTime)
            }
          }), // 时间点集合
        },
        yAxis: [
          {
            type: 'value',
            position: 'left',
          },
          {
            type: 'value',
            position: 'right',
            alignTicks: true,
          },
        ],
        grid: {
          left: '4.5%',
          right: '5%',
          bottom: '2%',
          containLabel: true,
        },
        series: [
          {
            name: '退单量',
            type: 'line',
            yAxisIndex: 0,
            data: memberAmountData.map((item) =>
              item.orderCount === null ? 0 : item.orderCount
            ),
          },
          {
            name: '退单率',
            type: 'line',
            yAxisIndex: 1,
            data: memberAmountData.map((item) =>
              item.countData === null ? 0 : (item.countData * 100).toFixed(2)
            ),
          },
        ],
      }
      // 使用刚指定的配置项和数据显示图表
      this.refundLineChartOption = { ...option }
    },
    // 柱状图
    async progressBar() {
      this.percentageType = []
      const res = await getOrderNumHistogram(this.deptReports)
      const memberAmountData = res.data.map((item) => item.mermbAmount)
      // 提取渲染同比环比表格数据
      this.amountYoyMom = memberAmountData
      this.percentageType = [
        { name: '同比(%)', valueName: 'yoy' },
        { name: '环比(%)', valueName: 'mom' },
      ]
      let option = {
        title: {
          text: '订单、退单量对比图',
          textStyle: {
            fontSize: 16,
          },
          left: '30%',
        },
        tooltip: {},
        legend: {
          orient: 'vertical',
          left: 'left',
        },
        xAxis: {
          boundaryGap: true, // 设置 boundaryGap 为 true
          axisTick: {
            alignWithLabel: true, // 设置刻度线与标签对齐
          },
          data: memberAmountData.map((item) => item.time), // 时间点集合
        },
        yAxis: {},
        grid: {
          left: '4.5%',
          right: '5%',
          bottom: '2%',
          containLabel: true,
        },
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
          position: 'right',
          formatter: '{a} <br/>{b} : {c} ({d}%)',
        },
        legend: {
          orient: 'vertical',
          left: 'left',
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
          position: 'right',
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
              formatter: (params) => {
                if (params) {
                  return (
                    `${params.name}` +
                    `\n${params.value}` +
                    `\n${params.percent === undefined ? 0 : params.percent}%`
                  )
                }
                return ''
              },
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
          position: 'right',
          formatter: '{a} <br/>{b} : {c} ({d}%)',
        },
        legend: {
          orient: 'vertical',
          left: 'left',
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
              formatter: (params) => {
                if (params) {
                  return (
                    `${params.name}` +
                    `\n${params.value}` +
                    `\n${params.percent === undefined ? 0 : params.percent}%`
                  )
                }
                return ''
              },
            },
            labelLine: {
              show: true,
              length: 10,
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
      const res = await getOverview(this.deptReports)
      this.overViewData = res.data
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

  .grade-detail {
    border: 1px solid #d6d6d6;
    width: 500px;
    border-radius: 4px;
    padding: 8px 10px;
    // font-size: 14px;
    color: #595959;
    .name-title {
      font-weight: 600;
    }
    .suggest-content {
      .suggest-grade {
        font-size: 18px;
        font-weight: bold;
      }
      .red-icon {
        color: red;
      }
    }
  }

  .time-class {
    margin-top: -32px;

    .time-pick {
      margin-top: -4px;

      &-class {
        width: 280px;
      }
    }
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
