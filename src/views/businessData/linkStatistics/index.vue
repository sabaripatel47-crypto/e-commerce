<template>
  <div class="app-container">
    <!-- 搜索 -->
    <div class="head-container">
      <el-tabs v-model="reqParams.platformKey" @tab-click="tabHandleClick">
        <el-tab-pane
          v-for="item in tabTitleList"
          :label="item.name"
          :name="item.code"
          :key="item.code"
        ></el-tab-pane>
      </el-tabs>
      <el-form class="page-search" inline ref="page-filter">
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-upload2"
            @click="importLinkStatistics()"
            >导入</el-button
          >
        </el-form-item>
      </el-form>
    </div>
    <div class="container">
      <!-- 表格 -->
      <el-table :data="importLinkList" style="width: 100%">
        <el-table-column
          type="index"
          label="序号"
          width="70"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="date"
          label="日期"
          align="center"
          show-overflow-tooltip
        >
          <template v-slot="{ row }">{{ getFormatDate(row.date) }}</template>
        </el-table-column>
        <el-table-column
          prop="storeName"
          label="所属店铺"
          align="center"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="result"
          label="结果"
          align="center"
          show-overflow-tooltip
        >
          <template v-slot="{ row }">
            <el-image
              v-if="
                row.linkStatisticsStatus != linkStatisticsStatusEnum.FAIL &&
                row.linkStatisticsStatus !=
                  linkStatisticsStatusEnum.DEPOSITED_IN_OFFICIAL_LIBRARY
              "
              style="height: 20px; width: 20px"
              :src="require('@/assets/images/loading.gif')"
            ></el-image>
            {{ row.result }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" align="center">
          <template v-slot="{ row }">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-view"
              @click="deleteLinkStatistics(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
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

    <el-dialog
      :title="'导入'"
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
        <el-form-item label="归属日期" prop="date">
          <el-date-picker
            v-model="importReq.date"
            type="date"
            placeholder="请选择日期"
            value-format="timestamp"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="所属店铺" prop="storeUuid">
          <el-select
            filterable
            v-model="importReq.storeUuid"
            placeholder="请选择所属店铺"
          >
            <el-option
              v-for="item in stores"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="导入文件">
          <FileUpload
            ref="fileUploadRef"
            @getUploadFile="getUploadFile"
          ></FileUpload>
        </el-form-item>
        <el-form-item label="结果" prop="result"></el-form-item>
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
  getLinkStatisticsList,
  deleteLinkStatistics,
  uploadLinkStatistics,
  getLinkStatisticsStatus,
} from "@/api/businessData/linkStatistics";

import { listStoreByPlatformKey } from "@/api/baseData/common";

import { getFormatDate } from "@/utils/common";

