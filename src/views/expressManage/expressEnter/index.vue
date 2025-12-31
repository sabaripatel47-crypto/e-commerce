<template>
  <div class="expressManage_expressEnter">
    <!-- 搜索 -->
    <div class="page_search">
      <el-form inline ref="page-filter">
        <el-form-item label="状态：" class="search_item">
          <el-select
            v-model="reqParams.expressStatus"
            clearable
            placeholder="请选择状态"
          >
            <el-option
              v-for="item in statusDataList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="快递单号搜索：" class="search_item">
          <el-input
            placeholder="请输入快递单号"
            v-model="reqParams.expressNum"
            class="handle_input"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="getList()"
            >搜索</el-button
          >
        </el-form-item>
        <br />
        <el-form-item>
          <el-button type="primary" plain icon="el-icon-plus" @click="addList()"
            >新增</el-button
          >
        </el-form-item>
      </el-form>
    </div>
    <div class="container">
      <!-- 表格 -->
      <el-table :data="tableList" style="width: 100%" >
        <el-table-column
          type="index"
          label="序号"
          width="70"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="expressNum"
          label="快递单号"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="money"
          label="金额"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="storeName"
          label="店铺"
          align="center"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="originalOrderId"
          label="订单号"
          align="center"
        ></el-table-column>
        <el-table-column prop="imageFileList" label="交易截图" align="center">
          <template v-slot="{ row }">
            <el-image
              v-for="(item, index) in row.imageFileList"
              :key="index"
              style="height: 30px; width: 30px"
              :src="item.url + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
              @click="handlePictureCardPreview(item.url)"
              :initial-index="0"
            ></el-image>
          </template>
        </el-table-column>
        <el-table-column
          prop="expressStatusName"
          label="状态"
          align="center"
        ></el-table-column>
        <el-table-column label="操作" align="center">
          <template v-slot="{ row }">
            <div v-if="row.expressStatusName !== '已确认'">
              <el-button
                v-if="row.expressStatus == 2"
                size="mini"
                type="text"
                @click="confirmExpress(row.uuid)"
                >确认</el-button
              >
              <el-button
                size="mini"
                type="text"
                v-if="row.expressStatus !== 2"
                @click="deleteExpressData(row.uuid)"
                >删除</el-button
              >
            </div>
            <div v-else>
              <span>已确认</span>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="reqParams.page"
        :limit.sync="reqParams.pageSize"
        @pagination="getList()"
      />
    </div>
    <el-dialog
      title="新增快递单"
      :visible="showAddDialog"
      @close="closeAddDialog"
      :close-on-click-modal="false"
      width="40%"
    >
      <el-form
        :model="courierAddDTO"
        ref="addRef"
        label-width="100px"
        class="demo-dynamic"
      >
        <el-form-item
          v-for="(item, index) in courierAddDTO.list"
          :label="'快递单号' + (index + 1)"
          :key="item.key"
          :prop="'list.' + index + '.expressNum'"
        >
          <el-input
            :ref="`input${index}`"
            class="form_input"
            placeholder="请输入快递单号"
            v-model="item.expressNum"
            @keydown.enter.native="changeNextInput($event, index)"
          ></el-input>
          <el-button @click.prevent="removeExpressNum(item)">删除</el-button>
        </el-form-item>
        <el-form-item>
          <el-button @click="addExpressNum">新增快递单号</el-button>
          <el-button type="primary" @click="submitForm('addRef')"
            >提交</el-button
          >
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="" />
    </el-dialog>
  </div>
</template>

