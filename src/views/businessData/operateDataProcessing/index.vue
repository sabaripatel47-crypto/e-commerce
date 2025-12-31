<template>
  <div class="app-container">
    <div class="head-container">
      <el-form inline class="page-search">
        <el-form-item>
          <el-button type="primary" icon="el-icon-upload2" @click="importOrderImport()">导入</el-button>
        </el-form-item>
      </el-form>
    </div>
    <span style="font-size: 14px">{{ uploadTime }}</span>
    <el-table :data="tableData" style="width: 100%" border height="480" v-loading="loading">
      <el-table-column prop="date" label="序号" min-width="30" type="index" align="center"></el-table-column>
      <el-table-column label="日期" align="center">
        <template slot-scope="scope">
          <span>{{ getFormatDate(scope.row.uploadDate) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="导入结果" show-overflow-tooltip align="center">
        <template v-slot="{ row }">
          <span v-if="row.importStatus != 8 && row.importStatus != 9">
            {{
            row.importStatusName
            }}
          </span>
          <el-image
            v-if="row.importStatus != 8 && row.importStatus != 9"
            style="height: 20px; width: 20px"
            :src="require('@/assets/images/loading.gif')"
          ></el-image>
          <span v-if="row.importStatus == 8 || row.importStatus == 9">
            {{
            row.result
            }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.importStatus == 9"
            type="text"
            size="small"
            @click="deleteData(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <Pagination
      v-show="total > 0"
      :page.sync="reqParams.page"
      :limit.sync="reqParams.pageSize"
      :total="total"
      @pagination="getTableData"
    />

    <el-dialog title="导入" :visible="showAddDialog" :before-close="cleanAdd" width="40%">
      <el-form
        :model="importReq"
        :rules="importRules"
        ref="importRef"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="日期:" prop="uploadDate">
          <el-date-picker
            v-model="importReq.uploadDate"
            type="date"
            placeholder="请选择日期"
            value-format="timestamp"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="导入文件">
          <FileUpload ref="fileUploadRef" @getUploadFile="getUploadFile"></FileUpload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cleanAdd">取 消</el-button>
        <el-button type="primary" @click="submitForm" :disabled="submitDisabled">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  getErpOrderData,
  uploadErpOrderData,
  getUploadDataStatus,
  deleteData,
  getUploadTime,
} from '@/api/businessData/operateDataProcessing'
import { getFormatDate } from '@/utils/common'

export default {
  name: '',
  data() {
    return {
      reqParams: {
        page: 1,
        pageSize: 10,
      },
      // 表格数据
      tableData: [],
      total: 0,
      loading: false,
      submitDisabled: false,
      showAddDialog: false,
      importReq: {},
      fileData: {},
      uploadTime: '',
      importRules: {
        uploadDate: [
          { required: true, message: '请选择归属日期', trigger: 'blur' },
        ],
        file: [{ required: true, message: '请选择文件', trigger: 'blur' }],
      },
      // 定时器
      timer: '',
    }
  },
  created() {
    this.getTableData(1)
  },
  methods: {
    // 获取表格数据
    async getTableData(page) {
      if (page == 1) {
        this.reqParams.page = 1
      }
      this.loading = true
      const res = await getErpOrderData(this.reqParams)
      this.getUploadTime()
      this.total = res.data.total
      this.tableData = res.data.records
      this.startTimer()
      this.loading = false
    },
    // 删除
    deleteData(row) {
      this.$confirm('请确认是否删除', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const res = await deleteData(row.uuid)
          if (res.code == 200) {
            this.$message.success('删除成功')
            // 刷新数据
            await this.getTableData(1)
          }
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除',
          })
        })
    },
    //导入
    importOrderImport() {
      this.submitDisabled = false
      this.showAddDialog = true
    },
    // 获取上传的文件
    getUploadFile(val) {
      this.fileData = val.file
      if (this.fileData) {
      }
    },
    // 关闭弹窗
    cleanAdd() {
      this.$nextTick(() => {
        this.$refs.fileUploadRef.clearFileList()
      })
      this.showAddDialog = false

      this.$refs['importRef'].resetFields()

      this.importReq = {}
      this.fileData = {}
    },
    // 提交
    async submitForm() {
      this.$refs['importRef'].validate(async (valid) => {
        if (valid) {
          if (Object.keys(this.fileData).length === 0) {
            return this.$message.warning('请选择上传文件')
          }
          this.submitDisabled = true
          let formData = new FormData()
          formData.append('uploadDate', this.importReq.uploadDate)
          formData.append('file', this.fileData)
          let res = {}
          res = await uploadErpOrderData(formData)
          if (res.code == 200) {
            this.$message.success('导入成功')
            this.cleanAdd()
            // 刷新数据
            await this.getTableData(1)
          }
        }
      })
    },
    // 获取最新上传时间
    async getUploadTime() {
      const res = await getUploadTime()
      this.uploadTime = res.data
    },
    // 开启定时器
    startTimer() {
      this.timer = setInterval(() => {
        this.getAfterSalePlatformStatusList()
      }, 3000)
    },
    // 遍历状态
    async getAfterSalePlatformStatusList() {
      this.tableData.map((item, index) => {
        if (item.importStatus != 9 && item.importStatus != 8) {
          this.getErpOrderStatus(item.uuid, index)
        }
      })
      this.tableData.every((item) => {
        if (item.importStatus == 9 && item.importStatus == 8) {
          clearInterval(this.timer)
        }
      })
    },
    // 根据uuid获取状态
    async getErpOrderStatus(uuid, index) {
      const res = await getUploadDataStatus(uuid)
      this.tableData[index].importStatus = res.data.importStatus
      if (res.data.importStatus == 9 || res.data.importStatus == 8) {
        this.tableData[index].result = res.data.result
      } else {
        this.tableData[index].importStatusName = res.data.result
      }
    },
    getFormatDate(timeStamp) {
      return getFormatDate(timeStamp)
    },
  },
  beforeDestroy() {
    clearInterval(this.timer)
  },
}
</script>

<style lang='scss' scoped>
</style>
