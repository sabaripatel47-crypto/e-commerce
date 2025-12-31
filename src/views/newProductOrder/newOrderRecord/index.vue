<template>
  <div class="app-container">
    <div class="page-search">
      <el-form :inline="true" :model="reqParams" class="demo-form-inline">
        <el-form-item label="采购日期：">
          <el-date-picker
            :clearable="false"
            v-model="reqParams.purchaseTime"
            style="width: 240px"
            value-format="timestamp"
            type="month"
            placeholder="请选择日期"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="采购名称：">
          <el-input v-model="reqParams.purchaseName" placeholder="请输入采购名称"></el-input>
        </el-form-item>
        <el-form-item label="审核状态：" style="margin-right: 20px">
          <el-select
            v-model="reqParams.purchaseExamineStatus"
            class="select-width120"
            filterable
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
        <el-form-item label="提交状态：" style="margin-right: 20px">
          <el-select v-model="reqParams.submitStatus" class="select-width120" placeholder="请选择">
            <el-option
              v-for="item in submitStatusList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="getPageList(1)">搜索</el-button>
          <el-button icon="el-icon-plus" @click="openDateDialog()">新增</el-button>
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
      v-loading="loading"
      border
      height="480"
      :row-style="rowStyle"
      @row-click="handleCurrentChange"
    >
      <el-table-column prop="date" label="序号" min-width="30" type="index" align="center"></el-table-column>
      <el-table-column prop="applyUser" label="申请人" min-width="30" align="center"></el-table-column>
      <el-table-column label="采购时间" min-width="30" align="center">
        <template v-slot="{row}">{{ getFormaMonth(row.purchaseTime) }}</template>
      </el-table-column>
      <el-table-column prop="purchaseName" label="采购名称" min-width="30" align="center"></el-table-column>
      <el-table-column prop="purchaseDescribe" label="采购说明" min-width="30" align="center"></el-table-column>
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
            @click="openEdit(scope.row)"
          >重新发起</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            v-if="scope.row.purchaseExamineStatus == 0"
            @click="openEdit(scope.row)"
          >修改</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="reqParams.page"
      :limit.sync="reqParams.pageSize"
      @pagination="getPageList"
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

    <!-- 时间选择 -->
    <el-dialog
      :visible.sync="dateDialogVisible"
      :inline="true"
      :before-close="closeDateDialog"
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
        <el-button type="primary" @click="openDetail()">确定</el-button>
      </span>
    </el-dialog>

    <NewOrderDetails
      @modalClosed="handleModalClosed"
      :propsData="propsData"
      :addPurchaseOrderLists="addPurchaseOrderLists"
      ref="newOrderDetails"
      @close="handleClose()"
    ></NewOrderDetails>

    <el-form ref="addForm" :model="reqParams2" inline style="margin-top: 40px;">
      <el-form-item label="供应商：" style="margin-right: 20px;">
        <el-select v-model="reqParams2.supplierUuid" clearable filterable clear placeholder="请选择">
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
          <el-option v-for="item in spuList" :key="item.code" :label="item.name" :value="item.code"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="SKU：" style="margin-right: 20px;">
        <el-select v-model="reqParams2.skuUuidList" filterable multiple clearable placeholder="请选择">
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
          v-if="reqParams2.uuid != ''"
        >搜索</el-button>
      </el-form-item>
    </el-form>
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
      <el-table-column label="预计销售" min-width="30" align="left">
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
  getSubmitStatus,
  newOrderRecordList,
  newOrderRecordReject,
  newOrderRecordDetail,
  newOrderRecordDetailChild,
  getNewOrderDetail,
} from '@/api/newProductOrder/newOrderRecord'
import {
  getAuditStatus,
  getSupplierList,
  listSpuName,
  skuCodeToProductCode,
} from '@/api/newProductOrder/common'
import NewOrderDetails from '../components/NewOrderDetails'
import { addDay, getFormaMonth } from '@/utils/common'
export default {
  name: 'newOrderRecord',
  data() {
    return {
      // 审核状态
      auditStatusList: [],
      // 提交状态
      submitStatusList: [],
      // 全部/我的驳回切换 1：全部 2：我的驳回
      pageStatus: 1,
      // 主表请求参数
      reqParams: {
        page: 1,
        pageSize: 10,
        purchaseExamineStatus: 0,
        purchaseName: '',
        purchaseTime: '',
        submitStatus: 10,
      },
      // 加载
      loading: false,
      // 主表数据
      tableData: [],
      // 主表数据条数
      total: 0,
      // 选择行的索引值
      selectIndex: -1,
      // 详情数据
      detailData: {},
      // 详情弹窗
      detailDialogVisible: false,
      // 详情弹窗数据
      propsData: {
        purchaseTime: '',
        // 新增或修改
        type: 1,
        purchaseDescribe: '',
        purchaseName: '',
        purchaseStatus: 0,
        purchaseStatusName: '',
        uuid: '',
        totalWeek: '',
      },
      // 时间弹窗
      dateDialogVisible: false,
      // 修改和重新发起时获取的数据
      addPurchaseOrderLists: [],

      // 供应商下拉
      supplierList: [],
      // 产品名称下拉
      spuList: [],
      // SKU下拉
      skuList: [],
      // 子表请求参数
      reqParams2: {
        skuUuidList: [],
        spuUuid: '',
        supplierUuid: '',
        uuid: '',
      },
      // 子表详情
      detailChildData: [],
      // 子表加载
      childLoading: false,
    }
  },
  components: {
    NewOrderDetails,
  },
  created() {
    this.reqParams.purchaseTime = addDay(-1)
    this.getAuditStatusList()
    this.getSubmitStatusList()
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
    // 提交状态下拉
    async getSubmitStatusList() {
      const res = await getSubmitStatus()
      this.submitStatusList = res.data
    },
    async getPageList(page) {
      this.loading = true
      if (page == 1) {
        this.reqParams.page = 1
      }
      this.selectIndex = -1
      let res = {}
      this.reqParams2 = this.$options.data().reqParams2
      this.detailChildData = []
      if (this.pageStatus == 1) {
        res = await newOrderRecordList(this.reqParams)
      } else if (this.pageStatus == 2) {
        res = await newOrderRecordReject(this.reqParams)
      }
      this.tableData = res.data.records
      this.total = res.data.total
      this.loading = false
    },
    getFormaMonth(time) {
      return getFormaMonth(parseInt(time))
    },
    // // 打开详情弹窗
    async openDetailDialog(row) {
      const res = await newOrderRecordDetail({ uuid: row.uuid })
      this.detailData = res.data
      this.detailDialogVisible = true
    },
    openDetail() {
      this.propsData.type = 1
      this.$refs.newOrderDetails.openDialog()
      this.dateDialogVisible = false
    },
    async openEdit(row) {
      const res = await getNewOrderDetail(row.uuid)
      this.propsData = this.$options.data().propsData
      this.addPurchaseOrderLists = []
      this.addPurchaseOrderLists = res.data.newProductsReviewListVOS
      this.propsData.type = row.purchaseExamineStatus
      this.propsData.totalWeek = res.data.totalWeek
      this.propsData.purchaseDescribe = res.data.purchaseDescribe
      this.propsData.purchaseName = res.data.purchaseName
      this.propsData.purchaseStatus = res.data.purchaseStatus
      this.propsData.purchaseStatusName = res.data.purchaseStatusName
      this.propsData.uuid = res.data.uuid
      this.propsData.purchaseTime = res.data.purchaseTime
      this.$nextTick(() => {
        this.$refs.newOrderDetails.openDialog() // 在 DOM 更新后修改数据
      })
    },
    // 弹窗关闭后事件
    handleClose() {},
    openDateDialog() {
      this.propsData = this.$options.data().propsData
      this.addPurchaseOrderLists = []
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
      this.dateDialogVisible = false
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
      this.reqParams2.skuUuidList = []
      if (this.reqParams2.spuUuid != '') {
        const res = await skuCodeToProductCode(this.reqParams2.spuUuid)
        this.skuList = res.data
      }
    },
    // 点击获取子表数据
    handleCurrentChange(row) {
      this.selectIndex = this.tableData.indexOf(row)
      this.reqParams2.uuid = row.uuid
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
      const res = await newOrderRecordDetailChild(this.reqParams2)
      this.detailChildData = res.data
      this.childLoading = false
    },
    handleModalClosed() {
      this.getPageList(1)
    },
  },
}
</script>

<style scoped>
.select-width120 {
  width: 120px;
}
</style>
