<template>
  <div class="app-container">
    <div class="container">
      <el-form class="page-search" inline>
        <!--时间范围 -->
        <el-form-item label="登记日期：" style="margin-right: 20px;">
          <el-date-picker
            v-model="dateRange"
            :clearable="false"
            type="daterange"
            align="right"
            unlink-panels
            value-format="timestamp"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="订单号：" style="margin-right: 20px;">
          <el-input
            placeholder="请输入订单号"
            v-model="searchReq.originalOrderId"
            clearable
            class="handle-input"
          ></el-input>
        </el-form-item>
        <el-form-item label="平台：" style="margin-right: 20px;">
          <el-select v-model="searchReq.platform" placeholder="请选择平台" clearable>
            <el-option
              v-for="item in platforms"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="店铺名称：" prop="storeUuid" style="margin-right: 20px;">
          <el-select filterable v-model="searchReq.storeUuid" placeholder="请选择店铺" clearable>
            <el-option
              v-for="item in stores"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态：" prop="invoiceStatus" style="margin-right: 20px;">
          <el-select
            filterable
            v-model="searchReq.invoiceStatus"
            placeholder="请选择状态"
            multiple
            clearable
          >
            <el-option
              v-for="item in invoiceStatusList"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin-right: 20px;">
          <el-checkbox v-model="searchReq.isVoid">显示作废</el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="getInvoiceList(1)">搜索</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-plus" @click="addInvoiceRegister">新增</el-button>
        </el-form-item>
      </el-form>

      <el-radio-group v-model="tabModel" @change="changeTabModel">
        <el-radio-button :label="1">全部</el-radio-button>
        <el-radio-button :label="2">我的驳回</el-radio-button>
      </el-radio-group>

      <el-table
        v-loading="loading"
        :max-height="tabHeight"
        :data="invoiceList"
        row-key="uuid"
        :tree-props="{children: 'children'}"
        :header-cell-style="{'text-align':'center'}"
      >
        <el-table-column prop="createTime" label="登记时间" align="center" width="120">
          <template v-slot="{ row }">
            {{
            getFormatDateFun(row.createTime)
            }}
          </template>
        </el-table-column>
        <!-- <el-table-column prop="createUser" label="登记人" align="center" width="80" show-overflow-tooltip></el-table-column> -->
        <el-table-column label="平台/店铺" min-width="140">
          <template v-slot="{ row }">
            <div
              v-for="item in row.storeInfo"
              :key="item.uuid"
            >{{ item.platformName + "-（" + item.storeCode + "）" + item.storeName }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="invoiceTypeName" label="发票类型" align="center" width="75"></el-table-column>
        <el-table-column label="订单号" align="center" min-width="140">
          <template v-slot="{ row }">
            <div v-for="(item,index) in row.originalOrderIdSet" :key="item">{{ item }}</div>
          </template>
        </el-table-column>
        <el-table-column label="产品名称" align="center" show-overflow-tooltip>
          <template v-slot="{ row }">
            <div v-for="item in row.spuNameSet" :key="item">{{ item }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" align="center" width="75"></el-table-column>
        <el-table-column prop="amount" label="金额" align="center" width="100"></el-table-column>
        <el-table-column label="发票资料" min-width="200">
          <template v-slot="{ row }">
            <div v-for="item in row.invoiceInfos" :key="item">{{ item }}</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="enterpriseName"
          label="开票公司"
          min-width="140"
          show-overflow-tooltip
          align="center"
        ></el-table-column>
        <el-table-column prop="remark" label="备注" align="center"></el-table-column>
        <el-table-column prop="invoiceStatusName" label="状态" align="center" min-width="90"></el-table-column>
        <el-table-column label="操作" width="160" align="center">
          <template v-slot="{ row }">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-view"
              @click="detail(row.uuid)"
              v-if="row.children && row.children.length>0"
            >详情</el-button>
            <!--未开票、驳回、驳回后提交状态并且不是作废才可修改发票-->
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="editInvoiceRegister(row.uuid)"
              v-if="(invoiceStatusEnum.NOT_INVOICED === row.invoiceStatus || invoiceStatusEnum.SUBMITTED === row.invoiceStatus || invoiceStatusEnum.SUBMITTED_AFTER_REJECTION === row.invoiceStatus) && invoiceVoidEnum.NOT_VOID === row.invoiceVoid"
            >修改</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="cancelInvoiceRegister(row.uuid)"
              v-if="(invoiceStatusEnum.NOT_INVOICED === row.invoiceStatus || invoiceStatusEnum.SUBMITTED === row.invoiceStatus || invoiceStatusEnum.SUBMITTED_AFTER_REJECTION === row.invoiceStatus) && invoiceVoidEnum.NOT_VOID === row.invoiceVoid"
            >作废</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="searchReq.page"
          :limit.sync="searchReq.pageSize"
          @pagination="getInvoiceList()"
        />
      </div>

      <!-- 新增/修改发票登记弹窗 -->
      <el-dialog
        :title="isEdit ? '修改发票登记' : '新增发票登记'"
        :visible.sync="invoiceAddDetailShow"
        width="60%"
        :before-close="addCloseDetail"
        :close-on-click-modal="false"
      >
        <el-form
          label-width="120px"
          label-position="right"
          :model="invoiceAddDetailReqParams"
          :rules="invoiceAddDetailRules"
          ref="invoiceAddDetailRef"
        >
          <el-row>
            <el-col :span="12">
              <el-form-item label="公司：" prop="enterpriseUuid">
                <el-select
                  class="form-item"
                  clearable
                  v-model="invoiceAddDetailReqParams.enterpriseUuid"
                  placeholder="请选择公司"
                >
                  <el-option
                    v-for="item in companys"
                    :label="item.name"
                    :value="item.code"
                    :key="item.code"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="发票类型：" prop="invoiceType">
                <el-select
                  class="form-item"
                  filterable
                  v-model="invoiceAddDetailReqParams.invoiceType"
                  placeholder="请选择发票类型"
                >
                  <el-option
                    v-for="item in invoiceType"
                    :label="item.name"
                    :value="item.code"
                    :key="item.code"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="发票资料：" prop="invoiceInfo">
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 2}"
                  class="form-item"
                  placeholder="请输入发票资料"
                  v-model="invoiceAddDetailReqParams.invoiceInfo"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="备注：" prop="remark">
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 2}"
                  class="form-item"
                  placeholder="请输入备注"
                  v-model="invoiceAddDetailReqParams.remark"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-button type="primary" @click="addOrderRow">添加订单</el-button>
          <el-table
            v-loading="orderLoading"
            :max-height="tabHeight"
            :data="orderList"
            show-summary
            :summary-method="getSummaries"
          >
            <el-table-column prop="date" label="序号" min-width="30" type="index"></el-table-column>
            <el-table-column prop="originalOrderId" label="订单号" align="center">
              <template v-slot="{ row, $index }">
                <el-input
                  placeholder="请输入订单号"
                  @input="orderChange($index)"
                  v-model="row.originalOrderId"
                ></el-input>
                <div>{{ row.orderErrorMsg }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="platformName" label="所属平台" align="center" width="80"></el-table-column>
            <el-table-column prop="storeName" label="店铺名称" align="center" width="150"></el-table-column>
            <el-table-column label="产品名称" align="center" show-overflow-tooltip>
              <template v-slot="{ row }">
                <div v-for="item in row.spuNameList" :key="item">{{ item }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" align="center" width="80"></el-table-column>
            <el-table-column prop="amount" label="金额" align="center" width="80"></el-table-column>
            <el-table-column label="操作" width="180" align="center">
              <template v-slot="{ row, $index }">
                <el-button
                  size="mini"
                  type="text"
                  icon="el-icon-delete"
                  @click="detailRowDelete($index)"
                >删 除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="addCloseDetail">取 消</el-button>
          <el-button type="primary" size="small" @click="submitAddForm">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 详情弹窗 -->
      <el-dialog
        title="详情"
        :visible.sync="invoiceDetailShow"
        width="60%"
        :before-close="invoiceCloseDetail"
        :close-on-click-modal="false"
      >
        <el-descriptions :column="2">
          <el-descriptions-item label="公司">{{ detailReqParams.enterpriseName }}</el-descriptions-item>
          <el-descriptions-item label="发票类型">{{ detailReqParams.invoiceTypeName }}</el-descriptions-item>
          <el-descriptions-item label="数量">{{ detailReqParams.quantity }}</el-descriptions-item>
          <el-descriptions-item label="金额">{{ detailReqParams.amount }}</el-descriptions-item>
          <el-descriptions-item label="发票资料">
            <template>
              <div>
                <div v-for="item in detailReqParams.invoiceInfos" :key="item">{{ item }}</div>
              </div>
            </template>
          </el-descriptions-item>
          <el-descriptions-item label="备注">{{ detailReqParams.remark }}</el-descriptions-item>
          <el-descriptions-item label="登记人">{{ detailReqParams.createUser }}</el-descriptions-item>
          <el-descriptions-item label="登记时间">{{ getFormatDateFun(detailReqParams.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="处理人">{{ detailReqParams.processorsUser }}</el-descriptions-item>
          <el-descriptions-item label="处理时间">{{ getFormatDateFun(detailReqParams.processorsTime) }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ detailReqParams.invoiceStatusName }}</el-descriptions-item>
          <el-descriptions-item
            label="作废原因"
            v-if="invoiceVoidEnum.CUSTOMER_VOID === detailReqParams.invoiceVoid || invoiceVoidEnum.FINANCE_VOID === detailReqParams.invoiceVoid"
          >{{ detailReqParams.voidReason }}</el-descriptions-item>
          <el-descriptions-item
            label="驳回原因"
            v-if="invoiceStatusEnum.SUBMITTED === detailReqParams.invoiceStatus || invoiceStatusEnum.SUBMITTED_AFTER_REJECTION === detailReqParams.invoiceStatus"
          >{{ detailReqParams.overruleReason }}</el-descriptions-item>
        </el-descriptions>
        <el-table
          :max-height="tabHeight"
          :data="detailOrderList"
          show-summary
          :summary-method="getSummaries"
        >
          <el-table-column prop="date" label="序号" min-width="30" type="index"></el-table-column>
          <el-table-column prop="originalOrderId" label="订单号" align="center"></el-table-column>
          <el-table-column prop="platformName" label="所属平台" align="center" width="80"></el-table-column>
          <el-table-column prop="storeName" label="店铺名称" align="center" width="150"></el-table-column>
          <el-table-column label="产品名称" align="center" show-overflow-tooltip>
            <template v-slot="{ row }">
              <div v-for="item in row.spuNameList" :key="item">{{ item }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" align="center" width="80"></el-table-column>
          <el-table-column prop="amount" label="金额" align="center" width="80"></el-table-column>
        </el-table>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" size="small" @click="invoiceCloseDetail">关 闭</el-button>
        </span>
      </el-dialog>

      <!--作废弹窗-->
      <el-dialog :visible.sync="cancellationShow" width="30%" :before-close="closeCancellation">
        <el-form
          label-width="80px"
          label-position="right"
          :model="cancellationData"
          :rules="cancellationRule"
          ref="cancellationRef"
        >
          <el-form-item label="作废理由" prop="voidReason">
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4}"
              show-word-limit
              maxlength="50"
              placeholder="请输入原因"
              v-model="cancellationData.voidReason"
            ></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="closeCancellation">取 消</el-button>
          <el-button type="primary" size="small" @click="submitCancellation">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import {
  listPlatform,
  listStore,
  listCompany,
  listInvoiceType,
  listInvoiceStatus,
} from '@/api/baseData/common'

import { getFormatDate } from '@/utils/common'

import { debounce } from 'lodash'

import {
  customerList,
  customerAdd,
  orderNumberDetails,
  details,
  customerRejectedList,
  customerUpdate,
  customerVoid,
  submittedAfterRejection,
} from '@/api/afterSales/invoiceRegister'

import { addDay, addDayEnd } from '@/utils/common.js'

export default {
  name: 'InvoiceRegister',
  data() {
    return {
      //作废状态
      invoiceVoidEnum: {
        NOT_VOID: 0, //未作废
        CUSTOMER_VOID: 1, //客服作废
        FINANCE_VOID: 3, //财务作废
      },

      invoiceStatusEnum: {
        NOT_INVOICED: 0, //未开票
        INVOICED: 1, //已开票
        SUBMITTED: 2, //驳回
        SUBMITTED_AFTER_REJECTION: 3, //驳回后提交
      },

      //发票登记tab
      tabModelEnum: {
        all: 1, //全部
        rejected: 2, //驳回
      },

      //开始时间和结束时间
      INIT_TIME_START: null,
      INIT_TIME_END: null,

      tabHeight: 600,

      //分页总条数
      total: 0,

      //查询条件
      searchReq: {
        //是否显示作废,true只显示作废，false不显示作废
        isVoid: false,
        pageSize: 20,
      },

      //时间组件的筛选
      dateRange: [],

      //平台下拉框的值
      platforms: [],

      //店铺下拉框的值
      stores: [],

      //状态下拉框的值
      invoiceStatusList: [],

      //公司下拉框的值
      companys: [],

      //发票类型下拉框的值
      invoiceType: [],

      //表格的加载动画
      loading: false,

      //详情的订单表格的加载动画
      orderLoading: false,

      //发票登记列表
      invoiceList: [],

      //tab切换的数据源
      tabModel: 1,

      //新增/修改的弹窗的标记
      invoiceAddDetailShow: false,

      //新增的弹窗是新增还是修改的标记
      isEdit: false,

      //新增/修改提交的数据源
      invoiceAddDetailReqParams: {
        originalOrderIdList: [],
        invoiceType: 1,
      },

      //新增/修改的弹窗的订单列表的数据源
      orderList: [],

      //详情的弹窗里订单列表的数据源
      detailOrderList: [],

      //详情弹窗的标记
      invoiceDetailShow: false,

      //详情弹窗的数据源
      detailReqParams: {},

      //作废的弹窗标记
      cancellationShow: false,

      //作废弹窗的数据源
      cancellationData: {},

      //新增/修改的必填校验
      invoiceAddDetailRules: {
        invoiceType: [
          { required: true, message: '请输入发票类型', trigger: 'blur' },
        ],
        invoiceInfo: [
          { required: true, message: '请输入发票资料', trigger: 'blur' },
        ],
      },

      //作废的必填校验
      cancellationRule: {
        voidReason: [
          { required: true, message: '请输入作废原因', trigger: 'blur' },
        ],
      },
    }
  },
  created() {
    this.INIT_TIME_START = addDay(0)
    this.INIT_TIME_END = addDayEnd(0)

    //设置查询的默认时间
    this.dateRange = [this.INIT_TIME_START, this.INIT_TIME_END]

    //平台下拉框
    this.listPlatform()
    //店铺下拉框
    this.listStore()
    //发票登记的状态下拉框
    this.listInvoiceStatus()
    //公司下拉框
    this.listCompany()
    //发票类型下拉框
    this.listInvoiceType()

    //加载数据
    this.getInvoiceList(1)
  },
  methods: {
    // 店铺下拉框
    async listStore() {
      const res = await listStore()
      this.stores = res.data
    },
    // 平台下拉框
    async listPlatform() {
      const res = await listPlatform()
      this.platforms = res.data
    },

    // 发票登记的状态的下拉框
    async listInvoiceStatus() {
      const res = await listInvoiceStatus()
      this.invoiceStatusList = res.data
    },

    //公司下拉框
    async listCompany() {
      const res = await listCompany()
      this.companys = res.data
    },

    //发票类型下拉框
    async listInvoiceType() {
      const res = await listInvoiceType()
      this.invoiceType = res.data
    },

    //查询
    async getInvoiceList(page) {
      if (page !== undefined) {
        this.searchReq.page = page
      }

      //设置开始时间和结束时间
      this.searchReq.startTime = addDay(0, this.dateRange[0])

      this.searchReq.endTime = addDayEnd(0, this.dateRange[1])

      var res
      //驳回列表接口
      if (this.tabModel === this.tabModelEnum.rejected) {
        res = await customerRejectedList(this.searchReq)
      } else {
        //全部列表
        res = await customerList(this.searchReq)
      }

      this.invoiceList = res.data.records

      for (let i = 0; i < this.invoiceList.length; i++) {
        this.invoiceList[i].invoiceInfos = this.processInvoiceList(
          this.invoiceList[i].invoiceInfo
        )
      }

      this.total = res.data.total
    },

    //加工发票数据
    processInvoiceList(invoiceInfo) {
      if (invoiceInfo === undefined && invoiceInfo === null) {
        return []
      }

      return invoiceInfo.split(/\n/g).filter((item) => item !== '')
    },

    //详情
    async detail(uuid) {
      //查询详情数据
      const res = await details({ uuid: uuid })

      this.detailReqParams = res.data

      //加工发票资料，能换行
      this.detailReqParams.invoiceInfos = this.processInvoiceList(
        this.detailReqParams.invoiceInfo
      )

      this.detailOrderList = this.detailReqParams.invoiceOrderDetailsVoList

      this.invoiceDetailShow = true
    },

    //tab切换的事件
    changeTabModel() {
      this.getInvoiceList(1)
    },

    //新增/修改的弹窗的列表的新增订单行的事件
    addOrderRow() {
      this.orderList.push({
        originalOrderId: '',
        platformName: '',
        storeName: '',
        spuNameList: [],
        amount: null,
        quantity: null,
        orderErrorMsg: '',
        isExist: false,
      })
    },

    //弹窗录入数据的删除行事件
    detailRowDelete(index) {
      if (this.orderList.length <= 1) {
        this.$message({
          type: 'error',
          message: '最后一条订单无法删除！',
        })
        return
      }
      //删除当前行的数据
      this.orderList.splice(index, 1)
    },

    //新增的弹窗的事件
    addInvoiceRegister() {
      this.isEdit = false

      //默认有一行订单行供录入
      this.addOrderRow()

      this.invoiceAddDetailShow = true
    },

    //修改的弹窗的事件
    async editInvoiceRegister(uuid) {
      this.isEdit = true

      //查询详情数据
      const res = await details({ uuid: uuid })

      this.invoiceAddDetailReqParams = res.data

      this.orderList = this.invoiceAddDetailReqParams.invoiceOrderDetailsVoList

      this.invoiceAddDetailShow = true
    },

    //清空数据
    addCloseDetail() {
      //关闭弹窗
      this.invoiceAddDetailShow = false

      this.$refs['invoiceAddDetailRef'].resetFields()

      this.isEdit = false

      //清空弹窗对象
      this.invoiceAddDetailReqParams = {
        originalOrderIdList: [],
        invoiceType: 1,
      }

      //清空发票的对象
      this.orderList = []
    },

    //详情弹窗
    invoiceCloseDetail() {
      this.invoiceDetailShow = false

      this.detailReqParams = {}
    },

    //作废的关闭事件
    closeCancellation() {
      this.cancellationData = {}

      this.cancellationShow = false
    },

    //作废的弹窗打开
    cancelInvoiceRegister(uuid) {
      this.cancellationData.uuid = uuid

      //作废的弹窗
      this.cancellationShow = true
    },

    //录入订单时，触发查询订单接口,防抖
    orderChange: debounce(async function (index) {
      const row = this.orderList[index]

      //查询如果输入订单号，则不查询
      if (row.originalOrderId === undefined || row.originalOrderId === '') {
        return
      }

      const res = await orderNumberDetails({
        originalOrderId: row.originalOrderId,
      })

      //订单不存在，则提示
      if (res.data && !res.data.isExist) {
        row.orderErrorMsg = '没有查到订单信息，请重试'
      } else {
        row.orderErrorMsg = ''
      }

      row.platformName = res.data.platformName
      row.storeName = res.data.storeName
      row.amount = res.data.amount
      row.quantity = res.data.quantity
      row.spuNameList = res.data.spuNameList
      row.isExist = res.data.isExist
    }, 500),

    //发票登记新增/修改订单列表下面的合计计算
    getSummaries(param) {
      const { columns, data } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '合计'
          return
        }

        //只有金额和数量需要计算合计
        if (column.property === 'amount' || column.property === 'quantity') {
          const values = data.map((item) => Number(item[column.property]))
          if (!values.every((value) => isNaN(value))) {
            sums[index] = values.reduce((prev, curr) => {
              const value = Number(curr)
              if (!isNaN(value)) {
                //数量是整数
                if (column.property === 'quantity') {
                  return Number(prev) + value
                } else {
                  return (Number(prev) + value).toFixed(2)
                }
              } else {
                return prev
              }
            }, 0)
          } else {
            sums[index] = ''
          }
        } else {
          sums[index] = ''
        }
      })

      return sums
    },

    //新增/修改弹窗的确定
    submitAddForm() {
      //必填校验
      this.$refs['invoiceAddDetailRef'].validate(async (valid) => {
        if (valid) {
          //验证订单号必填
          let hasError = false
          //赋值订单列表
          let originalOrderIdList = []
          for (let i = 0; i < this.orderList.length; i++) {
            const row = this.orderList[i]
            if (!row.isExist) {
              if (
                row.originalOrderId === undefined ||
                row.originalOrderId === ''
              ) {
                row.orderErrorMsg = '请填写订单号'
              } else {
                row.orderErrorMsg = '请填写正确的订单号'
              }

              if (!hasError) {
                hasError = !row.isExist
              }
            }

            originalOrderIdList.push(row.originalOrderId)
          }
          this.invoiceAddDetailReqParams.originalOrderIdList =
            originalOrderIdList

          if (hasError) {
            return
          }

          if (this.isEdit) {
            //驳回后的修改提交
            if (
              this.invoiceAddDetailReqParams.invoiceStatus ===
                this.invoiceStatusEnum.SUBMITTED_AFTER_REJECTION ||
              this.invoiceAddDetailReqParams.invoiceStatus ===
                this.invoiceStatusEnum.SUBMITTED
            ) {
              await submittedAfterRejection(this.invoiceAddDetailReqParams)
            } else {
              await customerUpdate(this.invoiceAddDetailReqParams)
            }
          } else {
            delete this.invoiceAddDetailReqParams.uuid
            await customerAdd(this.invoiceAddDetailReqParams)
          }
          this.$message({
            type: 'success',
            message: this.isEdit ? '修改成功' : '新增成功！',
          })

          //清空数据
          this.addCloseDetail()
          //刷新数据
          this.getInvoiceList()
        }
      })
    },

    //提交作废
    async submitCancellation() {
      //必填校验
      this.$refs['cancellationRef'].validate(async (valid) => {
        if (valid) {
          //修改作废状态
          await customerVoid({ ...this.cancellationData })

          this.$message({
            type: 'success',
            message: '作废成功！',
          })

          //清空数据
          this.closeCancellation()
          //刷新数据
          this.getInvoiceList()

          this.cancellationShow = false
        }
      })
    },

    //时间格式化
    getFormatDateFun(timeStamp) {
      if (!timeStamp) {
        return ''
      }

      return getFormatDate(timeStamp)
    },
  },
}
</script>


<style lang="scss" scoped>
.form-item {
  width: 20vw;
}
</style>




