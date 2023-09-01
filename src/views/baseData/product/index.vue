<template>
  <div class="baseData_product">
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
      <el-table :data="productList" style="width: 100%" height="250">
        <el-table-column fixed="left" prop="date" label="序号" width="90"></el-table-column>
        <el-table-column prop="date" label="产品编号" width="120"></el-table-column>
        <el-table-column prop="date" label="产品名称" width="120"></el-table-column>
        <el-table-column prop="name" label="产品型号" width="120"></el-table-column>
        <el-table-column prop="province" label="产品规格" width="120"></el-table-column>
        <el-table-column prop="city" label="产品介绍" width="120"></el-table-column>
        <el-table-column prop="address" label="产品价格" width="120"></el-table-column>
        <el-table-column prop="address" label="上市时间" width="120"></el-table-column>
        <el-table-column prop="address" label="新品标识" width="120"></el-table-column>
        <el-table-column prop="address" label="新品说明" width="120"></el-table-column>
        <el-table-column prop="address" label="产品状态" width="120"></el-table-column>
        <el-table-column prop="name" label="产品负责人" width="120"></el-table-column>
        <el-table-column prop="name" label="sku明细" width="120"></el-table-column>
        <el-table-column fixed="right" label="操作" width="220">
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
import { getProductList } from '@/api/baseData/product'
export default {
  name: 'Product',
  data() {
    return {
      productList: [],
    }
  },
  created() {
    this.getProductList()
  },
  methods: {
    async getProductList() {
      const res = await getProductList()
      console.log(res)
    },
  },
}
</script>

<style>
.baseData_product {
  padding: 20px;
}
</style>