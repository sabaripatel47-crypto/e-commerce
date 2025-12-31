<template>
  <div :class="{
      'plus-box': btnType === 'plus',
    }">
    <el-upload
      v-if="newLimitNum !== 0"
      :class="{
        'upload-demo': btnType === 'primary',
        'plus-display-none': btnType === 'plus',
      }"
      :multiple="false"
      :limit="newLimitNum"
      :file-list="fileList"
      :accept="fileType.join(',')"
      :show-file-list="showImgList"
      :on-remove="handleRemove"
      :on-success="handleSuccess"
      :on-exceed="handleExceed"
      :before-upload="handleBeforeUpload"
      :http-request="upload"
      :list-type="isPicture ? 'picture' : ''"
      action
    >
      <el-button v-if="btnType === 'primary'" size="small" type="primary">点击上传</el-button>
      <i
        v-if="btnType === 'plus' && fileRecordList.length < limitNum"
        class="el-icon-plus avatar-uploader-icon"
      ></i>
    </el-upload>

    <div v-if="fileRecordList.length > 0">
      <div :class="{ 'file-item-plus-box': btnType === 'plus' }" v-if="isPicture">
        <div v-for="(item, index) in fileRecordList" :key="index" @click.stop="handleClick(item)">
          <div
            :class="{
              'file-item-plus': btnType === 'plus',
              'file-item': btnType === 'primary',
            }"
          >
            <div v-if="btnType === 'primary'">
              <el-image
                style="width: 100px; height: 100px"
                :src="item + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
              ></el-image>
            </div>
            <div v-else>
              <el-image
                style="
                  width: 30px;
                  height: 30px;
                  display: flex;
                  align-items: center;
                "
                :src="item + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
              ></el-image>
            </div>
            <i class="el-icon-close" @click.stop="deleteFileItem(index, item)"></i>
          </div>
          <div class="file-item" v-if="!isPicture && btnType === 'primary'">
            <span>{{ getFileName(item) }}</span>
            <i class="el-icon-close" @click="deleteFileItem(index, item)"></i>
          </div>
        </div>
      </div>

      <div class="el-upload__tip" slot="tip" v-if="btnType !== 'plus'">
        <span style="color: red">*</span>
        当前只能上传{{ limitNum }}个文件
      </div>
    </div>

    <el-dialog :visible.sync="dialogVisible" append-to-body>
      <img width="100%" :src="dialogImageUrl" alt />
    </el-dialog>
  </div>
</template>

<script>
// import request from '@/utils/request'
import axios from 'axios'

