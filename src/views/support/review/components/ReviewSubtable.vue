<template>
  <div class="review-subtable-page">
    <div class="search-form">
      <el-form class="page-search" inline ref="page-filter">
        <el-form-item label="货品分类" style="margin-right: 20px">
          <el-select
            v-model="reqParams.categoryUuid"
            class="select-width120"
            filterable
            clearable
            placeholder="请选择"
          >
            <el-option
              v-for="(item, index) in categorySelectList"
              :key="index"
              :label="item.cateName"
              :value="item.uuid"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="供应商" style="margin-right: 20px">
          <el-select
            v-model="reqParams.supplierUuid"
            class="select-width120"
            filterable
            clearable
            placeholder="请选择"
          >
            <el-option
              v-for="(item, index) in supplierSelectList"
              :key="index"
              :label="item.supplierName"
              :value="item.uuid"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="产品名称" style="margin-right: 20px">
          <el-select
            v-model="reqParams.spuUuid"
            class="select-width120"
            filterable
            clearable
            @change="getSkuList"
            placeholder="请选择"
          >
            <el-option
              v-for="(item, index) in spuSelectList"
              :key="index"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="SKU" style="margin-right: 20px">
          <el-select
            v-model="reqParams.skuUuidList"
            class="select-width120"
            filterable
            multiple
            clearable
            placeholder="请选择"
          >
            <el-option
              v-for="(item, index) in skuList"
              :key="index"
              :label="`(${item.name})${item.extendKeyword}`"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            v-if="helpSupportUuid"
            icon="el-icon-search"
            @click="handleSearch()"
          >搜索</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table v-loading="tableLoading" border max-height="400" :data="tableData">
      <el-table-column width="50" label="序号" type="index" align="center" fixed="left"></el-table-column>
      <el-table-column
        label="产品名称"
        width="150"
        prop="spuShowName"
        show-overflow-tooltip
        align="center"
        fixed="left"
      >
        <template v-slot="{ row }">
          <el-button type="text" @click="handleProductClick(row)">
            {{
            row.spuShowName
            }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="SKU编码"
        width="180"
        prop="skuCode"
        show-overflow-tooltip
        align="center"
        fixed="left"
      >
        <template v-slot="{ row }">
          {{
          (row.specsName || "") + "(" + (row.skuCode || "-") + ")"
          }}
        </template>
      </el-table-column>
      <el-table-column label="SKU图片" width="100" prop="skuUrl" align="center">
        <template v-slot="{ row }">
          <el-image
            v-if="row.skuUrl"
            style="height: 30px; width: 30px"
            :src="row.skuUrl + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
            :preview-src-list="[row.skuUrl]"
          ></el-image>
        </template>
      </el-table-column>
      <el-table-column label="货品等级" width="100" prop="categoryLevelName" align="center"></el-table-column>
      <el-table-column label="货品分类" width="120" prop="categoryName" align="center"></el-table-column>
      <el-table-column label="供应商" width="120" prop="mainSupplierName" align="center"></el-table-column>
      <el-table-column label="生产周期" width="100" prop="productionNumber" align="center"></el-table-column>
      <el-table-column label="总库存" width="75" prop="allStock" align="center"></el-table-column>
      <el-table-column label="本地仓" width="75" prop="stockNum" align="center">
        <template v-slot="{ row }">{{ row.stockNum }}</template>
      </el-table-column>
      <el-table-column label="工厂库存" width="75" prop="supplierStockNum" align="center"></el-table-column>
      <el-table-column label="本次申请计划" width="150" align="center">
        <el-table-column label="京仓" width="75" prop="thisJinPlan" align="center"></el-table-column>
        <el-table-column label="本地仓" width="75" prop="thisMiMaiPlan" align="center"></el-table-column>
      </el-table-column>
      <el-table-column label="本次帮扶复核" width="150" align="center">
        <el-table-column label="京仓" width="75" align="center">
          <template v-slot="{ row }">
            <el-button
              type="text"
              @click="handleHelpReivewClick(row)"
            >{{ row.thisHelpJinPlan || 0 }}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="本地仓" width="75" align="center">
          <template v-slot="{ row }">
            <el-button
              type="text"
              @click="handleHelpReivewClick(row)"
            >{{ row.thisHelpMiMaiPlan || 0 }}</el-button>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="预预计销售天数" width="140" prop="predictRemainDay" align="center">
        <template
          v-slot="{ row }"
        >{{ row.predictRemainDay ? row.predictRemainDay.toFixed(1) : "-" }}</template>
      </el-table-column>
      <el-table-column label="运营申请类型" width="120" prop="operationApplyTypeName" align="center"></el-table-column>
      <el-table-column width="80" label="操作" align="center" fixed="right">
        <template v-slot="{ row }">
          <el-button type="text" @click="openTrendChart(row)">趋势图</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="tableTotal > 0"
      :total="tableTotal"
      :page.sync="reqParams.page"
      :limit.sync="reqParams.pageSize"
      @pagination="handlePageChange"
    />

    <!-- 趋势图弹窗 -->
    <OperationTrendDialog
      :key="trendChartSkuUuid"
      :show-dialog.sync="showTrendChartDialog"
      :link-id="trendChartLinkId"
      :sku-uuid="trendChartSkuUuid"
    />

    <!-- 产品详情弹窗 -->
    <ProductDetailDialog
      :key="`${productDetailSpuUuid}_${productDetailSkuUuid}`"
      :visible.sync="showProductDetailDialog"
      :spu-uuid="productDetailSpuUuid"
      :sku-uuid="productDetailSkuUuid"
      :help-support-uuid="helpSupportUuid"
      :spu-show-name="productDetailSpuShowName"
      :audit-status="auditStatus"
      :submit-status="submitStatus"
      @refresh="handleProductDetailRefresh"
    />
  </div>
</template>

<script>
import { fetch_sonDetail } from '@/api/support/review/index'
import {
  categoryList,
  getSupplierSelectList,
  listSpuName,
  skuCodeToProductCode,
} from '@/api/baseData/common'
import OperationTrendDialog from '@/components/TrendChart/OperationTrendDialog.vue'
import ProductDetailDialog from './ProductDetailDialog.vue'

export default {
  name: 'ReviewSubtable',
  components: {
    OperationTrendDialog,
    ProductDetailDialog,
  },
  props: {
    helpSupportUuid: {
      type: String,
      default: '',
    },
    auditStatus: {
      type: Number,
      default: null,
    },
    submitStatus: {
      type: Number,
      default: null,
    },
  },
  data() {
    return {
      // 列表接口入参
      reqParams: {
        categoryUuid: '', // 货品分类
        helpSupportUuid: '', // 帮扶计划uuid
        skuUuidList: [], // SKU编码列表（前端使用，提交时转换为 skuUuid）
        spuUuid: '', // 产品名称
        supplierUuid: '', // 供应商
        page: 1, // 页码
        pageSize: 10, // 页大小
      },

      // 列表数据
      tableData: [],
      // 列表总数
      tableTotal: 0,
      // 列表加载
      tableLoading: false,

      // 下拉框
      categorySelectList: [], // 货品分类
      supplierSelectList: [], // 供应商
      spuSelectList: [], // 产品名称
      skuList: [], // SKU列表

      // 趋势图弹窗
      showTrendChartDialog: false,
      trendChartLinkId: '',
      trendChartSkuUuid: '', // 初始值设为空字符串，确保第一次打开时 key 变化触发组件重新创建

      // 产品详情弹窗
      showProductDetailDialog: false,
      productDetailSpuUuid: '',
      productDetailSpuShowName: '',
      productDetailSkuUuid: '',
    }
  },
  watch: {
    helpSupportUuid: {
      handler(newVal) {
        if (newVal) {
          this.reqParams.helpSupportUuid = newVal
        }
      },
      immediate: true,
    },
  },
  created() {
    // 获取下拉框
    this.getCategoryList() // 货品分类
    this.getSupplierList() // 供应商
    this.getSpuList() // 产品名称
  },
  methods: {
    // 获取列表
    async getList() {
      this.tableLoading = true
      try {
        this.reqParams.helpSupportUuid = this.helpSupportUuid
        // 转换 skuUuidList 为接口需要的格式
        const params = { ...this.reqParams }
        // 根据接口文档，参数是 skuUuid (string)，只支持单个值
        // 如果用户选择了多个 SKU，只取第一个；如果接口后续支持多个，可以调整
        if (params.skuUuidList && params.skuUuidList.length > 0) {
          params.skuUuid = params.skuUuidList[0] // 只取第一个 SKU
        }
        delete params.skuUuidList // 删除数组格式，使用转换后的格式
        const res = await fetch_sonDetail(params)
        const responseData = res.data || {}
        this.tableData = responseData.records || responseData.list || []
        this.tableTotal = responseData.total || 0
      } finally {
        this.tableLoading = false
      }
    },

    // 清空列表
    clearList() {
      this.tableData = []
      this.tableTotal = 0
      // 重置查询条件，但保留 helpSupportUuid
      const helpSupportUuid = this.reqParams.helpSupportUuid
      this.reqParams = {
        categoryUuid: '',
        helpSupportUuid: helpSupportUuid,
        skuUuidList: [],
        spuUuid: '',
        supplierUuid: '',
        page: 1,
        pageSize: 10,
      }
      this.skuList = []
    },

    // 清空筛选条件（保留表格数据）
    clearFilter() {
      // 重置查询条件，但保留 helpSupportUuid
      const helpSupportUuid = this.reqParams.helpSupportUuid
      this.reqParams.categoryUuid = ''
      this.reqParams.skuUuidList = []
      this.reqParams.spuUuid = ''
      this.reqParams.supplierUuid = ''
      this.reqParams.page = 1
      this.skuList = []
    },

    // 点击分页
    handlePageChange(val) {
      this.reqParams.page = val.page
      this.reqParams.pageSize = val.limit
      this.getList()
    },

    // 点击搜索
    handleSearch() {
      this.reqParams.page = 1
      this.getList()
    },

    // 获取货品分类下拉框
    async getCategoryList() {
      const res = await categoryList()
      this.categorySelectList = res.data || []
    },
    // 获取供应商下拉框
    async getSupplierList() {
      const res = await getSupplierSelectList()
      this.supplierSelectList = res.data || []
    },
    // 获取产品名称下拉框
    async getSpuList() {
      const res = await listSpuName()
      this.spuSelectList = res.data || []
    },

    // 获取SKU列表
    async getSkuList() {
      this.skuList = []
      this.reqParams.skuUuidList = []
      if (this.reqParams.spuUuid) {
        try {
          const res = await skuCodeToProductCode(this.reqParams.spuUuid)
          this.skuList = res.data || []
        } catch (error) {
          console.error('获取SKU列表失败:', error)
          this.$message.error('获取SKU列表失败')
        }
      }
    },

    // 点击产品名称
    handleProductClick(row) {
      const spuUuid = row.spuUuid || ''
      const spuShowName = row.spuShowName || ''

      if (!spuUuid) {
        this.$message.warning('缺少产品UUID，无法查看详情')
        return
      }

      // 设置产品信息（传递 helpSupportUuid 和 spuUuid）
      this.productDetailSpuUuid = spuUuid
      this.productDetailSpuShowName = spuShowName
      this.productDetailSkuUuid = '' // 清空 skuUuid，使用 spuUuid 查询

      // 使用 $nextTick 确保 prop 更新后再打开 dialog
      this.$nextTick(() => {
        this.showProductDetailDialog = true
      })
    },

    // 点击帮扶复核（京仓/本地仓）
    handleHelpReivewClick(row) {
      const skuUuid = row.skuUuid || row.skuUrlUuid || ''

      if (!skuUuid) {
        this.$message.warning('缺少SKU UUID，无法查看详情')
        return
      }

      // 设置 SKU 信息（传递 helpSupportUuid 和 skuUuid）
      this.productDetailSpuUuid = '' // 清空 spuUuid，使用 skuUuid 查询
      this.productDetailSpuShowName = row.spuShowName || ''
      this.productDetailSkuUuid = skuUuid

      // 使用 $nextTick 确保 prop 更新后再打开 dialog
      this.$nextTick(() => {
        this.showProductDetailDialog = true
      })
    },

    // 打开趋势图
    openTrendChart(row) {
      const skuUuid = row.skuUuid || row.skuUrlUuid || ''
      const linkId = row.linkId || ''

      if (!skuUuid) {
        this.$message.warning('缺少SKU标识，无法查看趋势图')
        return
      }

      // 先设置 skuUuid 和 linkId
      this.trendChartSkuUuid = skuUuid
      this.trendChartLinkId = linkId

      // 使用 $nextTick 确保 prop 更新后再打开 dialog
      this.$nextTick(() => {
        this.showTrendChartDialog = true
      })
    },

    // 产品详情弹窗保存成功后刷新表格数据
    handleProductDetailRefresh() {
      this.getList()
    },
  },
}
</script>

<style lang="scss" scoped>
.review-subtable-page {
  margin-top: 30px;

  .search-form {
    .el-form-item {
      margin-bottom: 10px;
    }
  }

  .select-width120 {
    width: 120px;
  }
}
</style>
