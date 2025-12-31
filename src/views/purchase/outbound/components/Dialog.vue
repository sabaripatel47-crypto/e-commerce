<template>
  <el-dialog :title="showTitle" :visible="showAddDialog" @close="close" width="40%">
    <el-form
      :model="bdmOutbound"
      :rules="outboundRules"
      ref="bdmOutbound"
      label-width="100px"
      label-position="right"
      class="demo-bdmOutbound"
    >
      <el-form-item label="商品型号" prop="goodsModel">
        <el-input v-model="bdmOutbound.goodsModel" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="商品名称" prop="goodsName">
        <el-input v-model="bdmOutbound.goodsName" placeholder="2-30个字符"></el-input>
      </el-form-item>
      <el-form-item label="商品类型" prop="goodsType">
        <el-input v-model="bdmOutbound.goodsType" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="商品规格" prop="goodsSpec">
        <el-input v-model="bdmOutbound.goodsSpec" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="商品数量" prop="goodsNum">
        <el-input-number size="medium" v-model="bdmOutbound.goodsNum"></el-input-number>
      </el-form-item>
      <el-form-item label="出库登记人" prop="outboundName">
        <el-input size="medium" v-model="bdmOutbound.outboundName" placeholder="2-10个字符"></el-input>
      </el-form-item>
      <el-form-item label="出库对象" prop="outboundType">
        <el-input size="medium" v-model="bdmOutbound.outboundType" placeholder="2-10个字符"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="showDialog">取 消</el-button>
      <el-button type="primary" @click="submitForm">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { addOutbound, editOutbound } from '@/api/purchase/outbound'
import { getDept } from '@/api/purchase/warehousing'
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
      // 字典查询入参
      reqDict: {
        dictName: '所属公司',
      },
      // 公司选项列表
      company: [],
      // 负责人级联选择
      options: [],
      // 表单数据
      bdmOutbound: {
        id: null,
        goodsModel: '',
        goodsName: '',
        goodsNum: null,
        goodsSpec: '',
        goodsType: '',
        outboundName: '',
        outboundType: '',
      },
      outboundRules: {
        // code: [
        //   { required: true, message: '请输入商品编码', trigger: 'blur' },
        //   {
        //     min: 2,
        //     max: 10,
        //     message: '长度在 2 到 10 个字符',
        //     trigger: 'blur',
        //   },
        // ],
        // platform: [
        //   { required: true, message: '请选择所属平台', trigger: 'change' },
        // ],
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
        goodsModel,
        goodsName,
        goodsType,
        goodsSpec,
        goodsNum,
        outboundName,
        outboundType,
      } = this.row
      this.bdmOutbound.id = id
      this.bdmOutbound.goodsModel = goodsModel
      this.bdmOutbound.goodsName = goodsName
      this.bdmOutbound.goodsType = goodsType
      this.bdmOutbound.goodsSpec = goodsSpec
      this.bdmOutbound.goodsNum = goodsNum
      this.bdmOutbound.outboundName = outboundName
      this.bdmOutbound.outboundType = outboundType
    },
    close() {
      if (this.row) {
        this.$parent.clearRow()
      }
      this.bdmOutbound = {
        id: null,
        goodsModel: '',
        goodsName: '',
        goodsNum: null,
        goodsSpec: '',
        goodsType: '',
        outboundName: '',
        outboundType: '',
      }
      this.$refs.bdmOutbound.resetFields()
      this.$emit('update:showAddDialog', false)
    },
    async submitForm() {
      if (!this.row.id) {
        // 校验表单
        await this.$refs.bdmOutbound.validate()
        // 发送请求
        const res = await addOutbound(this.bdmOutbound)
        console.log('res', res)
        // 返回成功，需要提示用户添加成功
        // if (res.code === 30000) {
        //   this.$message.success(res.data)
        // } else {
        // }
        this.$message.warning('新增商品成功')
      } else if (this.row.id) {
        // 校验表单
        await this.$refs.bdmOutbound.validate()
        await editOutbound(this.bdmOutbound)
        this.$message.success('修改商品成功')
      }
      // 关闭弹层
      this.close()
      this.$parent.getList()
    },
  },
}
</script>