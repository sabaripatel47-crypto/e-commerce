<template>
  <div class="app-container">
    <div class="head-contatiner"></div>
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
          width="60"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="uuid"
          label="业务唯一uuid"
          min-width="100"
          align="center"
        >
          <template v-slot="{ row }">
            {{ row.uuid }}
          </template></el-table-column
        >
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
        <el-table-column
          prop="platformName"
          label="平台名称"
          min-width="80"
          align="center"
        >
          <template v-slot="{ row }">
            {{ row.platformName }}
          </template></el-table-column
        >

        <el-table-column prop="largeCategoryName" label="大类" align="center">
          <template v-slot="{ row }">
            {{ row.largeCategoryName }}
          </template></el-table-column
        >
        <el-table-column
          prop="executeStatusTime"
          label="导出时间"
          align="center"
          min-width="100"
        >
          <template v-slot="{ row }">
            {{ getFormatDate(+row.executeStatusTime) }}
          </template></el-table-column
        >
        <el-table-column
          prop="uploadTypeName"
          label="推广类型"
          min-width="100"
          align="center"
        >
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
          prop="accountStatusName"
          label="账号状态"
          min-width="70"
          align="center"
        >
          <template v-slot="{ row }">
            {{ row.accountStatusName }}
          </template></el-table-column
        >
        <el-table-column
          prop="executeStatusName"
          label="执行状态"
          min-width="70"
          align="center"
        >
          <template v-slot="{ row }">
            {{ row.executeStatusName }}
          </template></el-table-column
        >
        <el-table-column
          prop="falseReturn"
          label="任务执行失败原因	"
          min-width="180"
          align="center"
        >
          <template v-slot="{ row }">
            {{ row.falseReturn }}
          </template></el-table-column
        >
      </el-table>
      <!-- 分页 -->
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="reqParams.page"
        :limit.sync="reqParams.pageSize"
        @pagination="getList"
      />
    </div>
  </div>
</template>

<script>
import { getManualTaskSchedulingList } from "@/api/businessData/manualTaskScheduling";
import { getFormatDate } from "@/utils/common";
export default {
  name: "ManualTaskScheduling",
  data() {
    return {
      reqParams: {
        page: 1,
        pageSize: 10,
      },
      tableData: [],
      loading: false,
      total: 0,
    };
  },
  created() {
    this.getList(1);
  },
  methods: {
    async getList(page) {
      this.loading = true;
      if (page == 1) {
        this.reqParams.page = 1;
      }
      try {
        const res = await getManualTaskSchedulingList(this.reqParams);
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
  },
};
</script>

<style lang='scss' scoped>
</style>
