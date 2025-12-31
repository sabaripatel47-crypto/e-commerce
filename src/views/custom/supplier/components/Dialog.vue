<template>
  <el-dialog :close-on-click-modal="false" :title="showTitle" :visible="showAddDialog" @close="close" width="40%">
    <el-form
      :model="bdmSupplier"
      :rules="supplierRules"
      ref="bdmSupplier"
      label-width="120px"
      label-position="right"
      class="demo-bdmSupplier"
    >
      <el-form-item label="供应商编码" prop="code">
        <el-input v-model="bdmSupplier.code" placeholder="2-10个字符"></el-input>
      </el-form-item>
      <el-form-item label="供应商名称" prop="name">
        <el-input v-model="bdmSupplier.name" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="联系人" prop="contacts">
        <el-input v-model="bdmSupplier.contacts" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="供应商所在地" prop="area">
        <el-cascader
          :options="pcaTextArr"
          @change="handleChange"
          v-model="bdmSupplier.area"
          placeholder="请选择地址"
        ></el-cascader>
      </el-form-item>
      <el-form-item label="详细地址" prop="address">
        <el-input v-model="bdmSupplier.address" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="联系方式" prop="contactNumber">
        <el-input v-model="bdmSupplier.contactNumber" placeholder="请输入手机号码"></el-input>
      </el-form-item>
      <el-form-item label="供应商等级" prop="level">
        <el-radio-group v-model="bdmSupplier.level">
          <el-radio label="低">低</el-radio>
          <el-radio label="中">中</el-radio>
          <el-radio label="高">高</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="供应商评价" prop="appraise">
        <el-input type="textarea" v-model="bdmSupplier.appraise" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="跟进负责人" prop="leader">
        <el-cascader
          v-model="bdmSupplier.leader"
          :options="optionsManager"
          :show-all-levels="false"
          :props="{children: 'children',label: 'deptName', value:'deptName', checkStrictly: false }"
          clearable
        ></el-cascader>
      </el-form-item>
      <!-- <el-form-item label="客户类型" prop="businessType">
        <el-select v-model="bdmSupplier.businessType" placeholder="请选择">
          <el-option
            v-for="(item, index) in businessTypeData"
            :key="index"
            :label="item.name"
            :value="item.key"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="微信名称" prop="wechatName">
        <el-input
          v-model="bdmSupplier.wechatName"
          placeholder="请输入微信名称"
        ></el-input>
      </el-form-item> -->
      <!-- <el-form-item label="供应商资料" prop="information">
        <el-upload
          class="upload-demo"
          accept=".pdf, .doc, .docx, .xls, .xlsx, .zip, .jpg, .png, .rar, .md"
          drag
          action="#"
          ref="upload"
          :on-change="fileChange"
          :file-list="fileList"
          :auto-upload="false"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          multiple
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">
            将文件拖到此处，或
            <em>点击上传</em>
          </div>
        </el-upload>
        <div
          style="cursor: pointer;"
          v-if="bdmSupplier.information && bdmSupplier.information.length > 0"
        >
          <div class="fileItem" v-for="item in bdmSupplier.information">
            <span>{{ item.split('.com/')[1] }}</span>
            <span class="fileItem_icon" @click="deleteItem(item)">
              <i class="el-icon-close"></i>
            </span>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="合作协议" prop="agreement">
        <el-upload
          class="upload-demo"
          accept=".pdf, .doc, .docx, .xls, .xlsx, .zip, .jpg, .png, .rar, .md"
          drag
          action="#"
          ref="upload"
          :on-change="fileChangeAgm"
          :file-list="fileListAgm"
          :auto-upload="false"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          multiple
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">
            将文件拖到此处，或
            <em>点击上传</em>
          </div>
        </el-upload>
        <div
          style="cursor: pointer;"
          v-if="bdmSupplier.agreement && bdmSupplier.agreement.length > 0"
        >
          <div class="fileItem" v-for="item in bdmSupplier.agreement">
            <span>{{ item.split('.com/')[1] }}</span>
            <span class="fileItem_icon" @click="deleteItemAgm(item)">
              <i class="el-icon-close"></i>
            </span>
          </div>
        </div>
      </el-form-item> -->
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="showDialog">取 消</el-button>
      <el-button type="primary" @click="submitForm">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { pcaTextArr } from 'element-china-area-data'
