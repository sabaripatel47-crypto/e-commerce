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
          width="150"
          fixed
          label="规格名称"
          align="center"
        ></el-table-column>
        <el-table-column prop="weight" fixed label="重量" align="center"></el-table-column>
        <el-table-column prop="wareshourse" fixed label="实时库存" show-overflow-tooltip align="center"></el-table-column>
        <el-table-column
          prop="inventory"
          fixed
          label="产品拉货明细"
          width="100"
          show-overflow-tooltip
          align="center"
        ></el-table-column>
        <el-table-column prop="montNum" fixed label="月度销售" width="80" align="center"></el-table-column>
        <el-table-column
          v-for="headerItem in tableHeadData.datas"
          :key="headerItem.time"
          :label="headerItem.time"
          width="70"
          align="center"
        >
          <template v-slot="{row}">
            <div
              v-if="row.salesTime[headerItem.state]"
              :class="row.salesTime[headerItem.state].color"
            >{{ row.salesTime[headerItem.state].num }}</div>
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
import { getDataList, getTableHead } from '@/api/reportForms/skuTable'
export default {
  name: 'SkuTable',
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
      const res = await getTableHead({ time: this.reqParams.time })
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

<style lang="scss" scoped>
.GREEN {
  margin: auto;
  line-height: 4vh;
  text-align: center;
  width: 3vw;
  height: 4vh;
  color: #fff;
  background-color: green;
}
.RED {
  margin: auto;
  line-height: 4vh;
  width: 5vw;
  height: 4vh;
  color: #fff;
  background-color: rgb(148, 64, 64);
}
.PINK {
  margin: auto;
  line-height: 4vh;
  width: 5vw;
  height: 4vh;
  color: #fff;
  background-color: pink;
}
.ORANGE {
  margin: auto;
  line-height: 4vh;
  width: 5vw;
  height: 4vh;
  color: #fff;
  background-color: orange;
}
</style>