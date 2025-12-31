<template>
  <div class="page_configure">
    <!-- 搜索 -->
    <div class="page-search">
      <el-form class="page-search" inline ref="page-filter">
        <el-form-item label="关键字搜索：" style="margin-right: 20px;">
          <el-input placeholder="请输入关键字" class="handle-input"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search">搜索</el-button>
        </el-form-item>
        <br />
        <el-form-item>
          <el-button type="primary" plain icon="el-icon-plus" @click="showAddDialog">新增</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 数据列表 -->
    <el-table style="width: 100%" max-height="600" :data="flowList" v-loading="loading">
      <el-table-column type="index" align="center" label="序号" width="70"></el-table-column>
      <el-table-column label="流程名称" align="center" prop="workflowName"></el-table-column>
      <el-table-column label="审批流程" align="center">
        <template v-slot="{row}">
          <el-link
            type="primary"
            @click="showApprovalForm(row)"
          >{{row.ex === 1 ? '修改审批流程' : '配置审批流程' }}</el-link>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="200" align="center">
        <template v-slot="{row}">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="editFlowData(row)">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="deleteFlow(row.id)">删除</el-button>
          <el-button size="mini" type="text" icon="el-icon-view" @click="openDel(row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="reqListParams.pageNum"
      :limit.sync="reqListParams.pageSize"
      @pagination="getFlowList"
    />

    <!-- 新增/修改 流程弹层 -->
    <el-dialog
      :title="isAddFlow ? '修改流程' : '新增流程'"
      :visible.sync="addDialog"
      width="45%"
      :before-close="addClose"
    >
      <el-form :model="evaluateFillVO" ref="refFlow" label-width="100px" :rules="addRules">
        <el-form-item label="流程名称" prop="workflowName">
          <el-input
            style="width: 70%"
            v-model="evaluateFillVO.workflowName"
            :disabled="disabledDel"
            placeholder="请输入流程名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="使用部门" prop="examine">
          <el-cascader
            v-model="evaluateFillVO.examine"
            :options="options"
            :show-all-levels="false"
            :props="{children: 'children',label: 'deptName', value:'deptId', checkStrictly: true, multiple: true }"
            clearable
            :disabled="disabledDel"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="计入审核" prop="isAssess">
          <el-radio-group :disabled="disabledDel" v-model="evaluateFillVO.isAssess">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="2">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="evaluateFillVO.isAssess === 1 " label="绩效分" prop="performance">
          <el-input
            style="width: 70%"
            v-model="evaluateFillVO.performance"
            type="number"
            placeholder="请输入绩效分值"
            :disabled="disabledDel"
          ></el-input>
        </el-form-item>
        <el-form-item
          :label="'所需信息' + (index + 1)"
          v-for="(item,index) in addForm"
          :key="item+index"
        >
          <el-form
            :inline="true"
            :model="item"
            ref="formRef"
            label-width="100px"
            :rules="addFormRules"
          >
            <el-form-item prop="titleName" style="width: 10vw;">
              <el-input v-model="item.titleName" :disabled="disabledDel" placeholder="标题名称"></el-input>
            </el-form-item>
            <el-form-item style="width: 7vw;" prop="type">
              <el-select v-model="item.type" :disabled="disabledDel" placeholder="类型">
                <el-option label="输入框" :value="0"></el-option>
                <el-option label="文本域" :value="1"></el-option>
                <el-option label="单选" :value="2"></el-option>
                <el-option label="多选" :value="3"></el-option>
                <el-option label="引入字典" :value="4"></el-option>
                <el-option label="地址选择" :value="5"></el-option>
                <el-option label="资料上传" :value="6"></el-option>
                <el-option label="部门选择" :value="7"></el-option>
                <el-option label="日期区间选择器" :value="8"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-if="item.type===2||item.type===3" prop="value">
              <el-input :disabled="disabledDel" v-model="item.value" placeholder="多个选项用 ' / ' 分割"></el-input>
            </el-form-item>
            <el-form-item v-if="item.type===4" style="width: 8vw;" prop="value">
              <el-select
                v-model="item.value"
                filterable
                :disabled="disabledDel"
                placeholder="字典名"
                clearable
              >
                <el-option v-for="item in dictNameList" :key="item" :label="item" :value="item"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-if="!disabledDel">
              <i
                class="el-icon-circle-plus-outline"
                style="scale: 1.5;margin-right: 10px;"
                @click="addOne"
              ></i>
              <i
                class="el-icon-remove-outline"
                v-if="addForm.length>1"
                style="scale: 1.5;"
                @click="removeOne(item)"
              ></i>
            </el-form-item>
          </el-form>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer" v-if="disabledDel">
        <el-button @click="showApprovalForm(rowData)">查看审批详情</el-button>
      </span>
      <span slot="footer" class="dialog-footer" v-else>
        <el-button @click="addClose">取 消</el-button>
        <el-button type="primary" @click="addFlowDialog">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 新增审批弹层 -->
    <el-dialog
      :title="isApprove ? '修改审批' : '新增审批'"
      :visible.sync="approvalDialog"
      v-if="approvalDialog"
      width="40%"
      :before-close="approvalClose"
    >
      <el-form :model="examineAddDTO" ref="refAppFlow" :rules="appFlowRules" label-width="100px">
        <el-form-item label="流程名称" prop="workflowName">
          <el-input style="width: 70%" v-model="examineAddDTO.workflowName" disabled></el-input>
        </el-form-item>
        <el-form-item label="查看人" prop="checked">
          <el-cascader
            v-model="examineAddDTO.checked"
            :options="options"
            :show-all-levels="false"
            :props="{children: 'children', label: 'deptName', value:'deptId', checkStrictly: true, multiple: true}"
            clearable
            placeholder="选择查看人"
            :disabled="disabledDel"
          ></el-cascader>
        </el-form-item>
        <el-form-item
          :label="'审批人' + (index+1)"
          v-for="(item,index) in examineForm"
          :key="item+index"
        >
          <el-form :inline="true" :model="item">
            <el-form-item style="width: 6vw;">
              <el-cascader
                v-model="item.superStatus"
                :options="addOptions"
                :show-all-levels="false"
                :props="{children: 'children', label: 'deptName', value:'deptId', checkStrictly: true,}"
                clearable
                placeholder="选择审批人"
                :disabled="disabledDel"
              ></el-cascader>
            </el-form-item>
            <el-form-item>
              <el-form :inline="true">
                <span>时效性：</span>
                <el-form-item style="width: 4vw;">
                  <el-select :disabled="disabledDel" v-model="item.day" placeholder>
                    <el-option v-for="one in 6" :key="one" :label="one" :value="one"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item style="width: 4vw;">
                  <el-select :disabled="disabledDel" v-model="item.timeQty" placeholder>
                    <el-option label="天" value="天"></el-option>
                    <el-option label="周" value="周"></el-option>
                    <el-option label="月" value="月"></el-option>
                  </el-select>
                </el-form-item>
              </el-form>
            </el-form-item>
            <el-form-item>
              <span>反馈：</span>
              <el-select
                v-model="item.feedback"
                placeholder
                :disabled="disabledDel"
                style="width: 4vw;"
              >
                <el-option label="是" value="是"></el-option>
                <el-option label="否" value="否"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <span>分配：</span>
              <el-select
                v-model="item.isAllocation"
                placeholder
                :disabled="disabledDel"
                style="width: 4vw;"
              >
                <el-option label="是" :value="1"></el-option>
                <el-option label="否" :value="0"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-if="!disabledDel">
              <i
                class="el-icon-circle-plus-outline"
                style="scale: 1.5;margin-right: 10px;"
                @click="examineAddOne"
              ></i>
              <i
                class="el-icon-remove-outline"
                v-if="examineForm.length>1"
                style="scale: 1.5;"
                @click="removeExamineOne(item)"
              ></i>
            </el-form-item>
          </el-form>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer" v-if="!disabledDel">
        <el-button @click="approvalClose()">取 消</el-button>
        <el-button type="primary" @click="submitExamine()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  department,
  addFlow,
  deleteFlow,
  addExamine,
  flowDetail,
  editFlow,
  editExamine,
  getMyFlows,
} from '@/api/routine/configure.js'
import { getDictDataList } from '@/api/dict/dict.js'
import { getParentId } from '@/api/index/index.js'
import { getDeptTreeData } from '@/utils/common'
export default {
  name: 'Configure',
  data() {
    return {
      // 控制新增发起流程必填选项
      addRules: {
        workflowName: [
          { required: true, message: '请填写流程名称', trigger: 'blur' },
        ],
        examine: [{ required: true, message: '请选择', trigger: 'change' }],
        isAssess: [
          { required: true, message: '请选择使用部门', trigger: 'change' },
        ],
        performance: [
          { required: true, message: '请输入绩效分', trigger: 'blur' },
        ],
      },
      addFormRules: {
        titleName: [{ required: true, message: '请填写名称', trigger: 'blur' }],
        type: [{ required: true, message: '请选择', trigger: 'change' }],
        value: [{ required: true, message: '内容不能为空' }],
      },
      // 控制审批信息必填校验
      appFlowRules: {
        checked: [
          { required: true, message: '请选择查看人', trigger: 'change' },
        ],
      },
      // 控制详情不可输入
      disabledDel: false,
      // 详情弹层
      showDetail: false,
      // 字典名集合
      dictNameList: [],
      // 添加/修改 发起流程标识
      isAddFlow: false,
      // 是否已审批标识
      isApprove: false,
      // 加载
      loading: false,
      // 组织架构
      options: [],
      addOptions: [],
      // 流程列表
      flowList: [],
      // 配置审批流程
      approvalDialog: false,
      examineAddDTO: {
        workflowName: '',
        deptList: [],
        workAddId: null,
        checked: [],
        id: null,
      },
      // 审批所需信息
      examineForm: [
        {
          day: '',
          timeQty: '',
          timekiness: '',
          feedback: '',
          superStatus: '',
          isAllocation: null,
          sort: null,
        },
      ],
      // 新增流程
      evaluateFillVO: {
        id: null,
        list: [],
        examine: [],
        workflowName: '',
        isAssess: null,
        performance: null,
      },
      addDialog: false,
      // 流程所需信息
      addForm: [
        {
          titleName: '',
          type: null,
          value: '',
        },
      ],
      // 列表请求入参
      reqListParams: {
        keyword: '',
        pageNum: 1,
        pageSize: 20,
      },
      total: 0,
      // 当条数据
      rowData: {},
    }
  },
  async created() {
    await this.getDeptInfo()
    this.getDictList()
    await this.getFlowList()
  },
  methods: {
    // 关闭详情
    closeDel() {
      this.showDetail = false
      this.approveDel = []
    },

    // 打开详情弹层
    async openDel(row) {
      this.editFlowData(row)
      this.rowData = { ...row }
      this.disabledDel = true
      // console.log('1111', this.rowData)
      // console.log('2222', this.examineAddDTO)
    },

    // 获取所有字典名称
    async getDictList() {
      const res = await getDictDataList({ keywords: '' })
      res.data.records.forEach((item) => {
        this.dictNameList.push(item.dictName)
      })
      // console.log('字典名列表', this.dictNameList)
      // console.log('字典数据', res)
    },

    // 查看流程详情
    async flowDel(id) {
      console.log('id', id)
      const res = await flowDetail(id)
      this.examineAddDTO.id = res.data?.examineAdd?.id
      if (res.data.deptList?.length > 0) {
        this.examineForm = [...res.data.deptList]
        this.examineForm = this.examineForm.map((item) => {
          let dayValue = item.timekiness ? item.timekiness[0] : ''
          let timeQtyValue = item.timekiness ? item.timekiness[1] : ''
          this.$set(item, 'day', dayValue)
          this.$set(item, 'timeQty', timeQtyValue)
          return item
        })
      }
      let deptId = res.data.examineAdd?.checked.split(',')
      let promiseArr = deptId.map(async (item) => {
        const res = await getParentId({ deptId: +item })
        res.data.splice(0, 1)
        return res.data
      })
      await Promise.all(promiseArr).then((res) => {
        this.$nextTick(() => {
          console.log('12243', res)
          if (res[0].length > 0) {
            this.examineAddDTO.checked.push(...res)
          } else {
            this.examineAddDTO.checked = []
          }
        })
      })
    },

    // 提交审批
    async submitExamine() {
      await this.$refs.refAppFlow.validate()
      this.approvalDialog = false
      // 处理审批流程条数据
      this.examineForm.forEach((item, index) => {
        if (Array.isArray(item.superStatus)) {
          item.superStatus = +item.superStatus[item.superStatus.length - 1]
        }
        item.timekiness = item.day + item.timeQty
        delete item.day
        delete item.timeQty
        item.sort = index + 1
      })
      let deptId = []
      this.examineAddDTO.checked.forEach((item) => {
        if (Array.isArray(item)) {
          item = +item[item.length - 1]
          deptId.push(item)
        }
      })
      this.examineAddDTO.checked = deptId
      console.log('123314', this.examineForm)
      if (!this.isApprove) {
        const res = await addExamine({
          deptList: [...this.examineForm],
          workAddId: this.examineAddDTO.workAddId,
          array: this.examineAddDTO.checked,
        })
        if (res.code === 200) {
          this.$message.success('新增审批成功')
        }
      } else {
        const res = await editExamine({
          deptList: [...this.examineForm],
          workAddId: this.examineAddDTO.workAddId,
          array: this.examineAddDTO.checked,
          id: this.examineAddDTO.id,
        })
        if (res.code === 200) {
          this.$message.success('修改审批成功')
        }
      }
      this.approvalClose()
    },

    // 新增/修改 审批
    async showApprovalForm(row) {
      console.log('row', row.id)
      if (row.ex === 0) {
        this.isApprove = false
      } else {
        await this.flowDel(row.id)
        this.isApprove = true
      }
      console.log('aaaaa', this.examineAddDTO.checked)
      this.examineAddDTO.workflowName = row.workflowName
      this.examineAddDTO.workAddId = row.id
      this.approvalDialog = true
    },

    // 关闭配置审批流程弹层
    approvalClose() {
      this.approvalDialog = false
      this.getFlowList()

      this.examineAddDTO.deptList = []
      this.examineAddDTO.workflowName = ''
      this.examineAddDTO.checked = []
      this.examineAddDTO.workAddId = null
      this.examineAddDTO.id = null
      this.examineForm = [
        {
          day: '',
          timeQty: '',
          timekiness: '',
          feedback: '',
          superStatus: '',
          isAllocation: null,
          sort: null,
        },
      ]
      // this.rowData = {}
    },

    // 删除流程
    deleteFlow(id) {
      this.$to(
        this.$confirm('确定删除此流程？', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          beforeClose: async (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true
              instance.confirmButtonText = '删除中...'
              await deleteFlow(id)
              instance.confirmButtonLoading = false
              await done()
              await this.getFlowList()
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

    // 获取部门组织架构信息
    async getDeptInfo() {
      const res = await department()
      let optionList = await getDeptTreeData(res.data)
      this.options = [...optionList]
      this.addOptions = [...optionList]
      let superior = { deptName: '上级领导', deptId: 0 }
      this.addOptions.push(superior)
      // console.log(this.options, this.addOptions)
    },

    // 新增审批流程条
    examineAddOne() {
      this.examineForm.push({
        day: '',
        timeQty: '',
        timekiness: '',
        feedback: '',
        superStatus: '',
        isAllocation: null,
        sort: null,
      })
    },

    // 删除审批流程条
    removeExamineOne(item) {
      console.log(item)
      let index = this.examineForm.indexOf(item)
      if (index != -1) {
        this.examineForm.splice(index, 1)
      }
    },

    // 打开发起流程弹层
    showAddDialog() {
      this.addDialog = true
      this.isAddFlow = false
    },

    // 提交新增/修改 发起流程
    async addFlowDialog() {
      // 校验表单
      await this.$refs.refFlow.validate()
      console.log('this', this)
      // let isValidate
      // await this.$refs.formRef.forEach(async (item) => {
      //   console.log('item', item)
      //   isValidate = await item.validate()
      // })
      this.addDialog = false
      this.evaluateFillVO.examine = JSON.stringify(this.evaluateFillVO.examine)
      this.evaluateFillVO.performance = +this.evaluateFillVO.performance
      this.evaluateFillVO.list = [...this.addForm]
      if (!this.isAddFlow) {
        const res = await addFlow({ ...this.evaluateFillVO })
        if (res.code === 200) {
          this.$message.success('新增流程成功')
        }
      } else {
        const res = await editFlow({ ...this.evaluateFillVO })
        if (res.code === 200) {
          this.$message.success('修改流程成功')
        }
      }
      this.addClose()
    },

    // 修改流程
    editFlowData(row) {
      console.log('row', row)
      this.isAddFlow = true
      this.evaluateFillVO.workflowName = row.workflowName
      this.evaluateFillVO.isAssess = row.isAssess
      this.evaluateFillVO.performance = row.performance
      this.evaluateFillVO.id = row.id
      this.evaluateFillVO.examine = JSON.parse(row.examine)
      this.performance = row.performance
      row.list?.forEach((item) => {
        delete item.createTime
        delete item.id
        delete item.status
        delete item.updateTime
        delete item.workAddId
      })
      this.addForm = [...row.list]
      this.addDialog = true
      if (this.addForm.length === 0) {
        this.addOne()
      }
      // console.log('addForm', this.addForm)
      // console.log(this.evaluateFillVO)
    },

    // 删除流程条
    removeOne(item) {
      let index = this.addForm.indexOf(item)
      if (index !== -1) {
        this.addForm.splice(index, 1)
      }
    },

    // 新增流程条
    addOne() {
      this.addForm.push({
        titleName: '',
        type: null,
        value: '',
      })
    },

    // 关闭新增流程弹层
    async addClose() {
      this.addDialog = false
      this.evaluateFillVO.list = []
      this.evaluateFillVO.examine = []
      this.evaluateFillVO.workflowName = ''
      this.evaluateFillVO.isAssess = null
      this.evaluateFillVO.performance = null
      this.addForm = [
        {
          titleName: '',
          type: null,
          value: '',
        },
      ]
      await this.$refs.refFlow.resetFields()
      console.log('this', this)
      this.$refs.formRef.forEach(async (item) => {
        await item.resetFields()
      })
      this.disabledDel = false
      this.getFlowList()
    },

    // 获取配置流程列表
    async getFlowList() {
      this.loading = true
      const res = await getMyFlows(this.reqListParams)
      this.flowList = res.data.records
      this.total = res.data.total
      this.loading = false
    },
  },
}
</script>

<style scoped>
.page_configure {
  padding: 40px;
}
</style>