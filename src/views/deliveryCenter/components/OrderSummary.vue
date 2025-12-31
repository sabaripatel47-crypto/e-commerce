<template>
  <div>
    <div style="margin-top: 5px">
      <p class="upadte_time" style v-if="updateTime != ''">
        数据更新时间：{{ getFormatDateTime(+updateTime) }}
      </p>
    </div>
    <div style="margin-top: 10px">
      <el-button @click="openDetail()">明细</el-button>
    </div>
    <div
      style="
        width: 100%;
        display: flex;
        justify-content: space-around;
        margin-bottom: 20px;
      "
    >
      <div>
        <PlainCard title="实际订单量" :num="actualOrder" unit="个"></PlainCard>
        <PlainCard
          title="实际商品数量"
          :num="actualNumber"
          unit="个"
        ></PlainCard>
      </div>
      <div>
        <PlainCard
          title="退单量（个）｜率"
          unit="%"
          :num="
            getNull(Chargeback.quantity) +
            ' ｜ ' +
            getPercentageNull(Chargeback.percentage)
          "
        ></PlainCard>
        <PlainCard
          title="退货数量（个）｜率"
          unit="%"
          :num="
            getNull(returnQuantity.quantity) +
            ' ｜ ' +
            getPercentageNull(returnQuantity.percentage)
          "
        ></PlainCard>
      </div>
      <div>
        <PlainCard
          title="售前退单（个）｜率"
          unit="%"
          :num="
            getNull(peSaleOrder.quantity) +
            ' ｜ ' +
            getPercentageNull(peSaleOrder.percentage)
          "
        ></PlainCard>
        <PlainCard
          title="售前退货（个）｜率"
          unit="%"
          :num="
            getNull(peSaleReturn.quantity) +
            ' ｜ ' +
            getPercentageNull(peSaleReturn.percentage)
          "
        >
        </PlainCard>
      </div>

      <div>
        <PlainCard
          title="退款不退货订单（个）｜率"
          unit="%"
          :num="
            getNull(refundOrder.quantity) +
            ' ｜ ' +
            getPercentageNull(refundOrder.percentage)
          "
        ></PlainCard>
        <PlainCard
          title="退款不退货数量（个）｜率"
          unit="%"
          :num="
            getNull(refundQuantity.quantity) +
            ' ｜ ' +
            getPercentageNull(refundQuantity.percentage)
          "
        ></PlainCard>
      </div>

      <div>
        <PlainCard
          title="退货退款订单（个）｜率"
          unit="%"
          :num="
            getNull(rturnOrder.quantity) +
            ' ｜ ' +
            getPercentageNull(rturnOrder.percentage)
          "
        ></PlainCard>
        <PlainCard
          title="退货退款数量（个）｜率"
          unit="%"
          :num="
            getNull(rturnQuantity.quantity) +
            ' ｜ ' +
            getPercentageNull(rturnQuantity.percentage)
          "
        ></PlainCard>
      </div>

      <!-- <PlainCard title="订单指标偏离度" num="20" unit="%" :type="1"></PlainCard> -->
    </div>

    <!-- <PlainCard
        title="商品数量指标偏离度"
        num="30"
        unit="%"
        :type="-1"
      ></PlainCard> -->
    <el-select
      v-model="selectTypeValue"
      multiple
      clearable
      :multiple-limit="4"
      style="width: 400px; margin-right: 20px"
      placeholder="请选择"
      @clear="selectChange()"
    >
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      ></el-option>
    </el-select>
    <el-button type="primary" icon="el-icon-search" @click="selectChange()"
      >搜索</el-button
    >
    <div
      style="
        width: 80%;
        display: flex;
        justify-content: space-around;
        margin-bottom: 20px;
      "
    >
      <div style="flex: 1" v-for="(item, index) in chartValues" :key="index">
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
// import BarChart from "@/components/charts/BarChart.vue";
import BarChart from "./BarChart.vue";
import {
  getUpdateTime,
  getRefundOrder,
  getRefundGoods,
  getActualOrder,
  getRefundOrderBar,
  getRefundGoodsBar,
  getActualOrderBar,
  getPreSale,
  getPreSaleRate,
  getRefundNoReturn,
  getRefundNoReturnRate,
  getRefundReturn,
  getRefundReturnRate,
  getPreSaleTrend,
  getRefundReturnTrend,
  getRefundNoReturnTrend,
} from "@/api/deliveryCenter/orderSummary";
import { getFormatDateTime } from "@/utils/common";
import { getFormatDate } from "@/utils/common";
import { getSkuList } from "@/api/purchasingManagement/purchaseRecordDetails";
export default {
  name: "OrderSummary",
  components: {
    PlainCard,
    BarChart,
  },

  data() {
    return {
      options: [
        { value: 1, label: "退货率", precent: true },
        { value: 2, label: "实际商品数量", precent: false },
        { value: 3, label: "退货数量", precent: false },
        { value: 4, label: "退单量", precent: false },
        { value: 5, label: "售前退款数量", precent: false },
        { value: 6, label: "售前退款订单", precent: false },
        { value: 7, label: "退货退款数量", precent: false },
        { value: 8, label: "退货退款订单", precent: false },
        { value: 9, label: "退款不退货数量", precent: false },
        { value: 10, label: "退款不退货订单", precent: false },
        { value: 11, label: "退单率", precent: true },
        { value: 12, label: "实际订单量", precent: false },
      ],
      // 柱状图数据
      chartValues: [],
      selectTypeValue: [1, 2, 3, 4],

      // 修改时间
      updateTime: "",
      // 时间轴
      timeList: [],
      // 退单量
      Chargeback: {
        quantity: "",
        percentage: "",
      },
      // 退货数量
      returnQuantity: {
        quantity: "",
        percentage: "",
      },
      // 实际订单数量
      actualOrder: "",
      // 实际商品数量
      actualNumber: "",
      // 售前退单
      peSaleOrder: {
        quantity: "",
        percentage: null,
      },
      // 退款不退货退单
      refundOrder: {
        quantity: "",
        percentage: null,
      },
      // 退货退款退单
      rturnOrder: {
        quantity: "",
        percentage: null,
      },
      // 售前退货
      peSaleReturn: {
        quantity: "",
        percentage: null,
      },
      // 退款不退货退货
      refundQuantity: {
        quantity: "",
        percentage: null,
      },
      // 退货退款退货
      rturnQuantity: {
        quantity: "",
        percentage: null,
      },
      // 时间范围入参
      dateReqParams: {
        startTime: "",
        endTime: "",
      },

      // 退货数量，退货率柱状图、实际商品数量柱状图响应值
      refundGoodsBarRes: null,
      // 退单率柱状图、实际订单量柱状图响应值
      actualOrderBarRes: null,

      testOptions: {},
    };
  },
  props: {
    dateRange: {
      type: Array,
      default: () => [],
    },
  },
  watch: {
    dateRange: {
      handler(newVal) {
        this.dateReqParams.startTime = newVal[0];
        this.dateReqParams.endTime = newVal[1];
        // this.chartValues = this.$options.data().chartValues
        this.chartValues = [];
        this.selectChange();
        this.getRefundOrder(); // 退单量
        this.getRefundGoods();
        this.getActualOrder();
        this.getPreSale();
        this.getPreSaleRate();
        this.getRefundNoReturn();
        this.getRefundNoReturnRate();
        this.getRefundReturn();
        this.getRefundReturnRate();
        // this.getRefundOrderBar() // 退单量柱状图
        // this.getRefundGoodsBar()
        // this.getActualOrderBar()
      },
    },
    chartValues: {
      handler(newVal) {
        if (this.chartValues.length > this.selectTypeValue.length) {
          const uniqueArr = this.chartValues.filter(
            (value, index, self) =>
              index === self.findIndex((t) => t.title === value.title)
          );
          this.chartValues = uniqueArr;
        }
      },
    },
  },
  created() {
    this.dateReqParams.startTime = this.dateRange[0];
    this.dateReqParams.endTime = this.dateRange[1];
    this.getUpdateTime();
    this.getRefundOrder(); // 退单量
    this.getRefundGoods(); // 退货数量、退货率、实际商品数量
    this.getActualOrder();
    this.getPreSale();
    this.getPreSaleRate();
    this.getRefundNoReturn();
    this.getRefundNoReturnRate();
    this.getRefundReturn();
    this.getRefundReturnRate();
    // this.getRefundOrderBar()
    // this.getRefundGoodsBar()
    // this.getActualOrderBar()
    this.chartValues = [];
    this.selectChange();
  },
  methods: {
    selectChange() {
      this.chartValues = [];
      this.timeList = [];
      // for (let i = 0; i < 7; i++) {
      //   this.timeList.push(
      //     this.getFormatDate(this.dateRange[0] - i * 24 * 60 * 60 * 1000)
      //   );
      // }
      let time = this.dateRange[0];
      while (time <= this.dateRange[1]) {
        this.timeList.push(this.getFormatDate(time));
        time += 24 * 60 * 60 * 1000; // 增加一天
      }
      // this.timeList = this.timeList.reverse();
      this.refundGoodsBarRes = null;
      this.actualOrderBarRes = null;
      for (let i = 0; i < this.selectTypeValue.length; i++) {
        let item = this.selectTypeValue[i];
        // for (let item of this.selectTypeValue) {
        switch (item) {
          case 1:
          case 2:
          case 3:
            this.getRefundGoodsBar(item); // 退货数量，退货率、实际商品数量柱状图
            break;
          // 4是退单量
          case 4:
            this.getRefundOrderBar(item);
            break;
          // 售前退款数量/订单
          case 5:
          case 6:
            this.getPreSaleTrend(item);
            break;
          // 退货退款数量/订单
          case 7:
          case 8:
            this.getRefundReturnTrend(item);
            break;
          // 退款不退货数量/订单
          case 9:
          case 10:
            this.getRefundNoReturnTrend(item);
            break;
          case 11:
          case 12:
            this.getActualOrderBar(item);
            break;
        }
      }
      // console.log(this.chartValues);
    },

    openDetail() {
      this.$router.push({
        path: "../../deliveryCenter/orderSummary",
        query: { date: this.dateRange },
      });
    },
    // 获取数据更新时间
    async getUpdateTime() {
      const res = await getUpdateTime();
      this.updateTime = res.data;
    },
    // 退单量
    async getRefundOrder() {
      const res = await getRefundOrder(this.dateReqParams);
      this.Chargeback.quantity = res.data;
    },
    // 退货数量、退货率、实际商品数量
    async getRefundGoods() {
      const res = await getRefundGoods(this.dateReqParams);
      this.returnQuantity.quantity = res.data.returnNum;
      this.returnQuantity.percentage = res.data.returnRate;
      this.actualNumber =
        res.data.actualNumber == null ? "-" : String(res.data.actualNumber);
    },
    // 退货率计算，实际订单数
    async getActualOrder() {
      const res = await getActualOrder(this.dateReqParams);
      if (res.data == null) {
        this.actualOrder = "-";
        this.Chargeback.percentage = null;
        return false;
      }
      this.actualOrder =
        res.data.actualNumber == null ? "" : String(res.data.actualNumber);
      this.Chargeback.percentage = res.data.returnRate;
    },
    getFormatDateTime(timeStamp) {
      return getFormatDateTime(timeStamp);
    },
    // 售前退单、售前退货
    async getPreSale() {
      const res = await getPreSale(this.dateReqParams);
      this.peSaleOrder.quantity = res.data.refundQuantity;
      this.peSaleReturn.quantity = res.data.refundNum;
    },
    // 售前退单率、售前退货率
    async getPreSaleRate() {
      const res = await getPreSaleRate(this.dateReqParams);
      this.peSaleOrder.percentage = res.data.refundQuantityRate;
      this.peSaleReturn.percentage = res.data.refundNumRate;
    },
    // 退款不退货退单、退款不退货
    async getRefundNoReturn() {
      const res = await getRefundNoReturn(this.dateReqParams);
      this.refundOrder.quantity = res.data.refundQuantity;
      this.refundQuantity.quantity = res.data.refundNum;
    },
    // 退款不退货退单率、退款不退货率
    async getRefundNoReturnRate() {
      const res = await getRefundNoReturnRate(this.dateReqParams);
      this.refundOrder.percentage = res.data.refundQuantityRate;
      this.refundQuantity.percentage = res.data.refundNumRate;
    },
    // 退款退货退单、退款退货退货
    async getRefundReturn() {
      const res = await getRefundReturn(this.dateReqParams);
      this.rturnOrder.quantity = res.data.refundQuantity;
      this.rturnQuantity.quantity = res.data.refundNum;
    },
    // 退款退货退单率、退款退货退货率
    async getRefundReturnRate() {
      const res = await getRefundReturnRate(this.dateReqParams);
      this.rturnOrder.percentage = res.data.refundQuantityRate;
      this.rturnQuantity.percentage = res.data.refundNumRate;
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
    // 保留两位小数并转成百分比
    getPercentage(num) {
      let numBer = Math.floor((num * 10000).toFixed(1)) / 100;
      return numBer;
    },
    // 为null则转化为-
    getNull(num) {
      if (num == null) {
        return "-";
      } else {
        return num;
      }
    },
    // 转化成百分比格式
    getPercent(num) {
      return (num * 100).toFixed(2);
    },
    // 退单量柱状图
    async getRefundOrderBar(item) {
      const res = await getRefundOrderBar(this.dateReqParams);
      if (this.timeList[0] != this.getFormatDate(+res.data[0].saleTime)) {
        return false;
      }
      if (!this.selectTypeValue.includes(item)) {
        return false;
      }
      let barData = {
        title: "退单量（个）",
        tableData: res.data.map((item) => item.quantity),
        isRate: false,
      };
      this.chartValues.push({ ...barData });
    },
    // 退货数量，退货率柱状图、实际商品数量柱状图
    async getRefundGoodsBar(item) {
      if (this.refundGoodsBarRes === null) {
        this.refundGoodsBarRes = await getRefundGoodsBar(this.dateReqParams);
      }
      console.log("this.timeList", this.timeList[0]);
      console.log(
        this.getFormatDate(
          this.refundGoodsBarRes.data.returnRateChartAmountVOList[0].saleTime
        )
      );
      if (
        this.timeList[0] !=
        this.getFormatDate(
          this.refundGoodsBarRes.data.returnRateChartAmountVOList[0].saleTime
        )
      ) {
        return false;
      }
      if (!this.selectTypeValue.includes(item)) {
        return false;
      }

      let barData;
      if (item == 1) {
        barData = {
          title: "退货率（%）",
          tableData:
            this.refundGoodsBarRes.data.returnRateChartAmountVOList.map(
              (item) => this.getPercent(+item.orderAmount)
            ),
          isRate: true,
        };
      } else if (item == 2) {
        barData = {
          title: "实际商品数量（个）",
          tableData: this.refundGoodsBarRes.data.actualNumChartAmountVOList.map(
            (item) => item.quantity
          ),
          isRate: false,
        };
      } else if (item == 3) {
        barData = {
          title: "退货数量（个）",
          tableData: this.refundGoodsBarRes.data.returnNumChartAmountVOList.map(
            (item) => item.quantity
          ),
          isRate: false,
        };
      }
      this.chartValues = [...this.chartValues, { ...barData }];
    },
    // 退单率柱状图,实际订单量柱状图
    async getActualOrderBar(item) {
      // const res = await getActualOrderBar(this.dateReqParams);
      // this.chartValues[10].tableData = res.data.returnRateChartAmountVOList.map(
      //   (item) => this.getPercent(item.quantity)
      // )
      // this.chartValues[11].tableData = res.data.returnNumChartAmountVOList.map(item => item.quantity)
      if (!this.actualOrderBarRes) {
        this.actualOrderBarRes = await getActualOrderBar(this.dateReqParams);
      }
      if (
        this.timeList[0] !=
        this.getFormatDate(
          +this.actualOrderBarRes.data.returnRateChartAmountVOList[0].saleTime
        )
      ) {
        return false;
      }
      if (!this.selectTypeValue.includes(item)) {
        return false;
      }
      let barData;
      if (item == 11) {
        barData = {
          title: "退单率（%）",
          tableData:
            this.actualOrderBarRes.data.returnRateChartAmountVOList.map(
              (item) => this.getPercent(item.orderAmount)
            ),
          isRate: true,
        };
      } else if (item == 12) {
        barData = {
          title: "实际订单量（个）",
          tableData: this.actualOrderBarRes.data.returnNumChartAmountVOList.map(
            (item) => item.quantity
          ),
          isRate: false,
        };
      }

      this.chartValues.push({ ...barData });
    },
    //售前退款订单、售前退款数量趋势图
    async getPreSaleTrend(item) {
      const res = await getPreSaleTrend(this.dateReqParams);
      if (
        this.timeList[0] !=
        this.getFormatDate(+res.data.refundNumList[0].saleTime)
      ) {
        return false;
      }
      if (!this.selectTypeValue.includes(item)) {
        return false;
      }
      let barData;
      if (item == 5) {
        barData = {
          title: "售前退款数量（个）",
          tableData: res.data.refundNumList.map((item) => item.quantity),
        };
      } else if (item == 6) {
        barData = {
          title: "售前退款订单（件）",
          tableData: res.data.refundQuantityList.map((item) => item.quantity),
        };
      }
      this.chartValues.push({ ...barData });
    },
    // 退款退货订单、退款退货数量趋势图
    async getRefundReturnTrend(item) {
      const res = await getRefundReturnTrend(this.dateReqParams);
      if (
        this.timeList[0] !=
        this.getFormatDate(+res.data.refundNumList[0].saleTime)
      ) {
        return false;
      }
      if (!this.selectTypeValue.includes(item)) {
        return false;
      }
      let barData;
      if (item == 7) {
        barData = {
          title: "退货退款数量（个）",
          tableData: res.data.refundNumList.map((item) => item.quantity),
        };
      } else if (item == 8) {
        barData = {
          title: "退货退款订单（件）",
          tableData: res.data.refundQuantityList.map((item) => item.quantity),
        };
      }
      this.chartValues.push({ ...barData });
    },
    //退款不退货订单、退款不退货数量趋势图
    async getRefundNoReturnTrend(item) {
      const res = await getRefundNoReturnTrend(this.dateReqParams);
      if (
        this.timeList[0] !=
        this.getFormatDate(+res.data.refundNumList[0].saleTime)
      ) {
        return false;
      }
      if (!this.selectTypeValue.includes(item)) {
        return false;
      }
      let barData;
      if (item == 9) {
        barData = {
          title: "退款不退货数量（个）",
          tableData: res.data.refundNumList.map((item) => item.quantity),
        };
      } else if (item == 10) {
        barData = {
          title: "退款不退货订单（个）",
          tableData: res.data.refundQuantityList.map((item) => item.quantity),
        };
      }
      this.chartValues.push({ ...barData });
    },
    getFormatDate(timeStamp) {
      return getFormatDate(timeStamp);
    },
  },
};
</script>

<style lang="scss" scoped>
.upadte_time {
  font-size: 12px;
  line-height: 13px;
  color: gray;
  margin: 0;
}
</style>
