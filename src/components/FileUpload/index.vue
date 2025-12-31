<template>
  <div class="upload-file">
    <el-upload
      :multiple="false"
      drag
      action
      :accept="fileType.join(',')"
      :file-list="fileList"
      :show-file-list="true"
      :limit="limit"
      :before-upload="handleBeforeUpload"
      :on-error="handleUploadError"
      :on-exceed="handleExceed"
      :http-request="upload"
      class="upload-file-uploader"
      ref="fileUpload"
    >
      <!-- 上传按钮 -->
      <!-- <el-button size="mini" type="primary">选取文件</el-button> -->

      <i class="el-icon-upload"></i>
      <div class="el-upload__text">
        将文件拖到此处，或
        <em>点击上传</em>
      </div>

      <!-- 上传提示 -->
      <!-- <div class="el-upload__tip" slot="tip" v-if="showTip">
        请上传
        <template v-if="fileSize">
          大小不超过
          <b style="color: #f56c6c">{{ fileSize }}MB</b>
        </template>
        <template v-if="fileType">
          格式为
          <b style="color: #f56c6c">{{ fileType.join("/") }}</b>
        </template>
        的文件
      </div>-->
    </el-upload>
  </div>
</template>

<script>
export default {
  name: 'FileUpload',
  props: {
    // 值
    value: [String, Object, Array],
    // 数量限制
    limit: {
      type: Number,
      default: 1,
    },
    // 大小限制(MB)
    // fileSize: {
    //   type: Number,
    //   default: 5,
    // },
    // 文件类型, 例如['png', 'jpg', 'jpeg']
    fileType: {
      type: Array,
      default: () => ['.xls', '.xlsx'],
    },
    // 是否显示提示
    // showTip: {
    //   type: Boolean,
    //   default: true,
    // },
  },
  data() {
    return {
      uploadList: [],
      fileList: [],
      fileData: {}, // 当前上传的文件
      showTip: false,
    }
  },
  methods: {
    // 上传文件前校验文件格式
    handleBeforeUpload(file) {
      // 校检文件类型
      if (this.fileType) {
        const fileName = file.name.split('.')
        const fileExt = '.' + fileName[fileName.length - 1]
        const isTypeOk = this.fileType.indexOf(fileExt) >= 0
        if (!isTypeOk) {
          this.$modal.msgError(
            `文件格式不正确, 请上传${this.fileType}格式文件!`
          )
          return false
        }
      }
      return true
    },
    // 清除文件列表
    clearFileList() {
      this.fileList = []
    },
    // 上传
    upload(file) {
      this.fileData = file
      this.$emit('getUploadFile', file)
    },
    // 文件个数超出
    handleExceed() {
      this.$modal.msgError(`上传文件数量不能超过 ${this.limit} 个!`)
    },
    // 上传失败
    handleUploadError(err) {
      this.$modal.msgError('上传文件失败，请重试')
      this.$modal.closeLoading()
    },
    // 删除文件
    handleDelete(index) {
      this.fileList.splice(index, 1)
      this.$emit('input', this.listToString(this.fileList))
    },
    // 获取文件名称
    getFileName(name) {
      if (name.lastIndexOf('/') > -1) {
        return name.slice(name.lastIndexOf('/') + 1)
      } else {
        return ''
      }
    },
    // 对象转成指定字符串分隔
    listToString(list, separator) {
      let strs = ''
      separator = separator || ','
      for (let i in list) {
        strs += list[i].url + separator
      }
      return strs != '' ? strs.substr(0, strs.length - 1) : ''
    },
  },
}
</script>

<style scoped lang="scss">
.upload-file {
  width: 25vw;
}
.upload-file-uploader {
  margin-bottom: 5px;
}
.upload-file-list .el-upload-list__item {
  border: 1px solid #e4e7ed;
  line-height: 2;
  margin-bottom: 10px;
  position: relative;
}
.upload-file-list .ele-upload-list__item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: inherit;
}
.ele-upload-list__item-content-action .el-link {
  margin-right: 10px;
}
</style>