<script>
import { getFormatDate } from '@/utils/common'
import {
  fetch_getAllList,
  fetch_getRejectList,
  fetch_getDetail,
  fetch_submit,
} from '@/api/support/review/index'
import DetailDialog from './components/DetailDialog.vue'
import SearchForm from './components/SearchForm.vue'
import ReviewSubtable from './components/ReviewSubtable.vue'

export default {
  name: 'SupportReview',
  components: {
    DetailDialog,
    SearchForm,
    ReviewSubtable,
  },
  data() {
    return {
      // 查询入参
      reqParams: {
        applyType: '',
        auditStatus: 0,
        startTime: '',
        endTime: '',
        isInvalid: 0,
        isInvalidValue: false,
        planName: '',
        submitStatus: 10,
        page: 1,
        pageSize: 10,
        timeArr: [],
      },
      // 列表
      applyTableLoading: false,
      applyTableData: [],
      applyTableTotal: 0,

      // tabs
      searchType: 'all',
      searchTypeList: [
        { name: '全部', code: 'all' },
        { name: '我的驳回', code: 'reject' },
      ],

      // 详情弹窗
      showDetailDialog: false,
      detailData: {},

      // 二级列表
      helpSupportUuid: '',
      currentRowAuditStatus: null,
      currentRowSubmitStatus: null,
    }
  },
  async created() {
    this.setDefaultTime()
    this.getList()
  },
  methods: {
    // 点击分页
    handlePageChange(val) {
      this.reqParams.page = val.page
      this.getList()
    },

    // 获取列表
    async getList() {
      this.applyTableLoading = true
      try {
        this.reqParams.isInvalid = this.reqParams.isInvalidValue ? 1 : 0
        const params = { ...this.reqParams }
        const res =
          this.searchType === 'reject'
            ? await fetch_getRejectList(params)
            : await fetch_getAllList(params)
        const responseData = res.data || {}
        this.applyTableData = responseData.records || []
        this.applyTableTotal = responseData.total || 0
        // 重新查询父列表时 清空二级列表数据和查询条件
        if (this.$refs.reviewSubtableRef) {
          this.$refs.reviewSubtableRef.clearList()
        }
        this.helpSupportUuid = ''
      } finally {
        this.applyTableLoading = false
      }
    },

    // 点击搜索
    async clickSearch() {
      this.reqParams.page = 1
      await this.getList()
    },

    // 默认时间：当月1号至今
    setDefaultTime() {
      const now = new Date()
      now.setDate(1)
      now.setHours(0, 0, 0, 0)
      const start = now.getTime() + ''
      const end = new Date().getTime() + ''
      this.reqParams.timeArr = [start, end]
      this.reqParams.startTime = start
      this.reqParams.endTime = end
    },

    // 时间戳转日期
    getFormatDate(time) {
      return getFormatDate(+time)
    },

    // 操作：提交
    async handleSubmit(row) {
      const helpSupportUuid = row && row.helpUuid
      if (!helpSupportUuid) {
        this.$message.warning('缺少标识，无法提交')
        return
      }
      try {
        await this.$confirm('确认提交该条记录吗？', '提示', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning',
        })
      } catch (e) {
        return // 用户取消
      }
      const res = await fetch_submit(helpSupportUuid)
      if (res && res.code === 200) {
        this.$message.success('提交成功')
        this.clickSearch()
      }
    },

    // 操作：修改
    handleEdit(row) {
      this.$message.info('修改功能待联调')
      // console.log('edit', row)
    },

    // 操作：详情
    async handleDetail(row) {
      const helpSupportUuid = row && row.helpUuid
      if (!helpSupportUuid) {
        this.$message.warning('缺少标识，无法获取详情')
        return
      }
      const res = await fetch_getDetail(helpSupportUuid)
      this.detailData = res.data || {}
      this.showDetailDialog = true
    },

    // 点击表格行
    handleRowClick(row) {
      const helpSupportUuid = row && row.helpUuid
      if (helpSupportUuid) {
        this.helpSupportUuid = helpSupportUuid
        this.currentRowAuditStatus = row.auditStatus
        this.currentRowSubmitStatus = row.submitStatus
        this.$nextTick(() => {
          if (this.$refs.reviewSubtableRef) {
            // 清空筛选条件
            this.$refs.reviewSubtableRef.clearFilter()
            // 重新加载列表
            this.$refs.reviewSubtableRef.getList()
          }
        })
      }
    },
    // 是否展示提交按钮
    isShowSubmitButton(row) {
      // 二次审核 、待审核、空状态 && 未提交 展示提交按钮
      if (row.auditStatus == 1 && row.submitStatus == 0) {
        return true
      }
      if (row.auditStatus == 3 && row.submitStatus == 0) {
        return true
      }
      if (row.auditStatus == 4 && row.submitStatus == 0) {
        return true
      }
      if (row.auditStatus == null) {
        return true
      }

      return false
    },
  },
}
</script>

<template>
  <div class="app-container">
    <div>
      <SearchForm v-model="reqParams" @search="clickSearch" />
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
        row-key="operationUuid"
        @row-click="handleRowClick"
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
        <el-table-column label="操作" width="220" align="center">
          <template v-slot="{ row }">
            <el-button
              v-if="isShowSubmitButton(row)"
              type="text"
              size="mini"
              @click.stop="handleSubmit(row)"
            >提交</el-button>
            <!-- <el-button
              v-if="row.submitStatus === 0"
              type="text"
              size="mini"
              @click.stop="handleEdit(row)"
              >修改</el-button
            >-->
            <el-button type="text" size="mini" @click.stop="handleDetail(row)">详情</el-button>
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

      <ReviewSubtable
        ref="reviewSubtableRef"
        :helpSupportUuid="helpSupportUuid"
        :auditStatus="currentRowAuditStatus"
        :submitStatus="currentRowSubmitStatus"
      />
    </div>

    <!-- 详情弹层 -->
    <DetailDialog
      :visible="showDetailDialog"
      :detailData="detailData"
      @close="showDetailDialog = false"
    />
  </div>
</template>

<style lang="scss" scoped></style>
