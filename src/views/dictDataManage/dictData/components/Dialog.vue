<template>
  <el-dialog :title="showTitle" :visible="showAddDialog" @close="close" width="30%">
    <el-form
      :model="bdmDictData"
      :rules="dictDataRules"
      ref="bdmDictData"
      label-width="100px"
      label-position="right"
    >
      <el-form-item label="字典名称" prop="dictName">
        <el-input
          v-if="row.dictId"
          :disabled="true"
          v-model="bdmDictData.dictName"
          placeholder="2-20个字符"
        ></el-input>
        <el-input v-else v-model="bdmDictData.dictName" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item
        v-for="(item,index) in bdmDictData.dictValue"
        :label="'字典值' + (index + 1)"
        :key="index"
        :prop="item"
      >
        <el-row :gutter="5">
          <el-col :span="16">
            <el-input v-model="bdmDictData.dictValue[index]" @change="changeValue"></el-input>
          </el-col>
          <el-col :span="7">
            <el-button @click.prevent="removeDomain(item)">删除</el-button>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item label="字典状态" prop="status">
        <el-radio-group v-model="bdmDictData.status">
          <el-radio label="0">正常</el-radio>
          <el-radio label="1">关闭</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="showDialog">取 消</el-button>
      <el-button @click="addDomain">新增字典值</el-button>
      <el-button type="primary" @click="submitForm">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { addDictData, editDictData } from '@/api/dict/dict'
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
    if (this.row.dictId) {
      this.showData()
      console.log(this.bdmDictData)
    }
  },
  data() {
    return {
      // 表单数据
      bdmDictData: {
        dictId: null,
        dictName: '',
        dictValue: [],
        status: null,
      },
      dictDataRules: {
        dictName: [
          { required: true, message: '请输入字典编码', trigger: 'blur' },
          {
            min: 2,
            max: 10,
            message: '长度在 2 到 10 个字符',
            trigger: 'blur',
          },
        ],
      },
    }
  },
  computed: {
    showTitle() {
      return this.row.dictId ? '修改字典' : '新增字典'
    },
  },

  methods: {
    // 字典值发生变化
    changeValue(e) {
      console.log(e)
    },
    // 删除字典值
    removeDomain(item) {
      let index = this.bdmDictData.dictValue.indexOf(item)
      if (index !== -1) {
        this.bdmDictData.dictValue.splice(index, 1)
      }
    },
    // 新增字典值
    addDomain() {
      this.bdmDictData.dictValue.push('')
      console.log('字典值', this.bdmDictData.dictValue)
    },
    // 关闭弹层
    showDialog() {
      this.close()
    },
    // 数据回显
    showData() {
      const { dictId, dictName, dictValue, status } = this.row
      this.bdmDictData.dictId = dictId
      this.bdmDictData.dictName = dictName
      this.bdmDictData.dictValue = dictValue
      this.bdmDictData.status = status
    },
    close() {
      if (this.row) {
        this.$parent.clearRow()
      }
      this.bdmDictData = {
        dictName: '',
        dictValue: [],
        status: null,
      }
      this.$refs.bdmDictData.resetFields()
      this.$emit('update:showAddDialog', false)
    },
    async submitForm() {
      if (!this.row.dictId) {
        // 校验表单
        await this.$refs.bdmDictData.validate()
        // 发送请求
        await addDictData(this.bdmDictData)
        // 返回成功，需要提示用户添加成功
        this.$message.success('新增字典成功')
      } else if (this.row.dictId) {
        // 校验表单
        await this.$refs.bdmDictData.validate()
        await editDictData(this.bdmDictData)
        this.$message.success('修改字典成功')
      }
      // 关闭弹层
      this.close()
      this.$parent.getList()
    },
  },
}
</script>