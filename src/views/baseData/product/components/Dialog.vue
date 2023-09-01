<template>
  <el-dialog :title="showTitle" :visible="showAddDialog" @close="close" width="40%">
    <el-form
      :model="bdmProduct"
      :rules="productRules"
      ref="bdmProduct"
      label-width="100px"
      label-position="right"
      class="demo-bdmProduct"
    >
      <el-form-item label="店铺编号" prop="code">
        <el-input v-model="bdmProduct.code" placeholder="2-10个字符"></el-input>
      </el-form-item>
      <el-form-item label="店铺名称" prop="name">
        <el-input v-model="bdmProduct.name" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="所属平台" prop="platform">
        <el-select v-model="bdmProduct.platform" placeholder="请选择所属平台">
          <el-option label="淘宝天猫" value="淘宝天猫"></el-option>
          <el-option label="京东" value="京东"></el-option>
          <el-option label="拼多多" value="拼多多"></el-option>
          <el-option label="唯品会" value="唯品会"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="所属公司" prop="enterprise">
        <el-select v-model="bdmProduct.enterprise" placeholder="请选择所属公司">
          <el-option label="智盒1" value="1"></el-option>
          <el-option label="智盒2" value="2"></el-option>
          <el-option label="智盒3" value="3"></el-option>
          <el-option label="智盒4" value="4"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="店铺规模" prop="scale">
        <el-radio-group v-model="bdmProduct.scale">
          <el-radio label="小">小</el-radio>
          <el-radio label="中">中</el-radio>
          <el-radio label="大">大</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="店铺状态" prop="state">
        <el-radio-group v-model="bdmProduct.state">
          <el-radio label="0">正常</el-radio>
          <el-radio label="1">关闭</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="店铺负责人" prop="manager">
        <el-select v-model="bdmProduct.manager" placeholder="请选择店铺负责人">
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
import { addProduct, editProduct } from '@/api/baseData/product'
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
      bdmProduct: {
        id: '',
        code: '',
        name: '',
        platform: '',
        enterprise: '',
        scale: '',
        state: '',
        manager: '',
      },
      productRules: {
        code: [
          { required: true, message: '请输入店铺编码', trigger: 'blur' },
          {
            min: 2,
            max: 10,
            message: '长度在 2 到 10 个字符',
            trigger: 'blur',
          },
        ],
        name: [
          { required: true, message: '请输入店铺名称', trigger: 'blur' },
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
        scale: [
          { required: true, message: '请选择店铺规模', trigger: 'change' },
        ],
        state: [
          { required: true, message: '请选择店铺状态', trigger: 'change' },
        ],
        manager: [
          { required: true, message: '请选择店铺负责人', trigger: 'change' },
        ],
      },
    }
  },
  computed: {
    showTitle() {
      return this.row.id ? '修改店铺' : '新增店铺'
    },
  },

  methods: {
    showDialog() {
      this.close()
    },
    // 数据回显
    showData() {
      const { id, code, name, platform, enterprise, scale, state, manager } =
        this.row
      this.bdmProduct.id = id
      this.bdmProduct.code = code
      this.bdmProduct.name = name
      this.bdmProduct.platform = platform
      this.bdmProduct.enterprise = enterprise
      this.bdmProduct.scale = scale
      this.bdmProduct.state = state
      this.bdmProduct.manager = manager
    },
    close() {
      if (this.row) {
        this.$parent.clearRow()
      }
      this.bdmProduct = {
        code: '',
        name: '',
        platform: '',
        enterprise: '',
        scale: '',
        state: '',
        manager: '',
      }
      this.$refs.bdmProduct.resetFields()
      this.$emit('update:showAddDialog', false)
    },
    async submitForm() {
      if (!this.row.id) {
        // 校验表单
        await this.$refs.bdmProduct.validate()
        // 发送请求
        await addProduct(this.bdmProduct)
        // 返回成功，需要提示用户添加成功
        this.$message.success('新增店铺成功')
      } else if (this.row.id) {
        // 校验表单
        await this.$refs.bdmProduct.validate()
        await editProduct(this.bdmProduct)
        this.$message.success('修改店铺成功')
      }
      // 关闭弹层
      this.close()
      this.$parent.getList()
    },
  },
}
</script>