import { addSupplier, editSupplier } from '@/api/customer/supplier'
import { department } from '@/api/information/department'
import { skuUpload } from '@/api/baseData/sku'
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
  created() {
    if (this.row.id) {
      this.showData()
    }
    this.getDeptTree()
  },
  data() {
    return {
       // 客户类型
       businessTypeData: [
        {
          key: "1",
          name: "客户",
        },
        {
          key: "2",
          name: "供应商",
        },
      ],
      // 客户资料文件列表
      fileList: [],
      // 客户协议文件列表
      fileListAgm: [],
      // 删除的文件地址
      removePicture: [],
      // 负责人级联选择
      optionsManager: [],

      pcaTextArr,
      bdmSupplier: {
        id: null,
        code: '',
        name: '',
        contacts: '',
        area: [],
        address: '',
        contactNumber: '',
        level: '',
        appraise: '',
        leader: '',
        information: [],
        agreement: [],
        wechatMame:'',
        // businessType:'',
        // wechatName:'',
      },
      supplierRules: {
        // code: [
        //   { required: true, message: '请输入客户编码', trigger: 'blur' },
        //   {
        //     min: 2,
        //     max: 100,
        //     message: '请输入客户编码',
        //     trigger: 'blur',
        //   },
        // ],
        // name: [
        //   { required: true, message: '请输入客户名称', trigger: 'blur' },
        //   {
        //     min: 2,
        //     max: 30,
        //     message: '长度在 2 到 30 个字符',
        //     trigger: 'blur',
        //   },
        // ],
        // contacts: [
        //   { required: true, message: '请输入客户联系人', trigger: 'blur' },
        //   {
        //     min: 2,
        //     max: 20,
        //     message: '长度在 2 到 20 个字符',
        //     trigger: 'blur',
        //   },
        // ],
        // area: [
        //   { required: true, message: '请选择客户所在地', trigger: 'blur' },
        // ],
        // address: [
        //   { required: true, message: '请输入客户详细地址', trigger: 'blur' },
        // ],
        // contactNumber: [
        //   { required: true, message: '请输入联系方式', trigger: 'blur' },
        //   {
        //     pattern: /^1[3456789]\d{9}$/,
        //     message: '请输入正确的手机号码',
        //     trigger: 'blur',
        //   },
        // ],
        // level: [
        //   { required: true, message: '请选择客户等级', trigger: 'change' },
        // ],
        // appraise: [
        //   { required: true, message: '请填写客户评价', trigger: 'blur' },
        //   {
        //     min: 2,
        //     max: 30,
        //     message: '长度在 2 到 30 个字符',
        //     trigger: 'blur',
        //   },
        // ],
        // leader: [
        //   { required: true, message: '请选择跟进负责人', trigger: 'change' },
        // ],
        // information: [
        //   { required: true, message: '请输入客户资料', trigger: 'change' },
        // ],
        // agreement: [
        //   { required: true, message: '请输入合作协议', trigger: 'change' },
        // ],
      },
    }
  },
  computed: {
    showTitle() {
      return this.row.id ? '修改供应商' : '新增供应商'
    },
  },

  methods: {
    // 删除供应商资料
    deleteItem(one) {
      this.$to(
        this.$confirm('确定删除此供应商资料文件？', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          beforeClose: async (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true
              instance.confirmButtonText = '删除中...'
              this.removePicture.push(one)
              this.bdmSupplier.information.forEach((item, index) => {
                if (item === one) {
                  this.bdmSupplier.information.splice(index, 1)
                }
              })
              instance.confirmButtonLoading = false
              await done()
              this.$message({
                type: 'success',
                message: '删除供应商资料成功！',
              })
            } else {
              await done()
            }
          },
        })
      )
    },
    // 删除合作协议
    deleteItemAgm(one) {
      this.$to(
        this.$confirm('确定删除此合作协议文件？', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          beforeClose: async (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true
              instance.confirmButtonText = '删除中...'
              this.removePicture.push(one)
              this.bdmSupplier.agreement.forEach((item, index) => {
                if (item === one) {
                  this.bdmSupplier.agreement.splice(index, 1)
                }
              })
              instance.confirmButtonLoading = false
              await done()
              this.$message({
                type: 'success',
                message: '删除合作协议成功！',
              })
            } else {
              await done()
            }
          },
        })
      )
    },

    /* 文件上传(客户资料) */
    fileChange(file, fileList) {
      this.fileList = fileList
    },
    /* 文件上传(客户协议) */
    fileChangeAgm(file, fileList) {
      this.fileListAgm = fileList
    },
    handleRemove(file, fileList) {
      console.log('fileeee', file, fileList)
    },
    handlePreview(file) {
      console.log('上传fileeee', file)
    },

    // 提交上传
    async submitUpload() {
      // this.$modal.loading('正在上传文件，请稍候...')
      for (let i = 0; i < this.fileList.length; i++) {
        if (this.fileList[i] !== '') {
          let formData = new FormData()
          formData.append('picture', this.fileList[i].raw)
          const res = await skuUpload(formData)
          this.bdmSupplier.information.push(res.data)
        }
      }
      for (let i = 0; i < this.fileListAgm.length; i++) {
        if (this.fileListAgm[i] !== '') {
          let formData = new FormData()
          formData.append('picture', this.fileListAgm[i].raw)
          const res = await skuUpload(formData)
          this.bdmSupplier.agreement.push(res.data)
        }
      }
    },
    // 负责人组织架构数据
    async getDeptTree() {
      const res = await department()
      this.optionsManager = await getDeptTreeData(res.data)
      console.log('option', this.options)
    },
    // 省市区
    handleChange(e) {
      console.log('e', e)
    },

    // 关闭弹层
    showDialog() {
      this.close()
    },
    // 数据回显
    showData() {
      const {
        id,
        code,
        name,
        contacts,
        area,
        address,
        contactNumber,
        level,
        appraise,
        leader,
        information,
        agreement,
        // wechatName,
        // businessType,
      } = this.row
      this.bdmSupplier.id = id
      this.bdmSupplier.code = code
      this.bdmSupplier.name = name
      this.bdmSupplier.contacts = contacts
      this.bdmSupplier.area = area
      this.bdmSupplier.address = address
      this.bdmSupplier.contactNumber = contactNumber
      this.bdmSupplier.level = level
      this.bdmSupplier.appraise = appraise
      this.bdmSupplier.leader = leader
      this.bdmSupplier.information = information
      this.bdmSupplier.agreement = agreement
      // this.bdmSupplier.wechatName = wechatName
      // this.bdmSupplier.businessType = businessType
    },
    close() {
      this.$emit('update:showAddDialog', false)
      if (this.row) {
        this.$parent.clearRow()
      }
      this.bdmSupplier = {
        code: '',
        name: '',
        contacts: '',
        area: '',
        address: '',
        contactNumber: '',
        level: '',
        appraise: '',
        leader: '',
        information: '',
        agreement: '',
      }
      this.removePicture = []
      this.$refs.bdmSupplier.resetFields()
      setTimeout(() => {
        this.$parent.getList()
      }, 200)
    },
    // 将删除的文件放入回收站
    putRecycle() {
      this.removePicture.forEach(async (item) => {
        if (item.indexOf('.com/') !== -1) {
          let fileName = item.split('.com/')[1]
          await recycleinsert({ name: fileName, url: item })
        }
      })
    },
    async submitForm() {
      if (Array.isArray(this.bdmSupplier.leader)) {
        this.bdmSupplier.leader =
          this.bdmSupplier.leader[this.bdmSupplier.leader.length - 1]
      }
      if (!this.row.id) {
        // 校验表单
        await this.$refs.bdmSupplier.validate()
        // 上传文件
        await this.submitUpload()
        // 发送请求
        await addSupplier(this.bdmSupplier)
        // 返回成功，需要提示用户添加成功
        this.$message.success('新增供应商成功')
      } else if (this.row.id) {
        // 校验表单
        await this.$refs.bdmSupplier.validate()
        // 处理删除的文件
        if (this.removePicture.length > 0) {
          this.putRecycle()
        }
        // 上传文件
        await this.submitUpload()
        await editSupplier(this.bdmSupplier)
        this.$message.success('修改供应商成功')
      }
      // 关闭弹层
      this.close()
      this.$parent.getList()
    },
  },
}
</script>

<style scoped lang="scss">
.fileItem {
  width: 100%;
  height: 30px;
  padding: 0 10px;
  display: flex;
  justify-content: space-between;
  .fileItem_icon {
    opacity: 0;
  }
}
.fileItem:hover {
  cursor: pointer;
  background-color: #f5f7fa;
  transition: 0.5s;
  .fileItem_icon {
    opacity: 1;
  }
}
</style>
