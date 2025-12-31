<template>
  <!-- 销售页 -->
  <div>
    <div
      style="
        width: 80%;
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
      "
    >
      <PlainCard
        title="实际销售额"
        :num="getNull(actualSalesAmount)"
        unit="元"
      ></PlainCard>
      <PlainCard
        title="总退款额"
        :num="getNull(refundAmount)"
        unit="元"
      ></PlainCard>
      <PlainCard
        title="售前退款额"
        :num="getNull(preSalesRefund.refundAmount)"
        unit="元"
      ></PlainCard>
      <PlainCard
        title="退款不退货额"
        :num="getNull(noReturnSalesRefund.refundAmount)"
        unit="元"
      ></PlainCard>
      <PlainCard
        title="退货退款的退款额"
        :num="getNull(afterSalesRefund.refundAmount)"
        unit="元"
      ></PlainCard>
    </div>
    <div
      style="
        width: 80%;
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
      "
    >
      <PlainCard
        title="实际成交率"
        :num="getPercentageNull(actualSalesRate)"
        unit="%"
      ></PlainCard>
      <PlainCard
        title="总退款率"
        :num="getPercentageNull(refundRate)"
        unit="%"
      ></PlainCard>
      <PlainCard
        title="售前退款率"
        :num="getPercentageNull(preSalesRefund.refundRate)"
        unit="%"
      ></PlainCard>
      <PlainCard
        title="退款不退货率"
        :num="getPercentageNull(noReturnSalesRefund.refundRate)"
        unit="%"
      ></PlainCard>
      <PlainCard
        title="退货退款率"
        :num="getPercentageNull(afterSalesRefund.refundRate)"
        unit="%"
      ></PlainCard>
      <!-- <PlainCard title="指标偏离度" num="20" unit="%" :type="1"></PlainCard> -->
    </div>
    <div style="margin-top: 10px">
      <el-select
        v-model="barSelectValue"
        multiple
        clearable
        :multiple-limit="4"
        style="width: 400px; margin-right: 20px"
        placeholder="请选择"
        @clear="getSelectBar()"
      >
        <el-option
          v-for="item in barSelect"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
      <el-button type="primary" icon="el-icon-search" @click="getSelectBar()"
        >搜索</el-button
      >
    </div>
    <div
      style="
        width: 80%;
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
      "
    >
      <div style="flex: 1" v-for="(item, index) in barList" :key="index">
        <!-- <bar-chart :option="item" :width="'100%'" :height="'300px'"></bar-chart> -->
        <BarChart
          v-if="item.tableData.length > 0"
          :yData="timeList"
          :isRate="item.isRate"
          :TableData="item.tableData"
          :title="item.title"
        ></BarChart>
      </div>
    </div>
  </div>
</template>

<script>
import PlainCard from "./PlainCard.vue";
import BarChart from "./BarChart.vue";
import {
  getSalesReport,
  getSalesReportBar,
  getPreSalesReport,
  getPreSalesReportBar,
  getAfterSalesReport,
  getAfterSalesReportBar,
  getNoReturnSalesReport,
  getNoReturnSalesReportBar,
} from "@/api/deliveryCenter/salesReport";
import { getFormatDate } from "@/utils/common";

