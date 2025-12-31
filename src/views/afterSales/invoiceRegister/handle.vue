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
      </el-form>

      <el-radio-group v-model="tabModel" @change="changeTabModel">
        <el-radio-button :label="1">待开发票</el-radio-button>
        <el-radio-button :label="2">全部</el-radio-button>
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
            <div v-for="item in row.originalOrderIdSet" :key="item">{{ item }}</div>
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
          align="center"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column prop="remark" label="备注" align="center"></el-table-column>
        <el-table-column prop="invoiceStatusName" label="状态" align="center" width="75"></el-table-column>
        <el-table-column label="操作" width="160" align="center">
          <template v-slot="{ row }">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-view"
              @click="detail(row.uuid)"
              v-if="row.children && row.children.length>0"
            >详情</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handle(row.uuid)"
              v-if="(invoiceStatusEnum.NOT_INVOICED === row.invoiceStatus || invoiceStatusEnum.SUBMITTED_AFTER_REJECTION === row.invoiceStatus) && invoiceVoidEnum.NOT_VOID === row.invoiceVoid"
            >处理</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="cancelInvoiceHandle(row.uuid)"
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
          <el-button
            type="primary"
            size="small"
            v-if="isHandle"
            @click="invoiceHandles(detailReqParams.uuid)"
          >开 票</el-button>
          <el-button
            type="primary"
            size="small"
            v-if="isHandle"
            @click="rejection(detailReqParams.uuid)"
          >驳 回</el-button>
          <el-button type="primary" size="small" v-if="isHandle" @click="invoiceCloseDetail">取 消</el-button>
          <el-button type="primary" size="small" v-if="!isHandle" @click="invoiceCloseDetail">关 闭</el-button>
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

      <!--驳回的弹窗-->
      <el-dialog :visible.sync="rejectionShow" width="30%" :before-close="closeRejection">
        <el-form
          label-width="80px"
          label-position="right"
          :model="rejectionData"
          :rules="rejectionRule"
          ref="rejectionRef"
        >
          <el-form-item label="驳回理由" prop="overruleReason">
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4}"
              show-word-limit
              maxlength="50"
              placeholder="请输入原因"
              v-model="rejectionData.overruleReason"
            ></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="closeRejection">取 消</el-button>
          <el-button type="primary" size="small" @click="submitRejection">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { getFormatDate } from '@/utils/common'

import { addDay, addDayEnd } from '@/utils/common.js'

import {
  listPlatform,
  listStore,
  listInvoiceType,
  listInvoiceStatus,
} from '@/api/baseData/common'

import {
  details,
  financeUnInvoicingList,
  financeList,
  financeVoid,
  confirmed,
  rejection,
} from '@/api/afterSales/invoiceRegister'

export default {
  name: 'InvoiceHandle',
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
        NOT_INVOICED: 1, //待开发票
        ALL: 2, //全部
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

      //详情的弹窗里订单列表的数据源
      detailOrderList: [],

      //详情弹窗的标记
      invoiceDetailShow: false,

      //详情弹窗的数据源
      detailReqParams: {},

      //作废的弹窗标记
      cancellationShow: false,

      //驳回弹窗的数据源
      cancellationData: {},

      //是处理操作还是查看详情,true处理操作，false查看详情
      isHandle: false,

      //驳回的弹窗标记
      rejectionShow: false,

      //驳回的数据源
      rejectionData: {},

      //作废的必填校验
      cancellationRule: {
        voidReason: [
          { required: true, message: '请输入作废原因', trigger: 'blur' },
        ],
      },

      //驳回的必填校验
      rejectionRule: {
        overruleReason: [
          { required: true, message: '请输入驳回原因', trigger: 'blur' },
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
      //待开发票列表接口
      if (this.tabModel === this.tabModelEnum.NOT_INVOICED) {
        res = await financeUnInvoicingList(this.searchReq)
      } else {
        //全部列表
        res = await financeList(this.searchReq)
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
      this.isHandle = false
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

    //发票处理的弹出框
    async handle(uuid) {
      this.isHandle = true
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

    //驳回的弹窗
    rejection(uuid) {
      this.rejectionData.uuid = uuid

      this.rejectionShow = true
    },

    //驳回的关闭事件
    closeRejection() {
      this.rejectionData = {}

      this.$refs['rejectionRef'].resetFields()

      this.rejectionShow = false
    },

    //tab切换的事件
    changeTabModel() {
      this.getInvoiceList(1)
    },

    //详情弹窗
    invoiceCloseDetail() {
      this.detailReqParams = {}

      //重置标记
      this.isHandle = false

      this.invoiceDetailShow = false
    },

    //作废的关闭事件
    closeCancellation() {
      this.cancellationData = {}

      this.$refs['cancellationRef'].resetFields()

      this.cancellationShow = false
    },

    //作废的弹窗打开
    cancelInvoiceHandle(uuid) {
      this.cancellationData.uuid = uuid

      //作废的弹窗
      this.cancellationShow = true
    },

    //处理事件
    async invoiceHandles(uuid) {
      await confirmed({ uuid: uuid })

      this.detailReqParams = {}

      this.invoiceDetailShow = false

      //重置标记
      this.isHandle = false

      //刷新数据
      this.getInvoiceList()
    },

    //驳回操作
    submitRejection() {
      //必填校验
      this.$refs['rejectionRef'].validate(async (valid) => {
        if (valid) {
          //修改作废状态
          await rejection({ ...this.rejectionData })

          this.$message({
            type: 'success',
            message: '驳回成功！',
          })

          //清空数据
          this.closeRejection()
          //刷新数据
          this.getInvoiceList()

          //驳回弹窗关闭
          this.rejectionShow = false
          //详情弹窗关闭
          this.invoiceDetailShow = false
        }
      })
    },

    //提交作废
    async submitCancellation() {
      //必填校验
      this.$refs['cancellationRef'].validate(async (valid) => {
        if (valid) {
          //修改作废状态
          await financeVoid({ ...this.cancellationData })

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

<style lang="scss">
</style>