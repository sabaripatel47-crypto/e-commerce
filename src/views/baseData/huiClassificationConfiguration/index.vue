<template>
  <div class="app-container">
    <div class="head-contatiner">
      <el-form class="page-search" inline ref="page-filter">
        <el-form-item label="关键词搜索：" style="margin-right: 20px">
          <el-input
            v-model="reqParams.keyword"
            placeholder="请输入"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="分类状态：" style="margin-right: 20px">
          <el-select
            v-model="reqParams.cateStatus"
            filterable
            clearable
            placeholder="请选择"
          >
            <el-option
              v-for="item in cateStatusList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="费用项状态：" style="margin-right: 20px">
          <el-select
            v-model="reqParams.isOffStatus"
            filterable
            clearable
            placeholder="请选择"
          >
            <el-option
              v-for="item in isOffStatusList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            @click="getPageList(1)"
            >搜索</el-button
          >
          <el-button type="primary" icon="el-icon-plus" @click="openAdd"
            >新增</el-button
          >
          <el-button
            type="primary"
            icon="el-icon-download"
            v-hasPermi="['baseData:huiClassificationConfiguration:export']"
            @click="exportData"
            >导出</el-button
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

      <el-table-column prop="storeName" label="所归类费用项" align="center">
        <template v-slot="{ row }">
          {{ row.classifiedExpenseItem }}
        </template></el-table-column
      >
      <el-table-column prop="storeName" label="分类" align="center">
        <template v-slot="{ row }">
          <span v-show="!row.isEdit"> {{ row.questionClassification }}</span>
          <i
            v-show="!row.isEdit"
            class="el-icon-edit"
            @click="openEdit(row)"
          ></i>
          <!-- <el-input
            v-show="row.isEdit"
            v-model="row.questionClassification"
            style="width: 150px"
          ></el-input> -->

          <el-autocomplete
            v-if="row.isEdit"
            v-model="row.questionClassification"
            :fetch-suggestions="querySearchAsync"
            ref="autocomplete"
            placeholder="请输入内容"
            @blur="closeEdit(row)"
          ></el-autocomplete>
        </template>
      </el-table-column>
      <el-table-column prop="storeName" label="状态" align="center">
        <template v-slot="{ row }">
          <el-switch
            v-model="row.isOffStatus"
            active-text="启动"
            inactive-text="停用"
            active-color="#13ce66"
            :active-value="0"
            :inactive-value="1"
            @change="stop(row)"
          >
          </el-switch> </template
      ></el-table-column>
    </el-table>
    <Pagination
      v-show="total > 0"
      :total="total"
      :page.sync="reqParams.page"
      :page-size.sync="reqParams.pageSize"
      @pagination="getPageList"
    />

    <el-dialog
      title="新增费用项"
      :visible="showAddDialog"
      :before-close="cleanAdd"
      width="40%"
    >
      <el-form
        :model="addReq"
        :rules="addRules"
        ref="addRef"
        label-width="140px"
        label-position="right"
      >
        <el-form-item label="所归类费用项：" prop="classifiedExpenseItem">
          <el-input
            class="el-form-item-width40"
            v-model="addReq.classifiedExpenseItem"
            placeholder="请输入所归类费用项"
          ></el-input>
        </el-form-item>
        <el-form-item label="分类：" prop="questionClassification">
          <el-autocomplete
            class="el-form-item-width40"
            v-model="addReq.questionClassification"
            :fetch-suggestions="querySearchAsync"
            placeholder="请输入分类"
          ></el-autocomplete>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cleanAdd">取 消</el-button>
        <el-button type="primary" @click="add">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  getTableList,
  getCateList,
  stop,
  editType,
  getKeywordList,
  add,
  exportExcel,
} from "@/api/baseData/huiClassificationConfiguration";
import { tansParams, blobValidate } from "@/utils/ruoyi";

