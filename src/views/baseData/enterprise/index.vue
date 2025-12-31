<template>
  <div class="baseData_enterprise">
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
      <el-table :data="enterpriseList" style="width: 100%" max-height="600">
        <el-table-column type="index" label="序号" width="70" align="center"></el-table-column>
        <el-table-column prop="name" label="公司名称" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="businessLicense" label="营业执照" align="center" show-overflow-tooltip>
          <template v-slot="{row}">
            <img
              @click="amplifyPicture(row.businessLicense)"
              v-if="row.businessLicense"
              width="30"
              height="30"
              :src="row.businessLicense"
              alt
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="address"
          label="现注册地址"
          width="100"
          align="center"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="corporatePhoneNumber"
          label="法人手机号码"
          width="100"
          align="center"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="shareholderPhoneNumber"
          label="股东手机号码"
          width="100"
          align="center"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="location"
          label="公司所在地"
          width="100"
          align="center"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="organizationalForm"
          label="企业组织形式"
          width="100"
          align="center"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="basicHouseholdPicture"
          label="基本户照片"
          width="100"
          align="center"
          show-overflow-tooltip
        >
          <template v-slot="{row}">
            <img
              @click="amplifyPicture(row.basicHouseholdPicture)"
              v-if="row.basicHouseholdPicture"
              width="30"
              height="30"
              :src="row.basicHouseholdPicture"
              alt
            />
          </template>
        </el-table-column>
        <el-table-column prop="basicHousehold" label="基本户" align="center"></el-table-column>
        <el-table-column prop="generalAccounts" label="一般户" align="center"></el-table-column>
        <el-table-column prop="bank" label="网商银行" align="center"></el-table-column>
        <el-table-column prop="landlord" label="房东" align="center"></el-table-column>
        <el-table-column prop="contactPerson" label="地址联系人" align="center" width="100"></el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template v-slot="{row}">
            <el-button size="mini" type="text" icon="el-icon-edit" @click="editEnterprise(row)">修改</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="deleteEnterprise(row.id)"
            >删除</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-view"
              @click="getEnterpriseDetail(row.id)"
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
    <el-dialog title="公司详情" :visible="showDetail" @close="showDetail = false" width="40%">
      <el-descriptions :column="2">
        <el-descriptions-item label="公司名称">{{ detailList.name }}</el-descriptions-item>
        <el-descriptions-item label="营业执照">
          <span
            v-if="detailList.businessLicense"
            @click="amplifyPicture(detailList.businessLicense)"
          >
            <img width="30" height="30" :src="detailList.businessLicense" alt />
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="现注册地址">{{ detailList.address }}</el-descriptions-item>
        <el-descriptions-item label="法人手机号码">{{ detailList.corporatePhoneNumber }}</el-descriptions-item>
        <el-descriptions-item label="股东手机号码">{{ detailList.shareholderPhoneNumber }}</el-descriptions-item>
        <el-descriptions-item label="公司所在地">{{ detailList.location }}</el-descriptions-item>
        <el-descriptions-item label="企业组织形式">{{ detailList.organizationalForm }}</el-descriptions-item>
        <el-descriptions-item label="基本户照片">
          <span
            v-if="detailList.basicHouseholdPicture"
            @click="amplifyPicture(detailList.basicHouseholdPicture)"
          >
            <img width="30" height="30" :src="detailList.basicHouseholdPicture" alt />
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="基本户">{{ detailList.basicHousehold }}</el-descriptions-item>
        <el-descriptions-item label="一般户">{{ detailList.generalAccounts }}</el-descriptions-item>
        <el-descriptions-item label="网商银行">{{ detailList.bank }}</el-descriptions-item>
        <el-descriptions-item label="房东">{{ detailList.landlord }}</el-descriptions-item>
        <el-descriptions-item label="地址联系人">{{ detailList.contactPerson }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
    <!-- 图片展示弹层 -->
    <el-dialog :visible.sync="showPicture" width="40%">
      <img width="100%" :src="dialogImageUrl" alt />
    </el-dialog>
  </div>
</template>

<script>
import {
  getEnterpriseList,
  enterpriseDetail,
  deleteEnterprise,
} from '@/api/baseData/enterprise'
import Dialog from './components/Dialog'
export default {
  name: 'Enterprise',
  components: {
    Dialog,
  },
  data() {
    return {
      // 图片放大弹层
      showPicture: false,
      // 图片弹层展示的地址
      dialogImageUrl: '',
      total: 0,
      showDetail: false,
      enterpriseList: [],
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
      const res = await getEnterpriseList(this.reqParams)
      this.enterpriseList = res.data.records
      this.total = res.data.total
      // console.log(this.enterpriseList)
    },
    // 新增
    addList() {
      this.showAddDialog = true
    },
    // 修改
    async editEnterprise(row) {
      this.row = row
      console.log('row', this.row)
      this.showAddDialog = true
    },
    // 详情
    async getEnterpriseDetail(id) {
      this.showDetail = true
      const res = await enterpriseDetail(id)
      this.detailList = res.data
    },
    // 删除
    deleteEnterprise(id) {
      this.$to(
        this.$confirm('确定删除此公司？', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          beforeClose: async (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true
              instance.confirmButtonText = '删除中...'
              await deleteEnterprise(id)
              instance.confirmButtonLoading = false
              await done()
              await this.getList()
              this.$message({
                type: 'success',
                message: '删除公司成功！',
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
.baseData_enterprise {
  padding: 40px;
}
</style>