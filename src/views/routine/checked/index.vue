<template>
  <div class="page_configure">
    <!-- 搜索 -->
    <div class="page-search">
      <el-form class="page-search" inline ref="page-filter">
        <el-form-item label="流程名称：" style="margin-right: 20px;">
          <el-input v-model="workAddPageDTO.keyword" clearable placeholder="请输入流程名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="getList()">搜索</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据列表 -->
    <el-table style="width: 100%" max-height="600" :data="dataList" v-loading="loading">
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
      <el-table-column fixed="right" label="操作" align="center">
        <template v-slot="{row}">
          <el-button size="mini" type="text" icon="el-icon-view" @click="getFlowDel(row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
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
    <!-- 分页 -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="workAddPageDTO.pageNum"
      :limit.sync="workAddPageDTO.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { getList } from '@/api/routine/myChecked.js'
import { getInfo, getDeptName } from '@/api/index/index'
import { flowDetail } from '@/api/routine/configure.js'
import { getFlowDetail } from '@/api/routine/initiate.js'
export default {
  name: 'Checked',
  data() {
    return {
      dataList: [],
      workAddPageDTO: {
        keyword: '',
        pageNum: 1,
        pageSize: 20,
      },
      total: 0,
      loading: false,
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
    }
  },
  async created() {
    await this.getList()
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
      const res = await getFlowDetail(row.id)
      this.approveNum = res.data.list?.length
      // this.approveDel = res.data.list
      let list = JSON.parse(res.data.workUser.content)
      list.forEach(async (item) => {
        if (item.type === 3 || item.type === 5) {
          item.value = item.valueArray.join(',')
        } else if (item.type === 8) {
          item.value = item.valueArray.join('至')
        } else if (item.type === 7) {
          let userId = item.valueArray[item.valueArray?.length - 1]
          if (userId?.length > 10) {
            const res = await getInfo(+userId)
            item.value = res.data.userName
          } else {
            const res = await getDeptName(+userId)
            item.value = res.data.deptName
          }
        }
      })
      this.detailList = [...list]
      // console.log('详情', this.detailList)
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

    // 获取数据列表
    async getList() {
      this.loading = true
      const res = await getList(this.workAddPageDTO)
      if (res.data) {
        this.dataList = res.data.records
        this.total = res.data.total
      }
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