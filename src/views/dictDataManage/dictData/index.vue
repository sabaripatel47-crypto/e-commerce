<template>
  <div class="dict_dictData">
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
      <el-table :data="dictDataList" max-height="480">
        <el-table-column type="index" label="序号" align="center" width="100"></el-table-column>
        <el-table-column prop="dictId" label="字典编号" align="center"></el-table-column>
        <el-table-column prop="dictName" label="字典名称" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="enterprise" label="字典值" align="center" show-overflow-tooltip>
          <template v-slot="{row}">
            <span v-for="item in row.dictValue">
              <span v-if="item === row.dictValue[row.dictValue.length - 1]">{{ item }}</span>
              <span v-else>{{ item + '、' }}</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="state" label="字典状态" align="center">
          <template v-slot="{row}">
            <span>{{ row.state === '0' ? '关闭' : '正常' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" align="center">
          <template v-slot="{row}">
            <el-button size="mini" type="text" icon="el-icon-edit" @click="editDictData(row)">修改</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="deleteDictData(row.dictId)"
            >删除</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-view"
              @click="getDictDataDetail(row.dictId)"
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
    <el-dialog title="字典详情" :visible="showDetail" @close="showDetail = false" width="40%">
      <el-descriptions :column="1">
        <el-descriptions-item label="字典编号">{{ detailList.dictId }}</el-descriptions-item>
        <el-descriptions-item label="字典名称">{{ detailList.dictName }}</el-descriptions-item>
        <el-descriptions-item label="字典值">
          <template>
            <span v-for="item in detailList.dictValue">
              <span v-if="item === detailList.dictValue[detailList.dictValue.length - 1]">{{ item }}</span>
              <span v-else>{{ item + '、' }}</span>
            </span>
          </template>
        </el-descriptions-item>
        <el-descriptions-item label="字典状态">{{ detailList.status === 0 ? '停用' : '正常' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script>
import {
  getDictDataList,
  dictDataDetail,
  deleteDictData,
} from '@/api/dict/dict'
import Dialog from './components/Dialog.vue'
export default {
  name: 'DictData',
  components: {
    Dialog,
  },
  data() {
    return {
      total: 0,
      showDetail: false,
      dictDataList: [],
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
      const res = await getDictDataList(this.reqParams)
      this.dictDataList = res.data.records
      this.total = res.data.total
      // console.log(this.dictDataList)
    },
    // 新增
    addList() {
      this.showAddDialog = true
    },
    // 修改
    async editDictData(row) {
      this.showAddDialog = true
      this.row = row
      console.log('row', this.row)
    },
    // 详情
    async getDictDataDetail(id) {
      this.showDetail = true
      const res = await dictDataDetail(id)
      this.detailList = res.data
    },
    // 删除
    deleteDictData(id) {
      this.$to(
        this.$confirm('确定删除此字典？', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          beforeClose: async (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true
              instance.confirmButtonText = '删除中...'
              await deleteDictData(id)
              instance.confirmButtonLoading = false
              await done()
              await this.getList()
              this.$message({
                type: 'success',
                message: '删除字典成功！',
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
.dict_dictData {
  padding: 40px;
}
</style>