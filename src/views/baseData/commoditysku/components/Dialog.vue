<template>
  <el-dialog :title="showTitle" :visible="showAddDialog" @close="close" width="40%">
    <el-form
      :model="bdmSku"
      :rules="skuRules"
      ref="bdmSku"
      label-width="100px"
      label-position="right"
      class="demo-bdmSku"
    >
      <el-form-item label="产品编号" prop="code">
        <el-input v-model="bdmSku.code" placeholder="2-10个字符"></el-input>
      </el-form-item>
      <el-form-item label="产品名称" prop="productName">
        <el-input v-model="bdmSku.productName" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="SKU编码" prop="skuCode">
        <el-input v-model="bdmSku.skuCode" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="SKU规格" prop="skuSpecifications">
        <el-input v-model="bdmSku.skuSpecifications" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="SKU型号" prop="skuModel">
        <el-input v-model="bdmSku.skuModel" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="SKU单价" prop="skuPrice">
        <el-input v-model="bdmSku.skuPrice" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="sku说明" prop="skuDescription">
        <el-input type="textarea" v-model="bdmSku.skuDescription"></el-input>
      </el-form-item>
      <el-form-item label="sku状态" prop="state">
        <el-radio-group v-model="bdmSku.state">
          <el-radio label="0">正常</el-radio>
          <el-radio label="1">关闭</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="showDialog">取 消</el-button>
      <el-button type="primary" @click="submitForm">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { addSku, editSku } from '@/api/baseData/sku'
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
      bdmSku: {
        id: null,
        code: '',
        productName: '',
        skuCode: '',
        skuSpecifications: '',
        skuModel: '',
        skuPrice: '',
        skuDescription: '',
        state: '',
      },
      skuRules: {
        code: [
          { required: true, message: '请输入产品编码', trigger: 'blur' },
          {
            min: 2,
            max: 10,
            message: '长度在 2 到 10 个字符',
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
        skuCode: [
          { required: true, message: '请输入SKU编码', trigger: 'blur' },
        ],
        skuSpecifications: [
          { required: true, message: '请输入SKU规格', trigger: 'blur' },
        ],
        skuModel: [
          { required: true, message: '请输入SKU型号', trigger: 'blur' },
        ],
        skuPrice: [
          { required: true, message: '请输入SKU单价', trigger: 'blur' },
        ],
        skuDescription: [
          { required: true, message: '请输入SKU说明', trigger: 'blur' },
        ],
        state: [
          { required: true, message: '请选择产品状态', trigger: 'change' },
        ],
      },
    }
  },
  computed: {
    showTitle() {
      return this.row.id ? '修改产品' : '新增产品'
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
        code,
        productName,
        skuCode,
        skuSpecifications,
        skuModel,
        skuPrice,
        skuDescription,
        state,
      } = this.row
      this.bdmSku.id = id
      this.bdmSku.code = code
      this.bdmSku.productName = productName
      this.bdmSku.skuCode = skuCode
      this.bdmSku.skuSpecifications = skuSpecifications
      this.bdmSku.skuModel = skuModel
      this.bdmSku.skuPrice = skuPrice
      this.bdmSku.skuDescription = skuDescription
      this.bdmSku.state = state
    },
    close() {
      if (this.row) {
        this.$parent.clearRow()
      }
      this.bdmSku = {
        code: '',
        name: '',
        platform: '',
        enterprise: '',
        scale: '',
        state: '',
        manager: '',
      }
      this.$refs.bdmSku.resetFields()
      this.$emit('update:showAddDialog', false)
    },
    async submitForm() {
      if (!this.row.id) {
        // 校验表单
        await this.$refs.bdmSku.validate()
        // 发送请求
        await addSku(this.bdmSku)
        // 返回成功，需要提示用户添加成功
        this.$message.success('新增产品成功')
      } else if (this.row.id) {
        // 校验表单
        await this.$refs.bdmSku.validate()
        await editSku(this.bdmSku)
        this.$message.success('修改产品成功')
      }
      // 关闭弹层
      this.close()
      this.$parent.getList()
    },
  },
}
</script>