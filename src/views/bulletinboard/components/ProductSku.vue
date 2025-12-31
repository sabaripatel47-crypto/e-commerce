<template>
  <div class="app-container">
    <el-row :gutter="40">
      <el-col :span="17">
        <!-- 搜索 -->
        <div class="head-container">
          <el-form class="page-search" inline ref="page-filter">
            <!--时间范围 -->
            <el-form-item label="时间范围" style="margin-right: 20px;">
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
                    @blur="blurTime"
                    class="time-pick-class"
                  ></el-date-picker>
                </div>
              </div>
            </el-form-item>
            <el-form-item label="产品名称" style="margin-right: 20px;">
              <el-select
                v-model="selectedProduct"
                filterable
                clearable
                placeholder="请选择产品名称"
                style="flex: 1;"
                @change="selectProduct"
                :disabled="!selectSpuChange"
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
            <!-- disable 的判断:disabled="!selectSkuChange" -->
            <el-form-item label="SKU编码">
              <el-select
                v-model="selectedSkuId"
                filterable
                clearable
                collapse-tags
                placeholder="请选择sku编码"
                multiple
                @change="selectSkuCode"
                class="board-form-item-width"
              >
                <el-option
                  v-for="(item, index) in skuNameArrCurrent"
                  :key="item.code"
                  :label="`${item.name}(${item.extendKeyword})`"
                  :value="item.code"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="el-icon-search" @click="updateDeptReports">搜索</el-button>
            </el-form-item>
          </el-form>
          <div v-if="showSuggrst" class="grade-detail">
            <span class="detail-name">
              <span class="name-title">规格名称：</span>
              {{ productGradeDetail.specName }}
            </span>
            <span class="detail-picture">
              <span class="name-title">SKU图片：</span>
              <el-image
                v-if="productGradeDetail.urlAddress"
                style="height: 40px; width: 40px"
                :src="productGradeDetail.urlAddress + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
                :preview-src-list="[productGradeDetail.urlAddress]"
              ></el-image>
              <span v-else>暂无主图</span>
            </span>
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
              <div class="main-table">
                <el-table :data="percentageType">
                  <el-table-column prop="name" width="80" fixed align="center"></el-table-column>
                  <template v-for="item in amountYoyMom">
                    <el-table-column :label="item.time" width="90" align="center">
                      <template v-slot="{ row }">
                        {{ item[row.valueName] ? (item[row.valueName]*100).toFixed(2) : 0
                        }}
                      </template>
                    </el-table-column>
                  </template>
                </el-table>
              </div>
            </div>
            <!-- 折线图 -->
            <div class="main-line padding-lr" v-if="selectedProduct">
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
                <el-table :data="percentageType">
                  <el-table-column prop="name" width="80" fixed align="center"></el-table-column>
                  <template v-for="item in numYoyMom">
                    <el-table-column :label="item.time" width="90" align="center">
                      <template v-slot="{ row }">
                        {{ item[row.valueName] ? (item[row.valueName]*100).toFixed(2) : 0
                        }}
                      </template>
                    </el-table-column>
                  </template>
                </el-table>
              </div>
            </div>
            <!-- 退货图 -->
            <div class="main-line padding-lr" v-if="selectedProduct">
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
              :max-height="450"
              border
              style="width: 100%"
              ref="tableOrder"
              v-loadmore="addTableDataOrder"
            >
              <el-table-column width="40" type="index"></el-table-column>
              <el-table-column label="SKU编码" show-overflow-tooltip prop="line"></el-table-column>
              <el-table-column label="产品名称/规格" width="120" show-overflow-tooltip>
                <template slot-scope="{row}">
                  <span>{{ row.remark }}/{{ row.title }}</span>
                </template>
              </el-table-column>
              <el-table-column label="数量" prop="quantity" min-width="110"></el-table-column>
              <el-table-column label="金额" prop="paymentPrice" min-width="110">
                <template slot-scope="{row}">{{ (row.paymentPrice).toFixed(2) }}</template>
              </el-table-column>
              <el-table-column label="操作" min-width="110" v-if="selectSkuChange">
                <template slot-scope="{row}">
                  <el-button type="text" @click="lookBoardGoods(row)">看板</el-button>
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
              :max-height="450"
              :data="tableDataRefund"
              border
              ref="tableRefund"
              v-loadmore="addTableDataRefund"
            >
              <el-table-column width="40" type="index"></el-table-column>
              <el-table-column label="SKU编码" show-overflow-tooltip prop="line"></el-table-column>
              <el-table-column label="产品名称/规格" width="120" show-overflow-tooltip>
                <template slot-scope="{row}">
                  <span>{{ row.remark }}/{{ row.title }}</span>
                </template>
              </el-table-column>
              <el-table-column label="数量" prop="quantity" min-width="110"></el-table-column>
              <el-table-column label="金额" prop="paymentPrice" min-width="110">
                <template slot-scope="{row}">{{ (row.paymentPrice).toFixed(2) }}</template>
              </el-table-column>
              <el-table-column label="操作" min-width="110" v-if="selectSkuChange">
                <template slot-scope="{row}">
                  <el-button type="text" @click="lookBoardGoods(row)">看板</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-dialog
      :title="'商品链接看板'"
      @close="closeLinkBoardDialog"
      :visible.sync="showLinkBoardDialog"
      show-close
      append-to-body
      fullscreen
    >
      <LinkBoard v-if="showLinkBoardDialog" :rowParams="rowParams" :storeDisabled="true"></LinkBoard>
    </el-dialog>
  </div>
