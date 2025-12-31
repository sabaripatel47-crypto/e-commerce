<template>
  <div class="app-container">
    <div class="container">
      <el-form class="page-search" inline>
        <el-form-item label="平台：" style="margin-right: 20px">
          <el-select
            v-model="reqParams.platform"
            placeholder="请选择平台"
            clearable
            filterable
          >
            <el-option
              v-for="item in platforms"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="店铺名称：" style="margin-right: 20px">
          <el-select
            filterable
            v-model="reqParams.keyWord"
            placeholder="请选择店铺"
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
        <el-form-item style="margin-right: 20px">
          <el-button icon="el-icon-search" type="primary" @click="getPageList(1)">查询</el-button>
           <el-button icon="el-icon-plus" @click="openAdd">新增</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table :data="tableData" style="width: 100%" border v-loading="loading">
      <el-table-column
        prop="date"
        label="序号"
        min-width="30"
        type="index"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="storeCode"
        label="店铺编号"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="showName"
        label="店铺名称"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="platformName"
        label="所属平台"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="managerName"
        label="店铺负责人"
        align="center"
      ></el-table-column>
      <el-table-column prop="" label="操作" align="center">
        <template v-slot="{ row }">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="deleteStore(row)"
            >移除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
     <!-- 分页 -->
    <Pagination
      v-if="total>0"
      :auto-scroll="false"
      :page.sync="reqParams.page"
      :limit.sync="reqParams.pageSize"
      :total="total"
      @pagination="getPageList"
    />
    <el-dialog
      :visible.sync="dialogVisible"
      width="40%"
      :before-close="closeAddDialog"
    >
      <el-form
        ref="addDialogRef"
        :model="addReqParams"
        :rules="addRules"
        label-width="100px"
      >
        <el-form-item label="平台：" prop="platformUuid" style="margin-right: 20px">
          <el-select
            v-model="addReqParams.platformUuid"
            placeholder="请选择平台"
            @change="addListStore"
            clearable
          >
            <el-option
              v-for="item in platforms"
              :label="item.name"
              :value="item.extendKeyword"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="店铺名称：" prop="uuid" style="margin-right: 20px">
          <el-select
            filterable
            v-model="addReqParams.uuid"
            placeholder="请选择店铺"
            clearable
          >
            <el-option
              v-for="item in addStoreList"
              :label="item.name"
              :value="item.code"  
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
       <span slot="footer" class="dialog-footer">
        <el-button @click="closeAddDialog">取 消</el-button>
        <el-button type="primary" @click="submitAdd">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { listPlatform, listStore,listStoreByPlatformKey } from "@/api/baseData/common";
import {
  getStoreList,
  storeAdd,
  storeDelete,
} from "@/api/baseData/feiSuoStore";
export default {
  name: "feiSuoStore",
  data() {
    return {
      // 平台列表
      platforms: [],
      //店铺下拉框的值
      stores: [],
      // 传参
      reqParams: {
        keyWord: "",
        page: 1,
        pageSize: 10,
        platform: "",
      },
      // 列表数据
      tableData: [],
      // 数量
      total: 0,
      loading: false,
      dialogVisible: false,
      // 新增参数
      addReqParams: {
        platformUuid: "",
        uuid: "",
      },
      // 新增弹窗内店铺列表
      addStoreList: [],
      addRules: {
        platformUuid: [
          { required: true, message: "请选择平台", trigger: "blur" },
        ],
        uuid: [{ required: true, message: "请选择店铺", trigger: "blur" }],
      },
    };
  },
  created() {
    this.listPlatform();
    this.listStore();
    this.getPageList(1);
  },
  methods: {
    // 平台下拉框
    async listPlatform() {
      const res = await listPlatform();
      this.platforms = res.data;
    },
    // 店铺下拉框
    async listStore() {
      const res = await listStore();
      this.stores = res.data;
    },
    // 获取表格数据
    async getPageList(page) {
      if (page == 1) {
        this.reqParams.page = page;
      }
      this.loading = true;
      const res = await getStoreList(this.reqParams);
      this.tableData = res.data.records;
      this.total = res.data.total;
      this.loading = false;
    },
    async deleteStore(row) {
      this.$to(
        this.$confirm("确定删除此店铺？", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
          beforeClose: async (action, instance, done) => {
            if (action === "confirm") {
              instance.confirmButtonLoading = true;
              instance.confirmButtonText = "删除中...";
              await storeDelete({ uuid: row.uuid });
              instance.confirmButtonLoading = false;
              await done();
              await this.getPageList(1);
              this.$message({
                type: "success",
                message: "删除成功！",
              });
            } else {
              await done();
            }
          },
        })
      );
    },
    //店铺下拉框
    async addListStore() {
      this.addStoreList = []
      this.addReqParams.uuid = ''
      if(this.addReqParams.platformUuid == ''){
        return
      }
      const res = await listStoreByPlatformKey({
        platformKey: this.addReqParams.platformUuid,
      })
      this.addStoreList = res.data
    },
    // 打开弹窗
    async openAdd() {
      this.dialogVisible = true;
    },
    // 关闭弹窗
    closeAddDialog() {
      this.dialogVisible = false;
      this.addReqParams = this.$options.data().addReqParams;
      this.addStoreList = []
    },
    // 提交新增
    async submitAdd() {
      console.log(this.addReqParams);
      const res = await storeAdd(this.addReqParams);
      if (res.data == true) {
        this.$message({
          type: "success",
          message: "新增成功",
        });
      }
      this.getPageList(1)
      this.closeAddDialog();
    },
  },
};
</script>

<style lang='scss' scoped>
</style>
