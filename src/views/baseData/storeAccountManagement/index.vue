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
        <el-form-item label="是否配置账号密码：" style="margin-right: 20px">
          <el-select
            v-model="reqParams.isConfigByPassword"
            filterable
            clearable
            placeholder="请选择"
          >
            <el-option label="已配置" :value="true"></el-option>
            <el-option label="未配置" :value="false"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            @click="getAccountList(1)"
            >搜索</el-button
          >
        </el-form-item>
      </el-form>
    </div>

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
        <template v-slot="{ row }">
          {{ row.showName }}
        </template></el-table-column
      >
      <el-table-column prop="managerName" label="负责人" align="center">
        <template v-slot="{ row }">
          {{ row.managerName }}
        </template></el-table-column
      >
      <el-table-column prop="machineID" label="机器id" align="center">
        <template v-slot="{ row }">
          {{ row.machineID }}
        </template></el-table-column
      >
      <el-table-column
        prop="isConfigByPassword"
        label="是否配置账号"
        align="center"
      >
        <template v-slot="{ row }">
          {{ row.isConfigByPassword ? "已配置" : "未配置" }}
        </template></el-table-column
      >
      <el-table-column prop="storeCode" label="钉钉绑定的手机号" align="center">
        <template v-slot="{ row }">
          {{ row.phone }}
        </template></el-table-column
      >
      <el-table-column prop="storeCode" label="是否开启抓取" align="center">
        <template v-slot="{ row }">
          <el-switch
            v-model="row.isGrab"
            active-color="#13ce66"
            :active-value="1"
            :inactive-value="0"
            inactive-color="#ff4949"
            @change="changeStatus(row)"
          >
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column prop="storeCode" label="操作" align="center">
        <template v-slot="{ row }">
          <el-button
            type="text"
            v-if="!row.isConfigByPassword"
            @click="openAddDialog(row)"
            >配置</el-button
          >
          <el-button
            type="text"
            v-if="row.isConfigByPassword"
            @click="openAddDialog(row)"
            >修改</el-button
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
      @pagination="getAccountList"
    />
    <el-dialog
      title="配置账号密码"
      @close="changeClose()"
      :visible.sync="changeVisible"
      width="30%"
    >
      <el-form
        :model="acountParams"
        ref="changeForm"
        :rules="acountRules"
        label-position="right"
        label-width="130px"
      >
        <!-- <el-form-item
          label="手机号："
          v-if="isConfigByPassword"
          style="margin-right: 20px"
          prop="phone"
        >
          <el-input v-model="acountParams.phone"></el-input>
        </el-form-item> -->
        <el-form-item label="店铺编号：" style="margin-right: 20px">
          <span>{{ changeInfo.storeCode }}</span>
        </el-form-item>
        <el-form-item label="店铺名称：" style="margin-right: 20px">
          {{ changeInfo.showName }}
        </el-form-item>
        <el-form-item label="钉钉绑定手机号：" style="margin-right: 20px">
          <span>{{ changeInfo.phone }}</span>
        </el-form-item>
        <el-form-item
          label="钉钉手机号："
          prop="phone"
          placeholder="请输入钉钉绑定的手机号"
          style="margin-right: 20px"
        >
          <el-input
            v-model="acountParams.phone"
            class="el-form-item-width20"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item label="账号：" prop="account" style="margin-right: 20px">
          <el-input
            v-model="acountParams.account"
            class="el-form-item-width20"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码：" prop="password" style="margin-right: 20px">
          <el-input
            v-model="acountParams.password"
            type="password"
            auto-complete="new-password"
            class="el-form-item-width20"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="机器号："
          prop="password"
          style="margin-right: 20px"
        >
          <el-select
            v-model="acountParams.machineID"
            filterable
            class="el-form-item-width20"
            clearable
            placeholder="请选择"
          >
            <el-option
              v-for="item in machineList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            v-if="!isConfigByPassword"
            @click="addAccount"
            >确定</el-button
          >
          <el-button
            type="primary"
            v-if="isConfigByPassword"
            @click="editAccount"
            >确定</el-button
          >
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import {
  getAccountList,
  addAccount,
  editAccount,
  getStoreList,
  changeStatus,
  getMachineList,
} from "@/api/baseData/storeAccountManagement";

export default {
  name: "",
  data() {
    return {
      // 店铺列表
      storeList: [],
      reqParams: {
        isConfigByPassword: "",
        page: 1,
        pageSize: 10,
        storeUuid: "",
      },
      //   账号配置入参
      acountParams: {
        account: "",
        password: "",
        phone: "",
        storeUuid: "",
        uuid: "",
        machineID: "",
      },
      tableData: [],
      total: 0,
      // 修改账号的信息
      changeInfo: {},
      loading: false,
      changeVisible: false,
      //   是否配置
      isConfigByPassword: true,
      acountRules: {
        account: [{ required: true, message: "请输入账号", trigger: "blur" }],
        password: [{ required: true, message: "请输入密码", trigger: "blur" }],
        phone: [{ required: true, message: "请输入手机号", trigger: "blur" }],
      },
      // 切换状态传值
      statusParams: {
        isGrab: 0,
        platform: "",
        storeUuid: "",
      },
      // 机器列表
      machineList: [],
    };
  },
  created() {
    this.getShopSelect();
    this.getAccountList(1);
    this.getMachineList();
  },
  methods: {
    // 获取店铺下拉
    async getShopSelect() {
      const data = await getStoreList();
      this.storeList = data.data;
    },
    // 获取账号列表
    async getAccountList(page) {
      this.loading = true;
      if (page == 1) {
        this.reqParams.page = 1;
      }
      const res = await getAccountList(this.reqParams);
      this.tableData = res.data.records;
      this.total = res.data.total;
      this.loading = false;
    },
    // 打开弹窗
    openAddDialog(row) {
      this.acountParams = this.$options.data().acountParams;
      this.acountParams.storeUuid = row.storeUuid;
      this.isConfigByPassword = row.isConfigByPassword;
      this.changeInfo = row;
      this.acountParams.uuid = row.uuid;
      this.changeVisible = true;
    },
    // 关闭弹窗
    changeClose() {
      this.changeVisible = false;
      this.$refs.changeForm.resetFields();
      this.acountParams = this.$options.data().acountParams;
    },
    // 添加账号
    async addAccount() {
      const res = await addAccount(this.acountParams);
      if (res.data == true) {
        this.$message.success("添加成功");
        this.changeClose();
        this.getAccountList(1);
      } else {
        this.$message.error("添加失败");
      }
    },
    // 修改账号
    async editAccount() {
      const res = await editAccount(this.acountParams);
      if (res.data == true) {
        this.$message.success("修改成功");
        this.changeClose();
        this.getAccountList(1);
      } else {
        this.$message.error("修改失败");
      }
    },
    // 切换状态
    async changeStatus(row) {
      this.statusParams.isGrab = row.isGrab;
      this.statusParams.platform = row.platform;
      this.statusParams.storeUuid = row.storeUuid;
      const res = await changeStatus(this.statusParams);
      if (res.data == true) {
        this.$message.success("状态修改成功");
      } else {
        this.$message.error("修改失败");
      }
    },
    // 获取机器列表
    async getMachineList() {
      const res = await getMachineList();
      this.machineList = res.data;
    },
  },
};
</script>

<style lang='scss' scoped>
</style>
