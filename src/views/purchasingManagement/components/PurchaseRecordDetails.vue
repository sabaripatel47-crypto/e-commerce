<template>
  <div class="app-container">
    <div>
      <div class="search-form">
        <el-form inline>
          <!--提交时间范围 -->
          <el-form-item
            label="采购时间:"
            v-if="fromType === 'procurementBoard'"
            style="margin-right: 20px"
          >
            <el-date-picker
              v-model="reqParams.purchaseTime"
              :clearable="false"
              type="month"
              align="right"
              value-format="timestamp"
            ></el-date-picker>
          </el-form-item>
          <el-form-item label="运营申请类型:" style="margin-right: 20px">
            <el-select v-model="reqParams.operationApplyType" placeholder="请选择" clearable>
              <el-option
                v-for="item in platformList"
                :key="item.code"
                :label="item.name"
                :value="item.code"
              ></el-option>
            </el-select>
          </el-form-item>
          <!-- 下拉选择品类 -->
          <el-form-item label="货品分类:" style="margin-right: 20px">
            <el-cascader
              filterable
              v-model="categoryList"
              :options="cadepartments"
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
          <el-form-item label="供应商:" style="margin-right: 20px">
            <el-select v-model="reqParams.supplierUuid" filterable clearable placeholder="请选择">
              <el-option
                v-for="item in supplierList"
                :key="item.uuid"
                :label="item.supplierName"
                :value="item.uuid"
              ></el-option>
            </el-select>
          </el-form-item>
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
          <el-form-item>
            <el-button
              type="primary"
              icon="el-icon-search"
              style="margin-right: 20px"
              @click="getPageList(1)"
            >搜索</el-button>
          </el-form-item>
        </el-form>
        <div v-if="fromType !== 'procurementBoard'" style="margin-bottom: 10px">
          <el-button type="primary" @click="generatePurchasePlan()">生成采购订单</el-button>
          <el-button type="primary" @click="autoGeneratePurchasePlan()">自动生成采购订单</el-button>
          <el-button type="primary" @click="generateRemainingPurchasePlan()">生成余下采购订单</el-button>
          <el-button type="primary" @click="appendPurchase()">追加采购</el-button>
        </div>
      </div>
      <el-table
        v-loading="loading"
        :data="tableData"
        center
        row-key="skuUuid"
        border
        ref="multipleTable"
        style="width: 100%"
        max-height="700"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          type="selection"
          width="50"
          :reserve-selection="true"
          v-if="fromType !== 'procurementBoard'"
        ></el-table-column>
        <el-table-column prop="date" label="序号" min-width="25" type="index" align="center"></el-table-column>
        <el-table-column prop="spuShowName" label="产品名称" width="150" align="center"></el-table-column>
        <el-table-column width="180" label="SKU编码" show-overflow-tooltip align="center">
          <template slot-scope="scope">
            <span>({{ scope.row.skuCode }}){{ scope.row.specsName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="SKU图片" align="center">
          <template v-slot="{ row, $index }">
            <el-image
              v-if="row.skuUrl"
              style="height: 30px; width: 30px"
              :src="
                row.skuUrl + '?x-oss-process=image/resize,w_30,h_30,limit_0'
              "
              :preview-src-list="[row.skuUrl]"
            ></el-image>
          </template>
        </el-table-column>
        <el-table-column prop="spuLevelName" label="产品等级" align="center"></el-table-column>
        <el-table-column prop="categoryLevelName" label="货品等级" align="center"></el-table-column>
        <el-table-column prop="categoryName" min-width="160" label="货品分类" align="center"></el-table-column>
        <el-table-column label="供应商" width="180" align="center">
          <template slot-scope="scope">
            <div v-for="item in scope.row.otherSupplier" :key="item.uuid">{{ item.supplierName }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="productionNumber" label="生产周期" align="center"></el-table-column>
        <el-table-column prop="stockNum" label="仓库库存" align="center"></el-table-column>
        <el-table-column prop="supplierStockNum" label="工厂库存" align="center"></el-table-column>
        <el-table-column label="总库存" align="center">
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.allStock != null && scope.row.allStock != 0"
              type="text"
              size="small"
              @click="warehouseInventoryList(scope.row.skuUuid)"
            >{{ scope.row.allStock }}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="本月本地复核数量" align="center">
          <template slot-scope="scope">
            <el-button
              v-if="
                scope.row.applyPlanNum != null && scope.row.applyPlanNum != 0
              "
              type="text"
              size="small"
              @click="getPurchaseDetails(scope.row.skuUuid, scope.row.nowMonth)"
            >{{ scope.row.applyPlanNum }}</el-button>
            <span v-if="scope.row.applyPlanNum == 0">0</span>
            <span v-if="scope.row.applyPlanNum == null">-</span>
          </template>
        </el-table-column>

        <el-table-column label="本月京仓复核数量" align="center">
          <template slot-scope="scope">
            <el-button
              v-if="
                scope.row.applyJinPlanNum != null &&
                scope.row.applyJinPlanNum != 0
              "
              type="text"
              size="small"
              @click="getPurchaseDetails(scope.row.skuUuid, scope.row.nowMonth)"
            >{{ scope.row.applyJinPlanNum }}</el-button>
            <span v-if="scope.row.applyJinPlanNum == 0">0</span>
            <span v-if="scope.row.applyJinPlanNum == null">-</span>
          </template>
        </el-table-column>

        <el-table-column label="上月本地复核数量" align="center">
          <template slot-scope="scope">
            <el-button
              v-if="
                scope.row.lastApplyPlanNum != null &&
                scope.row.lastApplyPlanNum != 0
              "
              type="text"
              size="small"
              @click="
                getPurchaseDetails(scope.row.skuUuid, scope.row.lastMonth)
              "
            >{{ scope.row.lastApplyPlanNum }}</el-button>
            <span v-if="scope.row.lastApplyPlanNum == 0">0</span>
            <span v-if="scope.row.lastApplyPlanNum == null">-</span>
          </template>
        </el-table-column>

        <el-table-column label="上月京仓复核数量" align="center">
          <template slot-scope="scope">
            <el-button
              v-if="
                scope.row.lastApplyJinPlanNum != null &&
                scope.row.lastApplyJinPlanNum != 0
              "
              type="text"
              size="small"
              @click="
                getPurchaseDetails(scope.row.skuUuid, scope.row.lastMonth)
              "
            >{{ scope.row.lastApplyJinPlanNum }}</el-button>
            <span v-if="scope.row.lastApplyJinPlanNum == 0">0</span>
            <span v-if="scope.row.lastApplyJinPlanNum == null">-</span>
          </template>
        </el-table-column>

        <el-table-column label="下月本地复核数量" align="center">
          <template slot-scope="scope">
            <el-button
              v-if="
                scope.row.nextMonthNum != null && scope.row.nextMonthNum != 0
              "
              type="text"
              size="small"
              @click="
                getPurchaseDetails(scope.row.skuUuid, scope.row.nextMonth)
              "
            >{{ scope.row.nextMonthNum }}</el-button>
            <span v-if="scope.row.nextMonthNum == 0">0</span>
            <span v-if="scope.row.nextMonthNum == null">-</span>
          </template>
        </el-table-column>

        <el-table-column label="下月京仓复核数量" align="center">
          <template slot-scope="scope">
            <el-button
              v-if="
                scope.row.nextMonthJinNum != null &&
                scope.row.nextMonthJinNum != 0
              "
              type="text"
              size="small" 
              @click="
                getPurchaseDetails(scope.row.skuUuid, scope.row.nextMonth)
              "
            >{{ scope.row.nextMonthJinNum }}</el-button>
            <span v-if="scope.row.nextMonthJinNum == 0">0</span>
            <span v-if="scope.row.nextMonthJinNum == null">-</span>
          </template>
        </el-table-column>

        <el-table-column prop="lastPurchaseNum" label="上月实际采购量" align="center"></el-table-column>
        <el-table-column prop="predictRemainDay" label="预测剩余销售天数" align="center"></el-table-column>
        <el-table-column prop="operationApplyTypeName" label="运营申请类型" align="center"></el-table-column>
        <el-table-column label="操作" align="center" width="80">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="openTrendDialog(scope.row)">趋势图</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <Pagination
        v-show="total > 0"
        :page.sync="reqParams.page"
        :limit.sync="reqParams.pageSize"
        :total="total"
        @pagination="handleChnage"
      />
    </div>
    <!-- 时间选择 -->
    <el-dialog
      :visible.sync="dateDialogVisible"
      :inline="true"
      :before-close="closeDateDialog"
      append-to-body
      width="30%"
    >
      <el-form>
        <el-form-item label="采购日期">
          <el-date-picker
            v-model="propsData.purchaseTime"
            value-format="timestamp"
            type="month"
            placeholder="请选择日期"
          ></el-date-picker>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeDateDialog()">取消</el-button>
        <el-button type="primary" @click="openDialog()">确定</el-button>
      </span>
    </el-dialog>

    <!-- 弹窗 -->
    <el-dialog
      @close="closeDialog"
      :modal="false"
      :visible.sync="dialogVisible"
      fullscreen
      append-to-body
    >
      <el-button
        type="text"
        icon="el-icon-arrow-left"
        class="dialog-back-button"
        @click="closeDialog"
      >返回</el-button>
      <PurchaseDetail
        ref="modal"
        v-if="dialogVisible"
        :propsData="propsData"
        :addPurchaseOrderLists="orderList"
        @update="handleUpdate"
      />
      <div slot="footer" class="dialog-footer">
        <el-button @click="submitPurchasePlan(0)">暂存</el-button>
        <el-button type="primary" @click="submitPurchasePlan(1)">提交</el-button>
      </div>
    </el-dialog>

    <ApplicationPlanDialog :visible.sync="planDialogVisible" :data="planData"></ApplicationPlanDialog>
    <TrendChart :show-dialog.sync="trendDialogVisible" :sku-uuid="skuUuid" :append-to-body="true" />
    <InventoryDetails ref="InventoryDetails" :tableData="warehouseList"></InventoryDetails>
  </div>
</template>

<script>
import {
  getApplyType,
  getSupplierList,
  getProductNameList,
  getSkuList,
  getPurchaseList,
  purchaseOrder,
  autoPurchase,
  getPurchaseDetail,
  getPurchaseDetailForBoard,
  getPurchaseDetailBySku,
  category,
  autoPurchaseRest,
} from '@/api/purchasingManagement/purchaseRecordDetails'
import { getPurchaseBoardTableList } from '@/api/purchasingManagement/procurementBoard'
import PurchaseDetail from '../components/PurchaseDetail'
import ApplicationPlanDialog from '../components/ApplicationPlanDialog'
import TrendChart from '@/components/TrendChart/index.vue'
import {
  warehouseInventoryList,
  categoryList,
} from '@/api/purchasingManagement/common'
import InventoryDetails from '@/components/InventoryDetails'
import { getDeptTreeData } from '@/utils/common'
export default {
  name: 'PurchaseRecordDetails',
  props: {
    fromType: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      // 申请类型列表
      platformList: [],
      // 货品分类列表
      // goodsList:[],
      // 供应商列表
      supplierList: [],
      // 货品分类下拉
      cadepartments: [],
      // 产品名称列表
      productNameList: [],
      // SKU列表
      skuList: [],
      // 请求参数
      reqParams: {
        pageSize: 10,
        page: 1,
        operationApplyType: '',
        supplierUuid: '',
        spuUuid: '',
        skuUuid: [],
        purchaseTime: '', // 时间（采购看板用）
      },
      // 列表数据
      tableData: [],
      // 加载状态
      loading: false,
      total: 0,
      // 仓库记录
      warehouseList: [],
      categoryList: [],
      // 传输到子组件的数据
      propsData: {
        // 是否只读
        readOnly: false,
        // 状态
        purchaseStatus: 2,
        purchaseTime: '',
        purchaseDescribe: '',
      },
      // 选择的数据
      addPurchaseOrderLists: [],
      // 提交下单参数
      submitParams: {
        // 提交状态
        submitStatus: 1,
      },
      // 弹窗状态
      dialogVisible: false,
      // 日期弹框状态
      dateDialogVisible: false,
      // 判断是否进入详情页
      isDetail: false,
      // 采购计划详情弹窗
      planDialogVisible: false,
      // 采购计划详情数据
      planData: [],
      // 折线图数据
      option: [],
      // 趋势图标题
      trendTitle: '',
      // 趋势图弹窗状态
      trendDialogVisible: false,
      skuUuid: '',
      orderList: [],
      purchingPlanStatus: 1,
    }
  },
  components: {
    PurchaseDetail,
    ApplicationPlanDialog,
    TrendChart,
    InventoryDetails,
  },
  created() {
    if (this.fromType === 'procurementBoard') {
      this.reqParams.purchaseTime = new Date().getTime()
    }
    this.getApplyTypeList()
    this.getProductNameList()
    this.getSuppliers()
    this.getPageList()
    this.getCategory()
  },
  methods: {
    // 获取申请类型列表
    async getApplyTypeList() {
      const res = await getApplyType()
      this.platformList = res.data
    },
    // 获取货品分类下拉框数据
    async getCategory() {
      const res = await categoryList()
      this.cadepartments = await getDeptTreeData(res.data)
    },
    // 获取供应商列表
    async getSuppliers() {
      const res = await getSupplierList()
      this.supplierList = res.data
    },
    // 获取产品名称列表
    async getProductNameList() {
      const res = await getProductNameList()
      this.productNameList = res.data
    },
    // 获取SKU列表
    async getSkuList() {
      this.skuList = []
      if (this.reqParams.spuUuid != '') {
        const res = await getSkuList(this.reqParams.spuUuid)
        this.skuList = res.data
      }
    },
    // 仓库记录
    async warehouseInventoryList(id) {
      const res = await warehouseInventoryList(id)
      this.warehouseList = res.data
      this.$refs.InventoryDetails.openDialog()
    },
    // 获取采购记录列表
    async getPageList(page) {
      if (page == 1) {
        this.reqParams.page = 1
      }
      this.loading = true
      this.reqParams.categoryUuid = []
      for (let i = this.categoryList.length; i--; ) {
        let arr = this.categoryList[i]
        if (Array.isArray(arr)) {
          arr = arr[arr.length - 1]
        }
        this.reqParams.categoryUuid.push(arr)
      }
      let res
      if (this.fromType === 'procurementBoard') {
        res = await getPurchaseBoardTableList(this.reqParams)
      } else {
        res = await getPurchaseList(this.reqParams)
      }
      this.tableData = res.data.records
      this.total = res.data.total
      this.loading = false
    },
    handleChnage({ page, limit }) {
      this.reqParams.page = page
      this.getPageList()
    },
    handleSelectionChange(val) {
      this.addPurchaseOrderLists = val
    },
    // 根据所选的列获取详情数组
    async getPurchaseDetailList() {
      let skuUuidList = this.addPurchaseOrderLists.map((item) => item.skuUuid)
      if (skuUuidList.length != 0) {
        const res = await getPurchaseDetailBySku({
          skuUuidList: skuUuidList,
          purchaseTime: this.propsData.purchaseTime,
        })
        this.orderList = res.data
      }
    },
    // 生成采购计划
    generatePurchasePlan() {
      this.purchingPlanStatus = 1
      this.$nextTick(() => {
        this.openDateDialog()
      })
      // console.log(this.dateDialogVisible);
    },
    // 自动生成采购计划
    async autoGeneratePurchasePlan() {
      this.purchingPlanStatus = 2
      // const res = await autoPurchase(this.propsData.purchaseTime)
      // this.addPurchaseOrderLists = res.data
      this.openDateDialog()
    },
    // 生成余下采购计划
    async generateRemainingPurchasePlan() {
      this.purchingPlanStatus = 3
      // const res = await autoPurchaseRest(this.propsData.purchaseTime)
      // this.addPurchaseOrderLists = res.data
      this.openDateDialog()
    },
    // 追加采购
    appendPurchase() {
      this.propsData.purchaseStatus = 3
      this.openDateDialog()
    },
    openDateDialog() {
      // 获取当前日期
      let currentDate = new Date()
      // 设置为下一个月
      currentDate.setMonth(currentDate.getMonth() + 1)
      let timestamp = currentDate.getTime()
      this.propsData.purchaseTime = timestamp

      this.dateDialogVisible = true
    },
    // 清空时间
    closeDateDialog() {
      if (!this.isDetail) {
        this.propsData.purchaseTime = ''
      }
      this.dateDialogVisible = false
    },
    // 打开详情弹窗
    async openDialog() {
      if (this.propsData.purchaseTime == '') {
        this.$message.error('请先选择采购时间')
      } else {
        this.isDetail = true
        let res = []
        if (this.purchingPlanStatus == 2) {
          res = await autoPurchase(this.propsData.purchaseTime)
          this.orderList = res.data
        }
        if (this.purchingPlanStatus == 3) {
          res = await autoPurchaseRest(this.propsData.purchaseTime)
          this.orderList = res.data
        }

        if (this.purchingPlanStatus == 1) {
          await this.getPurchaseDetailList()
        }

        this.closeDateDialog()

        this.dialogVisible = true
      }
    },
    // 提交采购计划
    async submitPurchasePlan(status) {
      this.$refs.modal.orderOutput()
      const list = this.submitParams.addPurchaseOrderLists
      for (let i = 0; i < list.length - 1; i++) {
        for (let j = i + 1; j < list.length; j++) {
          if (
            list[i].skuUuid == list[j].skuUuid &&
            list[i].supplierUuid == list[j].supplierUuid &&
            list[i].supplierUuid != undefined
          ) {
            return this.$message.error('同一个SKU请选择不同的供应商')
          }
        }
      }
      const isEmpyt = list.every(
        (item) =>
          item.purchaseQuantity != undefined && item.purchaseQuantity != ''
      )
      const supplier = list.every(
        (item) => item.supplierUuid != undefined && item.supplierUuid != ''
      )
      if (isEmpyt || status == 0 || supplier) {
        this.submitParams.submitStatus = status
        const res = await purchaseOrder(this.submitParams)
        if (res.data == true) {
          this.$message.success('提交成功')
          this.closeDialog()
        } else {
          this.$message.error('提交失败')
        }
      } else {
        this.isEmpyt ? '' : this.$message.error('请填写每一个采购数量')
        this.$nextTick(() => {
          this.supplier ? '' : this.$message.error('请选择每一个供应商')
        })
      }
    },
    // 获取传值并组装
    handleUpdate(value) {
      this.submitParams = {
        ...this.submitParams,
        ...value,
      }
    },
    // 关闭采购弹窗
    closeDialog() {
      this.dialogVisible = false
      this.getPageList(1)
      this.propsData = this.$options.data().propsData
      this.orderList = []
      this.addPurchaseOrderLists = []
      this.$refs.multipleTable.clearSelection()
      this.isDetail = false
      this.submitParams = this.$options.data().submitParams
      this.tableData.forEach((item) => {
        item.purchaseQuantity = ''
      })
    },
    // 打开采购详情弹窗
    async getPurchaseDetails(id, time) {
      let res
      if (this.fromType === 'procurementBoard') {
        res = await getPurchaseDetailForBoard({ monthTime: time, skuUuid: id })
      } else {
        res = await getPurchaseDetail({ monthTime: time, skuUuid: id })
      }
      this.planData = res.data
      this.planDialogVisible = true
    },
    // 打开趋势图弹窗
    openTrendDialog(row) {
      this.skuUuid = row.skuUuid
      this.trendDialogVisible = true
    },
  },
}
</script>

<style scoped lang="scss">
.search-form {
  .el-form-item {
    margin-bottom: 10px;
  }
}
</style>
