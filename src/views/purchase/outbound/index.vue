<template>
  <div class="baseData_outbound">
    <!-- 搜索 -->
    <div class="page-search">
      <el-form class="page-search" inline ref="page-filter">
        <el-form-item label="关键字搜索：" style="margin-right: 20px;">
          <el-input placeholder="请输入商品名称" v-model="reqParams.name" class="handle-input"></el-input>
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
      <el-table :data="outboundList" style="width: 100%" max-height="600">
        <el-table-column type="index" label="序号" width="70" align="center"></el-table-column>
        <el-table-column prop="goodsModel" label="商品型号" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="goodsName" label="商品名称" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="goodsType" label="商品类型" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="goodsSpec" label="商品规格" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="goodsNum" label="商品数量" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="outboundName" label="出库登记人" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="outboundType" label="部门名称" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template v-slot="{row}">
            <el-button size="mini" type="text" icon="el-icon-edit" @click="editOutbound(row)">修改</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-view"
              @click="getOutboundDetail(row.id)"
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
    <el-dialog title="商品详情" :visible="showDetail" @close="showDetail = false" width="40%">
      <el-descriptions :column="2">
        <el-descriptions-item label="商品型号">{{ detailList.goodsModel }}</el-descriptions-item>
        <el-descriptions-item label="商品名称">{{ detailList.goodsName }}</el-descriptions-item>
        <el-descriptions-item label="商品类型">{{ detailList.goodsType }}</el-descriptions-item>
        <el-descriptions-item label="商品规格">{{ detailList.goodsSpec }}</el-descriptions-item>
        <el-descriptions-item label="商品数量">{{ detailList.goodsNum }}</el-descriptions-item>
        <el-descriptions-item label="出库登记人">{{ detailList.outboundName }}</el-descriptions-item>
        <el-descriptions-item label="部门名称">{{ detailList.outboundType }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script>
import { getOutboundList, outboundDetail } from '@/api/purchase/outbound'
import Dialog from './components/Dialog'
export default {
  name: 'Outbound',
  components: {
    Dialog,
  },
  data() {
    return {
      total: 0,
      showDetail: false,
      outboundList: [],
      showAddDialog: false,
      row: {},
      detailList: {},
      reqParams: {
        name: '',
        page: 1,
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
      const res = await getOutboundList(this.reqParams)
      this.outboundList = res.data.records
      this.total = res.data.total
      // console.log(this.outboundList)
    },
    // 新增
    addList() {
      this.showAddDialog = true
    },
    // 修改
    async editOutbound(row) {
      this.row = row
      console.log('row', this.row)
      this.showAddDialog = true
    },
    // 详情
    async getOutboundDetail(id) {
      this.showDetail = true
      const res = await outboundDetail(id)
      this.detailList = res.data
    },
    // 删除
    deleteOutbound(id) {
      this.$to(
        this.$confirm('确定删除此商品？', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          beforeClose: async (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true
              instance.confirmButtonText = '删除中...'
              await deleteOutbound(id)
              instance.confirmButtonLoading = false
              await done()
              await this.getList()
              this.$message({
                type: 'success',
                message: '删除商品成功！',
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
.baseData_outbound {
  padding: 40px;
}
</style>