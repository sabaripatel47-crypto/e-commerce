<template>
  <div>
    <div
      style="margin-top: 5px"
      v-for="(item, index) in dataUpdateTimeData"
      :key="index"
    >
      <p class="upadte_time">{{ item }}</p>
    </div>
    <div style="margin-top: 10px">
      <el-button @click="goDetail()">明细</el-button>
    </div>
    <el-row :gutter="20">
      <el-col :span="8">
        <div class="data-overviews-title">销售成交产生的费用</div>
        <el-col :span="12">
          <PlainCard
            title="补发数量"
            :num="nullToComponent(reissueData.num)"
            unit="个"
          ></PlainCard>
          <PlainCard
            title="补发费用"
            :num="nullToComponent(reissueData.amount)"
            unit="元"
          ></PlainCard>
        </el-col>
        <el-col :span="12">
          <PlainCard
            title="换货数量"
            :num="nullToComponent(exchangeData.num)"
            unit="个"
          ></PlainCard>
          <PlainCard
            title="换货金额"
            :num="nullToComponent(exchangeData.amount)"
            unit="元"
          ></PlainCard>
        </el-col>
        <!-- TODO 暂未有下面的数据 -->
        <el-col :span="12">
          <PlainCard
            title="缺货赔偿数量"
            :num="nullToComponent(shortageCompensationData.num)"
            unit="个"
          ></PlainCard>
          <PlainCard
            title="缺货补偿金额"
            :num="nullToComponent(shortageCompensationData.amount)"
            unit="元"
          ></PlainCard>
        </el-col>
        <el-col :span="4">
          <PlainCard
            title="售后补偿数量"
            :num="nullToComponent(afterSaleData.num)"
            unit="个"
          ></PlainCard>
          <PlainCard
            title="售后补偿金额"
            :num="nullToComponent(afterSaleData.amount)"
            unit="元"
          ></PlainCard>
        </el-col>
        <!-- <el-col :span="4">
          <PlainCard title="平台费用数量" :num="nullToComponent(platformCostData.num)" unit="个"></PlainCard>
          <PlainCard title="平台费用金额" :num="nullToComponent(platformCostData.amount)" unit="元"></PlainCard>
        </el-col>-->
      </el-col>
      <el-col :span="4">
        <div class="data-overviews-title">售前退款</div>
        <PlainCard
          title="仅退款数量"
          :num="nullToComponent(afterSalesRefundData.num)"
          unit="个"
        ></PlainCard>
        <PlainCard
          title="仅退款费用"
          :num="nullToComponent(afterSalesRefundData.amount)"
          unit="元"
        ></PlainCard>
      </el-col>

      <el-col :span="4">
        <div class="data-overviews-title">售中退款</div>
        <PlainCard
          title="拦截数量"
          :num="nullToComponent(interceptData.num)"
          unit="个"
        ></PlainCard>
        <PlainCard
          title="拦截费用"
          :num="nullToComponent(interceptData.amount)"
          unit="元"
        ></PlainCard>
      </el-col>

      <el-col :span="8">
        <div class="data-overviews-title">售后退款</div>
        <el-col :span="12">
          <PlainCard
            title="退款不退货数量"
            :num="nullToComponent(refundNoReturnData.num)"
            unit="个"
          ></PlainCard>
          <PlainCard
            title="退款不退货金额"
            :num="nullToComponent(refundNoReturnData.amount)"
            unit="元"
          ></PlainCard>
        </el-col>
        <el-col :span="12">
          <PlainCard
            title="退货退款数量"
            :num="nullToComponent(returnAndRefundData.num)"
            unit="个"
          ></PlainCard>
          <PlainCard
            title="退货退款费用"
            :num="nullToComponent(returnAndRefundData.amount)"
            unit="元"
          ></PlainCard>
        </el-col>
      </el-col>
    </el-row>

    <div>
      <el-form>
        <el-form-item label="类型">
          <el-select
            v-model="activeType"
            filterable
            @change="getBarData()"
            placeholder="请选择类型"
          >
            <el-option
              v-for="item in typeSelectList"
              :key="item.uuid"
              :label="item.name"
              :value="item.uuid"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div style="display: flex; justify-content: space-evenly">
        <BarChart
          :option="numBarChartOption"
          :width="'40vw'"
          :height="'300px'"
        ></BarChart>
        <BarChart
          :option="amountBarChartOption"
          :width="'40vw'"
          :height="'300px'"
        ></BarChart>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getReissue, // 获取补发数量金额
  getExchange, // 获取换货数量金额
  getShortageCompensation, // 获取缺货赔偿数量金额
  getAfterSale, // 获取售后补偿数量金额
  getPlatformCost, // 获取平台费用数量金额
  getAfterSalesRefund, // 获取仅退款数量金额
  getIntercept, // 获取拦截数量金额
  getRefundNoReturn, // 获取退款不退货数量金额
  getReturnAndRefund, // 获取退货退款数量金额
  getDeliveryCostList, // 获取交付费用趋势图
  getdataUpdateTime, // 获取数据更新时间
} from "@/api/deliveryCenter/deliveryCosts";
import { addDay } from "@/utils/common";

