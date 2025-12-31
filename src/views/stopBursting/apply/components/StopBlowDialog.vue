<template>
  <el-dialog
    :visible.sync="dialogVisible"
    title="停止打爆"
    width="500px"
    @close="closeDialog"
    :close-on-click-modal="false"
    append-to-body
  >
    <el-form
      ref="stopBlowForm"
      :model="formData"
      :rules="rules"
      label-width="120px"
    >
      <el-form-item label="停止日期:" prop="stopTime">
        <el-date-picker
          v-model="formData.stopTime"
          type="date"
          placeholder="请选择停止日期"
          value-format="timestamp"
          style="width: 100%"
          @change="handleDateChange"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="停止申请说明:" prop="stopRemark">
        <el-input
          v-model="formData.stopRemark"
          type="textarea"
          :rows="4"
          placeholder="请输入"
        ></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">取消</el-button>
      <el-button type="primary" @click="handleConfirm" :loading="confirmLoading"
        >确定</el-button
      >
    </div>
  </el-dialog>
</template>

<script>
import { stopBlow } from "@/api/stopBursting/apply/index";

export default {
  name: "StopBlowDialog",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    operationUuid: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      dialogVisible: false,
      confirmLoading: false,
      formData: {
        stopTime: "",
        stopRemark: "",
      },
      rules: {
        stopTime: [
          { required: true, message: "请选择停止日期", trigger: "change" },
        ],
        stopRemark: [
          { required: true, message: "请输入停止申请说明", trigger: "blur" },
        ],
      },
    };
  },
  watch: {
    visible: {
      handler(newVal) {
        this.dialogVisible = newVal;
        if (newVal) {
          this.resetForm();
        }
      },
      immediate: true,
    },
  },
  methods: {
    handleDateChange(value) {
      // 用户选择的日期时间戳（单位：ms）
      const date = new Date(value);

      // 当前时间（只取时分秒）
      const now = new Date();
      date.setHours(
        now.getHours(),
        now.getMinutes(),
        now.getSeconds(),
        now.getMilliseconds()
      );
      this.formData.stopTime = date.getTime();
    },
    // 重置表单
    resetForm() {
      this.formData = {
        stopTime: "",
        stopRemark: "",
      };
      if (this.$refs.stopBlowForm) {
        this.$refs.stopBlowForm.clearValidate();
      }
    },

    // 点击确认
    async handleConfirm() {
      if (!this.operationUuid) {
        this.$message.warning("缺少运营主表UUID");
        return;
      }

      this.$refs.stopBlowForm.validate(async (valid) => {
        if (valid) {
          this.confirmLoading = true;
          try {
            const params = {
              operationUuid: this.operationUuid,
              stopTime: this.formData.stopTime,
              stopRemark: this.formData.stopRemark,
            };
            const res = await stopBlow(params);
            if (res && res.code === 200) {
              this.$message.success("停止打爆成功");
              this.closeDialog();
              this.$emit("success");
            } else {
              // this.$message.error(res.msg || "停止打爆失败");
            }
          } catch (error) {
            console.error("停止打爆失败:", error);
            // this.$message.error("停止打爆失败，请重试");
          } finally {
            this.confirmLoading = false;
          }
        }
      });
    },

    // 关闭弹窗
    closeDialog() {
      this.dialogVisible = false;
      this.$emit("update:visible", false);
      this.$emit("close");
    },
  },
};
</script>

<style lang="scss" scoped>
.dialog-footer {
  text-align: right;
}
</style>
