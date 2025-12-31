<template>
  <div>
    <!-- 趋势图 -->
    <el-dialog
      :title="dialogTitle"
      append-to-body
      :visible.sync="localDetailDialogVisible"
      width="40%"
      @close="closeDialog"
    >
      <LineChart
        :TableData="preRefund"
        chartName="售前退款趋势图"
        :xData="timeList"
      ></LineChart>
      <LineChart
        :TableData="rfundAmount"
        chartName="退单量/退货量趋势图"
        :xData="timeList"
      ></LineChart>
      <LineChart
        :TableData="returnRefund"
        chartName="退货退款趋势图"
        :xData="timeList"
      ></LineChart>
      <LineChart
        :TableData="returnNoRefund"
        chartName="退货不退款趋势图"
        :xData="timeList"
      ></LineChart>
    </el-dialog>
  </div>
</template>

<script>
import LineChart from "../../afterSale/components/LineChart.vue";
import { getFormatDate } from "@/utils/common";

export default {
  name: "TrendChart",
  data() {
    return {
      // 售前退款
      preRefund: [],
      // 退款金额
      rfundAmount: [],
      // 退货退款
      returnRefund: [],
      // 退货不退款
      returnNoRefund: [],
      // 时间戳
      timeList: [],
      localDetailDialogVisible: this.detailDialogVisible,
    };
  },
  props: {
    detailDialogVisible: {
      type: Boolean,
      default: false,
    },
    tableData: {
      type: Array,
      default: () => [],
    },
    dialogTitle: {
      type: String,
      default: "",
    },
  },
  components: {
    LineChart,
  },
  created() {
    this.getData();
  },
  methods: {
    // 获取数据
    getData() {
      this.tableData.forEach((item) => {
        this.preRefund.push(item.afterSales);
        this.rfundAmount.push(item.rateChartAmountVO);
        this.returnRefund.push(item.refundGoodsAndAmount);
        this.returnNoRefund.push(item.refundGoodsNotAmount);
        this.timeList.push(this.getFormatDate(item.saleTime));
      });
    },
    closeDialog() {
      this.$emit("updateValue", false);
    },
    getFormatDate(timeStamp) {
      return getFormatDate(timeStamp);
    },
  },
};
</script>

<style lang='scss' scoped>
</style>
