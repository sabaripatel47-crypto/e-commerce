<template>
  <div class="page_configure">
    <!-- 搜索 -->
    <div class="page-search">
      <el-form class="page-search" inline ref="page-filter">
        <el-form-item label="流程状态：" style="margin-right: 20px;">
          <el-select v-model="audit" @change="getFlowList" clearable placeholder="请选择">
            <el-option label="审核中" :value="0"></el-option>
            <el-option label="已沟通" :value="1"></el-option>
            <el-option label="已驳回" :value="2"></el-option>
            <el-option label="已作废" :value="3"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据列表 -->
    <el-table style="width: 100%" max-height="600" :data="dataList" v-loading="loading">
      <el-table-column type="index" align="center" label="序号" width="70"></el-table-column>
      <el-table-column align="center" label="发起人" prop="userName"></el-table-column>
      <el-table-column align="center" label="所属部门" prop="deptName"></el-table-column>
      <el-table-column align="center" label="流程状态">
        <template v-slot="{row}">
          <span v-if="row.audit === 0">审核中</span>
          <span v-if="row.audit === 1">已通过</span>
          <span v-if="row.audit === 2">已驳回</span>
          <span v-if="row.audit === 3">已作废</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="审批状态">
        <template v-slot="{row}">
          <span>{{ row.isFor === 2 ? '待审批' : '已审批' }}</span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" align="center">
        <template v-slot="{row}">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            v-if="row.isFor === 2"
            @click="goApprove(row)"
          >去处理</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" v-if="row.audit === 3">删除</el-button>
          <el-button size="mini" type="text" icon="el-icon-view" @click="getFlowDel(row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="pageReqPrams.pageNum"
      :limit.sync="pageReqPrams.pageSize"
      @pagination="getFlowList()"
    />

    <!-- 审批弹层 -->
    <el-dialog title="审批" :visible.sync="approvalDialog" width="40%" :before-close="approvalClose">
      <el-form ref="refFlow" label-width="100px">
        <el-form-item label="发起人：">
          <el-input disabled v-model="rowData.userName"></el-input>
        </el-form-item>
        <el-form-item label="流程名称：">
          <el-input disabled v-model="rowData.name"></el-input>
        </el-form-item>
        <el-form-item label="反馈：">
          <el-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4}"
            v-model="auditInsertDTO.feedback"
            placeholder="请输入反馈内容"
          ></el-input>
          <el-upload
            class="upload-demo"
            accept=".pdf, .doc, .docx, .xls, .xlsx, .zip, .jpg, .png, .rar, .md"
            action="#"
            ref="upload"
            :on-change="fileChange"
            :file-list="fileList"
            :auto-upload="false"
            multiple
          >
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="approvalClose()">取 消</el-button>
        <el-button type="primary" @click="submitApprove">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 详情弹层 -->
    <el-dialog title="流程详情" :visible="showDetail" @close="closeDel">
      <div style="margin-bottom: 10px; font-size: 18px; font-weight: 600;">流程信息：</div>
      <el-descriptions :column="2">
        <el-descriptions-item label="流程发起人">{{ flowUserName }}</el-descriptions-item>
        <el-descriptions-item v-for="item,index in detailList" :key="index" :label="item.name">
          <span v-if="item.type === 6">
            <a v-for="one,index in item.valueArray" :key="index" :href="one">
              <div style="color: #1f79db;">{{ one.split('.com/')[1] }}</div>
            </a>
          </span>
          <span v-else>{{ item.value }}</span>
        </el-descriptions-item>
      </el-descriptions>
      <div style="margin-top: 20px; margin-bottom: 10px; font-size: 18px; font-weight: 600;">审批过程：</div>
      <el-steps :active="approveNum">
        <el-step v-for="item,index in approveDel" :key="index" :title="item.name">
          <template slot="description" v-if="item.status !== ''">
            <div v-if="item.name.indexOf('处理人')">
              反馈结果：
              {{ item.status }}
            </div>
            <div>
              反馈内容：
              {{ item.feedText }}
            </div>
            <div v-if="item.feedFile && item.feedFile.length > 0 &&  item.feedFile[0] !== ''">
              反馈文件：
              <span>
                <div v-for="item1,index in item.feedFile" :key="index">
                  <a :href="item1">{{ item1.split('.com/')[1] }}</a>
                </div>
              </span>
            </div>
          </template>
        </el-step>
      </el-steps>
    </el-dialog>
  </div>
</template>

