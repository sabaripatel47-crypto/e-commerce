<template>
  <el-dialog top="0vh" :close-on-click-modal="false" :title="showTitle" :visible="showAddDialog" @close="close" width="40%">
    <el-form
      :model="bdmBigCustomer"
      :rules="bigCustomerRules"
      ref="bdmBigCustomer"
      label-width="150px"
      label-position="right"
      class="demo-bdmBigCustomer"
    >
      <el-form-item label="公司信用编码" prop="code">
        <el-input v-model="bdmBigCustomer.code" placeholder="2-10个字符"></el-input>
      </el-form-item>
      <el-form-item label="客户名称" prop="name" required>
        <el-input v-model="bdmBigCustomer.name" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="客户联系人" prop="contacts">
        <el-input v-model="bdmBigCustomer.contacts" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="客户所在地" prop="area">
        <template>
          <div class="area">
            <div>
              <el-radio-group v-model="outOrIn" size="small" @input="redioChange">
                <el-radio-button label="国内"></el-radio-button>
                <el-radio-button label="国外"></el-radio-button>
              </el-radio-group>
            </div>
            <div v-if="outOrIn === '国内'">
              <el-cascader
                :options="pcaTextArr"
                @change="handleChange"
                v-model="bdmBigCustomer.area"
                placeholder="请选择地址"
                clearable
              ></el-cascader>
            </div>
            <div v-else>
              <el-input v-model="bdmBigCustomer.area[0]" placeholder="请输入地址"></el-input>
            </div>
          </div>
        </template>
      </el-form-item>
      <el-form-item label="详细地址" prop="address">
        <el-input v-model="bdmBigCustomer.address" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="联系方式" prop="contactNumber">
        <el-input v-model="bdmBigCustomer.contactNumber" placeholder="请输入手机号码"></el-input>
      </el-form-item>
      <el-form-item label="客户等级" prop="level" required>
        <el-radio-group v-model="bdmBigCustomer.level">
          <el-radio label="低">低</el-radio>
          <el-radio label="中">中</el-radio>
          <el-radio label="高">高</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="客户评价" prop="appraise">
        <el-input type="textarea" v-model="bdmBigCustomer.appraise" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="跟进负责人" prop="leader">
        <el-cascader
          v-model="bdmBigCustomer.leader"
          :options="optionsManager"
          :show-all-levels="false"
          @change="changeLeader"
          :props="{
          children: 'children',
          label: 'deptName',
          value: 'deptName',
          checkStrictly: false,
        }"
          clearable
        ></el-cascader>
      </el-form-item>
      <el-form-item label="客户类型" prop="businessType" required>
        <el-select v-model="bdmBigCustomer.businessType" placeholder="请选择">
          <el-option
            v-for="(item, index) in businessTypeData"
            :key="index"
            :label="item.name"
            :value="item.uuid"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="微信名称" prop="wechatName">
        <el-input v-model="bdmBigCustomer.wechatName" placeholder="请输入微信名称"></el-input>
      </el-form-item>
      <el-form-item label="图片" prop="agreement">
        <OSSFileUpload
          :sign="signOSS"
          :limitNum="3"
          :fileType="['.jpg', '.png', '.jpeg', '.webp']"
          :showImgList="showImgList"
          :btnType="'plus'"
          :fileRecordList="fileRecordList"
          :isPicture="true"
          :showLoading.sync="showLoading"
          @getFileUrl="getFileUrl"
          @deleteFilePlus="deleteFilePlus"
          ref="OSSFileUploadRef"
        ></OSSFileUpload>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="showDialog">取 消</el-button>
      <el-button type="primary" @click="submitForm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import ossFileUpload from '@/components/OSSFileUpload'
