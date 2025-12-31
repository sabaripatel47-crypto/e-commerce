<template>
  <el-dialog :title="showTitle" :visible="showAddDialog" @before-close="close" width="40%">
    <el-form
      :model="bdmSku"
      :rules="skuRules"
      ref="bdmSku"
      label-width="100px"
      label-position="right"
      class="demo-bdmSku"
    >
      <el-form-item label="产品编号" prop="code">
        <el-input v-model="bdmSku.code" placeholder="2-30个字符"></el-input>
      </el-form-item>
      <el-form-item label="产品名称" prop="productName">
        <el-input v-model="bdmSku.productName" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="产品类别" prop="type">
        <el-select v-model="bdmSku.type" placeholder="请选择产品类别">
          <el-option v-for="item in type" :label="item" :value="item" :key="item"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="产品级别" prop="level">
        <el-select v-model="bdmSku.level" placeholder="请选择产品级别">
          <el-option v-for="item in level" :label="item" :value="item" :key="item"></el-option>
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="SKU编码" prop="skuCode">
        <el-input v-model="bdmSku.skuCode" placeholder="2-20个字符"></el-input>
      </el-form-item>-->
      <!-- <el-form-item label="SKU名称" prop="skuCode">
        <el-input v-model="bdmSku.skuCode" placeholder="2-20个字符"></el-input>
      </el-form-item>-->
      <el-form-item label="SKU规格" prop="skuSpecifications">
        <el-input v-model="bdmSku.skuSpecifications" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="材质" prop="material">
        <el-input v-model="bdmSku.material" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="容量（cm）" prop="capacity">
        <el-input-number v-model="bdmSku.capacity"></el-input-number>
      </el-form-item>
      <el-form-item label="长（cm）" prop="length">
        <el-input-number v-model="bdmSku.length"></el-input-number>
      </el-form-item>
      <el-form-item label="宽（cm）" prop="width">
        <el-input-number v-model="bdmSku.width"></el-input-number>
      </el-form-item>
      <el-form-item label="高（cm）" prop="height">
        <el-input-number v-model="bdmSku.height"></el-input-number>
      </el-form-item>

      <el-form-item label="颜色" prop="color">
        <el-input v-model="bdmSku.color" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="毛重（Kg）" prop="grossWeight">
        <el-input-number v-model="bdmSku.grossWeight"></el-input-number>
      </el-form-item>
      <el-form-item label="净重（Kg）" prop="netWeight">
        <el-input-number v-model="bdmSku.netWeight"></el-input-number>
      </el-form-item>
      <el-form-item label="尺码" prop="size">
        <el-input-number v-model="bdmSku.size"></el-input-number>
      </el-form-item>
      <el-form-item label="特色" prop="characteristic">
        <el-input v-model="bdmSku.characteristic" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="其他规格" prop="otherSpecifications">
        <el-input v-model="bdmSku.otherSpecifications" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="其他型号" prop="otherModel">
        <el-input v-model="bdmSku.otherModel" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="组合编码" prop="combinationCode">
        <el-input v-model="bdmSku.combinationCode" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="图片上传">
        <div>
          <span class="imageItem" v-for="item,index in bdmSku.pictureUrl">
            <img style="width: 60px; height: 60px" :src="item" alt />
            <span class="remove" @click="removeImg(item,index)">
              <i class="el-icon-close"></i>
            </span>
          </span>
        </div>
        <el-upload
          action
          list-type="picture-card"
          :http-request="uploadPicture"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
        >
          <i class="el-icon-plus"></i>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt />
        </el-dialog>
      </el-form-item>
      <el-form-item label="SKU型号" prop="skuModel">
        <el-input v-model="bdmSku.skuModel" placeholder="2-20个字符"></el-input>
      </el-form-item>
      <el-form-item label="SKU单价" prop="skuPrice">
        <el-input-number v-model="bdmSku.skuPrice"></el-input-number>
      </el-form-item>
      <el-form-item label="sku说明" prop="skuDescription">
        <el-input type="textarea" v-model="bdmSku.skuDescription"></el-input>
      </el-form-item>
      <el-form-item label="sku状态" prop="state">
        <el-radio-group v-model="bdmSku.state">
          <el-radio label="0">正常</el-radio>
          <el-radio label="1">关闭</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="showDialog">取 消</el-button>
      <el-button type="primary" @click="submitForm">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { addSku, editSku, skuUpload } from '@/api/baseData/sku'
