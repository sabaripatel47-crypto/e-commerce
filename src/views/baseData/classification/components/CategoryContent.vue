<template>
  <div class="CategoryContent-page">
    <el-form class="page-search" inline ref="page-filter">
      <!-- 条件查询后期优化掉暂时去除 -->
      <!-- <el-form-item label="关键字搜索：" style="margin-right: 20px;">
          <el-input placeholder="请输入关键字" v-model="reqParams.keywords" class="handle-input"></el-input>
      </el-form-item>
      <el-form-item label="状态" style="margin-right: 20px;">
        <el-select filterable v-model="reqParams.status" @keyup.enter="getDataList()" clearable>
          <el-option
            v-for="item in statusList"
            :label="item.name"
            :value="item.code"
            :key="item.code"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="getDataList()">搜索</el-button>
      </el-form-item>
      <br />-->
      <el-button type="primary" icon="el-icon-plus" @click="addCategory({uuid:'0'})">新增</el-button>
      <el-button icon="el-icon-sort" @click="toggleExpandAll">展开/折叠</el-button>
    </el-form>
    <!-- 表格 -->
    <el-table
      :data="tableData"
      v-if="refreshTable"
      v-loading="tableLoading"
      border
      :header-cell-style="{'text-align':'center'}"
      style="width: 100%"
      :default-expand-all="isExpandAll"
      row-key="uuid"
      :tree-props="{children: 'children'}"
    >
      <el-table-column prop="cateName" width="500" label="品类名称"></el-table-column>
      <el-table-column prop="sort" label="排序" align="center"></el-table-column>
      <el-table-column prop="statusName" label="状态" align="center"></el-table-column>
      <el-table-column prop="typeName" label="创建时间" align="center">
        <template v-slot="{row}">
          <span>{{getFormatDate(row.createTimeDate) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center">
        <template v-slot="{row}">
          <el-button type="text" @click="addCategory(row)">新增</el-button>
          <el-button type="text" @click="editCategory(row)">修改</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 新增弹层 -->
    <el-dialog
      :title="isEdit ? '修改' : '新增'"
      :visible.sync="showAddDialog"
      width="40%"
      :close-on-click-modal="false"
      :before-close="closeAddDialog"
    >
      <el-form ref="addDialogRef" :model="addReqParams" :rules="addRules" label-width="100px">
        <el-form-item v-if="addReqParams.parentName" label="上级品类：">
          <span>{{ addReqParams.parentName }}</span>
        </el-form-item>
        <el-form-item label="品类名称：" prop="cateName">
          <el-input
            class="el-form-item-width40"
            v-model="addReqParams.cateName"
            placeholder="请输入品类名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="显示排序：" prop="sort">
          <el-input-number
            v-model="addReqParams.sort"
            :precision="0"
            :min="0"
            placeholder="请输入显示排序"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="addReqParams.status">
            <el-radio v-for="item in statusList" :key="item.code" :label="item.code">{{ item.name }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeAddDialog">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  getCategoryList,
  addCategory,
  updateCategory,
  getStatusList,
} from '@/api/baseData/classification'
import { getFormatDate } from '@/utils/common'
export default {
  name: 'CategoryContent',
  data() {
    return {
      // 新增/修改入参
      addReqParams: {
        parentName: '',
        cateName: '',
        parentId: '',
        uuid: '',
        sort: 0,
        status: '1',
      },
      // 是否展开，默认全部展开
      isExpandAll: true,
      // 重新渲染表格状态
      refreshTable: true,
      // 查询入参
      reqParams: {
        cateName: '',
        status: '',
      },
      // 状态下拉框列表
      statusList: [],
      // 列表加载状态
      tableLoading: false,
      // 列表数据
      tableData: [],
      // 是否修改
      isEdit: false,
      // 控制新增弹层显隐
      showAddDialog: false,
      // 新增表单的校验
      addRules: {
        cateName: [
          { required: true, message: '请输入品类名称', trigger: 'blur' },
        ],
        sort: [{ required: true, message: '请输入排序', trigger: 'blur' }],
      },
    }
  },
  created() {
    // 获取状态下拉框数据
    this.getStatusList()
    // 获取列表数据
    this.getDataList()
  },
  methods: {
    /** 展开/折叠操作 */
    toggleExpandAll() {
      this.refreshTable = false
      this.isExpandAll = !this.isExpandAll
      this.$nextTick(() => {
        this.refreshTable = true
      })
    },

    // 获取状态下拉框数据
    async getStatusList() {
      const res = await getStatusList()
      this.statusList = res.data
    },

    // 时间格式化
    getFormatDate(date) {
      return getFormatDate(date)
    },

    // 关闭弹层
    async closeAddDialog() {
      await this.$refs['addDialogRef'].resetFields()
      this.showAddDialog = false
      await this.getDataList()
      this.addReqParams = {
        cateName: '',
        parentId: '',
        sort: 0,
        uuid: '',
        parentName: '',
        status: '1',
      }
      this.isEdit = false
    },

    // 新增
    addCategory(row) {
      this.showAddDialog = true
      this.addReqParams.parentName = row.cateName || null
      this.addReqParams.parentId = row.uuid
    },

    // 提交新增/修改表单
    async submitForm() {
      await this.$refs['addDialogRef'].validate()
      if (this.isEdit) {
        const res = await updateCategory(this.addReqParams)
      } else {
        const res = await addCategory(this.addReqParams)
      }
      this.$message.success('提交成功')
      this.closeAddDialog()
    },

    // 修改
    editCategory(row) {
      this.addReqParams.uuid = row.uuid
      this.addReqParams.cateName = row.cateName
      this.addReqParams.sort = row.sort
      this.addReqParams.status = row.status + ''
      this.addReqParams.parentName = row.parentName || null
      this.addReqParams.parentId = row.parentId
      this.isEdit = true
      this.showAddDialog = true
    },

    // 获取表格列表数据
    async getDataList() {
      this.tableLoading = true
      const res = await getCategoryList(this.reqParams)
      this.tableData = res.data
      this.tableLoading = false
    },
  },
}
</script>

<style lang="scss" scoped>
.CategoryContent-page {
  .add-btn {
    margin-bottom: 5px;
  }
}
</style>