import { pcaTextArr } from 'element-china-area-data'
import {
  addBigCustomer,
  editBigCustomer,
  getUploadSing,
  getFilesUuid,
} from '@/api/customer/bigCustomer'
import { department } from '@/api/information/department'
import { skuUpload } from '@/api/baseData/sku'
import { recycleinsert } from '@/api/recycle/recycle'
import { getDeptTreeData } from '@/utils/common'
import { getDictData } from '@/api/dict/dict'
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
    this.getBusinessType()
  },
  data() {
    return {
      // 显示文件上传加载中
      showLoading: true,
      limitNum: 3,
      signOSS: {},
      showImgList: false,
      // 图片回显列表
      fileRecordList: [],
      // 图片大图预览数组
      srcList: [],
      // 国内还是国外
      outOrIn: '国内',
      // 客户类型
      businessTypeData: [
        {
          uuid: '1',
          name: '客户',
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
      selectedOptions: [],
      bdmBigCustomer: {
        id: null,
        uuid: null,
        code: '',
        name: '',
        contacts: '',
        area: [],
        areaType: 1,
        address: '',
        contactNumber: '',
        level: '',
        appraise: '',
        leader: '',
        information: [],
        agreement: [],
        wechatName: '',
        businessType: '',
        urlUuid: [],
      },
      bigCustomerRules: {
        // code: [
        //   { required: true, message: '请输入公司信用编码', trigger: 'blur' },
        //   {
        //     min: 2,
        //     max: 100,
        //     message: '请输入公司信用编码',
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
      return this.row.id ? '修改客户' : '新增客户'
    },
  },
  mounted() {
    this.getSing()
    this.bdmBigCustomer.areaType == 1
      ? (this.outOrIn = '国内')
      : (this.outOrIn = '国外')
  },
  methods: {
    changeLeader(e) {
      console.log('e', e)
    },
    async getSing() {
      let res = await getUploadSing()
      // console.log('res: ', res)
      this.signOSS = res.data
    },
    // 删除文件
    deleteFilePlus(obj) {
      let { index, item } = obj
      this.fileRecordList.splice(index, 1)
      this.bdmBigCustomer.urlUuid.splice(index, 1)
    },
    async getFileUrl(url) {
      // console.log('url=======: ', url)
      this.fileRecordList.push(url)
      let uuid = await this.getFilesUuidFn(url)
      this.bdmBigCustomer.urlUuid.push(uuid)
      this.$modal.closeLoading()
    },
    async getFilesUuidFn(url) {
      let res = await getFilesUuid({
        fileName: url,
        originalName: '',
        platformType: 0,
      })
      // console.log('res: ', res)
      return res.data
    },
    redioChange(e) {
      // console.log('e: ', e)
      this.bdmBigCustomer.area = []
      this.bdmBigCustomer.areaType = e === '国内' ? 1 : 2
    },
    // 获取列表信息
    async getBusinessType() {
      const res = await getDictData({
        itemKey: 'business_type',
      })
      // console.log('businessTypeData===res: ', res)
      this.businessTypeData = res.data
      // console.log(this.dictDataList)
    },
    // 提交上传
    async submitUpload() {
      // this.$modal.loading('正在上传文件，请稍候...')
      for (let i = 0; i < this.fileList.length; i++) {
        let formData = new FormData()
        formData.append('picture', this.fileList[i].raw)
        const res = await skuUpload(formData)
        this.bdmBigCustomer.information.push(res.data)
      }
      for (let i = 0; i < this.fileListAgm.length; i++) {
        let formData = new FormData()
        formData.append('picture', this.fileListAgm[i].raw)
        const res = await skuUpload(formData)
        this.bdmBigCustomer.agreement.push(res.data)
      }
    },

    // 负责人组织架构数据
    async getDeptTree() {
      const res = await department()
      this.optionsManager = await getDeptTreeData(res.data)
      // console.log('option', this.options)
    },
    // 省市区
    handleChange(e) {
      // console.log('e', e)
    },
    // 关弹层
    showDialog() {
      this.close()
    },
    // 数据回显
    showData() {
      const that = this
      const {
        id,
        uuid,
        code,
        name,
        contacts,
        area,
        areaType,
        address,
        contactNumber,
        level,
        appraise,
        leader,
        information,
        agreement,
        wechatName,
        businessType,
        bigUrlUuidVOS,
      } = this.row
      console.log('this.row: ', this.row)
      this.bdmBigCustomer.id = id
      this.bdmBigCustomer.uuid = uuid
      this.bdmBigCustomer.code = code
      this.bdmBigCustomer.name = name
      this.bdmBigCustomer.contacts = contacts
      this.bdmBigCustomer.area = area
      this.bdmBigCustomer.areaType = areaType
      this.bdmBigCustomer.address = address
      this.bdmBigCustomer.contactNumber = contactNumber
      this.bdmBigCustomer.level = level
      this.bdmBigCustomer.appraise = appraise
      this.bdmBigCustomer.leader = leader
      this.bdmBigCustomer.information = information
      this.bdmBigCustomer.agreement = agreement
      this.bdmBigCustomer.wechatName = wechatName
      this.bdmBigCustomer.businessType = businessType
      if (bigUrlUuidVOS) {
        bigUrlUuidVOS.forEach((item) => {
          that.bdmBigCustomer.urlUuid.push(item.uuid)
          that.fileRecordList.push(item.url)
        })
      } else {
        that.bdmBigCustomer.urlUuid = []
        that.fileRecordList = []
      }
    },
    close() {
      this.$emit('update:showAddDialog', false)
      if (this.row) {
        this.$parent.clearRow()
      }
      this.bdmBigCustomer = {
        code: '',
        name: '',
        contacts: '',
        area: [],
        areaType: '',
        address: '',
        contactNumber: '',
        level: '',
        appraise: '',
        leader: '',
        information: [],
        agreement: [],
        urlUuid: [],
      }
      this.outOrIn = '国内'
      this.removePicture = []
      this.fileRecordList = []
      this.$refs.bdmBigCustomer.resetFields()
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
    // 校验必填项
    validateFn() {
      if (this.bdmBigCustomer.name === '') {
        this.$message.error('请输入客户名称')
        return false
      }
      if (this.bdmBigCustomer.level === '') {
        this.$message.error('请输入客户等级')
        return false
      }
      if (this.bdmBigCustomer.businessType === '') {
        this.$message.error('请输入客户类型')
        return false
      }

      return true
    },

    async submitForm() {
      if (!this.validateFn()) {
        return
      }
      console.log('123131', this.bdmBigCustomer.leader)

      if (Array.isArray(this.bdmBigCustomer.leader)) {
        if (this.bdmBigCustomer.leader.length > 0) {
          this.bdmBigCustomer.leader =
            this.bdmBigCustomer.leader[this.bdmBigCustomer.leader.length - 1]
        } else {
          this.bdmBigCustomer.leader = ''
          console.log('this.bdmBigCustomer.leader', this.bdmBigCustomer.leader)
        }
      }

      if (!this.row.id) {
        // 校验表单
        await this.$refs.bdmBigCustomer.validate()
        // 上传文件
        await this.submitUpload()

        // 发送请求
        await addBigCustomer(this.bdmBigCustomer)
        // 返回成功，需要提示用户添加成功
        this.$message.success('新增客户成功')
      } else if (this.row.id) {
        // 校验表单
        await this.$refs.bdmBigCustomer.validate()
        // 处理删除的文件
        if (this.removePicture.length > 0) {
          this.putRecycle()
        }
        // 上传文件
        await this.submitUpload()
        // if (this.bdmBigCustomer.area.length === 0) {
        //   console.log(33333)
        //   this.bdmBigCustomer.area = this.bdmBigCustomer.area.push('')
        // }
        await editBigCustomer(this.bdmBigCustomer)
        this.$message.success('修改客户成功')
      }
      // 关闭弹层
      this.close()
      this.fileList = []
      this.$parent.getList()
    },
  },
  components: {
    ossFileUpload,
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

.area {
  ::v-deep .el-radio-group {
    margin-bottom: -6px;
  }
}
</style>
