<template>
  <el-dialog :title="showTitle" :visible="showAddDialog" @close="close" width="40%">
    <el-form
      :model="bdmEnterprise"
      :rules="enterpriseRules"
      ref="bdmEnterprise"
      label-width="auto"
      label-position="right"
      class="demo-bdmEnterprise"
    >
      <el-form-item label="公司名称" prop="name">
        <el-input v-model="bdmEnterprise.name" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="营业执照" prop="businessLicense" required>
        <el-upload
          action
          class="avatar-uploader"
          :show-file-list="false"
          :on-success="businessSuccess"
          :http-request="uploadBusiness"
        >
          <img v-if="businessImg" :src="businessImg" class="avatar" />
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
      </el-form-item>
      <el-form-item label="现注册地址" prop="address">
        <el-input v-model="bdmEnterprise.address" placeholder="请输入现注册地址"></el-input>
      </el-form-item>
      <el-form-item label="法人手机号码" prop="corporatePhoneNumber">
        <el-input v-model="bdmEnterprise.corporatePhoneNumber" placeholder="请输入法人手机号码"></el-input>
      </el-form-item>
      <el-form-item label="股东手机号码" prop="shareholderPhoneNumber">
        <el-input v-model="bdmEnterprise.shareholderPhoneNumber" placeholder="请输入股东手机号码"></el-input>
      </el-form-item>
      <el-form-item label="公司所在地" prop="location">
        <el-input v-model="bdmEnterprise.location" placeholder="请输入公司所在地"></el-input>
      </el-form-item>
      <el-form-item label="企业组织形式" prop="organizationalForm">
        <el-input v-model="bdmEnterprise.organizationalForm" placeholder="请输入企业组织形式"></el-input>
      </el-form-item>
      <el-form-item label="基本户照片" prop="basicHouseholdPicture" required>
        <el-upload
          action
          class="avatar-uploader"
          :show-file-list="false"
          :on-success="basicSuccess"
          :http-request="uploadBasic"
        >
          <img v-if="basicImg" :src="basicImg" class="avatar" />
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
      </el-form-item>
      <el-form-item label="基本户" prop="basicHousehold">
        <el-input v-model="bdmEnterprise.basicHousehold" placeholder="请输入基本户"></el-input>
      </el-form-item>
      <el-form-item label="一般户" prop="generalAccounts">
        <el-input v-model="bdmEnterprise.generalAccounts" placeholder="请输入一般户"></el-input>
      </el-form-item>
      <el-form-item label="网商银行" prop="bank">
        <el-input v-model="bdmEnterprise.bank" placeholder="请输入网商银行"></el-input>
      </el-form-item>
      <el-form-item label="房东" prop="landlord">
        <el-input v-model="bdmEnterprise.landlord" placeholder="请输入房东"></el-input>
      </el-form-item>
      <el-form-item label="地址联系人" prop="contactPerson">
        <el-input v-model="bdmEnterprise.contactPerson" placeholder="请输入地址联系人"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="showDialog">取 消</el-button>
      <el-button type="primary" @click="submitForm">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { addEnterprise, editEnterprise } from '@/api/baseData/enterprise'
