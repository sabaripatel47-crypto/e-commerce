<template>
  <div>
    <div>
      <el-radio-group v-model="spuDefault" @change="changeSort">
        <el-radio-button :label="2">
          百分比倒序
          <el-tooltip
            class="item"
            effect="dark"
            content="百分比倒序=选择一定时间范围内的售后问题数除以订单数；注意事项：如果这个品在这个时间范围内没有订单数据会过滤掉不展示"
            placement="top"
          >
            <svg class="icon" preserveAspectRatio="xMidYMid meet">
              <use xlink:href="#icon-question" :fill="spuDefault == 2 ? 'white' : ''" />
            </svg>
          </el-tooltip>
        </el-radio-button>
        <el-radio-button :label="1">
          数量倒序
          <el-tooltip
            class="item"
            effect="dark"
            content="数量倒序=按品统计售后问题数。注意事项：如果这个品在选择的时间范围内没有订单数据，则并不会展示销售数据；"
            placement="top"
          >
            <svg class="icon" preserveAspectRatio="xMidYMid meet">
              <use xlink:href="#icon-question" :fill="spuDefault == 1 ? 'white' : ''" />
            </svg>
          </el-tooltip>
        </el-radio-button>
      </el-radio-group>
    </div>
    <!-- <el-progress :percentage="progress" v-if="progress != 100"></el-progress> -->

    <el-table
      :data="tableData"
      border
      style="width: 100%"
      max-height="480"
      @row-click="handleClick"
      :row-style="rowStyle"
      v-loading="loading"
      :element-loading-text="'加载中...' + progress + '%'"
    >
      <!-- <el-table-column prop="date" label="序号" min-width="30" type="index" align="center"></el-table-column> -->
      <el-table-column prop="spuName" label="产品名称" align="center"></el-table-column>
      <el-table-column prop="feiSuoStoreSaleQuantity" label="销售订单" align="center">
        <template v-slot="{ row }">
          {{
          row.feiSuoStoreSaleQuantity == null
          ? "-"
          : row.feiSuoStoreSaleQuantity
          }}
        </template>
      </el-table-column>
      <el-table-column prop="feiSuoStoreSaleNum" label="销售数量" align="center">
        <template v-slot="{ row }">
          {{
          row.feiSuoStoreSaleNum == null ? "-" : row.feiSuoStoreSaleNum
          }}
        </template>
      </el-table-column>
      <el-table-column prop="feiSuoStoreSaleAmount" label="销售金额" align="center">
        <template v-slot="{ row }">
          {{
          row.feiSuoStoreSaleAmount == null ? "-" : row.feiSuoStoreSaleAmount
          }}
        </template>
      </el-table-column>
      <!-- <el-table-column prop="departmentLevelName" label="问题类型"></el-table-column> -->
      <el-table-column prop="afterSaleByQuantity" label="问题订单数量" align="center">
        <template v-slot="{ row }">
          {{
          row.afterSaleByQuantity == null ? "-" : row.afterSaleByQuantity
          }}
        </template>
      </el-table-column>
      <el-table-column prop="percentage" label="销售咨询问题占比" align="center">
        <template v-slot:header>
          <span>销售咨询问题占比</span>
          <el-tooltip class="item" effect="dark" content="百分比=订单对比订单" placement="top">
            <svg class="icon" preserveAspectRatio="xMidYMid meet">
              <use xlink:href="#icon-question" />
            </svg>
          </el-tooltip>
        </template>
        <template v-slot="{ row }">
          {{
          row.percentage == null ? "-" : getPercentage(row.percentage)
          }}
        </template>
      </el-table-column>
      <!-- <el-table-column prop="" label="职能部门"></el-table-column> -->
      <el-table-column prop label="操作" width="300" align="center">
        <template v-slot="{ row }">
          <el-button type="text" @click="changeTab(row)">职能部门</el-button>
          <el-button type="text" @click="openDetail(row)">订单明细</el-button>
          <el-button type="text" @click="getSPULineChart(row)">趋势图</el-button>
          <el-button type="text" @click="lookBoardSpu(row)">看板</el-button>
          <el-button type="text" @click="itemDetailSpu(row)">明细</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div>
      <!-- 分页 -->
      <Pagination
        v-if="total > 0"
        :auto-scroll="false"
        @current-change="handleCurrentChange"
        :page.sync="reqParams.page"
        :limit.sync="reqParams.pageSize"
        :total="total"
        @pagination="getSpuList"
      />
    </div>

    <div>
      <el-form class="page-search" inline style="margin-top: 10px">
        <!-- <el-form-item style="margin-right: 20px"><el-button size="medium" @click="changeChildSort(1)">百分比倒序</el-button></el-form-item> -->
        <el-form-item style="margin-right: 20px">
          <el-button
            v-if="childReqParams.spuUuid"
            :type="skuDefault == 1 ? 'primary' : ''"
            size="medium"
            @click="changeChildSort(1)"
          >数量倒序</el-button>
        </el-form-item>
        <el-form-item label="SKU：" v-if="childReqParams.spuUuid" style="margin-right: 20px">
          <el-select v-model="skuUuid" filterable clearable placeholder="请选择">
            <el-option
              v-for="item in skuList"
              :key="item.code"
              :label="`(${item.name})${item.extendKeyword}`"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="childReqParams.spuUuid" style="margin-right: 20px">
          <el-button type="primary" size="medium" @click="getSKUList(1)">查询</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table
      :data="childTableData"
      ref="skuTable"
      v-loading="childLoading"
      border
      max-height="480"
      style="width: 100%"
    >
      <el-table-column prop="date" label="序号" min-width="30" type="index" align="center"></el-table-column>
      <el-table-column prop="skuCode" label="SKU编码" align="center">
        <template v-slot="{ row }">
          <span>({{ row.skuCode }}){{ row.specsName }}</span>
        </template>
      </el-table-column>
      <el-table-column prop label="SKU图片" align="center">
        <template v-slot="{ row }">
          <el-image
            v-if="row.skuUrlAddress"
            style="height: 30px; width: 30px"
            :src="
              row.skuUrlAddress +
              '?x-oss-process=image/resize,w_30,h_30,limit_0'
            "
            :preview-src-list="[row.skuUrlAddress]"
          ></el-image>
        </template>
      </el-table-column>
      <el-table-column prop="feiSuoStoreSaleQuantity" label="销售订单" align="center">
        <template v-slot="{ row }">
          <span>
            {{
            row.feiSuoStoreSaleQuantity == null
            ? "-"
            : row.feiSuoStoreSaleQuantity
            }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="feiSuoStoreSaleNum" label="销售数量" align="center">
        <template v-slot="{ row }">
          <span>
            {{
            row.feiSuoStoreSaleNum == null ? "-" : row.feiSuoStoreSaleNum
            }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="feiSuoStoreSaleAmount" label="销售金额" align="center">
        <template v-slot="{ row }">
          <span>
            {{
            row.feiSuoStoreSaleAmount == null ? "-" : row.feiSuoStoreSaleAmount
            }}
          </span>
        </template>
      </el-table-column>
      <!-- <el-table-column prop="departmentLevelName" label="问题类型" align="center"></el-table-column> -->
      <el-table-column prop="afterSaleByQuantity" label="问题订单数量" align="center">
        <template v-slot="{ row }">
          <span>
            {{
            row.afterSaleByQuantity == null ? "-" : row.afterSaleByQuantity
            }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="percentage" label="SKU的维度的问题数量/SPU的维度的数量" width="160" align="center">
        <template v-slot="{ row }">
          <span>
            {{
            row.percentage == null ? "-" : getPercentage(row.percentage)
            }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop label="操作" width="290" align="center">
        <template v-slot="{ row }">
          <el-button type="text" @click="changeTab(row)">职能部门</el-button>
          <el-button type="text" @click="openDetail(row)">订单明细</el-button>
          <el-button type="text" @click="getSKULineChart(row)">趋势图</el-button>
          <el-button type="text" @click="lookBoardSku(row)">看板</el-button>
          <el-button type="text" @click="itemDetailSku(row)">明细</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div>
      <!-- 分页 -->
      <Pagination
        :auto-scroll="false"
        @pagination="getSKUList"
        v-if="childTotal > 0"
        :page.sync="childReqParams.page"
        :limit.sync="childReqParams.pageSize"
        :total="childTotal"
      />
    </div>
    <el-dialog title append-to-body :visible.sync="dialogVisible" @close="closeDialog">
      <LineChart
        v-if="dialogVisible"
        :TableData="quantityData"
        :chartName="lineChartTitle + '问题数量'"
        :xData="lineChartX"
      ></LineChart>
      <LineChartPercent
        v-if="dialogVisible"
        :TableData="percentageData"
        :chartName="lineChartTitle + '问题百分比'"
        :xData="lineChartX"
      ></LineChartPercent>
    </el-dialog>
    <DetailTable
      ref="detailTable"
      :dateRange="date"
      :departmentLevelUuid="departmentLevelUuid"
      :problemTypes="problemTypes"
      :departmentUuid="departmentUuid"
      :skuUuid="detailSku"
      :spuUuid="detailSpu"
    ></DetailTable>

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
    <StatisticsSpu
      v-if="spuDetailStatus"
      @closeDialog="detailStatus"
      :show="spuDetailStatus"
      :view="spuOrsku"
      :row="rowData"
      :title="detailTitle"
    ></StatisticsSpu>
  </div>
</template>

<script>
import {
  getAfterSaleDetailSPUTable,
  getAfterSaleDetailSKUTable,
  getAfterSaleDetailSPUChart,
  getAfterSaleDetailSKUChart,
  getAfterSaleDetailSPUType2,
} from '@/api/deliveryCenter/afterSale'
import { getFormatDate } from '@/utils/common'
import LineChart from './LineChart.vue'
import LineChartPercent from './LineChartPercent.vue'
import DetailTable from './DetailTable.vue'
import ProductSpu from '@/views/bulletinboard/components/ProductSpu.vue'
import { skuCodeToProductCode } from '@/api/purchasingManagement/purchaseRecord'
import StatisticsSpu from '@/views/bulletinboard/statistics/components/StatisticsSpu.vue'

import ProductSku from '@/views/bulletinboard/components/ProductSku.vue'
export default {
  name: 'SPUView',
  data() {
    return {
      // 请求参数
      reqParams: {
        afterSaleBySortType: 1,
        departmentLevelUuid: '',
        departmentUuid: '',
        spuUuid: '',
        endTime: '',
        page: 1,
        pageSize: 10,
        startTime: '',
      },
      // 主表参数
      tableData: [],
      // 主表加载
      loading: false,
      // 选中的spu
      currentSpu: '',
      total: 0,
      // 子表参数
      childReqParams: {
        afterSaleBySortType: 1,
        departmentLevelUuid: '',
        departmentUuid: '',
        endTime: '',
        page: 1,
        pageSize: 10,
        spuUuid: '',
        startTime: '',
      },
      // 子表数据
      childTableData: [],
      childTotal: 0,
      childLoading: false,
      // sku/spu趋势图参数
      chartParams: {
        endTime: '',
        startTime: '',
        spuUuid: '',
        skuUuid: '',
      },
      // 折线图弹窗
      dialogVisible: false,
      // 数量折线图数据
      quantityData: [],
      // 百分比折线图数据
      percentageData: [],
      // 折线图标题
      lineChartTitle: '',
      // 折线图x轴
      lineChartX: [],
      // 传给明细组件的值
      detailSku: '',
      detailSpu: '',
      skuUuid: '',
      // sku下拉框
      skuList: [],
      // sku默认按钮
      skuDefault: 1,
      // spu默认按钮
      spuDefault: 1,
      // spu sku看板
      productTitle: '',
      productShowSku: false,
      productShowSpu: false,
      searchParms: {},
      selectSpuChange: false,
      selectSkuChange: false,
      // spu明细状态
      spuDetailStatus: '',
      // 是spu明细还是sku明细
      spuOrsku: 'spu',
      // 当前选择的dialog数据
      rowData: {},
      // 明细dialog标题
      detailTitle: '',
      progress: 0, // 全局进度条的进度
      progressInterval: null, // 用于清除定时器
    }
  },
  components: {
    LineChart,
    DetailTable,
    ProductSpu,
    ProductSku,
    LineChartPercent,
    StatisticsSpu,
  },
  props: {
    date: {
      type: Array,
      default: () => [],
    },
    departmentUuid: {
      type: String,
      default: () => '',
    },
    departmentLevelUuid: {
      type: String,
      default: () => '',
    },
    spu: {
      type: String,
      default: () => '',
    },
    problemTypes: {
      type: String,
      default: () => '',
    },
  },
  created() {
    this.getSpuList(1)
  },
  watch: {},
  methods: {
    // sku下拉框
    async getSku(spu) {
      this.skuList = []
      this.skuUuid = ''
      if (spu != '') {
        const res = await skuCodeToProductCode(spu)
        this.skuList = res.data
      }
    },
    // SPU数据
    async getSpuList(page) {
      this.loading = true
      this.childTableData = []
      this.skuList = []
      this.childReqParams = this.$options.data().childReqParams
      this.childTotal = 0
      if (page == 1) {
        this.reqParams.page = 1
      }
      // 初始化进度条为0，准备加载数据
      this.progress = 0

      // 设置模拟进度条更新，每500ms增加进度
      this.progressInterval = setInterval(() => {
        if (this.progress < 90) {
          this.progress += 1 // 每次增加10%
        }
      }, 200) // 每500ms更新一次进度条
      this.reqParams.startTime = this.date[0]
      this.reqParams.endTime = this.date[1]
      this.reqParams.departmentUuid = this.departmentUuid
      this.reqParams.departmentLevelUuid = this.departmentLevelUuid
      this.reqParams.problemTypes = this.problemTypes
      this.reqParams.spuUuid = this.spu
      const res = await getAfterSaleDetailSPUTable(this.reqParams)
      this.tableData = res.data.records
      // console.log(this.tableData)
      // console.log(res.data.records)
      this.total = res.data.total
      // 更新进度条为100%，并设置状态为成功
      this.progress = 100
      clearInterval(this.progressInterval) // 停止定时器
      this.loading = false
    },
    // 改变spu排序
    async changeSort(val) {
      this.spuDefault = val
      this.reqParams.afterSaleBySortType = val
      this.getSpuList(1)
    },
    // 点击获取sku数据
    async handleClick(row) {
      this.childReqParams.startTime = this.date[0]
      this.childReqParams.endTime = this.date[1]
      this.childReqParams.spuUuid = row.spuUuid
      this.currentSpu = row.spuUuid
      this.getSku(row.spuUuid)
      await this.getSKUList(1)
    },
    async getSKUList(page) {
      this.childLoading = true
      if (page == 1) {
        this.childReqParams.page = 1
      }
      this.childReqParams.departmentLevelUuid = this.departmentLevelUuid
      this.childReqParams.problemTypes = this.problemTypes
      this.childReqParams.departmentUuid = this.departmentUuid
      this.childReqParams.skuUuid = this.skuUuid
      const res = await getAfterSaleDetailSKUTable(this.childReqParams)
      this.childTableData = res.data.records
      this.childTotal = res.data.total
      this.childLoading = false
    },
    // 改变sku排序
    async changeChildSort(val) {
      this.skuDefault = val
      this.childReqParams.afterSaleBySortType = val
      this.getSKUList(1)
    },
    // sku分页
    async handleChange() {
      const res = await getAfterSaleDetailSKUTable(this.childReqParams)
      this.childTableData = res.data.records
      this.childTotal = res.data.total
    },
    // 获取sku折线图
    async getSKULineChart(row) {
      this.chartParams.startTime = this.date[0]
      this.chartParams.endTime = this.date[1]
      this.chartParams.problemTypes = this.problemTypes
      this.chartParams.spuUuid = row.spuUuid ? row.spuUuid : ''
      this.chartParams.skuUuid = row.skuUuid ? row.skuUuid : ''
      this.chartParams.departmentUuid = this.departmentUuid
      this.chartParams.departmentLevelUuid = this.departmentLevelUuid
      const res = await getAfterSaleDetailSKUChart(this.chartParams)
      this.lineChartTitle = res.data.questionType
      this.quantityData = res.data.afterSaleQuantityLineChartVOList.map(
        (item) => item.afterSaleByQuantity
      )
      this.percentageData = res.data.afterSaleQuantityLineChartVOList.map(
        (item) => this.getPercent(item.percentage)
      )
      this.lineChartX = res.data.afterSaleQuantityLineChartVOList.map((item) =>
        getFormatDate(item.saleTime)
      )
      this.dialogVisible = true
    },
    // 获取spu折线图
    async getSPULineChart(row) {
      this.chartParams.startTime = this.date[0]
      this.chartParams.endTime = this.date[1]
      this.chartParams.spuUuid = row.spuUuid ? row.spuUuid : ''
      this.chartParams.skuUuid = row.skuUuid
      this.chartParams.departmentUuid = this.departmentUuid
      this.chartParams.departmentLevelUuid = this.departmentLevelUuid
      this.chartParams.problemTypes = this.problemTypes
      const res = await getAfterSaleDetailSPUChart(this.chartParams)
      this.lineChartTitle = res.data.questionType
      this.quantityData = res.data.afterSaleQuantityLineChartVOList.map(
        (item) => item.afterSaleByQuantity
      )
      this.percentageData = res.data.afterSaleQuantityLineChartVOList.map(
        (item) => this.getPercent(item.percentage)
      )
      this.lineChartX = res.data.afterSaleQuantityLineChartVOList.map((item) =>
        getFormatDate(item.saleTime)
      )
      this.dialogVisible = true
    },
    // 关闭折线图弹窗
    closeDialog() {
      this.dialogVisible = false
    },
    changeTab(row) {
      this.$emit(
        'changeTab',
        row.spuUuid,
        row.skuUuid == null ? '' : row.skuUuid
      )
    },
    getFormatDate(timeStamp) {
      return getFormatDate(timeStamp)
    },
    // 保留两位小数并转成百分比
    getPercentage(num) {
      let numBer = Math.floor((num * 10000).toFixed(1)) / 100
      numBer = numBer + '%'
      return numBer
    },

    openDetail(row) {
      this.detailSku = row.skuUuid
      this.detailSpu = row.spuUuid
      this.$nextTick(() => {
        this.$refs.detailTable.openDialog()
      })
    },
    // 关闭看板
    productStatusSpu() {
      this.productShowSpu = false
    },
    productStatusSku() {
      this.productShowSku = false
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
        timeScopeArr: this.date, //时间范围数组
        timeScopeType: 2, //时间范围类型
        spu: {
          spuUuid: [row.spuUuid], //spu uuid
          spuNameArr: [], //spu名称数组
        },
        sku: {
          skuUuid: [row.skuUuid], //sku uuid
          skuCode: [row.skuCode], //sku编码
          skuNameArr: [], //sku名称数组
          skuCodeArr: [], //sku编码数组
        },
      })
      this.productShowSku = true
    },
    // spu看板
    lookBoardSpu(row) {
      this.productTitle = `${row.spuName}看板`
      this.selectSpuChange = false
      // console.log("row: ", row);
      // this.searchParms
      Object.assign(this.searchParms, {
        from: 'spu', //入口来源
        timeScopeArr: this.date, //时间范围数组
        timeScopeType: 2, //时间范围类型
        spu: {
          spuUuid: [row.spuUuid], //spu uuid
          spuNameArr: [row.spuName], //spu名称数组
        },
      })
      this.productShowSpu = true
    },
    // 转化成百分比格式
    getPercent(num) {
      return (num * 100).toFixed(2)
    },
    handleCurrentChange(newPage) {
      window.scrollTo(
        0,
        document.documentElement.scrollTop || document.body.scrollTop
      )
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
    // 关闭明细
    detailStatus() {
      this.spuDetailStatus = false
    },
    // spu明细
    itemDetailSpu(row) {
      const rowDataAss = Object.assign(row, {
        timeArr: this.date,
      })
      this.rowData = rowDataAss
      this.spuOrsku = 'spu'
      this.detailTitle = 'spu明细'
      this.spuDetailStatus = true
    },
    // sku明细
    itemDetailSku(row) {
      const rowDataAss = Object.assign(row, {
        timeArr: this.date,
      })
      rowDataAss.spuUuid = this.currentSpu

      this.rowData = rowDataAss
      this.spuOrsku = 'sku'
      this.detailTitle = 'sku明细'
      this.spuDetailStatus = true
    },
  },
}
</script>

<style lang="scss" scoped>
.icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: #606266;
}
</style>
