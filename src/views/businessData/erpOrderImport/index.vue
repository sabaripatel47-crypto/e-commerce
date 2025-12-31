<template>
  <div class="app-container">
    <div class="head-container">
      <el-form class="page-search" inline ref="page-filter">
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

    <div class="container">
      <!-- 表格 -->
      <el-table :data="erpImportList" style="width: 100%">
        <el-table-column
          type="index"
          label="序号"
          width="70"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="uploadDate"
          label="日期"
          align="center"
          show-overflow-tooltip
        >
          <template v-slot="{ row }">{{
            getFormatDate(row.uploadDate)
          }}</template>
        </el-table-column>
        <el-table-column
          prop="erpOrderImportName"
          label="导入类别"
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
                row.erpOrderStatus != erpOrderStatusEnum.FAIL &&
                row.erpOrderStatus != erpOrderStatusEnum.SUCCESS
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
              v-if="row.erpOrderStatus === erpOrderStatusEnum.FAIL"
              size="mini"
              type="text"
              icon="el-icon-view"
              @click="deleteOrderImport(row)"
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
        <el-form-item label="归属日期" prop="uploadDate">
          <el-date-picker
            v-model="importReq.uploadDate"
            type="date"
            placeholder="请选择日期"
            value-format="timestamp"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="导入类别" prop="erpOrderImport">
          <el-radio-group v-model="importReq.erpOrderImport">
            <el-radio label="0">销售订单</el-radio>
            <el-radio label="2">发货订单</el-radio>
            <el-radio label="1">销售退单</el-radio>
            <el-radio label="3">退货数据</el-radio>
          </el-radio-group>
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
  getErpSaleOrderList,
  deleteOrderImport,
  getErpOrderStatus,
  uploadOrderImport,
  uploadReturnOrderImport,
} from "@/api/businessData/erpOrderImport";

import { getFormatDate } from "@/utils/common";

export default {
  name: "ErpOrderImport",
  data() {
    return {
      erpOrderStatusEnum: {
        UPLOADED_UNREAD: 1, //文件上传成功，准备开始读取文件内容
        READ_UNPROCESSED: 2, //已读取文件内容，准备开始处理数据
        PROCESS_LOGISTICS_PLATFORM: 3, //文件数据处理成功，准备开始录入物流平台数据
        PROCESS_STORE: 4, //物流平台数据录入成功，准备开始录入店铺信息
        PROCESS_IS_GIFTS: 5, //店铺信息录入成功，准备开始录入赠品标识数据
        PROCESS_APPORTIONED_PRICE: 6, //赠品标识数据录入成功，准备开始处理ERP订单分摊价格
        MERGE_DATA: 7, //处理ERP订单分摊价格成功，准备开始合并ERP订单分摊价格和数量
        SUCCESS: 8, //数据录入成功!
        FAIL: 9, //文件处理失败
      },

      total: 0,
      //列表数据
      erpImportList: [],

      // 文件数据
      fileData: {},

      // 控制确定按钮
      submitDisabled: false,

      //导入弹窗是否显示的标记
      showAddDialog: false,

      //导入接口的数据条件
      importReq: {},

      // 定时器轮询
      time: null,

      // 定时器数组
      timeArr: [],

      reqParams: {
        page: 1,
        pageSize: 20,
      },

      importRules: {
        uploadDate: [
          { required: true, message: "请选择归属日期", trigger: "blur" },
        ],
        erpOrderImport: [
          { required: true, message: "请选择导入类别", trigger: "blur" },
        ],
        file: [{ required: true, message: "请选择文件", trigger: "blur" }],
      },
    };
  },
  created() {
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
    },

    //时间格式化
    getFormatDate(timeStamp) {
      return getFormatDate(timeStamp);
    },

    //获取列表信息
    async getList() {
      const res = await getErpSaleOrderList(this.reqParams);
      this.erpImportList = res.data.records;
      this.total = res.data.total;

      //轮询查是否有需要检查状态的数据
      for (let i = 0; i < this.erpImportList.length; i++) {
        let row = this.erpImportList[i];
        //不是成功，也不是失败，则轮询
        if (
          row.erpOrderStatus != this.erpOrderStatusEnum.SUCCESS &&
          row.erpOrderStatus != this.erpOrderStatusEnum.FAIL
        ) {
          this.checkStart(row);
        }
      }
    },

    //删除
    deleteOrderImport(row) {
      this.$confirm("确定删除当前导入数据吗，删除后不可恢复？", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        beforeClose: async (action, instance, done) => {
          if (action === "confirm") {
            instance.confirmButtonLoading = true;
            instance.confirmButtonText = "删除中...";
            const [err, res] = await this.$to(deleteOrderImport(row.uuid));
            if (err) {
              console.error("erp订单导入删除接口错误", err);
            }

            // 如果当条数据还在上传中，删除时要关闭这条定时任务
            if (
              row.erpOrderStatus != this.erpOrderStatusEnum.SUCCESS &&
              row.erpOrderStatus != this.erpOrderStatusEnum.FAIL
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
                message: "删除数据成功！",
              });
            }
          } else {
            await done();
          }
        },
      });
    },

    //导入文件的确定
    async submitForm() {
      //必填校验
      this.$refs["importRef"].validate(async (valid) => {
        if (valid) {
          // 将确定按钮置灰
          this.submitDisabled = true;
          if (Object.keys(this.fileData).length === 0) {
            return this.$message.warning("请选择上传文件");
          }

          let formData = new FormData();
          formData.append("uploadDate", this.importReq.uploadDate);
          formData.append("erpOrderImport", this.importReq.erpOrderImport);
          formData.append("file", this.fileData);
          if (this.importReq.erpOrderImport == 3) {
            const [err, res] = await this.$to(
              uploadReturnOrderImport(formData)
            );
            if (res) {
              // 关闭弹窗
              this.cleanAdd();
              // 刷新数据
              await this.getList();
            }
            this.submitDisabled = false;
          } else {
            const [err, res] = await this.$to(uploadOrderImport(formData));
            if (res) {
              // 关闭弹窗
              this.cleanAdd();
              // 刷新数据
              await this.getList();
            }
            this.submitDisabled = false;
          }
        }
      });
    },

    //导入
    importOrderImport() {
      this.submitDisabled = false;
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

    // 开始轮询,index是数据索引的位置
    checkStart(row) {
      let activeCount = 0;
      let totalCount = (5 * 60 * 1000) / 3000 - 1;

      let time = setInterval(() => {
        getErpOrderStatus(row.uuid)
          .then(async (res) => {
            let result = res.data;
            //更新结果行内容
            row.result = result.result;
            row.erpOrderStatus = result.erpOrderStatus;

            if (result.erpOrderStatus === this.erpOrderStatusEnum.SUCCESS) {
              clearInterval(time);
              // this.time = null
              this.$message.success("导入成功");
            }
            if (result.erpOrderStatus === this.erpOrderStatusEnum.FAIL) {
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




