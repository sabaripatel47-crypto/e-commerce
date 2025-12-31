<template>
  <div class="baseData_store">
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
          <el-button type="primary" plain icon="el-icon-plus" @click="addList()">新增</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="container">
      <!-- 表格 -->
      <el-table :data="storeList" style="width: 100%" max-height="600">
        <el-table-column type="index" label="序号" width="70" align="center"></el-table-column>
        <el-table-column prop="code" label="店铺编号" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="name" label="店铺名称" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="platform" label="所属平台" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="enterprise" label="所属公司" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="scale" label="店铺规模" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="state" label="店铺状态" align="center">
          <template v-slot="{row}">
            <span>{{ row.state === '0' ? '正常' : '关闭' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="manager" label="店铺负责人" align="center" width="120"></el-table-column>
        <el-table-column prop="level" label="店铺级别" align="center" width="120"></el-table-column>
        <el-table-column prop="brand" label="品牌" align="center" width="120"></el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template v-slot="{row}">
            <el-button size="mini" type="text" icon="el-icon-edit" @click="editStore(row)">修改</el-button>
            <el-button size="mini" type="text" icon="el-icon-delete" @click="deleteStore(row.id)">删除</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-view"
              @click="getStoreDetail(row.id)"
            >详情</el-button>
          </template>
        </el-table-column>
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
    <!-- 新增弹层 -->
    <Dialog v-if="showAddDialog" :row.sync="row" :showAddDialog.sync="showAddDialog"></Dialog>
    <!-- 详情弹层 -->
    <el-dialog title="店铺详情" :visible="showDetail" @close="showDetail = false" width="40%">
      <el-descriptions :column="2">
        <el-descriptions-item label="店铺编号">{{ detailList.code }}</el-descriptions-item>
        <el-descriptions-item label="店铺名称">{{ detailList.name }}</el-descriptions-item>
        <el-descriptions-item label="所属平台">{{ detailList.platform }}</el-descriptions-item>
        <el-descriptions-item label="所属公司">{{ detailList.enterprise }}</el-descriptions-item>
        <el-descriptions-item label="店铺规模">{{ detailList.scale }}</el-descriptions-item>
        <el-descriptions-item label="店铺状态">{{ detailList.state === '0' ? '正常' : '关闭' }}</el-descriptions-item>
        <el-descriptions-item label="店铺负责人">{{ detailList.manager }}</el-descriptions-item>
        <el-descriptions-item label="店铺级别">{{ detailList.level }}</el-descriptions-item>
        <el-descriptions-item label="品牌">{{ detailList.brand }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script>
import { getStoreList, storeDetail, deleteStore } from '@/api/baseData/store'
import Dialog from './components/Dialog'
export default {
  name: 'Store',
  components: {
    Dialog,
  },
  data() {
    return {
      total: 0,
      showDetail: false,
      storeList: [],
      showAddDialog: false,
      row: {},
      detailList: {},
      reqParams: {
        keywords: '',
        pageNum: 1,
        pageSize: 20,
      },
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 清空数据
    clearRow() {
      this.row = {}
    },

    // 获取列表信息
    async getList() {
      const res = await getStoreList(this.reqParams)
      this.storeList = res.data.records
      this.total = res.data.total
      // console.log(this.storeList)
    },

    // 新增
    addList() {
      this.showAddDialog = true
    },

    // 修改
    async editStore(row) {
      this.row = row
      console.log('row', this.row)
      this.showAddDialog = true
    },

    // 详情
    async getStoreDetail(id) {
      this.showDetail = true
      const res = await storeDetail(id)
      this.detailList = res.data
    },

    // 删除
    deleteStore(id) {
      this.$to(
        this.$confirm('确定删除此店铺？', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          beforeClose: async (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true
              instance.confirmButtonText = '删除中...'
              await deleteStore(id)
              instance.confirmButtonLoading = false
              await done()
              await this.getList()
              this.$message({
                type: 'success',
                message: '删除店铺成功！',
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
.baseData_store {
  padding: 40px;
}
</style>