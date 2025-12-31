<template>
  <div>
    <div
      v-for="(item, index) in updateTime"
      :key="index"
      style="margin-top: 5px"
    >
      <p class="upadte_time" style="">{{ item }}</p>
    </div>
    <span class="upadte_time" style="color: #409eff">
      百分比
      <el-tooltip
        class="item"
        effect="dark"
        content="售后问题量/飞梭店铺中过滤赠品和配件的总订单数"
        placement="top"
      >
        <svg class="icon" preserveAspectRatio="xMidYMid meet">
          <use xlink:href="#icon-question" fill="#409EFF"></use>
        </svg>
      </el-tooltip>
    </span>
    <div>
      <el-button type="small" @click="openDetailDialog()">明细</el-button>
    </div>
    <div
      style="
        width: 100%;
        display: flex;
        justify-content: space-around;
        margin-bottom: 20px;
      "
    >
      <div v-for="(item, index) in fourQuestion" :key="index">
        <PlainCard
          v-if="fourQuestion.length"
          :title="item.departmentName"
          :num="
            (item.afterSaleByQuantity || '-') +
            ' | ' +
            (item.percentage == null ? '-' : getPercentage(item.percentage))
          "
        >
        </PlainCard>
      </div>
      <!-- <PlainCard></PlainCard>
      <PlainCard></PlainCard>
      <PlainCard></PlainCard>
      <PlainCard></PlainCard> -->
    </div>
    <br />
    <el-radio-group v-model="reqParams.departmentUuid" style="margin-top: 10px">
      <el-radio-button
        type="small"
        v-for="item in titleData"
        :key="item.departmentUuid"
        :label="item.departmentUuid"
        >{{ item.departmentName
        }}<span>({{ item.afterSaleByQuantity }})</span></el-radio-button
      >
    </el-radio-group>
    <div
      style="
        width: 100%;
        display: flex;
        justify-content: space-around;
        margin-top: 10px;
      "
      v-if="chartData.length"
    >
      <div>
        <el-table
          :data="tableData"
          border
          style="margin-right: 20px; max-width: 400px; max-height: 300px"
          v-loading="loading"
        >
          <el-table-column
            prop="date"
            label="序号"
            min-width="30"
            type="index"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="departmentLevelName"
            label="问题类型"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="afterSaleByQuantity"
            label="数量"
            align="center"
          ></el-table-column>
          <el-table-column label="百分比" align="center">
            <template v-slot="{ row }">
              <span>{{ getPercentage(row.percentage) }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <BarChart
        v-if="chartData.length"
        :yData="timeList"
        :TableData="quantityList"
        :title="chartTitle + '问题数量'"
      ></BarChart>
      <BarChartPercent
        v-if="chartData.length"
        :yData="timeList"
        :isPercent="true"
        :TableData="percentageList"
        :title="chartTitle + '问题百分比'"
      ></BarChartPercent>
    </div>
  </div>
</template>

<script>
import BarChart from "../BarChart.vue";
import PlainCard from "../PlainCard.vue";
import BarChartPercent from "../BarChartPercent.vue";
import {
  getFourQuestion,
  getAfterSaleTable,
  getAfterSaleChart,
  getAfterSaleTitle,
} from "@/api/deliveryCenter/afterSale";
import { getFormatDate } from "@/utils/common";
import { getUpdateTime } from "@/api/deliveryCenter/mainBoard";
export default {
  name: "AfterSale",
  props: {
    dateRange: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      tableData: [],
      // 问题数量
      fourQuestion: [],
      // 请求参数
      reqParams: {
        startTime: this.dateRange[0],
        endTime: this.dateRange[1],
        departmentUuid: "",
      },
      // 标题请求参数
      titleParams: {
        startTime: this.dateRange[0],
        endTime: this.dateRange[1],
      },
      loading: false,
      // 标题数据
      titleData: [],
      chartData: [],
      timeList: [],
      quantityList: [],
      percentageList: [],
      chartTitle: "",
      // 更新时间
      updateTime: [],
    };
  },
  async created() {
    this.getUpdateTime();
    // this.getFourQuestion()
    await this.getAfterSaleTitle();
    this.reqParams.departmentUuid = this.titleData[0].departmentUuid;
    // await this.getAfterSaleTable()
    // await this.getAfterSaleChart()
  },
  watch: {
    reqParams: {
      async handler() {
        this.getFourQuestion();
        if (this.reqParams.departmentUuid != "") {
          await this.getAfterSaleTable();
          await this.getAfterSaleChart();
        }
      },
      deep: true,
    },
    titleParams: {
      handler() {
        this.getAfterSaleTitle();
      },
      deep: true,
    },
    dateRange: {
      handler() {
        this.reqParams.startTime = this.dateRange[0];
        this.reqParams.endTime = this.dateRange[1];
        this.titleParams.startTime = this.dateRange[0];
        this.titleParams.endTime = this.dateRange[1];
      },
    },
  },
  components: {
    BarChart,
    PlainCard,
    BarChartPercent,
  },
  methods: {
    // 获取数据更新时间
    async getUpdateTime() {
      const res = await getUpdateTime();
      this.updateTime = res.data;
    },
    // 打开售后明细
    openDetailDialog() {
      this.$router.push({
        path: "../../deliveryCenter/afterSale",
        query: { date: this.dateRange },
      });
    },
    // 获取问题量对应数据
    async getFourQuestion() {
      const res = await getFourQuestion(this.reqParams);
      this.fourQuestion = res.data;
    },
    // 获取售后表格数据
    async getAfterSaleTable() {
      this.loading = true;
      const res = await getAfterSaleTable(this.reqParams);
      this.tableData = res.data;
      this.loading = false;
    },
    // 获取售后图表数据
    async getAfterSaleChart() {
      let reqData = {
        startTime: this.reqParams.startTime - 6 * 24 * 60 * 60 * 1000,
        endTime: this.reqParams.startTime,
        departmentUuid: this.reqParams.departmentUuid,
      };
      this.chartData = [];
      const res = await getAfterSaleChart(reqData);
      this.chartData = res.data.afterSaleQuantityLineChartVOList;
      this.timeList = this.chartData.map((item) =>
        getFormatDate(+item.saleTime)
      );
      this.quantityList = this.chartData.map(
        (item) => item.afterSaleByQuantity
      );
      this.percentageList = this.chartData.map((item) =>
        this.getPercent(item.percentage)
      );
      this.chartTitle = res.data.questionType;
    },
    // 获取标题数据
    async getAfterSaleTitle() {
      const res = await getAfterSaleTitle(this.titleParams);
      this.titleData = res.data;
    },
    getFormatDate(timeStamp) {
      return getFormatDate(timeStamp);
    },
    // 保留两位小数并转成百分比
    getPercentage(num) {
      let numBer = Math.floor((num * 10000).toFixed(1)) / 100 + "%";
      return numBer;
    },
    // 转化成百分比格式
    getPercent(num) {
      return (num * 100).toFixed(2);
    },
  },
};
</script>

<style lang="scss" scoped>
.afterSaleDialog {
  width: 98%;
  height: 96vh;
  margin: 0 auto;
  margin-top: 10px;
}
.upadte_time {
  font-size: 12px;
  line-height: 13px;
  color: gray;
  margin: 0;
}
.icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: #606266;
}
</style>
