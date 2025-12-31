<template>
  <div>
    <div
      style="
        width: 100%;
        display: flex;
        justify-content: space-around;
        margin-bottom: 20px;
      "
    >
      <colored-card
        title="销售额"
        :num="salesAmount.afterSaleByAmount"
        unit="元"
        :type="salesAmount.increaseRate"
      ></colored-card>
      <colored-card
        title="交付流失费用"
        :num="deliveryLoss.afterSaleByQuantity"
        unit="元"
        :type="deliveryLoss.increaseRate"
      ></colored-card>
      <colored-card
        title="订单数"
        :num="orderNum.afterSaleByQuantity"
        unit="单"
        :type="orderNum.increaseRate"
      ></colored-card>
      <colored-card
        title="商品数量"
        :num="goodsNum.afterSaleByQuantity"
        unit="个"
        :type="goodsNum.increaseRate"
      ></colored-card>
      <colored-card
        title="售后咨询量"
        :num="afterSaleConsultation.afterSaleByQuantity"
        unit="次"
        :type="afterSaleConsultation.increaseRate"
      ></colored-card>
      <colored-card
        title="交付成本"
        :num="deliveryCost.afterSaleByQuantity"
        unit="元"
        :type="deliveryCost.increaseRate"
      ></colored-card>
      <colored-card
        title="交付费用"
        :num="deliveryFee.afterSaleByAmount"
        unit="元"
        :type="deliveryFee.increaseRate"
      ></colored-card>
      <colored-card
        title="总库值"
        :num="totalInventoryValue.afterSaleByQuantity"
        unit="元"
        :type="totalInventoryValue.increaseRate"
      ></colored-card>
      <colored-card
        title="库存数量"
        :num="inventoryQuantity.afterSaleByQuantity"
        unit="个"
        :type="inventoryQuantity.increaseRate"
      ></colored-card>
    </div>
  </div>
</template>

<script>
import ColoredCard from '../components/ColoredCard.vue'
import {
  getStockNumber,
  getOrderNumber,
  getConsultationNumber,
  getSalesNumber,
  getDeliveryCostNumber,
} from '@/api/deliveryCenter/mainBoard'
export default {
  name: 'TopSection',
  data() {
    return {
      // 销售额
      salesAmount: { afterSaleByAmount: 0, increaseRate: 0 },
      // 交付流失费用
      deliveryLoss: { afterSaleByQuantity: 0, increaseRate: 0 },
      // 订单数
      orderNum: { afterSaleByQuantity: 0, increaseRate: 0 },
      // 商品数量
      goodsNum: { afterSaleByQuantity: 0, increaseRate: 0 },
      // 售后咨询量
      afterSaleConsultation: { afterSaleByQuantity: 0, increaseRate: 0 },
      // 交付成本
      deliveryCost: { afterSaleByQuantity: 0, increaseRate: 0 },
      // 交付费用
      deliveryFee: { afterSaleByAmount: 0, increaseRate: 0 },
      // 总库值
      totalInventoryValue: { afterSaleByQuantity: 0, increaseRate: 0 },
      // 库存数量
      inventoryQuantity: { afterSaleByQuantity: 0, increaseRate: 0 },
    }
  },
  props: {
    dateRange: {
      type: Array,
      default: () => [],
    },
  },
  components: {
    ColoredCard,
  },
  created() {
    // this.getStock();
    this.getOrder()
    this.getConsultation()
    this.getSales()
    this.getDeliveryCost()
  },
  watch: {
    dateRange() {
      // this.getStock();
      this.getOrder()
      this.getConsultation()
      this.getSales()
      this.getDeliveryCost()
    },
  },
  methods: {
    // 获取交付费用总数
    async getDeliveryCost() {
      const res = await getDeliveryCostNumber({
        endTime: this.dateRange[1],
        startTime: this.dateRange[0],
      })
      this.deliveryFee = res.data
    },
    // 获取库存
    async getStock() {
      const res = await getStockNumber()
      this.totalInventoryValue = res.data
    },
    // 获取订单数
    async getOrder() {
      const res = await getOrderNumber({
        endTime: this.dateRange[1],
        startTime: this.dateRange[0],
      })
      this.orderNum = res.data
    },
    // 获取售后咨询量
    async getConsultation() {
      const res = await getConsultationNumber({
        endTime: this.dateRange[1],
        startTime: this.dateRange[0],
      })
      this.afterSaleConsultation = res.data
    },
    // 获取销售额和商品数量
    async getSales() {
      const res = await getSalesNumber({
        endTime: this.dateRange[1],
        startTime: this.dateRange[0],
      })
      this.salesAmount = res.data.deliveryCenterAllAmountVO
      this.goodsNum = res.data.deliveryCenterAllQuantityVO
    },
  },
}
</script>

<style></style>
