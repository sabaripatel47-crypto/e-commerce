<template>
  <div>
    <!-- 搜索 -->
    <div class="page_search">
      <el-form inline ref="page-filter">
        <el-form-item label="店铺：" class="search_item">
          <el-select
            v-model="reqParams.storeUuid"
            filterable
            clearable
            placeholder="请选择店铺"
          >
            <el-option
              v-for="item in storeDataList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="getList()"
            >搜索</el-button
          >
        </el-form-item>
        <br />
        <el-form-item>
          <el-button
            type="primary"
            :disabled="selectExpress.length == 0"
            @click="batchHandle()"
            >批量处理</el-button
          >
        </el-form-item>
      </el-form>
    </div>
    <div class="container">
      <!-- 表格 -->
      <el-table
        v-loading="tableLoading"
        tooltip-effect="dark"
        :data="tableList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
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
        <!-- <el-table-column prop="expressStatusName" label="状态" align="center"></el-table-column> -->
        <el-table-column
          prop="conductorName"
          label="处理人"
          align="center"
        ></el-table-column>
        <el-table-column label="操作" align="center">
          <template v-slot="{ row }">
            <el-button size="mini" type="text" @click="clickHandle(row)"
              >处理</el-button
            >
            <el-button
              size="mini"
              type="text"
              @click="deleteExpressData(row.uuid)"
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
        @pagination="getList()"
      />
    </div>

    <!-- 处理弹层 -->
    <el-dialog
      fullscreen
      title="退款处理"
      :visible="showHandleDialog"
      @opened="opened"
      width="100%"
      :show-close="false"
    >
      <!-- 表格 -->
      <el-table
        v-loading="dialogTableLoading"
        :data="dialogTableList"
        style="width: 100%"
        max-height="600"
        border
        fit
      >
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
        >
        <template v-slot="{ row, $index }">
            <div :class="{'not-my':row.conductorName !== myName}">
              {{ row.expressNum }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="money" label="金额" width="100" align="center">
          <template v-slot="{ row, $index }">
            <el-input v-model="row.money"></el-input>
          </template>
        </el-table-column>
        <el-table-column
          prop="storeName"
          label="店铺"
          align="center"
          show-overflow-tooltip
        >
          <template v-slot="{ row, $index }">
            <el-select
              v-model="row.storeUuid"
              filterable
              placeholder="请选择店铺"
            >
              <el-option
                v-for="item in allStoreData"
                :key="item.code"
                :label="item.name"
                :value="item.code"
              ></el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="originalOrderId" label="订单号" align="center">
          <template v-slot="{ row, $index }">
            <el-input v-model="row.originalOrderId"></el-input>
          </template>
        </el-table-column>
        <el-table-column
          prop="imageFile"
          label="交易截图"
          align="center"
          min-width="100"
        >
          <template v-slot="{ row, $index }">
            <div class="file_upload">
              <ossFileUpload
                :btnType="btnType"
                :isPicture="true"
                :fileType="['.jpg', '.png', '.jpeg', '.gif']"
                :sign="signOSS"
                :limitNum="limitNum"
                :index="$index"
                :fileRecordList="fileRecordList[$index]"
                @getFileUrlAndIndex="getUrl"
                @deleteFilePlus="deleteFilePlus"
              ></ossFileUpload>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="conductorName"
          label="处理人"
          align="center"
        ></el-table-column>
        <el-table-column label="操作" align="center">
          <template v-slot="{ row, $index }">
            <el-button
              size="mini"
              type="text"
              @click="clickUntreated(row, $index)"
              >暂不处理</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="updateAllDataListFn">确 定</el-button>
        <el-button @click="cancelColes">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  getUntreatedList,
  getUntreatedStore,
  editConductor,
  getExpressDetail,
  deleteExpress,
  conductorBracket,
  updateAllDataList,
  submitHandle,
  fileLogistics,
  getFilesUuid,
} from "@/api/expressManage/refundHandle";

import { listStore } from "@/api/baseData/common";

