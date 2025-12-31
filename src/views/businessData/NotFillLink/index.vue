<template>
  <div class="app-container">
    <!-- 搜索 -->
    <div class="head-container">
      <el-form class="page-search" inline ref="page-filter">
        <el-form-item label="店铺：" prop="storeUuid" style="margin-right: 20px;">
          <el-select filterable v-model="reqParams.storeUuid" placeholder="请选择店铺" clearable>
            <el-option
              v-for="item in storeList"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="getList(1)">搜索</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="container">
      <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport">导出</el-button>
      <!-- 表格 -->
      <el-table :data="tableData" style="width: 100%" v-loading="loading" max-height="700">
        <el-table-column type="index" label="序号" width="70"></el-table-column>
        <el-table-column prop="platformName" label="平台" width="130"></el-table-column>
        <el-table-column prop="storeCode" label="店铺编号" width="180"></el-table-column>
        <el-table-column prop="storeShowName" label="店铺名称" width="260"></el-table-column>
        <el-table-column prop="managerName" label="店铺负责人" width="100"></el-table-column>
        <el-table-column prop="spuShowName" label="产品名称" width="280"></el-table-column>
        <el-table-column prop="specsName" label="规格名称" width="280"></el-table-column>
        <el-table-column prop="skuCode" label="SKU编码（商家编码）" width="180"></el-table-column>
        <el-table-column prop="linkId" label="链接ID" width="180"></el-table-column>
      </el-table>
      <!-- 分页 -->
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="reqParams.page"
        :limit.sync="reqParams.pageSize"
        @pagination="getList()"
      />
    </div>
  </div>
</template>

<script>
import { listLinkFill } from '@/api/businessData/NotFillLink'
import { listStore } from '@/api/baseData/common'

export default {
  name: 'NotFillLink',
  data() {
    return {
      // 查询入参
      reqParams: {
        page: 1, //页码
        pageSize: 10, //每页记录数
        storeUuid: '', //店铺筛选条件
      },
      // 列表数据
      tableData: [],
      // 总条数
      total: 0,
      // 加载
      loading: false,
      //店铺下拉框
      storeList: [],
    }
  },
  created() {
    this.getList()
    //店铺下拉框
    this.listStore()
  },
  methods: {
    // 获取列表信息
    async getList(page) {
      this.loading = true

      if (page !== undefined) {
        this.reqParams.page = page
      }
      const res = await listLinkFill(this.reqParams)
      this.tableData = res.data.records
      this.total = res.data.total
      this.loading = false
    },
    // 店铺下拉框
    async listStore() {
      const res = await listStore()
      this.storeList = res.data
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        'server/LinkFillQuery/export',
        { ...this.reqParams },
        `未录入链接_${new Date().getTime()}.xlsx`
      )
    },
  },
}
</script>

<style scoped>
</style>
