<template>
  <div class="baseData_sku">
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
      <el-table :data="skuList" style="width: 100%" max-height="400">
        <el-table-column type="index" label="序号" width="70"></el-table-column>
        <el-table-column prop="code" label="产品编号" width="120"></el-table-column>
        <el-table-column prop="productName" label="产品名称" width="120"></el-table-column>
        <el-table-column prop="skuCode" label="SKU编码" width="120"></el-table-column>
        <el-table-column prop="skuSpecifications" label="SKU规格" width="120"></el-table-column>
        <el-table-column prop="skuModel" label="SKU型号" width="120"></el-table-column>
        <el-table-column prop="skuPrice" label="SKU单价" width="120"></el-table-column>
        <el-table-column prop="skuDescription" label="SKU说明" width="120"></el-table-column>
        <el-table-column prop="state" label="SKU状态" width="120">
          <template v-slot="{row}">
            <span>{{ row.state==='0'?'正常':'关闭' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280">
          <template v-slot="{row}">
            <el-button size="mini" @click="editSku(row)">修改</el-button>
            <el-button size="mini" @click="deleteSku(row.id)">删除</el-button>
            <el-button size="mini" @click="getSkuDetail(row.id)">详情</el-button>
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
        <el-descriptions-item label="SKU规格">{{ detailList.skuSpecifications }}</el-descriptions-item>
        <el-descriptions-item label="SKU型号">{{ detailList.skuModel }}</el-descriptions-item>
        <el-descriptions-item label="SKU单价">{{ detailList.skuPrice }}</el-descriptions-item>
        <el-descriptions-item label="SKU说明">{{ detailList.skuDescription }}</el-descriptions-item>
        <el-descriptions-item label="SKU状态">{{ detailList.state ==='0'?'正常':'关闭' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>
<script>
import { getSkuList, skuDetail, deleteSku } from '@/api/baseData/sku'
import Dialog from './components/Dialog.vue'
export default {
  name: 'Commoditysku',
  components: {
    Dialog,
  },
  data() {
    return {
      showDetail: false,
      skuList: [],
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
  watch: {
    '$route.query.id': {
      immediate: true,
      deep: true,
      handler(val) {
        if (val) {
          console.log(val)
          this.reqParams.code = val
          this.getList()
        }
      },
    },
  },
  methods: {
    // 清空数据
    clearRow() {
      this.row = {}
    },
    // 获取列表信息
    async getList() {
      const res = await getSkuList(this.reqParams)
      this.skuList = res.rows
      // console.log(this.skuList)
    },

    // 新增
    addList() {
      this.showAddDialog = true
    },
    // 修改
    async editSku(row) {
      this.showAddDialog = true
      this.row = row
      console.log('row', this.row)
    },
    // 详情
    async getSkuDetail(id) {
      this.showDetail = true
      const res = await skuDetail(id)
      this.detailList = res.data
    },
    // 删除
    deleteSku(id) {
      this.$to(
        this.$confirm('确定删除此sku？', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          beforeClose: async (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true
              instance.confirmButtonText = '删除中...'
              await deleteSku(id)
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
.baseData_sku {
  padding: 40px;
}
</style>