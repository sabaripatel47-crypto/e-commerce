<template>
  <div class="statistics">
    <el-dialog
      :title="title"
      @close="closeDialog"
      :visible.sync="delogShow"
      show-close
      fullscreen
      class="dialog-style"
      append-to-body
    >
      <div class="statistics-container">
        <!-- spu 列表 -->
        <div class="spu-container">
          <el-form class="page-search" inline ref="page-filter">
            <!--时间范围 -->
            <el-form-item label="时间范围：" style="margin-right: 20px">
              <div class="data-range-style">
                <div style="margin-bottom: -4px;">
                  <el-radio-group v-model="dateRange" size="mini">
                    <el-radio-button :label="2">按日</el-radio-button>
                    <el-radio-button :label="1">按月</el-radio-button>
                  </el-radio-group>
                </div>
                <div>
                  <!-- <el-date-picker v-model="timeScope" :clearable="false" type="daterange" align="right" unlink-panels  value-format="timestamp" @change="changeSpuTimeScope" style="padding-right: 20px"></el-date-picker> -->
                  <el-date-picker
                    ref="datePick"
                    v-model="timeScope"
                    :clearable="false"
                    :type="dateRange == 2 ? 'daterange' : 'monthrange'"
                    :key="dateRange == 2 ? 'daterange' : 'monthrange'"
                    align="right"
                    unlink-panels
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="timestamp"
                    @change="changeSpuTimeScope"
                    @blur="blurTime"
                    style="padding-right: 20px;"
                    :picker-options="dateRange == 2 ? pickerOptions : ''"
                  ></el-date-picker>
                </div>
              </div>
            </el-form-item>
            <!-- 下拉选择平台 -->
            <el-form-item label="平台：" style="margin-right: 20px;">
              <el-select v-model="platform" placeholder="请选择" clearable>
                <el-option
                  v-for="(item, index) in platformList"
                  :key="item.code"
                  :label="item.name"
                  :value="item.code"
                ></el-option>
              </el-select>
            </el-form-item>
            <!-- 下拉选择统计类型 -->
            <el-form-item label="统计类型：" style="margin-right: 20px;">
              <el-select @change="changeSelectType" v-model="statisticsType" placeholder="请选择">
                <el-option
                  v-for="item in gradeType"
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
        <el-table
          v-loading="spuLoading"
          v-if="view === 'spu'"
          class="outHeight"
          fit
          :data="visibleCalendarSpu"
          border
          style="width: 100%"
          @row-click="clickSpuTabRow"
          :max-height="tabHeight"
          :span-method="spanMethodSpu"
        >
          <el-table-column prop="spuName" label="产品名称" width="200" show-overflow-tooltip>
            <template slot-scope="{row}">
              <div>{{ formatTableItemCode(row.spuName) }}</div>
            </template>
          </el-table-column>

          <el-table-column prop="platformName" label="平台" width="100" show-overflow-tooltip>
            <template slot-scope="{row}">
              <div>{{ formatTableItemCode(row.platformName) }}</div>
            </template>
          </el-table-column>

          <el-table-column
            prop="time"
            :label="item"
            v-for="(item, index) in timeArr"
            :key="`spu-${index}`"
            min-width="90"
          >
            <template slot-scope="{row}">
              <div v-if="STA_KEY_ARR.includes(statisticsType)">
                <span
                  :class="{ 'item-red': setItemColor(row.origin[index][0]) === 'red', 'item-green': setItemColor(row.origin[index][0]) === 'green' }"
                >同比：{{ row.origin[index][0] }};</span>
                <span
                  :class="{ 'item-red': setItemColor(row.origin[index][1]) === 'red', 'item-green': setItemColor(row.origin[index][1]) === 'green' }"
                >环比：{{ row.origin[index][1] }}</span>
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
                @click="clickTendency(visibleCalendarSpu, scope.row, 'spu')"
              >趋势</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- SKU -->
        <el-table
          v-loading="skuLoading"
          v-else
          class="outHeight"
          fit
          :data="visibleCalendarSku"
          border
          style="width: 100%"
          @row-click="clickSpuTabRow"
          :max-height="tabHeight"
          :span-method="spanMethodSku"
        >
          <el-table-column prop="skuName" label="SKU编码" width="200" show-overflow-tooltip>
            <template slot-scope="{row}">
              <div>{{ formatTableItemCode(row.skuName) }}</div>
            </template>
          </el-table-column>

          <el-table-column prop="spacesName" label="规格名称" width="150" show-overflow-tooltip>
            <template slot-scope="{row}">
              <div>{{ formatTableItemCode(row.spacesName) }}</div>
            </template>
          </el-table-column>

          <el-table-column prop="platformName" label="平台" width="100" show-overflow-tooltip>
            <template slot-scope="{row}">
              <div>{{ formatTableItemCode(row.platformName) }}</div>
            </template>
          </el-table-column>

          <el-table-column
            prop="time"
            :label="item"
            v-for="(item, index) in timeArr"
            :key="`sku-${index}`"
            min-width="90"
          >
            <template slot-scope="{row}">
              <div v-if="STA_KEY_ARR.includes(statisticsType)">
                <span
                  :class="{ 'item-red': setItemColor(row.origin[index][0]) === 'red', 'item-green': setItemColor(row.origin[index][0]) === 'green' }"
                >同比：{{ row.origin[index][0] }};</span>
                <span
                  :class="{ 'item-red': setItemColor(row.origin[index][1]) === 'red', 'item-green': setItemColor(row.origin[index][1]) === 'green' }"
                >环比：{{ row.origin[index][1] }}</span>
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
                @click="clickTendency(visibleCalendarSku, scope.row, 'sku')"
              >趋势</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 商品链接=====SKU表单 -->
        <div class="sku-container">
          <!--时间范围 -->
          <el-form class="page-search" inline ref="page-filter">
            <div class="date-ange-style2" v-if="view === 'spu'">
              <el-radio-group v-model="shopOrSku" @change="changeLinkOrSku">
                <el-radio-button :label="1">商品链接</el-radio-button>
                <el-radio-button :label="2">SKU</el-radio-button>
              </el-radio-group>
            </div>
            <!-- 下拉选择商品等级 -->
            <el-form-item v-show="shopOrSku === 1" label="商品等级：" style="margin-right: 20px;">
              <el-select
                v-model="currentGradeType"
                clearable
                placeholder="请选择"
                @change="changeSpuSearchGrade"
              >
                <el-option
                  v-for="item in spuGradeArr"
                  :key="item.code"
                  :label="item.name"
                  :value="item.code"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-show="shopOrSku === 1" label="店铺：" style="margin-right: 20px;">
              <el-select
                v-model="storeUuid"
                clearable
                filterable
                :filter-method="filterMethod"
                v-el-select-loadmore="loadMore(rangeNumber)"
                @visible-change="visibleChange"
              >
                <el-option
                  v-for="(item, index) in shopNameCurrent.slice(0, rangeNumber)"
                  :key="item.code"
                  :label="item.name"
                  :value="item.code"
                ></el-option>
              </el-select>
            </el-form-item>
            <!-- 下拉选择等级 -->
            <el-form-item v-show="shopOrSku === 1" label="负责人：" style="margin-right: 20px;">
              <el-cascader
                filterable
                v-model="managerUuid"
                :options="departments"
                :show-all-levels="false"
                :props="{ children: 'children', label: 'deptName', value: 'deptId', checkStrictly: false }"
                clearable
              ></el-cascader>
            </el-form-item>
            <el-form-item v-show="shopOrSku === 1">
              <el-button type="primary" icon="el-icon-search" @click="updateDeptReportsLink">搜索</el-button>
            </el-form-item>
          </el-form>
        </div>
        <!-- 商品链接 -->
        <el-table
          v-if="shopOrSku === 1 || view === 'sku'"
          class="outHeight"
          fit
          :data="visibleCalendarLink"
          border
          v-loading="linkLoading"
          style="width: 100%"
          @row-click="clickSpuTabRow"
          :max-height="tabHeight"
          :span-method="spanMethodLink"
        >
          <el-table-column prop="linkUuid" label="链接编码" width="200" show-overflow-tooltip>
            <template slot-scope="{row}">
              <div>{{ formatTableItemCode(row.linkUuid) }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="linkName" label="商品名称" width="150" show-overflow-tooltip>
            <template slot-scope="{row}">
              <div>{{ formatTableItemCode(row.linkName) }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="gradeTypeName" label="商品等级" width="80" show-overflow-tooltip>
            <template slot-scope="{row}">
              <div>{{ formatTableItemCode(row.gradeTypeName) }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="linkTimeStatusName" label="商品阶段" width="80" show-overflow-tooltip>
            <template slot-scope="{row}">
              <div>{{ formatTableItemCode(row.linkTimeStatusName) }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="storeName" label="店铺" width="200" show-overflow-tooltip>
            <template slot-scope="{row}">
              <div>{{ formatTableItemCode("(" + row.storeCode + ")" +row.storeName) }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="manage" label="负责人" width="100" show-overflow-tooltip>
            <template slot-scope="{row}">
              <div>{{ formatTableItemCode(row.manage) }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="platformName" label="平台" width="100" show-overflow-tooltip>
            <template slot-scope="{row}">
              <div>{{ formatTableItemCode(row.platformName) }}</div>
            </template>
          </el-table-column>
          <el-table-column
            prop="time"
            :label="item"
            v-for="(item, index) in timeArrLink"
            :key="`link-${index}`"
            min-width="90"
          >
            <template slot-scope="{row}">
              <div v-if="STA_KEY_ARR.includes(statisticsType)">
                <span
                  :class="{ 'item-red': setItemColor(row.origin[index][0]) === 'red', 'item-green': setItemColor(row.origin[index][0]) === 'green' }"
                >同比：{{ row.origin[index][0] }};</span>
                <span
                  :class="{ 'item-red': setItemColor(row.origin[index][1]) === 'red', 'item-green': setItemColor(row.origin[index][1]) === 'green' }"
                >环比：{{ row.origin[index][1] }}</span>
              </div>
              <div v-else>{{ row[item] }}</div>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="90" show-overflow-tooltip>
            <template slot-scope="{row}">
              <el-button
                type="text"
                size="small"
                :disabled="STA_KEY_ARR.includes(statisticsType)"
                @click="clickTendency(visibleCalendarLink, row, 'link')"
              >趋势</el-button>
              <!--选日的时候才有日报-->
              <el-button type="text" size="small" v-if="dateRange === 2" @click="showDailyDetail(row)">日报</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- SKU -->
        <el-table
          v-if="shopOrSku === 2 && view === 'spu'"
          v-loading="skuLoading"
          class="outHeight"
          fit
          :data="visibleCalendarSku"
          border
          style="width: 100%"
          @row-click="clickSpuTabRow"
          :max-height="tabHeight"
          :span-method="spanMethodSku"
        >
          <el-table-column prop="skuName" label="SKU编码" width="200" show-overflow-tooltip>
            <template slot-scope="{row}">
              <div>{{ formatTableItemCode(row.skuName) }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="spacesName" label="规格名称" width="150" show-overflow-tooltip>
            <template slot-scope="{row}">
              <div>{{ formatTableItemCode(row.spacesName) }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="platformName" label="平台" width="100" show-overflow-tooltip>
            <template slot-scope="{row}">
              <div>{{ formatTableItemCode(row.platformName) }}</div>
            </template>
          </el-table-column>
          <el-table-column
            prop="time"
            :label="item"
            v-for="(item, index) in timeArr"
            :key="`spusku-${index}`"
            min-width="90"
          >
            <template slot-scope="{row}">
              <div v-if="STA_KEY_ARR.includes(statisticsType)">
                <span
                  :class="{ 'item-red': setItemColor(row.origin[index][0]) === 'red', 'item-green': setItemColor(row.origin[index][0]) === 'green' }"
                >同比：{{ row.origin[index][0] }};</span>
                <span
                  :class="{ 'item-red': setItemColor(row.origin[index][1]) === 'red', 'item-green': setItemColor(row.origin[index][1]) === 'green' }"
                >环比：{{ row.origin[index][1] }}</span>
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
                @click="clickTendency(visibleCalendarSku, scope.row, 'spusku')"
              >趋势</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination" v-if="view === 'sku' || shopOrSku === 1">
          <pagination
            v-show="linkParamsPage.linkTotal > 0"
            :total="linkParamsPage.linkTotal"
            :page.sync="linkParamsPage.page"
            :limit.sync="linkParamsPage.pageSize"
            @pagination="getLinkDataList"
          />
        </div>

        <div class="pagination" v-if="view === 'spu' && shopOrSku === 2">
          <pagination
            v-show="skuParamsPage.skuTotal > 0"
            :total="skuParamsPage.skuTotal"
            :page.sync="skuParamsPage.page"
            :limit.sync="skuParamsPage.pageSize"
            @pagination="getSkuDataList"
          />
        </div>
      </div>

      <el-dialog
        width="70%"
        :title="tendencyTitle"
        :visible.sync="innerVisible"
        append-to-body
        style="overflow-x: auto;"
      >
        <line-chart
          v-if="innerVisible"
          :option="lineChartOption"
          :chartData="lineChartOption"
          :height="'320px'"
        ></line-chart>
      </el-dialog>
    </el-dialog>
    <ViewDailyDialog
      :row.sync="dailyDialogRow"
      :showDialog.sync="showViewDailyDialog"
      :parentReqParams.sync="dailyReqParams"
      :readOnly="false"
    ></ViewDailyDialog>
  </div>
</template>

<script>
import {
  spuStatistical,
  skuStatistical,
  statistical,
  linkSkuStatistical,
  linkStatistical,
  tableHander,
  greedPush,
  superListPush,
} from '@/api/bulletinboard/statistics.js'
import { listPlatform } from '@/api/baseData/common.js'
import {
  getFormatDate,
  getDeptTreeData,
  getFormaMonth,
  addDay,
  addDayEnd,
} from '@/utils/common.js'
import { rowSpan, combine } from '@/utils/tableSpan.js'
import { department } from '@/api/information/department'
import ViewDailyDialog from '@/views/dailyManage/viewDaily/viewDailyDialog'
import { debounce, isNull, isNil } from 'lodash'
// import { rowSpan, combine } from '@/utils/rowSpan.js'
import lineChart from '@/components/charts/LineChart.vue'

export default {
  name: 'StatisticsSpu',
  props: {
    // 是否显示dialog
    show: {
      type: Boolean,
      default: false,
    },
    // dialog是spu还是sku
    view: {
      type: String,
      default: 'spu',
    },
    // 选择的数据
    row: {
      type: Object,
      default: () => {
        return {}
      },
    },
    title: {
      type: String,
      default: 'spu明细',
    },
  },
  watch: {
    show(val) {
      if (val) {
        this.delogShow = val
      }
    },
    row: {
      handler: function (newValue, oldValue) {},
      deep: true,
    },
  },
  data() {
    return {
      //展示日报时的入参
      dailyReqParams: {
        startTime: '',
        endTime: '',
        linkId: [],
      },
      // 显示日报弹层
      showViewDailyDialog: false,
      // 传给日报的详情信息
      dailyDialogRow: {},

      // 同比环比的数据配置key
      STA_KEY_ARR: [10, 11, 12],
      // 是否切换了同比环比
      // isChangeType: false,
      // 表格高度
      tabHeight: 600,
      // 屏幕宽度
      screenWidth: window.innerWidth,
      // 屏幕高度
      screenHeight: window.innerHeightMyAgeFrom,

      // 趋势折线图配置
      lineChartOption: {},
      // 趋势弹框标题
      tendencyTitle: '',
      // 弹窗是否显示
      delogShow: true,
      // 趋势弹框
      innerVisible: false,
      //部门人员的下拉框
      departments: [],
      // sku加载状态
      skuLoading: true,
      // spu加载状态
      spuLoading: true,
      // 链接加载状态
      linkLoading: true,
      // 商品链接，sku切换按钮
      shopOrSku: 1,
      // spu时间切换按钮
      dateRange: 2,
      // 等级选择
      currentGradeType: '',
      // 平台选择
      platform: '',
      // 负责人选择
      managerUuid: [],
      // 店铺
      storeUuid: '',
      // ===========================================
      // 动态表头（日期）
      timeArr: [],
      timeArrLink: [],
      // 平台下拉框
      platformList: [],
      // 统计类型数据
      gradeType: [],
      // spu时间范围
      timeScope: [],
      // 统计类型
      statisticsType: '',
      // 当前统计类型名字
      // statisticsTypeName: '',
      // sku请求分页
      skuParamsPage: {
        page: 1,
        pageSize: 10,
        // sku列表总数
        skuTotal: 0,
      },
      /* =========spu================= */
      // spu搜索条件
      spuParams: {
        statisticsType: 1,
        spuUuid: '',
        platform: '',
        startTime: '',
        endTime: '',
        formatType: '',
      },
      // spu列表
      spuDataList: [],
      visibleCalendarSpu: [],
      // spu列表总数
      spuTotal: 0,
      // 当前选择的spu
      currentSpu: null,
      /* ==========sku============== */
      // sku统计
      skuParams: {
        page: '1',
        pageSize: '10',
        statisticsType: '',
        spuUuid: '',
        skuUuid: '',
        platform: '',
        startTime: '',
        endTime: '',
        formatType: '',
      },
      // sku列表原数据
      skuDataList: [],
      // sku列表格式化数据
      visibleCalendarSku: [],
      // 店铺下拉框
      shopNameCurrent: [],
      shopName: [],
      // sku名字下拉框默认加载数量
      rangeNumber: 10,
      // 产品等级下拉框
      spuGradeArr: [],
      /* ===========链接============ */
      // 链接统计
      linkParams: {
        statisticsType: '',
        spuUuid: '',
        startTime: '',
        endTime: '',
        formatType: '',
        gradeType: '',
        managerUuid: '',
        storeUuid: '',
      },
      // link请求分页
      linkParamsPage: {
        page: 1,
        pageSize: 10,
        // sku列表总数
        linkTotal: 0,
      },
      // 链接数据
      linkDataList: [],
      // 链接列表格式化数据
      visibleCalendarLink: [],

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
  directives: {
    'el-select-loadmore': (el, binding) => {
      // 获取element-ui定义好的scroll盒子
      const SELECTWRAP_DOM = el.querySelector(
        '.el-select-dropdown .el-select-dropdown__wrap'
      )
      if (SELECTWRAP_DOM) {
        SELECTWRAP_DOM.addEventListener('scroll', function () {
          const condition =
            this.scrollHeight - this.scrollTop <= this.clientHeight
          if (condition) binding.value()
        })
      }
    },
  },
  async created() {
    this.getStatisticsType()
    this.setDefaultSpuTime()
    if (this.view === 'spu') {
      await this.getSpuDataList()
    }
    await this.getLinkDataList()
    await this.getSkuDataList()
    await this.selectSpuData()
    this.getDeptTree()
  },
  mounted() {
    // 监听屏幕变化
    this.debounceHandleResize = this.debounce(this.handleResize, 300)
    this.handleResize()
    window.addEventListener('resize', this.debounceHandleResize)
  },
  watch: {},
  computed: {},
  methods: {
    // 表数据合并
    spanMethodSpu({ row, column, rowIndex, columnIndex }) {
      const obj = Object.assign({}, this.visibleCalendarSpu)
      const rowSpanRes = rowSpan(obj, 'spuName', ['spuName'])
      return rowSpanRes({ row, column, rowIndex, columnIndex })
    },
    // 表数据合并
    spanMethodSku({ row, column, rowIndex, columnIndex }) {
      const obj = Object.assign({}, this.visibleCalendarSku)
      const rowSpanRes = rowSpan(obj, 'skuName', ['skuName', 'spacesName'])
      return rowSpanRes({ row, column, rowIndex, columnIndex })
    },

    spanMethodLink({ row, column, rowIndex, columnIndex }) {
      const obj = Object.assign({}, this.visibleCalendarSku)
      const rowSpanRes = rowSpan(obj, 'linkUuid', ['linkUuid', 'linkName'])
      return rowSpanRes({ row, column, rowIndex, columnIndex })
    },

    // 设置单元格颜色
    setItemColor(origin) {
      if (isNil(origin)) return
      if (origin === '-') return

      // 移除百分号
      const numStr = origin.replace('%', '')
      // 尝试将字符串转换为浮点数
      const num = parseFloat(numStr)
      // 检查是否为有效的数字
      if (!isNaN(num)) {
        // 使用 Math.sign() 判断数字的符号
        if (num > 0) {
          return 'red'
        } else if (num < 0) {
          return 'green'
        }
      }
    },
    // table高度适配
    handleResize() {
      this.screenWidth = window.innerWidth
      this.screenHeight = window.innerHeight
      this.tabHeight =
        this.screenHeight - 450 > 0 ? this.screenHeight - 450 : 600
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
    // 转换表格内容空的为-
    formatTableItemCode(str) {
      return str ?? '-'
    },
    // 切换链接和sku表
    changeLinkOrSku(val) {
      if (val === 1) {
        this.getLinkDataList()
      } else {
        this.getSkuDataList()
      }
    },
    // 趋势按钮
    clickTendency(data, row, type) {
      this.innerVisible = true
      if (type === 'spu') {
        this.tendencyTitle = 'SPU趋势'
        this.$nextTick(() => {
          this.getSpuTendencyOption(data, row, 'spuName')
        })
      } else if (type === 'sku') {
        this.tendencyTitle = 'SKU趋势'
        this.$nextTick(() => {
          this.getSpuTendencyOption(data, row, 'skuName')
        })
      } else if (type === 'link') {
        this.tendencyTitle = '链接趋势'
        this.$nextTick(() => {
          this.getSkuTendencyOption(data, row, 'linkUuid')
        })
      } else if (type === 'spusku') {
        this.$nextTick(() => {
          this.getSkuTendencyOption(data, row, 'spacesName')
        })
        this.tendencyTitle = 'SKU趋势'
      }
    },
    // 多个趋势表格option
    async getSkuTendencyOption(data, row, name) {
      let titleName = name === 'linkUuid' ? '商品链接编码' : 'SKU编码'

      this.lineChartOption = {}
      const option = {
        title: { text: `${titleName}-${row[name]}`, left: 'center' },
        tooltip: {
          formatter:
            this.statisticsType === 7
              ? '{a} <br/>{b}  {c}%'
              : '{a} <br/>{b}  {c}',
        },
        legend: { orient: 'vertical', left: 'left', data: [] },
        xAxis: { data: this.timeArr }, // 时间点集合
        yAxis: { type: 'value' },
        series: [],
      }
      const newArr = data.filter((item) => {
        return item[name] === row[name]
      })

      newArr.map((item, index) => {
        // 如果是退款率 去除退款率后的%
        if (this.statisticsType === 7) {
          item.origin = item.origin.map((el) => {
            if (el) {
              el = el.split('%').join('')
            }
            return el
          })
        }

        option.legend.data.push(item.platformName)
        option.series.push({
          name: item.platformName,
          type: 'line',
          data: [...item.origin],
        })
      })
      this.lineChartOption = { ...option }
    },
    // 单个趋势表格option
    async getSpuTendencyOption(data, row, name) {
      let titleName = name === 'spuName' ? '产品名称' : 'SKU编码'

      this.lineChartOption = {}
      const option = {
        title: { text: `${titleName}-${row[name]}`, left: 'center' },
        tooltip: {
          formatter:
            this.statisticsType === 7
              ? '{a} <br/>{b}  {c}%'
              : '{a} <br/>{b}  {c}',
        },
        legend: { orient: 'vertical', left: 'left', data: [] },
        xAxis: { data: this.timeArr }, // 时间点集合
        yAxis: { type: 'value' },
        series: [],
      }
      data.map((item, index) => {
        // 如果是退款率 去除退款率后的%
        if (this.statisticsType === 7) {
          item.origin = item.origin.map((el) => {
            if (el) {
              el = el.split('%').join('')
            }
            return el
          })
        }
        option.legend.data.push(item.platformName)
        option.series.push({
          name: item.platformName,
          type: 'line',
          data: [...item.origin],
        })
      })
      this.lineChartOption = { ...option }
    },
    // 关闭明细页面
    closeDialog() {
      this.$emit('closeDialog')
    },
    // 统计类型切换
    async changeSelectType(val) {
      this.statisticsType = val
      this.updateDeptReports()
    },
    // 商品等级切换
    changeSpuSearchGrade() {
      // this.getSpuDataList()
    },
    // 下拉框出现时，调用过滤方法
    visibleChange(flag) {
      if (flag) {
        this.filterMethod()
      }
    },
    filterMethod: debounce(function (filterVal) {
      if (filterVal) {
        let filterArr = this.shopName.filter((item) => {
          return item.name.includes(filterVal)
        })
        this.shopNameCurrent = filterArr
      } else {
        this.shopNameCurrent = this.shopName
      }
    }, 500),
    // spu名称下拉框加载更多
    loadMore(n) {
      // elementui下拉超过7条才会出滚动条,如果初始不出滚动条无法触发loadMore方法
      return () => (this.rangeNumber += 5) // 每次滚动到底部可以新增条数  可自定义
    },
    // 负责人组织架构数据
    async getDeptTree() {
      const res = await department()
      this.departments = await getDeptTreeData(res.data)
    },
    // spu行点击事件
    clickSpuTabRow(row, column, event) {
      if (row.spuUuid === this.currentSpu) {
        return
      }
      this.currentSpu = row.spuUuid
    },
    // 点击修改tab行颜色
    // rowStyle({ row }) {
    //   if (this.currentSpu === row.spuUuid) {
    //     return {
    //       'background-color': 'rgb(235,240,240)', cursor: 'pointer'
    //     }
    //   }
    //   return { cursor: 'pointer' }
    // },
    // 获取spu列表数据
    async getSpuDataList() {
      this.spuParams = Object.assign(this.spuParams, {
        statisticsType: this.statisticsType,
        spuUuid: this.row.spuUuid,
        platform: this.platform,
        startTime: this.timeScope[0],
        endTime: this.timeScope[1],
        formatType: this.dateRange,
        gradeType: this.currentGradeType,
      })

      // this.spuParams = Object.assign(this.spuParams, {
      //   "statisticsType": this.statisticsType,
      //   "spuUuid": this.row.spuUuid,
      //   "platform": this.platform,
      //   "startTime": this.timeScope[0],
      //   "endTime": this.timeScope[1],
      //   "formatType": this.dateRange
      // })

      this.spuLoading = true
      this.visibleCalendarSpu = []
      this.timeArr = []
      let res = await spuStatistical(this.spuParams)
      let times = await tableHander(this.spuParams)
      this.spuDataList = res.data.platFormVOList || []

      this.spuDataList.forEach((item) => {
        let newData = {
          spuName: '',
          platformName: '',
          origin: [],
        }
        newData.spuName = res.data.spuName
        newData.platformName = item.platformName
        this.visibleCalendarSpu.push(newData)
      })

      if (this.dateRange === 2) {
        times.data = times.data.map((item) => {
          return getFormatDate(parseInt(item))
        })
      } else {
        times.data = times.data.map((item) => {
          return getFormaMonth(parseInt(item))
        })
      }
      this.timeArr = times.data

      this.spuDataList.forEach((item, i) => {
        item.dataTimeVOList.map((obj, index) => {
          this.visibleCalendarSpu[i]['origin'].push(
            ...this.fromStatisticsType(obj, this.statisticsType, false)
          )
          let str = this.fromStatisticsType(obj, this.statisticsType, true)
          this.visibleCalendarSpu[i][times.data[index]] = str
        })
      })
      this.spuLoading = false
      this.currentSpu = this.spuDataList[0]?.spuUuid
    },
    // 获取sku列表数据
    async getSkuDataList() {
      this.skuParams = Object.assign(this.skuParams, {
        page: this.skuParamsPage.page,
        pageSize: this.skuParamsPage.pageSize,
        statisticsType: this.statisticsType,
        platform: this.platform,
        startTime: this.timeScope[0],
        endTime: this.timeScope[1],
        formatType: this.dateRange,
        gradeType: this.currentGradeType,
      })

      this.skuLoading = true
      this.visibleCalendarSku = []
      this.timeArr = []
      let res
      if (this.view === 'spu') {
        // 获取spu-sku详情
        this.skuParams.spuUuid = this.row.spuUuid
        res = await skuStatistical(this.skuParams)
        this.skuParamsPage.skuTotal = res.data.total
        this.skuDataList = res.data.records || []
      } else if (this.view === 'sku') {
        this.skuParams.skuUuid = this.row.skuUuid
        this.skuParams.spuUuid = this.row.spuUuid
        // 删除页码请求参数
        delete this.skuParams.page
        delete this.skuParams.pageSize
        // 获取sku-sku详情
        res = await statistical(this.skuParams)
        this.skuDataList = [res.data]
      }
      let times = await tableHander(this.skuParams)
      // this.timeArr = this.timeArr.map(item => {
      //   return getFormatDate(parseInt(item))
      // })

      if (this.dateRange === 2) {
        times.data = times.data.map((item) => {
          return getFormatDate(parseInt(item))
        })
      } else {
        times.data = times.data.map((item) => {
          return getFormaMonth(parseInt(item))
        })
      }
      this.timeArr = times.data

      this.skuDataList?.map((List) => {
        List.platFormVOList?.map((item, index) => {
          let newData = {
            skuName: '',
            platformName: '',
            spacesName: '',
            origin: [],
          }
          newData.skuName = List.skuName
          newData.spacesName = List.spacesName
          //获取每个平台的数据
          newData.platformName = item.platformName
          this.visibleCalendarSku.push(newData)
        })
      })

      let count = -1
      // 获取每个时间的数据
      this.skuDataList?.forEach((List, z_index) => {
        List.platFormVOList?.forEach((item, i) => {
          count += 1
          item.dataTimeVOList.map((obj, index) => {
            this.visibleCalendarSku[count]['origin'].push(
              ...this.fromStatisticsType(obj, this.statisticsType, false)
            )
            let str = this.fromStatisticsType(obj, this.statisticsType, true)
            this.visibleCalendarSku[count][times.data[index]] = str
          })
        })
      })
      this.skuLoading = false
    },
    // 获取链接列表数据
    async getLinkDataList() {
      this.linkLoading = true
      // this.view === 'spu' ? this.spuLoading = true : this.skuLoading = true
      // 获取负责人id
      const managerUuid =
        this.managerUuid.length > 0
          ? this.managerUuid[this.managerUuid.length - 1]
          : ''

      this.linkParams = Object.assign(
        this.linkParams,
        {
          statisticsType: this.statisticsType,
          spuUuid: this.row.spuUuid,
          skuUuid: this.row.skuUuid,
          startTime: this.timeScope[0],
          endTime: this.timeScope[1],
          formatType: this.dateRange,
          platform: this.platform,
          gradeType: this.currentGradeType,
          managerUuid: managerUuid,
          storeUuid: this.storeUuid,
        },
        this.linkParamsPage
      )

      this.visibleCalendarLink = []
      this.timeArrLink = []
      let res, times
      if (this.view === 'spu') {
        res = await linkStatistical(this.linkParams)
      } else {
        // delete this.linkParams.spuUuid
        res = await linkSkuStatistical(this.linkParams)
      }
      times = await tableHander(this.linkParams)
      // this.linkDataList =.records
      this.linkDataList = res.data.records || []
      this.linkParamsPage.linkTotal = res.data.total
      if (this.dateRange === 2) {
        times.data = times.data.map((item) => {
          return getFormatDate(parseInt(item))
        })
      } else {
        times.data = times.data.map((item) => {
          return getFormaMonth(parseInt(item))
        })
      }
      this.timeArrLink = times.data

      this.linkDataList.forEach((List) => {
        List.platFormVOList.map((item, index) => {
          let newData = {
            linkUuid: '',
            linkName: '',
            gradeTypeName: '',
            storeName: '',
            linkTimeStatusName:'',
            storeCode:'',
            manage: '',
            platformName: '',
            origin: [],
          }
          newData.linkUuid = List.linkUuid
          newData.linkName = List.linkName
          newData.gradeTypeName = List.gradeTypeName
          newData.storeName = List.storeName
          newData.linkTimeStatusName = List.linkTimeStatusName
          newData.storeCode = List.storeCode
          newData.manage = List.manage
          // newData.origin = List.origin
          //获取每个平台的数据
          newData.platformName = item.platformName
          this.visibleCalendarLink.push(newData)
        })
      })

      let count = -1
      this.linkDataList.forEach((List, z_index) => {
        List.platFormVOList.forEach((item, i) => {
          count += 1
          item.dataTimeVOList.map((obj, index) => {
            this.visibleCalendarLink[count]['origin'].push(
              ...this.fromStatisticsType(obj, this.statisticsType, false)
            )
            let str = this.fromStatisticsType(obj, this.statisticsType, true)
            this.visibleCalendarLink[count][times.data[index]] = str
          })
        })
      })

      this.linkLoading = false
      // this.view === 'spu' ? this.spuLoading = false : this.skuLoading = false
    },
    // 根据统计类型，返回不同的单元格值
    fromStatisticsType(obj, type, istable) {
      // let res, d1, d2, d3;
      let res
      type = parseInt(type)

      let { d1, d2, d3 } = this.formattingRecord(obj, type, istable)

      switch (type) {
        case 2: // 订单数(占比)/等级
          let showStr
          if (`${d3}` === '-') {
            showStr = `${d1}(${d2})`
          } else {
            showStr = `${d1}(${d2})/实际等级：${d3}`
          }
          istable ? (res = showStr) : (res = [d1])
          return res
        case 1:
        case 3:
        case 4:
        case 5:
        case 6: // 销售额(占比)// 商品数量(占比),退款额(占比),退单数(占比),退单商品数量(占比)
          istable ? (res = `${d1}(${d2})`) : (res = [d1])
          return res
        case 7:
        case 8:
        case 9: // 退单率,// 客单价,// 件单量
          istable ? (res = `${d1}`) : (res = [d1])
          return res
        case 10:
        case 11:
        case 12: // 销售额同比环比 // 订单数同比环比,//商品数量的同比环比
          istable ? (res = `同比：${d1}；环比：${d2}`) : (res = [[d1, d2]])
          return res
      }
    },
    // TODO：设置退单率为百分比
    // 根据统计类型，设置d1，d2,d3的值
    formattingRecord(obj, type, istable) {
      let d1, d2, d3
      if (isNull(obj.recordData1)) {
        if (this.STA_KEY_ARR.includes(type)) {
          d1 = '-'
        } else {
          istable ? (d1 = '-') : (d1 = 0)
        }
      } else {
        if (this.STA_KEY_ARR.includes(type)) {
          d1 = (obj.recordData1 * 100).toFixed(2) + '%'
        } else if (type === 7) {
          d1 = (obj.recordData1 * 100).toFixed(2) + '%'
        } else {
          d1 = obj.recordData1
        }
      }

      if (isNull(obj.recordData2)) {
        if (this.STA_KEY_ARR.includes(type)) {
          d2 = '-'
        } else {
          istable ? (d2 = '-') : (d2 = 0)
        }
      } else {
        d2 = (obj.recordData2 * 100).toFixed(2) + '%'
      }

      if (isNull(obj.recordData3)) {
        istable ? (d3 = '-') : (d3 = 0)
      } else {
        d3 = obj.recordData3
      }

      return {
        d1,
        d2,
        d3,
      }
    },

    // 修改spu时间范围
    changeSpuTimeScope(val) {
      this.timeScope = [...val]
    },
    // 时间选择失焦时将startPickerTime置空 目的是清除禁用的时间范围
    blurTime() {
      this.startPickerTime = ''
    },
    // spu/sku搜索按钮
    updateDeptReports() {
      if (this.view === 'spu') {
        if (this.spuLoading) {
          return this.$message('正在加载数据，请稍后...')
        }
        this.initSearchPage()
        this.getSpuDataList()
        this.shopOrSku === 1 ? this.getLinkDataList() : this.getSkuDataList()
      } else {
        if (this.skuLoading) {
          return this.$message('正在加载数据，请稍后...')
        }
        this.initSearchPage()
        this.getSkuDataList()
        this.getLinkDataList()
      }
      // this.isChangeType = true
    },
    // 初始化页码
    initSearchPage() {
      this.linkParamsPage.page = 1
      this.linkParamsPage.pageSize = 10

      this.skuParamsPage.page = 1
      this.skuParamsPage.pageSize = 10
    },
    // 链接搜索
    updateDeptReportsLink() {
      if (this.linkLoading) {
        return this.$message('正在加载数据，请稍后...')
      }
      this.linkParamsPage.page = 1
      this.linkParamsPage.pageSize = 10
      this.getLinkDataList()
    },
    // 设置默认spu时间
    setDefaultSpuTime() {
      this.spuParams.startTime = this.row.timeArr[0]
      this.spuParams.endTime = this.row.timeArr[1]

      this.skuParams.startTime = this.row.timeArr[0]
      this.skuParams.endTime = this.row.timeArr[1]

      this.timeScope[0] = this.row.timeArr[0]
      this.timeScope[1] = this.row.timeArr[1]
    },
    // 下拉框数据
    async selectSpuData() {
      // 平台
      let res1 = await listPlatform()
      this.platformList = res1.data

      let res3 = await superListPush()
      this.shopName = res3.data

      let res4 = await greedPush()
      this.spuGradeArr = res4.data
    },

    // 获取统计类型
    getStatisticsType() {
      // 统计类型
      let res2 = this.$store.state.statistics.GRADETYPE_LIST
      this.gradeType = res2
      this.statisticsType = this.gradeType[0].code
    },

    // 展示日报
    showDailyDetail(row) {
      this.dailyDialogRow = {
        linkTitle: row.linkName,
        linkId: row.linkUuid,
        linkLevel: row.gradeTypeName,
        managerName: row.manage,
        url: row.url,  //这里链接图片没返回，后面要后台返回该字段
        srcList: [row.url],
      }
      this.dailyReqParams = {
        startTime: this.timeScope[0],
        endTime: this.timeScope[1],
        linkId: row.linkUuid,
      }

      this.showViewDailyDialog = true
    },
  },
  components: { lineChart,ViewDailyDialog },
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
      padding-bottom: 0px;
    }
  }
}

.sku-container {
  margin-top: 20px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.data-range-style {
  display: flex;
  // border: 1px solid red;
  flex-direction: column;
  margin-top: -32px;
}

.date-ange-style2 {
  margin: 20px 0 10px 0;
}

.outHeight {
  ::v-deep .el-table__body-wrapper {
    overflow-y: auto;
    height: 100%;
  }

  .data-range-style {
    margin: 10px 0;
  }

  .item-red {
    color: red;
  }

  .item-green {
    color: green;
  }

  // @media screen and (min-width: 768px) {

  //   /* 平板设备及以上 */
  //   ::v-deep .el-table__body-wrapper {
  //     height: 200px;
  //   }
  // }

  // @media screen and (min-width: 1024px) {

  //   /* 桌面设备 */
  //   ::v-deep .el-table__body-wrapper {
  //     height: 250px;
  //   }
  // }

  // @media screen and (min-width: 1200px) {

  //   /* 大屏幕设备 */
  //   ::v-deep .el-table__body-wrapper {
  //     height: 300px;
  //   }
  // }
}
.dialog-style{
  width: 92%;
  height: 96vh;
  margin: 0 auto;
  margin-top: 10px;
}
</style>
