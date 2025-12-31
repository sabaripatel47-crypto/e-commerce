<template>
  <div class="app-container">
    <div class="head-container">
      <el-form inline class="page-search">
        <el-form-item label="采购时间:">
          <el-date-picker
            :clearable="false"
            v-model="reqParams.purchaseTime"
            style="width: 240px"
            value-format="timestamp"
            type="month"
            placeholder="请选择日期"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="申请类型:" style="margin-right: 20px;">
          <el-select
            v-model="reqParams.purchaseStatus"
            clearable
            class="select-width120"
            placeholder="请选择"
          >
            <el-option
              v-for="item in purchaseStatusList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="审核状态:" style="margin-right: 20px;">
          <el-select
            v-model="reqParams.purchaseExamineStatus"
            filterable
            class="select-width120"
            placeholder="请选择"
          >
            <el-option
              v-for="item in auditStatusList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="提交状态:" style="margin-right: 20px;">
          <el-select v-model="reqParams.submitStatus" class="select-width120" placeholder="请选择">
            <el-option
              v-for="item in submitStatusList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin-right: 20px;">
          <el-button type="primary" icon="el-icon-search" @click="getPageList(1)">搜索</el-button>
        </el-form-item>
        <el-form-item style="margin-right: 20px;">
          <el-button type="primary" icon="el-icon-plus" plain @click="jumpToDetail()">新增</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-radio-group v-model="pageStatus" @change="getPageList(1)">
      <el-radio-button :label="1">全部</el-radio-button>
      <el-radio-button :label="2">我的驳回</el-radio-button>
    </el-radio-group>
    <el-table
      :data="tableData"
      style="width: 100%"
      :row-style="rowStyle"
      border
      height="480"
      v-loading="loading"
      @row-click="handleCurrentChange"
    >
      <el-table-column prop="date" label="序号" min-width="30" type="index" align="center"></el-table-column>
      <el-table-column prop="applyUser" label="申请人" min-width="30" align="center"></el-table-column>
      <el-table-column prop="purchaseTime" label="采购时间" min-width="30" align="center">
        <template v-slot="{row}">{{ getFormaMonth(row.purchaseTime) }}</template>
      </el-table-column>
      <el-table-column
        prop="purchaseDescribe"
        label="制单时间"
        show-overflow-tooltip
        min-width="30"
        align="center"
      >
        <template v-slot="{row}">{{ getFormatDate(+row.submitTime) }}</template>
      </el-table-column>
      <el-table-column
        prop="purchaseDescribe"
        label="采购说明"
        show-overflow-tooltip
        min-width="30"
        align="center"
      ></el-table-column>
      <el-table-column prop="purchaseStatusName" label="状态" min-width="30" align="center"></el-table-column>
      <el-table-column prop="submitStatusName" label="提交状态" min-width="30" align="center"></el-table-column>
      <el-table-column prop="purchaseExamineStatusName" label="审核状态" min-width="30" align="center"></el-table-column>
      <el-table-column label="操作" min-width="30" align="center">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="openDetailDialog(scope.row)"
          >详情</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-plus"
            v-if="scope.row.purchaseExamineStatus == 3"
            @click="openDialog(scope.row,0)"
          >重新发起</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            v-if="scope.row.purchaseExamineStatus == 0"
            @click="openDialog(scope.row,1)"
          >修改</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="reqParams.page"
      :limit.sync="reqParams.pageSize"
      @pagination="handleChnage"
    />
    <div class="child-search">
      <el-form ref="addForm" :model="reqParams2" inline>
        <el-form-item label="供应商：" style="margin-right: 20px;">
          <el-select v-model="reqParams2.supplierUuid" clearable filterable placeholder="请选择">
            <el-option
              v-for="item in supplierList"
              :key="item.uuid"
              :label="item.supplierName"
              :value="item.uuid"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="产品名称：" style="margin-right: 20px;">
          <el-select
            v-model="reqParams2.spuUuid"
            filterable
            clearable
            @change="getSkuList"
            placeholder="请选择"
          >
            <el-option
              v-for="item in spuList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="SKU：" style="margin-right: 20px;">
          <el-select
            v-model="reqParams2.skuUuidList"
            filterable
            multiple
            clearable
            placeholder="请选择"
          >
            <el-option
              v-for="item in skuList"
              :key="item.code"
              :label="`(${item.name})${item.extendKeyword}`"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin-right: 20px;">
          <el-button
            type="primary"
            icon="el-icon-search"
            @click="getPageList2(1)"
            v-if="reqParams2.uuid != ''"
          >搜索</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table :data="tableData2" border v-loading="childLoading" style="width: 100%">
      <el-table-column prop="date" label="序号" min-width="30" type="index" align="center"></el-table-column>
      <el-table-column prop="spuShowName" label="产品名称" min-width="30" align="center"></el-table-column>
      <el-table-column prop="skuCode" width="240" label="SKU编码" min-width="30" align="center">
        <template v-slot="{ row }">
          <span>({{ row.skuCode }}){{ row.specsName }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="skuUrl" label="SKU图片" min-width="30" align="center">
        <template v-slot="{ row, $index }">
          <el-image
            v-if="row.skuUrl"
            style="height: 30px;width: 30px;"
            :src="row.skuUrl + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
            :preview-src-list="[row.skuUrl]"
          ></el-image>
        </template>
      </el-table-column>
      <el-table-column prop="operateTypeName" label="运营申请类型" min-width="30" align="center"></el-table-column>
      <el-table-column prop="actualPurchaseNum" label="实际采购数量" min-width="30" align="center"></el-table-column>
      <el-table-column prop="actualWarehouseNum" label="当时仓库库存" min-width="30" align="center"></el-table-column>
      <el-table-column prop="actualSupplierNum" label="当时工厂库存" min-width="30" align="center"></el-table-column>
      <el-table-column prop="supplierUuidName" label="当时供应商" min-width="30" align="center"></el-table-column>
      <!-- 无值 -->
      <!-- <el-table-column prop="date" label="实际生产时间" min-width="30" align="center"></el-table-column> -->
    </el-table>
    <!-- 分页 -->
    <Pagination
      v-show="total2>0"
      :page.sync="reqParams2.page"
      :limit.sync="reqParams2.pageSize"
      :total="total2"
      @pagination="handleChnage2"
    />

    <!-- 详情 -->
    <el-dialog title="详情" :visible.sync="detailDialogVisible" width="40%">
      <el-descriptions title :column="2">
        <el-descriptions-item label="采购时间">{{ getFormaMonth(detailData.purchaseTime) }}</el-descriptions-item>
        <el-descriptions-item label="采购人">{{ detailData.purchaseUserName }}</el-descriptions-item>
        <el-descriptions-item label="采购说明">{{ detailData.purchaseDescribe }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ detailData.purchaseStatusName }}</el-descriptions-item>
        <el-descriptions-item
          v-if="detailData.purchaseExamineStatus == 3 || detailData.purchaseExamineStatus == 2"
          label="审核人"
        >{{ detailData.purchaseExamineUserName }}</el-descriptions-item>
        <el-descriptions-item label="审核状态">{{ detailData.purchaseExamineStatusName }}</el-descriptions-item>
        <el-descriptions-item
          v-if="detailData.purchaseExamineStatus == 3"
          label="驳回时间"
        >{{ getFormaMonth(detailData.purchaseCancelTime) }}</el-descriptions-item>
        <el-descriptions-item
          v-if="detailData.purchaseExamineStatus == 3"
          label="驳回原因"
        >{{ detailData.purchaseCancelReason }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
    <!-- 新增 -->

    <!-- 弹窗 -->
    <el-dialog
      :title="dialogTitle"
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
        :addPurchaseOrderLists="addPurchaseOrderLists"
        @update="handleUpdate"
      />
      <div slot="footer" class="dialog-footer">
        <el-button @click="submitTemporarily()">提交暂存</el-button>
        <el-button type="primary" @click="submitPurchasePlan()">提交</el-button>
        <!-- <el-button type="primary" @click="submitPurchasePlan(0)">暂存</el-button> -->
      </div>
    </el-dialog>
    <el-dialog :visible.sync="purchaseDetailDialog" @close="closeDetailDialog" fullscreen>
      <el-button
        type="text"
        icon="el-icon-arrow-left"
        class="dialog-back-button"
        @click="closeDetailDialog"
      >返回</el-button>
      <purchase-record-details v-if="purchaseDetailDialog"></purchase-record-details>
    </el-dialog>
  </div>
</template>

<script>
import {
  getPurchaseStatus,
  getAuditStatus,
  purchaseReviewOwnPage,
  purchaseReviewOwnRejectPage,
  skuCodeToProductCode,
  listSpuName,
  getSupplierList,
  purchaseReviewDetail,
  purchaseReviewUpdate,
  purchaseReviewSubmit,
  purchaseReviewReSubmit,
  purchaseDetail,
  getSubmitStatus,
  purchaseReviewUpdateTemp,
} from '@/api/purchasingManagement/purchaseRecord'
import { addDay, getFormaMonth, getFormatDate } from '@/utils/common'
import PurchaseDetail from '../components/PurchaseDetail'
import PurchaseRecordDetails from '../components/PurchaseRecordDetails.vue'
export default {
  components: { PurchaseDetail, PurchaseRecordDetails },
  data() {
    return {
      // 主表查询参数
      reqParams: {
        page: 1,
        pageSize: 10,
        submitStatus: 10,
        purchaseExamineStatus: 0,
        purchaseStatus: '',
        purchaseTime: '',
      },
      loading: false,
      // 选择行的索引值
      selectIndex: -1,
      // 子表查询参数
      reqParams2: {
        page: 1,
        pageSize: 10,
        skuUuidList: [],
        spuUuid: '',
        supplierUuid: '',
        uuid: '',
      },
      childLoading: false,
      // 采购状态下拉
      purchaseStatusList: [],
      // 审核状态下拉
      auditStatusList: [],
      // 提交状态下拉
      submitStatusList: [],
      // 供应商下拉
      supplierList: [],
      // 产品名称下拉
      spuList: [],
      // SKU下拉
      skuList: [],
      //
      pageStatus: 1,
      // 表格数据
      tableData: [],
      // 关联表数据
      tableData2: [],
      total: 0,
      total2: 0,
      // 详情弹窗
      detailDialogVisible: false,
      // 详情弹窗数据
      detailData: {},
      addForm: {},
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
      uuid: '',
      // 提交下单参数
      submitParams: {
        // 提交状态
        // submitStatus: 1,
      },
      dialogVisible: false,
      dialogTitle: '修改采购计划',
      // 提交状态 0：重新发起 1：修改
      submitStatus: 1,
      // 详情弹窗
      detailDialog: false,
      // 采购记录详情弹窗
      purchaseDetailDialog: false,
    }
  },
  created() {
    this.reqParams.purchaseTime = addDay(-1)
    console.log(this.reqParams.purchaseTime)
    this.getPurchaseStatusList()
    this.getSubmitStatusList()
    this.getAuditStatusList()
    this.getSupplierList()
    this.getSpuList()
    this.getPageList()
  },
  methods: {
    // 状态下拉
    async getPurchaseStatusList() {
      const res = await getPurchaseStatus()
      this.purchaseStatusList = res.data
    },
    // 审核状态下拉
    async getAuditStatusList() {
      const res = await getAuditStatus()
      this.auditStatusList = res.data
    },
    // 供应商下拉
    async getSupplierList() {
      const res = await getSupplierList()
      this.supplierList = res.data
    },
    // 产品名称下拉
    async getSpuList() {
      const res = await listSpuName()
      this.spuList = res.data
    },
    // SKU下拉
    async getSkuList() {
      this.skuList = []
      this.reqParams2.skuUuidList = []
      if (this.reqParams2.spuUuid != '') {
        const res = await skuCodeToProductCode(this.reqParams2.spuUuid)
        this.skuList = res.data
      }
    },
    // 提交状态下拉
    async getSubmitStatusList() {
      const res = await getSubmitStatus()
      this.submitStatusList = res.data
    },
    // 分页
    async getPageList(page) {
      this.loading = true
      if (page == 1) {
        this.reqParams.page = page
      }
      this.selectIndex = -1
      this.reqParams2 = this.$options.data().reqParams2
      if (this.pageStatus == 1) {
        const res = await purchaseReviewOwnPage(this.reqParams)
        this.tableData = res.data.records
        this.total = res.data.total
      } else if (this.pageStatus == 2) {
        const res = await purchaseReviewOwnRejectPage(this.reqParams)
        this.tableData = res.data.records
        this.total = res.data.total
      }
      this.tableData2 = []
      console.log(this.reqParams)
      console.log(this.total)
      this.loading = false
    },
    // 点击修改tab行颜色
    rowStyle({ row, rowIndex }) {
      if (this.selectIndex === rowIndex) {
        return {
          'background-color': 'rgb(235,240,240)',
          cursor: 'pointer',
        }
      }
      return { cursor: 'pointer' }
    },
    handleChnage({ page, limit }) {
      this.reqParams.page = page
      this.getPageList()
    },
    // 子表分页
    async getPageList2(page) {
      this.childLoading = true
      if (page == 1) {
        this.reqParams2.page = page
      }
      const res = await purchaseReviewDetail(this.reqParams2)
      this.tableData2 = res.data.records
      this.total2 = res.data.total
      this.childLoading = false
    },
    handleChnage2({ page, limit }) {
      this.reqParams2.page = page
      this.getPageList2()
    },
    // 详情弹窗
    async openDetailDialog(row) {
      const res = await purchaseDetail({ uuid: row.uuid })
      this.detailData = res.data
      console.log(this.detailData.purchaseUserName)
      this.detailDialogVisible = true
    },
    // 新增弹窗
    jumpToDetail() {
      // this.$router.push({name:'PurchaseRecordDetails'})
      this.purchaseDetailDialog = true
    },
    async handleCurrentChange(val) {
      this.selectIndex = this.tableData.indexOf(val)
      this.reqParams2.uuid = val.uuid
      this.getPageList2(1)
    },
    getFormaMonth(time) {
      return getFormaMonth(parseInt(time))
    },
    getFormatDate(timestamp) {
      return getFormatDate(timestamp)
    },
    // 打开详情弹窗
    async openDialog(row, status) {
      this.submitStatus = status
      const res = await purchaseReviewUpdate({ uuid: row.uuid })
      this.addPurchaseOrderLists = res.data.purchaseOrderPageVOList
      this.propsData.purchaseStatus = res.data.purchaseStatus
      this.propsData.purchaseTime = Number(res.data.purchaseTime)
      this.propsData.purchaseDescribe = res.data.purchaseDescribe
      this.uuid = row.uuid
      this.dialogVisible = true
    },
    // 提交采购计划
    async submitPurchasePlan() {
      this.$refs.modal.orderOutput()
      const list = this.submitParams.addPurchaseOrderLists
      console.log(this.submitParams)
      const isEmpyt = list.every((item) => item.purchaseQuantity != undefined)
      for (let i = 0; i < list.length - 1; i++) {
        for (let j = i + 1; j < list.length; j++) {
          if (
            list[i].skuUuid == list[j].skuUuid &&
            list[i].supplierUuid == list[j].supplierUuid
          ) {
            return this.$message.error('同一个SKU请选择不同的供应商')
          }
        }
      }
      if (!isEmpyt) {
        return this.$message.error('请填写每一个采购数量')
      }
      const supplier = list.every(
        (item) => item.supplierUuid != undefined && item.supplierUuid != ''
      )
      if (!supplier) {
        return this.$message.error('请选择供应商')
      }
      let res = {}
      // this.submitParams.submitStatus = status
      if (this.submitStatus == 0) {
        res = await purchaseReviewReSubmit(this.submitParams)
      } else if (this.submitStatus == 1) {
        res = await purchaseReviewSubmit(this.submitParams)
      }
      if (res.data == true) {
        this.$message.success('提交成功')
      } else {
        this.$message.error('提交失败')
      }
      console.log(res)
      this.closeDialog()
      this.getPageList(1)
    },
    // 提交暂存
    async submitTemporarily() {
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
      const res = await purchaseReviewUpdateTemp(this.submitParams)
      console.log('res', res)
      if (res.data == true) {
        this.$message.success('提交成功')
      } else {
        this.$message.error('提交失败')
      }
      this.closeDialog()
      this.getPageList()
    },
    // 获取传值并组装
    handleUpdate(value) {
      this.submitParams = {
        ...this.submitParams,
        purchaseDescribe: value.purchaseDescribe,
        addPurchaseOrderLists: value.addPurchaseOrderLists,
        uuid: this.uuid,
      }
      console.log('submitParams', this.submitParams)
    },
    // 关闭采购弹窗
    closeDialog() {
      this.dialogVisible = false
      this.propsData = this.$options.data().propsData
      this.addPurchaseOrderLists = []
      this.isDetail = false
      this.submitParams = this.$options.data().submitParams
    },
    // 关闭采购记录详情弹窗
    closeDetailDialog() {
      this.purchaseDetailDialog = false
      this.getPageList(1)
    },
  },
}
</script>

<style lang="scss" scoped>
.child-search {
  margin-top: 30px;
}
.select-width120 {
  width: 120px;
}
</style>