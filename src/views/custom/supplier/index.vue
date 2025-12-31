<template>
  <div class="baseData_supplier">
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
      <el-table :data="supplierList" style="width: 100%" max-height="600">
        <el-table-column
          align="center"
          show-overflow-tooltip
          type="index"
          fixed="left"
          fit
          label="序号"
          width="70"
        ></el-table-column>
        <el-table-column align="center" show-overflow-tooltip prop="code" label="供应商编码" min-width="120"></el-table-column>
        <el-table-column align="center" show-overflow-tooltip prop="name" label="供应商名称" min-width="120"></el-table-column>
        <el-table-column
          align="center"
          show-overflow-tooltip
          prop="contacts"
          label="供应商联系人"
          width="120"
        ></el-table-column>
        <el-table-column
          align="center"
          show-overflow-tooltip
          prop="area"
          label="供应商所在地"
          min-width="120"
        ></el-table-column>
        <el-table-column
          align="center"
          show-overflow-tooltip
          prop="address"
          label="供应商详细地址"
          min-width="120"
        ></el-table-column>
        <el-table-column
          align="center"
          show-overflow-tooltip
          prop="contactNumber"
          label="联系方式"
          width="120"
        ></el-table-column>
        <el-table-column
          align="center"
          show-overflow-tooltip
          prop="level"
          label="供应商等级"
          width="120"
        ></el-table-column>
        <el-table-column
          align="center"
          show-overflow-tooltip
          prop="appraise"
          label="供应商评价"
          width="120"
        ></el-table-column>
        <el-table-column
          align="center"
          show-overflow-tooltip
          prop="leader"
          label="跟进负责人"
          width="120"
        ></el-table-column>
        <!-- <el-table-column
          prop="wechatName"
          label="微信名称"
          width="120"
          align="center"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="businessTypeName"
          label="客户类型"
          width="120"
          align="center"
          show-overflow-tooltip
        ></el-table-column> -->
        <!-- <el-table-column
          prop="information"
          label="客户资料"
          width="120"
          align="center"
          show-overflow-tooltip
        >
          <template v-slot="{row}">
            <el-button type="text" @click="viewInfo(row.information)">查看客户资料</el-button>
          </template>
        </el-table-column>
        <el-table-column
          prop="agreement"
          label="合作协议"
          width="120"
          align="center"
          show-overflow-tooltip
        >
          <template v-slot="{row}">
            <el-button type="text" @click="viewInfo(row.agreement)">查看合作协议</el-button>
          </template>
        </el-table-column> -->
        <el-table-column label="操作" align="center" fixed="right" min-width="200">
          <template v-slot="{row}">
            <el-button size="mini" type="text" icon="el-icon-edit" @click="editSupplier(row)">修改</el-button>
            <!-- <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="deleteSupplier(row.id)"
            >删除</el-button> -->
            <el-button
              size="mini"
              type="text"
              icon="el-icon-view"
              @click="getSupplierDetail(row.id)"
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
    <el-dialog title="供应商详情" :visible="showDetail" @close="showDetail = false" width="40%">
      <el-descriptions :column="2">
        <el-descriptions-item label="供应商编码">{{ detailList.code }}</el-descriptions-item>
        <el-descriptions-item label="供应商名称">{{ detailList.name }}</el-descriptions-item>
        <el-descriptions-item label="供应商联系人">{{ detailList.contacts }}</el-descriptions-item>
        <el-descriptions-item label="供应商所在地">{{ detailList.area }}</el-descriptions-item>
        <el-descriptions-item label="供应商详细地址">{{ detailList.address }}</el-descriptions-item>
        <el-descriptions-item label="联系方式">{{ detailList.contactNumber}}</el-descriptions-item>
        <el-descriptions-item label="供应商等级">{{ detailList.level }}</el-descriptions-item>
        <el-descriptions-item label="供应商评价">{{ detailList.appraise }}</el-descriptions-item>
        <el-descriptions-item label="跟进负责人">{{ detailList.leader }}</el-descriptions-item>
        <!-- <el-descriptions-item label="供应商资料">
          <div>
            <div
              style="color: rgb(102, 153, 231)"
              v-for="item in detailList.information"
            >{{ item.split('.com/')[1] }}</div>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="合作协议">
          <div>
            <div
              style="color: rgb(102, 153, 231)"
              v-for="item in detailList.agreement"
            >{{ item.split('.com/')[1]}}</div>
          </div>
        </el-descriptions-item> -->
      </el-descriptions>
    </el-dialog>
    <!-- 下载资料页详情 -->
    <el-dialog title="点击下载文件" :visible="showDownload" @close="showDownload = false" width="40%">
      <div v-if="infoList.length > 0 && infoList[0] !== ''">
        <div
          style="margin-bottom: 10px;font-size: 16px;"
          v-for="item,index in infoList"
          :key="item"
        >
          文件{{index+1}}:
          <span
            @click="downloadInfo(item)"
            style="padding:0 5px;color: rgb(102, 153, 231);cursor: pointer;"
          >{{ item.split('.com/')[1] }}</span>
          <i @click="downloadInfo(item)" style="color:rgb(82, 141, 231);" class="el-icon-download"></i>
        </div>
      </div>
      <div v-else class="noFile">
        <span>暂无文件</span>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getSupplierList,
  supplierDetail,
  deleteSupplier,
} from '@/api/customer/supplier'
import Dialog from './components/Dialog.vue'
export default {
  name: 'Supplier',
  components: {
    Dialog,
  },
  data() {
    return {
      total: 0,
      showDetail: false,
      supplierList: [],
      showAddDialog: false,
      row: {},
      detailList: {},
      reqParams: {
        keywords: '',
        pageNum: 1,
        pageSize: 20,
      },
      // 下载资料信息
      infoList: [],

      // 下载页面详情
      showDownload: false,
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 查看客户信息
    viewInfo(row) {
      if (row.length > 0) {
        console.log(row)
        this.infoList = row
        this.showDownload = true
      } else {
        this.$message.warning('暂未上传文件')
      }
    },
    // 下载文件
    downloadInfo(item) {
      console.log(item)
      window.location.href = item
      this.$message.success(`下载文件(${item.split('.com/')[1]})成功`)
    },
    // 清空数据
    clearRow() {
      this.row = {}
    },
    // 获取列表信息
    async getList() {
      const res = await getSupplierList(this.reqParams)
      this.supplierList = res.data.records
      this.total = res.data.total
      // console.log(this.supplierList)
    },
    // 新增
    addList() {
      this.showAddDialog = true
    },
    // 修改
    async editSupplier(row) {
      this.showAddDialog = true
      this.row = row
      console.log('row', this.row)
    },
    // 详情
    async getSupplierDetail(id) {
      this.showDetail = true
      const res = await supplierDetail(id)
      this.detailList = res.data
      this.detailList.area = this.detailList.area.join(',')
      console.log('详情', this.detailList.information)
    },
    // 删除
    deleteSupplier(id) {
      this.$to(
        this.$confirm('确定删除此供应商？', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          beforeClose: async (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true
              instance.confirmButtonText = '删除中...'
              await deleteSupplier(id)
              instance.confirmButtonLoading = false
              await done()
              await this.getList()
              this.$message({
                type: 'success',
                message: '删除供应商成功！',
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
.baseData_supplier {
  padding: 40px;
}
.noFile {
  text-align: center;
  font-size: 20px;
}
</style>
