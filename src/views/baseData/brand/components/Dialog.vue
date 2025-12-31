<template>
  <el-dialog :title="showTitle" :visible="showAddDialog" @close="close" width="40%">
    <el-form
      :model="bdmBrand"
      :rules="brandRules"
      ref="bdmBrand"
      label-width="100px"
      label-position="right"
      class="demo-bdmBrand"
    >
      <el-form-item label="商标名称" prop="name">
        <el-input v-model="bdmBrand.name" placeholder="2-30个字符"></el-input>
      </el-form-item>
      <el-form-item label="所属公司" prop="enterprise">
        <el-select v-model="bdmBrand.enterprise" placeholder="请选择所属公司">
          <el-option v-for="item in company" :label="item" :value="item" :key="item"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="商标号" prop="trademarkNumber">
        <el-input v-model="bdmBrand.trademarkNumber" placeholder="2-30个字符"></el-input>
      </el-form-item>
      <el-form-item label="商标证图片" prop="trademarkPicture" required>
        <el-upload
          action
          class="avatar-uploader"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :http-request="uploadPicture"
        >
          <img v-if="imageUrl" :src="imageUrl" class="avatar" />
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
      </el-form-item>
      <el-form-item label="申请日期" prop="applicationTime" required>
        <el-date-picker
          v-model="bdmBrand.applicationTime"
          type="datetime"
          placeholder="选择日期时间"
          value-format="yyyy-MM-dd HH:mm:ss"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="到期日期" prop="endTime" required>
        <el-date-picker
          v-model="bdmBrand.endTime"
          type="datetime"
          placeholder="选择日期时间"
          value-format="yyyy-MM-dd HH:mm:ss"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="商品对接人" prop="contactPerson">
        <el-cascader
          v-model="bdmBrand.contactPerson"
          :options="options"
          :show-all-levels="false"
          :props="{children: 'children',label: 'deptName', value:'deptName', checkStrictly: false }"
          clearable
        ></el-cascader>
      </el-form-item>
      <el-form-item label="联系方式" prop="contacts">
        <el-input v-model="bdmBrand.contacts" placeholder="请输入联系方式"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="showDialog">取 消</el-button>
      <el-button type="primary" @click="submitForm">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { addBrand, editBrand, imgUpload } from '@/api/baseData/brand'
import { department } from '@/api/information/department'
import { deptTreeSelect } from '@/api/system/user'
import { getDictValue } from '@/api/dict/dict'
import { recycleinsert } from '@/api/recycle/recycle'
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
      // 负责人级联选择
      options: [],
      // 图片文件
      imgFile: {},
      // 图片回显地址
      imageUrl: '',
      // 删除的图片地址
      removePicture: [],
      // 表单数据
      bdmBrand: {
        id: null,
        name: '',
        enterprise: '',
        trademarkNumber: '',
        trademarkPicture: '',
        applicationTime: '',
        endTime: '',
        contactPerson: '',
        contacts: '',
      },
      brandRules: {
        name: [{ required: true, message: '请填写商标名称', trigger: 'blur' }],
        enterprise: [
          { required: true, message: '请填写所属公司', trigger: 'blur' },
        ],
        trademarkNumber: [
          { required: true, message: '请填写商家号', trigger: 'blur' },
        ],
        name: [{ required: true, message: '请填写商标名称', trigger: 'blur' }],
        contactPerson: [
          { required: true, message: '请选择商品对接人', trigger: 'blur' },
        ],
        trademarkNumber: [
          { required: true, message: '请填写商家号', trigger: 'blur' },
        ],
      },
    }
  },
  computed: {
    showTitle() {
      return this.row.id ? '修改品牌' : '新增品牌'
    },
  },
  created() {
    if (this.row.id) {
      this.showData()
    }
    this.getDeptTree()
    this.deptTreeData()
    this.getDictList()
  },
  methods: {
    // 成功上传图片回显
    async handleAvatarSuccess(res, file) {
      this.removePicture.push(this.imageUrl)
      this.imageUrl = URL.createObjectURL(file.raw)
    },
    // 图片返回值
    async uploadPicture(e) {
      // this.fileList.push(e.file)
      this.imgFile = e.file
    },
    // 获取部门数据
    async deptTreeData() {
      const res = await deptTreeSelect()
    },
    // 获取字典数据
    async getDictList() {
      // 获取公司数据
      const company = await getDictValue({ dictName: '所属公司' })
      this.company = company.data.dictValue
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
        name,
        enterprise,
        trademarkNumber,
        trademarkPicture,
        applicationTime,
        endTime,
        contacts,
        contactPerson,
      } = this.row
      this.bdmBrand.id = id
      this.bdmBrand.name = name
      this.bdmBrand.enterprise = enterprise
      this.bdmBrand.trademarkNumber = trademarkNumber
      this.bdmBrand.trademarkPicture = trademarkPicture
      this.bdmBrand.applicationTime = applicationTime
      this.bdmBrand.endTime = endTime
      this.bdmBrand.contacts = contacts
      this.bdmBrand.contactPerson = contactPerson
      this.imageUrl = this.bdmBrand.trademarkPicture
    },
    close() {
      if (this.row) {
        this.$parent.clearRow()
      }
      this.$emit('update:showAddDialog', false)
      this.bdmBrand = {
        code: '',
        name: '',
        platform: '',
        enterprise: '',
        scale: '',
        state: '',
        contactPerson: '',
        level: '',
        brand: '',
      }
      this.removePicture = []
      this.imageUrl = ''
      this.imgFile = {}
      this.$refs.bdmBrand.resetFields()
    },
    // 将删除的图片放入回收站
    putRecycle() {
      this.removePicture.forEach(async (item) => {
        if (item.indexOf('.com/') !== -1) {
          let fileName = item.split('.com/')[1]
          await recycleinsert({ name: fileName, url: item })
        }
      })
    },
    async submitForm() {
      if (Object.keys(this.imgFile).length > 0) {
        let formData = new FormData()
        formData.append('picture', this.imgFile)
        const res = await imgUpload(formData)
        this.bdmBrand.trademarkPicture = res.data
      }
      console.log('文件', this.bdmBrand.trademarkPicture)
      if (Array.isArray(this.bdmBrand.contactPerson)) {
        this.bdmBrand.contactPerson =
          this.bdmBrand.contactPerson[this.bdmBrand.contactPerson.length - 1]
      }
      if (!this.row.id) {
        // 校验表单
        await this.$refs.bdmBrand.validate()
        // 发送请求
        await addBrand(this.bdmBrand)
        // 返回成功，需要提示用户添加成功
        this.$message.success('新增品牌成功')
      } else if (this.row.id) {
        // 校验表单
        await this.$refs.bdmBrand.validate()
        // 处理删除的文件
        if (this.removePicture.length > 0) {
          this.putRecycle()
        }
        await editBrand(this.bdmBrand)
        this.$message.success('修改品牌成功')
      }
      // 关闭弹层
      this.close()
      this.$parent.getList()
    },
  },
}
</script>

<style lang="scss" scoped>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>