export default {
  name: "HuiClassificationConfiguration",
  data() {
    return {
      // 列表请求参数
      reqParams: {
        cateStatus: "",
        isOffStatus: "",
        keyword: "",
        page: 1,
        pageSize: 10,
      },
      tableData: [],
      // 总条数
      total: 0,
      loading: false,
      //   分类状态下拉
      cateStatusList: [],
      // 费用项状态下拉
      isOffStatusList: [
        { name: "启用", code: 0 },
        { name: "停用", code: 1 },
      ],
      restaurants: [],
      // 选中修改项原先的值
      oldVal: "",
      addReq: {
        classifiedExpenseItem: "",
        questionClassification: "",
      },
      // 弹窗显示隐藏
      showAddDialog: false,
      addRules: {
        classifiedExpenseItem: [
          { required: true, message: "请输入所归类费用项", trigger: "blur" },
        ],
        questionClassification: [
          { required: true, message: "请输入分类", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getCateStatusList();
    this.getPageList(1);
  },
  methods: {
    // 获取列表
    async getPageList(page) {
      if (page == 1) {
        this.reqParams.page = 1;
      }
      this.loading = true;
      const res = await getTableList(this.reqParams);
      this.tableData = res.data.records;
      this.total = res.data.total;
      this.loading = false;
    },
    // 获取分类状态下拉
    async getCateStatusList() {
      const res = await getCateList();
      this.cateStatusList = res.data;
    },
    // 停用启用
    async stop(row) {
      const req = {
        isOffStatus: row.isOffStatus,
        uuid: row.uuid,
      };
      const res = await stop(req);
      if (res.code === 200) {
        this.$message.success("操作成功");
      } else {
        this.$message.error(res.message);
      }
    },
    // 编辑类型
    async editType(row) {
      const req = {
        questionClassification: row.questionClassification,
        uuid: row.uuid,
      };
      // const res = await editType(row);
      // if (res.code === 200) {
      //   this.$message.success("操作成功");
      // } else {
      //   row.questionClassification = this.oldVal;
      //   this.$message.error(res.message);
      // }

      try {
        const res = await editType(row);
        if (res.code === 200) {
          this.$message.success("操作成功");
        }
      } catch (error) {
        row.questionClassification = this.oldVal;
        // this.$message.error(error);
      }

      this.$set(row, "isEdit", false);
    },
    // 打开编辑输入框
    openEdit(row) {
      this.$set(row, "isEdit", true);
      this.oldVal = row.questionClassification;
      row.questionClassification = "";
      this.$nextTick(() => {
        // 使用 $nextTick 确保输入框渲染完毕后聚焦
        this.$refs.autocomplete.focus();
      });
    },
    // 取消编辑
    closeEdit(row) {
      if (
        row.questionClassification == "" ||
        row.questionClassification == this.oldVal
      ) {
        row.questionClassification = this.oldVal;
        this.oldVal = "";
        this.$set(row, "isEdit", false);
        return;
      }
      this.$confirm("你确定要保存已输入的值吗?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.editType(row);
          this.oldVal = "";
        })
        .catch(() => {
          row.questionClassification = this.oldVal;
          this.oldVal = "";
          this.$set(row, "isEdit", false);
        });
    },
    // 输入框搜索
    async querySearchAsync(queryString, cb) {
      if (!queryString) {
        cb([]); // 如果没有输入内容，返回空数组
        return;
      }
      const res = await getKeywordList(queryString);
      console.log(res.data.map((item) => item.name));
      const restaurants =
        res.data.map((item) => {
          return {
            value: item.name,
          };
        }) || [];
      console.log(restaurants);
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        cb(restaurants);
      }, 3000 * Math.random());
    },
    // 新增弹窗
    openAdd() {
      this.showAddDialog = true;
      this.addReq = {
        classifiedExpenseItem: "",
        questionClassification: "",
      };
      this.$nextTick(() => {
        this.$refs["addRef"].resetFields();
      });
    },
    // 新增
    async add() {
      const res = await add(this.addReq);
      if (res.data == true) {
        this.$message.success("新增成功");
        this.showAddDialog = false;
        this.getPageList(1);
      } else {
        this.$message.error(res.message);
      }
    },
    // 关闭弹窗
    cleanAdd() {
      this.showAddDialog = false;
      // this.$refs.addRef.resetFields();
      this.$nextTick(() => {
        this.$refs["addRef"].resetFields();
      });
    },
    // 导出
    async exportData() {
      if (this.tableData.length == 0) {
        return this.$message.error("暂无数据导出");
      }
      exportExcel(this.reqParams)
        .then(async (data) => {
          const isBlob = blobValidate(data);
          if (isBlob) {
            const blob = new Blob([data]);
            saveAs(blob, `慧经营配置表.xlsx`);
          }
        })
        .catch((r) => {
          console.error(r);
          Message.error("下载文件出现错误，请联系管理员！");
          downloadLoadingInstance.close();
        });
    },
  },
};
</script>

<style lang='scss' scoped>
</style>
