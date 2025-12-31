<template>
  <div class="baseData_product">
    <!-- 搜索 -->
    <div class="page-search">
      <el-form class="page-search" inline ref="page-filter">
        <el-form-item prop="keyword" label="关键字搜索：" style="margin-right: 20px;">
          <el-input placeholder="请输入关键字" v-model="reqParams.keywords" class="handle-input"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="getList()">搜索</el-button>
        </el-form-item>
        <br />
        <el-form-item>
          <el-button type="primary" plain icon="el-icon-plus" @click="addList()">新增</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="container">
      <!-- 表格 -->
      <el-table :data="productList" style="width: 100%" max-height="250">
        <el-table-column fixed="left" type="index" label="序号" width="70"></el-table-column>
        <el-table-column prop="code" label="产品编号" width="120" show-overflow-tooltip></el-table-column>
        <el-table-column prop="name" label="产品名称" width="120" show-overflow-tooltip></el-table-column>
        <el-table-column prop="model" label="产品型号" width="120" show-overflow-tooltip></el-table-column>
        <el-table-column prop="specifications" label="产品规格" width="120" show-overflow-tooltip></el-table-column>
        <el-table-column prop="introduction" label="产品介绍" width="120" show-overflow-tooltip></el-table-column>
        <el-table-column prop="price" label="产品价格" width="120" show-overflow-tooltip></el-table-column>
        <el-table-column prop="ttm" label="上市时间" width="120" show-overflow-tooltip></el-table-column>
        <el-table-column prop="newFlag" label="新品标志" width="120" show-overflow-tooltip>
          <template v-slot="{row}">
            <span>{{ row.newFlag === "0" ? "是" : "否" }}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="newFlag" label="品牌" width="120" show-overflow-tooltip></el-table-column> -->
        <!-- <el-table-column prop="newFlag" label="供应商" width="120" show-overflow-tooltip></el-table-column> -->
        <el-table-column prop="newDescription" label="新品说明" width="120" show-overflow-tooltip></el-table-column>
        <el-table-column prop="state" label="产品状态" width="120">
          <template v-slot="{row}">
            <span>{{ row.state === '0' ? '正常' : '关闭' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="manager" label="产品负责人" width="120"></el-table-column>
        <el-table-column label="sku明细" width="120">
          <template v-slot="{row}">
            <el-link type="primary" @click="goSKU(row.code)">产品明细</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="产品分类" width="120" show-overflow-tooltip></el-table-column>
        <el-table-column prop="level" label="产品级别" width="120" show-overflow-tooltip></el-table-column>
        <el-table-column fixed="right" label="操作" width="220">
          <template v-slot="{row}">
            <el-button size="mini" type="text" icon="el-icon-edit" @click="editProduct(row)">修改</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="deleteProduct(row.id)"
            >删除</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-view"
              @click="getProductDetail(row.id)"
            >详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="reqParams.pageNum"
        :limit.sync="reqParams.pageSize"
        @pagination="getList"
      />
    </div>
    <!-- 新增弹层 -->
    <Dialog v-if="showAddDialog" :row.sync="row" :showAddDialog.sync="showAddDialog"></Dialog>
    <!-- 详情弹层 -->
    <el-dialog title="产品详情" :visible="showDetail" @close="showDetail = false" width="40%">
      <el-descriptions :column="2">
        <el-descriptions-item label="产品编号">{{ detailList.code }}</el-descriptions-item>
        <el-descriptions-item label="产品名称">{{ detailList.name }}</el-descriptions-item>
        <el-descriptions-item label="产品型号">{{ detailList.model }}</el-descriptions-item>
        <el-descriptions-item label="产品规格">{{ detailList.specifications }}</el-descriptions-item>
        <el-descriptions-item label="产品介绍">{{ detailList.introduction }}</el-descriptions-item>
        <el-descriptions-item label="产品价格">{{ detailList.price }}</el-descriptions-item>
        <el-descriptions-item label="上市时间">{{ detailList.ttm }}</el-descriptions-item>
        <el-descriptions-item label="新品标志">{{ detailList.newFlag === "0" ? "是" : "否" }}</el-descriptions-item>
        <el-descriptions-item label="新品说明">{{ detailList.newDescription }}</el-descriptions-item>
        <el-descriptions-item label="产品状态">{{ detailList.state ==='0'?'正常':'关闭' }}</el-descriptions-item>
        <el-descriptions-item label="产品负责人">{{ detailList.manager }}</el-descriptions-item>
        <el-descriptions-item label="产品分类">{{ detailList.type }}</el-descriptions-item>
        <el-descriptions-item label="产品级别">{{ detailList.level }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script>
import {
  getProductList,
  productDetail,
  deleteProduct,
} from '@/api/baseData/product'
import Dialog from './components/Dialog'
export default {
  name: 'Product',
  components: {
    Dialog,
  },
  data() {
    return {
      total: 0,
      productList: [],
      showAddDialog: false,
      row: {},
      showDetail: false,
      detailList: {},
      reqParams: {
        keywords: '',
        pageNum: 1,
        pageSize: 20,
      },
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 跳转到SKU页面
    goSKU(id) {
      this.$router.push({ name: 'Commoditysku', query: { id } })
    },
    // 清空
    clearRow() {
      this.row = {}
    },
    // 获取数据列表
    async getList() {
      const res = await getProductList(this.reqParams)
      this.productList = res.data.records
      this.total = res.data.total
      // console.log(this.productList)
    },
    // 新增
    addList() {
      this.showAddDialog = true
    },
    // 详情
    async getProductDetail(id) {
      this.showDetail = true
      const res = await productDetail(id)
      this.detailList = res.data
    },
    // 修改
    async editProduct(row) {
      this.showAddDialog = true
      this.row = row
      console.log('row', this.row)
    },
    // 删除
    deleteProduct(id) {
      this.$to(
        this.$confirm('确定删除此产品？', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          beforeClose: async (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true
              instance.confirmButtonText = '删除中...'
              await deleteProduct(id)
              instance.confirmButtonLoading = false
              await done()
              await this.getList()
              this.$message({
                type: 'success',
                message: '删除产品成功！',
              })
            } else {
              await done()
            }
          },
        })
      )
    },
  },
}
</script>

<style scoped>
.baseData_product {
  padding: 20px;
}
</style>