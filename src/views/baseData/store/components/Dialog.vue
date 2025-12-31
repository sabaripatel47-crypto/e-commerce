<template>
  <el-dialog :title="showTitle" :visible="showAddDialog" @close="close" width="40%">
    <el-form
      :model="bdmStore"
      :rules="storeRules"
      ref="bdmStore"
      label-width="100px"
      label-position="right"
      class="demo-bdmStore"
    >
      <el-form-item label="店铺编号" prop="code">
        <el-input v-model="bdmStore.code" placeholder="2-30个字符"></el-input>
      </el-form-item>
      <el-form-item label="店铺名称" prop="name">
        <el-input v-model="bdmStore.name" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="所属平台" prop="platform">
        <el-select v-model="bdmStore.platform" placeholder="请选择所属平台">
          <el-option v-for="item in platforms" :label="item" :value="item" :key="item"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="所属公司" prop="enterprise">
        <el-select v-model="bdmStore.enterprise" placeholder="请选择所属公司">
          <el-option v-for="item in company" :label="item" :value="item" :key="item"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="店铺规模" prop="scale">
        <el-radio-group v-model="bdmStore.scale">
          <el-radio label="小">小</el-radio>
          <el-radio label="中">中</el-radio>
          <el-radio label="大">大</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="店铺状态" prop="state">
        <el-radio-group v-model="bdmStore.state">
          <el-radio label="0">正常</el-radio>
          <el-radio label="1">关闭</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="店铺负责人" prop="manager">
        <el-cascader
          v-model="bdmStore.manager"
          :options="options"
          :show-all-levels="false"
          :props="{children: 'children',label: 'deptName', value:'deptName', checkStrictly: false }"
          clearable
        ></el-cascader>
      </el-form-item>
      <el-form-item label="店铺级别" prop="level">
        <el-select v-model="bdmStore.level" placeholder="请选择此店铺级别">
          <el-option v-for="item in level" :label="item" :value="item" :key="item"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="品牌" prop="brand">
        <el-select v-model="bdmStore.brand" placeholder="请选择品牌">
          <el-option v-for="item in brand" :label="item" :value="item" :key="item"></el-option>
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
import { addStore, editStore } from '@/api/baseData/store'
import { department } from '@/api/information/department'
import { deptTreeSelect } from '@/api/system/user'
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

  data() {
    return {
      // 公司选项列表
      company: [],
      // 平台选项列表
      platforms: [],
      // 店铺级别选项
      level: [],
      // 品牌选项
      brand: [],
      // 负责人级联选择
      options: [],
      // 表单数据
      bdmStore: {
        id: null,
        code: '',
        name: '',
        platform: '',
        enterprise: '',
        scale: '',
        state: '',
        manager: '',
        level: '',
        brand: '',
      },
      storeRules: {
        code: [
          { required: true, message: '请输入店铺编码', trigger: 'blur' },
          {
            min: 2,
            max: 30,
            message: '长度在 2 到 30 个字符',
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
        level: [
          { required: true, message: '请选择店铺级别', trigger: 'change' },
        ],
        brand: [{ required: true, message: '请选择品牌', trigger: 'change' }],
      },
    }
  },
  computed: {
    showTitle() {
      return this.row.id ? '修改店铺' : '新增店铺'
    },
  },
  created() {
    if (this.row.id) {
      this.showData()
    }
    this.getDeptTree()
    this.deptTreeSelect()
    this.getDictList()
  },
  methods: {
    // 获取部门数据
    async deptTreeSelect() {
      const res = await deptTreeSelect()
      console.log('部门数据', res)
    },
    // 获取字典数据
    async getDictList() {
      // 获取公司数据
      const company = await getDictValue({ dictName: '所属公司' })
      this.company = company.data.dictValue
      // 获取平台数据
      const platform = await getDictValue({ dictName: '所属平台' })
      this.platforms = platform.data.dictValue
      // 获取店铺级别数据
      const level = await getDictValue({ dictName: '店铺级别' })
      this.level = level.data.dictValue
      // 获取品牌数据
      const brand = await getDictValue({ dictName: '品牌' })
      this.brand = brand.data.dictValue
    },
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
        code,
        name,
        platform,
        enterprise,
        scale,
        state,
        manager,
        level,
        brand,
      } = this.row
      this.bdmStore.id = id
      this.bdmStore.code = code
      this.bdmStore.name = name
      this.bdmStore.platform = platform
      this.bdmStore.enterprise = enterprise
      this.bdmStore.scale = scale
      this.bdmStore.state = state
      this.bdmStore.manager = manager
      this.bdmStore.level = level
      this.bdmStore.brand = brand
    },
    close() {
      if (this.row) {
        this.$parent.clearRow()
      }
      this.bdmStore = {
        code: '',
        name: '',
        platform: '',
        enterprise: '',
        scale: '',
        state: '',
        manager: '',
        level: '',
        brand: '',
      }
      this.$refs.bdmStore.resetFields()
      this.$emit('update:showAddDialog', false)
    },
    async submitForm() {
      if (Array.isArray(this.bdmStore.manager)) {
        this.bdmStore.manager =
          this.bdmStore.manager[this.bdmStore.manager.length - 1]
      }
      if (!this.row.id) {
        // 校验表单
        await this.$refs.bdmStore.validate()
        // 发送请求
        await addStore(this.bdmStore)
        // 返回成功，需要提示用户添加成功
        this.$message.success('新增店铺成功')
      } else if (this.row.id) {
        // 校验表单
        await this.$refs.bdmStore.validate()
        await editStore(this.bdmStore)
        this.$message.success('修改店铺成功')
      }
      // 关闭弹层
      this.close()
      this.$parent.getList()
    },
  },
}
</script>