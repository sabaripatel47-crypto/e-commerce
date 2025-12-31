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
        <el-table-column
          prop="businessCode"
          fixed
          label="商家编码"
          width="150"
          show-overflow-tooltip
          align="center"
        ></el-table-column>
        <el-table-column
          prop="productName"
          fixed
          label="货品名称"
          show-overflow-tooltip
          width="150"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="speName"
          fixed
          label="规格名称"
          show-overflow-tooltip
          width="150"
          align="center"
        ></el-table-column>
        <el-table-column prop="monthSell" fixed label="月度销售" show-overflow-tooltip align="center"></el-table-column>
        <el-table-column
          v-for="headerItem in tableHeadData.datas"
          :key="headerItem.time"
          :label="headerItem.time"
          width="70"
          align="center"
        >
          <template v-slot="{row}">
            <span v-if="row.salesTime[headerItem.state]">{{ row.salesTime[headerItem.state].num }}</span>
          </template>
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
import { getDataList, getTableHead } from '@/api/reportForms/monthInvent'
export default {
  name: 'MonthInvent',
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
      // console.log(val)
      if (val) {
        this.reqParams.time = val + ''
      } else {
        this.reqParams.time = ''
      }
      this.getList()
    },
    // 获取表头
    async getTableHeaderList() {
      const res = await getTableHead({ time: this.reqParams.time + '' })
      this.tableHeadData = res.data
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