<script>
import {
  getExpressList,
  getStatusList,
  addExpressList,
  deleteExpress,
  affirmExpress,
} from "@/api/expressManage/expressEnter";
export default {
  name: "ExpressEnter",
  data() {
    return {
      dialogImageUrl: "",
      dialogVisible: false,

      // 状态下拉框数据
      statusDataList: [],

      // 查询入参
      reqParams: {
        expressStatus: null, // 状态
        page: 1, // 页码
        pageSize: 20, // 页数量
        expressNum: "", // 快递单号
      },

      // 控制新增快递单弹层
      showAddDialog: false,

      // 新增的快递单号
      courierAddDTO: {
        list: [
          { expressNum: "" },
          { expressNum: "" },
          { expressNum: "" },
          { expressNum: "" },
          { expressNum: "" },
        ],
      },

      // 表格数据
      tableList: [],

      total: 0,
    };
  },
  async created() {
    await this.getList();
    await this.getStatusData();
  },
  methods: {
    changeNextInput(event, index) {
      event.preventDefault();
      if (this.$refs[`input${index+1}`]) {
        this.$refs[`input${index+1}`][0].focus();
      }
    },
    handlePictureCardPreview(utl) {
      this.dialogImageUrl = utl;
      this.dialogVisible = true;
    },
    // 查询
    async getList() {
      const res = await getExpressList(this.reqParams);
      this.tableList = res.data.records;
      this.total = res.data.total;
      console.log("查询列表数据", res);
    },

    // 获取下拉框数据
    async getStatusData() {
      const res = await getStatusList();
      this.statusDataList = res.data;
      console.log("下拉框数据", res);
    },

    // 点击确认
    async confirmExpress(uuid) {
      const res = await affirmExpress({ uuid: uuid });
      await this.getList();
    },

    // 点击删除
    async deleteExpressData(uuid) {
      this.$to(
        this.$confirm("确定删除此快递单？", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
          beforeClose: async (action, instance, done) => {
            if (action === "confirm") {
              instance.confirmButtonLoading = true;
              instance.confirmButtonText = "删除中...";
              await deleteExpress({ uuid: uuid });
              instance.confirmButtonLoading = false;
              await done();
              await this.getList();
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

    // 点击新增
    addList() {
      this.showAddDialog = true;
    },

    // 关闭新增弹层
    closeAddDialog() {
      console.log("this.courierAddDTO.list: ", this.courierAddDTO.list);
      if (this.courierAddDTO.list.length !== 0) {
        this.$refs.addRef.resetFields();
      }
      this.showAddDialog = false;

      this.courierAddDTO = {
        list: [
          { expressNum: "" },
          { expressNum: "" },
          { expressNum: "" },
          { expressNum: "" },
          { expressNum: "" },
        ],
      };
    },

    // 快递单号 +1
    addExpressNum(event) {
      console.log("event: ", event);

      this.courierAddDTO.list.push({
        expressNum: "",
        key: Date.now(),
      });
    },

    // 提交新增
    async submitForm(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          console.log("this.courierAddDTO: ", this.courierAddDTO);

          this.courierAddDTO.list = this.courierAddDTO.list.filter((item) => {
            return item.expressNum;
          });
          if (this.courierAddDTO.list.length === 0) {
            this.courierAddDTO.list = [
              { expressNum: "" },
              { expressNum: "" },
              { expressNum: "" },
              { expressNum: "" },
              { expressNum: "" },
            ];
            this.$message("至少填写一个快递单号");
            return;
          }
          console.log(" this.courierAddDTO: ", this.courierAddDTO);

          const res = await addExpressList(this.courierAddDTO);
          this.closeAddDialog();
          if (res.code == 200 && res.data === true) {
            this.$message({
              type: "success",
              message: "新增成功！",
            });
          }
          await this.getList();
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    // 删除当条快递单号
    removeExpressNum(item) {
      if (this.courierAddDTO.list.length === 1) {
        this.$message("至少保留一个快递单号");
        return;
      }
      var index = this.courierAddDTO.list.indexOf(item);
      if (index !== -1) {
        this.courierAddDTO.list.splice(index, 1);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.expressManage_expressEnter {
  padding: 40px;
  .page_search {
    .search_item {
      margin-right: 20px;
    }
  }
  .form_input {
    width: 20vw;
    margin-right: 6px;
  }
}
</style>
