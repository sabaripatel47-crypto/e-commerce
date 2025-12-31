<template>
  <div>首页</div>
</template>

<script>
import { getFilePush } from '../api/index'

export default {
  data() {
    return {
      fileList: [],
    }
  },
  created() {
    this.getFilePushList()
  },
  methods: {
    async getFilePushList() {
      let that = this
      const res = await getFilePush()
      if (res.data.new_files.length > 0) {
        this.fileList = res.data.new_files
        this.fileList.forEach((item) => {
          this.$notify.info({
            title: '消息',
            message: '您有一个新的文件待查看',
            position: 'bottom-right',
            onClick() {
              that.$router.push('/information/department')
            },
          })
        })
      }
    },
  },
}
</script>

<style scoped lang="scss">
</style>

