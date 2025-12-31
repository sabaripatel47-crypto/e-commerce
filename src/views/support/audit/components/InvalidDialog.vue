<script>
import { fetch_invalid } from "@/api/support/audit/index";

export default {
  name: "InvalidDialog",
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
      invalidReason: "",
      formRules: {
        invalidReason: [
          { required: true, message: "请输入作废原因", trigger: "blur" },
        ],
      },
    };
  },
  watch: {
    visible(val) {
      if (!val) {
        // 关闭时清空表单
        this.$nextTick(() => {
          this.invalidReason = "";
          if (this.$refs.invalidForm) {
            this.$refs.invalidForm.clearValidate();
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
    // 确认作废
    async handleConfirm() {
      this.$refs.invalidForm.validate(async (valid) => {
        if (valid) {
          try {
            const res = await fetch_invalid({
              helpSupportUuid: this.helpSupportUuid,
              invalidReason: this.invalidReason,
            });
            if (res && res.code === 200) {
              this.$message.success("作废成功");
              this.$emit("success");
              this.handleClose();
            }
          } catch (error) {
            console.error("作废失败:", error);
            this.$message.error("作废失败，请重试");
          }
        }
      });
    },
  },
};
</script>

<template>
  <el-dialog
    title="作废"
    :visible="visible"
    width="30%"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="invalidForm"
      :model="{ invalidReason: invalidReason }"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="作废原因：" prop="invalidReason">
        <el-input
          v-model="invalidReason"
          type="textarea"
          :rows="3"
          placeholder="请输入作废原因"
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

