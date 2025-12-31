<template>
  <div class="app-container">
    <div class="head-container">
      <el-form inline class="page-search">
        <el-form-item label="统计时间:">
          <el-date-picker
            :clearable="false"
            v-model="dateRange"
            style="width: 240px"
            value-format="timestamp"
            type="daterange"
            placeholder="请选择日期"
          ></el-date-picker>
        </el-form-item>
      </el-form>
    </div>
    <top-section :dateRange="dateRange"></top-section>
    <el-radio-group v-model="activeName">
      <!-- <el-radio-button :label="1">销售</el-radio-button> -->
      <el-radio-button :label="2">订单</el-radio-button>
      <el-radio-button :label="3">售后</el-radio-button>
      <!-- TODO: 暂不显示交付成本、库值 -->
      <!-- <el-radio-button :label="4">交付成本</el-radio-button> -->
      <el-radio-button :label="5">交付费用</el-radio-button>
      <!-- <el-radio-button :label="6">库值</el-radio-button> -->
    </el-radio-group>

    <AfterSale v-if="activeName == 3" :dateRange="dateRange"></AfterSale>
    <OrderSummary :dateRange="dateRange" v-if="activeName == 2"></OrderSummary>
    <SalesReport :dateRange="dateRange" v-if="activeName == 1"></SalesReport>
    <DeliveryCosts v-if="activeName == 5" :dateRange="dateRange"></DeliveryCosts>
  </div>
</template>

<script>
import AfterSale from '../components/afterSale/AfterSale.vue'
import TopSection from '../components/TopSection.vue'
import SalesReport from '../components/SalesReport.vue'
import OrderSummary from '../components/OrderSummary.vue'
import DeliveryCosts from '../components/DeliveryCosts.vue'

import { addDay, getFormaMonth } from '@/utils/common'

export default {
  name: 'MainBoard',
  components: {
    TopSection,
    AfterSale,
    SalesReport,
    OrderSummary,
    DeliveryCosts,
  },
  data() {
    return {
      // 选择的日期
      date: '',

      // 切换选项
      activeName: 3,

      // 选择的日期范围
      dateRange: [],
    }
  },

  created() {
    this.date = addDay(-1)
    this.dateRange = [addDay(-1), addDay(-1)]
  },
  watch: {
    date(val) {
      // let time = val - (7 * 24 * 60 * 60 * 1000)
      this.$set(this.dateRange, 0, val)
      this.$set(this.dateRange, 1, val) // this.dateRange = [val,val]
      // console.log(this.dateRange)
    },
  },
  methods: {
    //
  },
}
</script>

<style>
</style>