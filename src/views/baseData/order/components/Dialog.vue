<template>
  <el-dialog :title="showTitle" :visible="showAddDialog" @close="close" width="40%">
    <el-form
      :model="bdmOrder"
      :rules="orderRules"
      ref="bdmOrder"
      label-width="100px"
      label-position="right"
      class="demo-bdmOrder"
    >
      <el-form-item label="平台名称" prop="platform">
        <el-input v-model="bdmOrder.platform" placeholder="2-30个字符"></el-input>
      </el-form-item>
      <el-form-item label="店铺编码" prop="storeCode">
        <el-input v-model="bdmOrder.storeCode" placeholder="2-30个字符"></el-input>
      </el-form-item>
      <el-form-item label="店铺名称" prop="storeName">
        <el-input v-model="bdmOrder.storeName" placeholder="2-30个字符"></el-input>
      </el-form-item>
      <el-form-item label="链接地址" prop="url">
        <el-input v-model="bdmOrder.url" placeholder="2-30个字符"></el-input>
      </el-form-item>
      <el-form-item label="订单编号" prop="code">
        <el-input v-model="bdmOrder.code" placeholder="2-30个字符"></el-input>
      </el-form-item>
      <el-form-item label="产品名称" prop="productName">
        <el-input v-model="bdmOrder.productName" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="sku编号" prop="skuCode">
        <el-input v-model="bdmOrder.skuCode" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="销售数量" prop="number" required>
        <el-input-number size="medium" v-model="bdmOrder.number   "></el-input-number>
      </el-form-item>
      <el-form-item label="销售金额" prop="price" required>
        <el-input-number size="medium" v-model="bdmOrder.price"></el-input-number>
      </el-form-item>
      <el-form-item label="实际付款" prop="actualPayment">
        <el-input-number size="medium" v-model="bdmOrder.actualPayment"></el-input-number>
      </el-form-item>
      <el-form-item label="支付时间" prop="paymentTime">
        <el-date-picker
          v-model="bdmOrder.paymentTime"
          type="datetime"
          placeholder="选择日期时间"
          value-format="yyyy-MM-dd HH:mm:ss"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="发货时间" prop="deliveryTime">
        <el-date-picker
          v-model="bdmOrder.deliveryTime"
          type="datetime"
          placeholder="选择日期时间"
          value-format="yyyy-MM-dd HH:mm:ss"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="发货单号" prop="deliveryNumber">
        <el-input v-model="bdmOrder.deliveryNumber" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="收货时间" prop="receivingTime">
        <el-date-picker
          v-model="bdmOrder.receivingTime"
          type="datetime"
          placeholder="选择日期时间"
          value-format="yyyy-MM-dd HH:mm:ss"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="退货单号" prop="returnNumber">
        <el-input v-model="bdmOrder.returnNumber" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="退货时间" prop="returnTime">
        <el-date-picker
          v-model="bdmOrder.returnTime"
          type="datetime"
          placeholder="选择日期时间"
          value-format="yyyy-MM-dd HH:mm:ss"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="退款单号" prop="refundNumber">
        <el-input v-model="bdmOrder.refundNumber" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="退款金额" prop="refundAmount">
        <el-input-number size="medium" v-model="bdmOrder.refundAmount"></el-input-number>
      </el-form-item>
      <el-form-item label="退款时间" prop="refundTime">
        <el-date-picker
          v-model="bdmOrder.refundTime"
          type="datetime"
          placeholder="选择日期时间"
          value-format="yyyy-MM-dd HH:mm:ss"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="链接负责人" prop="urlManager">
        <el-cascader
          v-model="bdmOrder.urlManager"
          :options="options"
          :show-all-levels="false"
          :props="{children: 'children',label: 'deptName', value:'deptName', checkStrictly: false }"
          clearable
        ></el-cascader>
      </el-form-item>
      <el-form-item label="订单状态" prop="state">
        <el-radio-group v-model="bdmOrder.state">
          <el-radio label="0">待付款</el-radio>
          <el-radio label="1">待发货</el-radio>
          <el-radio label="2">待收货</el-radio>
          <el-radio label="3">已收货</el-radio>
          <el-radio label="4">退款</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="评价类型" prop="evaluationType">
        <el-radio-group v-model="bdmOrder.evaluationType">
          <el-radio label="0">差评</el-radio>
          <el-radio label="1">好评</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="评价内容" prop="evaluationContent">
        <el-input type="textarea" size="medium" v-model="bdmOrder.evaluationContent"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="showDialog">取 消</el-button>
      <el-button type="primary" @click="submitForm">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { addOrder, editOrder } from '@/api/baseData/order'
