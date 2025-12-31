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
      <el-form-item label="产品名称" style="margin-right: 20px">
        <el-select v-model="reqParams.spuUuid" filterable clearable placeholder="请选择产品名称">
          <el-option
            v-for="item in spuSelectList"
            :key="item.code"
            :label="item.name"
            :value="item.code"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="产品等级" style="margin-right: 20px">
        <el-select v-model="reqParams.spuLevel" filterable clearable placeholder="请选择货品等级">
          <el-option
            v-for="item in spuLevelSelectList"
            :label="item.name"
            :value="item.code"
            :key="item.code"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="品牌" style="margin-right: 20px">
        <el-select v-model="reqParams.brandUuid" filterable clearable placeholder="请选择品牌">
          <el-option
            v-for="item in brandSelectList"
            :label="item.name"
            :value="item.code"
            :key="item.code"
          ></el-option>
        </el-select>
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
      <el-form-item label="货品等级" style="margin-right: 20px">
        <el-select v-model="reqParams.categoryLevel" filterable clearable placeholder="请选择货品等级">
          <el-option
            v-for="item in spuLevelSelectList"
            :label="item.name"
            :value="item.code"
            :key="item.code"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="clickSearch">搜索</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableList" v-loading="tableLoading" max-height="600">
      <el-table-column type="index" label="序号" width="50" align="center"></el-table-column>
      <el-table-column prop="brandName" label="品牌" align="center" width="100px"></el-table-column>
      <el-table-column prop="categoryName" label="货品分类" align="center" width="100px"></el-table-column>
      <el-table-column prop="spuShowName" label="货品名称" align="center" min-width="100px"></el-table-column>
      <el-table-column prop="categoryLevelName" label="货品等级" align="center" width="100px"></el-table-column>
      <el-table-column prop="spuLevelName" label="产品等级" align="center" width="100px"></el-table-column>
      <el-table-column prop="helpSupportName" label="帮扶负责人" align="center" width="100px"></el-table-column>
      <el-table-column prop="purchaseManageName" label="采购负责人" align="center" width="100px"></el-table-column>
      <el-table-column prop="strategyManagerName" label="项目实施负责人" align="center" width="120px"></el-table-column>
      <el-table-column prop="createTime" label="货品图片" align="center" width="100px">
        <template v-slot="{ row, $index }">
          <el-image
            v-if="row.spuUrlAddress"
            style="height: 30px;width: 30px;"
            :src="row.spuUrlAddress + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
            :preview-src-list="[row.spuUrlAddress]"
          ></el-image>
        </template>
      </el-table-column>
      <el-table-column prop="orderNumberRate" label="销量占比" align="center" width="100px">
        <template v-slot="{row}">
          <div>{{ row.orderNumberRate.toFixed(2) }}%</div>
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
          <el-button size="mini" type="text" @click="goSkuSalesReport(row)">SKU销售表</el-button>
          <el-button size="mini" type="text" @click="goSpuBoard(row)">看板</el-button>
          <el-button size="mini" type="text" @click="itemDetailSpu(row)">明细</el-button>
          <el-button size="mini" type="text" @click="goSpuInventory(row)">库存</el-button>
          <el-button size="mini" type="text" @click="openSpuTrendChart(row)">趋势图</el-button>
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

    <!-- spu看板 -->
    <el-dialog
      :title="productTitle"
      @close="productShowSpu = false"
      :visible.sync="productShowSpu"
      show-close
      fullscreen
    >
      <ProductSpu
        v-if="productShowSpu"
        :currentRow="spuBoardParms"
        :selectSpuChange="selectSpuChange"
      ></ProductSpu>
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

    <!-- SPU趋势图 -->
    <SpuTrendChart
      :show-dialog.sync="showSpuTrendChart"
      :spu-uuid="spuTrendChartUuid"
      :spu-show-name="spuTrendChartName"
    />
  </div>
</template>

