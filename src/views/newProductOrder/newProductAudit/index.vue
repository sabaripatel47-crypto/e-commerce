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
        <el-form-item label="审核状态：" style="margin-right: 20px;">
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
        <el-form-item style="margin-right: 20px;">
          <el-button type="primary" icon="el-icon-search" @click="getPageList(1)">搜索</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-radio-group v-model="pageStatus" @change="getPageList(1)">
      <el-radio-button :label="1">全部</el-radio-button>
      <el-radio-button :label="2">待审核</el-radio-button>
    </el-radio-group>
    <el-table
      :data="tableData"
      v-loading="loading"
      height="480"
      style="width: 100%"
      border
      :row-style="rowStyle"
      @row-click="handleCurrentChange"
    >
      <!--  -->
      <el-table-column prop="date" label="序号" min-width="30" type="index" align="center"></el-table-column>
      <el-table-column label="采购时间" align="center">
        <template v-slot="{row}">
          <span v-if="row.purchaseTime != null">{{ getFormaMonth(+row.purchaseTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="purchaseUserName" label="采购人" align="center"></el-table-column>
      <el-table-column prop="purchaseDescribe" show-overflow-tooltip label="采购说明" align="center"></el-table-column>
      <el-table-column prop="submitStatusName" label="状态" align="center"></el-table-column>
      <el-table-column prop="purchaseExamineStatusName" label="审核状态" align="center"></el-table-column>
      <el-table-column label="操作" align="center">
        <template v-slot="{row}">
          <el-button size="mini" type="text" icon="el-icon-view" @click="handleDetail(row)">详情</el-button>
          <el-button
            v-if="row.purchaseExamineStatus == 1 || row.purchaseExamineStatus == 4"
            size="mini"
            type="text"
            icon="el-icon-check"
            @click="handlePass(row)"
          >通过</el-button>
          <el-button
            v-if="row.purchaseExamineStatus == 1 || row.purchaseExamineStatus == 4"
            size="mini"
            type="text"
            icon="el-icon-close"
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
      @pagination="getPageList"
    />

    <el-dialog title="详情" :visible.sync="detailDialogVisible" width="30%">
      <el-descriptions title :column="1">
        <el-descriptions-item label="采购时间">{{ getFormaMonth(detailData.purchaseTime) }}</el-descriptions-item>
        <el-descriptions-item label="采购人">{{ detailData.purchaseUserName }}</el-descriptions-item>
        <el-descriptions-item label="采购说明">{{ detailData.purchaseDescribe }}</el-descriptions-item>
        <!-- <el-descriptions-item label="状态">{{ detailData.purchaseStatusName }}</el-descriptions-item> -->
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
    <el-dialog title="驳回" :visible.sync="rejectDialog" @close="closeHandleReject" width="30%">
      <el-form label-width="100px" ref="editForm" :rules="rejectRules">
        <el-form-item label="驳回原因：" prop="purchaseCancelReason">
          <el-input v-model="rejectParams.purchaseCancelReason" type="textarea" :rows="3"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeHandleReject">取消</el-button>
        <el-button type="primary" @click="handleReject">确定</el-button>
      </div>
    </el-dialog>

    <div style="margin-top: 30px;">
      <el-form ref="addForm" :model="childReqParams" inline>
        <el-form-item label="供应商：" style="margin-right: 20px;">
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
        <el-form-item label="产品名称：" style="margin-right: 20px;">
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
        <el-form-item label="SKU：" filterable style="margin-right: 20px;">
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
            @click="getDetailChildList()"
            v-if="childReqParams.uuid != ''"
          >搜索</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table :data="detailChildData" style="width: 100%" border v-loading="childLoading">
      <el-table-column prop="date" label="序号" min-width="30" type="index" align="center"></el-table-column>
      <el-table-column prop="spuShowName" label="产品名称" min-width="30" align="center"></el-table-column>
      <el-table-column label="SKU编码" min-width="30" align="center">
        <template slot-scope="scope">
          <span>({{ scope.row.skuCode }}){{ scope.row.specsName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="SKU图片" min-width="30" align="center">
        <template v-slot="{ row, $index }">
          <el-image
            v-if="row.skuUrl"
            style="height: 30px;width: 30px;"
            :src="row.skuUrl + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
            :preview-src-list="[row.skuUrl]"
          ></el-image>
        </template>
      </el-table-column>
      <el-table-column prop="mainSupplierName" label="当时供应商" min-width="30" align="center"></el-table-column>
      <el-table-column prop="purchaseQuantity" label="采购数量" min-width="30" align="center"></el-table-column>
      <el-table-column label="预计销售" min-width="30" align="center">
        <template v-slot="{ row, $index }">
          <span v-for="(item,index) in row.planSalesQuantityList" :key="index">
            {{ item }}
            <br />
          </span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import {
  getAuditStatus,
  getSupplierList,
  listSpuName,
  skuCodeToProductCode,
} from '@/api/newProductOrder/common'
import {
  newProductAuditList,
  newProductAuditWaitList,
  newOrderRecordDetail,
  newProductAuditPass,
  newProductAuditNoPass,
  newOrderRecordDetailChild,
} from '@/api/newProductOrder/newProductAudit'
import { addDay, getFormaMonth } from '@/utils/common'
export default {
  name: 'NewProductAudit',
  data() {
    return {
      // 请求参数
      reqParams: {
        page: 1,
        pageSize: 10,
        purchaseExamineStatus: 0,
        purchaseTime: '',
      },
      pageStatus: 1,
      // 表格数据
      tableData: [],
      total: 0,
      // 选择行的索引值
      selectIndex: -1,
      // 子集请求参数
      childReqParams: {
        skuUuidList: [],
        supplierUuid: '',
        uuid: '',
      },
      childTotal: 0,
      skuList: [],
      auditStatusList: [],
      detailData: {},
      detailDialogVisible: false,
      rejectDialog: false,
      rejectParams: {
        purchaseCancelReason: '',
        uuid: '',
      },
      detailChildData: [],
      childLoading: false,
      supplierList: [],
      spuList: [],
      rejectRules: {
        purchaseCancelReason: [
          { required: true, message: '请输入驳回原因', trigger: 'blur' },
        ],
      },
    }
  },
  created() {
    this.reqParams.purchaseTime = addDay(-1)
    this.getAuditStatusList()
    this.getSupplierList()
    this.getSpuList()
    this.getPageList(1)
  },
  methods: {
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
      this.childReqParams.skuUuidList = []
      if (this.childReqParams.spuUuid != '') {
        const res = await skuCodeToProductCode(this.childReqParams.spuUuid)
        this.skuList = res.data
      }
    },
    // 新品下单列表
    async getPageList(page) {
      this.loading = true
      if (page == 1) {
        this.reqParams.page = 1
      }
      this.selectIndex = -1
      this.detailChildData = []
      this.childReqParams = this.$options.data().childReqParams
      let res = {}
      if (this.pageStatus == 1) {
        res = await newProductAuditList(this.reqParams)
      } else {
        res = await newProductAuditWaitList(this.reqParams)
      }

      this.tableData = res.data.records
      this.total = res.data.total
      this.loading = false
    },
    // 时间戳转日期
    getFormaMonth(time) {
      return getFormaMonth(parseInt(time))
    },
    //     // 查看详情
    async handleDetail(row) {
      const res = await newOrderRecordDetail({ uuid: row.uuid })
      this.detailData = res.data
      this.detailDialogVisible = true
    },
    // 审核通过
    async handlePass(row) {
      const res = await newProductAuditPass({ uuid: row.uuid })
      if (res.data == true) {
        this.$message.success('审核通过')
        this.getPageList(1)
      } else {
        this.$message.error('审核失败')
      }
    },
    // 审核不通过弹窗
    async handleRejectDialog(row) {
      this.rejectParams.purchaseCancelReason = ''
      this.rejectParams.uuid = row.uuid
      this.rejectDialog = true
    },
    async handleReject() {
      const res = await newProductAuditNoPass(this.rejectParams)
      if (res.data == true) {
        this.$message.success('驳回成功')
        this.getPageList(1)
        this.closeHandleReject()
      } else {
        this.$message.error('驳回失败')
      }
    },
    closeHandleReject() {
      this.$refs.editForm.clearValidate()
      this.rejectDialog = false
    },
    handleCurrentChange(row) {
      this.selectIndex = this.tableData.indexOf(row)
      this.childReqParams.uuid = row.uuid
      this.getDetailChildList()
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
    // 获取子表详情
    async getDetailChildList() {
      this.childLoading = true
      const res = await newOrderRecordDetailChild(this.childReqParams)
      this.detailChildData = res.data
      this.childLoading = false
    },
  },
}
</script>

<style>
</style>