export default {
  name: "SalesReport",
  props: {
    dateRange: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      // 日期区间
      customDateRange: {
        startTime: this.dateRange[0],
        endTime: this.dateRange[1],
      },
      // 柱状图下拉框
      barSelect: [
        { value: 1, label: "销售额" },
        { value: 2, label: "实际销售额" },
        { value: 3, label: "总退款额" },
        { value: 4, label: "售前退款额" },
        { value: 5, label: "退款不退货额" },
        { value: 6, label: "退款退货额" },
      ],
      // 选中的柱状图值
      barSelectValue: [1, 2, 3, 4],
      // 展示的柱状图列表
      barList: [],
      salesReportBar: null,
      // 时间轴
      timeList: [],
      // 实际销售额
      actualSalesAmount: 0,
      // 实际成交率
      actualSalesRate: 0,
      // 退款率
      refundRate: 0,
      // 总退款额
      refundAmount: 0,
      // 售前退款额-售前退款率
      preSalesRefund: {
        refundAmount: 0,
        refundRate: 0,
      },
      // 退款不退货额-退款不退货率
      noReturnSalesRefund: {
        refundAmount: 0,
        refundRate: 0,
      },
      // 退款退货额-退款退货率
      afterSalesRefund: {
        refundAmount: 0,
        refundRate: 0,
      },
      loading: false,
    };
  },
  watch: {
    dateRange: {
      handler(newVal) {
        this.customDateRange = {
          startTime: newVal[0],
          endTime: newVal[1],
        };
        this.getSalesReport();
        this.getSelectBar();
        this.getPreSalesReport();
        this.getNoReturnSalesReport();
        this.getAfterSalesReport();
      },
    },
    barList: {
      handler(newVal) {
        if (this.barList.length > this.barSelectValue.length) {
          const uniqueArr = this.barList.filter(
            (value, index, self) =>
              index === self.findIndex((t) => t.title === value.title)
          );
          this.barList = uniqueArr;
        }
      },
    },
  },
  components: {
    PlainCard,

    BarChart,
  },
  created() {
    this.getSalesReport();
    this.getSelectBar();
    this.getPreSalesReport();
    this.getNoReturnSalesReport();
    this.getAfterSalesReport();
  },
  methods: {
    // 销售、退款、成交率、退款率计算
    async getSalesReport() {
      const res = await getSalesReport(this.customDateRange);
      this.actualSalesAmount = res.data.actualSalesAmount;
      this.actualSalesRate = res.data.actualDealRate;
      this.refundRate = res.data.refundRate;
      this.refundAmount = res.data.totalRefundAmount;
    },
    // 销售额、实际销售额、退款率柱状图
    async getSalesReportBar(item) {
      if (this.salesReportBar === null) {
        this.salesReportBar = await getSalesReportBar(this.customDateRange);
      }
      if (!this.barSelectValue.includes(item)) {
        return false;
      }
      if (
        this.timeList[0] !=
        this.getFormatDate(
          this.salesReportBar.data.salesChartAmountVOList[0].saleTime
        )
      ) {
        return false;
      }
      let barData;
      if (item == 1) {
        barData = {
          title: "销售额（万元）",
          tableData: this.salesReportBar.data.salesChartAmountVOList.map(
            (item) => (item.orderAmount / 10000).toFixed(2)
          ),
          isRate: false,
        };
      } else if (item == 2) {
        barData = {
          title: "实际销售额（万元）",
          tableData: this.salesReportBar.data.actualSalesChartAmountVOList.map(
            (item) => (item.orderAmount / 10000).toFixed(2)
          ),
          isRate: false,
        };
      } else if (item == 3) {
        barData = {
          title: "总退款额（万元）",
          tableData: this.salesReportBar.data.refundRateChartAmountVOList.map(
            (item) => (item.orderAmount / 10000).toFixed(2)
          ),
          isRate: false,
        };
      }
      this.barList.push(barData);
    },
    // 售前退款额-售前退款率
    async getPreSalesReport() {
      const res = await getPreSalesReport(this.customDateRange);
      this.preSalesRefund.refundAmount = res.data.actualSalesAmount;
      this.preSalesRefund.refundRate = res.data.totalRefundRate;
    },
    // 退货退款额-退货退款率
    async getAfterSalesReport() {
      const res = await getAfterSalesReport(this.customDateRange);
      this.afterSalesRefund.refundAmount = res.data.actualSalesAmount;
      this.afterSalesRefund.refundRate = res.data.totalRefundRate;
    },
    // 退款不退货额-退款不退货率
    async getNoReturnSalesReport() {
      const res = await getNoReturnSalesReport(this.customDateRange);
      this.noReturnSalesRefund.refundAmount = res.data.actualSalesAmount;
      this.noReturnSalesRefund.refundRate = res.data.totalRefundRate;
    },
    // 售前退款额柱状图
    async getPreSalesReportBar() {
      const res = await getPreSalesReportBar(this.customDateRange);
      if (!this.barSelectValue.includes(4)) {
        return false;
      }
      if (this.timeList[0] != this.getFormatDate(+res.data[0].saleTime)) {
        return false;
      }
      let barData = {
        title: "售前退款额（万元）",
        tableData: res.data.map((item) =>
          (item.orderAmount / 10000).toFixed(2)
        ),
        isRate: false,
      };

      this.barList.push(barData);
    },
    // 退货退款额柱状图
    async getAfterSalesReportBar() {
      const res = await getAfterSalesReportBar(this.customDateRange);
      if (!this.barSelectValue.includes(6)) {
        return false;
      }
      if (this.timeList[0] != getFormatDate(+res.data[0].saleTime)) {
        return false;
      }

      let barData = {
        title: "退货退款额（万元）",
        tableData: res.data.map((item) =>
          (item.orderAmount / 10000).toFixed(2)
        ),
        isRate: false,
      };

      this.barList.push(barData);
    },
    // 退款不退货额柱状图
    async getNoReturnSalesReportBar() {
      const res = await getNoReturnSalesReportBar(this.customDateRange);
      if (!this.barSelectValue.includes(5)) {
        return false;
      }
      if (this.timeList[0] != getFormatDate(+res.data[0].saleTime)) {
        return false;
      }

      let barData = {
        title: "退款不退货额（万元）",
        tableData: res.data.map((item) =>
          (item.orderAmount / 10000).toFixed(2)
        ),
        isRate: false,
      };

      this.barList.push(barData);
    },
    // 退货退款额柱状图
    // 退款不退货额柱状图
    // 根据选择的值获取柱状图
    async getSelectBar() {
      // if (this.loading == true) {
      //   return this.$message("请等待上次查询完成");
      // }
      this.loading = true;
      this.barList = [];
      this.timeList = [];
      for (let i = 0; i < 7; i++) {
        this.timeList.push(
          this.getFormatDate(this.dateRange[0] - i * 24 * 60 * 60 * 1000)
        );
      }
      this.timeList = this.timeList.reverse();
      this.salesReportBar = null;
      for (let i = 0; i < this.barSelectValue.length; i++) {
        // for (let item of this.barSelectValue) {
        let item = this.barSelectValue[i];
        switch (item) {
          case 1:
          case 2:
          case 3:
            await this.getSalesReportBar(item);
            break;
          case 4:
            await this.getPreSalesReportBar();
            break;
          case 5:
            await this.getNoReturnSalesReportBar();
            break;
          case 6:
            await this.getAfterSalesReportBar();
            break;
        }
      }
      this.loading = false;
    },
    getFormatDate(timeStamp) {
      return getFormatDate(timeStamp);
    },
    // 保留两位小数并转成百分比
    getPercentageNull(num) {
      if (num == null || num === "") {
        return "-";
      } else {
        let numBer = Math.floor((num * 10000).toFixed(1)) / 100 + "%";
        return numBer;
      }
    },
    // 为null则转化为-
    getNull(num) {
      if (num == null) {
        return "-";
      } else {
        return num;
      }
    },
  },
};
</script>

<style>
</style>
