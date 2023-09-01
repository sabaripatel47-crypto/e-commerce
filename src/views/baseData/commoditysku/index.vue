<template>
  <div class="baseData_store">
    <!-- 搜索 -->
    <div class="page-search">
      <el-form class="page-search" inline ref="page-filter">
        <el-form-item prop="keyword" label="关键字搜索：" style="margin-right: 20px;">
          <el-input placeholder="请输入关键字" class="handle-input"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search">搜索</el-button>
        </el-form-item>
        <br />
        <el-form-item>
          <el-button type="primary" icon="el-icon-plus">新增</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="container">
      <!-- 表格 -->
      <el-table :data="storeList" style="width: 100%" height="400">
        <el-table-column fixed prop="date" label="序号" width="90"></el-table-column>
        <el-table-column prop="date" label="产品编号" width="120"></el-table-column>
        <el-table-column prop="date" label="产品名称" width="150"></el-table-column>
        <el-table-column prop="name" label="SKU编码" width="120"></el-table-column>
        <el-table-column prop="province" label="SKU规格" width="200"></el-table-column>
        <el-table-column prop="city" label="SKU型号" width="120"></el-table-column>
        <el-table-column prop="address" label="SKU单价" width="120"></el-table-column>
        <el-table-column prop="name" label="SKU说明" width="120"></el-table-column>
        <el-table-column prop="name" label="SKU状态" width="330"></el-table-column>
        <el-table-column fixed="right" label="操作" width="120">
          <template>
            <el-button size="mini">修改</el-button>
            <el-button size="mini">删除</el-button>
            <el-button size="mini">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <!-- <el-row style="height: 60px" align="middle" type="flex" justify="end">
        <el-pagination
          layout="total, prev, pager, next"
          :total="total"
          :current-page="queryParams.page"
          :page-size="queryParams.pagesize"
          @current-change="changePage"
        />
      </el-row>-->
    </div>
  </div>
</template>

<script>
export default {
  name: 'Commoditysku',
  data() {
    return {
      storeList: [],
    }
  },
  created() {},
  methods: {},
}
</script>

<style>
.baseData_store {
  padding: 20px;
}
</style>