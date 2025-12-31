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
          <el-form-item label="申请类型:" style="margin-right: 20px;">
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
          <el-form-item label="审核状态:" style="margin-right: 20px;">
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
          <el-form-item label="负责人：" style="margin-right: 20px">
            <el-cascader
              filterable
              v-model="reqParams.managerUuid"
              :options="departments"
              :show-all-levels="false"
              :props="{
              children: 'children',
              label: 'deptName',
              value: 'deptId',
              checkStrictly: false,
            }"
              clearable
            ></el-cascader>
          </el-form-item>
          <el-form-item style="margin-right: 20px;">
            <el-checkbox v-model="reqParams.isInvalidValue">是否作废</el-checkbox>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="clickSearch()">搜索</el-button>
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
          <template v-slot="{row}">
            <span>{{ getFormatDate(row.submitTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="计划名称" show-overflow-tooltip prop="planName" align="center"></el-table-column>
        <el-table-column label="申请人" width="80" prop="applyName" align="center"></el-table-column>
        <el-table-column label="申请类型" width="100" prop="applyTypeName" align="center"></el-table-column>
        <el-table-column label="申请说明" show-overflow-tooltip prop="applyInformation" align="center"></el-table-column>
        <el-table-column label="起始日期" width="100" prop="startTime" align="center">
          <template v-slot="{row}">
            <span>{{ getFormatDate(row.startTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="结束日期" width="100" prop="endTime" align="center">
          <template v-slot="{row}">
            <span>{{ getFormatDate(row.endTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="审核状态" width="100" prop="auditStatusName" align="center"></el-table-column>

        <el-table-column label="操作" width="240" align="center">
          <template v-slot="{row}">
            <el-button
              type="text"
              size="mini"
              icon="el-icon-check"
              v-if="[1,4].includes(row.auditStatus) && !row.invalid"
              @click.stop="submitPass(row.operationUuid)"
            >通过</el-button>
            <el-button
              type="text"
              size="mini"
              icon="el-icon-close"
              v-if="[1,4].includes(row.auditStatus) && !row.invalid"
              @click.stop="openRejectDialog(row.operationUuid)"
            >驳回</el-button>
            <el-button
              type="text"
              icon="el-icon-view"
              size="mini"
              @click.stop="openDetailDialog(row.operationUuid)"
            >详情</el-button>
            <el-button
              type="text"
              icon="el-icon-delete"
              size="mini"
              v-if="!row.invalid && row.auditStatus !== 2"
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
        <el-descriptions-item label="提交日期">{{ getFormatDate(detailData.submitTime) }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ detailData.applyName }}</el-descriptions-item>
        <el-descriptions-item label="申请说明">{{ detailData.applyInformation || '无' }}</el-descriptions-item>
        <el-descriptions-item label="申请类型">{{ detailData.applyTypeName }}</el-descriptions-item>
        <el-descriptions-item
          v-if="detailData.auditUuidName"
          label="审核人"
        >{{ detailData.auditUuidName }}</el-descriptions-item>
        <el-descriptions-item label="审核状态">{{ detailData.auditStatusName }}</el-descriptions-item>
        <el-descriptions-item
          v-if="detailData.rejectTime"
          label="驳回时间"
        >{{ getFormatDate(detailData.rejectTime) }}</el-descriptions-item>
        <el-descriptions-item
          v-if="detailData.rejectReason"
          label="驳回原因"
        >{{ detailData.rejectReason }}</el-descriptions-item>
        <el-descriptions-item
          v-if="detailData.invalidTime"
          label="作废时间"
        >{{ getFormatDate(detailData.invalidTime) }}</el-descriptions-item>
        <el-descriptions-item
          v-if="detailData.invalidReason"
          label="作废原因"
        >{{ detailData.invalidReason }}</el-descriptions-item>
      </el-descriptions>
      <div class="dialog-footer-btn">
        <el-button @click="showDetailDialog = false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 驳回弹层 -->
    <el-dialog
      title="驳回"
      :visible="showRejectDialog"
      width="30%"
      :close-on-click-modal="false"
      @close="closeRejectDialog"
    >
      <el-form :label-position="'right'" ref="rejectFormRef" label-width="100px">
        <el-form-item label="驳回原因：" :rules="{required: true, message: '请输入驳回原因', trigger: 'blur'}">
          <el-input
            type="textarea"
            :rows="2"
            :autosize="{ minRows: 3, maxRows: 6}"
            placeholder="请输入驳回原因"
            v-model="rejectReason"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeRejectDialog">取 消</el-button>
        <el-button :disabled="!rejectReason" type="primary" @click="submitReject">确 定</el-button>
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
        <el-form-item label="作废原因：" :rules="{required: true, message: '请输入作废原因', trigger: 'blur'}">
          <el-input
            type="textarea"
            :rows="2"
            :autosize="{ minRows: 3, maxRows: 6}"
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
  </div>
</template>

<script>
import {
  getApplyTypeSelectList, // 获取申请类型下拉框列表
  getAuditStatusSelectList, // 获取审核状态下拉框列表
  getSubmitStatusSelectList, // 获取提交状态下拉框列表
} from '@/api/operationManage/common'
import {
  invalidApply, // 作废申请记录
  getApplyDetail, // 获取申请详情
} from '@/api/operationManage/operationApplicationRecord'
import {
  getAllList, // 获取全部列表
  getPendingList, // 获取待处理列表
  passAudit, // 通过审核
  rejectAudit, // 驳回审核
} from '@/api/operationManage/operationApplicationReview'
import { getFormatDate, getDeptTreeData } from '@/utils/common'
import OperationApplication from '../components/OperationApplication.vue'
import ExplosiveApplication from '../components/ExplosiveApplication.vue'
import OperationSubtable from '../components/OperationSubtable.vue'
import { department } from '@/api/information/department'
export default {
  name: 'OperationApplicationReview',
  components: {
    OperationApplication,
    ExplosiveApplication,
    OperationSubtable,
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
        managerUuid: '',
      },
      // 查询列表数据类型
      searchType: 'all',
      // 列表数据
      applyTableData: [],
      // 列表加载
      applyTableLoading: false,
      // 列表总条数
      applyTableTotal: 0,

      //部门人员的下拉框
      departments: [],

      // 点击行的uuid
      operationUuid: '',

      // 查询列表类型
      searchTypeList: [
        { name: '全部', code: 'all' },
        { name: '待处理', code: 'pending' },
      ],

      // 下拉框
      applyTypeSelectList: [], // 申请类型
      auditStatusSelectList: [], // 审核状态
      submitStatusSelectList: [], // 提交状态

      // 弹层
      showDetailDialog: false, // 详情
      showCancelDialog: false, // 作废
      showRejectDialog: false, // 驳回

      // 详情数据
      detailData: {},

      // 作废原因
      cancelReason: '',
      cancelUuid: '', // 作废申请的uuid

      // 驳回原因
      rejectReason: '',
      rejectUuid: '',
    }
  },
  async created() {
    // 设置默认时间
    this.setDefaultTime()
    // 获取下拉框
    this.getApplyTypeSelectList() // 申请类型
    this.getAuditStatusSelectList() // 审核状态
    this.getSubmitStatusSelectList() // 提交状态
    this.getDeptTree() // 部门和人的级联
    this.getList() // 获取列表
  },
  methods: {
    // 负责人组织架构数据
    async getDeptTree() {
      const res = await department()
      this.departments = await getDeptTreeData(res.data)
    },
    /* ------------- 通过 ------------------------------- */
    async submitPass(uuid) {
      // 弹层提醒是否确定提交 提交后不可修改
      this.$confirm('是否确定通过该申请？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        beforeClose: async (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '加载中...'
            const [err, res] = await this.$to(passAudit(uuid))
            if (err) {
              console.error('提交失败', err)
            }
            instance.confirmButtonLoading = false
            await done()
            this.clickSearch()
            if (res) {
              this.$message({
                type: 'success',
                message: '已通过申请 ！',
              })
            }
          } else {
            await done()
          }
        },
      })
    },

    /* ------------- 驳回 ------------------------------- */
    // 打开驳回弹层
    openRejectDialog(uuid) {
      this.rejectUuid = uuid
      this.showRejectDialog = true
    },

    // 提交驳回
    async submitReject() {
      const res = await rejectAudit({
        rejectReason: this.rejectReason,
        operationUuid: this.rejectUuid,
      })
      if (res.code === 200) {
        this.$message.success('驳回成功')
        this.closeRejectDialog()
      }
    },

    // 关闭驳回弹层
    closeRejectDialog() {
      this.$refs.rejectFormRef.resetFields()
      this.showRejectDialog = false
      this.clickSearch()
      this.rejectReason = ''
      this.rejectUuid = ''
    },

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

    /* ------------ 子列表 ------------------------------ */

    // 获取子集列表
    getSubtable(val) {
      this.$refs.operationSubtableRef.clearList()
      this.operationUuid = val.operationUuid
      this.$refs.operationSubtableRef.getList()
    },

    /* ------------ 父列表 ------------------------------ */

    // 点击分页
    handlePageChange(val) {
      this.reqParams.page = val.page
      this.getList()
    },

    // 获取列表
    async getList() {
      this.applyTableLoading = true
      this.reqParams.isInvalid = this.reqParams.isInvalidValue ? 1 : 0

      if (Array.isArray(this.reqParams.managerUuid)) {
        this.reqParams.managerUuid =
          this.reqParams.managerUuid[this.reqParams.managerUuid.length - 1]
      }
      let responseData = []
      if (this.searchType === 'all') {
        const res = await getAllList(this.reqParams)
        responseData = res.data
      } else {
        const res = await getPendingList(this.reqParams)
        responseData = res.data
      }
      this.applyTableData = responseData.records || []
      this.applyTableTotal = responseData.total
      this.$refs.operationSubtableRef.clearList()
      this.operationUuid = ''

      this.applyTableLoading = false
    },

    // 点击搜索查询
    async clickSearch() {
      this.reqParams.page = 1
      await this.getList()
    },

    /* ------------ 其它 ------------------------------ */

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