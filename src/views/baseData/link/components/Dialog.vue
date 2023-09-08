<template>
  <el-dialog :title="showTitle" :visible="showAddDialog" @close="close" width="40%">
    <el-form
      :model="bdmLink"
      :rules="linkRules"
      ref="bdmLink"
      label-width="100px"
      label-position="right"
      class="demo-bdmLink"
    >
      <el-form-item label="产品编号" prop="code">
        <el-input v-model="bdmLink.code" placeholder="2-10个字符"></el-input>
      </el-form-item>
      <el-form-item label="产品名称" prop="productName">
        <el-input v-model="bdmLink.productName" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="sku编码" prop="skuCode">
        <el-input v-model="bdmLink.skuCode" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="链接地址" prop="url">
        <el-input v-model="bdmLink.url" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="所属平台" prop="platform">
        <el-select v-model="bdmLink.platform" placeholder="请选择所属平台">
          <el-option label="淘宝天猫" value="淘宝天猫"></el-option>
          <el-option label="京东" value="京东"></el-option>
          <el-option label="拼多多" value="拼多多"></el-option>
          <el-option label="唯品会" value="唯品会"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="所属公司" prop="enterprise">
        <el-select v-model="bdmLink.enterprise" placeholder="请选择所属公司">
          <el-option label="公司1" value="公司1"></el-option>
          <el-option label="公司2" value="公司2"></el-option>
          <el-option label="公司3" value="公司3"></el-option>
          <el-option label="公司4" value="公司4"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="市场售价" prop="marketPrice" required>
        <el-input-number size="medium" v-model="bdmLink.marketPrice"></el-input-number>
      </el-form-item>
      <el-form-item label="实际销售价格" prop="salesPrice" required>
        <el-input-number size="medium" v-model="bdmLink.salesPrice"></el-input-number>
      </el-form-item>
      <el-form-item label="链接地址负责人" prop="manager">
        <el-select v-model="bdmLink.manager" placeholder="请选择产品负责人">
          <el-option label="负责人A" value="负责人A"></el-option>
          <el-option label="负责人B" value="负责人B"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="showDialog">取 消</el-button>
      <el-button type="primary" @click="submitForm">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { addLink, editLink } from '@/api/baseData/link'
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
      bdmLink: {
        id: null,
        code: '',
        productName: '',
        skuCode: '',
        url: '',
        platform: '',
        enterprise: '',
        marketPrice: null,
        salesPrice: null,
        manager: '',
      },
      linkRules: {
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
          { required: true, message: '请输入产品名称', trigger: 'blur' },
          {
            min: 2,
            max: 20,
            message: '长度在 2 到 20 个字符',
            trigger: 'blur',
          },
        ],
        url: [
          { required: true, message: '请输入链接地址', trigger: 'blur' },
          {
            min: 2,
            max: 20,
            message: '长度在 2 到 20 个字符',
            trigger: 'blur',
          },
        ],
        platform: [
          { required: true, message: '请选择所属平台', trigger: 'change' },
        ],
        enterprise: [
          { required: true, message: '请选择所属公司', trigger: 'change' },
        ],
        manager: [
          { required: true, message: '请选择产品负责人', trigger: 'change' },
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
        url,
        platform,
        enterprise,
        marketPrice,
        salesPrice,
        manager,
      } = this.row
      this.bdmLink.id = id
      this.bdmLink.code = code
      this.bdmLink.productName = productName
      this.bdmLink.skuCode = skuCode
      this.bdmLink.url = url
      this.bdmLink.platform = platform
      this.bdmLink.enterprise = enterprise
      this.bdmLink.marketPrice = marketPrice
      this.bdmLink.salesPrice = salesPrice
      this.bdmLink.manager = manager
    },
    close() {
      if (this.row) {
        this.$parent.clearRow()
      }
      this.bdmLink = {
        code: '',
        productName: '',
        skuCode: '',
        url: '',
        platform: '',
        enterprise: '',
        marketPrice: null,
        salesPrice: null,
        manager: '',
      }
      this.$refs.bdmLink.resetFields()
      this.$emit('update:showAddDialog', false)
    },
    async submitForm() {
      if (!this.row.id) {
        // 校验表单
        await this.$refs.bdmLink.validate()
        // 发送请求
        await addLink(this.bdmLink)
        // 返回成功，需要提示用户添加成功
        this.$message.success('新增产品成功')
      } else if (this.row.id) {
        // 校验表单
        await this.$refs.bdmLink.validate()
        await editLink(this.bdmLink)
        this.$message.success('修改产品成功')
      }
      // 关闭弹层
      this.close()
      this.$parent.getList()
    },
  },
}
</script>