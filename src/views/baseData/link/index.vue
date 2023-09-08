<template>
  <div class="baseData_link">
    <!-- 搜索 -->
    <div class="page-search">
      <el-form class="page-search" inline ref="page-filter">
        <el-form-item label="关键字搜索：" style="margin-right: 20px;">
          <el-input placeholder="请输入关键字" v-model="reqParams.code" class="handle-input"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="getList()">搜索</el-button>
        </el-form-item>
        <br />
        <el-form-item>
          <el-button type="primary" icon="el-icon-plus" @click="addList()">新增</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="container">
      <!-- 表格 -->
      <el-table :data="linkList" style="width: 100%" max-height="400">
        <el-table-column type="index" label="序号" width="70"></el-table-column>
        <el-table-column prop="code" label="产品编码" width="120"></el-table-column>
        <el-table-column prop="productName" label="产品名称" width="120"></el-table-column>
        <el-table-column prop="skuCode" label="SKU编码" width="120"></el-table-column>
        <el-table-column prop="url" label="链接地址" width="120"></el-table-column>
        <el-table-column prop="platform" label="所属平台" width="120"></el-table-column>
        <el-table-column prop="enterprise" label="所属店铺" width="120"></el-table-column>
        <el-table-column prop="marketPrice" label="市场售价" width="120"></el-table-column>
        <el-table-column prop="salesPrice" label="实际销售价" width="120"></el-table-column>
        <el-table-column prop="manager" label="链接负责人" width="120"></el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template v-slot="{row}">
            <el-button size="mini" @click="editLink(row)">修改</el-button>
            <el-button size="mini" @click="deleteLink(row.id)">删除</el-button>
            <el-button size="mini" @click="getLinkDetail(row.id)">详情</el-button>
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
    <!-- 新增弹层 -->
    <Dialog v-if="showAddDialog" :row.sync="row" :showAddDialog.sync="showAddDialog"></Dialog>
    <!-- 详情弹层 -->
    <el-dialog :visible="showDetail" @close="showDetail = false" width="40%">
      <el-descriptions title="SKU详情" :column="2">
        <el-descriptions-item label="产品编号">{{ detailList.code }}</el-descriptions-item>
        <el-descriptions-item label="产品名称">{{ detailList.productName }}</el-descriptions-item>
        <el-descriptions-item label="SKU编码">{{ detailList.skuCode }}</el-descriptions-item>
        <el-descriptions-item label="链接地址">{{ detailList.url }}</el-descriptions-item>
        <el-descriptions-item label="所属平台">{{ detailList.platform }}</el-descriptions-item>
        <el-descriptions-item label="所属店铺">{{ detailList.enterprise}}</el-descriptions-item>
        <el-descriptions-item label="市场售价">{{ detailList.marketPrice}}</el-descriptions-item>
        <el-descriptions-item label="实际销售价">{{ detailList.salesPrice}}</el-descriptions-item>
        <el-descriptions-item label="链接负责人">{{ detailList.manager }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script>
import { getLinkList, linkDetail, deleteLink } from '@/api/baseData/link'
import Dialog from './components/Dialog.vue'
export default {
  name: 'Link',
  components: {
    Dialog,
  },
  data() {
    return {
      showDetail: false,
      linkList: [],
      showAddDialog: false,
      row: {},
      detailList: {},
      reqParams: {
        code: null,
      },
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 清空数据
    clearRow() {
      this.row = {}
    },
    // 获取列表信息
    async getList() {
      const res = await getLinkList(this.reqParams)
      this.linkList = res.rows
      // console.log(this.linkList)
    },
    // 新增
    addList() {
      this.showAddDialog = true
    },
    // 修改
    async editLink(row) {
      this.showAddDialog = true
      this.row = row
      console.log('row', this.row)
    },
    // 详情
    async getLinkDetail(id) {
      this.showDetail = true
      const res = await linkDetail(id)
      // console.log('详情', res)
      this.detailList = res.data
    },
    // 删除
    deleteLink(id) {
      this.$to(
        this.$confirm('确定删除此店铺？', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          beforeClose: async (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true
              instance.confirmButtonText = '删除中...'
              await deleteLink(id)
              instance.confirmButtonLoading = false
              await done()
              await this.getList()
              this.$message({
                type: 'success',
                message: '删除店铺成功！',
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

<style>
.baseData_link {
  padding: 40px;
}
</style>