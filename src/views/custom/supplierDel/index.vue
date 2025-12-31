<template>
  <div class="baseData_SPD">
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
      <el-table :data="SPDList" style="width: 100%" fit max-height="600">
        <el-table-column align="center" show-overflow-tooltip type="index" label="序号" width="70"></el-table-column>
        <el-table-column
          align="center"
          show-overflow-tooltip
          prop="supplierCode"
          label="供应商编码"
          min-width="120"
        ></el-table-column>
        <el-table-column
          align="center"
          show-overflow-tooltip
          prop="supplierName"
          label="供应商名称"
          min-width="120"
        ></el-table-column>
        <el-table-column
          align="center"
          show-overflow-tooltip
          prop="skuCode"
          label="SKU编码"
          min-width="120"
        ></el-table-column>
        <el-table-column
          align="center"
          show-overflow-tooltip
          prop="productName"
          label="产品名称"
          width="120"
        ></el-table-column>
        <el-table-column
          align="center"
          show-overflow-tooltip
          prop="productSpecifications"
          label="规格"
          width="120"
        ></el-table-column>
        <el-table-column
          align="center"
          show-overflow-tooltip
          prop="purchasePrice"
          label="采购价"
          width="120"
        ></el-table-column>
        <el-table-column
          align="center"
          show-overflow-tooltip
          prop="includingTax"
          label="是否含税"
          width="120"
        ></el-table-column>
        <el-table-column
          align="center"
          show-overflow-tooltip
          prop="logisticsPrice"
          label="物流价格"
          width="120"
        ></el-table-column>
        <el-table-column
          align="center"
          show-overflow-tooltip
          prop="packagePrice"
          label="包装价格"
          width="120"
        ></el-table-column>
        <el-table-column align="center" show-overflow-tooltip prop="cost" label="成本" min-width="120"></el-table-column>
        <el-table-column align="center" show-overflow-tooltip fixed="right" label="操作" min-width="200">
          <template v-slot="{row}">
            <el-button size="mini" type="text" icon="el-icon-edit" @click="editSPD(row)">修改</el-button>
            <!-- <el-button size="mini" type="text" icon="el-icon-delete" @click="deleteSPD(row.id)">删除</el-button> -->
            <el-button size="mini" type="text" icon="el-icon-view" @click="getSPDDetail(row.id)">详情</el-button>
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
    <el-dialog title="供应商品详情" :visible="showDetail" @close="showDetail = false" width="40%">
      <el-descriptions :column="2">
        <el-descriptions-item label="供应商编码">{{ detailList.supplierCode }}</el-descriptions-item>
        <el-descriptions-item label="供应商名称">{{ detailList.supplierName }}</el-descriptions-item>
        <el-descriptions-item label="SKU编码">{{ detailList.skuCode }}</el-descriptions-item>
        <el-descriptions-item label="产品名称">{{ detailList.productName }}</el-descriptions-item>
        <el-descriptions-item label="规格">{{ detailList.productSpecifications }}</el-descriptions-item>
        <el-descriptions-item label="采购价">{{ detailList.purchasePrice }}</el-descriptions-item>
        <el-descriptions-item label="是否含税">{{ detailList.includingTax }}</el-descriptions-item>
        <el-descriptions-item label="物流价格">{{ detailList.logisticsPrice }}</el-descriptions-item>
        <el-descriptions-item label="包装价格">{{ detailList.packagePrice }}</el-descriptions-item>
        <el-descriptions-item label="成本">{{ detailList.cost }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script>
import {
  getSPDList,
  SPDDetail,
  deleteSPD,
} from '@/api/customer/supplyProductDetail'
import Dialog from './components/Dialog.vue'
export default {
  name: 'SupplierDel',
  components: {
    Dialog,
  },
  data() {
    return {
      total: 0,
      showDetail: false,
      SPDList: [],
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
      const res = await getSPDList(this.reqParams)
      this.SPDList = res.data.records
      this.total = res.data.total
      // console.log(this.SPDList)
    },
    // 新增
    addList() {
      this.showAddDialog = true
    },
    // 修改
    async editSPD(row) {
      this.showAddDialog = true
      this.row = row
      console.log('row', this.row)
    },
    // 详情
    async getSPDDetail(id) {
      this.showDetail = true
      const res = await SPDDetail(id)
      this.detailList = res.data
    },
    // 删除
    deleteSPD(id) {
      this.$to(
        this.$confirm('确定删除此商品明细？', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          beforeClose: async (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true
              instance.confirmButtonText = '删除中...'
              await deleteSPD(id)
              instance.confirmButtonLoading = false
              await done()
              await this.getList()
              this.$message({
                type: 'success',
                message: '删除商品明细成功！',
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
.baseData_SPD {
  padding: 40px;
}
</style>
