<template>
  <div class="app-container">
    <div class="head-container">
      <el-tabs v-model="reqParams.platform" @tab-click="tabHandleClick">
        <el-tab-pane
          v-for="item in platforms"
          :label="item.name"
          :name="item.code"
          :key="item.code"
        ></el-tab-pane>
      </el-tabs>
      <el-form inline class="page-search">
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-upload2"
            @click="importOrderImport()"
            >导入</el-button
          >
        </el-form-item>
      </el-form>
    </div>
    <el-table
      :data="tableData"
      style="width: 100%"
      border
      height="480"
      v-loading="loading"
    >
      <el-table-column
        prop="date"
        label="序号"
        min-width="30"
        type="index"
        align="center"
      ></el-table-column>
      <el-table-column label="日期" align="center">
        <template slot-scope="scope">
          <span>{{ getFormatDate(scope.row.uploadDate) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="导入结果" show-overflow-tooltip align="center">
        <template v-slot="{ row }">
          <span v-if="row.importStatus != 8 && row.importStatus != 9">{{
            row.importStatusName
          }}</span>
          <el-image
            v-if="row.importStatus != 8 && row.importStatus != 9"
            style="height: 20px; width: 20px"
            :src="require('@/assets/images/loading.gif')"
          ></el-image>
          <span v-if="row.importStatus == 8 || row.importStatus == 9">{{
            row.result
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.importStatus == 9"
            type="text"
            size="small"
            @click="deleteData(scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      v-show="total > 0"
      :page.sync="reqParams.page"
      :limit.sync="reqParams.pageSize"
      :total="total"
      @pagination="getPageList"
    />

    <el-dialog
      title="导入"
      :visible="showAddDialog"
      :before-close="cleanAdd"
      width="40%"
    >
      <el-form
        :model="importReq"
        :rules="importRules"
        ref="importRef"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="日期:" prop="uploadDate">
          <el-date-picker
            v-model="importReq.uploadDate"
            type="date"
            placeholder="请选择日期"
            value-format="timestamp"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="导入文件">
          <FileUpload
            ref="fileUploadRef"
            @getUploadFile="getUploadFile"
          ></FileUpload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cleanAdd">取 消</el-button>
        <el-button type="primary" @click="submitForm" :disabled="submitDisabled"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  getAfterSalePlatformList,
  importPdd,
  importJd,
  importDouyin,
  importTmall,
  deleteAfterSalePlatform,
  getAfterSalePlatformStatus,
} from "@/api/businessData/afterSalePlatformImport";
import { getFormatDate } from "@/utils/common";
export default {
  name: "afterSalePlatformImport",
  data() {
    return {
      // 平台
      platforms: [
        { code: "30", name: "拼多多" },
        { code: "31", name: "天猫" },
        { code: "32", name: "京东" },
        { code: "33", name: "抖音" },
      ],
      // 列表数据
      tableData: [],
      // 表格请求参数
      reqParams: {
        page: 1,
        pageSize: 10,
        platform: "",
      },
      // 全部数量
      total: 0,
      // 加载
      loading: false,
      submitDisabled: false,
      // 弹窗
      showAddDialog: false,
      importReq: {},
      fileData: {},
      importRules: {
        uploadDate: [
          { required: true, message: "请选择归属日期", trigger: "blur" },
        ],
        file: [{ required: true, message: "请选择文件", trigger: "blur" }],
      },
      // 定时器
      timer: "",
    };
  },
  created() {
    //默认取第一个tab
    this.reqParams.platform = this.platforms[0].code;
    this.getPageList(1);
  },
  methods: {
    async getPageList(page) {
      if (page == 1) {
        this.reqParams.page = page;
      }
      this.loading = true;
      const res = await getAfterSalePlatformList(this.reqParams);
      this.tableData = res.data.records;
      this.total = res.data.total;
      this.startTimer();
      this.loading = false;
    },
    // 平台下拉框
    async listPlatform() {
      const res = await listPlatform();
      this.platforms = res.data;
      this.reqParams.platform = this.platforms[0].code;
      this.getPageList(1);
    },
    //tab切换时的点击事件
    tabHandleClick(tab, event) {
      this.reqParams.platform = tab.name;
      this.getPageList(1);
    },
    getFormatDate(timeStamp) {
      return getFormatDate(timeStamp);
    },
    //导入
    importOrderImport() {
      this.submitDisabled = false;
      this.showAddDialog = true;
    },
    // 获取上传的文件
    getUploadFile(val) {
      this.fileData = val.file;
    },
    // 关闭弹窗
    cleanAdd() {
      this.$nextTick(() => {
        this.$refs.fileUploadRef.clearFileList();
      });
      this.showAddDialog = false;

      this.$refs["importRef"].resetFields();

      this.importReq = {};
      this.fileData = {};
    },
    // 提交
    async submitForm() {
      this.$refs["importRef"].validate(async (valid) => {
        if (valid) {
          if (Object.keys(this.fileData).length === 0) {
            return this.$message.warning("请选择上传文件");
          }
          this.submitDisabled = true;
          let formData = new FormData();
          formData.append("uploadDate", this.importReq.uploadDate);
          formData.append("file", this.fileData);
          let res = {};
          if (this.reqParams.platform == "30") {
            res = await importPdd(formData);
          }
          if (this.reqParams.platform == "31") {
            res = await importTmall(formData);
          }
          if (this.reqParams.platform == "32") {
            res = await importJd(formData);
          }
          if (this.reqParams.platform == "33") {
            res = await importDouyin(formData);
          }
          console.log(res);
          if (res.code == 200) {
            this.$message.success("导入成功");
            this.cleanAdd();
            // 刷新数据
            await this.getPageList(1);
          }
          this.submitDisabled = false;
        }
      });
    },
    // 删除
    deleteData(row) {
      this.$confirm("请确认是否删除", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          const res = await deleteAfterSalePlatform(row.uuid);
          if (res.code == 200) {
            this.$message.success("删除成功");
            // 刷新数据
            await this.getPageList(1);
          }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    // 开启定时器
    startTimer() {
      this.timer = setInterval(() => {
        this.getAfterSalePlatformStatusList();
      }, 3000);
    },
    // 遍历状态
    async getAfterSalePlatformStatusList() {
      let status = false;
      this.tableData.map((item, index) => {
        if (item.importStatus != 9 && item.importStatus != 8) {
          this.getErpOrderStatus(item.uuid, index);
          status = true;
        }
        if (status) {
          clearInterval(this.timer);
        }
      });
    },
    // 根据uuid获取状态
    async getErpOrderStatus(uuid, index) {
      const res = await getAfterSalePlatformStatus(uuid);
      this.tableData[index].importStatus = res.data.importStatus;
      this.tableData[index].result = res.data.result;
    },
  },
  mounted() {},
  beforeDestroy() {
    clearInterval(this.timer);
  },
};
</script>

<style></style>
