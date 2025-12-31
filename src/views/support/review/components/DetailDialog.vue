<script>
import { getFormatDate } from '@/utils/common'

export default {
  name: 'ReviewDetailDialog',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    detailData: {
      type: Object,
      default: () => ({}),
    },
  },
  methods: {
    // 时间戳转日期
    getFormatDate(time) {
      return getFormatDate(+time)
    },
    // 格式化日期时间为中文格式：2024年11月14日 15点06分
    formatDateTime(ts) {
      if (!ts) return '-'
      const date = new Date(+ts)
      const Y = date.getFullYear()
      const M = date.getMonth() + 1
      const D = date.getDate()
      const h = date.getHours()
      const m = date.getMinutes()
      // 格式：2024年11月14日 15点06分
      return `${Y}年${M}月${D}日 ${h}点${m < 10 ? '0' + m : m}分`
    },
    // 关闭弹窗
    handleClose() {
      this.$emit('close')
    },
  },
}
</script>

<template>
  <el-dialog title="详情" :visible="visible" width="40%" @close="handleClose">
    <el-descriptions :column="1">
      <el-descriptions-item label="提交日期">
        {{
        formatDateTime(detailData.submitTime)
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

      <el-descriptions-item label="运营申请人">
        {{
        detailData.operateApplyName
        }}
      </el-descriptions-item>
      <el-descriptions-item label="运营审核人">
        {{
        detailData.operateProcessName
        }}
      </el-descriptions-item>
      <el-descriptions-item label="帮扶复核人">
        {{
        detailData.helpSupportApplyName
        }}
      </el-descriptions-item>

      <el-descriptions-item label="审核人" v-if="detailData.auditUuidName">
        {{
        detailData.auditUuidName
        }}
      </el-descriptions-item>

      <el-descriptions-item label="审核状态">
        {{
        detailData.auditStatusName
        }}
      </el-descriptions-item>

      <el-descriptions-item label="驳回时间" v-if="detailData.rejectTime">
        {{
        formatDateTime(detailData.rejectTime)
        }}
      </el-descriptions-item>
      <el-descriptions-item label="驳回原因" v-if="detailData.rejectReason">
        {{
        detailData.rejectReason
        }}
      </el-descriptions-item>
      <el-descriptions-item label="作废时间" v-if="detailData.invalidTime">
        {{
        formatDateTime(detailData.invalidTime)
        }}
      </el-descriptions-item>
      <el-descriptions-item label="作废原因" v-if="detailData.invalidReason">
        {{
        detailData.invalidReason
        }}
      </el-descriptions-item>
      <!-- <el-descriptions-item label="是否作废">{{
        detailData.isInvalidName
      }}</el-descriptions-item>-->
    </el-descriptions>
    <div class="dialog-footer-btn">
      <el-button @click="handleClose">关闭</el-button>
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
