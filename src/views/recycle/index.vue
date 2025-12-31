<template>
  <div class="content">
    <!-- 搜索 -->
    <div class="page-search">
      <el-form class="page-search" inline ref="page-filter">
        <el-form-item label="关键字搜索：" style="margin-right: 20px;">
          <el-input placeholder="请输入关键字" v-model="reqParams.keywords" class="handle-input"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="getList()">搜索</el-button>
        </el-form-item>
        <br />
        <el-form-item>
          <el-button type="primary" plain icon="el-icon-delete" @click="removeRecycle">删除</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table
      ref="multipleTable"
      :data="recycleList "
      tooltip-effect="dark"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="name" label="文件名" align="center" width="280"></el-table-column>
      <el-table-column prop="url" label="文件路径" align="center">
        <template v-slot="{row}">
          <a :href="row.url">{{row.url}}</a>
        </template>
      </el-table-column>
      <el-table-column prop="deleteTime" label="删除时间" align="center" width="200"></el-table-column>
    </el-table>
    <!-- 分页 -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="reqParams.pageNum"
      :limit.sync="reqParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { deleteRecycle, getList } from '@/api/recycle/recycle'
export default {
  name: 'Recycle',
  data() {
    return {
      reqParams: {
        keywords: '',
        pageNum: 1,
        pageSize: 20,
      },
      total: 0,
      // 数据列表
      recycleList: [],

      removeIds: [],
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 选中数据列表
    handleSelectionChange(val) {
      console.log('数据', val)
      this.removeIds = []
      val.forEach((item) => {
        this.removeIds.push(item.id)
      })
      console.log('ids', this.removeIds)
    },
    // 获取文件数据列表
    async getList() {
      const res = await getList(this.reqParams)
      this.total = res.data.total
      this.recycleList = res.data.records

      console.log('ressss', res)
    },
    // 删除文件
    removeRecycle() {
      this.$to(
        this.$confirm('文件删除将无法找回，确认删除？', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          beforeClose: async (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true
              instance.confirmButtonText = '删除中...'
              await deleteRecycle(this.removeIds)
              instance.confirmButtonLoading = false
              await done()
              await this.getList()
              this.$message({
                type: 'success',
                message: '删除成功！',
              })
            } else {
              await done()
            }
          },
        })
      )
    },
  },
}
</script>

<style scoped>
.content {
  padding: 40px;
}
</style>