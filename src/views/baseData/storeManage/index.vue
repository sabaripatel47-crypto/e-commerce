<template>
  <div class="app-container">
    <!-- 搜索(不要用el-form来布局,不然输入框按回车会导致表单提交刷新页面) -->
    <div class="head-container page-search">
      <span class="search-label">店铺搜索：</span>
      <el-input placeholder="请输入店铺名称" v-model="reqParams.keyword" clearable class="handle-input"
        style="width: 200px; margin-right: 10px;" @keyup.enter.native="getList(1)" @clear="getList(1)"></el-input>
      <el-button type="primary" icon="el-icon-search" @click="getList(1)">搜索</el-button>
      <el-button type="primary" plain icon="el-icon-plus" @click="addStore()">新增</el-button>
    </div>
    <div class="container">
      <!-- 表格 -->
      <el-table :data="storeList" v-loading="tableLoading" style="width: 100%" max-height="700">
        <el-table-column type="index" label="序号" width="70" align="center"></el-table-column>
        <el-table-column prop="storeCode" label="店铺编号" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="showName" label="店铺名称" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="platformName" label="所属平台" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="companyName" label="所属公司" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="managerName" label="店铺负责人" align="center"></el-table-column>
        <el-table-column prop="storeStatusName" label="店铺状态" align="center"></el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template v-slot="{ row }">
            <el-button size="mini" type="text" icon="el-icon-view" @click="getStoreDetail(row)">详情</el-button>
            <el-button size="mini" type="text" icon="el-icon-edit" @click="editStore(row)">修改</el-button>
            <!-- <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="deleteStore(row.uuid)"
            >删除</el-button>-->
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <pagination v-show="total > 0" :total="total" :page.sync="reqParams.page" :limit.sync="reqParams.pageSize"
        @pagination="getList" />
    </div>
    <!-- 详情弹层 -->
    <el-dialog title="店铺详情" :visible="showDetail" :before-close="cleanDetail" width="40%">
      <el-descriptions :column="2">
        <el-descriptions-item label="店铺编号">{{ detail.storeCode }}</el-descriptions-item>
        <el-descriptions-item label="店铺后台名称">{{ detail.storeName }}</el-descriptions-item>
        <el-descriptions-item label="显示名称">{{ detail.showName }}</el-descriptions-item>
        <el-descriptions-item label="所属平台">{{ detail.platformName }}</el-descriptions-item>
        <el-descriptions-item label="所属公司">{{ detail.companyName }}</el-descriptions-item>
        <el-descriptions-item label="店铺负责人">{{ detail.managerName }}</el-descriptions-item>
        <el-descriptions-item label="店铺状态">{{ detail.storeStatusName }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!--新增弹窗-->
    <el-dialog :close-on-click-modal="false" :title="isEdit ? '修改店铺' : '新增店铺'" :visible="showAddDialog"
      :before-close="cleanAdd" width="40%">
      <el-form :model="editDetail" :rules="storeRules" ref="addDetailRef" label-width="120px" label-position="right">
        <el-form-item label="店铺编号" prop="storeCode">
          <el-input class="el-form-item-width40" v-model="editDetail.storeCode" clearable
            placeholder="请输入店铺编号"></el-input>
        </el-form-item>
        <el-form-item label="店铺后台名称" prop="storeName">
          <el-input class="el-form-item-width40" v-model="editDetail.storeName" clearable
            placeholder="请输入店铺后台名称"></el-input>
        </el-form-item>
        <el-form-item label="显示名称" prop="showName">
          <el-input class="el-form-item-width40" v-model="editDetail.showName" clearable
            placeholder="请输入显示名称"></el-input>
        </el-form-item>
        <el-form-item label="所属平台" prop="platform">
          <el-select class="el-form-item-width40" v-model="editDetail.platform" filterable placeholder="请选择所属平台">
            <el-option v-for="item in platforms" :label="item.name" :value="item.code" :key="item.code"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属公司" prop="companyUuid">
          <el-select class="el-form-item-width40" v-model="editDetail.companyUuid" placeholder="请选择所属公司">
            <el-option v-for="item in companys" :label="item.name" :value="item.code" :key="item.code"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="店铺负责人" prop="manager">
          <el-cascader class="el-form-item-width40" filterable v-model="editDetail.manager" @change="changeeeeeeeeeee"
            :options="departments" :show-all-levels="false"
            :props="{ children: 'children', label: 'deptName', value: 'deptId', checkStrictly: false }" clearable
            :placeholder="editDetail.managerName"></el-cascader>
        </el-form-item>
        <el-form-item label="店铺状态" prop="storeStatus">
          <el-radio-group class="el-form-item-width40" v-model="editDetail.storeStatus">
            <el-radio :label="0">运营</el-radio>
            <el-radio :label="1">关闭</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cleanAdd">取 消</el-button>
        <!-- <el-button type="primary" @click="submitForm">确 定</el-button> -->
        <DebounceButton :type="'primary'" :onClick="submitForm">确 定</DebounceButton>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  getStoreList,
  addStore,
  editStore,
  deleteStore,
} from '@/api/baseData/storeManage'

import { getDeptTreeData } from '@/utils/common'
import { department } from '@/api/information/department'
import {
  listPlatform,
  listCompany,
  listAllUpperDept,
} from '@/api/baseData/common'
import { deepClone } from '@/utils/common'

