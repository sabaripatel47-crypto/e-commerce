<script>
import {
  getApplyTypeSelectList,
  getAuditStatusSelectList,
  getSubmitStatusSelectList,
} from "@/api/operationManage/common";

export default {
  name: "SearchForm",
  props: {
    value: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      // 下拉
      applyTypeSelectList: [],
      auditStatusSelectList: [],
      submitStatusSelectList: [],
    };
  },
  computed: {
    formData: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      },
    },
  },
  async created() {
    // 在 created 钩子中同步设置默认时间，确保在父组件的 getList 之前执行
    if (
      (!this.formData.timeArr || this.formData.timeArr.length === 0) &&
      (!this.formData.startTime || !this.formData.endTime)
    ) {
      this.setDefaultTime();
    }
    this.getApplyTypeSelectList();
    this.getAuditStatusSelectList();
    this.getSubmitStatusSelectList();
  },
  methods: {
    // 默认时间：当月1号至今
    setDefaultTime() {
      const now = new Date();
      now.setDate(1);
      now.setHours(0, 0, 0, 0);
      const start = now.getTime() + "";
      const end = new Date().getTime() + "";
      const newFormData = { ...this.formData };
      newFormData.timeArr = [start, end];
      this.$emit("input", newFormData);
      this.changeTime([start, end]);
    },
    // 时间范围改变
    changeTime(val) {
      if (val) {
        const newFormData = { ...this.formData };
        newFormData.startTime = val[0];
        newFormData.endTime = val[1];
        this.$emit("input", newFormData);
      }
    },
    // 下拉
    async getApplyTypeSelectList() {
      const res = await getApplyTypeSelectList();
      this.applyTypeSelectList = res.data || [];
    },
    async getAuditStatusSelectList() {
      const res = await getAuditStatusSelectList();
      this.auditStatusSelectList = res.data || [];
    },
    async getSubmitStatusSelectList() {
      const res = await getSubmitStatusSelectList();
      this.submitStatusSelectList = res.data || [];
    },
    // 点击搜索
    handleSearch() {
      this.$emit("search");
    },
  },
};
</script>

<template>
  <div class="search-form">
    <el-form class="page-search" inline ref="page-filter">
      <!--提交时间范围 -->
      <el-form-item label="计划时间:" style="margin-right: 20px">
        <el-date-picker
          class="date-picker-width240"
          v-model="formData.timeArr"
          :clearable="false"
          type="daterange"
          align="right"
          unlink-panels
          value-format="timestamp"
          @change="changeTime"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="计划名称:" style="margin-right: 20px">
        <el-input
          v-model="formData.planName"
          placeholder="请输入计划名称"
        ></el-input>
      </el-form-item>
      <el-form-item label="申请类型:" style="margin-right: 20px">
        <el-select
          v-model="formData.applyType"
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
          v-model="formData.auditStatus"
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
      <!-- <el-form-item label="提交状态:" style="margin-right: 20px">
        <el-select
          v-model="formData.submitStatus"
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
      </el-form-item> -->
      <el-form-item style="margin-right: 20px">
        <el-checkbox v-model="formData.isInvalidValue"
          >是否作废</el-checkbox
        >
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          @click="handleSearch"
          >搜索</el-button
        >
      </el-form-item>
      <br />
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.search-form {
  .el-form-item {
    margin-bottom: 10px;
  }
}

.date-picker-width240 {
  width: 240px;
}

.select-width120 {
  width: 120px;
}
</style>

