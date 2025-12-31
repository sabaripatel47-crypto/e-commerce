<template>
  <div class="baseData_link">
    <!-- 搜索 -->
    <div class="page-search">
      <el-form class="page-search" inline ref="page-filter">
        <el-form-item label="关键字搜索：" style="margin-right: 20px;">
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
      <el-table :data="linkList" style="width: 100%" max-height="600">
        <el-table-column type="index" label="序号" width="70"></el-table-column>
        <el-table-column prop="id" label="商品ID" width="120"></el-table-column>
        <el-table-column prop="code" label="产品编码" width="120"></el-table-column>
        <el-table-column prop="productName" label="产品名称" width="120"></el-table-column>
        <el-table-column prop="skuCode" label="SKU编码" width="120"></el-table-column>
        <el-table-column prop="url" label="链接地址" width="120"></el-table-column>
        <el-table-column prop="platform" label="所属平台" width="120"></el-table-column>
        <el-table-column prop="platformId" label="平台ID" width="120"></el-table-column>
        <el-table-column prop="store" label="所属店铺" width="120"></el-table-column>
        <el-table-column prop="storeId" label="店铺ID" width="120"></el-table-column>
        <el-table-column prop="marketPrice" label="市场售价" width="120"></el-table-column>
        <el-table-column prop="salesPrice" label="实际销售价" width="120"></el-table-column>
        <el-table-column prop="manager" label="链接负责人" width="120"></el-table-column>
        <el-table-column prop="department" label="所属部门" width="120"></el-table-column>
        <el-table-column prop="model" label="业务模型" width="120"></el-table-column>
        <el-table-column prop="rank" label="职级" width="120"></el-table-column>
        <el-table-column prop="createTime" label="登记时间" width="120"></el-table-column>
        <el-table-column prop="listingTime" label="上架时间" width="120"></el-table-column>
        <el-table-column prop="productIdStatus" label="商品id状态" width="120"></el-table-column>
        <el-table-column prop="productIdLevel" label="商品id级别" width="120"></el-table-column>
        <el-table-column prop="brand" label="品牌" width="120"></el-table-column>
        <el-table-column prop="mianUrl" label="主打链接" width="120">
          <template v-slot="{row}">
            <span>{{ row.mianUrl === 0 ? "否" : "是" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template v-slot="{row}">
            <el-button size="mini" type="text" icon="el-icon-edit" @click="editLink(row)">修改</el-button>
            <el-button size="mini" type="text" icon="el-icon-delete" @click="deleteLink(row.id)">删除</el-button>
            <el-button size="mini" type="text" icon="el-icon-view" @click="getLinkDetail(row.id)">详情</el-button>
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
    <el-dialog title="链接详情" :visible="showDetail" @close="showDetail = false" width="40%">
      <el-descriptions :column="2">
        <el-descriptions-item label="商品ID">{{ detailList.id }}</el-descriptions-item>
        <el-descriptions-item label="产品编号">{{ detailList.code }}</el-descriptions-item>
        <el-descriptions-item label="产品名称">{{ detailList.productName }}</el-descriptions-item>
        <el-descriptions-item label="SKU编码">{{ detailList.skuCode }}</el-descriptions-item>
        <el-descriptions-item label="链接地址">{{ detailList.url }}</el-descriptions-item>
        <el-descriptions-item label="所属平台">{{ detailList.platform }}</el-descriptions-item>
        <el-descriptions-item label="平台ID">{{ detailList.platformId }}</el-descriptions-item>
        <el-descriptions-item label="所属店铺">{{ detailList.store}}</el-descriptions-item>
        <el-descriptions-item label="店铺ID">{{ detailList.storeId}}</el-descriptions-item>
        <el-descriptions-item label="市场售价">{{ detailList.marketPrice}}</el-descriptions-item>
        <el-descriptions-item label="实际销售价">{{ detailList.salesPrice}}</el-descriptions-item>
        <el-descriptions-item label="链接负责人">{{ detailList.manager }}</el-descriptions-item>
        <el-descriptions-item label="所属部门">{{ detailList.department }}</el-descriptions-item>
        <el-descriptions-item label="业务模型">{{ detailList.model }}</el-descriptions-item>
        <el-descriptions-item label="职级">{{ detailList.rank }}</el-descriptions-item>
        <el-descriptions-item label="登记时间">{{ detailList.createTime }}</el-descriptions-item>
        <el-descriptions-item label="上架时间">{{ detailList.listingTime }}</el-descriptions-item>
        <el-descriptions-item label="商品id状态">{{ detailList.productIdStatus }}</el-descriptions-item>
        <el-descriptions-item label="商品id级别">{{ detailList.productIdLevel }}</el-descriptions-item>
        <el-descriptions-item label="品牌">{{ detailList.brand }}</el-descriptions-item>
        <el-descriptions-item label="主打链接">{{ detailList.mianUrl === 0 ? "否" : "是" }}</el-descriptions-item>
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
      total: 0,
      showDetail: false,
      linkList: [],
      showAddDialog: false,
      row: {},
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
    // 清空数据
    clearRow() {
      this.row = {}
    },
    // 获取列表信息
    async getList() {
      const res = await getLinkList(this.reqParams)
      this.linkList = res.data.records
      this.total = res.data.total
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
        this.$confirm('确定删除此链接？', {
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
                message: '删除链接成功！',
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
.baseData_link {
  padding: 40px;
}
</style>