<template>
  <el-dialog :close-on-click-modal="false" :title="showTitle" :visible="showAddDialog" @close="close" width="40%">
    <el-form
      :model="bdmSPD"
      :rules="SPDRules"
      ref="bdmSPD"
      label-width="100px"
      label-position="right"
      class="demo-bdmSPD"
    >
      <el-form-item label="商品编号" prop="supplierCode">
        <el-input v-model="bdmSPD.supplierCode" placeholder="2-10个字符"></el-input>
      </el-form-item>
      <el-form-item label="商品名称" prop="supplierName">
        <el-input v-model="bdmSPD.supplierName" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="SKU编码" prop="skuCode">
        <el-input v-model="bdmSPD.skuCode" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="产品名称" prop="productName">
        <el-input v-model="bdmSPD.productName" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="规格" prop="productSpecifications">
        <el-radio-group v-model="bdmSPD.productSpecifications">
          <el-radio label="小">小</el-radio>
          <el-radio label="中">中</el-radio>
          <el-radio label="大">大</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="采购价" prop="purchasePrice" required>
        <el-input-number size="medium" v-model="bdmSPD.purchasePrice"></el-input-number>
      </el-form-item>
      <el-form-item label="是否含税" prop="includingTax">
        <el-radio-group v-model="bdmSPD.includingTax">
          <el-radio label="是">是</el-radio>
          <el-radio label="否">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="物流价格" prop="logisticsPrice" required>
        <el-input-number size="medium" v-model="bdmSPD.logisticsPrice"></el-input-number>
      </el-form-item>
      <el-form-item label="包装价格" prop="packagePrice" required>
        <el-input-number size="medium" v-model="bdmSPD.packagePrice"></el-input-number>
      </el-form-item>
      <el-form-item label="成本" prop="cost" required>
        <el-input-number size="medium" v-model="bdmSPD.cost"></el-input-number>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="showDialog">取 消</el-button>
      <el-button type="primary" @click="submitForm">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { addSPD, editSPD } from '@/api/customer/supplyProductDetail'
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
  },
  data() {
    return {
      bdmSPD: {
        id: null,
        supplierCode: '',
        supplierName: '',
        skuCode: '',
        productName: '',
        productSpecifications: '',
        purchasePrice: null,
        includingTax: '',
        logisticsPrice: null,
        packagePrice: null,
        cost: null,
      },
      SPDRules: {
        supplierCode: [
          { required: true, message: '请输入供应商品编码', trigger: 'blur' },
          {
            min: 2,
            max: 100,
            message: '长度在 2 到 100 个字符',
            trigger: 'blur',
          },
        ],
        supplierName: [
          { required: true, message: '请输入供应商品名称', trigger: 'blur' },
          {
            min: 2,
            max: 20,
            message: '长度在 2 到 20 个字符',
            trigger: 'blur',
          },
        ],
        skuCode: [
          { required: true, message: '请输入SKU编码', trigger: 'blur' },
          {
            min: 2,
            max: 50,
            message: '长度在 2 到 50 个字符',
            trigger: 'blur',
          },
        ],
        productName: [
          { required: true, message: '请输入产品名称', trigger: 'blur' },
          {
            min: 2,
            max: 20,
            message: '长度在 2 到 20 个字符',
            trigger: 'blur',
          },
        ],
        productSpecifications: [
          { required: true, message: '请选择规格', trigger: 'change' },
        ],
        includingTax: [
          { required: true, message: '请选择是否含税', trigger: 'change' },
        ],
      },
    }
  },
  computed: {
    showTitle() {
      return this.row.id ? '修改供应商品明细' : '新增供应商品明细'
    },
  },

  methods: {
    showDialog() {
      this.close()
    },
    // 数据回显
    showData() {
      const {
        id,
        supplierCode,
        supplierName,
        skuCode,
        productName,
        productSpecifications,
        purchasePrice,
        includingTax,
        logisticsPrice,
        packagePrice,
        cost,
      } = this.row
      this.bdmSPD.id = id
      this.bdmSPD.supplierCode = supplierCode
      this.bdmSPD.supplierName = supplierName
      this.bdmSPD.skuCode = skuCode
      this.bdmSPD.productName = productName
      this.bdmSPD.productSpecifications = productSpecifications
      this.bdmSPD.purchasePrice = purchasePrice
      this.bdmSPD.includingTax = includingTax
      this.bdmSPD.logisticsPrice = logisticsPrice
      this.bdmSPD.packagePrice = packagePrice
      this.bdmSPD.cost = cost
    },
    close() {
      if (this.row) {
        this.$parent.clearRow()
      }
      this.bdmSPD = {
        supplierCode: '',
        supplierName: '',
        skuCode: '',
        productName: '',
        productSpecifications: '',
        purchasePrice: null,
        includingTax: '',
        logisticsPrice: null,
        packagePrice: null,
        cost: null,
      }
      this.$refs.bdmSPD.resetFields()
      this.$emit('update:showAddDialog', false)
    },
    async submitForm() {
      if (!this.row.id) {
        // 校验表单
        await this.$refs.bdmSPD.validate()
        // 发送请求
        await addSPD(this.bdmSPD)
        // 返回成功，需要提示用户添加成功
        this.$message.success('新增供应商品成功')
      } else if (this.row.id) {
        // 校验表单
        await this.$refs.bdmSPD.validate()
        await editSPD(this.bdmSPD)
        this.$message.success('修改供应商品成功')
      }
      // 关闭弹层
      this.close()
      this.$parent.getList()
    },
  },
}
</script>