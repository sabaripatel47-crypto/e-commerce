<template>
  <div class="page_apply">
    <div class="page-search">
      <el-form class="page-search" inline :model="reqParams" ref="reqParams">
        <!--时间范围 -->
        <el-form-item label="时间范围：" style="margin-right: 20px;">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            align="right"
            unlink-panels
            value-format="timestamp"
            @blur="blurTime"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="平台：" style="margin-right: 20px;">
          <el-select v-model="reqParams.platform" filterable clearable placeholder="请选择">
            <el-option
              v-for="item in platformList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="店铺名称：" style="margin-right: 20px;">
          <el-select
            v-model="reqParams.storeUuid"
            filterable
            @change="getLinkList"
            clearable
            placeholder="请选择"
          >
            <el-option
              v-for="item in shopList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品标题：" style="margin-right: 20px;">
          <el-select v-model="reqParams.linkIdList" filterable clearable multiple placeholder="请选择">
            <el-option
              v-for="item in titleList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-form-item label="商品等级：" prop="linkLevel" style="margin-right: 20px;">
            <el-select filterable v-model="reqParams.linkLevel" clearable placeholder="请选择商品等级">
              <el-option
                v-for="item in levelList"
                :label="item.name"
                :value="item.code"
                :key="item.code"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form-item>
        <el-form-item label="状态：" style="margin-right: 20px;">
          <el-select v-model="reqParams.applicationStatus" clearable placeholder="请选择">
            <el-option
              v-for="item in statusList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin-right: 20px;">
          <el-checkbox v-model="reqParams.isVoid">是否作废</el-checkbox>
        </el-form-item>
        <el-form-item style="margin-right: 20px;">
          <el-button type="primary" icon="el-icon-search" @click="getPageList(1)">查询</el-button>
        </el-form-item>
        <el-form-item style="margin-right: 20px;">
          <el-button type="primary" icon="el-icon-plus" plain @click="openAddDialog()">新增</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-radio-group v-model="reqParams.pageStatus" @change="getPageList(1)">
      <el-radio-button :label="1">全部</el-radio-button>
      <el-radio-button :label="2">我的</el-radio-button>
    </el-radio-group>
    <!-- 资源申请表 -->
    <el-table
      border
      v-loading="applyLoading"
      :data="applyList"
      center
      style="width: 100%"
      max-height="480"
    >
      <el-table-column prop="date" label="序号" min-width="30" type="index" align="center"></el-table-column>
      <el-table-column label="申请日期" type="datetime" align="center">
        <template v-slot="{ row }">
          <span>{{ getFormatDate(row.applicationTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="linkTitle" label="商品标题" align="center"></el-table-column>
      <el-table-column prop="linkId" label="商品编码" align="center"></el-table-column>
      <el-table-column prop="linkLevelName" label="商品等级" align="center"></el-table-column>
      <el-table-column prop="url" label="主图" align="center">
        <template v-slot="{ row, $index }">
          <el-image
            v-if="row.url"
            style="height: 30px;width: 30px;"
            :src="row.url + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
            :preview-src-list="[row.url]"
          ></el-image>
        </template>
      </el-table-column>
      <el-table-column label="店铺" align="center">
        <template v-slot="{ row }">
          <span>{{ row.platformName }}</span>
          <span>({{ row.storeCode ? row.storeCode : '-'}})</span>
          <span>{{ row.storeName }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="managerName" label="负责人" align="center"></el-table-column>
      <el-table-column prop="deadline" label="截止日期" align="center">
        <template v-slot="{ row }">
          <span>{{ getFormatDate(row.deadline) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="applicationStatusName" label="状态" align="center"></el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button
            type="text"
            size="small"
            v-if="reqParams.pageStatus == 2 && scope.row.cancelStatus == false && scope.row.applicationStatus == 0"
            @click="openEditDialog(scope.row)"
          >修改</el-button>
          <el-button type="text" size="small" @click="openDetailDialog(scope.row)">详情</el-button>
          <el-button
            type="text"
            size="small"
            v-if="reqParams.pageStatus == 2 && scope.row.cancelStatus == false && scope.row.applicationStatus == 0"
            @click="openCancelDialog(scope.row)"
          >作废</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      v-show="total>0"
      :page.sync="reqParams.page"
      :limit.sync="reqParams.pageSize"
      :total="total"
      @pagination="getPageList"
    />
    <!-- 新增弹窗 -->
    <el-dialog
      :visible="addDialogVisible"
      width="40%"
      :close-on-click-modal="false"
      @close="closeAddDialog()"
    >
      <el-form
        label-position="right"
        label-width="130px"
        onsubmit="return false;"
        :model="addParams"
        :rules="addRules"
        ref="addParams"
      >
        <el-form-item label="店铺：" prop="storeUuid">
          <el-select
            class="el-form-item-width40"
            filterable
            v-model="addParams.storeUuid"
            @change="this.getDialogLinkList"
            clearable
            placeholder="请选择"
          >
            <el-option
              v-for="item in shopList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品标题：" prop="linkId">
          <el-select
            class="el-form-item-width40"
            filterable
            v-model="addParams.linkId"
            clearable
            placeholder="请选择"
          >
            <el-option
              v-for="item in titleList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="截止日期：" prop="deadline">
          <el-date-picker
            value-format="timestamp"
            v-model="addParams.deadline"
            type="date"
            placeholder="选择日期："
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="申请金额(元)：" prop="amount">
          <el-input class="el-form-item-width40" v-model="addParams.amount" placeholder="请输入申请金额"></el-input>
        </el-form-item>
        <el-form-item label="申请货品数量：" prop="quantity">
          <el-input
            class="el-form-item-width40"
            v-model="addParams.quantity"
            placeholder="请输入申请货物数量"
          ></el-input>
        </el-form-item>
        <el-form-item label="说明：" prop="reason">
          <el-input
            class="el-form-item-width40"
            v-model="addParams.reason"
            type="textarea"
            placeholder="请输入说明"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer" width="40%">
        <el-button @click="closeAddDialog()">取 消</el-button>
        <el-button type="primary" @click="submitAddApply()">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改弹窗 -->
    <el-dialog
      :visible="editDialogVisible"
      :close-on-click-modal="false"
      width="40%"
      @close="closeEditDialog()"
    >
      <el-form
        label-position="right"
        onsubmit="return false;"
        label-width="130px"
        :model="editParams"
        :rules="editRules"
        ref="editParams"
      >
        <el-form-item label="店铺：" prop="storeUuid">
          <el-select
            class="el-form-item-width40"
            disabled
            v-model="editParams.storeUuid"
            @change="this.getDialogLinkList"
            clearable
            placeholder="请选择"
          >
            <el-option
              v-for="item in shopList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品标题：" prop="linkId">
          <el-select
            class="el-form-item-width40"
            disabled
            v-model="editParams.linkId"
            clearable
            placeholder="请选择"
          >
            <el-option
              v-for="item in titleList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="截止日期：" prop="deadline">
          <el-date-picker
            value-format="timestamp"
            v-model="editParams.deadline"
            type="date"
            placeholder="选择日期："
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="申请金额(元)：" prop="amount">
          <el-input class="el-form-item-width40" v-model="editParams.amount" placeholder="请输入申请金额"></el-input>
        </el-form-item>
        <el-form-item label="申请货品数量：" prop="quantity">
          <el-input
            class="el-form-item-width40"
            v-model="editParams.quantity"
            placeholder="请输入申请货物数量"
          ></el-input>
        </el-form-item>
        <el-form-item label="说明：">
          <el-input
            class="el-form-item-width40"
            v-model="editParams.reason"
            type="textarea"
            placeholder="请输入说明"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer" width="40%">
        <el-button @click="closeEditDialog()">取消</el-button>
        <el-button type="primary" @click="submitEdit()">确定</el-button>
      </span>
    </el-dialog>
    <!-- 详情弹窗 -->
    <el-dialog :visible="detailDialogVisible" width="40%" @close="closeDetailDialog()">
      <el-descriptions>
        <el-descriptions-item label="商品标题">{{ detailData.linkTitle }}</el-descriptions-item>
        <el-descriptions-item label="主图">
          <el-image
            v-if="detailData.url"
            style="height: 30px;width: 30px;"
            :src="detailData.url + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
            :preview-src-list="[detailData.url]"
          ></el-image>
        </el-descriptions-item>
        <el-descriptions-item label="商品编码">{{ detailData.linkId }}</el-descriptions-item>
        <el-descriptions-item
          label="店铺"
        >{{ detailData.platformName }}({{ detailData.storeCode ? detailData.storeCode : '-'}}){{ detailData.storeName }}</el-descriptions-item>
        <el-descriptions-item label="负责人">{{ detailData.managerName }}</el-descriptions-item>
        <el-descriptions-item label="等级">{{ detailData.linkLevelName }}</el-descriptions-item>
        <el-descriptions-item label="截止日期">{{ getFormatDate(detailData.deadline) }}</el-descriptions-item>
        <el-descriptions-item label="申请金额（元）">{{ detailData.amount }}</el-descriptions-item>
        <el-descriptions-item label="申请货品数量">{{ detailData.quantity }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ detailData.applicationUser }}</el-descriptions-item>
        <el-descriptions-item label="申请日期">{{ getFormatDate(detailData.applicationTime) }}</el-descriptions-item>
        <el-descriptions-item label="处理人">{{ detailData.processUser }}</el-descriptions-item>
        <el-descriptions-item
          v-if="detailData.cancelStatus == false && detailData.applicationStatus != 0 "
          label="处理日期"
        >{{ getFormatDate(detailData.processTime) }}</el-descriptions-item>
        <el-descriptions-item label="作废原因">{{ detailData.cancelReason }}</el-descriptions-item>
        <el-descriptions-item label="驳回原因">{{ detailData.rejectReason }}</el-descriptions-item>
        <el-descriptions-item label="说明">{{ detailData.reason }}</el-descriptions-item>
      </el-descriptions>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeDetailDialog()">关 闭</el-button>
      </span>
    </el-dialog>
    <!-- 作废弹窗 -->
    <el-dialog :visible="cancelDialogVisible" width="40%" @close="closeCancelDialog()">
      <el-form
        :model="this.cancelParams"
        label-width="120px"
        onsubmit="return false;"
        :rules="cancelRules"
        ref="cancelParams"
      >
        <el-form-item label="作废原因:" prop="reason">
          <el-input
            v-model="cancelParams.reason"
            class="el-form-item-width40"
            placeholder="请输入作废原因"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeCancelDialog()">取 消</el-button>
        <el-button type="primary" @click="submitCancel()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  getShopList,
  getLevelList,
  getApplyList,
  addApply,
  storeToLinkPush,
  linkDetail,
  applyCancel,
  applyEdit,
  linkApplyType,
} from '@/api/resourceManage/apply.js'
import { listPlatform } from '@/api/baseData/common'
import { getFormatDate } from '@/utils/common.js'
export default {
  name: 'Apply',
  data() {
    return {
      // 平台下拉列表
      platformList: [],
      // 店铺名称列表
      shopList: [],
      // 商品标题列表
      titleList: [],
      // 商品等级列表
      levelList: [],
      // 日期范围
      dateRange: [],
      // 状态列表
      statusList: [],
      // 当前用户uuid
      userUuid: '',
      // 查询资源传参
      reqParams: {
        applicationStatus: null,
        endTime: '',
        isVoid: false,
        // levelList: [],
        linkLevel: '',
        linkIdList: [],
        page: 1,
        pageSize: 10,
        pageStatus: 1,
        // platformList: [],
        platform: '',
        startTime: '',
        // storeUuidList: []
        storeUuid: '',
      },
      // 外层店铺名称存储
      reqLink: {
        storeUuidList: [],
      },
      // 新增弹窗店铺名称存储
      reqDialogLink: {
        storeUuidList: [],
      },
      // 保存时间用于转化为13位编码
      deadTime: '',
      // 新增请求参数
      addParams: {
        amount: '',
        deadline: '',
        linkId: '',
        quantity: '',
        reason: '',
        storeUuid: '',
      },
      // 修改请求参数
      editParams: {
        amount: '',
        deadline: '',
        linkId: '',
        quantity: '',
        reason: '',
        storeUuid: '',
        uuid: '',
      },
      // 修改弹窗
      editDialogVisible: false,
      // 新增弹窗
      addDialogVisible: false,
      // 详情弹窗
      detailDialogVisible: false,
      // 作废弹窗
      cancelDialogVisible: false,
      // 申请列表
      addLoading: false,
      // 总资源条数
      total: 0,
      // 资源申请表数据存储位置
      applyList: [],
      // 表格加载动画效果
      applyLoading: false,
      // 新增表单验证规则
      addRules: {
        storeUuid: [
          { required: true, message: '请选择店铺名称', trigger: 'change' },
        ],
        linkId: [
          { required: true, message: '请选择商品标题', trigger: 'change' },
        ],
        quantity: [
          { required: true, message: '请输入申请数量', trigger: 'blur' },
        ],
        amount: [
          { required: true, message: '请输入申请金额', trigger: 'blur' },
        ],
        deadline: [
          { required: true, message: '请选择申请期限', trigger: 'change' },
        ],
      },
      // 修改表单规则
      editRules: {
        storeUuid: [
          { required: true, message: '请选择店铺名称', trigger: 'change' },
        ],
        linkId: [
          { required: true, message: '请选择商品标题', trigger: 'change' },
        ],
        quantity: [
          { required: true, message: '请输入申请数量', trigger: 'blur' },
        ],
        amount: [
          { required: true, message: '请输入申请金额', trigger: 'blur' },
        ],
        deadline: [
          { required: true, message: '请选择申请期限', trigger: 'change' },
        ],
      },
      // 作废规则
      cancelRules: {
        reason: [
          { required: true, message: '请输入作废原因', trigger: 'blur' },
        ],
      },
      // 详情数据
      // 详情数据
      detailData: {},
      // 作废传参
      cancelParams: {
        pageType: 0,
        reason: '',
        uuid: '',
      },
    }
  },
  created() {
    // 页面加载时获取
    this.getLevelList()
    this.getShopList()
    this.getPlatformList()
    this.getPageList()
    this.getStatusList()
  },
  methods: {
    // 时间戳转换
    getFormatDate(time) {
      return getFormatDate(time)
    },
    // 获取状态下拉
    async getStatusList() {
      const res = await linkApplyType()
      this.statusList = res.data
    },
    // 获取店铺列表
    async getShopList() {
      const res = await getShopList()
      this.shopList = res.data
    },
    // 获取商品等级列表
    async getLevelList() {
      const res = await getLevelList()
      this.levelList = res.data
    },
    // 获取平台列表
    async getPlatformList() {
      const res = await listPlatform()
      this.platformList = res.data
    },
    // 选择店铺后获取商品标题
    async getLinkList() {
      this.titleList = []
      this.reqParams.linkIdList = []
      this.reqLink.storeUuidList = []
      if (this.reqParams.storeUuid != '') {
        this.reqLink.storeUuidList.push(this.reqParams.storeUuid)
        const res = await storeToLinkPush(this.reqLink)
        this.titleList = res.data
      }
    },
    // 新增弹窗选择店铺后获取商品标题
    async getDialogLinkList() {
      this.reqDialogLink.storeUuidList = []
      this.addParams.linkId = ''
      this.reqDialogLink.storeUuidList.push(this.addParams.storeUuid)
      const res = await storeToLinkPush(this.reqDialogLink)
      this.titleList = res.data
    },
    // 页码跳转
    async getPageList(page) {
      if (page == 1) {
        this.reqParams.page = page
      }
      if (this.dateRange == null) {
        this.reqParams.startTime = ''
        this.reqParams.endTime = ''
      } else {
        this.reqParams.startTime = this.dateRange[0]
        this.reqParams.endTime = this.dateRange[1]
      }
      // this.userUuid = this.$store.state.user.userUuid;
      this.applyLoading = true
      const res = await getApplyList(this.reqParams)
      this.applyList = res.data.records
      this.total = res.data.total
      this.applyLoading = false
    },
    // 搜索按钮事件
    searchList() {
      this.reqParams.page = 1
      this.getPageList()
    },
    // 时间选择失焦时将startPickerTime置空 目的是清除禁用的时间范围
    blurTime() {
      this.startPickerTime = ''
    },
    // 关闭新增弹窗事件
    async closeAddDialog() {
      this.addDialogVisible = false
      await this.$refs.addParams.resetFields()
      this.addParams.amount = ''
      this.addParams.deadline = ''
      this.addParams.linkId = ''
      this.addParams.quantity = ''
      this.addParams.reason = ''
      this.addParams.storeUuid = ''
    },
    // 打开新增弹窗事件
    openAddDialog() {
      this.addDialogVisible = true
    },
    // 新增资源提交
    async submitAddApply() {
      this.$refs.addParams.validate()
      const res = await addApply(this.addParams)
      if (res.data === true) {
        this.$message.success('申请成功')
        this.closeAddDialog()
      }
      this.searchList()
    },
    // 打开详情弹窗
    openDetailDialog(row) {
      linkDetail(row.uuid).then((res) => {
        this.detailData = res.data
      })
      this.detailDialogVisible = true
    },
    // 关闭详情弹窗
    closeDetailDialog() {
      this.detailDialogVisible = false
      this.detailData = {}
    },
    // 打开作废弹窗
    openCancelDialog(row) {
      this.cancelParams.uuid = row.uuid
      this.cancelDialogVisible = true
    },
    // 关闭作废弹窗
    closeCancelDialog() {
      this.cancelDialogVisible = false
      this.cancelParams = this.$options.data().cancelParams
      this.$refs.cancelParams.resetFields()
    },
    // 提交作废申请
    async submitCancel() {
      const res = await applyCancel(this.cancelParams)
      if (res.data === true) {
        this.$message.success('作废成功')
        this.closeCancelDialog()
      }
      this.searchList()
    },
    // 打开修改
    async openEditDialog(row) {
      this.editParams.uuid = row.uuid
      await linkDetail(row.uuid).then((res) => {
        this.editParams.amount = res.data.amount
        this.editParams.deadline = res.data.deadline
        this.editParams.linkId = res.data.linkId
        this.editParams.quantity = res.data.quantity
        this.editParams.reason = res.data.reason
        this.editParams.storeUuid = res.data.storeUuid
      })
      this.editDialogVisible = true
    },
    // 提交修改
    async submitEdit() {
      this.$refs.editParams.validate()
      const res = await applyEdit(this.editParams)
      if (res.data === true) {
        this.$message.success('修改成功')
        this.closeEditDialog()
      }
      this.searchList()
    },
    // 关闭修改弹窗
    closeEditDialog() {
      this.editDialogVisible = false
      this.editParams.amount = 0
      this.editParams.deadline = ''
      this.editParams.linkId = ''
      this.editParams.quantity = 0
      this.editParams.reason = ''
      this.editParams.storeUuid = ''
      this.editParams.uuid = ''
      this.$refs.editParams.resetFields()
    },
  },
}
</script>

<style>
.page_apply {
  padding: 40px;
}
</style>