import { getDictValue } from '@/api/dict/dict'
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
  created() {
    if (this.row.id) {
      this.showData()
    }
    this.getDictList()
  },
  data() {
    return {
      // 产品类别选项值
      type: [],
      // 产品级别选项值
      level: [],
      dialogImageUrl: '',
      removePicture: [],
      dialogVisible: false,
      fileList: [],
      bdmSku: {
        id: null,
        code: '',
        productName: '',
        skuCode: '',
        skuSpecifications: '',
        skuModel: '',
        skuPrice: '',
        skuDescription: '',
        material: '',
        capacity: null,
        length: null,
        width: null,
        height: null,
        color: '',
        grossWeight: null,
        netWeight: null,
        size: '',
        characteristic: '',
        otherSpecifications: '',
        otherModel: '',
        combinationCode: '',
        pictureUrl: [],
        state: '',
        type: '',
        level: '',
      },
      skuRules: {
        code: [
          { required: true, message: '请输入产品编码', trigger: 'blur' },
          {
            min: 2,
            max: 30,
            message: '长度在 2 到 30 个字符',
            trigger: 'blur',
          },
        ],
        productName: [
          { required: true, message: '请输入产品名称', trigger: 'blur' },
          {
            min: 2,
            max: 20,
            message: '长度在 2 到 20 个字符',
            trigger: 'blur',
          },
        ],
        skuCode: [
          { required: true, message: '请输入SKU编码', trigger: 'blur' },
        ],
        skuSpecifications: [
          { required: true, message: '请输入SKU规格', trigger: 'blur' },
        ],
        skuModel: [
          { required: true, message: '请输入SKU型号', trigger: 'blur' },
        ],
        skuPrice: [
          { required: true, message: '请输入SKU单价', trigger: 'blur' },
        ],
        // skuDescription: [
        //   { required: true, message: '请输入SKU说明', trigger: 'blur' },
        // ],
        state: [
          { required: true, message: '请选择产品状态', trigger: 'change' },
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
      return this.row.id ? '修改SKU' : '新增SKU'
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
    // 图片删除
    removeImg(item, index) {
      console.log('图片url', item)
      this.removePicture.push(item)
      this.bdmSku.pictureUrl.splice(index, 1)
      console.log(this.bdmSku.pictureUrl)
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
    // 图片返回值
    async uploadPicture(e) {
      this.fileList.push(e.file)
      console.log('add', this.fileList)
    },
    // 图片删除
    handleRemove(file, fileList) {
      this.fileList = []
      for (let i = 0; i < fileList.length; i++) {
        this.fileList.push(fileList[i].raw)
      }
      console.log('remove', this.fileList)
    },
    // 图片上传
    handlePreview(file, fileList) {
      console.log(file, fileList)
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    // 数据回显
    showData() {
      const {
        id,
        code,
        productName,
        skuCode,
        skuSpecifications,
        skuModel,
        skuPrice,
        skuDescription,
        material,
        capacity,
        length,
        width,
        height,
        color,
        grossWeight,
        netWeight,
        size,
        characteristic,
        otherSpecifications,
        otherModel,
        combinationCode,
        pictureUrl,
        state,
        level,
        type,
      } = this.row
      this.bdmSku.id = id
      this.bdmSku.code = code
      this.bdmSku.productName = productName
      this.bdmSku.skuCode = skuCode
      this.bdmSku.skuSpecifications = skuSpecifications
      this.bdmSku.skuModel = skuModel
      this.bdmSku.skuPrice = skuPrice
      this.bdmSku.skuDescription = skuDescription
      this.bdmSku.material = material
      this.bdmSku.capacity = capacity
      this.bdmSku.length = length
      this.bdmSku.width = width
      this.bdmSku.height = height
      this.bdmSku.color = color
      this.bdmSku.grossWeight = grossWeight
      this.bdmSku.netWeight = netWeight
      this.bdmSku.size = size
      this.bdmSku.characteristic = characteristic
      this.bdmSku.otherSpecifications = otherSpecifications
      this.bdmSku.otherModel = otherModel
      this.bdmSku.combinationCode = combinationCode
      this.bdmSku.pictureUrl = pictureUrl
      this.bdmSku.state = state
      this.bdmSku.type = type
      this.bdmSku.level = level
      if (this.bdmSku.pictureUrl === null) {
        this.bdmSku.pictureUrl = []
      }
    },
    close() {
      this.$emit('update:showAddDialog', false)
      if (this.row) {
        this.$parent.clearRow()
      }
      this.bdmSku = {
        code: '',
        productName: '',
        skuCode: '',
        skuSpecifications: '',
        skuModel: '',
        skuPrice: '',
        skuDescription: '',
        material: '',
        capacity: null,
        length: null,
        width: null,
        height: null,
        color: '',
        grossWeight: null,
        netWeight: null,
        size: '',
        characteristic: '',
        otherSpecifications: '',
        otherModel: '',
        combinationCode: '',
        pictureUrl: [],
        state: '',
        type: '',
        level: '',
      }
      this.removePicture = []
      this.$refs.bdmSku.resetFields()
      setTimeout(() => {
        this.$parent.getList()
      }, 200)
    },
    // 提交上传
    async submitUpload() {
      console.log(this.fileList)
      // this.$modal.loading('正在上传文件，请稍候...')
      for (let i = 0; i < this.fileList.length; i++) {
        let formData = new FormData()
        formData.append('picture', this.fileList[i])
        const res = await skuUpload(formData)
        this.bdmSku.pictureUrl.push(res.data)
      }
    },
    // 提交表单
    async submitForm() {
      if (!this.row.id) {
        // 校验表单
        await this.$refs.bdmSku.validate()
        // 上传文件
        await this.submitUpload()
        // 发送请求
        await addSku(this.bdmSku)
        // 返回成功，需要提示用户添加成功
        this.$message.success('新增SKU成功')
      } else if (this.row.id) {
        // 校验表单
        await this.$refs.bdmSku.validate()
        // 处理删除的文件
        if (this.removePicture.length > 0) {
          this.putRecycle()
        }
        // 上传文件
        await this.submitUpload()
        await editSku(this.bdmSku)
        this.$message.success('修改SKU成功')
      }
      // 关闭弹层
      this.close()
      this.$parent.getList()
    },
  },
}
</script>
<style lang="scss">
.imageItem {
  cursor: pointer;
  position: relative;
  width: 20px;
  height: 20px;
  margin-right: 15px;
  .remove {
    color: #424141;
    scale: 1.2;
    position: absolute;
    bottom: 42px;
    right: -5px;
    &:hover {
      color: #409eff;
    }
  }
}
</style>