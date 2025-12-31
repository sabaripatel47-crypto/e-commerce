<template>
  <div class="app-container">
    <div class="head-contatiner">
      <el-form class="page-search" inline ref="page-filter">
        <el-form-item label="店铺名称：" style="margin-right: 20px">
          <el-select
            v-model="reqParams.storeUuid"
            filterable
            clearable
            placeholder="请选择"
          >
            <el-option
              v-for="item in storeList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="负责人：" style="margin-right: 20px">
          <el-cascader
            filterable
            v-model="managerUuid"
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
        <el-form-item label="用户：" style="margin-right: 20px">
          <el-cascader
            filterable
            v-model="userUuid"
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
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            @click="getPageList(1)"
            >搜索</el-button
          >
        </el-form-item>
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

        <el-table-column prop="storeCode" label="店铺编号" align="center">
          <template v-slot="{ row }">
            {{ row.storeCode }}
          </template></el-table-column
        >
        <el-table-column prop="showName" label="店铺名称" align="center">
          <template v-slot="{ row }">{{
            row.showName
          }}</template></el-table-column
        >
        <el-table-column prop="platformName" label="所属平台" align="center">
          <template v-slot="{ row }">
            {{ row.platformName }}</template
          ></el-table-column
        >
        <el-table-column prop="managerName" label="负责人" align="center">
          <template v-slot="{ row }"
            >{{ row.managerName }}
          </template></el-table-column
        >
        <el-table-column prop="" label="用户" align="center">
          <template v-slot="{ row }">
            <span
              v-for="(item, index) in row.permissionUserVO"
              :key="item.userUuid"
            >
              {{
                item.userName +
                (index != row.permissionUserVO.length - 1 ? "," : "")
              }}</span
            >
          </template></el-table-column
        >
      </el-table>
      <!-- 分页 -->
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="reqParams.page"
        :limit.sync="reqParams.pageSize"
        @pagination="getPageList"
      />
    </div>
  </div>
</template>

<script>
import { getStoreList, getStoreListSelect } from "@/api/baseData/storeView";
import { getDeptTreeData } from "@/utils/common";
import { department } from "@/api/information/department";

export default {
  name: "StoreView",
  data() {
    return {
      // 店铺下拉
      storeList: [],
      // 负责人下拉
      departments: [],
      reqParams: {
        managerUuid: "",
        page: 1,
        pageSize: 10,
        storeUuid: "",
        userUuid: "",
      },
      managerUuid: [],
      userUuid: [],
      tableData: [],
      total: 0,
      loading: false,
    };
  },
  created() {
    this.getShopSelect();
    this.getDeptTree();
    this.getPageList(1);
  },
  methods: {
    // 获取店铺下拉
    async getShopSelect() {
      const data = await getStoreListSelect();
      this.storeList = data.data;
    },
    // 负责人组织架构数据
    async getDeptTree() {
      const res = await department();
      this.departments = await getDeptTreeData(res.data);
      //   // 获取部门数据
      //   const dept = await deptTreeSelect();
      //   this.deptOptions = dept.data;
      //   console.log("部门数据", dept);
    },
    async getPageList(page) {
      if (page == 1) {
        this.reqParams.page = 1;
      }
      this.reqParams.managerUuid =
        this.managerUuid[this.managerUuid.length - 1];
      this.reqParams.userUuid = this.userUuid[this.userUuid.length - 1];
      this.loading = true;
      const res = await getStoreList(this.reqParams);
      this.tableData = res.data.records;
      this.total = res.data.total;
      this.loading = false;
    },
  },
};
</script>

<style lang='scss' scoped>
</style>