import BarChart from "@/components/charts/BarChart.vue";
import PlainCard from "./PlainCard.vue";

import {
  getFormatDate,
  nullToComponent,
  getFormatDateTime,
} from "@/utils/common";

export default {
  name: "DeliveryCosts",
  components: {
    BarChart,
    PlainCard,
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
        this.getAllData(newVal);
      },
    },
  },
  data() {
    return {
      // 类型下拉框数据
      typeSelectList: [
        { name: "换货", uuid: 6 },
        { name: "补发", uuid: 7 },
        { name: "拦截退款", uuid: 5 },
        { name: "退货退款", uuid: 1 },
        { name: "仅退款", uuid: 2 },
        { name: "退款不退货", uuid: 3 },
        // TODO: 暂不展示 未完善
        { name: "缺货赔偿", uuid: 11 },
        { name: "售后赔偿", uuid: 12 },
        // { name: '平台费用', uuid: 13 },
      ],

      // 类型
      activeType: 6,

      // 数量柱状图数据
      numBarChartOption: {},

      // 金额柱状图数据
      amountBarChartOption: {},

      // 时间入参
      dateReqParams: {
        startTime: null,
        endTime: null,
      },

      // 补发数据
      reissueData: {
        amount: null,
        num: null,
      },

      // 换货数据
      exchangeData: {
        amount: null,
        num: null,
      },

      // 缺货赔偿数据
      shortageCompensationData: {
        amount: null,
        num: null,
      },

      // 售后补偿数据
      afterSaleData: {
        amount: null,
        num: null,
      },

      // 平台费用数据
      platformCostData: {
        amount: null,
        num: null,
      },

      // 仅退款数据
      afterSalesRefundData: {
        amount: null,
        num: null,
      },

      // 拦截数据
      interceptData: {
        amount: null,
        num: null,
      },

      // 退款不退货数据
      refundNoReturnData: {
        amount: null,
        num: null,
      },

      // 退货退款数据
      returnAndRefundData: {
        amount: null,
        num: null,
      },

      // 数据更新时间数据
      dataUpdateTimeData: [],
    };
  },
  created() {
    this.getAllData(this.dateRange);
  },
  methods: {
    // 时间转化
    getFormatDateTime(time) {
      return getFormatDateTime(+time);
    },

    // 跳转明细
    goDetail() {
      this.$router.push({
        name: "DeliveryCosts",
        query: {
          startTime: this.dateReqParams.startTime,
          endTime: this.dateReqParams.endTime,
        },
      });
    },

    // 获取数据更新时间
    async getDataUpdateTimeData() {
      const res = await getdataUpdateTime();
      this.dataUpdateTimeData = res.data;
    },

    // 为null则转化为-
    nullToComponent(val) {
      return nullToComponent(val);
    },

    // 获取柱状图数据
    async getBarData() {
      let reqParams = this.dateReqParams;
      if (this.dateReqParams.startTime === this.dateReqParams.endTime) {
        reqParams = {
          startTime: addDay(-6, this.dateReqParams.startTime),
          endTime: this.dateReqParams.endTime,
        };
      }
      const res = await getDeliveryCostList({
        ...reqParams,
        costType: this.activeType,
      });

      this.getBarOption(res.data.deliveryAmountChartList, "amount");
      this.getBarOption(res.data.deliveryNumChartList, "num");
    },

    // 组装柱状图option
    async getBarOption(data, type) {
      let option = {
        title: {
          text: type === "amount" ? "金额（元）" : "数量（个）",
          textStyle: {
            fontSize: 16,
          },
          left: "30%",
        },
        tooltip: {},
        legend: {
          orient: "vertical",
          left: "left",
        },
        xAxis: {
          boundaryGap: true, // 设置 boundaryGap 为 true
          axisTick: {
            alignWithLabel: true, // 设置刻度线与标签对齐
          },
          data: data.map((item) => getFormatDate(item.saleTime)), // 时间点集合
        },
        yAxis: {},
        grid: {
          left: "4.5%",
          right: "5%",
          bottom: "2%",
          containLabel: true,
        },
        series: [
          {
            type: "bar",
            data: data.map((item) =>
              type === "amount" ? item.orderAmount : item.quantity
            ), // 订单数集合
          },
        ],
      };
      if (type === "amount") {
        return (this.amountBarChartOption = { ...option });
      }
      this.numBarChartOption = { ...option };
    },

    // 获取所有的数量金额数据
    async getAllData(date) {
      // 赋值最新的时间
      this.dateReqParams.startTime = date[0];
      this.dateReqParams.endTime = date[1];
      this.getReissue(); // 获取补发数量金额
      this.getExchange(); // 获取换货数量金额
      // TODO: 暂不展示 未完善
      this.getShortageCompensation(); // 获取缺货赔偿数量金额
      this.getAfterSale(); // 获取售后补偿数量金额
      // this.getPlatformCost() // 获取平台费用数量金额
      this.getAfterSalesRefund(); // 获取仅退款数量金额
      this.getIntercept(); // 获取拦截数量金额
      this.getRefundNoReturn(); // 获取退款不退货数量金额
      this.getReturnAndRefund(); // 获取退货退款数量金额
      this.getBarData(); // 获取柱状图数据
      this.getDataUpdateTimeData(); // 获取数据更新时间
    },

    // 获取补发数量金额
    async getReissue() {
      const res = await getReissue(this.dateReqParams);
      this.reissueData = res.data;
    },
    // 获取换货数量金额
    async getExchange() {
      const res = await getExchange(this.dateReqParams);
      this.exchangeData = res.data;
    },
    // 获取缺货赔偿数量金额
    async getShortageCompensation() {
      const res = await getShortageCompensation(this.dateReqParams);
      this.shortageCompensationData = res.data;
    },
    // 获取售后补偿数量金额
    async getAfterSale() {
      const res = await getAfterSale(this.dateReqParams);
      this.afterSaleData = res.data;
    },
    // 获取平台费用数量金额
    async getPlatformCost() {
      const res = await getPlatformCost(this.dateReqParams);
      this.platformCostData = res.data;
    },
    // 获取仅退款数量金额
    async getAfterSalesRefund() {
      const res = await getAfterSalesRefund(this.dateReqParams);
      this.afterSalesRefundData = res.data;
    },
    // 获取拦截数量金额
    async getIntercept() {
      const res = await getIntercept(this.dateReqParams);
      this.interceptData = res.data;
    },
    // 获取退款不退货数量金额
    async getRefundNoReturn() {
      const res = await getRefundNoReturn(this.dateReqParams);
      this.refundNoReturnData = res.data;
    },
    // 获取退货退款数量金额
    async getReturnAndRefund() {
      const res = await getReturnAndRefund(this.dateReqParams);
      this.returnAndRefundData = res.data;
    },
  },
};
</script>

<style lang="scss" scoped>
.data-overviews-title {
  text-align: center;
  color: #606266;
  font-weight: bold;
}

.upadte_time {
  font-size: 12px;
  line-height: 13px;
  color: gray;
  margin: 0;
}
</style>