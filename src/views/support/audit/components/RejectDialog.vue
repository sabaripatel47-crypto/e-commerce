<script>
import { fetch_reject } from "@/api/support/audit/index";

export default {
  name: "RejectDialog",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    helpSupportUuid: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      rejectReason: "",
      formRules: {
        rejectReason: [
          { required: true, message: "请输入驳回原因", trigger: "blur" },
        ],
      },
    };
  },
  watch: {
    visible(val) {
      if (!val) {
        // 关闭时清空表单
        this.$nextTick(() => {
          this.rejectReason = "";
          if (this.$refs.rejectForm) {
            this.$refs.rejectForm.clearValidate();
          }
        });
      }
    },
  },
  methods: {
    // 关闭弹窗
    handleClose() {
      this.$emit("close");
    },
    // 确认驳回
    async handleConfirm() {
      this.$refs.rejectForm.validate(async (valid) => {
        if (valid) {
          try {
            const res = await fetch_reject({
              helpSupportUuid: this.helpSupportUuid,
              rejectReason: this.rejectReason,
            });
            if (res && res.code === 200) {
              this.$message.success("驳回成功");
              this.$emit("success");
              this.handleClose();
            }
          } catch (error) {
            console.error("驳回失败:", error);
            // this.$message.error("驳回失败，请重试");
          }
        }
      });
    },
  },
};
</script>

<template>
  <el-dialog
    title="驳回"
    :visible="visible"
    width="30%"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="rejectForm"
      :model="{ rejectReason: rejectReason }"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="驳回原因：" prop="rejectReason">
        <el-input
          v-model="rejectReason"
          type="textarea"
          :rows="3"
          placeholder="请输入驳回原因"
        ></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确认</el-button>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>

