<template>
  <div class="app-container">
    <el-row :gutter="40">
      <el-col :span="17">
        <!-- 搜索 -->
        <div class="head-container">
          <el-form class="page-search" inline ref="page-filter">
            <!--时间范围 -->
            <el-form-item label="时间范围：" style="margin-right: 20px,">
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
                    :type="deptReports.formatType == 2 ? 'daterange' : 'monthrange'
                    "
                    :key="deptReports.formatType == 2 ? 'daterange' : 'monthrange'
                      "
                    align="right"
                    unlink-panels
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    :picker-options="deptReports.formatType == 2 ? pickerOptions : ''
                      "
                    value-format="timestamp"
                    @change="changeTime"
                    @blur="blurTime"
                    class="time-pick-class"
                  ></el-date-picker>
                </div>
              </div>
            </el-form-item>
            <el-form-item label="产品名称：">
              <el-select
                v-model="selectedProduct"
                filterable
                clearable
                placeholder="请选择产品名称"
                multiple
                style="flex: 1"
                @change="selectProduct"
                class="board-form-item-width"
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
          <div v-if="showSuggrst" class="grade-detail">
            <div>
              <span class="name-title">产品等级：</span>
              {{ productGradeDetail.originalGradeName }}
            </div>
            <div class="suggest-content">
              <span class="name-title">建议：</span> 当前产品评级为
              <span class="pre-grade">{{ productGradeDetail.originalGradeName }}</span>，根据销售订单量建议调整为
              <span class="suggest-grade">{{ productGradeDetail.presentGradeName }}</span>。
            </div>
          </div>
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
            <div>总退款额</div>
            <div class="number">{{ refundAmountData }} 元</div>
          </div>
          <div class="text1 text">
            <div>总退款单数</div>
            <div class="number">{{ refundNumData }} 个</div>
          </div>
          <div class="text">
            <div>件单量</div>
            <div class="number">{{ quantityPer }} 件</div>
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
          <el-col :span="8">
            <!-- <div id="myChartjw" style="width:500px; height:400px;"></div> -->
            <!-- 柱状图 -->
            <div class="main-bar padding-lr">
              <bar-chart :option="barChartOption" :height="'320px'"></bar-chart>
              <!-- 同比环比部分 -->
              <div class="main-table" v-show="amountYoyMom.length > 0">
                <el-table :data="percentageType" width="100%">
                  <el-table-column prop="name" width="80" fixed align="center"></el-table-column>
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
            <!-- 折线图 -->
            <div class="main-line padding-lr" v-if="selectedProduct.length === 1">
              <line-chart :option="tendencyOption" :height="'320px'"></line-chart>
            </div>
          </el-col>

          <!-- 右边 -->
          <el-col :span="8">
            <!-- 销量趋势图 -->
            <div class="main-bar padding-lr">
              <line-chart :option="lineChartOption" :height="'320px'"></line-chart>
              <!-- 同比环比部分 -->
              <div class="main-table" v-show="numYoyMom.length > 0">
                <el-table :data="percentageType" width="100%">
                  <el-table-column prop="name" width="80" fixed align="center"></el-table-column>
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
            <!-- 退货图 -->
            <div class="main-line padding-lr" v-if="selectedProduct.length === 1">
              <line-chart :option="refundOption" :height="'320px'"></line-chart>
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
            <el-table
              v-loading="numTableLoading"
              :data="tableDataOrder"
              :height="500"
              border
              style="width: 100%;overflow-y: auto"
              ref="tableOrder"
            >
              <el-table-column width="40" type="index"></el-table-column>
              <el-table-column label="产品名称" show-overflow-tooltip prop="line"></el-table-column>
              <el-table-column label="数量" prop="quantity" min-width="110">
                <template slot-scope="{ row }">
                  {{
                  `${row.quantity.toFixed(2)}(${multiplyLoadsh(
                  row.quantityRate,
                  100
                  ).toFixed(2)}%)`
                  }}
                </template>
              </el-table-column>
              <el-table-column label="金额" prop="paymentPrice" min-width="110">
                <template slot-scope="{ row }">
                  {{
                  `${row.paymentPrice.toFixed(2)}(${multiplyLoadsh(
                  row.paymentPriceRate,
                  100
                  ).toFixed(2)}%)`
                  }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="50">
                <template slot-scope="scope">
                  <el-button type="text" size="small" @click="lookBoardSku(scope.row)">详情</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="table-bottom">
            <div class="table-title">退款退货排名</div>
            <el-radio-group v-model="selectedOptionRefund" @change="handleChange1" size="mini">
              <el-radio-button :label="3">金额排行</el-radio-button>
              <el-radio-button :label="4">数量排行</el-radio-button>
            </el-radio-group>
            <el-table
              v-loading="refundTableLoading"
              :height="500"
              :data="tableDataRefund"
              border
              ref="tableRefund"
            >
              <el-table-column width="40" type="index"></el-table-column>
              <el-table-column label="产品名称" show-overflow-tooltip prop="line"></el-table-column>
              <el-table-column label="数量" prop="quantity" min-width="110">
                <template slot-scope="{ row }">
                  {{
                  `${row.quantity.toFixed(2)}(${multiplyLoadsh(
                  row.quantityRate,
                  100
                  ).toFixed(2)}%)`
                  }}
                </template>
              </el-table-column>
              <el-table-column label="金额" prop="paymentPrice" min-width="110">
                <template slot-scope="{ row }">
                  {{
                  `${row.paymentPrice.toFixed(2)}(${multiplyLoadsh(
                  row.paymentPriceRate,
                  100
                  ).toFixed(2)}%)`
                  }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="50">
                <template slot-scope="scope">
                  <el-button type="text" size="small" @click="lookBoardSku(scope.row)">详情</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- sku看板 -->
    <el-dialog
      :title="productTitle"
      @close="productStatusSku"
      :visible.sync="productShowSku"
      width="96%"
      show-close
      append-to-body
    >
      <product-sku
        v-if="productShowSku"
        :currentRow="searchParms"
        :selectSpuChange="selectSpuChangeToSku"
        :selectSkuChange="selectSkuChangeToSku"
      ></product-sku>
    </el-dialog>
  </div>
</template>
<script>
import { listSpuName } from '@/api/baseData/common'
import {
  getOverview,
  getOrderNum,
  getOrderSale,
  getOrderNumHistogram,
  getOrderSalesLineChart,
  getOrderRankingSaleNew, //新的销售金额
  getOrderRankingNumNew, //新的销售数量
  getRefundRankingSaleNew, //新的退款金额
  getRefundRankingNumNew, //新的退款数量
  getProductGradeDetail,
} from '@/api/bulletinboard/product'

import {
  averageRate,
  refundNumber,
  refundNumberSku,
} from '@/api/bulletinboard/statistics.js'
import {
  getFormatDate,
  getFormaMonth,
  getYesterdayMidnightTimestamp,
  addDay,
  addDayEnd,
} from '@/utils/common.js'
import { every, isEmpty, cloneDeep, multiply } from 'lodash'

import lineChart from '@/components/charts/LineChart.vue'
import pieChart from '@/components/charts/PieChart.vue'
import barChart from '@/components/charts/BarChart.vue'
import ProductSku from '@/views/bulletinboard/components/ProductSku.vue'

export default {
  name: 'ProductSpu',
  props: {
    // 入口来源
    entrance: {
      type: String,
    },
    // 点击的入口的数据
    currentRow: {
      type: Object,
      default: () => {
        return {}
      },
    },
    // 是否可更改下拉框
    selectSpuChange: {
      type: Boolean,
      default: true,
    },
    // selectSkuChange: {
    //   type: Boolean,
    //   default: true
    // }
  },
  watch: {
    currentRow: {
      handler(newVal) {
        // console.log("newVal: ", newVal);
      },
      deep: true,
    },
  },
  data() {
    return {
      // 是否显示产品等级的建议
      showSuggrst: false,
      // 产品等级详情
      productGradeDetail: {},
      // sku看板title
      productTitle: '',
      // sku下拉框是否可以更改
      selectSkuChangeToSku: false,
      // spu下拉框是否可以更改
      selectSpuChangeToSku: false,
      // sku看板显示
      productShowSku: false,
      // 退款趋势图
      refundOption: {},
      // 平均销量趋势图
      tendencyOption: {},
      // 选择的sku的id
      selectedSkuId: '',
      // sku名称下拉框
      skuNameArrCurrent: [],
      // ==============================

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
      // 公共排序接口入参
      deptSortParam: {
        page: 1,
        pageSize: 10,
      },
      // 下拉请求更多
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
      //时间
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

      // 获取数据总览
      allAmountData: '',
      allOrderNumData: '',
      customerPriceData: '',
      refundAmountData: '',
      refundNumData: '',
      promotionData: '',
      growVgetablesData: '',
      quantityPer: '',

      // 同比环比表格模板
      percentageType: [
        { name: '同比(%)', valueName: 'yoy' },
        { name: '环比(%)', valueName: 'mom' },
      ],

      // 单量同环比
      numYoyMom: [],

      // 单额同环比
      amountYoyMom: [],

      // sku的看板参数
      // 看板参数
      searchParms: {
        from: null, //入口来源
        timeScopeArr: [], //时间范围数组
        timeScopeType: 2, //时间范围类型
        spu: {
          spuUuid: [], //spu uuid
          spuNameArr: [], //spu名称数组
        },
        sku: {
          skuUuid: [], //sku uuid
          skuCode: [], //sku编码
          skuNameArr: [], //sku名称数组
          skuCodeArr: [], //sku编码数组
        },
      },
    }
  },
  components: { lineChart, barChart, pieChart, ProductSku },
  async created() {
    // 设置请求参数
    if (this.entrance !== 'menu') {
      await this.initSeatchParams()
    } else {
      await this.getMonthTime()
    }
    await this.getProductList() // 产品下拉框
    /* await this.getOverviewList() // 数据总览
    await this.createChart() // 数量饼状图
    await this.progressBar() // 柱状图
    await this.createChartSale() // 金额饼状图
    await this.mounted() // 折线图
    await this.createChartVg() // 种菜饼状图
    await this.handleChange() // 排行榜
    await this.lineChartOptionTendency()//销量趋势图
    await this.lineChartOptionRefund()//退货图 */

    this.getOverviewList() // 数据总览
    this.createChart() // 数量饼状图
    this.createChartSale() // 金额饼状图
    this.mounted() // 折线图
    this.createChartVg() // 种菜饼状图
    this.handleChange() // 排行榜
    await this.progressBar() // 柱状图
    if (this.selectedProduct.length) {
      this.lineChartOptionTendency() //销量趋势图
      this.lineChartOptionRefund() //退货图
    }
  },
  // mounted() {
  //   // 表格添加滚动事件 (目前产品看板只展示10条数据，无分页)
  //   this.$nextTick(() => {
  //     const table1 = this.$refs.tableOrder.$el.querySelector(
  //       '.el-table__body-wrapper.is-scrolling-none'
  //     )

  //     const table2 = this.$refs.tableRefund.$el.querySelector(
  //       '.el-table__body-wrapper.is-scrolling-none'
  //     )

  //     table1?.addEventListener('scroll', this.handleScrollOrder)
  //     table2?.addEventListener('scroll', this.handleScrollRefund)
  //   })
  // },
  methods: {
    // 下表，触底加载
    handleScrollRefund(event) {
      // console.log('event: ', event);
      if (
        Math.ceil(event.target.scrollTop) + event.target.clientHeight >=
        event.target.scrollHeight
      ) {
        // 如果数据已全部加载，则跳出
        if (this.tableDataRefund.length == 40) return
        if (this.numTableLoading) return
        // console.log("加载数据");
        this.handleChange1(this.selectedOptionRefund, {
          page: ++this.pageData.bom.page,
          pageSize: this.pageData.bom.pageSize,
        })
      } else {
        // console.log('不加载');
      }
    },
    // 上表，触底加载
    handleScrollOrder(event) {
      // console.log('event: ', event);
      if (
        Math.ceil(event.target.scrollTop) + event.target.clientHeight >=
        event.target.scrollHeight
      ) {
        // 如果数据已全部加载，则跳出
        if (this.tableDataOrder.length == 40) return
        if (this.refundTableLoading) return
        this.handleChange1(this.selectedOptionOrder, {
          page: ++this.pageData.top.page,
          pageSize: this.pageData.top.pageSize,
        })
      } else {
        // console.log('不加载');
      }
    },
    // 关闭sku看板
    productStatusSku() {
      this.productShowSku = false
    },
    // sku看板
    lookBoardSku(row) {
      this.productTitle = `${row.line}看板`
      this.selectSkuChangeToSku = true
      this.selectSpuChangeToSku = false
      // console.log("row: ", row);
      Object.assign(this.searchParms, {
        from: 'spuToSku', //入口来源
        timeScopeArr: this.timeValueArr, //时间范围数组
        timeScopeType: this.deptReports.formatType, //时间范围类型
        spu: {
          spuUuid: [row.uuid], //spu uuid
          spuNameArr: [], //spu名称数组
        },
        sku: {
          skuUuid: [], //sku uuid
          skuCode: [], //sku编码
          skuNameArr: [], //sku名称数组
          skuCodeArr: [], //sku编码数组
        },
      })
      this.productShowSku = true
    },

    // 乘法函数
    multiplyLoadsh(item1, item2) {
      return multiply(item1, item2)
    },
    // 初始化搜索参数
    async initSeatchParams() {
      this.timeValueArr = this.currentRow.timeScopeArr
      Object.assign(this.deptReports, {
        endTime: this.currentRow.timeScopeArr[1],
        formatType: this.currentRow.timeScopeType,
        productName: this.currentRow.spu.spuUuid,
        startTime: this.currentRow.timeScopeArr[0],
      })
      this.selectedProduct =
        this.currentRow?.spu?.spuUuid || this.selectedProduct || []
      this.getShowGradeDetail()
    },

    // 趋势数据分析图-平均销量
    async lineChartOptionTendency() {
      let params = Object.assign({}, this.deptReports)
      params.productName =
        this.currentRow?.spu?.spuUuid || this.selectedProduct || []

      let res = await averageRate(params)

      // console.log("lineChartOptionTendency===res: ", res);

      const memberAmountData = res.data.countRateVOList

      let option = {
        title: {
          text: '趋势数据分析图',
          textStyle: {
            fontSize: 16,
          },
          left: '30%',
        },
        tooltip: { formatter: '{a} <br/>{b}  {c}  个' },
        legend: {
          orient: 'vertical',
          left: 'left',
        },
        xAxis: {
          data: memberAmountData.map((item) => {
            let time = ''
            this.deptReports.formatType === 1
              ? (time = getFormaMonth(parseInt(item.dayTime)))
              : (time = getFormatDate(parseInt(item.dayTime)))
            return time
          }), // 时间点集合
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
            name: '销售量',
            type: 'line',
            data: this.amountYoyMom.map((item) =>
              item.orderNum ? item.orderNum : 0
            ),
          },
          {
            name: '平均销量',
            type: 'line',
            data: memberAmountData.map((item) =>
              item.countData ? item.countData : 0
            ),
          },
        ],
      }

      // console.log("countRateVOList======option: ", option);
      this.tendencyOption = { ...option }
    },
    // 趋势数据分析图-退款
    async lineChartOptionRefund() {
      let res = await refundNumber(this.deptReports)
      // console.log("lineChartOptionRefund===res: ", res);
      const units = ['个', '%']
      const memberAmountData = res.data.countRateVOList
      let option = {
        title: {
          text: '退单趋势图',
          textStyle: {
            fontSize: 16,
          },
          left: 'center',
        },
        // tooltip: { formatter: "{a} <br/>{b}  {c} " },
        tooltip: {
          formatter: (params) => {
            // console.log('params: ', params);
            // 根据 seriesIndex 获取对应的单位
            const unit = units[params.seriesIndex]
            // console.log('unit: ', unit);
            return `${params.name}<br/>${params.seriesName}: ${params.value} ${unit}`
          },
        },
        legend: {
          orient: 'vertical',
          left: 'left',
        },
        xAxis: {
          data: memberAmountData.map((item) => {
            let time = ''
            this.deptReports.formatType === 1
              ? (time = getFormaMonth(parseInt(item.dayTime)))
              : (time = getFormatDate(parseInt(item.dayTime)))
            return time
          }), // 时间点集合
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
            name: '退单量',
            type: 'line',
            data: memberAmountData.map((item) =>
              item.orderCount ? item.orderCount : 0
            ),
          },
          {
            name: '退单率',
            type: 'line',
            data: memberAmountData.map((item) =>
              item.countData ? (item.countData * 100).toFixed(2) : 0
            ),
          },
        ],
      }

      // console.log("refundOption======option: ", option);

      this.refundOption = { ...option }
    },
    // 选择产品名称
    selectProduct(val) {
      // console.log("selectProduct==val:", val);
    },
    // ===========================

    // 判断是否需要展示产品等级详情
    async getShowGradeDetail() {
      if (this.selectedProduct.length === 1) {
        const res = await getProductGradeDetail(this.deptReports)
        this.productGradeDetail = res.data
        this.showSuggrst = true
      } else {
        this.showSuggrst = false
      }
    },

    // 搜索按钮
    async updateDeptReports() {
      // 获取选中的平台名称，如果是多选需要遍历处理
      this.deptReports.productName = this.selectedProduct
      // 判断是否需要展示产品等级详情
      this.getShowGradeDetail()

      this.deptReports.selectedSkuId = this.selectedSkuId
      this.mounted(this.deptReports)
      this.getOverviewList(this.deptReports)
      this.createChart(this.deptReports)
      this.createChartSale(this.deptReports)
      this.createChartVg(this.deptReports)
      this.handleChange()
      await this.progressBar(this.deptReports)
      if (this.selectedProduct.length) {
        await this.lineChartOptionTendency()
        await this.lineChartOptionRefund()
      }
    },
    demoClick(value) {
      // console.log("val", value);
    },

    // 设置默认时间
    getMonthTime() {
      // const now = new Date();
      // // 设置当月第一天
      // now.setDate(1);
      // // 设置时分秒为0
      // now.setHours(0, 0, 0, 0);
      // // 获取时间戳
      // const timestamp = now.getTime() + "";
      // this.timeValue = [timestamp, timestamp];
      // this.deptReports.startTime = timestamp;
      // let endTime = new Date().getTime() + "";
      // this.deptReports.endTime = endTime;
      // this.timeValueArr.push(timestamp);
      // this.timeValueArr.push(endTime);
      // // 参数是否为空，空为false
      // console.log("=============", every(this.currentRow.spu, isEmpty));
      this.timeValueArr = [addDay(-7), addDayEnd(-1)]
      this.deptReports.startTime = this.timeValueArr[0]
      this.deptReports.endTime = this.timeValueArr[1]

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
    // 时间选择失焦时将startPickerTime置空 目的是清除禁用的时间范围
    blurTime() {
      this.startPickerTime = ''
    },

    // 获取平台
    async getProductList() {
      const res = await listSpuName()
      this.productList = res.data
    },

    // 排行榜
    async handleChange() {
      let cloneParams = cloneDeep(this.deptReports)
      // cloneParams.productName = [];
      // console.log("cloneParams: ", cloneParams);
      cloneParams = Object.assign(cloneParams, this.pageData.top)

      // 销售
      const res = await getOrderRankingSaleNew(cloneParams)
      this.tableDataOrder = res.data
      // console.log("this.tableDataOrder: ", this.tableDataOrder);
      // 退款
      const resRefund = await getRefundRankingSaleNew(cloneParams)
      this.tableDataRefund = resRefund.data
      // console.log(" this.tableDataRefund: ", this.tableDataRefund);
    },
    // 表格排序方式切换
    async handleChange1(value, pageObj) {
      // console.log('pageObj: ', pageObj);
      // getOrderRankingSaleNew,//新的销售金额
      //getOrderRankingNumNew,//新的销售数量
      //getRefundRankingSaleNew,//新的退款金额
      //getRefundRankingNumNew,//新的退款数量
      if (value === 1 || value === 2) {
        pageObj ? pageObj : (this.pageData.top = { page: 1, size: 10 })
      } else {
        pageObj ? pageObj : (this.pageData.bom = { page: 1, size: 10 })
      }
      let params = Object.assign(
        {},
        this.deptSortParam,
        this.deptReports,
        pageObj
      )
      // console.log("params: ", params);
      switch (value) {
        // 销售金额
        case 1:
          this.numTableLoading = true
          const resOrderRankingSale = await getOrderRankingSaleNew(params)
          this.tableDataOrder = pageObj
            ? [...this.tableDataOrder, ...resOrderRankingSale.data]
            : resOrderRankingSale.data
          this.numTableLoading = false
          break
        // 销售数量
        case 2:
          this.numTableLoading = true
          const resOrderRankingNum = await getOrderRankingNumNew(params)
          this.tableDataOrder = pageObj
            ? [...this.tableDataOrder, ...resOrderRankingNum.data]
            : resOrderRankingNum.data
          this.numTableLoading = false
          break
        // 退款金额
        case 3:
          this.refundTableLoading = true
          const resRefundRankingSale = await getRefundRankingSaleNew(params)
          this.tableDataRefund = pageObj
            ? [...this.tableDataRefund, ...resRefundRankingSale.data]
            : resRefundRankingSale.data
          this.refundTableLoading = false
          break
        // 退款数量
        case 4:
          this.refundTableLoading = true
          const resRefundRankingNum = await getRefundRankingNumNew(params)
          this.tableDataRefund = pageObj
            ? [...this.tableDataRefund, ...resRefundRankingNum.data]
            : resRefundRankingNum.data
          this.refundTableLoading = false
          break
      }
    },
    // 折线图
    async mounted() {
      this.percentageType = []
      const res = await getOrderSalesLineChart(this.deptReports)
      const memberAmountData = res.data.map((item) => item.mermbAmount)
      // 提取渲染同比环比表格数据
      this.numYoyMom = memberAmountData
      // console.log("折线的同比环比数据", this.numYoyMom);
      this.percentageType = [
        { name: '同比(%)', valueName: 'yoy' },
        { name: '环比(%)', valueName: 'mom' },
      ]
      // 指定图表的配置项和数据
      let option = {
        title: {
          text: '订单、退款额对比图',
          textStyle: {
            fontSize: 16,
          },
          left: '30%',
        },
        tooltip: { formatter: '{a} <br/>{b}  {c} ' },
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
      // console.log('this.lineChartOption: ', this.lineChartOption);
    },
    // 柱状图
    async progressBar() {
      this.percentageType = []
      const res = await getOrderNumHistogram(this.deptReports)
      const memberAmountData = res.data.map((item) => item.mermbAmount)
      // 提取渲染同比环比表格数据
      this.amountYoyMom = memberAmountData
      // console.log("柱状的同比环比数据", this.amountYoyMom);
      this.percentageType = [
        { name: '同比(%)', valueName: 'yoy' },
        { name: '环比(%)', valueName: 'mom' },
      ]
      // console.log("amountYoyMom", this.amountYoyMom);
      // 定义柱状图数据
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
            avoidLabelOverlap: false,
            label: {
              show: true,
              position: 'outside',
              formatter: (params) => {
                console.log('paramsssdss', params)

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
            data: [0, 0],
          },
        ],
      }

      this.pieChartBottomOption = { ...option }
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
          selectedMode: false,
        },
        series: [
          {
            type: 'pie',
            radius: '50%',
            center: ['50%', '50%'],
            data: [
              {
                value: res.data.orderData.orderNum,
                name: '实际订单数',
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
          selectedMode: false,
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
        quantityPer,
      } = res.data
      // 更新 data 对象
      data.allAmountData = allAmount || 0
      data.allOrderNumData = allOrderNum || 0
      data.customerPriceData = customerPrice || 0
      data.refundAmountData = refundAmount || 0
      data.refundNumData = refundNum || 0
      data.promotionData = promotion || 0
      data.growVgetablesData = growVgetables || 0
      data.quantityPer = quantityPer || 0
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
        margin-right: 20px;
        width: 280px;
      }
    }
  }
}

.main-line {
  margin-top: 60px;
}

// .main-table {
//   margin-top: -20px;
// }

.line-bottom {
  margin-top: 41%;
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

.padding-lr {
  padding: 0 20px;
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
