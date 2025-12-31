<template>
  <div class="page">
    <div class="container">
      <!-- 数据列表 -->
      <el-table style="width: 100%" max-height="500" :data="tableData" v-loading="loading">
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
            <span>{{ row.complete === 0 ? '已完成' : '待处理' }}</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="reqParams.page"
        :limit.sync="reqParams.pageSize"
        @pagination="getDataList"
      />
    </div>
  </div>
</template>

<script>
import { getDetailList } from '@/api/targetManage/targetMade'
export default {
  name: 'TargetDetail',
  data() {
    return {
      loading: false,
      tableData: [],
      total: 0,
      reqParams: {
        page: 1,
        pageSize: 20,
        userUuid: this.$route.query.userUuid,
      },
    }
  },
  created() {
    this.getDataList()
  },
  methods: {
    async getDataList() {
      this.loading = true
      const res = await getDetailList(this.reqParams)
      this.tableData = res.data.records
      this.total = res.data.total
      this.loading = false
    },
  },
}
</script>

<style scoped>
.page {
  padding: 40px;
}
</style>