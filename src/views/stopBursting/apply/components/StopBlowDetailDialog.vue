<script>
import { getFormatDate } from "@/utils/common";
import { getDetail } from "@/api/stopBursting/apply/index";

export default {
  name: "StopBlowDetailDialog",
  props: {
    visible: { type: Boolean, default: false },
    operationUuid: { type: String, default: "" },
  },
  data() {
    return {
      dialogVisible: false,
      detail: {},
      loading: false,
    };
  },
  watch: {
    visible: {
      handler(newVal) {
        this.dialogVisible = newVal;
        if (newVal) {
          this.fetchDetail();
        }
      },
      immediate: true,
    },
  },
  methods: {
    async fetchDetail() {
      if (!this.operationUuid) return;
      this.loading = true;
      try {
        const res = await getDetail(this.operationUuid);
        this.detail = res && res.data ? res.data : {};
      } finally {
        this.loading = false;
      }
    },
    // 时间戳转日期
    getFormatDate(time) {
      return getFormatDate(+time);
    },
    // 格式化日期时间为中文格式：2024年11月14日 15点06分
    formatDateTime(ts) {
      if (!ts) return "-";
      const date = new Date(+ts);
      const Y = date.getFullYear();
      const M = date.getMonth() + 1;
      const D = date.getDate();
      const h = date.getHours();
      const m = date.getMinutes();
      // 格式：2024年11月14日 15点06分
      return `${Y}年${M}月${D}日 ${h}点${m < 10 ? "0" + m : m}分`;
    },
    // 关闭弹窗
    handleClose() {
      this.dialogVisible = false;
      this.$emit("update:visible", false);
      this.$emit("close");
    },
  },
};
</script>

<template>
  <el-dialog
    :visible.sync="dialogVisible"
    title="详情"
    width="40%"
    append-to-body
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-loading="loading">
      <el-descriptions :column="1">
        <el-descriptions-item label="停止提交日期">{{
          formatDateTime(detail.submitTime)
        }}</el-descriptions-item>
        <el-descriptions-item label="停止申请人">{{
          detail.applyName || "无"
        }}</el-descriptions-item>
        <el-descriptions-item label="停止申请说明">{{
          detail.applyInformation || "无"
        }}</el-descriptions-item>
        <el-descriptions-item label="审核人" v-if="detail.auditUuidName">{{
          detail.auditUuidName
        }}</el-descriptions-item>
        <el-descriptions-item label="审核状态">{{
          detail.auditStatusName || "无"
        }}</el-descriptions-item>
        <el-descriptions-item label="驳回时间" v-if="detail.rejectTime">{{
          formatDateTime(detail.rejectTime)
        }}</el-descriptions-item>
        <el-descriptions-item label="驳回原因" v-if="detail.rejectReason">{{
          detail.rejectReason
        }}</el-descriptions-item>
        <el-descriptions-item label="作废时间" v-if="detail.invalidTime">{{
          formatDateTime(detail.invalidTime)
        }}</el-descriptions-item>
        <el-descriptions-item label="作废原因" v-if="detail.invalidReason">{{
          detail.invalidReason
        }}</el-descriptions-item>
      </el-descriptions>
      <div class="dialog-footer-btn">
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
.dialog-footer-btn {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>


