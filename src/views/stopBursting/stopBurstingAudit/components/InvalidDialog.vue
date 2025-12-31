<template>
  <el-dialog
    :visible.sync="dialogVisible"
    title="作废"
    width="500px"
    @close="closeDialog"
    :close-on-click-modal="false"
    append-to-body
  >
    <el-form
      ref="invalidForm"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="作废原因:" prop="invalidReason">
        <el-input
          v-model="formData.invalidReason"
          placeholder="请输入作废原因"
          type="textarea"
          :rows="3"
        />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">取消</el-button>
      <el-button type="primary" :loading="confirmLoading" @click="handleConfirm"
        >确认</el-button
      >
    </div>
  </el-dialog>
</template>

<script>
import { fetch_getIsInvalid } from "@/api/stopBursting/stopBurstingAudit/index";

export default {
  name: "InvalidDialog",
  props: {
    visible: { type: Boolean, default: false },
    operationUuid: { type: String, default: "" },
  },
  data() {
    return {
      dialogVisible: false,
      confirmLoading: false,
      formData: { invalidReason: "" },
      rules: {
        invalidReason: [
          { required: true, message: "请输入作废原因", trigger: "blur" },
        ],
      },
    };
  },
  watch: {
    visible: {
      handler(newVal) {
        this.dialogVisible = newVal;
        if (!newVal) {
          this.resetForm();
        }
      },
      immediate: true,
    },
  },
  methods: {
    resetForm() {
      if (this.$refs.invalidForm) this.$refs.invalidForm.resetFields();
      this.formData.invalidReason = "";
    },
    async handleConfirm() {
      if (!this.operationUuid) {
        this.$message.warning("缺少标识");
        return;
      }
      this.$refs.invalidForm.validate(async (valid) => {
        if (!valid) return;
        this.confirmLoading = true;
        try {
          const params = {
            operationUuid: this.operationUuid,
            invalidReason: this.formData.invalidReason,
          };
          const res = await fetch_getIsInvalid(params);
          if (
            res &&
            res.code === 200 &&
            (res.data === true || res.data === 1)
          ) {
            this.$message.success("作废成功");
            this.closeDialog();
            this.$emit("success");
          } else {
            this.$message.error(res.msg || "作废失败");
          }
        } catch (e) {
          // this.$message.error("作废失败，请重试");
        } finally {
          this.confirmLoading = false;
        }
      });
    },
    closeDialog() {
      this.dialogVisible = false;
      this.$emit("update:visible", false);
      this.$emit("close");
    },
  },
};
</script>

<style lang="scss" scoped></style>