export default {
  name: 'OSSFileUpload',
  props: {
    // 是否显示上传的图片
    showImgList: {
      type: Boolean,
      default: true,
    },
    // 当前下标
    index: {
      type: Number,
      default: 0,
    },
    // 最大文件数
    limitNum: {
      type: Number,
      default: 1,
    },
    // 显示按钮类型
    btnType: {
      type: String,
      default: 'primary',
    },
    // oss文件上传签名
    sign: {
      type: Object,
    },
    // 文件类型
    fileType: {
      type: Array,
      default: () => ['.xls', '.xlsx'],
    },
    // 文件回显列表
    fileRecordList: {
      type: Array,
      default: () => [],
    },
    // 显示图片
    isPicture: {
      type: Boolean,
      default: false,
    },
    // 显示上传中
    showLoading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      listObj: {},
      // 文件列表
      fileList: [],
      // 最大文件数
      // limitNum: 1,
      // 实际可上传的文件数
      newLimitNum: null,
      // 图片预览
      srcList: [],

      dialogImageUrl: '',
      dialogVisible: false,
    }
  },
  watch: {
    fileRecordList: {
      deep: true,
      handler(newValue, oldVal) {
        // console.log("newValue: ", newValue);
        // console.log(" this.limitNum: ", this.limitNum);
        if (this.btnType === 'primary') {
          this.newLimitNum = this.limitNum - newValue.length
        } else if (this.btnType === 'plus') {
          this.newLimitNum = this.limitNum
        }
        // console.log('this.newLimitNum: ', this.newLimitNum)
      },
    },
  },
  created() {
    this.newLimitNum = this.limitNum - this.fileRecordList.length
  },
  methods: {
    handleRemoveImg(file, list) {},
    handlePictureCardPreview(file) {
      // console.log("file: ", file);
      this.dialogImageUrl = file
      this.dialogVisible = true
    },
    handleClick(file) {
      this.handlePictureCardPreview(file)
      // console.log("点击了图片:", file);
      // 在这里可以添加你想要执行的操作
    },
    // 删除文件
    deleteFileItem(index, item) {
      this.$confirm('确定删除此文件？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        beforeClose: async (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '删除中...'
            // 删除文件
            this.$emit('deleteFile', item)
            this.$emit('deleteFilePlus', {
              index: index,
              bigObjIndex: this.index,
              item: item,
            })
            // console.log("this.btnType", this.btnType);
            if (this.btnType === 'primary') {
              this.fileRecordList.splice(index, 1)
            }
            // TODO: 删除oss文件
            if (this.btnType === 'plus') {
              this.fileList.splice(index, 1)
              this.srcList.splice(index, 1)
            }
            // console.log("this.srcList: ", this.srcList);
            instance.confirmButtonLoading = false
            await done()
          } else {
            await done()
          }
        },
      })
    },

    // 截取文件名称
    getFileName(fileUrl) {
      return fileUrl.split('/')[fileUrl.split('/').length - 1]
    },
    // 清除文件列表
    clearFileList() {
      this.fileList = []
    },
    // 上传文件前校验文件格式
    handleBeforeUpload(file) {
      // 校检文件类型
      if (this.fileType) {
        const fileName = file.name.split('.')
        const fileExt = '.' + fileName[fileName.length - 1]
        const isTypeOk = this.fileType.indexOf(fileExt) >= 0
        if (!isTypeOk) {
          this.$modal.msgError(
            `文件格式不正确, 请上传${this.fileType.join('/')}格式文件!`
          )
          return false
        }
      }
      if (this.showLoading) {
        this.$modal.loading('上传中，请稍候...')
      }
      return true
    },
    checkAllSuccess() {
      return Object.keys(this.listObj).every(
        (item) => this.listObj[item].hasSuccess
      )
    },
    //
    handleSubmit() {
      const arr = Object.keys(this.listObj).map((v) => this.listObj[v])
      if (!this.checkAllSuccess()) {
        this.$message('请等待所有图片上传成功。 如有问题，请刷新页面重新上传！')
        return
      }
      this.$emit('successCBK', arr)
      this.listObj = {}
      this.fileList = []
    },

    handleExceed(files, fileList) {
      this.$message.warning(`当前限制选择 ${this.limitNum} 个文件`)
    },

    // 删除文件时触发
    handleRemove(file, fileList) {
      // console.log("==============", file, fileList);
      this.$emit('deleteFile', file)
    },

    // 删除文件前触发
    // beforeRemove(file, fileList) {
    //   return this.$confirm(`确定移除 ${file.name}？`)
    // },

    // 文件上传
    upload(e) {
      // console.log("e", e);
      if (!this.sign.host) {
        console.warn('sign为空')
      }
      // 调用oss上传文件
      const file = e.file
      const fileName = `${new Date().getTime()}-${file.name}`
      const host = this.sign.host
      const signature = this.sign.signature
      const ossAccessKeyId = this.sign.accessId
      const policy = this.sign.policy
      // let arr = file.type.split('/')
      // let suffix = arr[arr.length - 1]
      const key = this.sign.dir + fileName

      let formData = new FormData()
      formData.append('OSSAccessKeyId', ossAccessKeyId)
      formData.append('policy', policy)
      formData.append('signature', signature)
      formData.append('key', key)
      formData.append('success_action_status', 200)
      formData.append('file', file)

      // axios.create({})
      axios
        .post(host, formData)
        .then((res) => {
          // console.log("res: ", res);
          if (res.status === 200) {
            // console.log("formData: ", formData);

            this.srcList.push(host + '/' + key)
            // console.log(" this.srcList: ", this.srcList);
            this.$emit('getFileUrl', host + '/' + key)
            this.$emit('getFileUrlAndIndex', {
              url: host + '/' + key,
              index: this.index,
            })
            this.$emit('getFileName', file.name)
          }
        })
        .catch((err) => {
          console.log('err', err)
        })
    },

    // 文件上传成功时触发
    handleSuccess(response, file) {
      const uid = file.uid
      const objKeyArr = Object.keys(this.listObj)
      for (let i = 0, len = objKeyArr.length; i < len; i++) {
        if (this.listObj[objKeyArr[i]].uid === uid) {
          this.listObj[objKeyArr[i]].url = response.files.file
          this.listObj[objKeyArr[i]].hasSuccess = true
          return
        }
      }
    },
  },
}
</script>

<style lang="scss" scoped>
$plus-width: 50px;

.file-item {
  display: flex;
  padding: 0 10px;
  width: 400px;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;

  &:hover {
    background-color: #f5f7fa;
  }
}

.plus-box {
  display: flex;
  align-items: center;
}

.file-item-plus-box {
  display: flex;
  // width: 400px;
  align-items: center;
  font-size: 14px;
}

.file-item-plus {
  display: flex;
  padding: 0 10px;
  // width: 400px;
  // border: 1px solid #4f5256;
  align-items: center;
  font-size: 14px;

  &:hover {
    background-color: #f5f7fa;
    cursor: pointer;
  }
}

.plus-display-none {
  ::v-deep .el-upload-list {
    display: none;
  }

  .upload-demo {
    display: flex;
    align-items: center;
  }
}
</style>
