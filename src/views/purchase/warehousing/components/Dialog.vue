<template>
  <el-dialog :close-on-click-modal="false" :title="showTitle" :visible="showAddDialog" @close="close" width="40%">
    <el-form
      :model="bdmWarehousing"
      :rules="warehousingRules"
      ref="bdmWarehousing"
      label-width="100px"
      label-position="right"
      class="demo-bdmWarehousing"
    >
      <el-form-item label="商品名称" prop="goodsName">
        <el-input v-model="bdmWarehousing.goodsName" placeholder="2-30个字符"></el-input>
      </el-form-item>
      <el-form-item label="商品类型" prop="goodsType">
        <el-input v-model="bdmWarehousing.goodsType" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="商品规格" prop="goodsSpec">
        <el-input v-model="bdmWarehousing.goodsSpec" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="商品型号" prop="goodsModel">
        <el-input v-model="bdmWarehousing.goodsModel" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="商品数量" prop="goodsNum">
        <el-input-number size="medium" v-model="bdmWarehousing.goodsNum"></el-input-number>
      </el-form-item>
      <el-form-item label="商品总价" prop="goodsAmount">
        <el-input-number size="medium" v-model="bdmWarehousing.goodsAmount"></el-input-number>
      </el-form-item>
      <el-form-item label="入库登记人" prop="registrant">
        <el-input size="medium" v-model="bdmWarehousing.registrant" placeholder="2-10个字符"></el-input>
      </el-form-item>
      <el-form-item label="登记部门名称" prop="deptId">
        <el-cascader
          v-model="bdmWarehousing.deptId"
          :options="options"
          :show-all-levels="false"
          :props="{children: 'children',label: 'deptName', value:'deptId', checkStrictly: true }"
          clearable
        ></el-cascader>
      </el-form-item>
      <el-form-item label="登记时间" prop="time">
        <el-date-picker
          v-model="bdmWarehousing.time"
          type="datetime"
          placeholder="选择日期时间"
          value-format="yyyy-MM-dd HH:mm:ss"
        ></el-date-picker>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="showDialog">取 消</el-button>
      <el-button type="primary" @click="submitForm">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import {
  addWarehousing,
  editWarehousing,
  getDept,
} from '@/api/purchase/warehousing'
import { department } from '@/api/information/department'
import { getDictValue } from '@/api/dict/dict'
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
      // 表单数据
      bdmWarehousing: {
        id: null,
        goodsName: '',
        goodsType: '',
        goodsSpec: '',
        goodsModel: '',
        goodsNum: null,
        goodsAmount: null,
        registrant: '',
        time: '',
        deptId: null,
      },
      warehousingRules: {
        goodsName: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
          {
            min: 2,
            max: 30,
            message: '长度在 2 到 30 个字符',
            trigger: 'blur',
          },
        ],
      },
    }
  },
  computed: {
    showTitle() {
      return this.row.id ? '修改商品' : '新增商品'
    },
  },

  methods: {
    // 负责人组织架构数据
    async getDeptTree() {
      const res = await getDept()
      this.options = res.data
      // console.log('option', this.options)
    },
    showDialog() {
      this.close()
    },
    // 数据回显
    showData() {
      const {
        id,
        goodsName,
        goodsType,
        goodsSpec,
        goodsModel,
        goodsNum,
        goodsAmount,
        registrant,
        deptId,
        time,
      } = this.row
      this.bdmWarehousing.id = id
      this.bdmWarehousing.goodsName = goodsName
      this.bdmWarehousing.goodsType = goodsType
      this.bdmWarehousing.goodsSpec = goodsSpec
      this.bdmWarehousing.goodsModel = goodsModel
      this.bdmWarehousing.goodsNum = goodsNum
      this.bdmWarehousing.goodsAmount = goodsAmount
      this.bdmWarehousing.registrant = registrant
      this.bdmWarehousing.time = time
      this.bdmWarehousing.deptId = deptId
    },
    close() {
      if (this.row) {
        this.$parent.clearRow()
      }
      this.bdmWarehousing = {
        goodsName: '',
        goodsType: '',
        goodsSpec: '',
        goodsModel: '',
        goodsNum: null,
        goodsAmount: null,
        registrant: '',
        deptId: null,
        time: '',
      }
      this.$refs.bdmWarehousing.resetFields()
      this.$emit('update:showAddDialog', false)
    },
    async submitForm() {
      if (Array.isArray(this.bdmWarehousing.deptId)) {
        this.bdmWarehousing.deptId =
          this.bdmWarehousing.deptId[this.bdmWarehousing.deptId.length - 1]
      }
      if (!this.row.id) {
        // 校验表单
        await this.$refs.bdmWarehousing.validate()
        // 发送请求
        await addWarehousing(this.bdmWarehousing)
        // 返回成功，需要提示用户添加成功
        this.$message.success('新增商品成功')
      } else if (this.row.id) {
        // 校验表单
        await this.$refs.bdmWarehousing.validate()
        await editWarehousing(this.bdmWarehousing)
        this.$message.success('修改商品成功')
      }
      // 关闭弹层
      this.close()
      this.$parent.getList()
    },
  },
}
</script>