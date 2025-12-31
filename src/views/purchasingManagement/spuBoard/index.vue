<template>
  <div class="app-container">
    <el-form class="page-search" inline ref="page-filter">
      <el-form-item label="货品分类:" style="margin-right: 20px">
        <el-cascader
          filterable
          v-model="categoryList"
          :options="classificationSelectList"
          :show-all-levels="false"
          :props="{
            children: 'children',
            label: 'cateName',
            value: 'uuid',
            checkStrictly: false,
            multiple: true,
          }"
          clearable
        ></el-cascader>
      </el-form-item>
      <el-form-item label="货品名称:" style="margin-right: 20px">
        <el-select v-model="reqParams.spuUuid" filterable clearable placeholder="请选择货品名称">
          <el-option
            v-for="(item, index) in spuSelectList"
            :key="item.uuid"
            :label="item.name"
            :value="item.uuid"
          ></el-option>
        </el-select>
      </el-form-item>
       <el-form-item label="产品类型:" style="margin-right: 20px">
          <el-select filterable v-model="reqParams.spuType" clearable placeholder="请选择">
            <el-option
              v-for="item in spuTypeList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="clickSearch()">搜索</el-button>
      </el-form-item>
    </el-form>
    <el-radio-group v-model="reqParams.wareHouseSortFlag" @change="clickSearch()">
      <el-radio-button :label="1">仓库库存升序</el-radio-button>
      <el-radio-button :label="0">仓库库存降序</el-radio-button>
    </el-radio-group>
    <el-table
      v-loading="tableLoading"
      max-height="700"
      border
      :data="tableList"
      style="width: 100%"
    >
      <el-table-column label="序号" width="50" type="index" align="center"></el-table-column>
      <el-table-column
        label="货品分类"
        min-width="160"
        show-overflow-tooltip
        prop="categoryName"
        align="center"
      ></el-table-column>
      <el-table-column
        label="货品名称"
        show-overflow-tooltip
        min-width="200"
        prop="spuShowName"
        align="center"
      ></el-table-column>
      <el-table-column prop="urlAddress" label="产品图片" align="center">
        <template v-slot="{ row, $index }">
          <el-image
            v-if="row.urlAddress"
            style="height: 30px; width: 30px"
            :src="row.urlAddress + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
            :preview-src-list="[row.urlAddress]"
          ></el-image>
        </template>
      </el-table-column>
      <el-table-column label="品牌" show-overflow-tooltip prop="brandName" align="center"></el-table-column>
      <el-table-column label="采购负责人" width="100" prop="purchaseManageName" align="center"></el-table-column>
      <el-table-column label="产品等级" prop="spuLevelName" align="center"></el-table-column>
      <!-- <el-table-column label="上月货品等级" prop="lastSalesNumLevelName" align="center"></el-table-column> -->
      <el-table-column label="本月货品等级" prop="thisSalesNumLevelName" align="center"></el-table-column>
      <el-table-column width="130" label="仓库库存" prop="stockNum" align="center"></el-table-column>
      <el-table-column label="工厂库存" prop="supplierStockNum" align="center"></el-table-column>
      <template v-for="(item, index) in headList">
        <el-table-column
          width="90"
          :label="getFormatDate(item)"
          show-overflow-tooltip
          align="center"
        >
          <template v-slot="{ row }">
            <span>{{ row.orderSalesVOS[index].saleQuantity }}</span>
          </template>
        </el-table-column>
      </template>
      <el-table-column label="操作" align="center" width="140">
        <template v-slot="{ row }">
          <el-button type="text" @click="openSalesDialog(row)">sku销量</el-button>
          <el-button type="text" @click="itemDetailSpu(row)">spu明细</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="tableTotal > 0"
      :total="tableTotal"
      :page.sync="reqParams.page"
      :limit.sync="reqParams.pageSize"
      @pagination="handlePageChange"
    />

    <!-- 销量弹层 -->
    <el-dialog :title="rowData.spuShowName + '销量'" :visible.sync="showSalesDialog" fullscreen>
      <el-button
        type="text"
        icon="el-icon-arrow-left"
        class="dialog-back-button"
        @click="showSalesDialog = false"
      >返回</el-button>
      <el-table
        v-loading="salesTableLoading"
        max-height="400"
        border
        :data="salesTableList"
        style="width: 100%"
      >
        <el-table-column
          label="规格名称"
          min-width="280"
          show-overflow-tooltip
          prop="specsName"
          align="center"
        >
          <template v-slot="{ row }">
            <span>
              {{
              row.specsName !== "合计"
              ? row.specsName + "(" + row.skuCode + ")"
              : row.specsName
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="7天销量" prop="sevenDaysSales" align="center"></el-table-column>
        <el-table-column label="14天销量" prop="fourteenDaysSales" align="center"></el-table-column>
        <el-table-column label="30天销量" prop="thirtyDaysSales" align="center"></el-table-column>
        <el-table-column label="30天日均销量" prop="thirtyDaysSalesAvg" align="center"></el-table-column>
        <el-table-column label="60天销量" prop="sixtyDaysSales" align="center"></el-table-column>
        <el-table-column label="90天销量" prop="ninetyDaysSales" align="center"></el-table-column>
        <el-table-column label="总销量" prop="annualTotalSales" align="center"></el-table-column>
        <el-table-column label="操作" align="center">
          <template v-slot="{ row }">
            <el-button type="text" v-if="row.specsName !== '合计'" @click="getLineList(row)">趋势图</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 20px" v-if="showLine">
        <line-chart :option="lineChartOption" :height="'380px'"></line-chart>
      </div>
    </el-dialog>
    <StatisticsSpu
      v-if="spuDetailStatus"
      @closeDialog="detailStatus"
      :show="spuDetailStatus"
      :view="spuOrsku"
      :row="spuData"
      :title="detailTitle"
    ></StatisticsSpu>
  </div>
</template>

<script>
import LineChart from '@/components/charts/LineChart.vue'
import StatisticsSpu from '@/views/bulletinboard/statistics/components/StatisticsSpu.vue'
import { categoryList } from '@/api/purchasingManagement/common'
import { getSpuTypeSelectList } from '@/api/baseData/common'
import {
  getSpuTableList, // spu的表格
  getSalesTableList, // 销量表格
  getSalesLineList, // 销量折线
} from '@/api/purchasingManagement/spuBoard'
import {
  getProductNameList, // 产品下拉框
} from '@/api/cargoPulling/common'

import {
  getCategorySelectList, // 货品分类下拉框
} from '@/api/baseData/common'

// 时间格式化
import { getFormatDate, getLastValue, addDay } from '@/utils/common'
export default {
  name: 'SpuBoard',
  components: {
    LineChart,
    StatisticsSpu,
  },
  data() {
    return {
      // spu总列表
      tableList: [], // 数据
      tableLoading: false, // 加载状态
      tableTotal: 0, // 数据总数
      headList: [], // 表头

      // 销量列表
      salesTableList: [],
      salesTableLoading: false, // 加载状态

      // 下拉框
      classificationSelectList: [], // 货品分类
      spuSelectList: [], // 产品

      // 选中的分类
      categoryList: [],

      // 列表入参
      reqParams: {
        wareHouseSortFlag: 0, // 仓库排序 0:升序 1:降序
        categoryUuid: [],
        page: 1,
        pageSize: 10,
        spuUuid: '',
      },

      // 选中的spu行数据
      rowData: {},

      // 控制销量弹层
      showSalesDialog: false,

      // 销量折线图数据
      lineChartOption: {},

      // 是否显示趋势图
      showLine: false,
      // spu明细弹窗
      spuDetailStatus: false,
      // spu或sku明细
      spuOrsku: 'spu',
      // spu明细弹窗数据
      spuData: null,
      // 明细标题
      detailTitle: '',
      // 产品类型下拉框
      spuTypeList: [],
    }
  },
  created() {
    this.getList()
    this.getCategory() // 获取货品分类下拉框
    this.getSpuSelectList() // 获取产品下拉框
    this.getSpuTypeList() // 获取产品类型下拉框
  },
  methods: {
    // 时间格式转换
    getFormatDate(time) {
      return getFormatDate(+time)
    },

    /* ------------------- 销量相关方法 ----------------------------------------------- */
    // 获取销量表格数据
    async getSalesTableList() {
      this.salesTableLoading = true
      const res = await getSalesTableList(this.rowData.spuUuid)
      this.salesTableList = res.data
      this.salesTableLoading = false
    },

    // 打开销量弹层
    openSalesDialog(row) {
      this.rowData = row
      this.showLine = false
      this.showSalesDialog = true

      this.getSalesTableList()
    },

    // 获取销量折线图数据
    async getLineList(row) {
      this.showLine = true
      const { data } = await getSalesLineList(row.skuUuid)
      const option = {
        tooltip: {
          formatter: '{a} <br/>{b}  {c}',
        },
        title: {
          left: 'center',
          text: row.specsName + '(' + row.skuCode + ')' + '销售数量',
        },
        // legend: {
        //   orient: 'vertical',
        //   // left: 'center',
        //   data: ['销售数量'],
        // },
        grid: {
          top: '20%',
          bottom: '10%',
        },
        xAxis: {
          // 时间点集合
          data: data.map((item) => this.getFormatDate(item.date)),
        },
        yAxis: { type: 'value' },
        series: [],
      }
      // 添加数据
      option.series.push({
        name: '销售数量',
        type: 'line',
        data: data.map((item) => item.value),
        markPoint: {
          data: this.getMarkPointData(data),
          symbolSize: [60, 40],
          tooltip: {
            formatter: '{b}  {c}',
          },
        },
      })

      this.lineChartOption = { ...option }
    },

    // 组装折线图的markPoint数据
    getMarkPointData(data) {
      const markPointData = []
      data.forEach((item, index) => {
        if (item.backgroundColor === 2) {
          markPointData.push({
            name: '上升率',
            value: (item.percentageChange * 100).toFixed(0) + '%',
            xAxis: index,
            yAxis: item.value,
            itemStyle: {
              color: '#002cb0',
            },
          })
        } else if (item.backgroundColor === 3) {
          markPointData.push({
            name: '下降率',
            value: (item.percentageChange * 100).toFixed(0) + '%',
            xAxis: index,
            yAxis: item.value,
            itemStyle: {
              color: '#3283ff',
            },
          })
        }
      })
      return markPointData
    },

    /* ------------------- spu表格相关方法 ----------------------------------------------- */
    // 获取列表数据
    async getList() {
      this.tableLoading = true
      // 有品类的参数的时候要处理品类uuid入参
      if (this.categoryList.length) {
        this.reqParams.categoryUuid = this.categoryList.map((item) =>
          getLastValue(item)
        )
      } else {
        this.reqParams.categoryUuid = []
      }
      const res = await getSpuTableList(this.reqParams)
      this.tableTotal = res.data.total
      this.tableList = res.data.records || []
      // 列表有值的时候要循环拿表头数据
      if (this.tableList.length) {
        this.headList = this.tableList[0].orderSalesVOS.map(
          (item) => item.saleTime
        )
      } else {
        this.headList = []
      }

      this.tableLoading = false
    },

    // 点击分页
    handlePageChange(val) {
      this.reqParams.page = val.page
      this.getList()
    },

    // 点击搜索
    clickSearch() {
      this.reqParams.page = 1
      this.getList()
    },
    // 获取货品分类下拉框数据
    async getCategory() {
      const res = await categoryList()
      this.classificationSelectList = res.data
    },

     // 获取产品类型下拉框
    async getSpuTypeList() {
      const res = await getSpuTypeSelectList()
      this.spuTypeList = res.data
    },

    // 获取产品下拉框
    async getSpuSelectList() {
      const res = await getProductNameList()
      this.spuSelectList = res.data
    },
    //关闭spu明细弹窗
    detailStatus() {
      this.spuDetailStatus = false
    },
    // 打开spu明细弹窗
    // spu明细
    itemDetailSpu(row) {
      const rowDataAss = Object.assign(row, {
        timeArr: [addDay(-7), addDay(-1)],
      })
      this.spuData = rowDataAss
      this.spuOrsku = 'spu'
      this.detailTitle = 'spu明细'
      this.spuDetailStatus = true
    },
  },
}
</script>

<style>
.aaa {
  color: #f8f394;
}
</style>
