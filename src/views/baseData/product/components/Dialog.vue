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
      <el-form-item label="产品编号" prop="code">
        <el-input v-model="bdmProduct.code" placeholder="2-30个字符"></el-input>
      </el-form-item>
      <el-form-item label="产品名称" prop="name">
        <el-input v-model="bdmProduct.name" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="产品型号" prop="model">
        <el-input v-model="bdmProduct.model" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="产品规格" prop="specifications">
        <el-input v-model="bdmProduct.specifications" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="产品介绍" prop="introduction">
        <el-input type="textarea" v-model="bdmProduct.introduction"></el-input>
      </el-form-item>
      <el-form-item label="产品价格" prop="price" required>
        <el-input-number size="medium" v-model="bdmProduct.price"></el-input-number>
      </el-form-item>
      <el-form-item label="上市时间" prop="ttm" required>
        <el-date-picker
          v-model="bdmProduct.ttm"
          type="datetime"
          placeholder="选择日期时间"
          value-format="yyyy-MM-dd HH:mm:ss"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="新品标志" prop="newFlag">
        <el-radio-group v-model="bdmProduct.newFlag">
          <el-radio label="0">是</el-radio>
          <el-radio label="1">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="新品说明" prop="newDescription">
        <el-input type="textarea" v-model="bdmProduct.newDescription"></el-input>
      </el-form-item>
      <el-form-item label="产品状态" prop="state">
        <el-radio-group v-model="bdmProduct.state">
          <el-radio label="0">正常</el-radio>
          <el-radio label="1">关闭</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="产品负责人" prop="manager">
        <el-cascader
          v-model="bdmProduct.manager"
          :options="options"
          :show-all-levels="false"
          :props="{children: 'children',label: 'deptName', value:'deptName', checkStrictly: false }"
          clearable
        ></el-cascader>
      </el-form-item>
      <el-form-item label="产品类别" prop="type">
        <el-select v-model="bdmProduct.type" placeholder="请选择产品类别">
          <el-option v-for="item in type" :label="item" :value="item" :key="item"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="产品级别" prop="level">
        <el-select v-model="bdmProduct.level" placeholder="请选择产品级别">
          <el-option v-for="item in level" :label="item" :value="item" :key="item"></el-option>
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
import { department } from '@/api/information/department'
import { getDictValue } from '@/api/dict/dict'
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
    this.getDictList()
  },
  data() {
    return {
      // 产品类别选项值
      type: [],
      // 产品级别选项值
      level: [],

      // 负责人级联选择
      options: [],

      bdmProduct: {
        id: null,
        code: '',
        name: '',
        model: '',
        specifications: '',
        introduction: '',
        price: null,
        ttm: '',
        newFlag: '',
        newDescription: '',
        state: '',
        manager: '',
        type: '',
        level: '',
      },
      productRules: {
        code: [
          { required: true, message: '请输入产品编码', trigger: 'blur' },
          {
            min: 2,
            max: 30,
            message: '长度在 2 到 30 个字符',
            trigger: 'blur',
          },
        ],
        name: [
          { required: true, message: '请输入产品名称', trigger: 'blur' },
          {
            min: 2,
            max: 20,
            message: '长度在 2 到 20 个字符',
            trigger: 'blur',
          },
        ],
        model: [
          { required: true, message: '请输入产品型号', trigger: 'blur' },
          {
            min: 2,
            max: 20,
            message: '长度在 2 到 20 个字符',
            trigger: 'blur',
          },
        ],
        specifications: [
          { required: true, message: '请输入产品规格', trigger: 'blur' },
          {
            min: 2,
            max: 20,
            message: '长度在 2 到 20 个字符',
            trigger: 'blur',
          },
        ],
        introduction: [
          { required: true, message: '请填写产品介绍', trigger: 'blur' },
        ],
        platform: [
          { type: 'date', message: '请选择产品上市时间', trigger: 'change' },
        ],
        newFlag: [
          { required: true, message: '请输入新品标志', trigger: 'blur' },
          {
            min: 1,
            max: 20,
            message: '长度在 1 到 20 个字符',
            trigger: 'blur',
          },
        ],
        newDescription: [
          { required: true, message: '请填写新品说明', trigger: 'blur' },
        ],
        state: [
          { required: true, message: '请选择产品状态', trigger: 'change' },
        ],
        manager: [
          { required: true, message: '请选择产品负责人', trigger: 'change' },
        ],
        type: [
          { required: true, message: '请选择产品类别', trigger: 'change' },
        ],
        level: [
          { required: true, message: '请选择产品级别', trigger: 'change' },
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
    // 获取字典数据
    async getDictList() {
      // 获取产品类别数据
      const type = await getDictValue({ dictName: '产品类别' })
      this.type = type.data.dictValue
      // 获取产品级别数据
      const level = await getDictValue({ dictName: '产品级别' })
      this.level = level.data.dictValue
    },

    showDialog() {
      this.close()
    },
    // 负责人组织架构数据
    async getDeptTree() {
      const res = await department()
      this.options = await getDeptTreeData(res.data)
      // console.log('option', this.options)
    },
    // 数据回显
    showData() {
      const {
        id,
        code,
        name,
        model,
        specifications,
        introduction,
        price,
        ttm,
        newFlag,
        newDescription,
        state,
        manager,
        type,
        level,
      } = this.row
      this.bdmProduct.id = id
      this.bdmProduct.code = code
      this.bdmProduct.name = name
      this.bdmProduct.model = model
      this.bdmProduct.specifications = specifications
      this.bdmProduct.introduction = introduction
      this.bdmProduct.price = price
      this.bdmProduct.ttm = ttm
      this.bdmProduct.newFlag = newFlag
      this.bdmProduct.newDescription = newDescription
      this.bdmProduct.state = state
      this.bdmProduct.manager = manager
      this.bdmProduct.type = type
      this.bdmProduct.level = level
    },
    // 关闭弹层
    close() {
      if (this.row) {
        this.$parent.clearRow()
      }
      this.bdmProduct = {
        code: '',
        name: '',
        model: '',
        specifications: '',
        introduction: '',
        price: null,
        ttm: '',
        newFlag: '',
        newDescription: '',
        state: '',
        manager: '',
        type: '',
        level: '',
      }
      this.$refs.bdmProduct.resetFields()
      this.$emit('update:showAddDialog', false)
    },
    async submitForm() {
      if (Array.isArray(this.bdmProduct.manager)) {
        this.bdmProduct.manager =
          this.bdmProduct.manager[this.bdmProduct.manager.length - 1]
      }
      if (!this.row.id) {
        // 校验表单
        await this.$refs.bdmProduct.validate()
        // 发送请求
        await addProduct(this.bdmProduct)
        this.$message.success('新增产品成功')
      } else if (this.row.id) {
        // 校验表单
        await this.$refs.bdmProduct.validate()
        await editProduct(this.bdmProduct)
        this.$message.success('修改产品成功')
      }
      // 关闭弹层
      this.close()
      this.$parent.getList()
    },
  },
}
</script>