<template>
  <div class="statistics">
    <div class="statistics-container">
      <!-- spu 列表 -->
      <div class="spu-container">
        <el-form class="page-search" inline ref="page-filter">
          <!--时间范围 -->
          <el-form-item label="时间范围：" style="margin-right: 20px">
            <el-date-picker
              v-model="spuTimeScope"
              :clearable="false"
              type="daterange"
              align="right"
              unlink-panels
              value-format="timestamp"
              @change="changeSpuTimeScope"
              @blur="blurTime"
              :picker-options="pickerOptions"
              style="padding-right: 20px"
            ></el-date-picker>
          </el-form-item>
          <!-- 下拉选择名字 -->
          <el-form-item label="产品名称：" style="margin-right: 20px">
            <el-select
              v-model="currentSpuName"
              clearable
              filterable
              :filter-method="filterMethod"
              multiple
              v-el-select-loadmore="loadMore(rangeNumber)"
              @visible-change="visibleChange"
            >
              <el-option
                v-for="(item, index) in spuNameArrCurrent.slice(0, rangeNumber)"
                :key="item.code"
                :label="item.name"
                :value="item.code"
              ></el-option>
            </el-select>
          </el-form-item>
          <!-- 下拉选择等级 -->
          <el-form-item label="产品等级：" style="margin-right: 20px">
            <el-select v-model="currentGradeType" clearable placeholder="请选择">
              <el-option
                v-for="item in spuGradeArr"
                :key="item.code"
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
      <!-- <el-radio-group v-model="searchParams.sortType" @change="updateDeptReports">
        <el-radio-button :label="1">销售额</el-radio-button>
        <el-radio-button :label="2">退款额</el-radio-button>
      </el-radio-group>-->
      <el-table
        v-loading="spuLoading"
        class="outHeight"
        :max-height="tabHeight"
        :data="spuDataList"
        border
        style="width: 100%"
        @row-click="clickSpuTabRow"
        :row-style="rowStyle"
      >
        <el-table-column prop="date" label="序号" min-width="30" type="index"></el-table-column>
        <el-table-column prop="productName" label="产品名称" min-width="100" show-overflow-tooltip>
          <template slot-scope="scope">
            <div>{{ scope.row.productName ? scope.row.productName : "-" }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="gradeTypeName" label="产品等级" min-width="100" show-overflow-tooltip></el-table-column>
        <el-table-column label="销售额(销售占比)" show-overflow-tooltip width="180">
          <template #header>
            <span
              @click="changeSortType(1)"
              :style="{
                color: searchParams.sortType == 1 ? '#409EFF' : '',
                fontSize: searchParams.sortType == 1 ? '17px' : '14px',
              }"
            >
              销售额(销售占比)
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template slot-scope="scope">
            <div v-if="scope.row.orderAmount || scope.row.orderAmount === 0">
              <span>{{ scope.row.orderAmount.toFixed(2) }}</span>
              (
              <span>
                {{
                (scope.row.orderAmountRate * 100).toFixed(2) + "%"
                }}
              </span>)
            </div>
            <div v-else>-</div>
          </template>
        </el-table-column>
        <el-table-column prop="erpQuantity" label="订单数" width="70" show-overflow-tooltip>
          <template slot-scope="scope">
            <div>{{ scope.row.erpQuantity ? scope.row.erpQuantity : "-" }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="customerPrice" label="客单价" width="100" show-overflow-tooltip>
          <template slot-scope="scope">
            <div>{{ scope.row.customerPrice ? scope.row.customerPrice : "-" }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="quantityPerNum" label="件单量" width="100" show-overflow-tooltip>
          <template slot-scope="scope">
            <div>{{ scope.row.quantityPerNum ? scope.row.quantityPerNum : "-" }}</div>
          </template>
        </el-table-column>
        <el-table-column label="退款额(退款占比)" show-overflow-tooltip width="180">
          <template #header>
            <span
              @click="changeSortType(2)"
              :style="{
                color: searchParams.sortType == 2 ? '#409EFF' : '',
                fontSize: searchParams.sortType == 2 ? '17px' : '14px',
              }"
            >
              退款额(退款占比)
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template slot-scope="scope">
            <div
              v-if="
                scope.row.orderRefundAmount || scope.row.orderRefundAmount === 0
              "
            >
              <span>{{ scope.row.orderRefundAmount.toFixed(2) }}</span>
              (
              <span>
                {{
                (scope.row.orderRefundAmountRate * 100).toFixed(2) + "%"
                }}
              </span>)
            </div>
            <div v-else>-</div>
          </template>
        </el-table-column>
        <el-table-column label="退单数(退单占比)" show-overflow-tooltip>
          <template slot-scope="scope">
            <div
              v-if="
                scope.row.erpRefundQuantity || scope.row.erpRefundQuantity === 0
              "
            >
              <span>{{ scope.row.erpRefundQuantity }}</span>
              (
              <span>
                {{
                (scope.row.erpRefundQuantityRate * 100).toFixed(2) + "%"
                }}
              </span>)
            </div>
            <div v-else>-</div>
          </template>
        </el-table-column>
        <el-table-column prop="orderDayAvg" label="日均销售订单" width="100" show-overflow-tooltip>
          <template slot-scope="scope">
            <div>{{ scope.row.orderDayAvg ? scope.row.orderDayAvg : "-" }}</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="simpleRefundAmountRate"
          label="退款率"
          width="100"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <div>
              {{
              scope.row.simpleRefundAmountRate !== null
              ? (scope.row.simpleRefundAmountRate * 100).toFixed(2) + "%"
              : "-"
              }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="lookBoardSpu(scope.row)">看板</el-button>
            <el-button type="text" size="small" @click="itemDetailSpu(scope.row)">明细</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <pagination
          v-show="spuTotal > 0"
          :total="spuTotal"
          :page.sync="spuPageParams.page"
          :limit.sync="spuPageParams.pageSize"
          @pagination="getSpuDataList"
        />
      </div>

      <!-- sku 列表 -->
      <div class="sku-container">
        <el-form class="page-search" inline ref="page-filter">
          <!-- 下拉选择名字 -->
          <el-form-item label="规格名称：" style="margin-right: 20px">
            <el-select v-model="selectSku" clearable filterable>
              <el-option
                v-for="(item, index) in skuNameArrCurrent"
                :key="item.code"
                :label="`${item.name}(${item.extendKeyword})`"
                :value="item.code"
              ></el-option>
            </el-select>
          </el-form-item>

          <!-- <el-form-item label="SKU编码：" style="margin-right: 20px">
            <el-input v-model="searchSkuParams.skuCode" size="small" placeholder="请输入SKU编码"></el-input>
          </el-form-item>-->
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="updateDeptReportsSku">搜索</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table
        v-loading="skuLoading"
        :data="skuDataList"
        border
        style="width: 100%"
        class="outHeight"
        :max-height="tabHeight"
      >
        <el-table-column prop="date" label="序号" min-width="30" type="index"></el-table-column>
        <el-table-column prop="specsName" label="规格名称" min-width="100" show-overflow-tooltip>
          <template slot-scope="scope">
            <div>{{ scope.row.specsName ? scope.row.specsName : "-" }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="skuCode" label="SKU编码" show-overflow-tooltip min-width="100">
          <template slot-scope="scope">
            <div>{{ scope.row.skuCode ? scope.row.skuCode : "-" }}</div>
          </template>
        </el-table-column>
        <el-table-column label="销售额(销售占比)" show-overflow-tooltip>
          <template slot-scope="scope">
            <div v-if="scope.row.orderAmount || scope.row.orderAmount === 0">
              <span>{{ scope.row.orderAmount.toFixed(2) }}</span>
              (
              <span>
                {{
                (scope.row.orderAmountRate * 100).toFixed(2) + "%"
                }}
              </span>)
            </div>
            <div v-else>-</div>
          </template>
        </el-table-column>
        <el-table-column prop="erpQuantity" label="订单数" show-overflow-tooltip width="70">
          <template slot-scope="scope">
            <div>{{ scope.row.erpQuantity ? scope.row.erpQuantity : "-" }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="customerPrice" label="客单价" show-overflow-tooltip>
          <template slot-scope="scope">
            <div>{{ scope.row.customerPrice ? scope.row.customerPrice : "-" }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="quantityPerNum" label="件单量" show-overflow-tooltip width="70">
          <template slot-scope="scope">
            <div>{{ scope.row.quantityPerNum ? scope.row.quantityPerNum : "-" }}</div>
          </template>
        </el-table-column>
        <el-table-column label="退款额(退款占比)" show-overflow-tooltip>
          <template slot-scope="scope">
            <div
              v-if="
                scope.row.orderRefundAmount || scope.row.orderRefundAmount === 0
              "
            >
              <span>{{ scope.row.orderRefundAmount.toFixed(2) }}</span>
              (
              <span>
                {{
                (scope.row.orderRefundAmountRate * 100).toFixed(2) + "%"
                }}
              </span>)
            </div>
            <div v-else>-</div>
          </template>
        </el-table-column>
        <el-table-column label="退单数(退单占比)" show-overflow-tooltip>
          <template slot-scope="scope">
            <div
              v-if="
                scope.row.erpRefundQuantity || scope.row.erpRefundQuantity === 0
              "
            >
              <span>{{ scope.row.erpRefundQuantity }}</span>
              (
              <span>
                {{
                (scope.row.erpRefundQuantityRate * 100).toFixed(2) + "%"
                }}
              </span>)
            </div>
            <div v-else>-</div>
          </template>
        </el-table-column>
        <el-table-column label="日均销售订单" width="100" show-overflow-tooltip>
          <template slot-scope="scope">
            <div>{{ scope.row.orderDayAvg ? scope.row.orderDayAvg : "-" }}</div>
          </template>
        </el-table-column>
        <el-table-column label="退款率" width="100" show-overflow-tooltip>
          <template slot-scope="scope">
            <div>
              {{
              scope.row.simpleRefundAmountRate !== null
              ? (scope.row.simpleRefundAmountRate * 100).toFixed(2) + "%"
              : "-"
              }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="lookBoardSku(scope.row)">看板</el-button>
            <el-button type="text" size="small" @click="itemDetailSku(scope.row)">明细</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <pagination
          v-show="skuTotal > 0"
          :total="skuTotal"
          :page.sync="skuPageParams.page"
          :limit.sync="skuPageParams.pageSize"
          @pagination="getSkuDataList"
        />
      </div>
    </div>

    <StatisticsSpu
      v-if="spuDetailStatus"
      @closeDialog="detailStatus"
      :show="spuDetailStatus"
      :view="spuOrsku"
      :row="rowData"
      :title="detailTitle"
    ></StatisticsSpu>

    <el-dialog
      :title="productTitle"
      @close="productStatusSpu"
      :visible.sync="productShowSpu"
      show-close
      fullscreen
    >
      <product-spu
        v-if="productShowSpu"
        :currentRow="searchParms"
        :selectSpuChange="selectSpuChange"
      ></product-spu>
    </el-dialog>

    <el-dialog
      :title="productTitle"
      @close="productStatusSku"
      :visible.sync="productShowSku"
      show-close
      fullscreen
    >
      <product-sku
        v-if="productShowSku"
        :currentRow="searchParms"
        :selectSpuChange="selectSpuChange"
        :selectSkuChange="selectSkuChange"
      ></product-sku>
    </el-dialog>
  </div>
</template>

<script>
import {
  spuPage,
  spuPush,
  skuPush,
  greedPush,
  skuPage,
  skuCode,
} from '@/api/bulletinboard/statistics.js'
import {
  getYesterdayMidnightTimestamp,
  addDay,
  addDayEnd,
} from '@/utils/common.js'
import { debounce } from 'lodash'

import StatisticsSpu from '@/views/bulletinboard/statistics/components/StatisticsSpu.vue'
import ProductSpu from '@/views/bulletinboard/components/ProductSpu.vue'
import ProductSku from '@/views/bulletinboard/components/ProductSku.vue'

export default {
  name: 'Statistics',
  data() {
    return {
      // 默认时间
      INIT_TIME_START: 1725120000000,
      INIT_TIME_END: 1725120000000,
      // 表格高度
      tabHeight: 600,
      // 屏幕宽度
      screenWidth: window.innerWidth,
      // 屏幕高度
      screenHeight: window.innerHeightMyAgeFrom,

      // false 为不可更改
      // sku下拉框是否可以更改
      selectSkuChange: false,
      // spu下拉框是否可以更改
      selectSpuChange: false,
      // 看板dialog标题
      productTitle: '',
      // 看板是否显示
      productShowSpu: false,
      // 看板是否显示
      productShowSku: false,
      // 明细dialog标题
      detailTitle: '',
      // ============================
      // sku筛选条件
      selectSku: '',
      // 等级
      currentGradeType: '',
      // spu名称-产品名称
      currentSpuName: [],
      // sku加载状态
      skuLoading: false,
      // spu加载状态
      spuLoading: true,
      // spu名字下拉框
      spuNameArr: [],
      // spu筛选后的列表
      spuNameArrCurrent: [],
      // 产品等级下拉框
      spuGradeArr: [],
      // spu时间范围
      spuTimeScope: [],
      // spu搜索条件
      searchParams: {
        startTime: null,
        endTime: null,
        formatType: 2, //1----年月，2------年月日
        gradeType: '1', //产品等级
        productName: [], //	产品名称
        page: 1,
        pageSize: 10,
        sortType: 1, // 默认值设为 1
      },
      spuPageParams: {
        page: 1,
        pageSize: 10,
      },
      // spu列表
      spuDataList: [],
      // spu列表总数
      spuTotal: 0,
      // spu名字下拉框默认加载数量
      rangeNumber: 10,
      // spu名字搜索框
      spuSearch: '',
      // 当前选择的spu
      currentSpu: null,
      // sku列表
      skuDataList: [],
      // sku列表总数
      skuTotal: 0,
      skuCodeArr: [],
      // sku筛选后的列表
      skuNameArrCurrent: [],
      // sku名称搜索框
      skuSearch: '',
      // sku编码搜索框
      skuSearchCode: '',
      // sku搜索条件
      searchSkuParams: {
        startTime: null,
        endTime: null,
        formatType: 1, //1----年月，2------年月日
        skuUuid: '', //	Sku
        // skuCode: '',//	sku编码
        spuUuid: '',
        page: 1,
        pageSize: 10,
      },
      skuPageParams: {
        page: 1,
        pageSize: 10,
      },
      // sku名字下拉框默认加载数量
      rangeNumberSku: 10,
      // spu明细状态
      spuDetailStatus: false,
      // 是spu明细还是sku明细
      spuOrsku: 'spu',
      // 当前选择的dialog数据
      rowData: null,
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
      // 选中的开始时间
      startPickerTime: '',
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
    }
  },
  async created() {
    this.INIT_TIME_START = addDay(-7)
    // console.log('this.INIT_TIME_START : ', this.INIT_TIME_START );
    this.INIT_TIME_END = addDayEnd(-1)
    // console.log('this.INIT_TIME_END: ', this.INIT_TIME_END);
    this.setDefaultSpuTime()
    await this.getSpuDataList()
    // this.currentSpu = this.spuDataList[0].spuUuid
    // this.searchSkuParams.spuUuid = this.currentSpu
    // console.log('searchSkuParams: ', this.searchSkuParams);
    // this.getSkuDataList()
    this.selectSpuData()
    this.getSkuNameArr()
  },
  mounted() {
    // 监听屏幕变化
    this.debounceHandleResize = this.debounce(this.handleResize, 300)
    this.handleResize()
    window.addEventListener('resize', this.debounceHandleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleScrollOrder)
  },
  watch: {},
  computed: {},
  directives: {
    'el-select-loadmore': (el, binding) => {
      // 获取element-ui定义好的scroll盒子
      const SELECTWRAP_DOM = el.querySelector(
        '.el-select-dropdown .el-select-dropdown__wrap'
      )
      if (SELECTWRAP_DOM) {
        SELECTWRAP_DOM.addEventListener('scroll', function () {
          // console.log('this.scrollTop: ', Math.round(this.scrollTop) + 1)
          // console.log('this.scrollHeight: ', this.scrollHeight)
          // console.log('this.clientHeight: ', this.clientHeight)

          const condition =
            this.scrollHeight - (Math.round(this.scrollTop) + 1) <=
            this.clientHeight
          // console.log('condition: ', condition)
          if (condition) binding.value()
        })
      }
    },
  },
  methods: {
    handleResize() {
      this.screenWidth = window.innerWidth
      this.screenHeight = window.innerHeight
      // console.log('this.screenHeight: ', this.screenHeight);
      this.tabHeight =
        this.screenHeight - 460 > 0 ? this.screenHeight - 520 : 400
    },
    debounce(func, wait) {
      let timeout
      return function () {
        const context = this
        const args = arguments
        clearTimeout(timeout)
        timeout = setTimeout(function () {
          func.apply(context, args)
        }, wait)
      }
    },
    // 关闭看板
    productStatusSpu() {
      this.productShowSpu = false
    },
    productStatusSku() {
      this.productShowSku = false
    },
    // 关闭明细
    detailStatus() {
      this.spuDetailStatus = false
    },
    // sku名称下拉框
    async getSkuNameArr() {
      let res3 = await skuPush(this.currentSpu)
      this.skuNameArrCurrent = res3.data
      this.searchSkuParams.skuUuid = ''
    },
    // sku明细
    itemDetailSku(row) {
      const rowDataAss = Object.assign(row, {
        timeArr: this.spuTimeScope,
      })
      rowDataAss.spuUuid = this.currentSpu

      this.rowData = rowDataAss
      this.spuOrsku = 'sku'
      this.detailTitle = 'sku明细'
      this.spuDetailStatus = true
    },
    // sku看板
    lookBoardSku(row) {
      this.productTitle = `${row.skuCode}(${row.specsName})看板`
      this.selectSpuChange = false
      this.selectSkuChange = false
      // console.log("row: ", row);
      // this.searchParms
      Object.assign(this.searchParms, {
        from: 'sku', //入口来源
        timeScopeArr: this.spuTimeScope, //时间范围数组
        timeScopeType: 2, //时间范围类型
        spu: {
          spuUuid: [this.currentSpu], //spu uuid
          spuNameArr: [], //spu名称数组
        },
        sku: {
          skuUuid: [row.skuUuid], //sku uuid
          skuCode: [row.skuCode], //sku编码
          skuNameArr: [row.specsName], //sku名称数组
          skuCodeArr: [], //sku编码数组
        },
      })
      this.productShowSku = true
    },
    // spu明细
    itemDetailSpu(row) {
      const rowDataAss = Object.assign(row, {
        timeArr: this.spuTimeScope,
      })
      this.rowData = rowDataAss
      this.spuOrsku = 'spu'
      this.detailTitle = 'spu明细'
      this.spuDetailStatus = true
      // console.log("itemDetailSpu===row: ", row);
    },
    // spu看板
    // TODO：spu看板

    lookBoardSpu(row) {
      this.productTitle = `${row.productName}看板`
      this.selectSpuChange = false
      // console.log("row: ", row);
      // this.searchParms
      Object.assign(this.searchParms, {
        from: 'spu', //入口来源
        timeScopeArr: this.spuTimeScope, //时间范围数组
        timeScopeType: 2, //时间范围类型
        spu: {
          spuUuid: [row.spuUuid], //spu uuid
          spuNameArr: [row.productName], //spu名称数组
        },
      })
      this.productShowSpu = true
    },
    // 修改spu下拉框
    changeSpuSearch() {
      // this.getSpuDataList()
    },
    changeSkuSearch() {
      this.getSkuDataList()
    },
    changeSpuSearchGrade() {
      // this.getSpuDataList()
    },
    // spu行点击事件
    clickSpuTabRow(row, column, event) {
      if (row.spuUuid === this.currentSpu) {
        return
      }
      this.currentSpu = row.spuUuid
      this.searchSkuParams.spuUuid = this.currentSpu
      // 重置页码
      this.skuPageParams.page = 1
      this.skuPageParams.pageSize = 10

      this.getSkuDataList()
      this.getSkuNameArr()
    },
    // 点击修改tab行颜色
    rowStyle({ row }) {
      if (this.currentSpu === row.spuUuid) {
        return {
          'background-color': 'rgb(235,240,240)',
          cursor: 'pointer',
        }
      }
      return { cursor: 'pointer' }
    },
    // 下拉框出现时，调用过滤方法
    visibleChange(flag) {
      if (flag) {
        this.filterMethod()
      }
    },
    filterMethod: debounce(function (filterVal) {
      if (filterVal) {
        let filterArr = this.spuNameArr.filter((item) => {
          return item.name.includes(filterVal)
        })
        this.spuNameArrCurrent = filterArr
      } else {
        this.spuNameArrCurrent = this.spuNameArr
      }
    }, 500),
    // spu名称下拉框加载更多
    loadMore(n) {
      // elementui下拉超过7条才会出滚动条,如果初始不出滚动条无法触发loadMore方法
      return () => (this.rangeNumber += 5) // 每次滚动到底部可以新增条数  可自定义
    },
    // 获取spu列表数据
    async getSpuDataList() {
      // 检查时间范围是否发生变化
      const isTimeRangeChanged =
        this.searchParams.startTime !== this.spuTimeScope[0] ||
        this.searchParams.endTime !== this.spuTimeScope[1]

      // 打印时间范围变化检测结果
      console.log('Is time range changed: ', isTimeRangeChanged)

      // 如果时间范围发生变化，将 sortType 置为 1
      if (isTimeRangeChanged) {
        this.searchParams.sortType = 1
      }

      this.searchParams = Object.assign(
        this.searchParams,
        {
          startTime: this.spuTimeScope[0],
          endTime: this.spuTimeScope[1],
          formatType: 2, //1----年月，2------年月日
          gradeType: this.currentGradeType, //产品等级
          productName: this.currentSpuName, //	产品名称
        },
        this.spuPageParams
      )
      // console.log(' this.searchParams: ', this.searchParams)

      this.spuLoading = true
      let res = await spuPage(this.searchParams)
      this.spuDataList = res.data.records
      this.spuLoading = false

      // console.log("res: ", res);
      this.spuTotal = res.data.total

      this.handleResize()
    },
    // 获取sku列表数据
    async getSkuDataList() {
      this.searchSkuParams = Object.assign(
        this.searchParams,
        {
          startTime: this.spuTimeScope[0],
          endTime: this.spuTimeScope[1],
          formatType: 2, //1----年月，2------年月日
          spuUuid: this.currentSpu,
          skuUuid: this.selectSku,
          sortType: this.searchParams.sortType,
        },
        this.skuPageParams
      )
      // console.log(' this.searchSkuParams: ', this.searchSkuParams)

      this.skuLoading = true
      let res = await skuPage(this.searchSkuParams)
      this.skuDataList = res.data.records
      this.skuLoading = false
      // console.log("res: ", res);
      this.skuTotal = res.data.total

      this.handleResize()
    },
    // 修改spu时间范围
    changeSpuTimeScope(val) {
      // console.log("val: ", val);
      // console.log("spuTimeScope: ", spuTimeScope);
      // this.searchParams.startTime = val[0];
      // this.searchParams.endTime = val[1];
      // this.getSpuDataList();
    },
    // 时间选择失焦时将startPickerTime置空 目的是清除禁用的时间范围
    blurTime() {
      this.startPickerTime = ''
    },

    // spu搜索按钮
    updateDeptReports() {
      this.currentSpu = ''
      this.skuDataList = []
      this.spuPageParams.page = 1
      this.spuPageParams.pageSize = 10
      this.getSpuDataList()
    },
    // 切换排序
    changeSortType(val) {
      this.searchParams.sortType = val
      this.updateDeptReports()
    },
    // sku搜索按钮
    updateDeptReportsSku() {
      // 重置页码
      this.skuPageParams.page = 1
      this.skuPageParams.pageSize = 10
      this.getSkuDataList()
    },
    // 设置默认spu时间
    setDefaultSpuTime() {
      this.searchParams.startTime = this.INIT_TIME_START
      this.searchParams.endTime = this.INIT_TIME_END

      this.searchSkuParams.startTime = this.INIT_TIME_START
      this.searchSkuParams.endTime = this.INIT_TIME_END
      // this.searchParams.startTime = getYesterdayMidnightTimestamp()
      // this.searchParams.endTime = getYesterdayMidnightTimestamp()
      this.spuTimeScope = [
        this.searchParams.startTime,
        this.searchParams.endTime,
      ]
    },
    // 下拉框数据
    async selectSpuData() {
      let res1 = await spuPush()
      this.spuNameArr = res1.data
      this.spuNameArrCurrent = this.spuNameArr
      let res2 = await greedPush()
      this.spuGradeArr = res2.data

      let res4 = await skuCode()
      // console.log('res4: ', res4);
      this.skuCodeArr = res4.data
    },
  },
  components: {
    StatisticsSpu,
    ProductSku,
    ProductSpu,
  },
}
</script>

<style lang="scss" scoped>
.statistics {
  padding: 20px;

  .spu-list {
    overflow-y: auto;
  }

  .statistics-container {
    display: flex;
    flex-direction: column;
    flex: 1;

    .spu-container {
      padding-bottom: 20px;
    }
  }
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.outHeight {
  ::v-deep .el-table__body-wrapper {
    overflow-y: auto;
    // min-height: 100px
  }

  @media screen and (min-width: 768px) {
    /* 平板设备及以上 */
    ::v-deep .el-table__body-wrapper {
      height: 200px;
    }
  }

  @media screen and (min-width: 1024px) {
    /* 桌面设备 */
    ::v-deep .el-table__body-wrapper {
      height: 250px;
    }
  }

  @media screen and (min-width: 1200px) {
    /* 大屏幕设备 */
    ::v-deep .el-table__body-wrapper {
      height: 300px;
    }
  }
}
</style>