import { department } from '@/api/information/department'
import { getDeptTreeData } from '@/utils/common'
export default {
  name: 'Dialog',
  props: {
    showAddDialog: {
      type: Boolean,
      required: true,
    },
    row: {
      type: Object,
    },
  },
  created() {
    if (this.row.id) {
      this.showData()
    }
    this.getDeptTree()
  },
  data() {
    return {
      // 负责人级联选择
      options: [],

      bdmOrder: {
        id: null,
        platform: '',
        storeCode: '',
        storeName: '',
        url: '',
        code: '',
        productName: '',
        skuCode: '',
        number: null,
        price: null,
        actualPayment: null,
        paymentTime: '',
        deliveryTime: '',
        deliveryNumber: '',
        receivingTime: '',
        returnNumber: '',
        returnTime: '',
        refundNumber: '',
        refundAmount: null,
        refundTime: '',
        urlManager: '',
        state: '',
        evaluationType: '',
        evaluationContent: '',
      },
      orderRules: {
        platform: [
          { required: true, message: '请输入平台名称', trigger: 'blur' },
          {
            min: 2,
            max: 30,
            message: '长度在 2 到 30 个字符',
            trigger: 'blur',
          },
        ],
        storeCode: [
          { required: true, message: '请输入店铺编码', trigger: 'blur' },
          {
            min: 2,
            max: 50,
            message: '长度在 2 到 50 个字符',
            trigger: 'blur',
          },
        ],
        storeName: [
          { required: true, message: '请输入店铺名称', trigger: 'blur' },
          {
            min: 2,
            max: 30,
            message: '长度在 2 到 30 个字符',
            trigger: 'blur',
          },
        ],
        productName: [
          { required: true, message: '请输入产品名称', trigger: 'blur' },
          {
            min: 2,
            max: 30,
            message: '长度在 2 到 30 个字符',
            trigger: 'blur',
          },
        ],
        url: [{ required: true, message: '请输入链接地址', trigger: 'blur' }],
        code: [
          { required: true, message: '请输入订单编码', trigger: 'blur' },
          {
            min: 2,
            max: 30,
            message: '长度在 2 到 30 个字符',
            trigger: 'blur',
          },
        ],
        productName: [
          { required: true, message: '请输入产品名称', trigger: 'blur' },
          {
            min: 1,
            max: 20,
            message: '长度在 1 到 20 个字符',
            trigger: 'blur',
          },
        ],
        skuCode: [
          { required: true, message: '请输入sku编号', trigger: 'blur' },
        ],
        urlManager: [
          { required: true, message: '请选择链接负责人', trigger: 'change' },
        ],
        state: [
          { required: true, message: '请选择订单状态', trigger: 'change' },
        ],
      },
    }
  },
  computed: {
    showTitle() {
      return this.row.id ? '修改订单' : '新增订单'
    },
  },

  methods: {
    // 负责人组织架构数据
    async getDeptTree() {
      const res = await department()
      this.options = await getDeptTreeData(res.data)
      // console.log('option', this.options)
    },
    showDialog() {
      this.close()
    },
    // 数据回显
    showData() {
      const {
        id,
        platform,
        storeCode,
        storeName,
        url,
        code,
        productName,
        skuCode,
        number,
        price,
        actualPayment,
        paymentTime,
        deliveryTime,
        deliveryNumber,
        receivingTime,
        returnNumber,
        returnTime,
        refundNumber,
        refundAmount,
        refundTime,
        urlManager,
        state,
        evaluationType,
        evaluationContent,
      } = this.row
      this.bdmOrder.id = id
      this.bdmOrder.code = code
      this.bdmOrder.productName = productName
      this.bdmOrder.skuCode = skuCode
      this.bdmOrder.number = number
      this.bdmOrder.price = price
      this.bdmOrder.state = state
      this.bdmOrder.actualPayment = actualPayment
      this.bdmOrder.paymentTime = paymentTime
      this.bdmOrder.deliveryTime = deliveryTime
      this.bdmOrder.deliveryNumber = deliveryNumber
      this.bdmOrder.receivingTime = receivingTime
      this.bdmOrder.returnNumber = returnNumber
      this.bdmOrder.returnTime = returnTime
      this.bdmOrder.refundNumber = refundNumber
      this.bdmOrder.refundAmount = refundAmount
      this.bdmOrder.refundTime = refundTime
      this.bdmOrder.urlManager = urlManager
      this.bdmOrder.state = state
      this.bdmOrder.evaluationType = evaluationType
      this.bdmOrder.evaluationContent = evaluationContent
      this.bdmOrder.platform = platform
      this.bdmOrder.storeCode = storeCode
      this.bdmOrder.storeName = storeName
      this.bdmOrder.url = url
    },
    close() {
      if (this.row) {
        this.$parent.clearRow()
      }
      this.bdmOrder = {
        platform: '',
        storeCode: '',
        storeName: '',
        url: '',
        code: '',
        productName: '',
        skuCode: '',
        number: '',
        price: null,
        actualPayment: null,
        paymentTime: '',
        deliveryTime: '',
        deliveryNumber: '',
        receivingTime: '',
        returnNumber: '',
        returnTime: '',
        refundNumber: '',
        refundAmount: null,
        refundTime: '',
        urlManager: '',
        state: '',
        evaluationType: '',
        evaluationContent: '',
      }
      this.$refs.bdmOrder.resetFields()
      this.$emit('update:showAddDialog', false)
    },
    async submitForm() {
      if (Array.isArray(this.bdmOrder.urlManager)) {
        this.bdmOrder.urlManager =
          this.bdmOrder.urlManager[this.bdmOrder.urlManager.length - 1]
      }
      if (!this.row.id) {
        // 校验表单
        await this.$refs.bdmOrder.validate()
        // 发送请求
        const res = await addOrder(this.bdmOrder)
        // 返回成功，需要提示用户添加成功
        if (res.code === 0) {
          this.$message.success('新增订单成功')
        }
      } else if (this.row.id) {
        // 校验表单
        await this.$refs.bdmOrder.validate()
        const res = await editOrder(this.bdmOrder)
        if (res.code === 0) {
          this.$message.success('修改订单成功')
        }
      }
      // 关闭弹层
      this.close()
      this.$parent.getList()
    },
  },
}
</script>