<template>
  <div class="page">
    <div>
      <el-button
        type="primary"
        plain
        @click="goDistribute"
        style="margin-bottom: 10px;"
        :disabled="showDistribute"
      >任务分发</el-button>
    </div>
    <div class="container">
      <!-- 数据列表 -->
      <el-table
        style="width: 100%"
        max-height="600"
        :data="tableData"
        @selection-change="handleChange"
        v-loading="loading"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column type="index" align="center" label="序号" width="70"></el-table-column>
        <el-table-column align="center" label="链接用户姓名" prop="userName"></el-table-column>
        <el-table-column align="center" label="详情页（套）" prop="detailsPage"></el-table-column>
        <el-table-column align="center" label="主图" prop="mainImage"></el-table-column>
        <el-table-column align="center" label="日常图" prop="image"></el-table-column>
        <el-table-column align="center" label="主图短视频" prop="imageVideo"></el-table-column>
        <el-table-column align="center" label="开箱短视频" prop="video"></el-table-column>
        <el-table-column align="center" label="店铺装修" prop="storeDecora"></el-table-column>
        <el-table-column align="center" label="店铺直播" prop="storeStream"></el-table-column>
        <el-table-column align="center" label="状态" prop="complete">
          <template v-slot="{row}">
            <span>{{ row.complete === 1 ? '已完成' : '待处理' }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作">
          <template v-slot="{row}">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-view"
              @click="getDetail(row.userUuid)"
            >详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { getDataList, distributeDemand } from '@/api/targetManage/targetMade'
export default {
  name: 'TargetMade',
  data() {
    return {
      // 列表数据
      tableData: [],
      loading: false,
      // 分发任务选中的ids
      selectIds: [],
      // 控制任务分发按钮
      showDistribute: true,
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    // 获取列表数据
    async getTableData() {
      this.loading = true
      const res = await getDataList()
      this.tableData = res.data
      this.loading = false
      // console.log('res', res)
    },

    // 详情
    async getDetail(uuid) {
      this.$router.push({
        path: '/targetMade/detailPage',
        query: { userUuid: uuid },
      })
    },

    // 多选的值发生变化
    handleChange(val) {
      this.selectIds = []
      if (val.length > 0) {
        this.showDistribute = false
        val.forEach((item) => {
          this.selectIds.push(item.userUuid)
        })
        console.log('12344', this.selectIds)
      } else {
        this.showDistribute = true
      }
    },

    // 任务分发
    async goDistribute() {
      this.$to(
        this.$confirm('确定分发？', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          beforeClose: async (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true
              instance.confirmButtonText = '分发中...'
              const res = await distributeDemand(this.selectIds)
              instance.confirmButtonLoading = false
              await done()
              await this.getTableData()
              this.$message({
                type: 'success',
                message: '请求成功！',
              })
            } else {
              await done()
            }
          },
        })
      )
      console.log(123)
    },
  },
}
</script>

<style scoped>
.page {
  padding: 40px;
}
</style>