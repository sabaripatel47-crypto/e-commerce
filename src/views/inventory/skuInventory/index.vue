<template>
  <div class="app-container">
    <div class="page-search">
      <el-form :inline="true" :model="reqParams" class="demo-form-inline">
        <el-form-item label="产品名称:" style="margin-right: 20px">
          <el-select
            filterable
            v-model="reqParams.spuUuid"
            clearable
            @change="getSkuList()"
            placeholder="请选择"
          >
            <el-option
              v-for="item in productNameList"
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
        <el-form-item label="SKU:" style="margin-right: 20px">
          <el-select v-model="reqParams.skuUuid" multiple filterable clearable placeholder="请选择">
            <el-option
              v-for="item in skuList"
              :key="item.code"
              :label="`(${item.name})${item.extendKeyword}`"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商家编码搜索:" style="margin-right: 20px">
          <el-input type="text" v-model="reqParams.skuCode" placeholder="请输入商家编码"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="getPageList(1)">搜索</el-button>
        </el-form-item>
      </el-form>
    </div>
    <span style="font-size: 14px">{{ updateTime }}</span>
    <el-table
      border
      v-loading="loading"
      :data="tableData"
      center
      @row-click="handleCurrentChange"
      style="width: 100%"
      max-height="480"
    >
      <el-table-column prop="date" label="序号" min-width="25" type="index" align="center"></el-table-column>
      <el-table-column prop="productName" label="产品名称" align="center"></el-table-column>
      <el-table-column label="SKU编码" show-overflow-tooltip align="center">
        <template v-slot="{ row }">
          <span>({{ row.skuCode }}){{ row.specsName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="SKU图片" width="80" align="center">
        <template v-slot="{ row, $index }">
          <el-image
            v-if="row.skuUrl"
            style="height: 30px; width: 30px"
            :src="row.skuUrl + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
            :preview-src-list="[row.skuUrl]"
          ></el-image>
        </template>
      </el-table-column>
      <el-table-column prop="warehouseStockNum" width="120" label="仓库库存" align="center">
        <template #header>
          <span
            @click="sortChange"
            :style="{
                color: '#409EFF',
                fontSize: '17px',
                cursor: 'pointer'}"
          >
            仓库库存
            <i v-if="reqParams.sortType === 1" class="el-icon-top"></i>
            <i v-if="reqParams.sortType === 0" class="el-icon-bottom"></i>
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="sumStock" label="总仓库库存" width="100" align="center"></el-table-column>
      <el-table-column prop="supplierStockNum" width="80" label="工厂库存" align="center"></el-table-column>
      <el-table-column prop="surplusDays" label="预测剩余销售天数" width="130" align="center"></el-table-column>
      <el-table-column label="操作" width="170" align="center">
        <template v-slot="{ row }">
          <el-button type="text" size="small" @click="openSupplierDialog(row, 0)">供应商记录</el-button>
          <el-button type="text" size="small" @click="openWarehouseDialog(row, 0)">仓库记录</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      v-show="total > 0"
      :page.sync="reqParams.page"
      :limit.sync="reqParams.pageSize"
      :total="total"
      @pagination="getPageList"
    />
    <div class="table-container">
      <div style="width: 48%">
        <el-table border v-loading="childLoading" :data="supplierList" center>
          <el-table-column prop="date" label="序号" min-width="25" type="index" align="center"></el-table-column>
          <el-table-column prop="supplierName" label="供应商" align="center"></el-table-column>
          <el-table-column prop="supplierStockNum" label="工厂库存" align="center"></el-table-column>
          <el-table-column label="最后拉货时间" align="center">
            <template v-slot="{ row }">
              <span v-if="row.lastGoodsTime != null">
                {{
                getFormatDate(+row.lastGoodsTime)
                }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center">
            <template v-slot="{ row }">
              <el-button type="text" size="small" @click="openSupplierDialog(row, 1)">修改记录</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div style="width: 48%">
        <el-table border v-loading="childLoading" :data="warehouseList" center>
          <el-table-column prop="date" label="序号" min-width="25" type="index" align="center"></el-table-column>
          <el-table-column prop="warehouseName" label="仓库名称" align="center"></el-table-column>
          <el-table-column prop="warehouseStockNum" label="库存" align="center"></el-table-column>
          <el-table-column label="操作" align="center">
            <template v-slot="{ row }">
              <el-button type="text" size="small" @click="openWarehouseDialog(row, 1)">修改记录</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 供应商弹窗 -->
    <el-dialog title="供应商记录" @close="closeDialog" :visible.sync="supplierDialogVisible" width="70%">
      <div class="page-search">
        <el-form :model="dialogParams" :inline="true" label-width="100px" class="demo-ruleForm">
          <!--时间范围 -->
          <el-form-item label="时间范围：" style="margin-right: 20px">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              align="right"
              unlink-panels
              value-format="timestamp"
              @blur="blurTime"
            ></el-date-picker>
          </el-form-item>
          <el-form-item label="修改类型：" style="margin-right: 20px">
            <el-select v-model="dialogParams.updateType" clearable placeholder="请选择">
              <el-option
                v-for="item in updateTypeList"
                :key="item.code"
                :label="item.name"
                :value="item.code"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getSupplier(1)">查询</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table
        border
        v-loading="dialogLoading"
        :data="dialogList"
        center
        style="width: 100%"
        max-height="500"
      >
        <el-table-column prop="date" label="序号" min-width="25" type="index" align="center"></el-table-column>
        <el-table-column prop="updateTypeName" label="修改类型" align="center"></el-table-column>
        <el-table-column prop="destinateWarehouseName" label="到货仓库" align="center"></el-table-column>
        <el-table-column prop="goodsQuantity" label="数量" align="center"></el-table-column>
        <el-table-column prop="nowStock" label="库存结存" align="center"></el-table-column>
        <el-table-column label="备注" align="center">
          <template v-slot="{ row }">
            <span>{{ row.refundReasonName }}</span>
            <span v-if="row.remark != null">-{{ row.remark }}</span>
          </template>
        </el-table-column>
        <el-table-column label="修改时间" align="center">
          <template slot-scope="scope">
            <span>{{ getFormatDate(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createUser" label="修改人" align="center"></el-table-column>
      </el-table>
      <!-- 分页 -->
      <Pagination
        v-show="dialogTotal > 0"
        :page.sync="dialogParams.page"
        :limit.sync="dialogParams.pageSize"
        :total="dialogTotal"
        @pagination="getSupplier"
      />
    </el-dialog>
    <!-- 仓库弹窗 -->
    <el-dialog title="仓库记录" @close="closeDialog" :visible.sync="warehouseDialogVisible" width="70%">
      <div class="page-search">
        <el-form :model="dialogParams" :inline="true" label-width="100px" class="demo-ruleForm">
          <!--时间范围 -->
          <el-form-item label="时间范围：" style="margin-right: 20px">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              align="right"
              unlink-panels
              value-format="timestamp"
              @blur="blurTime"
            ></el-date-picker>
          </el-form-item>
          <el-form-item label="修改类型：" style="margin-right: 20px">
            <el-select v-model="dialogParams.updateType" clearable placeholder="请选择">
              <el-option
                v-for="item in updateTypeList"
                :key="item.code"
                :label="item.name"
                :value="item.code"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getWarehouse(1)">查询</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table
        border
        v-loading="dialogLoading"
        :data="dialogList"
        center
        style="width: 100%"
        max-height="500"
      >
        <el-table-column prop="date" label="序号" min-width="25" type="index" align="center"></el-table-column>
        <el-table-column prop="updateTypeName" label="修改类型" align="center"></el-table-column>
        <el-table-column prop="deliveryWarehouseName" label="进货仓库" align="center"></el-table-column>
        <el-table-column prop="destinateWarehouseName" label="到货仓库" align="center"></el-table-column>
        <el-table-column prop="goodsQuantity" label="数量" align="center"></el-table-column>
        <el-table-column prop="nowStock" label="库存结存" align="center"></el-table-column>
        <el-table-column label="修改时间" align="center">
          <template slot-scope="scope">
            <span>{{ getFormatDate(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createUser" label="修改人" align="center"></el-table-column>
      </el-table>
      <!-- 分页 -->
      <Pagination
        v-show="dialogTotal > 0"
        :page.sync="dialogParams.page"
        :limit.sync="dialogParams.pageSize"
        :total="dialogTotal"
        @pagination="getWarehouse"
      />
    </el-dialog>
  </div>
</template>

<script>
import {
  getProductNameList,
  getSkuList,
  getChangeTypeList,
  skuInventoryList,
  supplierInventoryList,
  warehouseInventoryList,
  warehouseRecordList,
  warehouseRecordParentList,
  supplierRecordList,
  supplierRecordParentList,
  getUpdateTime,
} from '@/api/inventory/skuInventory'
import { getSpuTypeSelectList } from '@/api/baseData/common'
import { getFormatDate } from '@/utils/common'
export default {
  name: 'SkuInventory',
  data() {
    return {
      reqParams: {
        page: 1,
        pageSize: 10,
        spuType: '1',
        skuUuid: [],
        sortType: 1,
        spuUuid: '',
        skuCode: '',
      },
      total: 0,
      // 产品名称列表
      productNameList: [],
      // SKU列表
      skuList: [],
      // 修改类型列表
      updateTypeList: [],
      // sku分页列表
      tableData: [],
      loading: false,
      childLoading: false,
      // 仓库记录
      warehouseList: [],
      // 供应商记录
      supplierList: [],
      supplierDialogVisible: false,
      warehouseDialogVisible: false,
      // 弹窗参数
      dialogParams: {
        endTime: '',
        page: 1,
        pageSize: 10,
        skuUuid: '',
        startTime: '',
        updateType: '',
      },
      // 弹窗记录
      dialogList: [],
      // 弹窗全部
      dialogTotal: 0,
      // 控制弹窗请求
      status: 0,
      dialogLoading: false,
      dateRange: [],

      // 产品类型下拉框
      spuTypeList: [],

      // 数据更新时间
      updateTime: '',
    }
  },
  created() {
    // 如果有spuUuid 说明是跳转过来的，就先赋值
    this.reqParams.spuUuid = this.$route.params.spuUuid || ''
    if (this.reqParams.spuUuid) {
      this.getSkuList()
    }

    const query = this.$route.query
    if (query) {
      if (query.spuUuid) {
        this.reqParams.spuUuid = query.spuUuid
        this.getSkuList()
      }
      if (query.skuUuid) {
        this.reqParams.skuUuid = [query.skuUuid]
      }
    }

    // console.log('this.$route.params', this.$route.params)

    this.getProductNameList()
    this.getChangeTypeList()
    this.getSpuTypeList()
    this.getPageList(1)
    this.getUpdateTime()
  },
  methods: {
    // 切换排序
    sortChange() {
      // sortType 1:倒序 2:正序
      this.reqParams.sortType === 1
        ? (this.reqParams.sortType = 0)
        : (this.reqParams.sortType = 1)
      this.getPageList(1)
    },
    // 获取数据更新时间
    async getUpdateTime() {
      const res = await getUpdateTime()
      this.updateTime = res.data
    },

    // 获取产品类型下拉框
    async getSpuTypeList() {
      const res = await getSpuTypeSelectList()
      this.spuTypeList = res.data
    },

    // 获取产品名称列表
    async getProductNameList() {
      const res = await getProductNameList()
      this.productNameList = res.data
    },
    // 获取SKU列表
    async getSkuList() {
      this.reqParams.skuUuid = []
      this.skuList = []
      if (this.reqParams.spuUuid != '') {
        const res = await getSkuList(this.reqParams.spuUuid)
        this.skuList = res.data
      }
    },
    // 修改类型下拉
    async getChangeTypeList() {
      const res = await getChangeTypeList()
      this.updateTypeList = res.data
    },
    // sku分页列表
    async getPageList(page) {
      this.loading = true
      if (page == 1) {
        this.reqParams.page = 1
      }
      this.supplierList = []
      this.warehouseList = []
      const res = await skuInventoryList(this.reqParams)
      this.tableData = res.data.records
      this.total = res.data.total
      this.loading = false
    },
    handleCurrentChange(row) {
      this.childLoading = true
      this.warehouseInventoryList(row.skuUuid)
      this.supplierInventoryList(row.skuUuid)
      this.childLoading = false
    },
    // 仓库记录
    async warehouseInventoryList(id) {
      const res = await warehouseInventoryList(id)
      this.warehouseList = res.data
    },
    // 供应商记录
    async supplierInventoryList(id) {
      const res = await supplierInventoryList(id)
      this.supplierList = res.data
    },
    // 打开仓库弹窗
    openWarehouseDialog(row, status) {
      this.status = status
      this.dialogParams.skuUuid = row.skuUuid
      if (status == 1) {
        this.dialogParams.warehouseUuid = row.warehouseUuid
      }
      this.getWarehouse(1)
      this.warehouseDialogVisible = true
    },
    async getWarehouse(page) {
      this.dialogLoading = true
      if (page == 1) {
        this.dialogParams.page = 1
      }
      if (this.dateRange != null) {
        this.dialogParams.startTime = this.dateRange[0]
        this.dialogParams.endTime = this.dateRange[1]
      } else {
        this.dialogParams.startTime = ''
        this.dialogParams.endTime = ''
      }
      let res
      if (this.status == 1) {
        res = await warehouseRecordList(this.dialogParams)
      } else if (this.status == 0) {
        res = await warehouseRecordParentList(this.dialogParams)
      }
      this.dialogList = res.data.records
      this.dialogTotal = res.data.total
      this.dialogLoading = false
    },
    closeDialog() {
      this.dialogParams = this.$options.data().dialogParams
      this.supplierDialogVisible = false
      this.warehouseDialogVisible = false
    },
    // 打开供应商弹窗
    openSupplierDialog(row, status) {
      this.status = status
      this.dialogParams.skuUuid = row.skuUuid
      if (status == 1) {
        this.dialogParams.supplierStorkUuid = row.supplierStockUuid
      }
      this.getSupplier(1)
      this.supplierDialogVisible = true
    },
    async getSupplier(page) {
      this.dialogLoading = true
      if (page == 1) {
        this.dialogParams.page = 1
      }
      if (this.dateRange != null) {
        this.dialogParams.startTime = this.dateRange[0]
        this.dialogParams.endTime = this.dateRange[1]
      } else {
        this.dialogParams.startTime = ''
        this.dialogParams.endTime = ''
      }

      let res
      if (this.status == 1) {
        res = await supplierRecordList(this.dialogParams)
      } else if (this.status == 0) {
        res = await supplierRecordParentList(this.dialogParams)
      }
      console.log(res)
      this.dialogList = res.data.records
      this.dialogTotal = res.data.total
      this.dialogLoading = false
    },
    getFormatDate(time) {
      return getFormatDate(parseInt(time))
    },
    // 时间选择失焦时将startPickerTime置空 目的是清除禁用的时间范围
    blurTime() {
      this.startPickerTime = ''
    },
  },
}
</script>

<style scoped>
.table-container {
  display: flex;
  justify-content: space-between; /* 添加间距 */
  margin-top: 40px;
}
</style>