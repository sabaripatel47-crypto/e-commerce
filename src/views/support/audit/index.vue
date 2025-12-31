<script>
import { getFormatDate } from "@/utils/common";
import {
  fetch_getAllList,
  fetch_getPendingList,
  fetch_getDetail,
  fetch_submit,
  fetch_pass,
} from "@/api/support/audit/index";
import DetailDialog from "./components/DetailDialog.vue";
import RejectDialog from "./components/RejectDialog.vue";
import InvalidDialog from "./components/InvalidDialog.vue";
import SearchForm from "./components/SearchForm.vue";
import AuditSubtable from "./components/AuditSubtable.vue";

export default {
  name: "SupportAudit",
  components: {
    DetailDialog,
    RejectDialog,
    InvalidDialog,
    SearchForm,
    AuditSubtable,
  },
  data() {
    return {
      // 查询入参
      reqParams: {
        applyType: "",
        auditStatus: 0,
        startTime: "",
        endTime: "",
        isInvalid: 0,
        isInvalidValue: false,
        planName: "",
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
      searchType: "pending",
      searchTypeList: [
        { name: "待处理", code: "pending" },
        { name: "全部", code: "all" },
      ],

      // 详情弹窗
      showDetailDialog: false,
      detailData: {},

      // 驳回弹窗
      showRejectDialog: false,
      rejectHelpSupportUuid: "",

      // 作废弹窗
      showInvalidDialog: false,
      invalidHelpSupportUuid: "",

      // 二级列表
      helpSupportUuid: "",
      currentRowAuditStatus: null,
      currentRowSubmitStatus: null,
    };
  },
  async created() {
    this.setDefaultTime();
    this.getList();
  },
  methods: {
    // 点击分页
    handlePageChange(val) {
      this.reqParams.page = val.page;
      this.getList();
    },

    // 获取列表
    async getList() {
      this.applyTableLoading = true;
      try {
        this.reqParams.isInvalid = this.reqParams.isInvalidValue ? 1 : 0;
        const params = { ...this.reqParams };
        const res =
          this.searchType === "pending"
            ? await fetch_getPendingList(params)
            : await fetch_getAllList(params);
        const responseData = res.data || {};
        this.applyTableData = responseData.records || [];
        this.applyTableTotal = responseData.total || 0;
        // 重新查询父列表时 清空二级列表数据和查询条件
        if (this.$refs.auditSubtableRef) {
          this.$refs.auditSubtableRef.clearList();
        }
        this.helpSupportUuid = "";
        this.currentRowAuditStatus = null;
        this.currentRowSubmitStatus = null;
      } finally {
        this.applyTableLoading = false;
      }
    },

    // 默认时间：当月1号至今
    setDefaultTime() {
      const now = new Date();
      now.setDate(1);
      now.setHours(0, 0, 0, 0);
      const start = now.getTime() + "";
      const end = new Date().getTime() + "";
      this.reqParams.timeArr = [start, end];
      this.reqParams.startTime = start;
      this.reqParams.endTime = end;
    },

    // 点击搜索
    async clickSearch() {
      this.reqParams.page = 1;
      await this.getList();
    },

    // 时间戳转日期
    getFormatDate(time) {
      return getFormatDate(+time);
    },

    // 操作：提交
    async handleSubmit(row) {
      const helpSupportUuid = row && row.helpUuid;
      if (!helpSupportUuid) {
        this.$message.warning("缺少标识，无法提交");
        return;
      }
      try {
        await this.$confirm("确认提交该条记录吗？", "提示", {
          confirmButtonText: "确认",
          cancelButtonText: "取消",
          type: "warning",
        });
      } catch (e) {
        return; // 用户取消
      }
      const res = await fetch_submit(helpSupportUuid);
      if (res && res.code === 200) {
        this.$message.success("提交成功");
        this.clickSearch();
      }
    },

    // 操作：通过
    async handlePass(row) {
      const helpSupportUuid = row && row.helpUuid;
      if (!helpSupportUuid) {
        this.$message.warning("缺少标识，无法通过");
        return;
      }
      try {
        await this.$confirm("确认通过该条记录吗？", "提示", {
          confirmButtonText: "确认",
          cancelButtonText: "取消",
          type: "warning",
        });
      } catch (e) {
        return; // 用户取消
      }
      try {
        const res = await fetch_pass(helpSupportUuid);
        if (res && res.code === 200) {
          this.$message.success("通过成功");
          this.clickSearch();
        }
      } catch (error) {
        console.error("通过失败:", error);
        this.$message.error("通过失败，请重试");
      }
    },

    // 操作：驳回
    handleReject(row) {
      const helpSupportUuid = row && row.helpUuid;
      if (!helpSupportUuid) {
        this.$message.warning("缺少标识，无法驳回");
        return;
      }
      this.rejectHelpSupportUuid = helpSupportUuid;
      this.showRejectDialog = true;
    },

    // 操作：作废
    handleInvalid(row) {
      const helpSupportUuid = row && row.helpUuid;
      if (!helpSupportUuid) {
        this.$message.warning("缺少标识，无法作废");
        return;
      }
      this.invalidHelpSupportUuid = helpSupportUuid;
      this.showInvalidDialog = true;
    },

    // 操作：详情
    async handleDetail(row) {
      const helpSupportUuid = row && row.helpUuid;
      if (!helpSupportUuid) {
        this.$message.warning("缺少标识，无法获取详情");
        return;
      }
      const res = await fetch_getDetail(helpSupportUuid);
      this.detailData = res.data || {};
      this.showDetailDialog = true;
    },

    // 点击表格行
    handleRowClick(row) {
      const helpSupportUuid = row && row.helpUuid;
      if (helpSupportUuid) {
        this.helpSupportUuid = helpSupportUuid;
        this.currentRowAuditStatus = row.auditStatus;
        this.currentRowSubmitStatus = row.submitStatus;
        this.$nextTick(() => {
          if (this.$refs.auditSubtableRef) {
            // 清空筛选条件
            this.$refs.auditSubtableRef.clearFilter();
            // 重新加载列表
            this.$refs.auditSubtableRef.getList();
          }
        });
      }
    },
    // 是否展示提交按钮
    isShowSubmitButton(row) {
      if (row.invalid) {
        return false;
      }
      // 二次审核 、待审核 展示提交按钮
      if (row.auditStatus == 1 || row.auditStatus == 4) {
        return true;
      }

      return false;
    },
  },
};
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
          >{{ item.name }}</el-radio-button
        >
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
        <el-table-column
          width="50"
          label="序号"
          type="index"
          align="center"
        ></el-table-column>
        <el-table-column
          label="提交日期"
          width="100"
          prop="submitTime"
          align="center"
        >
          <template v-slot="{ row }">
            <span>{{ getFormatDate(row.submitTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="计划名称"
          show-overflow-tooltip
          prop="planName"
          align="center"
        ></el-table-column>
        <el-table-column
          label="申请人"
          width="80"
          prop="applyName"
          align="center"
        ></el-table-column>
        <el-table-column
          label="申请类型"
          width="100"
          prop="applyTypeName"
          align="center"
        ></el-table-column>
        <el-table-column
          label="申请说明"
          show-overflow-tooltip
          prop="applyInformation"
          align="center"
        ></el-table-column>
        <el-table-column
          label="起始日期"
          width="100"
          prop="startTime"
          align="center"
        >
          <template v-slot="{ row }">
            <span>{{ getFormatDate(row.startTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="结束日期"
          width="100"
          prop="endTime"
          align="center"
        >
          <template v-slot="{ row }">
            <span>{{ getFormatDate(row.endTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="审核状态"
          width="100"
          prop="auditStatusName"
          align="center"
        ></el-table-column>
        <el-table-column
          label="提交状态"
          width="100"
          prop="submitStatusName"
          align="center"
        ></el-table-column>
        <el-table-column label="操作" width="260" align="center">
          <template v-slot="{ row }">
            <el-button
              type="text"
              size="mini"
              @click.stop="handlePass(row)"
              v-if="isShowSubmitButton(row)"
              >通过</el-button
            >
            <el-button
              type="text"
              size="mini"
              @click.stop="handleReject(row)"
              v-if="isShowSubmitButton(row)"
              >驳回</el-button
            >
            <el-button
              type="text"
              size="mini"
              @click.stop="handleInvalid(row)"
              v-if="isShowSubmitButton(row)"
              >作废</el-button
            >
            <el-button type="text" size="mini" @click.stop="handleDetail(row)"
              >详情</el-button
            >
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

      <AuditSubtable
        ref="auditSubtableRef"
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

    <!-- 驳回弹层 -->
    <RejectDialog
      :visible="showRejectDialog"
      :helpSupportUuid="rejectHelpSupportUuid"
      @close="showRejectDialog = false"
      @success="clickSearch"
    />

    <!-- 作废弹层 -->
    <InvalidDialog
      :visible="showInvalidDialog"
      :helpSupportUuid="invalidHelpSupportUuid"
      @close="showInvalidDialog = false"
      @success="clickSearch"
    />
  </div>
</template>

<style lang="scss" scoped></style>