<script>
import { getList } from '@/api/routine/handle.js'
import { submitApp, getDetail } from '@/api/routine/approve.js'
import { flowDetail } from '@/api/routine/configure.js'
import { getFlowDetail } from '@/api/routine/initiate.js'
import { fileUpload, getInfo, getDeptName } from '@/api/index/index'
export default {
  name: 'Handle',
  data() {
    return {
      loading: false,
      // 数据列表
      dataList: [],
      // 流程状态
      audit: null,
      // 提交审批入参
      auditInsertDTO: {
        audit: 1,
        // userId: null,
        workUserId: null,
        feedback: '',
        status: null,
        fo: 2,
      },
      // 控制审批弹层
      approvalDialog: false,

      rowData: {},
      // 文件列表
      fileList: [],
      // 详情弹层
      showDetail: false,
      // 详情列表
      detailList: [],
      // 审批详情列表
      approveDel: [],
      // 审批条数
      approveNum: 0,
      // 流程发起人
      flowUserName: '',
      // 分页入参
      pageReqPrams: {
        pageNum: 1,
        pageSize: 20,
      },
      total: 0,
    }
  },
  async created() {
    await this.getFlowList()
  },
  methods: {
    // 关闭详情
    closeDel() {
      this.showDetail = false
      this.approveDel = []
    },
    // 获取流程详情
    async getFlowDel(row) {
      this.flowUserName = row.userName
      console.log(row)
      const res = await getFlowDetail(row.id)
      this.approveNum = res.data.list.length
      // this.approveDel = res.data.list
      let list = JSON.parse(res.data.workUser.content)
      list.forEach(async (item) => {
        if (item.type === 3 || item.type === 5) {
          item.value = item.valueArray.join(',')
        } else if (item.type === 8) {
          item.value = item.valueArray.join('至')
        } else if (item.type === 7) {
          let userId = item.valueArray[item.valueArray.length - 1]
          if (userId.length > 10) {
            const res = await getInfo(+userId)
            item.value = res.data.userName
          } else {
            const res = await getDeptName(+userId)
            item.value = res.data.deptName
          }
        }
      })
      this.detailList = [...list]
      console.log('详情', this.detailList)
      const detail = await flowDetail(row.workAddId)
      let sort = 0
      detail.data.deptList.forEach((item) => {
        let approveOne = {
          name: '',
          feedText: '',
          status: '',
          feedFile: [],
          sort: 0,
        }
        sort = sort + 1
        approveOne.sort = sort
        approveOne.name = '审批人'
        this.approveDel.push(approveOne)
        if (item.isAllocation === 1) {
          let approveTwo = {
            name: '',
            feedText: '',
            status: '',
            feedFile: [],
            sort: 0,
          }
          sort = sort + 1
          approveTwo.sort = sort
          approveTwo.name = '处理人'
          this.approveDel.push(approveTwo)
        }
      })
      // console.log('1111', res.data.list)
      // console.log('2222', this.approveDel)
      if (res.data.list) {
        res.data.list.forEach((item1, index1) => {
          this.approveDel.forEach(async (item2, index2) => {
            if (index1 === index2) {
              if (item1.audit === 1) {
                item2.status = '通过'
              } else {
                item2.status = '不通过'
              }
              item2.feedText = item1.feedback.split('|')[0]
              item2.feedFile = (item1.feedback.split('|')[1] || '').split(',')
              const res = await getInfo(item1.auditId)
              item2.name = item2.name + ':' + res.data.userName
            }
          })
        })
      }
      this.showDetail = true
    },

    // 获取列表数据
    async getFlowList() {
      const res = await getList({ audit: this.audit })
      this.total = res.data.total
      this.dataList = res.data.records || []
    },
    // 获取流程详情
    async getFlowDetail(id) {
      const res = await getDetail(id)
    },

    // 提交审批
    async submitApprove() {
      this.approvalDialog = false
      const appList = await flowDetail(this.rowData.workAddId)
      // 判断是否为最后一条审批
      const list = await getFlowDetail(this.rowData.id)
      let num = 0
      appList.data.deptList.map((item) => {
        if (item.isAllocation === 1) {
          num = num + 1
        }
      })
      if (list.data.list.length === appList.data.deptList.length + num - 1) {
        this.auditInsertDTO.status = 1
      } else {
        this.auditInsertDTO.status = null
      }
      if (this.fileList.length > 0) {
        // 拼接反馈内容和文件
        this.auditInsertDTO.feedback = this.auditInsertDTO.feedback + '|'
        for (let i = 0; i < this.fileList.length; i++) {
          let formData = new FormData()
          console.log(this.fileList[i])
          formData.append('picture', this.fileList[i].raw)
          const res = await fileUpload(formData)
          this.auditInsertDTO.feedback = this.auditInsertDTO.feedback + res.data
        }
      }
      const res = await submitApp(this.auditInsertDTO)
      if (res.code === 200) {
        this.$message.success('提交审批成功')
      }
      this.approvalClose()
    },

    // 文件上传
    fileChange(file, fileList) {
      this.fileList = fileList
      console.log('文件列表', fileList)
    },

    // 打开审批弹层
    async goApprove(row) {
      this.auditInsertDTO.workUserId = row.id
      // this.auditInsertDTO.userId = row.userId
      this.rowData = { ...row }
      console.log('row', this.rowData)
      this.approvalDialog = true
    },

    // 关闭审批弹层
    approvalClose() {
      this.approvalDialog = false
      this.getFlowList()
      this.rowData = {}
      this.fileList = []
    },
  },
}
</script>

<style scoped>
.page_configure {
  padding: 40px;
}
</style>