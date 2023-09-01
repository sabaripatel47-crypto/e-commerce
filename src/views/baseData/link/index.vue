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
      <el-table :data="storeList" style="width: 100%" height="250">
        <el-table-column prop="date" label="序号" width="150"></el-table-column>
        <el-table-column prop="date" label="店铺编号" width="150"></el-table-column>
        <el-table-column prop="date" label="店铺名称" width="150"></el-table-column>
        <el-table-column prop="name" label="所属平台" width="120"></el-table-column>
        <el-table-column prop="province" label="所属公司" width="200"></el-table-column>
        <el-table-column prop="city" label="店铺规模" width="120"></el-table-column>
        <el-table-column prop="address" label="店铺状态" width="120"></el-table-column>
        <el-table-column prop="name" label="店铺负责人" width="120"></el-table-column>
        <el-table-column label="操作" width="120">
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
  name: 'Link',
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