<template>
  <div style="padding: 40px;">
    <el-form class="page-search" inline ref="page-filter">
      <el-form-item label="时间：" style="margin-right: 20px;">
        <el-date-picker
          v-model="selectTime"
          value-format="timestamp"
          type="month"
          placeholder="选择月"
          @change="monthChange"
        ></el-date-picker>
      </el-form-item>
    </el-form>
    <div>
      <el-table :data="tableData" v-loading="tableLoding" style="width: 100%" max-height="600">
        <el-table-column prop="merchantCode" fixed label="商家编码" width="200" align="center"></el-table-column>
        <el-table-column
          prop="productName"
          fixed
          label="货品名称"
          width="150"
          show-overflow-tooltip
          align="center"
        ></el-table-column>
        <el-table-column
          prop="specificationsName"
          show-overflow-tooltip
          fixed
          width="130"
          label="规格名称"
          align="center"
        ></el-table-column>
        <el-table-column prop="weight" fixed label="重量" align="center"></el-table-column>
        <el-table-column prop="wareshourse" fixed label="实时库存" align="center"></el-table-column>
        <el-table-column prop="inventory" fixed label="产品拉货明细" show-overflow-tooltip align="center"></el-table-column>
        <el-table-column prop="montNum" fixed label="月度销售" align="center"></el-table-column>
        <el-table-column
          v-for="weekItem in tableHeadData.dates"
          :key="weekItem.weeks"
          :label="weekItem.weeks"
          align="center"
        >
          <el-table-column
            v-for="personItem in weekItem.names"
            :key="personItem.value"
            :label="personItem.name"
            align="center"
          >
            <template v-slot="{row}">
              <div
                v-if="row.salesManage[weekItem.weeks]"
              >{{ row.salesManage[weekItem.weeks][personItem.value] }}</div>
            </template>
          </el-table-column>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="reqParams.page"
        :limit.sync="reqParams.pageSize"
        @pagination="getList"
      />
    </div>
  </div>
</template>

<script>
import { getDataList, getTableHead } from '@/api/reportForms/personTable'

export default {
  name: 'PersonTable',
  data() {
    return {
      reqParams: {
        page: 1,
        pageSize: 20,
        time: '',
      },
      tableData: [],
      tableHeadData: {},
      total: 0,
      tableLoding: false,
      selectTime: '',
    }
  },
  async created() {
    await this.getList()
  },
  methods: {
    monthChange(val) {
      console.log(val)
      if (val) {
        this.reqParams.time = val + ''
      } else {
        this.reqParams.time = ''
      }
      this.getList()
    },
    // 获取表头
    async getTableHeaderList() {
      const res = await getTableHead()
      this.tableHeadData = res.data
      // console.log('123', this.tableHeadData)
    },
    // 获取数据
    async getList() {
      this.tableLoding = true
      await this.getTableHeaderList()
      const res = await getDataList({ ...this.reqParams })
      this.total = res.data.total
      this.tableData = res.data.records
      this.tableLoding = false
      // this.tableData[0]
    },
  },
}
</script>

<style scoped>
</style>