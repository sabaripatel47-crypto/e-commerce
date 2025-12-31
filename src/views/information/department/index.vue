<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--部门数据-->
      <el-col :span="4" :xs="24">
        <el-scrollbar>
          <div style="max-height: 85vh;">
            <div class="head-container">
              <el-tree :data="deptOptions" :props="defaultProps" :expand-on-click-node="false"
                :filter-node-method="filterNode" ref="tree" node-key="id" default-expand-all highlight-current
                @node-click="handleNodeClick"></el-tree>
            </div>
          </div>
        </el-scrollbar>
      </el-col>
      <!--文件数据-->
      <el-col :span="20" :xs="24">
        <el-form ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item label="文件名称">
            <el-input v-model="queryParams.name" placeholder="请输入文件名称" clearable style="width: 240px"
              @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="openAddDialog()">新增</el-button>
          </el-col>
        </el-row>
        <!-- 文件列表数据 -->
        <el-table v-loading="loading" :data="userList">
          <el-table-column label="序号" type="index" width="70" align="center" />
          <el-table-column label="文件名称" align="center" prop="name" show-overflow-tooltip />
          <el-table-column label="公开状态" align="center" prop="publicType">
            <template v-slot="{ row }">{{ row.publicType === 0 ? '不公开' : '公开' }}</template>
          </el-table-column>
          <el-table-column label="下载权限" align="center" prop="downloadType">
            <template v-slot="{ row }">
              {{ row.downloadType === 0 ? '无' : row.downloadType === 1 ? '有' : '有（已下载）'
              }}
            </template>
          </el-table-column>
          <el-table-column label="分享状态" align="center" prop="privateType">
            <template v-slot="{ row }">{{ row.privateType === 0 ? '私有' : '共享' }}</template>
          </el-table-column>
          <el-table-column label="分享权限" align="center" prop="shareType">
            <template v-slot="{ row }">{{ row.shareType === 0 ? '无' : '有' }}</template>
          </el-table-column>
          <el-table-column label="上传时间" align="center" prop="time" width="200"></el-table-column>
          <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
            <template v-slot="{ row }">
              <el-button size="mini" type="text" icon="el-icon-delete" @click="fileDelete(row)">删除</el-button>
              <el-button size="mini" type="text" icon="el-icon-view" @click="fileDetail(row.uuidName)">详情</el-button>
              <el-dropdown size="mini" @command="(command) => handleCommand(command, row)">
                <el-button size="mini" type="text" icon="el-icon-d-arrow-right">更多</el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item icon="el-icon-edit" command="editShare">资料回收</el-dropdown-item>
                  <el-dropdown-item icon="el-icon-share" command="fileShare">分享</el-dropdown-item>
                  <el-dropdown-item icon="el-icon-download" command="downloadFile">下载</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页 -->
        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.page" :limit.sync="queryParams.pageSize"
          @pagination="getList" />
      </el-col>
    </el-row>
    <!-- 新增弹层 -->
    <el-dialog title="新增文件" v-loading="loading" :visible.sync="addDialog" width="40%" :before-close="addClose">
      <el-form :model="addForm" ref="ruleForm" label-width="100px" class="demo-ruleForm">
        <el-form-item label="文件上传" style="width: 60%;">
          <!--  :http-request="reportFileHttpRequest" 自定义上传 -->
          <el-upload class="upload-demo" accept=".pdf, .doc, .docx, .xls, .xlsx, .zip, .jpg, .png, .rar, .md" drag
            action="#" ref="upload" :on-change="handleChange" :file-list="fileList" :auto-upload="false"
            :on-preview="handlePreview" :on-remove="handleRemove" multiple>
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">
              将文件拖到此处，或
              <em>点击上传</em>
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item label="是否公开" prop="publicType">
          <el-radio-group v-model="addForm.publicType">
            <el-radio :label="0">不公开</el-radio>
            <el-radio :label="1">公开</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="文件上传状态" prop="shareType">
          <el-radio-group v-model="addForm.shareType">
            <el-radio :label="0">私人</el-radio>
            <el-radio :label="1">部门</el-radio>
            <el-radio :label="2">组</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="addForm.shareType == 1" label="部门选择">
          <el-cascader v-model="addForm.shareUiid" :options="options" :show-all-levels="false"
            :props="{ children: 'children', label: 'deptName', value: 'deptId', multiple: true, checkStrictly: true }"
            clearable></el-cascader>
        </el-form-item>
        <el-form-item v-else-if="addForm.shareType == 2" label="组选择">
          <el-select :multiple="true" style="width: 12vw;" v-model="addForm.groupId" filterable placeholder="请选择">
            <el-option v-for="item in groupDataList" :key="item.groupId" :label="item.groupName"
              :value="item.groupId"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="addForm.shareType != 0" label="分享权限" prop="forward ">
          <el-radio-group v-model="addForm.forward">
            <el-radio :label="0">无</el-radio>
            <el-radio :label="1">有</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="下载权限" prop="downLoadPower">
          <el-radio-group v-model="addForm.downLoadPower">
            <el-radio :label="0">无</el-radio>
            <el-radio :label="1">有</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialog = false">取 消</el-button>
        <el-button type="primary" @click="submitForm()">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分享弹层 -->
    <el-dialog title="分享文件" :visible.sync="shareDialog" width="40%" :before-close="shareClose">
      <el-form :model="shareFileDTO" ref="ruleForm" label-width="100px" class="demo-ruleForm">
        <el-form-item label="分享类型" prop="shareType">
          <el-radio-group v-model="shareType">
            <el-radio :label="0">部门</el-radio>
            <el-radio :label="1">组</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="shareType === 0" label="部门选择">
          <el-cascader v-model="shareFileDTO.deptId" :options="options" :show-all-levels="false"
            :props="{ children: 'children', label: 'deptName', value: 'deptId.get', multiple: true, checkStrictly: true }"
            clearable></el-cascader>
        </el-form-item>
        <el-form-item v-else-if="shareType === 1" label="组选择">
          <el-select :multiple="true" style="width: 12vw;" v-model="shareFileDTO.groupId" filterable placeholder="请选择">
            <el-option v-for="item in groupDataList" :key="item.groupId" :label="item.groupName"
              :value="item.groupId"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分享权限" prop="forward ">
          <el-radio-group v-model="shareFileDTO.forward">
            <el-radio :label="0">无</el-radio>
            <el-radio :label="1">有</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="下载权限" prop="downLoadPower">
          <el-radio-group v-model="shareFileDTO.downLoadPower">
            <el-radio :label="0">无</el-radio>
            <el-radio :label="1">有</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="shareClose">取 消</el-button>
        <el-button type="primary" @click="submitShareForm()">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 文件分享列表详情弹层 -->
    <el-dialog title="分享详情列表" :visible.sync="detailDialog" width="60%" :before-close="detailClose">
      <el-table v-loading="loading" :data="shareFileList">
        <el-table-column label="序号" type="index" width="70" align="center" />
        <el-table-column label="文件名称" align="center" prop="name" />
        <el-table-column label="拥有用户" align="center" prop="parentName" />
        <el-table-column label="下载权限" align="center" prop="downloadType">
          <template v-slot="{ row }">
            <el-switch v-model="row.downloadType" :active-value="1" :inactive-value="0" active-color="#13ce66"
              inactive-color="#ff4949" @change="changeFileDel(row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="分享权限" align="center" prop="shareType">
          <template v-slot="{ row }">
            <el-switch v-model="row.shareType" :active-value="1" :inactive-value="0" active-color="#13ce66"
              inactive-color="#ff4949" @change="changeFileDel(row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="上传时间" align="center" prop="time"></el-table-column>
        <el-table-column label="是否下载" align="center" prop="isDownLoad">
          <template slot-scope="scope">
            <span :style="{ color: scope.row.isDownLoad === '已下载' ? 'green' : 'gray' }">{{ scope.row.isDownLoad
              }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
          <template v-slot="{ row }">
            <el-button size="mini" type="text" icon="el-icon-delete" @click="fileDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import {
  fileList,
  selectDep,
  department,
  uploadFile,
  deleteFile,
  fileDetail,
  shareFile,
  editShare,
  downloadFile,
  editFileDel,
} from '@/api/information/department'
import { getGroupList } from '@/api/system/group'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { saveAs } from 'file-saver'
import { getDeptTreeData } from '@/utils/common'
export default {
  name: 'Department',
  data() {
    return {
      // 分享时 分享的类型
      shareType: null,
      groupDataList: [],
      // 加载中
      loading: false,
      // 文件分享详情修改入参
      powerFileDTO: {
        id: null,
        downLoad: null,
        share: null,
        uuName: '',
      },
      // 文件下载入参
      downLoadDTO: {
        fileNames: '',
        pathName: '',
        id: '',
      },
      // 修改共享状态入参
      shareStatusDTO: {
        privateType: undefined,
        url: '',
      },
      // 文件分享
      shareFileDTO: {
        downLoadPower: 0,
        fileName: '',
        forward: 0,
        deptId: [],
        groupId: [],
      },
      shareDialog: false,

      // 详情弹层
      detailDialog: false,
      // 文件分享详情列表
      shareFileList: [],
      // 删除文件入参
      deleteFileDTO: {
        objectName: '',
        id: null,
      },
      // 文件分享详情入参
      showFileDTO: {
        url: '',
      },
      // 表格数据
      userList: [],
      // 文件列表
      fileList: [],
      // 部门级联多选
      options: [],
      // 新增弹层
      addDialog: false,
      addForm: {
        file: '',
        shareType: undefined,
        downLoadPower: undefined,
        forward: 1,
        shareUiid: '',
        publicType: 1,
        groupId: [],
      },
      fileArr: [],
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 部门树选项
      deptOptions: [],
      // 是否显示弹出层
      open: false,

      // 表单参数
      form: {},
      defaultProps: {
        children: 'children',
        label: 'deptName',
      },
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 20,
        name: '',
        deptId: undefined,
        // parentId: undefined,
      },
      // 表单校验
      rules: {
        userName: [
          { required: true, message: '文件名称不能为空', trigger: 'blur' },
          {
            min: 2,
            max: 20,
            message: '文件名称长度必须介于 2 和 20 之间',
            trigger: 'blur',
          },
        ],
        nickName: [
          { required: true, message: '文件昵称不能为空', trigger: 'blur' },
        ],
        password: [
          { required: true, message: '文件密码不能为空', trigger: 'blur' },
          {
            min: 5,
            max: 20,
            message: '文件密码长度必须介于 5 和 20 之间',
            trigger: 'blur',
          },
        ],
        email: [
          {
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: ['blur', 'change'],
          },
        ],
        phonenumber: [
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: '请输入正确的手机号码',
            trigger: 'blur',
          },
        ],
      },
    }
  },
  watch: {
    // 根据名称筛选部门树
    deptName(val) {
      this.$refs.tree.filter(val)
    },
    'addForm.shareType': {
      deep: true,
      async handler(val) {
        console.log(val)
        console.log('uuid', this.addForm.shareUiid)
        this.addForm.shareUiid = ''
        // console.log(res)
        if (val === 0) {
          const res = await selectDep(val)
          this.addForm.shareUiid = res.data.uuid
          console.log(this.addForm.shareUiid)
        }
      },
    },
  },

  created() {
    this.getList()
    this.getDeptTree()
    this.getConfigKey('sys.user.initPassword').then((response) => {
      this.initPassword = response.msg
    })
  },
  methods: {
    // 获取组数据
    async getGroup() {
      const res = await getGroupList()
      this.groupDataList = res.data
    },
    // 打开新增弹层
    async openAddDialog() {
      await this.getGroup()
      this.addDialog = true
    },

    /* 更多逻辑 */
    // 更多操作触发
    handleCommand(command, row) {
      switch (command) {
        case 'editShare':
          this.editShare(row)
          break
        case 'fileShare':
          this.fileShare(row)
          break
        case 'downloadFile':
          this.downloadFile(row)
        default:
          break
      }
    },
    /* 文件上传 */
    handleChange(file, fileList) {
      this.fileList = fileList
      console.log(fileList)
    },
    handleRemove(file, fileList) {
      console.log(file, fileList)
    },
    handlePreview(file) {
      console.log(file)
    },
    // ⾃定义上传
    async submitForm() {
      // console.log('req', this.addForm)
      this.loading = true
      const formData = new FormData() //FormData对象，添加参数只能通过append('key', value)的形式添加
      if (this.addForm.shareType == '1') {
        const uuid = []
        this.addForm.shareUiid.forEach((item) => {
          const one = item[item.length - 1]
          uuid.push(one)
        })
        this.addForm.shareUiid = uuid
      }
      let id = []
      formData.append('shareType', this.addForm.shareType)
      formData.append('downLoadPower', this.addForm.downLoadPower)
      formData.append('forward', this.addForm.forward)
      formData.append('deptId', this.addForm.shareUiid)
      formData.append('groupId', this.addForm.groupId)
      formData.append('publicType', this.addForm.publicType)
      this.fileList.forEach((item) => {
        //文件信息中raw才是真的文件
        formData.append('file', item.raw)
        //console.log(item.raw)
      })
      // console.log(this.addForm)
      // console.log('formData', formData)
      const res = await uploadFile(formData)
      if (res?.code === 0) {
        this.$message.success('新增文件成功')
      }
      this.addClose()
      this.getList()
    },
    /* 文件上传 */

    // 关闭新增
    addClose() {
      this.addDialog = false
      this.addForm.file = ''
      this.addForm.shareType = undefined
      this.addForm.downLoadPower = undefined
      this.addForm.forward = 1
      this.addForm.shareUiid = []
      this.loading = false
    },
    // 查询部门
    async getSelectDep() {
      const res = await selectDep(this.addForm.type)
    },
    /** 查询文件列表 */
    async getList() {
      this.loading = true
      try {
        const res = await fileList(this.queryParams)
        if (res.code === 0) {
          this.userList = res.data.records
          this.total = res.data.total
          this.loading = false
        }
      } catch (err) {
        console.log(err)
        console.log(222222)
        // console.log('list', res)
        this.$message({
          type: 'warning',
          showClose: true,
          message: `暂无权限查看个人隐私文件`,
        })
        this.userList = []
        this.total = 0
        this.loading = false
      }
    },

    /** 查询部门下拉树结构 */
    async getDeptTree() {
      const res = await department()
      const newData = await getDeptTreeData(res.data)
      // console.log('newData', newData)
      this.deptOptions = newData
      this.options = newData
      // console.log('option', this.deptOptions)
    },
    /** 查询部门下拉树结构 */

    // 筛选节点
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    // 节点单击事件
    handleNodeClick(data) {
      // this.queryParams.parentId = data.id
      console.log('id', data)
      this.queryParams.deptId = data.deptId
      this.handleQuery()
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.page = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = []
      this.resetForm('queryForm')
      this.queryParams.deptId = undefined
      this.$refs.tree.setCurrentKey(null)
      this.handleQuery()
    },

    /** 删除按钮操作 */
    fileDelete(row) {
      this.deleteFileDTO.objectName = row.uuidName
      this.deleteFileDTO.id = row.id

      this.$confirm('确定删除此文件？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        beforeClose: async (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '删除中...'
            const [err, res] = await this.$to(deleteFile(this.deleteFileDTO))
            instance.confirmButtonLoading = false
            await done()
            await this.getList()
            if (res) {
              this.$message({
                type: 'success',
                message: '删除文件成功！',
              })
            }
          } else {
            await done()
          }
        },
      })
    },

    /* 分享列表详情 */
    async fileDetail(url) {
      this.showFileDTO.url = url
      this.detailDialog = true
      const res = await fileDetail(this.showFileDTO)
      this.shareFileList = res.data
    },
    // 关闭详情列表
    detailClose() {
      this.detailDialog = false
      this.getList()
    },

    /* 分享文件 */
    // 打开分享弹层传递数据
    fileShare(row) {
      this.getGroup()
      this.shareDialog = true
      this.shareFileDTO.fileName = row.uuidName
    },
    async submitShareForm() {
      // console.log(this.shareFileDTO);
      const uuid = []
      this.shareFileDTO.deptId.forEach((item) => {
        const one = item[item.length - 1]
        uuid.push(one)
      })
      this.shareFileDTO.deptId = uuid
      const res = await shareFile(this.shareFileDTO)
      if (res.code === 0) {
        this.$message.success('分享文件成功')
        this.shareClose()
      }
      this.shareClose()
      this.getList()
    },
    // 关闭分享弹层
    shareClose() {
      this.shareDialog = false
    },

    /* 修改分享状态 */
    editShare(row) {
      if (row.privateType === 0) {
        this.$to(
          this.$confirm(
            '您确定将此文件状态修改为共享？共享文件可将文件分享给其他人。',
            '修改提示',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning',
              beforeClose: async (action, instance, done) => {
                if (action === 'confirm') {
                  this.shareStatusDTO.privateType = 1
                  this.shareStatusDTO.url = row.url
                  const res = await editShare(this.shareStatusDTO)
                  await done()
                  if (res.code === 0) {
                    this.$message({
                      type: 'success',
                      message: `修改状态成功`,
                    })
                  }
                  await this.getList()
                } else {
                  await done()
                }
              },
            }
          )
        )
      } else if (row.privateType === 1) {
        this.$to(
          this.$confirm(
            '您确定将此文件状态修改为私有？一旦修改，所分享出的此文件将被删除',
            '修改提示',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning',
              beforeClose: async (action, instance, done) => {
                if (action === 'confirm') {
                  this.shareStatusDTO.privateType = 0
                  this.shareStatusDTO.url = row.url
                  const res = await editShare(this.shareStatusDTO)
                  await done()
                  if (res.code === 0) {
                    this.$message({
                      type: 'success',
                      message: `修改状态成功`,
                    })
                  }
                  await this.getList()
                } else {
                  await done()
                }
              },
            }
          ).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消修改',
            })
          })
        )
      }
    },

    /* 下载文件 */
    async downloadFile(row) {
      this.downLoadDTO.fileNames = row.uuidName
      this.downLoadDTO.pathName = row.url
      this.downLoadDTO.id = row.id
      const res = await downloadFile(this.downLoadDTO)
      saveAs(row.url, `${res.data.文件名}`)
      await this.getList()
    },

    // 修改被分享者的下载权限
    async changeFileDel(row) {
      this.powerFileDTO.id = row.id
      this.powerFileDTO.downLoad = row.downloadType
      this.powerFileDTO.share = row.shareType
      this.powerFileDTO.uuName = row.uuidName
      const res = await editFileDel(this.powerFileDTO)
      console.log(row)
      console.log('123', res)
      if (res && res.code === 0) {
        this.$message({ type: 'success', message: `修改状态成功` })
      } else {
        this.$message({ type: 'warning', message: `暂无权限修改` })
      }
    },
  },
}
</script>