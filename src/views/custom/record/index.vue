<template>
  <div class="baseData_bigCustomer" ref="baseDataBigCustomer">
    <!-- 搜索 -->

    <div class="table-top">
      <div class="page-search">
        <el-form class="page-search" inline ref="page-filter">
          <el-form-item label="客户名称：" style="margin-right: 20px">
            <el-input placeholder="请输入关键字" v-model="serchParams.name" class="handle-input"></el-input>
          </el-form-item>
          <el-form-item label="跟进负责人：" style="margin-right: 10px">
            <el-cascader v-model="serchParams.leader" :options="selectDataAll.leader" :show-all-levels="false"
              @change="changeLeader" :props="{
                children: 'children',
                label: 'deptName',
                value: 'deptName',
                checkStrictly: false,
              }" clearable></el-cascader>
          </el-form-item>
          <el-form-item label="客户所在地：" style="margin-right: 10px">
            <el-select v-model="serchParams.areaType" clearable filterable>
              <el-option v-for="(item, index) in selectDataAll.areaType" :key="item.value" :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="客户类型：" style="margin-right: 10px">
            <el-select v-model="serchParams.businessType" clearable filterable>
              <el-option v-for="(item, index) in selectDataAll.businessType" :key="item.uuid" :label="item.name"
                :value="item.uuid">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="是否成交：" style="margin-right: 10px">
            <el-select v-model="serchParams.isSale" clearable filterable >
              <el-option v-for="(item, index) in selectDataAll.isSale" :key="item.code" :label="item.name"
                :value="item.code">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="topSearch">搜索</el-button>
          </el-form-item>
          <br />
        </el-form>
      </div>
      <!-- 上表格 -->
      <el-table :data="topRecordData" fit style="width: 100%" max-height="400" highlight-current-row ref="topTableRef"
        @current-change="handleCurrentChange" border>
        <el-table-column type="index" fixed="left" label="序号" width="70" align="center"
          show-overflow-tooltip></el-table-column>
        <el-table-column v-for="(item, index) in topDataList" :key="index" :prop="item.prop" :label="item.label"
          min-width="120" align="center" show-overflow-tooltip></el-table-column>
      </el-table>
      <!-- 分页 -->
      <pagination v-show="topTotal > 0" :total="topTotal" :page.sync="serchParams.page"
        :limit.sync="serchParams.pageSize" @pagination="topPageChange" />
    </div>

    <div class="table-btm">
      <div class="page-search">
        <el-form class="page-search" inline ref="page-filter">
          <el-form-item>
            <el-button type="primary" icon="el-icon-plus" @click="addOrder">新增</el-button>
          </el-form-item>
          <el-form-item label="支付日期：" style="margin-right: 20px">
            <el-date-picker v-model="timeArr" :clearable="true" type="daterange" align="right" unlink-panels
              value-format="timestamp" @change="changeTime" style="padding-right: 20px"></el-date-picker>
          </el-form-item>
          <el-form-item label="订单号：" style="margin-right: 20px">
            <el-input placeholder="请输入订单号" v-model="btmSearchParams.originalOrderId" class="handle-input"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="btmSearch">搜索</el-button>
          </el-form-item>
        </el-form>
      </div>
      <!-- 下表格 -->
      <el-table :data="btmRecordData" v-loading="btmLoading" fit style="width: 100%" max-height="400" border>
        <el-table-column type="index" fixed="left" label="序号" width="70" align="center"
          show-overflow-tooltip></el-table-column>
        <el-table-column v-for="(item, index) in bomDataList" :prop="item.prop" :label="item.label" min-width="120"
          align="center" show-overflow-tooltip :key="index"></el-table-column>
        <el-table-column fixed="right" align="center" label="操作" min-width="200">
          <template v-slot="{ row }">
            <el-button size="mini" type="text" icon="el-icon-edit" @click="delRowDetail(row)">删除</el-button>
            <el-button size="mini" type="text" icon="el-icon-view" @click="getRowDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <pagination v-show="btmTotal > 0" :total="btmTotal" :page.sync="btmSearchParams.page"
        :limit.sync="btmSearchParams.pageSize" @pagination="getBtmList" />
    </div>

    <!-- 新增弹层 -->
    <Dialog v-if="showAddDialog" :row.sync="currentRow" :showAddDialog.sync="showAddDialog" @close="closeAdd">
    </Dialog>

    <!-- 详情弹层 -->
    <el-dialog title="详情" :visible="showDownload" @close="closeDetail" width="60%">
      <!-- 表格 -->
      <el-table :data="detailRecordData" fit style="width: 100%" max-height="600" border>
        <el-table-column type="index" fixed="left" label="序号" width="70" align="center"
          show-overflow-tooltip></el-table-column>
        <el-table-column v-for="(item, index) in detailDataList" :key="index" :prop="item.prop" :label="item.label"
          min-width="120" align="center" show-overflow-tooltip></el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import Dialog from './components/Dialog'
