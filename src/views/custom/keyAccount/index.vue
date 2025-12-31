<template>
  <div class="baseData_bigCustomer">
    <!-- 搜索 -->
    <div class="page-search">
      <el-form class="page-search" inline ref="page-filter">
        <el-form-item label="关键字搜索：" style="margin-right: 20px">
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
      <el-table :data="bigCustomerList" fit style="width: 100%" max-height="600">
        <el-table-column
          type="index"
          fixed="left"
          label="序号"
          width="70"
          align="center"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="code"
          label="公司信用编码"
          min-width="120"
          align="center"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="name"
          label="客户名称"
          min-width="120"
          align="center"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="contacts"
          label="客户联系人"
          width="120"
          align="center"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="area"
          label="客户所在地"
          min-width="120"
          align="center"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="address"
          label="客户详细地址"
          width="120"
          align="center"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="contactNumber"
          label="联系方式"
          width="120"
          align="center"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column prop="level" label="客户等级" width="120" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column
          prop="appraise"
          label="客户评价"
          width="120"
          align="center"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="leader"
          label="跟进负责人"
          width="120"
          align="center"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
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
        ></el-table-column>
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
<el-table-column prop="agreement" label="合作协议" width="120" align="center" show-overflow-tooltip>
  <template v-slot="{row}">
            <el-button type="text" @click="viewInfo(row.agreement)">查看合作协议</el-button>
          </template>
        </el-table-column>-->
        <el-table-column fixed="right" align="center" label="操作" min-width="200">
          <template v-slot="{ row }">
            <el-button size="mini" type="text" icon="el-icon-edit" @click="editBigCustomer(row)">修改</el-button>
            <!-- <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="deleteBigCustomer(row.id)"
            >删除</el-button>-->
            <el-button
              size="mini"
              type="text"
              icon="el-icon-view"
              @click="getBigCustomerDetail(row.uuid)"
            >详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="reqParams.pageNum"
        :limit.sync="reqParams.pageSize"
        @pagination="getList"
      />
    </div>
    <!-- 新增弹层 -->
    <Dialog v-if="showAddDialog" :row.sync="row" :showAddDialog.sync="showAddDialog"></Dialog>
    <!-- 详情弹层 -->
    <el-dialog title="客户详情" :visible="showDetail" @close="showDetail = false" width="40%">
      <el-descriptions :column="1">
        <el-descriptions-item label="公司信用编码">
          {{
          detailList.code
          }}
        </el-descriptions-item>
        <el-descriptions-item label="客户名称">
          {{
          detailList.name
          }}
        </el-descriptions-item>
        <el-descriptions-item label="客户联系人">
          {{
          detailList.contacts
          }}
        </el-descriptions-item>
        <el-descriptions-item label="客户所在地">
          {{
          detailList.area
          }}
        </el-descriptions-item>
        <el-descriptions-item label="客户详细地址">
          {{
          detailList.address
          }}
        </el-descriptions-item>
        <el-descriptions-item label="联系方式">
          {{
          detailList.contactNumber
          }}
        </el-descriptions-item>
        <el-descriptions-item label="客户等级">
          {{
          detailList.level
          }}
        </el-descriptions-item>
        <el-descriptions-item label="客户评价">
          {{
          detailList.appraise
          }}
        </el-descriptions-item>
        <el-descriptions-item label="跟进负责人">
          {{
          detailList.leader
          }}
        </el-descriptions-item>
        <el-descriptions-item label="微信名称">
          {{
          detailList.wechatName
          }}
        </el-descriptions-item>
        <el-descriptions-item label="客户类型">
          {{
          detailList.businessTypeName
          }}
        </el-descriptions-item>

        <el-descriptions-item label="图片">
          <div v-for="(item, index) in detailList.bigUrlUuidVOS" :key="index" class="preview-style">
            <div class="preview-img">
              <el-image
                style="width: 100px; height: 100px"
                :src="item.url"
                :preview-src-list="[item.url]"
              ></el-image>
            </div>
          </div>
        </el-descriptions-item>
      </el-descriptions>

      <div class="dialog-footer-close">
        <el-button @click="showDetail = false">关闭</el-button>
      </div>
    </el-dialog>
    <!-- 下载资料页详情 -->
    <el-dialog title="点击下载文件" :visible="showDownload" @close="showDownload = false" width="40%">
      <div
        style="margin-bottom: 10px; font-size: 16px"
        v-for="(item, index) in infoList"
        :key="item"
      >
        文件{{ index + 1 }}:
        <span
          @click="downloadInfo(item)"
          style="padding: 0 5px; color: rgb(102, 153, 231); cursor: pointer"
        >
          {{
          item.split(".com/")[1] }}
        </span>
        <i @click="downloadInfo(item)" style="color: rgb(82, 141, 231)" class="el-icon-download"></i>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getBigCustomerList,
  bigCustomerDetail,
  deleteBigCustomer,
} from '@/api/customer/bigCustomer'

import Dialog from './components/Dialog'
export default {
  name: 'KeyAccount',
  components: {
    Dialog,
  },
  data() {
    return {
      previewSrcList: [],
      total: 0,
      showDetail: false,
      bigCustomerList: [],
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
      const res = await getBigCustomerList(this.reqParams)
      this.bigCustomerList = res.data.records
      this.total = res.data.total
      // console.log(this.bigCustomerList)
    },
    // 新增
    addList() {
      this.showAddDialog = true
    },
    // 修改
    async editBigCustomer(row) {
      this.showAddDialog = true
      this.row = row
    },
    // 详情
    async getBigCustomerDetail(id) {
      console.log('id: ', id)
      this.showDetail = true
      const res = await bigCustomerDetail(id)
      this.detailList = res.data
      console.log('this.detailList: ', this.detailList)
      this.detailList.area = this.detailList.area.join(',')
      this.previewSrcList = this.detailList.bigUrlUuidVOS.map((item) => {
        return item.url
      })
    },
    // 删除
    deleteBigCustomer(id) {
      console.log('id: ', id)
      this.$to(
        this.$confirm('确定删除此客户？', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          beforeClose: async (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true
              instance.confirmButtonText = '删除中...'
              await deleteBigCustomer(id)
              instance.confirmButtonLoading = false
              await done()
              await this.getList()
              this.$message({
                type: 'success',
                message: '删除客户成功！',
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

<style scoped lang="scss">
.baseData_bigCustomer {
  padding: 40px;
}

// ::v-deep {
//   .el-descriptions-item__content {
//     display: flex;
//     flex-direction: column;
//   }
// }

.preview-style {
  .preview-img {
    margin: 0 4px;

    ::v-deep .el-descriptions-item__content {
      display: flex;
      flex-direction: row !important;
    }
  }
}

.dialog-footer-close {
  // border: 1px solid red;
  display: flex;
  justify-content: flex-end;
}
</style>
