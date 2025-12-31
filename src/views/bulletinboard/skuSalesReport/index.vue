<template>
  <div class="app-container">
    <el-form :inline="true" :model="reqParams">
      <el-form-item label="时间范围" style="margin-right: 20px">
        <el-date-picker
          v-model="dateRange"
          :clearable="false"
          type="daterange"
          align="right"
          unlink-panels
          value-format="timestamp"
          :picker-options="pickerOptions"
          @change="changeTime"
          @blur="blurTime"
          style="padding-right: 10px;width:250px"
        />
      </el-form-item>
      <el-form-item label="货品分类" style="margin-right: 20px">
        <el-select v-model="reqParams.categoryUuid" filterable clearable placeholder="请选择货品分类">
          <el-option
            v-for="(item, index) in categorySelectList"
            :key="index"
            :label="item.cateName"
            :value="item.uuid"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="产品名称" style="margin-right: 20px">
        <el-select v-model="reqParams.spuUuid" filterable clearable placeholder="请选择产品名称">
          <el-option
            v-for="item in skuSelectList"
            :key="item.code"
            :label="item.name"
            :value="item.code"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="sku">
        <SkuSelect
          v-model="reqParams.skuUuid"
          :spu-uuid="reqParams.spuUuid"
          placeholder="请选择SKU"
          @visible-change="skuVisibleChange"
          @change="skuChange"
        ></SkuSelect>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="clickSearch">搜索</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableList" v-loading="tableLoading" max-height="600">
      <el-table-column type="index" label="序号" width="50" align="center"></el-table-column>
      <el-table-column prop="createTime" label="图片" align="center" width="100px">
        <template v-slot="{ row, $index }">
          <el-image
            v-if="row.skuUrlAddress"
            style="height: 30px;width: 30px;"
            :src="row.skuUrlAddress + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
            :preview-src-list="[row.skuUrlAddress]"
          ></el-image>
        </template>
      </el-table-column>
      <el-table-column prop="specsName" label="规格名称" align="center" width="100px"></el-table-column>
      <el-table-column prop="skuCode" label="商家编码" align="center" width="100px"></el-table-column>
      <el-table-column prop="categoryName" label="货品分类" align="center" width="100px"></el-table-column>
      <el-table-column prop="spuShowName" label="货品名称" align="center" min-width="100px"></el-table-column>
      <el-table-column prop="purchaseManageName" label="采购负责人" align="center" width="100px"></el-table-column>
      <el-table-column prop="supplierStockNum" label="工厂库存" align="center" width="100px"></el-table-column>
      <el-table-column prop="predictRemainDay" label="预测剩余销售天数" align="center" width="150px">
        <template v-slot="{row}">
          <div
            v-if="row.predictRemainDay || row.predictRemainDay === 0"
          >{{ row.predictRemainDay.toFixed(1) }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="orderNumberRate" label="销量占比" align="center" width="100px">
        <template v-slot="{row}">
          <div
            v-if="row.orderNumberRate || row.orderNumberRate === 0"
          >{{ row.orderNumberRate.toFixed(2) }}%</div>
          <div v-else>-</div>
        </template>
      </el-table-column>
      <el-table-column prop="totalNumber" label="销售量合计" align="center" width="100px"></el-table-column>
      <el-table-column
        v-for="headerItem in headerList"
        :key="headerItem.time"
        :label="getFormatDate(headerItem.time)"
        align="center"
      >
        <el-table-column label="销售量" align="center" width="100px">
          <template #header>
            <el-tooltip
              class="item"
              effect="dark"
              content="较比前一天涨幅橙色表示下降，绿色表示上升"
              placement="top-start"
            >
              <span>
                销售量
                <i class="el-icon-question"></i>
              </span>
            </el-tooltip>
          </template>
          <template v-slot="{row}">
            <div
              v-if="row.salesTime[headerItem.state]"
              :class="colorMap[row.salesTime[headerItem.state].color]"
            >{{ handleNull(row.salesTime[headerItem.state].orderNumber) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="退款量" align="center" width="100px">
          <template v-slot="{row}">
            <div
              v-if="row.salesTime[headerItem.state]"
              :class="colorMap[row.salesTime[headerItem.state].color]"
            >{{ handleNull(row.salesTime[headerItem.state].refundNumber) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="实际销售量" align="center" width="100px">
          <template v-slot="{row}">
            <div
              v-if="row.salesTime[headerItem.state]"
              :class="colorMap[row.salesTime[headerItem.state].color]"
            >{{ handleNull(row.salesTime[headerItem.state].actualNumber) }}</div>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="操作" align="center" width="250px">
        <template v-slot="{ row }">
          <el-button size="mini" type="text" @click="goSpuSalesReport(row)">SPU销售表</el-button>
          <el-button size="mini" type="text" @click="goSkuBoard(row)">看板</el-button>
          <el-button size="mini" type="text" @click="itemDetailSku(row)">明细</el-button>
          <el-button size="mini" type="text" @click="goSpuInventory(row)">库存</el-button>
          <el-button size="mini" type="text" @click="openSkuTrendChart(row)">趋势图</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="reqParams.page"
      :limit.sync="reqParams.pageSize"
      @pagination="getTableList()"
    />

    <!-- SKU看板 -->
    <el-dialog
      :title="productTitle"
      @close="productShowSku = false"
      :visible.sync="productShowSku"
      show-close
      fullscreen
    >
      <ProductSku
        v-if="productShowSku"
        :currentRow="skuBoardParms"
        :selectSpuChange="selectSpuChange"
        :selectSkuChange="selectSkuChange"
      ></ProductSku>
    </el-dialog>

    <!-- spu明细 -->
    <StatisticsSpu
      v-if="spuDetailStatus"
      @closeDialog="spuDetailStatus = false"
      :show="spuDetailStatus"
      :view="spuOrsku"
      :row="rowData"
      :title="detailTitle"
    ></StatisticsSpu>

    <!-- SKU趋势图 -->
    <OperationTrendDialog
      v-if="showSkuTrendChart"
      :show-dialog.sync="showSkuTrendChart"
      :sku-uuid="trendSkuUuid"
      :link-id="trendLinkId"
    />
  </div>
</template>

<script>
import { listSpuName, categoryList, skuPageList } from '@/api/baseData/common'
import { addDay, addDayEnd, getFormatDate } from '@/utils/common'
import {
  getSkuSalesList,
  getTableHeader,
} from '@/api/bulletinboard/skuSalesReport'
import SkuSelect from '@/components/SkuSelect/index.vue'
import ProductSku from '../components/ProductSku.vue'
import StatisticsSpu from '@/views/bulletinboard/statistics/components/StatisticsSpu.vue'
import OperationTrendDialog from '@/components/TrendChart/OperationTrendDialog.vue'
export default {
  name: 'SkuSalesReport',
  components: {
    SkuSelect,
    ProductSku,
    StatisticsSpu,
    OperationTrendDialog,
  },
  data() {
    return {
      /* -------------------- SKU看板相关 ------------------------ */
      productTitle: '', // 标题
      productShowSku: false, // 控制显隐
      selectSpuChange: false,
      selectSpuChange: false,
      skuBoardParms: {}, // 绑定的参数

      /* -------------------- SPU明细相关 ------------------------ */
      spuDetailStatus: false, // 控制明细弹窗
      rowData: null,
      spuOrsku: 'sku',
      detailTitle: '',

      /* -------------------- 列表相关 ------------------------ */
      reqParams: {
        categoryUuid: '', // 	货品分类
        page: 1,
        pageSize: 20,
        spuUuid: '',
        startTime: '',
        endTime: '',
        skuUuid: '',
      },
      tableLoading: false,
      tableList: [],
      total: 0,
      headerList: [], // 时间表头
      colorMap: {
        0: '',
        1: 'ORANGE',
        2: 'GREEN',
      },

      /* ------------------- 筛选条件相关 ------------------------ */
      dateRange: [], // 时间范围
      startPickerTime: '', // 选中的开始时间
      pickerOptions: {
        // 当点击时 将时间拿来做禁用时间范围计算
        onPick: (timeObj) => {
          this.startPickerTime = new Date(timeObj.minDate).getTime()
        },
        disabledDate: (time) => {
          if (!this.startPickerTime) return time.getTime() > Date.now()
          const now = this.startPickerTime
          // 6 * 24 * 3600 * 1000 是到第7天的毫秒数 不能超过7天范围
          const minTime = now - 6 * 24 * 3600 * 1000
          const maxTime = now + 6 * 24 * 3600 * 1000

          // 限制选择的时间范围是7天 并且不能选择今天以后的日期
          return (
            time.getTime() < minTime ||
            time.getTime() > maxTime ||
            time.getTime() > Date.now()
          )
        },
      },

      /* ------------------- 下拉框相关 ------------------------ */
      skuSelectList: [], // 产品名称
      categorySelectList: [], // 货品分类

      skuReqParams: {
        keyword: '',
        page: 1,
        pageSize: 20,
        spuUuid: '',
      },

      /* ------------------- SKU趋势图相关 ------------------------ */
      showSkuTrendChart: false,
      trendSkuUuid: '',
      trendLinkId: '',
    }
  },
  created() {
    // 设置默认的时间范围
    this.reqParams.startTime = addDay(-1)
    this.reqParams.endTime = addDayEnd(-1)

    const query = this.$route.query
    if (query) {
      this.reqParams.spuUuid = query.spuUuid
      this.reqParams.categoryUuid = query.categoryUuid
      this.reqParams.startTime = query.startTime || addDay(-1)
      this.reqParams.endTime = query.endTime || addDayEnd(-1)
    }

    this.dateRange = [this.reqParams.startTime, this.reqParams.endTime]
    this.clickSearch()
    this.getSelectList()
  },

  methods: {
    // 查看sku销售表
    goSpuSalesReport(row) {
      this.$router.push({
        name: 'SpuSalesReport',
        query: {
          spuUuid: row.spuUuid,
          categoryUuid: this.reqParams.categoryUuid,
          startTime: this.reqParams.startTime,
          endTime: this.reqParams.endTime,
        },
      })
    },
    // 查看sku看板
    goSkuBoard(row) {
      this.productTitle = `${row.skuCode}(${row.specsName})看板`
      this.selectSpuChange = false
      this.selectSkuChange = false
      // console.log("row: ", row);
      // this.searchParms
      Object.assign(this.skuBoardParms, {
        from: 'sku', //入口来源
        timeScopeArr: this.dateRange, //时间范围数组
        timeScopeType: 2, //时间范围类型
        spu: {
          spuUuid: [row.spuUuid], //spu uuid
          spuNameArr: [row.spuShowName], //spu名称数组
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
    // 查看sku明细
    itemDetailSku(row) {
      const rowDataAss = Object.assign(row, {
        timeArr: this.dateRange,
      })
      rowDataAss.spuUuid = this.currentSpu

      this.rowData = rowDataAss
      this.spuOrsku = 'sku'
      this.detailTitle = 'sku明细'
      this.spuDetailStatus = true
    },
    // 查看sku库存
    goSpuInventory(row) {
      this.$router.push({
        name: 'SkuInventory',
        query: {
          spuUuid: row.spuUuid,
          skuUuid: row.skuUuid,
        },
      })
    },
    // 时间格式转化
    getFormatDate(timeStamp) {
      return getFormatDate(timeStamp)
    },
    // 处理数据 null的情况用-
    handleNull(val) {
      return val || val === 0 ? val : '-'
    },
    // 点击搜索
    clickSearch() {
      this.reqParams.page = 1
      this.getTableList()
    },

    // sku状态变化
    skuVisibleChange(value) {
      // console.log('下拉框显示状态:', value)
    },

    // sku值变化
    skuChange(value) {
      // console.log('选择的值:', value)
    },

    // 获取列表数据
    async getTableList() {
      this.tableLoading = true
      await this.getTableHeader()
      const [err, res] = await this.$to(getSkuSalesList(this.reqParams))
      this.tableList = res.data.records || []
      this.total = res.data.total
      this.tableLoading = false
    },

    // 获取时间表头
    async getTableHeader() {
      const [err, res] = await this.$to(
        getTableHeader({
          startTime: this.reqParams.startTime,
          endTime: this.reqParams.endTime,
        })
      )
      this.headerList = res.data || []
    },

    // 获取所有下拉框数据
    async getSelectList() {
      // 产品名称
      const spuRes = await listSpuName()
      this.skuSelectList = spuRes.data
      // 货品分类
      const categoryRes = await categoryList()
      this.categorySelectList = categoryRes.data
    },

    // 获取sku下拉框
    async getSkuSelectList() {
      const [err, res] = await this.$to(skuPageList(this.skuReqParams))
      this.skuSelectList = res.data.records || []
    },

    // 选择时间
    changeTime(val) {
      if (val) {
        this.reqParams.startTime = val[0]
        this.reqParams.endTime = val[1]
      }
    },
    // 时间选择失焦时将startPickerTime置空 目的是清除禁用的时间范围
    blurTime() {
      this.startPickerTime = ''
    },
    // 打开SKU趋势图
    openSkuTrendChart(row) {
      this.trendSkuUuid = row.skuUuid
      this.trendLinkId = row.linkId
      this.showSkuTrendChart = true
    },
  },
}
</script>
<style scoped lang="scss">
.GREEN {
  margin: auto;
  line-height: 4vh;
  width: 4vw;
  height: 4vh;
  color: #fff;
  background-color: green;
}
.RED {
  margin: auto;
  line-height: 4vh;
  width: 4vw;
  height: 4vh;
  color: #fff;
  background-color: rgb(148, 64, 64);
}
.PINK {
  margin: auto;
  line-height: 4vh;
  width: 4vw;
  height: 4vh;
  color: #fff;
  background-color: pink;
}
.ORANGE {
  margin: auto;
  line-height: 4vh;
  width: 4vw;
  height: 4vh;
  color: #fff;
  background-color: orange;
}
</style>