</template>
<script>
import { listSpuName, getOSSFileUrl } from '@/api/baseData/common'
import {
  getOverview,
  getOrderNum,
  getOrderSale,
  getOrderNumHistogram,
  getOrderSalesLineChart,
  getProductGradeDetail,
} from '@/api/bulletinboard/skuDate.js'

import {
  skuPush,
  refundNumberSku,
  orderRankingAmountNewSku, //销售订单
  orderRankingNumNewSku, //销售订单-数量
  refundRankingAmountSku, //退货订单
  refundRankingNumNewSku, //退款订单-数量
} from '@/api/bulletinboard/statistics.js'
import {
  getFormatDate,
  getFormaMonth,
  getYesterdayMidnightTimestamp,
  addDay,
  addDayEnd,
} from '@/utils/common.js'

// import { every, isEmpty } from 'lodash'
// import LinkBoard from '@/views/bulletinboard/linkBoard'
import lineChart from '@/components/charts/LineChart.vue'
import pieChart from '@/components/charts/PieChart.vue'
import barChart from '@/components/charts/BarChart.vue'

export default {
  name: 'ProductSku',
  props: {
    // 入口来源
    entrance: {
      type: String,
      default: 'spu',
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
    selectSkuChange: {
      type: Boolean,
      default: true,
    },
  },
  watch: {
    currentRow: {
      handler(newVal) {
        // console.log('newVal: ', newVal);
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
      // 排行长度
      MAX_LENGTH: 40,
      refundOption: {},
      tendencyOption: {},
      // 选择的sku的id
      selectedSkuId: [],
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
        sku: [],
        linkIdList: [],
      },
      // 公共排序接口入参
      deptSortParam: {
        page: 1,
        pageSize: 10,
      },
      // 看板弹层入参
      rowParams: {},
      // 商品链接下拉框数据（入参处理用）
      linkId: [],
      // 看板探弹层控制
      showLinkBoardDialog: false,
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
      topTotal: 0, // 退单总数
      bomTotal: 0, // bom总数
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
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: '最近14天',
            onClick(picker) {
              const end = addDay(-1)
              const start = addDayEnd(-14)
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: '最近1个月',
            onClick(picker) {
              const end = addDay(-1)
              const start = addDayEnd(-30)
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
    }
  },
  components: {
    lineChart,
    barChart,
    pieChart,
    LinkBoard: () => import('@/views/bulletinboard/linkBoard'),
  },
  async created() {
    // console.log('this.currentRow: ', this.currentRow);
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
    await this.lineChartOptionTendency() //销量趋势图
    await this.lineChartOptionRefund() //退货图 */

    this.getOverviewList() // 数据总览
    this.createChart() // 数量饼状图
    this.createChartSale() // 金额饼状图
    this.mounted() // 折线图
    this.createChartVg() // 种菜饼状图
    this.handleChange() // 排行榜
    await this.progressBar() // 柱状图
    if (this.selectedProduct) {
      this.lineChartOptionTendency() //销量趋势图
      this.lineChartOptionRefund() //退货图
    }
  },
  mounted() {
    // 表格添加滚动事件
    // this.$nextTick(() => {
    //   this.setupScrollListeners()
    // })
  },
  beforeDestroy() {
    // this.cleanupScrollListeners();
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
  methods: {
    addTableDataOrder() {
      if (
        this.tableDataOrder.length >= this.MAX_LENGTH ||
        this.tableDataOrder.length >= this.topTotal
      ) {
        return
      }
      this.handleChange1(this.selectedOptionOrder, {
        page: ++this.pageData.top.page,
        pageSize: this.pageData.top.pageSize,
      })
    },
    addTableDataRefund() {
      if (
        this.tableDataRefund.length >= this.MAX_LENGTH ||
        this.tableDataRefund.length >= this.bomTotal
      )
        return
      this.handleChange1(this.selectedOptionRefund, {
        page: ++this.pageData.bom.page,
        pageSize: this.pageData.bom.pageSize,
      })
    },
    // 初始化搜索参数
    async initSeatchParams() {
      console.log('this.currentRow', this.currentRow)
      this.skuNameArrCurrent = this.currentRow.skuNameArrCurrent
      console.log('this.skuNameArrCurrent', this.skuNameArrCurrent)
      this.timeValueArr = this.currentRow.timeScopeArr
      Object.assign(this.deptReports, {
        endTime: this.currentRow.timeScopeArr[1],
        formatType: this.currentRow.timeScopeType,
        // "productName": this.currentRow?.spu?.spuUuid,
        productName:
          this.currentRow.from === 'spuToSku'
            ? this.currentRow.spu.spuUuid
            : [],
        startTime: this.currentRow.timeScopeArr[0],
        sku: this.currentRow?.sku?.skuUuid,
        linkIdList: this.currentRow.linkIdList,
      })
      console.log('this.deptReports', this.deptReports)
      // console.log('productName', this.productName)

      this.selectedProduct = this.currentRow.spu.spuUuid[0]
      this.selectedSkuId = this.currentRow.sku.skuUuid
      // 判断是否需要展示详情
      this.showSkuDetail()
      // console.log(' this.selectedProduct: ', this.selectedProduct);
      if (
        this.currentRow.from === 'sku' ||
        this.currentRow.from === 'spuToSku' ||
        this.currentRow.from === 'linkToSku'
      ) {
        this.getSkuNameArr()
      }
    },
    // 选择skucode编码
    selectSkuCode(val) {
      // console.log('val: ', val);
      // console.log('this.selectedSkuId: ', this.selectedSkuId);

      this.deptReports.sku = this.selectedSkuId
    },
    // 排行详情
    orderDetailItem(row) {
      // console.log('row: ', row);
    },
    // 趋势数据分析图-销量
    async lineChartOptionTendency() {
      let option = {
        title: {
          text: '趋势数据分析图',
          left: 'center',
        },
        tooltip: { formatter: '{a} <br/>{b}  {c} 个' },
        legend: {
          orient: 'vertical',
          left: 'left',
        },
        xAxis: {
          data: this.amountYoyMom.map((item) => item.time), // 时间点集合
        },
        yAxis: {},
        series: [
          {
            name: '销售量',
            type: 'line',
            data: this.amountYoyMom.map((item) =>
              item.orderNum ? item.orderNum : 0
            ),
          },
        ],
      }
      // console.log('tendencyOption======option: ', option);
      this.tendencyOption = { ...option }
    },

    // 趋势数据分析图-退单量
    async lineChartOptionRefund() {
      // console.log('this.deptReports: ', this.deptReports);

      let res = await refundNumberSku(this.deptReports)

      // console.log('lineChartOptionRefund===res: ', res);

      const memberAmountData = res.data.countRateVOList
      const units = ['个', '%']

      let option = {
        title: {
          text: '退单趋势图',
          left: 'center',
        },
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

      // console.log('refundOption======option: ', option);

      this.refundOption = { ...option }
    },
    // sku名称下拉框
    async getSkuNameArr() {
      //  TODO:spu的id有很多，这个接口可能需要改造
      let res3 = await skuPush(this.selectedProduct)
      this.skuNameArrCurrent = res3.data
    },
    // 选择产品名称
    selectProduct(val) {
      // console.log("selectProduct==val:", val);
      if (val) {
        this.getSkuNameArr()
      }
    },
    // ===========================

    // 判断是否需要展示sku的详情信息
    async showSkuDetail() {
      if (this.selectedSkuId.length === 1) {
        const res = await getProductGradeDetail(this.selectedSkuId[0])
        this.productGradeDetail = res.data
        // 如果有文件uuid 获取文件地址路径
        // if (res.urlUuid) {
        //   const filrUrlRes = await getOSSFileUrl({ uuid: res.urlUuid })
        //   this.productGradeDetail.url = filrUrlRes.data[0]
        //   this.productGradeDetail.fileList = filrUrlRes.data
        // }
        this.showSuggrst = true
      } else {
        this.showSuggrst = false
      }
    },

    // 搜索按钮
    async updateDeptReports() {
      this.showSkuDetail()

      if (this.selectedSkuId.length > 0) {
        this.deptReports.productName = []
      } else {
        this.deptReports.productName = this.selectedProduct
          ? [this.selectedProduct]
          : []
      }

      this.deptReports.selectedSkuId = this.selectedSkuId
      this.deptReports.sku = this.selectedSkuId
      await this.progressBar(this.deptReports)
      await this.mounted(this.deptReports)
      await this.getOverviewList(this.deptReports)
      await this.createChart(this.deptReports)
      await this.createChartSale(this.deptReports)
      await this.createChartVg(this.deptReports)
      await this.handleChange()
      if (this.selectedProduct) {
        await this.lineChartOptionTendency()
        await this.lineChartOptionRefund()
      }
    },
    demoClick(value) {
      // console.log('val', value)
    },

    // 设置默认时间
    getMonthTime() {
      // const now = new Date()
      // // 设置当月第一天
      // now.setDate(1)
      // // 设置时分秒为0
      // now.setHours(0, 0, 0, 0)
      // // 获取时间戳
      // const timestamp = now.getTime() + ''
      // this.timeValue = [timestamp, timestamp]
      // this.deptReports.startTime = timestamp
      // let endTime = new Date().getTime() + ''
      // this.deptReports.endTime = endTime
      // this.timeValueArr.push(timestamp)
      // this.timeValueArr.push(endTime)
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
    // TODO:"productName": ["3625325463313978408"],请求参数
    async handleChange() {
      let params = Object.assign({}, this.deptSortParam, this.deptReports)

      if (this.selectedSkuId.length > 0) {
        params.productName = []
      } else {
        params.productName = this.selectedProduct ? [this.selectedProduct] : []
      }
      // console.log('handleChange==params: ', params);
      // 销售
      this.pageData.top.page = 1
      this.pageData.top.pageSize = 10
      this.tableDataOrder = []
      const res = await orderRankingAmountNewSku(params)
      this.tableDataOrder = res.data.records
      this.topTotal = res.data.total
      // console.log('this.topTotal: ', this.topTotal);
      // console.log('this.tableDataOrder: ', this.tableDataOrder);
      // 退款
      this.pageData.bom.page = 1
      this.pageData.bom.pageSize = 10
      this.tableDataRefund = []
      const resRefund = await refundRankingAmountSku(params)
      this.tableDataRefund = resRefund.data.records
      this.bomTotal = resRefund.data.total
      // console.log(' this.tableDataRefund: ', this.tableDataRefund);

      // this.setupScrollListeners()
    },
    // 表格排序方式切换
    async handleChange1(value, pageObj) {
      // getOrderRankingSaleNew, //新的销售金额
      // getOrderRankingNumNew, //新的销售数量
      // getRefundRankingSaleNew, //新的退款金额
      // getRefundRankingNumNew, //新的退款数量
      if (value === 1 || value === 2) {
        // pageObj ? pageObj :  Object.assign(this.pageData.top, { page: 1, size: 10 })
        if (!pageObj) {
          Object.assign(this.pageData.top, { page: 1, pageSize: 10 })
          this.tableDataOrder = []
          // console.log('this.$refs.tableOrder: ', this.$refs.tableOrder.$el);
        }
      } else {
        // pageObj ? pageObj :
        if (!pageObj) {
          Object.assign(this.pageData.bom, { page: 1, pageSize: 10 })
          this.tableDataRefund = []
          // console.log('this.$refs.tableRefund: ', this.$refs.tableRefund.$el);
        }
      }
      // console.log('pageObj: ', pageObj);
      // console.log('this.topTotal: ', this.topTotal);
      // console.log('this.bomTotal: ', this.bomTotal);

      let params = Object.assign(
        {},
        this.deptSortParam,
        this.deptReports,
        pageObj
      )
      if (this.selectedSkuId.length > 0) {
        params.productName = []
      } else {
        params.productName = this.selectedProduct ? [this.selectedProduct] : []
      }

      // console.log('params: ', params);
      switch (value) {
        // 销售金额
        case 1:
          this.numTableLoading = true
          //const resOrderRankingSale = await getOrderRankingSale(this.deptReports)
          const resOrderRankingSale = await orderRankingAmountNewSku(params)
          this.topTotal = resOrderRankingSale.data.total
          this.tableDataOrder = pageObj
            ? [...this.tableDataOrder, ...resOrderRankingSale.data.records]
            : resOrderRankingSale.data.records
          this.numTableLoading = false
          break
        // 销售数量
        case 2:
          this.numTableLoading = true
          //const resOrderRankingNum = await getOrderRankingNum(this.deptReports)
          const resOrderRankingNum = await orderRankingNumNewSku(params)
          this.topTotal = resOrderRankingNum.data.total
          this.tableDataOrder = pageObj
            ? [...this.tableDataOrder, ...resOrderRankingNum.data.records]
            : resOrderRankingNum.data.records
          this.numTableLoading = false
          break
        // 退款金额
        case 3:
          this.refundTableLoading = true
          //const resRefundRankingSale = await getRefundRankingSale(this.deptReports)
          const resRefundRankingSale = await refundRankingAmountSku(params)
          this.bomTotal = resRefundRankingSale.data.total

          this.tableDataRefund = pageObj
            ? [...this.tableDataRefund, ...resRefundRankingSale.data.records]
            : resRefundRankingSale.data.records
          this.refundTableLoading = false
          break
        // 退款数量
        case 4:
          this.refundTableLoading = true
          //const resRefundRankingNum = await getRefundRankingNum(this.deptReports)
          const resRefundRankingNum = await refundRankingNumNewSku(params)
          this.bomTotal = resRefundRankingNum.data.total

          this.tableDataRefund = pageObj
            ? [...this.tableDataRefund, ...resRefundRankingNum.data.records]
            : resRefundRankingNum.data.records

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
      // console.log('折线的同比环比数据', this.numYoyMom)
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
        tooltip: { formatter: '{a} <br/>{b}  {c}' },
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
        grid: {
          left: '4.5%',
          right: '5%',
          bottom: '2%',
          containLabel: true,
        },
        yAxis: {},
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

    // 柱状图
    async progressBar() {
      this.percentageType = []
      const res = await getOrderNumHistogram(this.deptReports)
      const memberAmountData = res.data.map((item) => item.mermbAmount)
      // 提取渲染同比环比表格数据
      this.amountYoyMom = memberAmountData
      // console.log('柱状的同比环比数据', this.amountYoyMom)
      this.percentageType = [
        { name: '同比(%)', valueName: 'yoy' },
        { name: '环比(%)', valueName: 'mom' },
      ]
      // console.log('amountYoyMom', this.amountYoyMom)
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
        grid: {
          left: '4.5%',
          right: '5%',
          bottom: '2%',
          containLabel: true,
        },
        xAxis: {
          boundaryGap: true, // 设置 boundaryGap 为 true
          axisTick: {
            alignWithLabel: true, // 设置刻度线与标签对齐
          },
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
              formatter: '{b} \n{c} \n({d})%',
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
    // 打开商品店铺看板
    lookBoardGoods(row) {
      row.standby.forEach((element) => {
        this.linkId.push(element.code)
      })
      this.rowParams = {
        platformUuid: '',
        startTime: this.timeValueArr[0],
        endTime: this.timeValueArr[1],
        formatType: this.deptReports.formatType,
        linkId: this.linkId,
        linkList: row.standby,
        skuUuid: row.uuid,
      }
      this.showLinkBoardDialog = true
    },
    // 关闭弹窗
    closeLinkBoardDialog() {
      this.showLinkBoardDialog = false
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
    display: flex;
    align-items: center;
    .detail-name {
      margin-right: 20px;
    }
    .name-title {
      font-weight: 600;
    }
    .detail-picture {
      display: flex;
      align-items: center;
    }
  }

  .time-class {
    margin-top: -32px;

    .time-pick {
      margin-top: -4px;

      &-class {
        width: 280px;
      }

      :v-deep .el-range-editor.el-input__inner {
        width: 300px;
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
