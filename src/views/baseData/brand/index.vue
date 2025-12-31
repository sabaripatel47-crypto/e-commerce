<template>
  <div class="baseData_brand">
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
      <el-table :data="brandList" style="width: 100%" max-height="600">
        <el-table-column type="index" label="序号" width="70" align="center"></el-table-column>
        <el-table-column prop="name" label="商标名称" width="120" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="enterprise" label="所属公司" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="trademarkNumber" label="商标号" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column
          prop="trademarkPicture"
          label="商标证图片"
          align="center"
          width="100"
          show-overflow-tooltip
        >
          <template v-slot="{row}">
            <img
              @click="amplifyPicture(row.trademarkPicture)"
              v-if="row.trademarkPicture"
              width="30"
              height="30"
              :src="row.trademarkPicture"
              alt
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="applicationTime"
          label="申请日期"
          width="120"
          align="center"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="endTime"
          label="到期日期"
          width="120"
          align="center"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column prop="surplusDate" label="剩余天数" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column
          prop="contactPerson"
          label="商品对接人"
          align="center"
          width="100"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column prop="contacts" label="联系方式" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template v-slot="{row}">
            <el-button size="mini" type="text" icon="el-icon-edit" @click="editBrand(row)">修改</el-button>
            <el-button size="mini" type="text" icon="el-icon-delete" @click="deleteBrand(row.id)">删除</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-view"
              @click="getBrandDetail(row.id)"
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
    <el-dialog title="品牌详情" :visible="showDetail" @close="showDetail = false" width="40%">
      <el-descriptions :column="2">
        <el-descriptions-item label="商标名称">{{ detailList.name }}</el-descriptions-item>
        <el-descriptions-item label="所属公司">{{ detailList.enterprise }}</el-descriptions-item>
        <el-descriptions-item label="商标号">{{ detailList.trademarkNumber }}</el-descriptions-item>
        <el-descriptions-item label="商标证图片">
          <span
            v-if="detailList.trademarkPicture"
            @click="amplifyPicture(detailList.trademarkPicture)"
          >
            <img width="30" height="30" :src="detailList.trademarkPicture" alt />
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="申请日期">{{ detailList.applicationTime }}</el-descriptions-item>
        <el-descriptions-item label="到期日期">{{ detailList.endTime }}</el-descriptions-item>
        <el-descriptions-item label="剩余天数">{{ detailList.surplusDate }}</el-descriptions-item>
        <el-descriptions-item label="商品对接人">{{ detailList.level }}</el-descriptions-item>
        <el-descriptions-item label="联系方式">{{ detailList.contacts }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
    <!-- 图片展示弹层 -->
    <el-dialog :visible.sync="showPicture" width="40%">
      <img width="100%" :src="dialogImageUrl" alt />
    </el-dialog>
  </div>
</template>

<script>
import { getBrandList, brandDetail, deleteBrand } from '@/api/baseData/brand'
import Dialog from './components/Dialog'
export default {
  name: 'Brand',
  components: {
    Dialog,
  },
  data() {
    return {
      total: 0,
      showDetail: false,
      brandList: [],
      showAddDialog: false,
      // 图片放大弹层
      showPicture: false,
      // 图片弹层展示的地址
      dialogImageUrl: '',
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
    // 点开放大弹层
    amplifyPicture(url) {
      this.dialogImageUrl = url
      this.showPicture = true
    },
    // 清空数据
    clearRow() {
      this.row = {}
    },
    // 获取列表信息
    async getList() {
      const res = await getBrandList(this.reqParams)
      this.brandList = res.data.records
      this.total = res.data.total
      // console.log(this.brandList)
    },
    // 新增
    addList() {
      this.showAddDialog = true
    },
    // 修改
    async editBrand(row) {
      this.row = row
      this.showAddDialog = true
    },
    // 详情
    async getBrandDetail(id) {
      const res = await brandDetail(id)
      this.detailList = res.data
      this.showDetail = true
    },
    // 删除
    deleteBrand(id) {
      this.$to(
        this.$confirm('确定删除此品牌？', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          beforeClose: async (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true
              instance.confirmButtonText = '删除中...'
              await deleteBrand(id)
              instance.confirmButtonLoading = false
              await done()
              await this.getList()
              this.$message({
                type: 'success',
                message: '删除品牌成功！',
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
.baseData_brand {
  padding: 40px;
}
</style>