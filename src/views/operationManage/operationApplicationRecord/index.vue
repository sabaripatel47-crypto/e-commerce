<template>
  <div class="app-container">
    <div>
      <div class="search-form">
        <el-form class="page-search" inline ref="page-filter">
          <!--提交时间范围 -->
          <el-form-item label="提交时间范围:" style="margin-right: 20px">
            <el-date-picker
              class="date-picker-width240"
              v-model="reqParams.timeArr"
              :clearable="false"
              type="daterange"
              align="right"
              unlink-panels
              value-format="timestamp"
              @change="changeTime"
            ></el-date-picker>
          </el-form-item>
          <el-form-item label="计划名称:" style="margin-right: 20px">
            <el-input v-model="reqParams.planName" placeholder="请输入计划名称"></el-input>
          </el-form-item>
          <el-form-item label="申请类型:" style="margin-right: 20px">
            <el-select
              v-model="reqParams.applyType"
              class="select-width120"
              filterable
              clearable
              placeholder="请选择"
            >
              <el-option
                v-for="(item, index) in applyTypeSelectList"
                :key="index"
                :label="item.name"
                :value="item.code"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="审核状态:" style="margin-right: 20px">
            <el-select
              v-model="reqParams.auditStatus"
              class="select-width120"
              filterable
              placeholder="请选择"
            >
              <el-option
                v-for="(item, index) in auditStatusSelectList"
                :key="index"
                :label="item.name"
                :value="item.code"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="提交状态:" style="margin-right: 20px">
            <el-select
              v-model="reqParams.submitStatus"
              class="select-width120"
              filterable
              placeholder="请选择"
            >
              <el-option
                v-for="(item, index) in submitStatusSelectList"
                :key="index"
                :label="item.name"
                :value="item.code"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="margin-right: 20px">
            <el-checkbox v-model="reqParams.isInvalidValue">是否作废</el-checkbox>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="clickSearch()">搜索</el-button>
          </el-form-item>
          <br />
          <el-form-item>
            <el-button type="primary" plain icon="el-icon-plus" @click="openPlanMonthDialog">新增常规</el-button>
            <el-button
              type="primary"
              plain
              icon="el-icon-plus"
              @click="openExplosiveApplicationDialog"
            >新增打爆</el-button>
            <el-button
              type="primary"
              plain
              icon="el-icon-plus"
              @click="openMakeUpTheOrderDialog"
            >新增补单</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-radio-group v-model="searchType" @change="clickSearch">
        <el-radio-button
          v-for="item in searchTypeList"
          :key="item.code"
          :label="item.code"
        >{{ item.name }}</el-radio-button>
      </el-radio-group>
      <el-table
        v-loading="applyTableLoading"
        height="400"
        border
        :data="applyTableData"
        style="width: 100%"
        @row-click="getSubtable"
        row-key="operationUuid"
      >
        <el-table-column width="50" label="序号" type="index" align="center"></el-table-column>
        <el-table-column label="提交日期" width="100" prop="submitTime" align="center">
          <template v-slot="{ row }">
            <span>{{ getFormatDate(row.submitTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="计划名称" show-overflow-tooltip prop="planName" align="center"></el-table-column>
        <el-table-column label="申请人" width="80" prop="applyName" align="center"></el-table-column>
        <el-table-column label="申请类型" width="100" prop="applyTypeName" align="center"></el-table-column>
        <el-table-column label="申请说明" show-overflow-tooltip prop="applyInformation" align="center"></el-table-column>
        <el-table-column label="起始日期" width="100" prop="startTime" align="center">
          <template v-slot="{ row }">
            <span>{{ getFormatDate(row.startTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="结束日期" width="100" prop="endTime" align="center">
          <template v-slot="{ row }">
            <span>{{ getFormatDate(row.endTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="审核状态" width="100" prop="auditStatusName" align="center"></el-table-column>
        <el-table-column label="提交状态" width="100" prop="submitStatusName" align="center"></el-table-column>
        <el-table-column label="操作" width="240" align="center">
          <template v-slot="{ row }">
            <el-button
              type="text"
              size="mini"
              icon="el-icon-view"
              @click.stop="openDetailDialog(row.operationUuid)"
            >详情</el-button>
            <el-button
              v-if="
                row.submitStatus === 0 && row.auditStatus !== 3 && !row.invalid
              "
              icon="el-icon-edit"
              size="mini"
              @click="updateApply(row)"
              type="text"
            >修改</el-button>
            <el-button
              v-if="row.auditStatus === 3"
              icon="el-icon-plus"
              type="text"
              size="mini"
              @click="updateApply(row)"
            >重新发起</el-button>
            <el-button
              type="text"
              icon="el-icon-delete"
              size="mini"
              v-if="!row.invalid && row.submitStatus == 0"
              @click.stop="cancelApply(row.operationUuid)"
            >作废</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="applyTableTotal > 0"
        :total="applyTableTotal"
        :page.sync="reqParams.page"
        :limit.sync="reqParams.pageSize"
        @pagination="handlePageChange"
      />
    </div>
    <div>
      <OperationSubtable ref="operationSubtableRef" :operationUuid.sync="operationUuid"></OperationSubtable>
    </div>

    <!-- 详情弹层 -->
    <el-dialog title="详情" :visible="showDetailDialog" width="40%" @close="showDetailDialog = false">
      <el-descriptions :column="2">
        <el-descriptions-item label="提交日期">
          {{
          getFormatDate(detailData.submitTime)
          }}
        </el-descriptions-item>
        <el-descriptions-item label="申请人">
          {{
          detailData.applyName
          }}
        </el-descriptions-item>
        <el-descriptions-item label="申请说明">
          {{
          detailData.applyInformation || "无"
          }}
        </el-descriptions-item>
        <el-descriptions-item label="申请类型">
          {{
          detailData.applyTypeName
          }}
        </el-descriptions-item>
        <el-descriptions-item v-if="detailData.auditUuidName" label="审核人">
          {{
          detailData.auditUuidName
          }}
        </el-descriptions-item>
        <el-descriptions-item label="审核状态">
          {{
          detailData.auditStatusName
          }}
        </el-descriptions-item>
        <el-descriptions-item v-if="detailData.rejectTime" label="驳回时间">
          {{
          getFormatDate(detailData.rejectTime)
          }}
        </el-descriptions-item>
        <el-descriptions-item v-if="detailData.rejectReason" label="驳回原因">
          {{
          detailData.rejectReason
          }}
        </el-descriptions-item>
        <el-descriptions-item v-if="detailData.invalidTime" label="作废时间">
          {{
          getFormatDate(detailData.invalidTime)
          }}
        </el-descriptions-item>
        <el-descriptions-item
          v-if="detailData.invalidReason"
          label="作废原因"
        >{{ detailData.invalidReason }}</el-descriptions-item>
      </el-descriptions>
      <div class="dialog-footer-btn">
        <el-button @click="showDetailDialog = false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 运营申请新增计划月份弹层 -->
    <el-dialog
      title="新增计划月份"
      :visible="showPlanMonthDialog"
      width="30%"
      :close-on-click-modal="false"
      @close="closePlanMonthDialog"
    >
      <el-form :label-position="'right'" label-width="140px">
        <el-form-item
          label="计划月份："
          :rules="{
            required: true,
            message: '请选择计划月份',
            trigger: 'blur',
          }"
        >
          <el-date-picker
            v-model="modelPlanTime"
            :clearable="false"
            type="month"
            align="right"
            unlink-panels
            value-format="timestamp"
          ></el-date-picker>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closePlanMonthDialog">取 消</el-button>
        <el-button :disabled="!modelPlanTime" type="primary" @click="submitPlanMonth">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 运营申请补单计划月份弹层 -->
    <el-dialog
      title="新增补单月份"
      :visible="showPlanMonthBDialog"
      width="30%"
      :close-on-click-modal="false"
      @close="closePlanMonthBDialogFn"
    >
      <el-form :label-position="'right'" label-width="140px">
        <el-form-item
          label="补单月份："
          :rules="{
            required: true,
            message: '请选择补单月份',
            trigger: 'blur',
          }"
        >
          <el-date-picker
            v-model="modelPlanTime"
            :clearable="false"
            type="month"
            align="right"
            unlink-panels
            value-format="timestamp"
          ></el-date-picker>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closePlanMonthBDialogFn">取 消</el-button>
        <el-button :disabled="!modelPlanTime" type="primary" @click="submitPlanMonthB">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 作废弹层 -->
    <el-dialog
      title="作废"
      :visible="showCancelDialog"
      width="30%"
      :close-on-click-modal="false"
      @close="closeCancelDialog"
    >
      <el-form :label-position="'right'" ref="cencelFormRef" label-width="100px">
        <el-form-item
          label="作废原因："
          :rules="{
            required: true,
            message: '请输入作废原因',
            trigger: 'blur',
          }"
        >
          <el-input
            type="textarea"
            :rows="2"
            :autosize="{ minRows: 3, maxRows: 6 }"
            placeholder="请输入作废原因"
            v-model="cancelReason"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeCancelDialog">取 消</el-button>
        <el-button :disabled="!cancelReason" type="primary" @click="submitCancel">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 运营申请弹层 -->
    <OperationApplication
      v-if="showOperationApplicationDialog"
      :showDialog.sync="showOperationApplicationDialog"
      :isEdit.sync="isEdit"
      :applyUuid.sync="applyUuid"
      :planTime.sync="planTime"
      :auditStatus.sync="auditStatus"
      @getList="clickSearch"
      @getSubtable="getSubtable"
    ></OperationApplication>

    <!-- 打爆申请弹层 -->
    <ExplosiveApplication
      v-if="showExplosiveApplicationDialog"
      :showDialog.sync="showExplosiveApplicationDialog"
      :isEdit.sync="isEdit"
      :applyUuid.sync="applyUuid"
      :auditStatus.sync="auditStatus"
      @getSubtable="getSubtable"
      @getList="clickSearch"
    ></ExplosiveApplication>

    <!-- 补单申请弹层 -->
    <PlaceAnOrderForAReplacement
      v-if="showOperationApplicationBDialog"
      :showDialog.sync="showOperationApplicationBDialog"
      :isEdit.sync="isEdit"
      :applyUuid.sync="applyUuidB"
      :planTime.sync="planTime"
      :auditStatus.sync="auditStatus"
      @getList="clickSearch"
      @getSubtable="getSubtable"
    ></PlaceAnOrderForAReplacement>
  </div>
</template>

<script>
import {
  getApplyTypeSelectList, // 获取申请类型下拉框列表
  getAuditStatusSelectList, // 获取审核状态下拉框列表
  getSubmitStatusSelectList, // 获取提交状态下拉框列表
} from '@/api/operationManage/common'
import {
  getAllList, // 获取全部列表
  getRejectList, // 获取驳回列表
  submitPlannedMonth, // 提交月份计划
  submitPlannedMonthB, // 提交补单月份
  getPlanName, // 获取计划名称
  invalidApply, // 作废申请记录
  getApplyDetail, // 获取申请详情
  getPlanNameB, // 获取补单计划名称
} from '@/api/operationManage/operationApplicationRecord'
import { getFormatDate } from '@/utils/common'
import OperationApplication from '../components/OperationApplication.vue'
import PlaceAnOrderForAReplacement from '../components/PlaceAnOrderForAReplacement.vue'
import ExplosiveApplication from '../components/ExplosiveApplication.vue'
import OperationSubtable from '../components/OperationSubtable.vue'
export default {
  name: 'OperationApplicationRecord',
  components: {
    OperationApplication,
    ExplosiveApplication,
    OperationSubtable,
    PlaceAnOrderForAReplacement,
  },
  data() {
    return {
      // 获取列表数据入参
      reqParams: {
        applyType: '', //	申请类型
        auditStatus: 0, // 审核状态
        startTime: '', // 开始时间
        endTime: '', // 结束时间
        isInvalid: 0, // 是否作废
        isInvalidValue: false, // 是否作废绑定值
        planName: '', // 计划名称
        submitStatus: 10, // 提交状态
        page: 1,
        pageSize: 10,
        timeArr: [],
      },
      // 查询列表数据类型
      searchType: 'all',
      // 列表数据
      applyTableData: [],
      // 列表加载
      applyTableLoading: false,
      // 列表总条数
      applyTableTotal: 0,

      // 点击行的uuid
      operationUuid: '',

      // 是否编辑
      isEdit: false,

      // 点击的申请uuid
      applyUuid: '',

      // 点击的补单申请uuid
      applyUuidB: '',

      // 点击的申请 审核状态
      auditStatus: null,

      // 查询列表类型
      searchTypeList: [
        { name: '全部', code: 'all' },
        { name: '我的驳回', code: 'reject' },
      ],

      // 下拉框
      applyTypeSelectList: [], // 申请类型
      auditStatusSelectList: [], // 审核状态
      submitStatusSelectList: [], // 提交状态

      // 弹层
      showOperationApplicationDialog: false, // 运营申请
      showExplosiveApplicationDialog: false, // 打爆申请
      showOperationApplicationBDialog: false, // 补单申请
      showDetailDialog: false, // 详情
      showCancelDialog: false, // 作废

      // 新增计划月份弹层
      showPlanMonthDialog: false,
      // 新增补单月份弹层
      showPlanMonthBDialog: false,
      // 月份绑定值
      modelPlanTime: null,
      // 组件传输的月份值
      planTime: null,

      // 详情数据
      detailData: {},

      // 作废原因
      cancelReason: '',
      cancelUuid: '', // 作废申请的uuid

      // 补单计划名称
      planNameB: '',
    }
  },
  async created() {
    // 设置默认时间
    this.setDefaultTime()
    // 获取下拉框
    this.getApplyTypeSelectList() // 申请类型
    this.getAuditStatusSelectList() // 审核状态
    this.getSubmitStatusSelectList() // 提交状态
    this.getList() // 获取列表
  },
  methods: {
    /* ------------- 作废 ------------------------------- */
    // 点击作废
    cancelApply(uuid) {
      this.showCancelDialog = true
      this.cancelUuid = uuid
    },

    // 提交作废
    async submitCancel() {
      const res = await invalidApply({
        invalidReason: this.cancelReason,
        operationUuid: this.cancelUuid,
      })
      if (res.code === 200) {
        this.$message.success('作废成功')
        this.closeCancelDialog()
      }
    },

    // 关闭作废弹层
    async closeCancelDialog() {
      await this.$refs.cencelFormRef.resetFields()
      this.showCancelDialog = false
      this.clickSearch()
      this.cancelReason = ''
      this.cancelUuid = ''
    },

    /* ------------- 详情 ------------------------------- */
    // 打开详情弹层
    async openDetailDialog(uuid) {
      // 获取详情数据
      const res = await getApplyDetail(uuid)
      this.detailData = res.data
      this.showDetailDialog = true
    },

    /* ------------ 计划月份 ------------------------------ */
    // 打开计划月份弹层
    async openPlanMonthDialog() {
      this.showPlanMonthDialog = true
    },

    // 关闭新增月份弹层
    closePlanMonthDialog() {
      this.showPlanMonthDialog = false
      this.modelPlanTime = null

      this.clickSearch()
    },

    // 关闭补单月份弹层
    closePlanMonthBDialogFn() {
      this.showPlanMonthBDialog = false
      this.modelPlanTime = null

      this.clickSearch()
    },

    // 提交计划月份
    async submitPlanMonth() {
      this.planTime = this.modelPlanTime
      const res = await submitPlannedMonth(this.modelPlanTime)
      if (res.code === 200) {
        // this.$message.success('提交成功')
        this.applyUuid = res.data
        await getPlanName(this.applyUuid)
        this.closePlanMonthDialog()
        this.openOperationApplicationDialog()
      }
    },

    // 提交补单月份
    async submitPlanMonthB() {
      this.planTime = this.modelPlanTime
      const res = await submitPlannedMonthB(this.modelPlanTime)

      if (res.code === 200) {
        // this.$message.success('提交成功')
        this.applyUuidB = res.data
        const resB = await getPlanNameB(res.data)
        this.planNameB = resB.data
        this.closePlanMonthBDialogFn()
        this.openOperationApplicationBDialog()
      }
    },

    /* ------------ 子列表 ------------------------------ */

    // 获取子集列表
    getSubtable(val) {
      this.$refs.operationSubtableRef?.clearList()
      this.operationUuid = val.operationUuid
      this.$refs.operationSubtableRef?.getList()
    },

    // 点击修改
    updateApply(row) {
      this.isEdit = true
      this.applyUuid = row.operationUuid
      this.applyUuidB = row.operationUuid
      this.auditStatus = row.auditStatus

      if (row.applyType === 4) {
        this.planTime = +row.startTime
        // 补单
        this.showOperationApplicationBDialog = true
      } else if (row.applyType === 2) {
        // 打开打爆申请的弹层
        this.showExplosiveApplicationDialog = true
      } else {
        this.planTime = +row.startTime
        this.showOperationApplicationDialog = true
      }
    },

    // 打开运营申请弹层
    openOperationApplicationDialog() {
      this.isEdit = false
      this.showOperationApplicationDialog = true
    },

    // 打开补单申请弹层
    openOperationApplicationBDialog() {
      this.isEdit = false
      this.showOperationApplicationBDialog = true
    },

    // 打开打爆申请弹层
    openExplosiveApplicationDialog() {
      this.isEdit = false
      this.showExplosiveApplicationDialog = true
    },

    // 打开补单弹层
    openMakeUpTheOrderDialog() {
      this.showPlanMonthBDialog = true
    },

    // 点击分页
    handlePageChange(val) {
      this.reqParams.page = val.page
      this.getList()
    },

    // 获取列表
    async getList() {
      this.reqParams.isInvalid = this.reqParams.isInvalidValue ? 1 : 0
      let responseData = []
      if (this.searchType === 'all') {
        const res = await getAllList(this.reqParams)
        responseData = res.data
      } else {
        const res = await getRejectList(this.reqParams)
        responseData = res.data
      }
      this.applyTableData = responseData.records || []
      this.applyTableTotal = responseData.total
      // 重新查询父列表时 清空子列表数据和查询条件
      this.$refs.operationSubtableRef?.clearList()
      this.operationUuid = ''
    },

    // 点击搜索查询
    async clickSearch() {
      this.reqParams.page = 1
      await this.getList()
    },

    // 设置默认时间
    setDefaultTime() {
      const now = new Date()
      // 设置当月第一天
      now.setDate(1)
      // 设置时分秒为0
      now.setHours(0, 0, 0, 0)
      // 获取第一天的时间戳
      const timestamp = now.getTime() + ''
      this.reqParams.timeArr = [timestamp, new Date().getTime() + '']
      this.changeTime(this.reqParams.timeArr)
    },

    // 提交时间范围change事件
    changeTime(val) {
      if (val) {
        this.reqParams.startTime = val[0]
        this.reqParams.endTime = val[1]
      }
    },

    // 获取申请类型下拉框列表
    async getApplyTypeSelectList() {
      const res = await getApplyTypeSelectList()
      this.applyTypeSelectList = res.data
    },

    // 获取审核状态下拉框列表
    async getAuditStatusSelectList() {
      const res = await getAuditStatusSelectList()
      this.auditStatusSelectList = res.data
    },

    // 获取提交状态下拉框列表
    async getSubmitStatusSelectList() {
      const res = await getSubmitStatusSelectList()
      this.submitStatusSelectList = res.data
    },

    // 时间戳转日期
    getFormatDate(time) {
      return getFormatDate(+time)
    },
  },
}
</script>

<style lang="scss" scoped>
.search-form {
  .el-form-item {
    margin-bottom: 10px;
  }
}

.dialog-footer-btn {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.date-picker-width240 {
  width: 240px;
}

.select-width120 {
  width: 120px;
}
</style>
