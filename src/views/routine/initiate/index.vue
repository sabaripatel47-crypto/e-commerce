<template>
  <div class="page_configure">
    <!-- 搜索 -->
    <div class="page-search">
      <el-form class="page-search" inline ref="page-filter">
        <el-form-item label="流程状态：" style="margin-right: 20px;">
          <el-select v-model="audit" @change="getList" clearable placeholder="请选择">
            <el-option label="审核中" :value="0"></el-option>
            <el-option label="已沟通" :value="1"></el-option>
            <el-option label="已驳回" :value="2"></el-option>
            <el-option label="已作废" :value="3"></el-option>
          </el-select>
        </el-form-item>
        <br />
        <el-form-item>
          <el-button type="primary" plain icon="el-icon-plus" @click="showAddForm">发起</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据列表 -->
    <el-table style="width: 100%" max-height="600" :data="flowList" v-loading="loading">
      <el-table-column type="index" align="center" label="序号" width="70"></el-table-column>
      <el-table-column align="center" label="发起人" prop="userName"></el-table-column>
      <el-table-column align="center" label="所属部门" prop="deptName"></el-table-column>
      <el-table-column align="center" label="流程名称" prop="name"></el-table-column>
      <el-table-column align="center" label="流程状态">
        <template v-slot="{row}">
          <span v-if="row.audit === 0">审核中</span>
          <span v-if="row.audit === 1">已通过</span>
          <span v-if="row.audit === 2">已驳回</span>
          <span v-if="row.audit === 3">已作废</span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" align="center" width="200">
        <template v-slot="{row}">
          <el-button
            v-if="row.audit === 0"
            size="mini"
            type="text"
            icon="el-icon-back"
            @click="recallFlow(row.id)"
          >撤回</el-button>
          <el-button
            v-if="row.audit === 3"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="readd(row)"
          >重新发起</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="deleteFlow(row)">删除</el-button>
          <el-button size="mini" type="text" icon="el-icon-view" @click="getFlowDel(row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="reqListParams.pageNum"
      :limit.sync="reqListParams.pageSize"
      @pagination="getAllFlow"
    />

    <!-- 选择流程弹层 -->
    <el-dialog title="发起流程" :visible.sync="selectDialog" width="30%" :before-close="selectClose">
      选择流程：
      <el-select v-model="selectItem" placeholder="请选择">
        <el-option
          v-for="item,index in allFlowList"
          :key="index"
          :label="item.workflowName"
          :value="item.id"
        ></el-option>
      </el-select>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="goAdd()">下一步</el-button>
      </span>
    </el-dialog>

    <!-- 发起流程弹层 -->
    <el-dialog
      :title="selectFlowName"
      :visible.sync="addDialog"
      width="40%"
      :before-close="addClose"
    >
      <el-form style="margin-left: 40px;" label-width="auto" label-position="right">
        <el-form-item v-for="item in workUserAddDTO.content" :key="item.id" :label="item.name+'：'">
          <!-- 输入框 -->
          <el-input
            style="width: 60%"
            :placeholder="'请输入'+item.name"
            v-if="item.type === 0"
            v-model="item.value"
          ></el-input>
          <!-- 文本域 -->
          <el-input
            style="width: 70%"
            v-else-if="item.type === 1"
            type="textarea"
            v-model="item.value"
          ></el-input>
          <!-- 单选 -->
          <el-radio-group v-else-if="item.type === 2" v-model="item.value">
            <el-radio v-for="optionItem in item.option" :key="optionItem" :label="optionItem"></el-radio>
          </el-radio-group>
          <!-- 多选 -->
          <el-checkbox-group v-else-if="item.type === 3" v-model="item.valueArray">
            <el-checkbox
              v-for="optionItem in item.option"
              :key="optionItem"
              :label="optionItem"
              name="type"
            ></el-checkbox>
          </el-checkbox-group>
          <!-- 引入字典 -->
          <el-select v-else-if="item.type === 4" v-model="item.value">
            <el-option
              v-for="optionItem in item.option"
              :key="optionItem"
              :label="optionItem"
              :value="optionItem"
            ></el-option>
          </el-select>
          <!-- 地址选择 -->
          <el-cascader
            v-else-if="item.type === 5"
            :options="pcaTextArr"
            v-model="item.valueArray"
            placeholder="请选择地址"
            clearable
          ></el-cascader>
          <!-- 文件上传 -->
          <div v-else-if="item.type === 6">
            <el-upload
              class="upload-demo"
              accept=".pdf, .doc, .docx, .xls, .xlsx, .zip, .jpg, .png, .rar, .md"
              drag
              action="#"
              ref="upload"
              :on-change="fileChange"
              :file-list="fileList"
              :auto-upload="false"
              multiple
            >
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">
                将文件拖到此处，或
                <em>点击上传</em>
              </div>
            </el-upload>
            <div style="cursor: pointer;" v-if="item.valueArray && item.valueArray.length > 0">
              <div class="fileItem" v-for="one,index in item.valueArray" :key="index">
                <span>{{ one.split('.com/')[1] }}</span>
                <span
                  class="fileItem_icon"
                  style="margin-left: 20px;"
                  @click="deleteFile(one,item)"
                >
                  <i class="el-icon-close"></i>
                </span>
              </div>
            </div>
          </div>

          <!-- 部门选择 -->
          <el-cascader
            v-else-if="item.type === 7"
            v-model="item.valueArray"
            :options="options"
            :show-all-levels="false"
            :props="{children: 'children', label: 'deptName', value:'deptId', checkStrictly: true,}"
            clearable
            placeholder="请选择"
          ></el-cascader>
          <!-- 日期区间选择器 -->
          <el-date-picker
            v-else-if="item.type === 8"
            v-model="item.valueArray"
            value-format="yyyy-MM-dd"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          ></el-date-picker>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addClose">取 消</el-button>
        <el-button type="primary" @click="submitAddFlow">确 定</el-button>
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
import { getFlowList, department, flowDetail } from '@/api/routine/configure.js'
import { pcaTextArr } from 'element-china-area-data'
import {
  submitFlow,
  getList,
  recallFlow,
  deleteFlow,
  getFlowDetail,
} from '@/api/routine/initiate.js'
import { getDictValue } from '@/api/dict/dict'
import { fileUpload, deleteFile, getInfo, getDeptName } from '@/api/index/index'
import { getDeptTreeData } from '@/utils/common'
export default {
  name: 'Initiate',
  data() {
    return {
      loading: false,
      // 详情弹层
      showDetail: false,
      // 流程状态
      audit: null,
      // 组织架构
      options: [],
      total: 0,
      reqListParams: {
        pageNum: 1,
        pageSize: 20,
      },
      pcaTextArr,
      // 选中的流程
      selectItem: null,
      // 获取发起流程列表
      flowList: [],
      // 获取所有流程列表
      allFlowList: [],
      // 控制发起流程弹层
      addDialog: false,
      // 控制流程选择的弹层
      selectDialog: false,
      // 选中的流程名称
      selectFlowName: '',
      // 流程表单数据
      formList: [],
      // 提交流程表单
      workUserAddDTO: {
        workAddId: null,
        content: [],
      },
      // 文件列表
      fileList: [],
      // 删除流程id
      deleteId: null,
      // 控制是否走删除
      isDelete: false,
      // 详情列表
      detailList: [],
      // 审批详情列表
      approveDel: [],
      // 审批条数
      approveNum: 0,
      // 流程发起人
      flowUserName: '',
    }
  },
  async created() {
    await this.getList()

    await this.getDeptInfo()
  },
  methods: {
    // 关闭详情
    closeDel() {
      this.showDetail = false
      this.approveDel = []
    },
    // 获取审批详情
    async getFlowDel(row) {
      this.flowUserName = row.userName
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
      const detail = await flowDetail(row.workAddId)
      let sort = 0
      if (detail.data.deptList) {
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
      }
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
    // 获取发起过的流程列表
    async getList() {
      this.loading = true
      const res = await getList({ audit: this.audit })
      this.flowList = res.data
      this.loading = false
    },
    /* 文件上传 */
    fileChange(file, fileList) {
      this.fileList = fileList
      console.log('文件列表', fileList)
    },
    // 获取部门组织架构信息
    async getDeptInfo() {
      const res = await department()
      if (res.data) {
        this.options = getDeptTreeData(res.data)
      }
      // console.log(this.options)
    },
    // 去添加
    async goAdd() {
      const res = await flowDetail(this.selectItem)
      // console.log('详情', res)
      this.formList = res.data.confList
      this.formList.forEach(async (item) => {
        let flow = {
          id: null,
          name: '',
          type: '',
          value: '',
          valueArray: [],
          option: [],
        }
        flow.id = item.id
        if (item.type === 4) {
          flow.name = item.value
        } else {
          flow.name = item.titleName
        }
        flow.type = item.type
        if (item.value !== null) {
          flow.option = item.value.split('/')
        }
        if (item.type === 4) {
          const res = await getDictValue({ dictName: item.value })
          flow.option = res.data.dictValue
        }
        this.workUserAddDTO.content.push(flow)
      })
      // console.log('内容', this.workUserAddDTO.content)
      this.selectFlowName = res.data.everyWorkAdd.workflowName
      this.workUserAddDTO.workAddId = res.data.everyWorkAdd.id
      this.addDialog = true
    },
    // 发起流程
    async showAddForm() {
      await this.getAllFlow()
      this.selectDialog = true
    },
    // 重新发起流程
    readd(row) {
      this.workUserAddDTO.workAddId = row.workAddId
      this.workUserAddDTO.content = JSON.parse(row.content)
      this.selectFlowName = row.name
      this.addDialog = true
      this.isDelete = true
      this.deleteId = row.id
    },
    // 删除流程
    deleteFlow(row) {
      this.$to(
        this.$confirm('确定删除此流程？', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          beforeClose: async (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true
              instance.confirmButtonText = '删除中...'
              let content = JSON.parse(row.content)
              content.map((item) => {
                if (item.type === 6) {
                  if (item.valueArray.length > 0) {
                    item.valueArray.forEach(async (one) => {
                      let url = one.split('.com/')[1]
                      const res = await deleteFile({ filePath: url })
                    })
                  }
                  return
                }
              })
              await deleteFlow(row.id)
              instance.confirmButtonLoading = false
              await done()
              await this.getList()
              this.$message({
                type: 'success',
                message: '删除流程成功！',
              })
            } else {
              await done()
            }
          },
        })
      )
    },
    // 关闭选择流程弹层
    selectClose() {
      this.selectDialog = false
      this.selectItem = null
    },
    // 关闭发起流程弹层
    addClose() {
      this.addDialog = false
      this.getList()
      this.workUserAddDTO.content = []
      this.isDelete = false
    },
    // 获取所有流程列表
    async getAllFlow() {
      const res = await getFlowList({})
      this.allFlowList = res.data
      // console.log(res)
    },
    // 提交流程
    async submitAddFlow() {
      this.addDialog = false
      this.selectDialog = false
      if (this.fileList.length > 0) {
        let fileList = []
        for (let i = 0; i < this.fileList.length; i++) {
          let formData = new FormData()
          console.log(this.fileList[i])
          formData.append('picture', this.fileList[i].raw)
          const res = await fileUpload(formData)
          fileList.push(res.data)
        }
        this.workUserAddDTO.content.map(async (item) => {
          if (item.type === 6) {
            item.valueArray = fileList
          }
        })
      }
      this.workUserAddDTO.content = JSON.stringify(this.workUserAddDTO.content)
      const res = await submitFlow(this.workUserAddDTO)
      if (res.code === 200) {
        this.$message.success('发起流程成功')
      }
      if (this.isDelete) {
        await deleteFlow(this.deleteId)
      }
      this.addClose()
      this.selectClose()
      // console.log('123', res)
      console.log('表单数据', this.workUserAddDTO.content)
    },
    // 撤回流程
    async recallFlow(id) {
      this.$to(
        this.$confirm('确定撤回此流程？', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          beforeClose: async (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true
              instance.confirmButtonText = '撤回中...'
              await recallFlow(id)
              instance.confirmButtonLoading = false
              await done()
              await this.getList()
              this.$message({
                type: 'success',
                message: '撤回流程成功！',
              })
            } else {
              await done()
            }
          },
        })
      )
    },
    // 删除文件
    async deleteFile(one, item) {
      this.workUserAddDTO.content.forEach((item1) => {
        if (item1 === item) {
          item1.valueArray.forEach((file, index) => {
            if (file === one) {
              item1.valueArray.splice(index, 1)
            }
          })
        }
      })
      let url = one.split('.com/')[1]
      const res = await deleteFile({ filePath: url })
    },
  },
}
</script>

<style scoped lang="scss">
.page_configure {
  padding: 40px;
}
</style>