<template>
  <div class="app-container">
    <div class="container">
      <el-form class="page-search" inline>
        <!--时间范围 -->
        <el-form-item label="时间范围：" style="margin-right: 20px;">
          <el-date-picker
            v-model="dateRange"
            :clearable="false"
            type="daterange"
            align="right"
            unlink-panels
            value-format="timestamp"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="平台：" style="margin-right: 20px;">
          <el-select v-model="compensateReq.platform" placeholder="请选择平台" clearable>
            <el-option
              v-for="item in platforms"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="店铺：" prop="storeUuid" style="margin-right: 20px;">
          <el-select filterable v-model="compensateReq.storeUuid" placeholder="请选择店铺" clearable>
            <el-option
              v-for="item in stores"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="补偿类型：" style="margin-right: 20px;">
          <el-select v-model="compensateReq.compensateType" placeholder="请补偿类型" clearable>
            <el-option
              v-for="item in listCompensates"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin-right: 20px;">
          <el-checkbox v-model="compensateReq.isVoid">显示作废</el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="getCompensateList(1)">搜索</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-plus" @click="addCompensate">新增</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="compensateLoading" :max-height="tabHeight" :data="compensateDataList">
        <el-table-column prop="date" label="序号" min-width="30" type="index"></el-table-column>
        <el-table-column prop="createTime" label="登记时间" align="center" width="100">
          <template v-slot="{ row }">
            {{
            getFormatDateFun(row.createTime)
            }}
          </template>
        </el-table-column>
        <!-- <el-table-column prop="createUser" label="登记人" align="center" width="80" show-overflow-tooltip></el-table-column> -->
        <el-table-column prop="originalOrderId" label="订单号" align="center"></el-table-column>
        <el-table-column prop="platformName" label="所属平台" align="center" width="80"></el-table-column>
        <el-table-column prop="storeName" label="店铺名称" align="center" width="150"></el-table-column>
        <el-table-column label="产品名称" align="center" show-overflow-tooltip>
          <template v-slot="{ row }">
            <div v-for="item in row.spuNameList" :key="item">{{ item }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="compensateTypeName" label="补偿类型" align="center" width="80"></el-table-column>
        <el-table-column prop="reason" label="原因" align="center"></el-table-column>
        <el-table-column prop="amount" label="金额" align="center" width="80"></el-table-column>
        <el-table-column prop="collectionUrl" label="收款方式" align="center" width="80">
          <template v-slot="{ row, $index }">
            <el-image
              v-if="row.collectionUrl"
              style="height: 30px; width: 30px"
              :src="row.collectionUrl + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
              :preview-src-list="[row.collectionUrl]"
            ></el-image>
          </template>
        </el-table-column>
        <el-table-column prop="statusName" label="状态" align="center" width="80"></el-table-column>
        <!-- <el-table-column prop="remark" label="备注" align="center" show-overflow-tooltip></el-table-column> -->
        <el-table-column label="操作" width="170" align="center">
          <template v-slot="{ row }">
            <el-button size="mini" type="text" icon="el-icon-view" @click="detail(row.uuid)">详情</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="editCompensate(row)"
              v-if="row.compensateStatus === compensateStatusEnum.REGISTERED && row.compensateVoid === compensateVoidEnum.NOT_VOID"
            >修改</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="cancelCompensate(row.uuid)"
              v-if="row.compensateStatus === compensateStatusEnum.REGISTERED && row.compensateVoid === compensateVoidEnum.NOT_VOID"
            >作废</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <pagination
          v-show="compensateTotal > 0"
          :total="compensateTotal"
          :page.sync="compensateReq.page"
          :limit.sync="compensateReq.pageSize"
          @pagination="getCompensateList()"
        />
      </div>

      <!-- 新增/修改补偿单弹窗 -->
      <el-dialog
        :title="isEdit ? '修改补偿单' : '新增补偿单'"
        :visible.sync="compensateAddDetailShow"
        width="40%"
        :before-close="addCloseDetail"
        :close-on-click-modal="false"
      >
        <el-form
          label-width="120px"
          label-position="right"
          :model="detailReqParams"
          :rules="compensateDetailRules"
          ref="compensateDetailRef"
          @submit.native.prevent
        >
          <el-form-item label="订单号" prop="originalOrderId">
            <el-input
              class="el-form-item-width40"
              placeholder="请输入订单号"
              @keyup.enter.native="searchOrder"
              @input="clearOrderInfo"
              v-model="detailReqParams.originalOrderId"
              :disabled="isEdit"
            ></el-input>
            <el-button
              type="primary"
              size="small"
              @click="searchOrder"
              v-if="!isEdit"
              style="margin-left: 6px;"
            >查 询</el-button>
            <div>
              <template>{{ orderErrorMsg }}</template>
            </div>
          </el-form-item>
          <el-form-item label="所属平台：" prop="platform">
            <el-select
              class="el-form-item-width40"
              v-model="detailReqParams.platform"
              placeholder="请选择平台"
              :disabled="true"
            >
              <el-option
                v-for="item in orderPlatforms"
                :label="item.name"
                :value="item.code"
                :key="item.code"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="店铺：" prop="storeUuid">
            <el-select
              filterable
              class="el-form-item-width40"
              v-model="detailReqParams.storeUuid"
              placeholder="请选择店铺"
              :disabled="true"
            >
              <el-option
                v-for="item in orderStores"
                :label="item.name"
                :value="item.code"
                :key="item.code"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="产品名称：" prop="spuUuidList">
            <!-- @change="$forceUpdate()" -->
            <el-select
              filterable
              class="el-form-item-width40"
              v-model="detailReqParams.spuUuidList"
              placeholder="请选择产品名称"
              multiple
            >
              <el-option
                v-for="item in orderSpuData"
                :label="item.name"
                :value="item.code"
                :key="item.code"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="补偿类型：" prop="compensateType">
            <el-select
              filterable
              class="el-form-item-width40"
              v-model="detailReqParams.compensateType"
              placeholder="请选择补偿类型"
              clearable
            >
              <el-option
                v-for="item in listCompensates"
                :label="item.name"
                :value="item.code"
                :key="item.code"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item class="el-form-item-width40" label="原因：" prop="reason">
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4}"
              show-word-limit
              maxlength="50"
              class="el-form-item-width40"
              placeholder="请输入原因"
              v-model="detailReqParams.reason"
            ></el-input>
          </el-form-item>
          <el-form-item class="el-form-item-width40" label="金额：" prop="amount">
            <el-input
              class="el-form-item-width40"
              placeholder="请输入金额"
              @input="detailReqParams.amount = detailReqParams.amount.replace(/^\D*([0-9]\d*\.?\d{0,2})?.*$/,'$1')"
              v-model="detailReqParams.amount"
            ></el-input>
          </el-form-item>
          <el-form-item class="el-form-item-width40" prop="collectionUrlUuid">
            <template #label>
              <span class="required-star">*</span>收款方式：
            </template>
            <OSSFileUpload
              :sign.sync="sign"
              :fileType.sync="fileType"
              :fileRecordList.sync="fileRecordList"
              :isPicture.sync="isPicture"
              :showLoading.sync="fileShowLoading"
              @getFileUrl="getFileUrl"
              @getFileName="getFileName"
              @deleteFile="deleteFile"
              ref="OSSFileUploadRef"
            ></OSSFileUpload>
          </el-form-item>
          <el-form-item class="el-form-item-width40" label="备注：" prop="remark">
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4}"
              show-word-limit
              maxlength="255"
              class="el-form-item-width40"
              placeholder="请输入备注"
              v-model="detailReqParams.remark"
            ></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="addCloseDetail">取 消</el-button>
          <el-button type="primary" size="small" @click="submitAddForm">确 定</el-button>
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

      <!-- 详情弹窗 -->
      <el-dialog
        title="详情"
        :visible.sync="compensateDetailShow"
        width="40%"
        :before-close="closeDetail"
        :close-on-click-modal="false"
      >
        <el-descriptions :column="2">
          <el-descriptions-item label="订单号">{{ compensatedetail.originalOrderId }}</el-descriptions-item>
          <el-descriptions-item label="登记人">{{ compensatedetail.createUser }}</el-descriptions-item>
          <el-descriptions-item label="登记时间">{{ getFormatDateFun(compensatedetail.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="所属平台">{{ compensatedetail.platformName }}</el-descriptions-item>
          <el-descriptions-item label="店铺">{{ compensatedetail.storeName }}</el-descriptions-item>
          <el-descriptions-item label="产品名称">
            <template>
              <div>
                <div v-for="item in compensatedetail.spuNameList" :key="item">{{ item }}</div>
              </div>
            </template>
          </el-descriptions-item>
          <el-descriptions-item label="补偿类型">{{ compensatedetail.compensateTypeName }}</el-descriptions-item>
          <el-descriptions-item label="原因">{{ compensatedetail.reason }}</el-descriptions-item>
          <el-descriptions-item label="金额">{{ compensatedetail.amount }}</el-descriptions-item>
          <el-descriptions-item label="收款方式">
            <template>
              <el-image
                v-if="compensatedetail.collectionUrl"
                style="height: 30px;width: 30px;"
                :src="compensatedetail.collectionUrl + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
                :preview-src-list="[compensatedetail.collectionUrl]"
              ></el-image>
            </template>
          </el-descriptions-item>
          <el-descriptions-item label="备注">{{ compensatedetail.remark }}</el-descriptions-item>
          <el-descriptions-item label="作废理由">{{ compensatedetail.voidReason }}</el-descriptions-item>
        </el-descriptions>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" size="small" @click="closeDetail">关 闭</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { addDay, addDayEnd } from '@/utils/common.js'
import {
  listPlatform,
  listStore,
  listCompensateType,
  getOSSFileUuid,
} from '@/api/baseData/common'
import { getFormatDate } from '@/utils/common'
import {
  customerList,
  orderNumberDetails,
  details,
  add,
  update,
  getCompensateOssSign,
  customerVoid,
} from '@/api/afterSales/compensate'

export default {
  name: 'CompensateRegistration',
  data() {
    return {
      //登记还是确认的状态
      compensateStatusEnum: {
        REGISTERED: 0, //已登记
        CONFIRMED: 1, //已确认
      },

      //作废状态
      compensateVoidEnum: {
        NOT_VOID: 0, //未作废
        CUSTOMER_VOID: 1, //客服作废
        FINANCE_VOID: 2, //财务作废
      },

      //开始时间和结束时间
      INIT_TIME_START: null,
      INIT_TIME_END: null,

      tabHeight: 600,

      //补偿查询的model
      compensateReq: {
        //是否显示作废,true只显示作废，false不显示作废
        isVoid: false,
        pageSize: 20,
      },

      //时间组件的筛选
      dateRange: [],

      //补偿列表的分页总条数
      compensateTotal: 0,

      //平台下拉框的值
      platforms: [],

      //弹窗里的平台的下拉框的值
      orderPlatforms: [],

      //弹窗里的店铺的下拉框的值
      orderStores: [],

      //弹窗里的spu的下拉框的值
      orderSpuData: [],

      //补偿类型下拉框的值
      listCompensates: [],

      //店铺下拉框的值
      stores: [],

      //列表的加载动画标记
      compensateLoading: false,

      //补偿列表
      compensateDataList: [],

      //登记弹窗新增还是修改的标记
      isEdit: false,

      //登记弹窗是否显示的标记
      compensateAddDetailShow: false,

      //详情弹窗是否显示的标记
      compensateDetailShow: false,

      // 详情数据
      compensatedetail: {},

      //新增和修改保存的对象
      detailReqParams: {
        spuUuidList: [],
      },

      //是否有订单号，为了展示平台和店铺
      hasOrder: false,

      //订单查询失败的时候的提示
      orderErrorMsg: '',

      // oss文件上传签名
      sign: {},

      //图片格式限定
      fileType: ['.gif', '.jpg', '.png', '.jpeg', '.webp'],

      // 上传的文件的内容
      fileRecordList: [],

      // 文件上传是否为图片
      isPicture: true,

      // 显示文件上传加载中
      fileShowLoading: true,

      // 获取文件uuid入参
      getUrlUuidReqParams: {
        fileName: '',
        originalName: '',
        platformType: 1,
      },

      //作废的弹窗是否显示
      cancellationShow: false,

      //作废的数据
      cancellationData: {},

      // 详情规则
      compensateDetailRules: {
        originalOrderId: [
          { required: true, message: '请输入订单号', trigger: 'blur' },
        ],
        spuUuidList: [
          {
            type: 'array',
            required: true,
            message: '请选择产品名称',
            trigger: 'change',
          },
        ],
        compensateType: [
          { required: true, message: '请选择补偿类型', trigger: 'change' },
        ],
        reason: [{ required: true, message: '请输入原因', trigger: 'blur' }],
        amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
        collectionUrlUuid: [
          // { required: true, message: '请添加收款方式', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (!this.detailReqParams.collectionUrlUuid) {
                // console.log('收款方式空空空', value)
                callback(new Error('请添加收款方式'))
              } else {
                // console.log('收款方式有有有', value)
                callback()
              }
            },
            trigger: 'change',
          },
        ],
      },

      //作废规则
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

    //补偿类型下拉框
    this.listCompensateType()

    this.getCompensateList(1)
  },
  methods: {
    // 清除订单查询的信息
    clearOrderInfo() {
      this.detailReqParams.platform = ''
      this.detailReqParams.storeUuid = ''
      this.detailReqParams.spuUuidList = []
      this.orderSpuData = []
    },
    //补偿类型下拉框
    async listCompensateType() {
      const res = await listCompensateType()
      this.listCompensates = res.data
    },
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

    //查询列表
    async getCompensateList(page) {
      if (page !== undefined) {
        this.compensateReq.page = page
      }

      //设置开始时间和结束时间
      this.compensateReq.startTime = addDay(0, this.dateRange[0])

      this.compensateReq.endTime = addDayEnd(0, this.dateRange[1])

      const res = await customerList({ ...this.compensateReq })

      //组装数据
      this.compensateDataList = res.data.records

      this.total = res.data.total
    },

    //新增
    addCompensate() {
      this.isEdit = false

      //取图片签名
      this.getCompensateOssSignFun()

      this.compensateAddDetailShow = true
    },

    //修改
    async editCompensate(row) {
      this.isEdit = true

      //取图片签名
      this.getCompensateOssSignFun()

      //查询详情，组装数据
      const res = await details(row.uuid)
      this.detailReqParams = res.data

      await this.searchOrder()

      //显示图片
      if (row.collectionUrl && row.collectionUrl !== '') {
        this.fileRecordList.push(row.collectionUrl)
      }

      this.compensateAddDetailShow = true
    },

    //详情
    async detail(uuid) {
      //查询详情，组装数据
      const res = await details(uuid)
      this.compensatedetail = res.data

      this.compensateDetailShow = true
    },

    //清空数据
    closeDetail() {
      //关闭弹窗
      this.compensateDetailShow = false

      this.compensatedetail = {}
    },

    //作废
    cancelCompensate(uuid) {
      this.cancellationData.uuid = uuid

      //作废的弹窗
      this.cancellationShow = true
    },

    //关闭
    closeCancellation() {
      this.cancellationShow = false

      this.$refs['cancellationRef'].resetFields()

      this.cancellationData = {}
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
          this.getCompensateList()

          this.cancellationShow = false
        }
      })
    },

    //查询订单
    async searchOrder() {
      if (
        this.detailReqParams.originalOrderId === undefined ||
        this.detailReqParams.originalOrderId === ''
      ) {
        return
      }

      //查询订单号，如果没查到，则提示
      const res = await orderNumberDetails(this.detailReqParams.originalOrderId)
      const result = res.data
      if (result.isExist === undefined || !result.isExist) {
        this.orderErrorMsg = '没有查到订单信息，请重试'
        return
      } else {
        this.orderErrorMsg = ''
      }

      //这里要绑定平台的数据源
      this.orderPlatforms = [
        { code: result.platform, name: result.platformName },
      ]
      if (this.orderPlatforms.length > 0) {
        this.detailReqParams.platform = this.orderPlatforms[0].code
      }

      //绑定店铺的数据源
      this.orderStores = [{ code: result.storeUuid, name: result.storeName }]
      if (this.orderStores.length > 0) {
        this.detailReqParams.storeUuid = this.orderStores[0].code
      }

      //绑定spu的数据源
      this.orderSpuData = result.enumVoList
      if (this.orderSpuData.length === 1) {
        console.log(this.detailReqParams)
        this.detailReqParams.spuUuidList = [this.orderSpuData[0].code]
      }

      // this.hasOrder = true
    },

    //清空数据
    addCloseDetail() {
      //关闭弹窗
      this.compensateAddDetailShow = false

      this.$refs['compensateDetailRef'].resetFields()

      this.isEdit = false

      this.hasOrder = false

      this.$nextTick(() => {
        this.$refs.OSSFileUploadRef.clearFileList()
      })

      //图片的数据
      this.fileRecordList = []

      //弹窗里的平台的下拉框的值
      this.orderPlatforms = []
      //弹窗里的店铺的下拉框的值
      this.orderStores = []
      //弹窗里的spu的下拉框的值
      this.orderSpuData = []
      this.detailReqParams = {
        spuUuidList: [],
      }

      this.orderErrorMsg = ''
    },

    //确定时的提交按钮
    async submitAddForm() {
      //必填校验
      this.$refs['compensateDetailRef'].validate(async (valid) => {
        if (valid) {
          if (this.isEdit) {
            await update(this.detailReqParams)
          } else {
            delete this.detailReqParams.uuid
            await add(this.detailReqParams)
          }
          this.$message({
            type: 'success',
            message: this.isEdit ? '修改成功' : '新增成功！',
          })

          //清空数据
          this.addCloseDetail()
          //刷新数据
          this.getCompensateList()
        }
      })
    },

    // 获取上传文件签名
    async getCompensateOssSignFun() {
      const res = await getCompensateOssSign()
      this.sign = res.data
    },

    // 获取上传后的文件url
    async getFileUrl(val) {
      this.getUrlUuidReqParams.fileName = val
      // 如果上传新文件 重新获取uuid提交
      if (this.getUrlUuidReqParams.fileName !== '') {
        const res = await getOSSFileUuid(this.getUrlUuidReqParams)
        this.detailReqParams.collectionUrlUuid = res.data
        this.$modal.closeLoading()
      }
    },

    // 获取文件源名称
    getFileName(val) {
      this.getUrlUuidReqParams.originalName = val
    },

    // 删除文件
    deleteFile(val) {
      this.detailReqParams.collectionUrlUuid = ''
      this.getUrlUuidReqParams = {
        fileName: '', // 文件地址
        originalName: '', // 源文件名
        platformType: 1,
      }
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