import ossFileUpload from "@/components/OSSFileUpload";
export default {
  name: "HandleContent",
  data() {
    return {
      // 是否有不属于我的
      isNotMy: false,

      limitNum: 3,
      // 图片回显列表
      fileRecordList: {},
      // 当前选择的所有行的uuid
      currentRowUuid: [],
      // 不是当前输入用户的行uuid
      currentUuidNoUser: [],
      // 空的列表uuid
      emptyList: [],
      // 当前用户uuid
      myUuid: "",
      // 当前用户名
      myName: "",
      // 图片上传按钮样式
      btnType: "plus",
      // 上传签名
      signOSS: {},
      // 查询入参
      reqParams: {
        page: 1,
        pageSize: 10,
        storeUuid: "",
      },

      total: 0,

      // 表格数据
      tableList: [],

      // 处理页列表数据
      dialogTableList: [],

      // 控制列表加载状态
      tableLoading: false,

      // 店铺下拉框数据
      storeDataList: [],

      // 全量的店铺下拉框数据
      allStoreData: [],

      // 选中的快递单数据
      selectExpress: [],

      // 处理的数据详情
      dataDetail: [],

      // 弹层表格加载状态
      dialogTableLoading: false,

      // 控制处理弹层
      showHandleDialog: false,
    };
  },
  async created() {
    await this.getList();
    await this.getStoreData();
    await this.getAllStore();
    await this.getOssKey();
    await this.getCurrentuuid();
  },
  // mounted() {
  //   window.addEventListener("beforeunload", this.handleBeforeUnload);
  // },
  // beforeDestroy() {
  //   window.removeEventListener("beforeunload", this.handleBeforeUnload);
  // },
  methods: {
    // 关闭页面
    // handleBeforeUnload() {
    //   console.log("页面关闭了===================");
    //   this.cancelColes();
    // },
    // 打开弹窗提示
    opened() {
      if (this.isNotMy) {
        this.$message("你不是快递单处理人，请谨慎处理!");
      }
      console.log("打开了");
    },
    deleteFilePlus(obj) {
      console.log("obj: ", obj);
      const { index, bigObjIndex, item } = obj;
      console.log("index,item: ", index, item);
      console.log("this.fileRecordList: ", this.fileRecordList);

      this.fileRecordList[bigObjIndex].splice(index, 1);

      this.dialogTableList[bigObjIndex].imageFile.splice(index, 1);
      console.log("this.dialogTableList========: ", this.dialogTableList);
      console.log(" this.fileRecordList[index]: ", this.fileRecordList[index]);
    },
    // 取消按钮
    async cancelColes() {
      const noUserId = new Set(this.currentUuidNoUser);
      const myUiserId = this.currentRowUuid.filter(
        (item) => !noUserId.has(item)
      );
      console.log("myUiserId: ", myUiserId);
      // 是自己的，清空
      if (myUiserId.length || this.emptyList.length) {
        await this.conductorBracketFn([...myUiserId, ...this.emptyList]);
      }
      // 不是自己的，不操作
      await this.closeHandleDialog();
    },
    // 提交表单
    async updateAllDataListFn() {
      console.log("this.dialogTableList: ", this.dialogTableList);
      let state = await this.submitValidate(this.dialogTableList);
      console.log("state: ", state);
      if (!state) {
        this.$message("提交失败！金额错误！");
      } else {
        // console.log("ossUpload:",this.$refs.ossUpload.$data);
        const res = await updateAllDataList(this.dialogTableList);
        console.log("res: ", res);
        if (res.code == 200) {
          this.$message({
            type: "success",
            message: "提交成功",
          });
          this.closeHandleDialog();
        }
      }
    },
    // 校验
    async submitValidate(data) {
      const regex = /^-?\d{1,10}(\.\d+)?$/;
      return data.every((item) => {
        console.log("item: ", item);
        return regex.test(item.money);
      });
    },
    // 获取上传图片url
    async getUrl(obj) {
      console.log("obj: ", obj);
      const { url, index } = obj;
      // 添加回显图片
      this.fileRecordList[index]
        ? this.fileRecordList[index]
        : (this.fileRecordList[index] = []);
      this.fileRecordList[index].push(url);
      this.fileRecordList = Object.assign({}, this.fileRecordList);
      console.log("this.fileRecordList===111111111: ", this.fileRecordList);

      this.dialogTableList[index].imageFile
        ? this.dialogTableList[index].imageFile
        : (this.dialogTableList[index].imageFile = []);
      let uuid = await this.getFilesUuidFn(url);
      this.dialogTableList[index].imageFile.push(uuid);

      console.log("this.dialogTableList: ", this.dialogTableList);
    },
    async getFilesUuidFn(url) {
      let res = await getFilesUuid({
        fileName: url,
        originalName: "",
        platformType: 0,
      });
      console.log("res: ", res);
      return res.data;
    },
    // 获取当前用户uuid
    getCurrentuuid() {
      this.myUuid = JSON.parse(sessionStorage.getItem("userUuid")).uuid;
      console.log("this.myUuid : ", this.myUuid);
      this.myName = JSON.parse(sessionStorage.getItem("userUuid")).name;
      console.log(" this.myName: ", this.myName);
    },

    // 获取oss秘钥
    async getOssKey() {
      const res = await fileLogistics();
      console.log("res: ", res);
      this.signOSS = res.data;
    },
    // 获取列表数据
    async getList() {
      this.tableLoading = true;
      const res = await getUntreatedList(this.reqParams);
      console.log("getList===res: ", res);
      this.tableList = res.data.records;
      this.total = res.data.total;
      this.tableLoading = false;
    },

    // 获取全量的店铺下拉框数据
    async getAllStore() {
      const res = await listStore();
      this.allStoreData = res.data;
    },

    // 获取未处理的店铺下拉框数据
    async getStoreData() {
      const res = await getUntreatedStore();

      this.storeDataList = res.data;
    },

    // 选中的快递发生变化
    handleSelectionChange(val) {
      this.selectExpress = val;
    },

    // 处理数据
    async clickHandle(row) {
      console.log("row: ", row);
      // 将uuid放入数组中
      let dataArr = [];
      dataArr.push(row.uuid);
      let res = await this.getDetailName(dataArr);
      console.log("clickHandle=====res: ", res);

      this.currentRowUuid.push(row.uuid);
      // 调用添加处理人
      if (
        res.data[0].conductorName &&
        res.data[0].conductorName !== this.myName
      ) {
        this.isNotMy = true;
        this.currentUuidNoUser.push(row.uuid);
      } else if (
        res.data[0].conductorName === "" ||
        res.data[0].conductorName === null
      ) {
        // this.currentUuidNoUser.push(row.uuid);
        this.emptyList.push(row.uuid);
        await this.editConductor([row.uuid]);
      }
      // if (row.conductorName && row.conductorName !== this.myName) {
      //   this.isNotMy = true
      //   this.currentUuidNoUser.push(row.uuid);
      // } else if (row.conductorName === "" || row.conductorName === null) {
      //   // this.currentUuidNoUser.push(row.uuid);
      //   this.emptyList.push(row.uuid);
      //   await this.editConductor([row.uuid]);
      // }
      // 获取快递单详情
      await this.getDetail(dataArr);
      this.showHandleDialog = true;
    },

    // 关闭处理弹层
    async closeHandleDialog(type) {
      console.log("type: ", type);
      if (type === 1) {
        this.conductorBracketFn(this.currentRowUuid);
      }
      this.showHandleDialog = false;
      // 清空勾选的数据
      this.selectExpress = [];

      await this.getList();
      this.currentRowUuid = [];
      this.dialogTableList = [];
      this.fileRecordList = {};
      this.currentUuidNoUser = [];
      this.emptyList = [];
      this.isNotMy = false;
    },

    // 获取快递单详情
    async getDetail(val) {
      const res = await getExpressDetail({ uuid: val });
      console.log("getDetail==res: ", res);
      this.dialogTableList = res.data;
    },

    // 获取处理人
    async getDetailName(val) {
      const res = await getExpressDetail({ uuid: val });
      return res
    },

    // 批量处理
    async batchHandle() {
      // 提取所有快递单的uuid
      let listArr = [];
      let listName = [];
      this.selectExpress.forEach((item) => {
        listArr.push(item.uuid);
        listName.push(item.conductorName);
      });
      console.log("listArr: ", listArr);
      console.log("listName: ", listName);
      let res = await this.getDetailName(listArr);
      res.data.map((item) => {
        if (item.conductorName && item.conductorName !== this.myName) {
          this.isNotMy = true;
          this.currentUuidNoUser.push(item.uuid);
        } else if (item.conductorName === "" || item.conductorName === null) {
          this.emptyList.push(item.uuid);
          // nameNull.push(item.uuid);
        }
      });

      // this.selectExpress.map((item) => {
      //   listArr.push(item.uuid);
      //   if (item.conductorName && item.conductorName !== this.myName) {
      //     this.isNotMy = true;
      //     this.currentUuidNoUser.push(item.uuid);
      //   } else if (item.conductorName === "" || item.conductorName === null) {
      //     this.emptyList.push(item.uuid);
      //     // nameNull.push(item.uuid);
      //   }
      // });
      console.log("this.currentUuidNoUser: ", this.currentUuidNoUser);
      this.currentRowUuid = listArr;
      // // 添加处理人
      if (this.emptyList.length) {
        await this.editConductor(this.emptyList);
      }
      // 获取快递单详情
      await this.getDetail(this.currentRowUuid);

      this.showHandleDialog = true;
    },
    // 添加处理人
    async editConductor(val) {
      const res = await editConductor({ uuid: val });
      console.log("editConductor===res: ", res);
    },

    // 点击暂不处理
    async clickUntreated(row, index) {
      if (row.conductorName && row.conductorName === this.myName) {
        await this.conductorBracketFn([row.uuid, ...this.emptyList]);
      }
      this.dialogTableList.splice(index, 1);
      if (this.dialogTableList.length === 0) {
        this.closeHandleDialog();
      }
    },

    // 暂不处理
    async conductorBracketFn(uuidArr) {
      console.log("conductorBracketFn===uuidArr: ", uuidArr);
      const res = await conductorBracket({ uuid: uuidArr });
    },

    // 删除
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
  },
  components: {
    ossFileUpload,
  },
};
</script>

<style lang="scss" scoped>
.page_search {
  .search_item {
    margin-right: 20px;
  }
}

.file_upload {
  display: flex;
  justify-content: center;
  align-items: center;
}

::v-deep .el-tabs__content{
  padding-bottom: 20px;
}

.not-my{
  color: red;
}
</style>