export default {
  name: 'StoreManage',
  data() {
    return {
      total: 0,
      storeList: [],

      //详情的弹窗标记
      showDetail: false,
      //详情的数据
      detail: {},
      //编辑的数据
      editDetail: {},
      //是否是编辑
      isEdit: false,

      //部门人员的下拉框
      departments: [],

      //平台下拉框
      platforms: [],

      //公司下拉框
      companys: [],

      //新增和编辑的弹窗
      showAddDialog: false,

      // 列表加载状态
      tableLoading: false,

      reqParams: {
        keyword: '',
        page: 1,
        pageSize: 20,
      },
      // el-form校验
      storeRules: {
        storeCode: [
          { required: true, message: '请输入店铺编码', trigger: 'blur' },
          {
            min: 2,
            max: 20,
            message: '长度在 2 到 20 个字符',
            trigger: 'blur',
          },
        ],
        storeName: [
          { required: true, message: '请输入店铺后台名称', trigger: 'blur' },
          {
            min: 2,
            max: 30,
            message: '长度在 2 到 30 个字符',
            trigger: 'blur',
          },
        ],
        showName: [
          { required: true, message: '请输入显示名称', trigger: 'blur' },
          {
            min: 2,
            max: 30,
            message: '长度在 2 到 30 个字符',
            trigger: 'blur',
          },
        ],
        platform: [
          { required: true, message: '请选择所属平台', trigger: 'change' },
        ],
        companyUuid: [
          { required: true, message: '请选择所属公司', trigger: 'change' },
        ],
        storeStatus: [
          { required: true, message: '请选择店铺状态', trigger: 'change' },
        ],
        manager: [
          { required: true, message: '请选择店铺负责人', trigger: 'change' },
        ],
      },
    }
  },
  // 组件加载时调用
  created() {
    this.getDeptTree()

    //平台下拉框
    this.listPlatform()

    //公司下拉框
    this.listCompany()

    this.getList()
  },
  methods: {
    // 负责人组织架构数据
    async getDeptTree() {
      const res = await department()
      this.departments = await getDeptTreeData(res.data)
    },

    //平台下拉框
    async listPlatform() {
      const res = await listPlatform()
      this.platforms = res.data
    },

    //公司下拉框
    async listCompany() {
      const res = await listCompany()

      this.companys = res.data
    },

    // 获取列表信息
    async getList(page) {
      this.tableLoading = true
      //如果传入的是1那就重置到第一页,一般是搜索会重置到第一页
      if (page == 1) {
        this.reqParams.page = page
      }
      const res = await getStoreList(this.reqParams)
      this.storeList = res.data.records
      this.total = res.data.total
      this.tableLoading = false
    },
    // 详情
    async getStoreDetail(row) {
      this.showDetail = true
      this.detail = deepClone(row)
    },

    //清空弹窗内容
    cleanDetail() {
      this.showDetail = false

      this.detail = {}
    },

    cleanAdd() {
      this.showAddDialog = false

      this.$refs['addDetailRef'].resetFields()

      this.editDetail = {}

      this.isEdit = false
    },

    // 新增
    addStore() {
      this.isEdit = false

      //店铺状态默认是运营
      this.editDetail = { storeStatus: 0 }

      this.showAddDialog = true
    },

    // 修改
    editStore(row) {
      this.isEdit = true

      this.editDetail = deepClone(row)

      let manager = this.editDetail.manager

      listAllUpperDept({ userUuid: manager }).then((resp) => {
        //把第一位的0去掉
        this.editDetail.manager = resp.data.splice(1)
        console.log('manager', manager)
        console.log('this.editDetail.manager111', this.editDetail.manager)
        //把人员自己也加进数组里
        this.editDetail.manager.push(manager)
        console.log('this.editDetail.manager', this.editDetail.manager)

        this.showAddDialog = true
      })
    },
    changeeeeeeeeeee(val) {
      console.log('val', val)
    },

    //新增/编辑的保存
    async submitForm() {
      //必填校验
      this.$refs['addDetailRef'].validate(async (valid) => {
        if (valid) {
          if (Array.isArray(this.editDetail.manager)) {
            this.editDetail.manager =
              this.editDetail.manager[this.editDetail.manager.length - 1]
          }
          if (this.isEdit) {
            await editStore(this.editDetail)
          } else {
            await addStore(this.editDetail)
          }

          this.$message({
            type: 'success',
            message: this.isEdit ? '修改成功' : '新增成功！',
          })

          //关闭弹窗
          this.cleanAdd()
          //刷新数据
          this.getList()
        }
      })
    },

    // 删除
    deleteStore(id) {
      let ids = []
      ids.push(id)

      this.$confirm('确定删除此店铺，删除后不可恢复？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        beforeClose: async (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '删除中...'
            const [err, res] = await this.$to(deleteStore({ ids: ids }))
            if (err) {
              console.log(err)
            }
            instance.confirmButtonLoading = false
            await done()
            if (res) {
              await this.getList()
              this.$message({
                type: 'success',
                message: '删除店铺成功！',
              })
            }
          } else {
            await done()
          }
        },
      })
    },
  },
}
</script>

<style scoped>
.page-search {
  display: flex;
  align-items: center;
}

.search-label {
  font-size: 14px;
  color: #606266;
  margin-right: 10px;
}
</style>
