<template>
  <div class="content">
    <div class="header">
      <div class="top">
        <div class="chart-wrapper" style="margin-right: 60px;">
          <div class="yarnText" style="font-size: 30px;">
            <div>年</div>
            <div>目</div>
            <div>标</div>
          </div>
          <div class="progressItem">
            <el-progress
              type="circle"
              :width="100"
              :stroke-width="10"
              :percentage="yearComplete ? +yearComplete.complete : 0"
            ></el-progress>
          </div>
        </div>
        <div class="chart-wrapper">
          <div class="yarnText" style="font-size: 24px;">
            <div>季</div>
            <div>目</div>
            <div>标</div>
          </div>
          <div v-for="(item,index) in quarterComplete" :key="index" class="progressItem">
            <el-progress
              type="circle"
              :width="80"
              :stroke-width="8"
              :percentage="item ? +item.complete : 0"
            ></el-progress>
          </div>
        </div>
      </div>
      <div class="chart-month">
        <div v-for="(item,index) in monthComplete" :key="index" class="month-data">
          <div style="font-size: 20px; font-weight: 600;">{{ index + 1 + '月' }}</div>
          <div class="monthItem">
            <el-progress
              type="circle"
              :width="60"
              :stroke-width="8"
              :percentage="item ? +item.complete : 0"
            ></el-progress>
          </div>
        </div>
      </div>
      <el-form style="margin-top: 10px;" inline ref="page-filter" label-width="auto">
        <el-form-item style="margin-right: 20px;" label="部门：">
          <el-cascader
            v-model="selectDeptId"
            :options="deptDataList"
            :show-all-levels="false"
            :props="{children: 'children',label: 'deptName', value:'deptId', multiple: true, }"
            collapse-tags
            clearable
          ></el-cascader>
        </el-form-item>
        <el-form-item style="margin-right: 20px;" label="产品名称：">
          <el-select
            v-model="goalDTO.pruductName"
            style="width: 8vw;"
            clearable
            filterable
            placeholder="请选择"
          >
            <el-option
              v-for="item,index in optionsData.productName"
              :key="index"
              :label="item"
              :value="item"
              filterable
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin-right: 20px;" label="平台名称：">
          <el-select
            v-model="goalDTO.shopName"
            style="width: 8vw;"
            clearable
            filterable
            placeholder="请选择"
          >
            <el-option
              v-for="item,index in optionsData.platfrom"
              :key="index"
              :label="item"
              :value="item"
              filterable
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin-right: 20px;" label="链接名称：">
          <el-select
            v-model="goalDTO.url"
            style="width: 8vw;"
            clearable
            filterable
            placeholder="请选择"
          >
            <el-option
              v-for="item,index in optionsData.shopId"
              :key="index"
              :label="item"
              :value="item"
              filterable
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="getList()">搜索</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table
      ref="multipleTable"
      v-loading="tableLoading"
      :data="tableData "
      style="width: 100%;margin-top:20px"
    >
      <el-table-column prop="deptName" label="事业部" align="center"></el-table-column>
      <el-table-column prop="dumpName" label="团" align="center"></el-table-column>
      <el-table-column prop="userName" label="员工" align="center"></el-table-column>
      <el-table-column show-overflow-tooltip prop="shopName" label="店铺" align="center"></el-table-column>
      <el-table-column prop="productName" label="产品" align="center"></el-table-column>
      <el-table-column prop="url" label="链接" align="center"></el-table-column>
      <el-table-column prop="lineNumTarget" label="目标订单" align="center"></el-table-column>
      <el-table-column prop="lineNumReality" label="订单量" align="center"></el-table-column>
      <el-table-column prop="completeRare" label="订单完成度" align="center">
        <template v-slot="{row}">
          <span>{{ row.completeRare }} %</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="goalDTO.page"
      :limit.sync="goalDTO.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import {
  getDataList,
  getOptionData,
  getDeptData,
} from '@/api/targetManage/targetOverview.js'
import { getDeptTreeData } from '@/utils/common'
export default {
  name: 'TargetManage',
  data() {
    return {
      goalDTO: {
        deptId: [],
        num: '',
        page: 1,
        pageSize: 20,
        pruductName: '',
        shopName: '',
        url: '',
      },
      total: 0,
      tableLoading: false,
      // 列表数据
      tableData: [],
      // 年数据
      yearComplete: {},
      // 季数据
      quarterComplete: [],
      // 月数据
      monthComplete: [],
      // 查询数据
      optionsData: [],
      // 部门数据
      deptDataList: [],
      // 搜索时选中的部门数据
      selectDeptId: [],
    }
  },
  created() {
    this.getList()
    this.getOptions()
    this.getDeptData()
  },
  methods: {
    // 获取列表数据
    async getList() {
      // 先制空再判断处理数据
      this.goalDTO.deptId = []
      this.quarterComplete = []
      this.monthComplete = []
      if (this.selectDeptId.length > 0) {
        const uuidList = []
        this.selectDeptId.forEach((item) => {
          const one = item[item.length - 1]
          let stringOne = one.toString()
          if (stringOne.length > 10) {
            uuidList.push(one)
          }
        })
        this.goalDTO.deptId = uuidList
      }
      const res = await getDataList(this.goalDTO)
      this.tableData = res.data.core.records
      console.log('res', this.tableData)
      this.total = res.data.core.total
      console.log('total', this.total)
      this.yearComplete = res.data.goalSales.goalSales.yearComplete
      this.quarterComplete.push(res.data.goalSales.goalSales.oneComplete)
      this.quarterComplete.push(res.data.goalSales.goalSales.twComplete)
      this.quarterComplete.push(res.data.goalSales.goalSales.threeComplete)
      this.quarterComplete.push(res.data.goalSales.goalSales.fourComplete)
      console.log('quarterComplete', this.quarterComplete)
      let dataArr = { ...res.data.goalSales.goalSales }
      console.log('dataArr', dataArr)
      delete dataArr.yearComplete
      delete dataArr.oneComplete
      delete dataArr.twComplete
      delete dataArr.threeComplete
      delete dataArr.fourComplete
      this.monthComplete = Object.values(dataArr)
      // console.log('111111', this.monthComplete)
    },
    // 获取下拉框数据
    async getOptions() {
      const res = await getOptionData()
      this.optionsData = res.data
    },
    // 获取部门数据
    async getDeptData() {
      const res = await getDeptData('业务指挥中心')
      const newData = await getDeptTreeData(res.data.children)
      this.deptDataList = newData
    },
  },
}
</script>

<style scoped>
.content {
  padding: 40px;
}
.progressItem {
  background-color: #95c0f5;
  padding: 10px;
  border-radius: 3px;
  margin-right: 40px;
}
.monthItem {
  background-color: #95c0f5;
  padding: 10px;
  border-radius: 3px;
  margin-top: 5px;
}
.top {
  display: flex;
}
.yarnText {
  color: #333;
  font-weight: 600;
  margin-right: 20px;
}
.chart-wrapper {
  display: flex;
  align-items: center;
}
.chart-month {
  margin-top: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.month-data {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}
</style>