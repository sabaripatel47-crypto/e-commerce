<template>
  <div class="app-container">
    <div class="page-search">
      <el-form :inline="true" :model="reqParams" class="demo-form-inline">
        <el-form-item label="采购时间">
          <el-date-picker
            :clearable="false"
            v-model="reqParams.purchaseTime"
            style="width: 240px"
            value-format="timestamp"
            type="month"
            placeholder="请选择日期"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="状态：" style="margin-right: 20px;">
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
        <el-form-item style="margin-right: 20px;">
          <el-button type="primary" icon="el-icon-search" @click="getPurchaseAuditList(1)">搜索</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-radio-group v-model="pageStatus" @change="getPurchaseAuditList(1)">
      <el-radio-button :label="2">全部</el-radio-button>
      <el-radio-button :label="1">待审核</el-radio-button>
    </el-radio-group>
    <el-table
      :data="tableData"
      v-loading="loading"
      :row-style="rowStyle"
      style="width: 100%"
      border
      height="480"
      @row-click="handleCurrentChange"
    >
      <el-table-column prop="date" label="序号" min-width="30" type="index" align="center"></el-table-column>
      <el-table-column label="采购时间" align="center">
        <template v-slot="{row}">
          <span>{{ getFormaMonth(row.purchaseTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="purchaseUserName" label="采购人" align="center"></el-table-column>
      <el-table-column prop="purchaseDescribe" show-overflow-tooltip label="采购说明" align="center"></el-table-column>
      <el-table-column prop="purchaseStatusName" label="状态" align="center"></el-table-column>
      <el-table-column prop="purchaseExamineStatusName" label="审核状态" align="center"></el-table-column>
      <el-table-column label="操作" align="center">
        <template v-slot="{row}">
          <el-button size="mini" type="text" icon="el-icon-view" @click="handleDetail(row)">详情</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-check"
            v-if="row.purchaseExamineStatus == 1 || row.purchaseExamineStatus == 4"
            @click="handlePass(row)"
          >通过</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-close"
            v-if="row.purchaseExamineStatus == 1 || row.purchaseExamineStatus == 4"
            @click="handleRejectDialog(row)"
          >驳回</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="reqParams.page"
      :limit.sync="reqParams.pageSize"
      @pagination="getPurchaseAuditList"
      layout="total, prev, pager, next, jumper"
    />
    <div style="margin-top: 30px;">
      <el-form ref="addForm" :model="childReqParams" inline>
        <el-form-item label="供应商:" style="margin-right: 20px;">
          <el-select
            v-model="childReqParams.supplierUuid"
            filterable
            clearable
            clear
            placeholder="请选择"
          >
            <el-option
              v-for="item in supplierList"
              :key="item.uuid"
              :label="item.supplierName"
              :value="item.uuid"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="产品名称:" style="margin-right: 20px;">
          <el-select
            v-model="childReqParams.spuUuid"
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
        <el-form-item label="SKU:" filterable style="margin-right: 20px;">
          <el-select
            v-model="childReqParams.skuUuidList"
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
            @click="getChildDetail(1)"
            v-if="childReqParams.uuid != ''"
          >搜索</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 子集数据表 -->
    <el-table :data="childTableData" v-loading="childLoading" border style="width: 100%" @row-click>
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
      <el-table-column label="操作" min-width="30" align="center">
        <template v-slot="{ row }">
          <el-button type="text" @click="itemDetailSku(row)">sku明细</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <pagination
      v-show="childTotal> 0"
      :total="childTotal"
      :page.sync="childReqParams.page"
      :limit.sync="childReqParams.pageSize"
      @pagination="getChildDetail"
      layout="total, prev, pager, next, jumper"
    />
    <!-- 详情弹窗 -->
    <el-dialog title="详情" :visible.sync="detailDialog" width="40%">
      <el-descriptions label-width="100px" title :column="2">
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
    <!-- 驳回弹窗 -->
    <el-dialog title="驳回" @close="closeRejectDialog()" :visible.sync="rejectDialog" width="30%">
      <el-form :model="rejectParams" :rules="rejectRules" ref="rejectForm" label-width="100px">
        <el-form-item label="驳回原因：" prop="purchaseCancelReason">
          <el-input v-model="rejectParams.purchaseCancelReason" type="textarea" :rows="3"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeRejectDialog()">取消</el-button>
        <el-button type="primary" @click="handleReject">确定</el-button>
      </div>
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
  purchaseAuditList,
  purchaseAuditListPending,
  purchaseReject,
  purchasePass,
  purchaseDetail,
  purchaseChildDetail,
  getPurchaseStatus,
  listSpuName,
  getSupplierList,
  skuCodeToProductCode,
} from '@/api/purchasingManagement/purchaseAudit'
import { addDay, getFormaMonth } from '@/utils/common'
import StatisticsSpu from '@/views/bulletinboard/statistics/components/StatisticsSpu.vue'

export default {
  name: 'PurchaseAudit',
  data() {
    return {
      // 请求参数
      reqParams: {
        page: 1,
        pageSize: 10,
        purchaseStatus: '',
        purchaseTime: '',
      },
      // 表格数据
      tableData: [],
      loading: false,
      total: 0,
      // 选择行的索引值
      selectIndex: -1,
      // 子集请求参数
      childReqParams: {
        page: 1,
        pageSize: 10,
        skuUuidList: [],
        supplierUuid: '',
        uuid: '',
      },
      childTotal: 0,
      // 子集表格数据
      childTableData: [],
      childLoading: false,
      // 详情弹窗
      detailDialog: false,
      // 状态下拉
      purchaseStatusList: [],
      pageStatus: 2,
      // 详情数据
      detailData: {},
      // 驳回弹窗
      rejectDialog: false,
      // 驳回参数
      rejectParams: {
        uuid: '',
        purchaseCancelReason: '',
      },
      // 供应商下拉
      supplierList: [],
      // 产品名称下拉
      spuList: [],
      // SKU下拉
      skuList: [],
      rejectRules: {
        purchaseCancelReason: [
          { required: true, message: '请输入驳回原因', trigger: 'blur' },
        ],
      },
      rowData: {},
      spuOrsku: 'sku',
      detailTitle: 'sku明细',
      // sku明细状态
      spuDetailStatus: false,
    }
  },
  components: {
    StatisticsSpu,
  },
  created() {
    this.reqParams.purchaseTime = addDay(-1)
    this.getPurchaseStatusList()
    this.getPurchaseAuditList()
    this.getSupplierList()
    this.getSpuList()
  },
  methods: {
    // 状态下拉
    async getPurchaseStatusList() {
      const res = await getPurchaseStatus()
      this.purchaseStatusList = res.data
    },
    // 审核列表
    async getPurchaseAuditList(page) {
      this.loading = true
      if (page == 1) {
        this.reqParams.page = page
      }
      this.selectIndex = -1
      this.childReqParams = this.$options.data().childReqParams
      let res = []
      if (this.pageStatus == 1) {
        res = await purchaseAuditListPending(this.reqParams)
      } else if (this.pageStatus == 2) {
        res = await purchaseAuditList(this.reqParams)
      }
      this.tableData = res.data.records
      this.total = res.data.total
      this.childTableData = []
      this.loading = false
      // console.log(this.tableData)
    },
    // 时间戳转日期
    getFormaMonth(time) {
      return getFormaMonth(parseInt(time))
    },
    //审核通过
    async handlePass(row) {
      const res = await purchasePass({ uuid: row.uuid })
      if (res.data == true) {
        this.$message.success('审核通过成功')
        this.getPurchaseAuditList()
      } else {
        this.$message.error('审核通过失败')
      }
    },
    // 打开驳回弹窗
    async handleRejectDialog(row) {
      this.rejectParams.purchaseCancelReason = ''
      this.rejectParams.uuid = row.uuid
      this.rejectDialog = true
    },
    // 驳回
    async handleReject() {
      if (!this.rejectParams.purchaseCancelReason) {
        this.$message.error('请输入驳回原因')
        return
      }
      const res = await purchaseReject(this.rejectParams)
      if (res.data == true) {
        this.$message.success('驳回成功')
        this.closeRejectDialog()
        this.getPurchaseAuditList()
      } else {
        this.$message.error('驳回失败')
      }
    },
    closeRejectDialog() {
      this.rejectDialog = false
      this.$refs.rejectForm.clearValidate()
      this.detailData = this.$options.data().detailData
      this.rejectParams = this.$options.data().rejectParams
    },
    // 查看详情
    async handleDetail(row) {
      const res = await purchaseDetail({ uuid: row.uuid })
      this.detailData = res.data
      this.detailDialog = true
    },
    // 查看子集
    async getChildDetail(page) {
      this.childLoading = true
      if (page == 1) {
        this.childReqParams.page = page
      }
      const res = await purchaseChildDetail(this.childReqParams)
      this.childTableData = res.data.records
      this.childTotal = res.data.total
      this.childLoading = false
    },
    handleCurrentChange(row) {
      this.selectIndex = this.tableData.indexOf(row)
      this.childReqParams.uuid = row.uuid
      this.getChildDetail(1)
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
      this.childReqParams.skuUuidList = []
      if (this.childReqParams.spuUuid != '') {
        const res = await skuCodeToProductCode(this.childReqParams.spuUuid)
        this.skuList = res.data
      }
    },
    // sku明细
    itemDetailSku(row) {
      const rowDataAss = Object.assign(row, {
        timeArr: [addDay(-7), addDay(-1)],
      })

      this.rowData = rowDataAss
      this.spuOrsku = 'sku'
      this.detailTitle = 'sku明细'
      this.spuDetailStatus = true
    },
    // 关闭明细
    detailStatus() {
      this.spuDetailStatus = false
    },
  },
}
</script>

<style lang="scss" scoped>
.select-width120 {
  width: 120px;
}
</style>