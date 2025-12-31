<template>
  <div class="app-container">
    <div class="head-container">
      <el-form inline class="page-search">
        <el-form-item label="统计日期:" style="margin-right: 20px">
          <el-date-picker
            :clearable="false"
            v-model="reqParams.statisticsTime"
            style="width: 240px"
            value-format="timestamp"
            type="date"
            placeholder="请选择日期"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="平台:" style="margin-right: 20px">
          <el-select
            v-model="reqParams.platform"
            placeholder="请选择平台"
            filterable
            clearable
          >
            <el-option
              v-for="item in platforms"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="店铺名称:" style="margin-right: 20px">
          <el-select
            v-model="reqParams.storeUuid"
            filterable
            placeholder="请选择店铺名称"
            clearable
          >
            <el-option
              v-for="item in stores"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="负责人：" style="margin-right: 20px">
          <el-cascader
            filterable
            v-model="reqParams.storeManage"
            :options="departments"
            :show-all-levels="false"
            :props="{
              children: 'children',
              label: 'deptName',
              value: 'deptId',
              checkStrictly: false,
            }"
            clearable
          ></el-cascader>
        </el-form-item>
        <el-form-item style="margin-right: 20px;">
          <el-button type="primary" icon="el-icon-search" @click="getPageList(1)">搜索</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table :data="tableData" style="width: 100%" border v-loading="loading">
      <el-table-column prop="date" label="序号" min-width="30" type="index" align="center"></el-table-column>
      <el-table-column prop="platform" label="平台"  align="center"></el-table-column>
      <el-table-column prop="" label="店铺名称" align="center" width="350">
        <template v-slot="{ row }">
          <span>{{ row.storeName }}({{ row.storeCode }})</span>
        </template>
      </el-table-column>
      <el-table-column prop="storeManage" label="负责人" align="center"></el-table-column>
      <el-table-column prop="beforeSevenAverageSales" label="前七天平均销售额" align="center"></el-table-column>
      <el-table-column prop="beforeSameDaySales" label="销售额"  align="center"></el-table-column>
      <el-table-column prop="changeRate" label="变化率" align="center">
        <template v-slot="{ row }">
          <span v-if="row.changeRate != 0 && row.changeRate != null" :class="row.changeRate > 0 ? 'positive' : 'negative'">{{ numberToPercentage(row.changeRate) }}</span>
          <span v-if="row.changeRate == null">-</span>
          <span v-if="row.changeRate == 0">0.00%</span>
        </template>
      </el-table-column>
    </el-table>

     <!-- 分页 -->
     <Pagination
      v-show="total>0"
      :page.sync="reqParams.page"
      :limit.sync="reqParams.pageSize"
      :total="total"
      @pagination="getPageList"
    />

  </div>
</template>

<script>
import { listPlatform } from "@/api/baseData/common";
import { getDeptTreeData,addDay } from "@/utils/common";
import {
  getPrincipalList,
  listPush,
  getStoreChangeStatistics,
} from "@/api/dailyManage/storeChangeStatistics";
export default {
  name: "StoreChangeStatistics",
  data() {
    return {
      reqParams: {
        // 请求参数
        statisticsTime: "",
        platform: "",
        storeUuid: "",
        storeManage: "",
        pageSize: 10,
        page: 1,
      },
      total: 0,
      // 平台下拉框
      platforms: [],
      // 店铺下拉框
      stores: [],
      // 负责人下拉框
      departments: [],
      // 表格数据
      tableData: [],
      loading: false,
    };
  },
  created() {
    this.reqParams.statisticsTime = addDay(-1);
    //平台下拉框
    this.listPlatform();
    // 店铺下拉
    this.getPrincipalList();
    // 负责人下拉
    this.listPush();
    this.getPageList(1)
  },
  methods: {
    // 平台下拉框
    async listPlatform() {
      const res = await listPlatform();
      this.platforms = res.data;
    },
    // 负责人下拉
    async getPrincipalList() {
      const res = await getPrincipalList();
      this.departments = await getDeptTreeData(res.data);
    },
    // 店铺下拉
    async listPush() {
      const res = await listPush();
      this.stores = res.data;
    },
    // 获取表格数据
    async getPageList(page) {
      if(page == 1){
        this.reqParams.page = 1;
      }
      if (Array.isArray(this.reqParams.storeManage)) {
        this.reqParams.storeManage =
          this.reqParams.storeManage[this.reqParams.storeManage.length - 1]
      }

      this.loading = true;
      const res = await getStoreChangeStatistics(this.reqParams);
      this.tableData = res.data.records;
      this.total = res.data.total
      this.loading = false;
    },
    // 数字转百分比
numberToPercentage(value) {
  return (value * 100).toFixed(2) + '%'; // 保留两位小数
}
  },
};
</script>

<style lang="scss" scoped>
.positive {
  color: green;
}

.negative {
  color: red;
}
</style>