<script>
import {
  brandPush,
  listSpuLevel,
  listSpuName,
  categoryList,
} from '@/api/baseData/common'
import { addDay, addDayEnd, getFormatDate } from '@/utils/common'
import {
  getSpuSalesList,
  getTableHeader,
} from '@/api/bulletinboard/spuSalesReport'
import ProductSpu from '../components/ProductSpu.vue'
import StatisticsSpu from '@/views/bulletinboard/statistics/components/StatisticsSpu.vue'
import SpuTrendChart from '@/components/TrendChart/SpuTrendChart.vue'

export default {
  name: 'SpuSalesReport',
  components: {
    ProductSpu,
    StatisticsSpu,
    SpuTrendChart,
  },
  data() {
    return {
      /* -------------------- SPU看板相关 ------------------------ */
      productTitle: '', // 标题
      productShowSpu: false, // 控制显隐
      selectSpuChange: false,
      spuBoardParms: {}, // 绑定的参数

      /* -------------------- SPU明细相关 ------------------------ */
      spuDetailStatus: false, // 控制明细弹窗
      rowData: null,
      spuOrsku: 'spu',
      detailTitle: '',

      /* -------------------- 列表相关 ------------------------ */
      reqParams: {
        brandUuid: '', // 品牌
        categoryLevel: null, // 	货品等级
        categoryUuid: '', // 	货品分类
        page: 1,
        pageSize: 20,
        spuLevel: null, // spu等级
        spuUuid: '',
        startTime: '',
        endTime: '',
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
      spuSelectList: [], // 产品名称
      spuLevelSelectList: [], // 产品等级
      categorySelectList: [], // 货品分类
      brandSelectList: [], // 品牌

      /* ------------------- SPU趋势图相关 ------------------------ */
      showSpuTrendChart: false,
      spuTrendChartUuid: '',
      spuTrendChartName: '',
    }
  },
  created() {
    // 设置默认的时间范围
    this.reqParams.startTime = addDay(-1)
    this.reqParams.endTime = addDayEnd(-1)
    this.reqParams.startTime = 1759248000000
    this.reqParams.endTime = 1759680000000
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
    goSkuSalesReport(row) {
      // console.log('跳转sku销售表', row)
      this.$router.push({
        name: 'SkuSalesReport',
        query: {
          spuUuid: row.spuUuid,
          categoryUuid: this.reqParams.categoryUuid,
          startTime: this.reqParams.startTime,
          endTime: this.reqParams.endTime,
        },
      })
    },
    // 查看spu看板
    goSpuBoard(row) {
      this.productTitle = `${row.spuShowName}看板`
      this.selectSpuChange = false
      Object.assign(this.spuBoardParms, {
        from: 'spu', //入口来源
        timeScopeArr: this.dateRange, //时间范围数组
        timeScopeType: 2, //时间范围类型
        spu: {
          spuUuid: [row.spuUuid], //spu uuid
          spuNameArr: [row.spuShowName], //spu名称数组
        },
      })
      this.productShowSpu = true
    },
    // 查看spu明细
    itemDetailSpu(row) {
      const rowDataAss = Object.assign(row, {
        timeArr: this.dateRange,
      })
      this.rowData = rowDataAss
      this.spuOrsku = 'spu'
      this.detailTitle = 'spu明细'
      this.spuDetailStatus = true
    },
    // 查看sku库存
    goSpuInventory(row) {
      this.$router.push({
        name: 'SkuInventory',
        query: {
          spuUuid: row.spuUuid,
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
    // 获取列表数据
    async getTableList() {
      this.tableLoading = true
      await this.getTableHeader()
      const [err, res] = await this.$to(getSpuSalesList(this.reqParams))
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
      this.spuSelectList = spuRes.data
      // 产品等级
      const spuLevelRes = await listSpuLevel()
      this.spuLevelSelectList = spuLevelRes.data
      // 货品分类
      const categoryRes = await categoryList()
      this.categorySelectList = categoryRes.data
      // 品牌
      const brandRes = await brandPush()
      this.brandSelectList = brandRes.data
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
    // 打开SPU趋势图
    openSpuTrendChart(row) {
      this.spuTrendChartUuid = row.spuUuid
      this.spuTrendChartName = row.spuShowName
      this.showSpuTrendChart = true
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