import { dealListTop, detail, queryList, deleteItem, isSaleOption } from '@/api/customer/record'
import { department } from '@/api/information/department'
import { getDeptTreeData } from '@/utils/common'
import { getDictData } from '@/api/dict/dict'


export default {
  components: {
    Dialog
  },
  data() {
    return {
      // 上面的表单
      topDataList: [
        { prop: 'code', label: '公司信用编码' },
        { prop: 'name', label: '客户名称' },
        { prop: 'contacts', label: '客户联系人' },
        { prop: 'areaTypeName', label: '客户所在地' },
        { prop: 'level', label: '客户等级' },
        { prop: 'leader', label: '跟进负责人' },
        { prop: 'businessType', label: '客户类型' },
        { prop: 'isSaleName', label: '是否成交' }
      ],
      // 上面的表单
      bomDataList: [
        { prop: 'originalOrderId', label: '订单号' },
        { prop: 'payTime', label: '支付日期' },
        { prop: 'quantity', label: '成交数量' },
        { prop: 'discountsPrice', label: '成交金额' }
      ],
      // 详情表单
      detailDataList: [
        { prop: 'showName', label: '产品名称' },
        { prop: 'specsName', label: '规格名称' },
        { prop: 'quantity', label: '数量' },
        { prop: 'paymentPrice', label: '金额' }
      ],
      // 上面表格的数据
      topRecordData: [],
      topTotal: 0,
      // 下面表格的数据
      btmRecordData: [],
      btmTotal: 0,
      // 详情表格的数据
      detailRecordData: [],
      // 当前选择的行
      currentRowId: '',
      // 当前选择的行
      currentRow: {},
      // 当前选择的行的数据
      currentIndex: {},
      // 日期
      timeArr: [],
      // 上表搜索参数
      serchParams: {
        "name": "",
        "leader": "",
        "areaType": '',
        "businessType": "",
        "isSale": '',
        "page": 1,
        "pageSize": 10
      },
      // 下表搜索参数
      btmSearchParams: {
        "originalOrderId": "",//	订单号
        "page": 1,
        "pageSize": 10,
        "payTimeEnd": "",
        "payTimeStart": "",
        "uuid": ""
      },
      // 下拉框数据
      selectDataAll: {
        leader: [],
        areaType: [
          {
            label: '国内',
            value: 1
          },
          {
            label: '国外',
            value: 2
          }
        ],
        businessType: [],
        isSale: [
          {
            label: '是',
            value: 1
          },
          {
            label: '否',
            value: 0
          }
        ]
      },
      // 详情显示
      showDownload: false,
      // 新增显示
      showAddDialog: false,
      // 下表加载状态
      btmLoading: false,

    }
  },
  created() {
    this.getTopList()
    this.getSelectData()

  },
  methods: {
    // 滚动条设置到下表位置
    scrollToBottom() {
      this.$refs.baseDataBigCustomer.scrollTop = document.body.scrollHeight
      console.log('document.body.scrollHeight: ', document.body.scrollHeight);
    },
    // 修改负责人
    changeLeader(val) {
      console.log('val: ', val);
      if (Array.isArray(this.serchParams.leader)) {
        if (this.serchParams.leader.length > 0) {
          this.serchParams.leader =
            this.serchParams.leader[this.serchParams.leader.length - 1]
        } else {
          this.serchParams.leader = ''
          console.log('this.serchParams.leader', this.serchParams.leader)
        }
      }
    },
    // 选择上表行数据
    handleCurrentChange(val) {
      console.log('val: ', val);
      if (!val) return
      console.log('选择上表行数据');
      this.timeArr = []
      this.btmSearchParams.payTimeEnd = ''
      this.btmSearchParams.payTimeStart = ''
      this.btmSearchParams.originalOrderId = ''
      this.currentRow = val
      this.btmSearchParams.uuid = this.currentRow.uuid
      console.log('this.btmSearchParams: ', this.btmSearchParams);
      this.getBtmList()
      this.getCurrentRowIndex(val)
    },
    // 选择某行
    setCurrent(row) {
      console.log('row=======: ', row);
      console.log('this.$refs.topTableRef: ', this.$refs.topTableRef);
      this.$refs.topTableRef.setCurrentRow(row);
    },
    // 获取当前行数据在数据列表中的值
    getCurrentRowIndex(row) {
      console.log('row: ', row);
      this.topRecordData.filter((item, index) => {
        if (item.uuid === row.uuid) {
          this.currentIndex = index
        }
      })
      console.log('this.currentIndex: ', this.currentIndex);
    },
    // 获取上表数据
    async getTopList() {
      console.log('获取上表数据');
      console.log('this.serchParams: ', this.serchParams);

      let res = await dealListTop(this.serchParams)
      this.topTotal = res.data.total
      this.topRecordData = res.data.records
    },
    // 获取下表数据
    async getBtmList() {
      this.btmLoading = true
      console.log('获取下表数据');
      let res = await queryList(this.btmSearchParams)
      this.btmTotal = res.data.total
      this.btmRecordData = res.data.records
      this.btmLoading = false

    },
    // 获取详情
    async getRowDetail(row) {
      console.log('获取详情row: ', row);
      let res = await detail({ originalOrderId: row.originalOrderId })
      this.detailRecordData = res.data
      this.showDownload = true
    },
    //关闭详情
    closeDetail() {
      this.showDownload = false
      this.detailRecordData = []
    },
    // 删除操作
    async delRowDetail(row) {
      this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        console.log('删除行row: ', row);
        let res = await deleteItem({ uuid: row.uuid })
        if (res.data) {
          this.$message({
            message: '删除成功',
            type: 'success'
          })
          await this.getTopList()
          this.setCurrent(this.topRecordData[this.currentIndex])
        }
      }).catch(() => { });


    },
    // 新增
    addOrder() {
      if (!this.currentRow.uuid) {
        this.$message({
          message: '请选择大客户',
          type: 'error'
        })
        return
      }
      console.log('新增');

      this.showAddDialog = true
    },
    // 新增
    async closeAdd() {
      console.log('关闭新增');
      this.showAddDialog = false
      await this.getTopList()
      this.setCurrent(this.topRecordData[this.currentIndex])
    },
    // 上表搜索
    topSearch() {
      console.log('上表搜索');
      console.log('this.serchParams: ', this.serchParams);
      this.currentRow = {}
      this.btmRecordData = []
      this.btmTotal = 0
      this.serchParams.page = 1
      this.serchParams.pageSize = 10
      this.getTopList()
    },
    // 上表分页
    topPageChange() {
      console.log('上表分页');
      this.currentRow = {}
      this.btmRecordData = []
      this.getTopList()
    },
    // 下表搜索
   async btmSearch() {
      console.log('下表搜索: ', this.btmSearchParams);
      this.btmSearchParams.page = 1
      this.btmSearchParams.pageSize = 10
      await this.getBtmList()
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },
    // 获取下拉框信息
    getSelectData() {
      console.log('获取下拉框信息');
      this.getDeptTree()
      this.getBusinessType()
      this.getIsSaleOption()
    },
    // 更改时间
    changeTime(val) {
      console.log('val: ', val);
      if (val) {
        this.btmSearchParams.payTimeStart = val[0]
        this.btmSearchParams.payTimeEnd = val[1]
      } else {
        this.btmSearchParams.payTimeStart = ''
        this.btmSearchParams.payTimeEnd = ''
      }

    },
    // 设置默认时间
    setDefaultTime() {
      const now = new Date()
      // 设置当月第一天
      now.setDate(1)
      // 设置时分秒为0
      now.setHours(0, 0, 0, 0)
      // 获取时间戳
      const timestamp = now.getTime() + ''
      this.timeArr = [timestamp, timestamp]
      this.btmSearchParams.payTimeStart = timestamp
      this.btmSearchParams.payTimeEnd = timestamp

    },

    // 负责人组织架构数据
    async getDeptTree() {
      const res = await department()
      this.selectDataAll.leader = await getDeptTreeData(res.data)
      console.log('this.selectDataAll.leader : ', this.selectDataAll.leader);
    },

    // 获取客户类型
    async getBusinessType() {
      const res = await getDictData({
        itemKey: 'business_type',
      })
      this.selectDataAll.businessType = res.data
      console.log('this.businessTypeData: ', this.selectDataAll.businessType);
    },

    // 获取是否成交下拉框
    async getIsSaleOption() {
      let res = await isSaleOption()
      console.log('res: ', res);
      this.selectDataAll.isSale = res.data
    },
  }
}
</script>

<style scoped lang="scss">
.table-top {
  padding: 10px;
}

.table-btm {
  padding: 10px;

}
</style>
