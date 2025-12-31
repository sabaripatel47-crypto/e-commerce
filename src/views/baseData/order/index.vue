<template>
  <div class="baseData_order">
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
      <el-table :data="orderList" style="width: 100%" max-height="600">
        <el-table-column type="index" label="序号" width="70" fixed="left"></el-table-column>
        <el-table-column prop="platform" label="平台名称" width="120"></el-table-column>
        <el-table-column prop="storeCode" label="店铺编码" width="120"></el-table-column>
        <el-table-column prop="storeName" label="店铺名称" width="120"></el-table-column>
        <el-table-column prop="productName" label="产品名称" width="120"></el-table-column>
        <el-table-column prop="url" label="链接地址" width="120"></el-table-column>
        <el-table-column prop="skuCode" label="sku编号" width="120"></el-table-column>
        <el-table-column prop="code" label="订单编号" width="120"></el-table-column>
        <el-table-column prop="number" label="销售数量" width="120"></el-table-column>
        <el-table-column prop="price" label="销售金额" width="120"></el-table-column>
        <el-table-column prop="actualPayment" label="实付金额" width="120"></el-table-column>
        <el-table-column prop="paymentTime" label="支付时间" width="120" show-overflow-tooltip></el-table-column>
        <el-table-column prop="deliveryTime" label="发货时间" width="120" show-overflow-tooltip></el-table-column>
        <el-table-column prop="deliveryNumber" label="发货单号" width="120"></el-table-column>
        <el-table-column prop="receivingTime" label="收货时间" width="120" show-overflow-tooltip></el-table-column>
        <el-table-column prop="returnNumber" label="退货单号" width="120"></el-table-column>
        <el-table-column prop="returnTime" label="退货时间" width="120" show-overflow-tooltip></el-table-column>
        <el-table-column prop="refundNumber" label="退款单号" width="120"></el-table-column>
        <el-table-column prop="refundAmount" label="退款金额" width="120"></el-table-column>
        <el-table-column prop="refundTime" label="退款时间" width="120" show-overflow-tooltip></el-table-column>
        <el-table-column prop="urlManager" label="链接负责人" width="120"></el-table-column>
        <el-table-column prop="state" label="订单状态" width="120">
          <template v-slot="{row}">
            <span v-if="row.state =='0'">待付款</span>
            <span v-else-if="row.state =='1'">待发货</span>
            <span v-else-if="row.state =='2'">待收获</span>
            <span v-else-if="row.state =='3'">已收货</span>
            <span v-else-if="row.state =='4'">退款</span>
          </template>
        </el-table-column>
        <el-table-column prop="evaluationType" label="评价类型" width="120">
          <template v-slot="{row}">
            <span>{{ row.evaluationType === 0 ? '差评' : '好评' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="evaluationContent" label="评价内容" width="120"></el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template v-slot="{row}">
            <el-button size="mini" type="text" icon="el-icon-edit" @click="editOrder(row)">修改</el-button>
            <el-button size="mini" type="text" icon="el-icon-delete" @click="deleteOrder(row.id)">删除</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-view"
              @click="getOrderDetail(row.id)"
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
    <el-dialog title="订单详情" :visible="showDetail" @close="showDetail = false" width="40%">
      <el-descriptions :column="2">
        <el-descriptions-item label="平台名称">{{ detailList.code }}</el-descriptions-item>
        <el-descriptions-item label="店铺编码">{{ detailList.productName }}</el-descriptions-item>
        <el-descriptions-item label="店铺名称">{{ detailList.skuCode }}</el-descriptions-item>
        <el-descriptions-item label="产品名称">{{ detailList.number }}</el-descriptions-item>
        <el-descriptions-item label="SKU编号">{{ detailList.price }}</el-descriptions-item>
        <el-descriptions-item label="订单编号">{{ detailList.actualPayment }}</el-descriptions-item>
        <el-descriptions-item label="销售数量">{{ detailList.paymentTime }}</el-descriptions-item>
        <el-descriptions-item label="销售金额">{{ detailList.deliveryTime }}</el-descriptions-item>
        <el-descriptions-item label="实付金额">{{ detailList.deliveryNumber }}</el-descriptions-item>
        <el-descriptions-item label="支付时间">{{ detailList.receivingTime }}</el-descriptions-item>
        <el-descriptions-item label="发货时间">{{ detailList.returnNumber }}</el-descriptions-item>
        <el-descriptions-item label="发货单号">{{ detailList.returnTime }}</el-descriptions-item>
        <el-descriptions-item label="收货时间">{{ detailList.refundNumber }}</el-descriptions-item>
        <el-descriptions-item label="退货单号">{{ detailList.refundAmount }}</el-descriptions-item>
        <el-descriptions-item label="退货时间">{{ detailList.refundTime }}</el-descriptions-item>
        <el-descriptions-item label="退款单号">{{ detailList.refundTime }}</el-descriptions-item>
        <el-descriptions-item label="退款金额">{{ detailList.refundTime }}</el-descriptions-item>
        <el-descriptions-item label="退款时间">{{ detailList.refundTime }}</el-descriptions-item>
        <el-descriptions-item label="链接负责人">{{ detailList.urlManager }}</el-descriptions-item>
        <el-descriptions-item label="订单状态" v-if="detailList.state ==='0'">待付款</el-descriptions-item>
        <el-descriptions-item label="订单状态" v-else-if="detailList.state ==='1'">待发货</el-descriptions-item>
        <el-descriptions-item label="订单状态" v-else-if="detailList.state ==='2'">待收获</el-descriptions-item>
        <el-descriptions-item label="订单状态" v-else-if="detailList.state ==='3'">已收货</el-descriptions-item>
        <el-descriptions-item label="订单状态" v-else-if="detailList.state ==='4'">退款</el-descriptions-item>
        <el-descriptions-item label="评价类型">{{ detailList.evaluationType === 0 ? '差评' : '好评' }}</el-descriptions-item>
        <el-descriptions-item label="评价内容">{{ detailList.evaluationContent }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script>
import { getOrderList, orderDetail, deleteOrder } from '@/api/baseData/order'
import Dialog from './components/Dialog'
export default {
  name: 'Order',
  components: {
    Dialog,
  },
  data() {
    return {
      total: 0,
      showDetail: false,
      orderList: [],
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
      const res = await getOrderList(this.reqParams)
      this.orderList = res.data.records
      this.total = res.data.total
      // console.log(this.orderList)
    },
    // 新增
    addList() {
      this.showAddDialog = true
    },
    // 修改
    async editOrder(row) {
      this.showAddDialog = true
      this.row = row
      console.log('row', this.row)
    },
    // 详情
    async getOrderDetail(id) {
      this.showDetail = true
      const res = await orderDetail(id)
      this.detailList = res.data
    },
    // 删除
    deleteOrder(id) {
      this.$to(
        this.$confirm('确定删除此订单？', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          beforeClose: async (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true
              instance.confirmButtonText = '删除中...'
              await deleteOrder(id)
              instance.confirmButtonLoading = false
              await done()
              await this.getList()
              this.$message({
                type: 'success',
                message: '删除订单成功！',
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
.baseData_order {
  padding: 40px;
}
</style>