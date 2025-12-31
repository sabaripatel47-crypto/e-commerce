<template>
  <div class="app-container">
    <div class="head-contatiner">
      <el-form :inline="true" :model="form" class="demo-form-inline">
        <el-form-item label="平台：" prop="platform">
          <el-select
            filterable
            clearable
            v-model="reqParams.platform"
            placeholder="请选择所属平台"
          >
            <el-option
              v-for="item in platforms"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围" style="margin-right: 20px">
          <el-date-picker
            v-model="dateRange"
            :clearable="true"
            type="daterange"
            align="right"
            unlink-panels
            value-format="timestamp"
          ></el-date-picker>
        </el-form-item>
        <el-button type="primary" @click="getPromotionImportErrors(1)"
          >搜索</el-button
        >
      </el-form>
    </div>
    <div class="table-container">
      <el-table
        :data="tableData"
        border
        v-loading="loading"
        element-loading-text="拼命加载中"
      >
        <el-table-column
          type="index"
          label="序号"
          width="70"
          align="center"
        ></el-table-column>

        <el-table-column
          prop="storeName"
          label="店铺名称"
          min-width="120"
          align="center"
        >
          <template v-slot="{ row }">
            {{ row.storeName }}
          </template></el-table-column
        >
        <el-table-column prop="platformName" label="平台名称" align="center">
          <template v-slot="{ row }">
            {{ row.platformName }}
          </template></el-table-column
        >
        <el-table-column
          prop="uuid"
          label="uuid"
          min-width="130"
          align="center"
        >
          <template v-slot="{ row }">
            {{ row.uuid }}
          </template></el-table-column
        >
        <el-table-column prop="largeCategoryName" label="大类" align="center">
          <template v-slot="{ row }">
            {{ row.largeCategoryName }}
          </template></el-table-column
        >
        <el-table-column prop="position" label="归属岗位" align="center">
          <template v-slot="{ row }">
            {{ row.position == 1 ? "前端" : "后端" }}
          </template></el-table-column
        >

        <el-table-column
          prop="executeStatusTime"
          label="导出时间"
          align="center"
        >
          <template v-slot="{ row }">
            {{ getFormatDate(+row.executeStatusTime) }}
          </template></el-table-column
        >
        <el-table-column prop="uploadTypeName" label="推广类型" align="center">
          <template v-slot="{ row }">
            {{ row.uploadTypeName }}
          </template></el-table-column
        >
        <el-table-column prop="machineId" label="机器id" align="center">
          <template v-slot="{ row }">
            {{ row.machineId }}
          </template></el-table-column
        >
        <el-table-column
          prop="falseReturn"
          label="失败原因"
          min-width="220"
          align="center"
        >
          <template v-slot="{ row }">
            {{ row.falseReturn }}
          </template></el-table-column
        >
        <el-table-column label="操作" align="center">
          <template v-slot="{ row }">
            <el-button type="text" @click="retry(row)">重试</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="reqParams.page"
        :limit.sync="reqParams.pageSize"
        @pagination="getPromotionImportErrors"
      />
    </div>
  </div>
</template>

<script>
import { getPlatformList } from "@/api/businessData/campaignImport";
import {
  getPromotionImportErrors,
  retry,
} from "@/api/businessData/promotionImportErrors";
import { getFormatDate } from "@/utils/common";
export default {
  name: "PromotionImportErrors",
  data() {
    return {
      reqParams: {
        page: 1,
        pageSize: 10,
        platform: "",
        startTime: "",
        endTime: "",
      },
      tableData: [],
      loading: false,
      total: 0,
      // 平台列表
      platforms: [],
      // 时间范围
      dateRange: [],
    };
  },
  created() {
    this.getPlatformList();
    this.getPromotionImportErrors(1);
  },
  methods: {
    async getPromotionImportErrors(page) {
      this.loading = true;
      if (page == 1) {
        this.reqParams.page = 1;
      }
      this.reqParams.startTime = this.dateRange[0] || "";
      this.reqParams.endTime = this.dateRange[1] || "";
      try {
        const res = await getPromotionImportErrors(this.reqParams);
        this.tableData = res.data.records;
        this.total = res.data.total;
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
    getFormatDate(date) {
      return getFormatDate(date);
    },
    // 获取平台下拉框
    async getPlatformList() {
      const res = await getPlatformList();
      this.platforms = res.data;
    },
    // 重试
    async retry(row) {
      try {
        await retry(row.uuid);
        this.$message.success("重试成功");
        this.getPromotionImportErrors();
      } catch (error) {
        console.log(error);
      }
    },
  },
};
</script>

<style lang='scss' scoped>
</style>