export default {
  name: "LinkStatistics",
  data() {
    return {
      linkStatisticsStatusEnum: {
        UPLOADED_UNREAD: 1, //文件上传成功，准备开始读取文件内容
        READ_UNPROCESSED: 2, //已读取文件内容，准备开始处理数据
        PROCESSED: 3, //文件数据处理成功，准备开始录入结果数据
        DEPOSITED_IN_OFFICIAL_LIBRARY: 4, //数据录入成功
        FAIL: 5, //文件处理失败
      },

      total: 0,
      importLinkList: [],

      // 文件数据
      fileData: {},

      //导入弹窗是否显示的标记
      showAddDialog: false,

      //导入接口的数据条件
      importReq: {},

      // 定时器轮询
      time: null,

      // 定时器数组
      timeArr: [],

      tabTitleList: [
        { code: "mao", name: "天猫" },
        { code: "jd", name: "京东" },
        { code: "dy", name: "抖音" },
      ],

      //店铺下拉框
      stores: [],

      // 控制确定按钮
      submitDisabled: false,

      reqParams: {
        platformKey: "",
        page: 1,
        pageSize: 20,
      },

      importRules: {
        date: [
          { required: true, message: "请选择归属日期", trigger: "change" },
        ],
        storeUuid: [
          { required: true, message: "请选择所属店铺", trigger: "change" },
        ],
      },
    };
  },
  created() {
    //默认取第一个tab
    this.reqParams.platformKey = this.tabTitleList[0].code;

    this.getList();
  },
  beforeDestroy() {
    // 离开页面销毁定时器
    if (this.timeArr.length > 0) {
      this.timeArr.forEach((item) => {
        clearInterval(item.time);
      });
    }
  },
  methods: {
    // 获取上传的文件
    getUploadFile(val) {
      this.fileData = val.file;
      console.log("上传的文件", val);
    },
    //店铺下拉框
    async listStore() {
      const res = await listStoreByPlatformKey({
        platformKey: this.reqParams.platformKey,
      });
      this.stores = res.data;
    },
    //时间格式化
    getFormatDate(timeStamp) {
      return getFormatDate(timeStamp);
    },
    //获取列表信息
    async getList() {
      const res = await getLinkStatisticsList(this.reqParams);
      this.importLinkList = res.data.records;
      this.total = res.data.total;

      //轮询查是否有需要检查状态的数据
      for (let i = 0; i < this.importLinkList.length; i++) {
        let row = this.importLinkList[i];
        //不是成功，也不是失败，则轮询
        if (
          row.linkStatisticsStatus !=
            this.linkStatisticsStatusEnum.DEPOSITED_IN_OFFICIAL_LIBRARY &&
          row.linkStatisticsStatus != this.linkStatisticsStatusEnum.FAIL
        ) {
          this.checkStart(row);
        }
      }
    },

    //tab切换时的点击事件
    tabHandleClick(tab, event) {
      this.reqParams.platformKey = tab.name;
      this.getList();
    },

    //导入
    importLinkStatistics() {
      this.submitDisabled = false;
      //店铺下拉框
      this.listStore();
      this.showAddDialog = true;
    },

    //导入的弹窗清空
    cleanAdd() {
      this.$nextTick(() => {
        this.$refs.fileUploadRef.clearFileList();
      });
      this.showAddDialog = false;

      this.$refs["importRef"].resetFields();

      this.importReq = {};
      this.fileData = {};
    },

    //导入文件的确定
    submitForm() {
      //必填校验
      this.$refs["importRef"].validate(async (valid) => {
        if (valid) {
          // 将确定按钮置灰
          this.submitDisabled = true;
          if (Object.keys(this.fileData).length === 0) {
            return this.$message.warning("请选择上传文件");
          }
          this.importReq.platformKey = this.reqParams.platformKey;
          let formData = new FormData();
          formData.append("date", this.importReq.date);
          formData.append("platformKey", this.importReq.platformKey);
          formData.append("storeUuid", this.importReq.storeUuid);
          formData.append("file", this.fileData);
          const [err, res] = await this.$to(uploadLinkStatistics(formData));
          if (res) {
            // 关闭弹窗
            this.cleanAdd();
            // 刷新数据
            await this.getList();
          }

          this.submitDisabled = false;
        }
      });
    },

    //删除
    async deleteLinkStatistics(row) {
      this.$confirm("确定删除当前导入数据吗，删除后不可恢复？", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        beforeClose: async (action, instance, done) => {
          if (action === "confirm") {
            instance.confirmButtonLoading = true;
            instance.confirmButtonText = "删除中...";
            const [err, res] = await this.$to(deleteLinkStatistics(row.uuid));
            if (err) {
              console.error("链接导入删除接口错误", err);
            }

            // 如果当条数据还在上传中，删除时要关闭这条定时任务
            if (
              row.linkStatisticsStatus !=
                this.linkStatisticsStatusEnum.DEPOSITED_IN_OFFICIAL_LIBRARY &&
              row.linkStatisticsStatus != this.linkStatisticsStatusEnum.FAIL
            ) {
              this.timeArr.forEach((item) => {
                if (item.uuid === row.uuid) {
                  clearInterval(item.time);
                }
              });
            }

            instance.confirmButtonLoading = false;
            await done();
            await this.getList();
            if (res) {
              this.$message({
                type: "success",
                message: "删除链接成功！",
              });
            }
          } else {
            await done();
          }
        },
      });
    },

    // 开始轮询
    checkStart(row) {
      let activeCount = 0;
      let totalCount = (5 * 60 * 1000) / 3000 - 1;
      let time = setInterval(() => {
        getLinkStatisticsStatus(row.uuid)
          .then(async (res) => {
            let result = res.data;

            row.result = result.result;
            row.linkStatisticsStatus = result.linkStatisticsStatus;

            if (
              result.linkStatisticsStatus ===
              this.linkStatisticsStatusEnum.DEPOSITED_IN_OFFICIAL_LIBRARY
            ) {
              // 导入成功
              clearInterval(time);
              // this.time = null
              this.$message.success("导入成功");
            }
            if (
              result.linkStatisticsStatus === this.linkStatisticsStatusEnum.FAIL
            ) {
              clearInterval(time);
              // this.time = null
              this.$message.success("导入失败," + result.result);
            }
          })
          .catch((err) => {
            clearInterval(time);
            console.error("轮询出现错误:", err);
            // this.time = null
          });

        activeCount += 1;
        if (activeCount >= totalCount) {
          clearInterval(time);
          // this.time = null
        }
      }, 3000);
      let obj = {
        uuid: row.uuid,
        time: time,
      };
      this.timeArr.push(obj);
    },
  },
};
</script>

<style lang="scss">
</style>





