import { imgUpload } from '@/api/baseData/brand'
import { recycleinsert } from '@/api/recycle/recycle'
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
      // 营业执照图片回显地址
      businessImg: '',
      // 营业执照图片文件
      businessFile: {},
      // 基本户图片回显地址
      basicImg: '',
      // 基本户图片文件
      basicFile: {},
      // 删除的图片地址
      removePicture: [],
      // 负责人级联选择
      options: [],
      // 表单数据
      bdmEnterprise: {
        id: null,
        name: '',
        businessLicense: '',
        address: '',
        corporatePhoneNumber: '',
        shareholderPhoneNumber: '',
        location: '',
        organizationalForm: '',
        basicHouseholdPicture: '',
        basicHousehold: '',
        generalAccounts: '',
        bank: '',
        landlord: '',
        contactPerson: '',
      },
      enterpriseRules: {
        name: [{ required: true, message: '请填写公司名称', trigger: 'blur' }],
        address: [
          { required: true, message: '请填写现工作地址', trigger: 'blur' },
        ],
        corporatePhoneNumber: [
          { required: true, message: '请填写法人手机号码', trigger: 'blur' },
        ],
        shareholderPhoneNumber: [
          { required: true, message: '请填写股东手机号码', trigger: 'blur' },
        ],
        location: [
          { required: true, message: '请填写公司所在地', trigger: 'blur' },
        ],
        organizationalForm: [
          { required: true, message: '请填写企业组织形式', trigger: 'blur' },
        ],
        basicHousehold: [
          { required: true, message: '请填写基本户', trigger: 'blur' },
        ],
        generalAccounts: [
          { required: true, message: '请填写一般户', trigger: 'blur' },
        ],
        bank: [{ required: true, message: '请填写网商银行', trigger: 'blur' }],
        landlord: [{ required: true, message: '请填写房东', trigger: 'blur' }],
        contactPerson: [
          { required: true, message: '请填写地址联系人', trigger: 'blur' },
        ],
      },
    }
  },
  computed: {
    showTitle() {
      return this.row.id ? '修改公司' : '新增公司'
    },
  },
  created() {
    if (this.row.id) {
      this.showData()
    }
  },
  methods: {
    // 营业执照成功上传图片回显
    async businessSuccess(res, file) {
      this.removePicture.push(this.businessImg)
      this.businessImg = URL.createObjectURL(file.raw)
      console.log('3333', this.businessImg)
    },
    // 营业执照图片返回值
    async uploadBusiness(e) {
      // this.fileList.push(e.file)
      this.businessFile = e.file
      // console.log('add', this.imgFile)
    },
    // 基本户照片成功上传图片回显
    async basicSuccess(res, file) {
      this.removePicture.push(this.basicImg)
      this.basicImg = URL.createObjectURL(file.raw)
      console.log('3333', this.basicImg)
    },
    // 基本户照片图片返回值
    async uploadBasic(e) {
      // this.fileList.push(e.file)
      this.basicFile = e.file
      // console.log('add', this.imgFile)
    },
    showDialog() {
      this.close()
    },
    // 数据回显
    showData() {
      const {
        id,
        name,
        businessLicense,
        address,
        corporatePhoneNumber,
        shareholderPhoneNumber,
        location,
        organizationalForm,
        basicHouseholdPicture,
        basicHousehold,
        generalAccounts,
        bank,
        landlord,
        contactPerson,
      } = this.row
      this.bdmEnterprise.id = id
      this.bdmEnterprise.name = name
      this.bdmEnterprise.businessLicense = businessLicense
      this.bdmEnterprise.address = address
      this.bdmEnterprise.corporatePhoneNumber = corporatePhoneNumber
      this.bdmEnterprise.shareholderPhoneNumber = shareholderPhoneNumber
      this.bdmEnterprise.location = location
      this.bdmEnterprise.organizationalForm = organizationalForm
      this.bdmEnterprise.basicHouseholdPicture = basicHouseholdPicture
      this.bdmEnterprise.basicHousehold = basicHousehold
      this.bdmEnterprise.generalAccounts = generalAccounts
      this.bdmEnterprise.bank = bank
      this.bdmEnterprise.landlord = landlord
      this.bdmEnterprise.contactPerson = contactPerson
      this.businessImg = this.bdmEnterprise.businessLicense
      this.basicImg = this.bdmEnterprise.basicHouseholdPicture
    },
    close() {
      this.$emit('update:showAddDialog', false)
      if (this.row) {
        this.$parent.clearRow()
      }
      this.bdmEnterprise = {
        name: '',
        businessLicense: '',
        address: '',
        corporatePhoneNumber: '',
        shareholderPhoneNumber: '',
        location: '',
        organizationalForm: '',
        basicHouseholdPicture: '',
        basicHousehold: '',
        generalAccounts: '',
        bank: '',
        landlord: '',
        contactPerson: '',
      }
      this.removePicture = []
      this.businessImg = ''
      this.businessFile = {}
      this.basicImg = ''
      this.basicFile = {}
      this.$refs.bdmEnterprise.resetFields()
      setTimeout(() => {
        this.$parent.getList()
      }, 200)
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
    // 提交表单
    async submitForm() {
      console.log('文件1', this.businessFile)
      console.log('文件', this.basicFile)
      if (Object.keys(this.businessFile).length > 0) {
        let formData = new FormData()
        formData.append('picture', this.businessFile)
        const businessRes = await imgUpload(formData)
        this.bdmEnterprise.businessLicense = businessRes.data
      }
      if (Object.keys(this.basicFile).length > 0) {
        let basicFormdata = new FormData()
        basicFormdata.append('picture', this.basicFile)
        const basicRes = await imgUpload(basicFormdata)
        this.bdmEnterprise.basicHouseholdPicture = basicRes.data
      }
      if (Array.isArray(this.bdmEnterprise.manager)) {
        this.bdmEnterprise.manager =
          this.bdmEnterprise.manager[this.bdmEnterprise.manager.length - 1]
      }
      if (!this.row.id) {
        // 校验表单
        await this.$refs.bdmEnterprise.validate()
        // 发送请求
        await addEnterprise(this.bdmEnterprise)
        // 返回成功，需要提示用户添加成功
        this.$message.success('新增公司成功')
      } else if (this.row.id) {
        // 校验表单
        await this.$refs.bdmEnterprise.validate()
        // 处理删除的文件
        if (this.removePicture.length > 0) {
          this.putRecycle()
        }
        await editEnterprise(this.bdmEnterprise)
        this.$message.success('修改公司成功')
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