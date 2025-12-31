<template>
  <div class="storeReportForms_page">
    <el-row>
      <!-- 左 -->
      <el-col :span="7">
        <div class="left pageHight">
          <div class="left_top">
            <div class="text">
              <div>总销售额</div>
              <div class="number">{{ salesTotal }} 元</div>
            </div>
            <div class="text1 text">
              <div>总订单数</div>
              <div class="number">{{ orderTotal }} 个</div>
            </div>
            <div>客</div>
            <div>单</div>
            <div>价</div>
          </div>
          <div class="left_main">
            <el-table :data="storeTableList" style="width: 100%" max-height="800">
              <el-table-column prop="platfId" label="平台" align="center" show-overflow-tooltip></el-table-column>
              <el-table-column prop="shopName" label="店铺名称" align="center" show-overflow-tooltip></el-table-column>
              <el-table-column
                prop="orderNum"
                sortable
                width="100"
                label="订单数"
                align="center"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                prop="orderSales"
                sortable
                label="销售额"
                align="center"
                show-overflow-tooltip
              ></el-table-column>
            </el-table>
          </div>
        </div>
      </el-col>
      <!-- 中 -->
      <el-col :span="10">
        <div class="main pageHight">
          <div class="main_top">
            <!-- <h2 class="title">销售渠道</h2> -->
            <el-form style="margin-left: 20px;" label-position="right" label-width="auto">
              <el-form-item label="店铺：">
                <el-cascader
                  style="width: 23vw;"
                  :options="storeOptions"
                  v-model="selectStore"
                  :props="{children: 'storeList',label: 'name', value:'code', checkStrictly: false }"
                  placeholder="请选择店铺"
                  @change="changeSelecStore"
                  clearable
                ></el-cascader>
              </el-form-item>
              <el-form-item label="时间范围：">
                <el-date-picker
                  v-model="timeValue"
                  style="width: 23vw;"
                  type="monthrange"
                  align="right"
                  unlink-panels
                  range-separator="至"
                  start-placeholder="开始月份"
                  end-placeholder="结束月份"
                  :picker-options="pickerOptions"
                  value-format="timestamp"
                  @change="changeSelectTime"
                ></el-date-picker>
              </el-form-item>
            </el-form>
          </div>
          <div class="main_main">
            <pie-chart :option="pieChartOption" :height="'250px'"></pie-chart>
            <bar-chart :option="barChartOption" :height="'250px'"></bar-chart>
            <line-chart :option="lineChartOption" :height="'250px'"></line-chart>
            <div class="compare" v-if="YOYData">
              <div class="text">同比</div>
              <div class="number" v-for="item,index in YOYData" :key="index">{{ item }}%</div>
            </div>
            <div class="compare" v-if="QOQData">
              <div class="text">环比</div>
              <div class="number" v-for="item,index in QOQData" :key="index">{{ item }}%</div>
            </div>
          </div>
        </div>
      </el-col>
      <!-- 右 -->
      <el-col :span="7">
        <div class="right pageHight">
          <div class="right_top">
            <div class="title">
              <el-select
                v-model="selectUrlType"
                style="width: 220px;"
                @change="changeUrlType"
                placeholder="请选择"
              >
                <el-option label="订单畅销榜（订单量）" :value="0"></el-option>
                <el-option label="订单滞销榜（订单量）" :value="1"></el-option>
                <el-option label="订单畅销榜（销售额）" :value="2"></el-option>
                <el-option label="订单滞销榜（销售额）" :value="3"></el-option>
              </el-select>
            </div>
            <el-table :data="sellTableList" style="width: 100%" max-height="450">
              <el-table-column
                prop="urlProductName"
                label="链接名称"
                align="center"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column prop="urlOrderNum" label="订单数" align="center" show-overflow-tooltip></el-table-column>
              <el-table-column
                prop="urlOrderSales"
                label="销售额"
                align="center"
                show-overflow-tooltip
              ></el-table-column>
            </el-table>
          </div>
          <div class="right_bottom">
            <div class="title">链接退货榜：</div>
            <el-table :data="refundTableList" style="width: 100%" max-height="450">
              <el-table-column
                prop="urlProductName"
                label="链接名称"
                align="center"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                prop="urlOrderRefundNum"
                label="订单数"
                align="center"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                prop="urlOrderRefundSales"
                label="销售额"
                align="center"
                show-overflow-tooltip
              ></el-table-column>
            </el-table>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import {
  getTotalList,
  getStoreInfo,
  getHistogramData,
  getStoreOrderData,
  getUrlSellData,
  getUrlRefundData,
  getTotalData,
} from '@/api/reportForms/storeReportForms'
import lineChart from '@/components/charts/LineChart.vue'
import pieChart from '@/components/charts/PieChart.vue'
import barChart from '@/components/charts/BarChart.vue'
import cache from '@/plugins/cache.js'
export default {
  name: 'StoreReportForms',
  data() {
    return {
      // 选中的链接榜类型
      selectUrlType: 0,
      // 总订单数
      orderTotal: 0,
      // 总销售额
      salesTotal: 0,
      // 同比数据
      YOYData: [],
      // 环比数据
      QOQData: [],
      // 链接畅销榜数据
      sellTableList: [],
      // 链接退货榜数据
      refundTableList: [],
      // 店铺销售数据
      storeTableList: [],
      // 店铺树状数据
      storeOptions: [],
      // 选中的店铺
      selectStore: [],
      // 选中的时间
      timeValue: '',
      // 控制选择的时间范围不能超过一年
      minDate: null,
      maxDate: null,
      pickerOptions: {
        disabledDate: (time) => {
          if (this.minDate !== null && this.maxDate === null) {
            let minMonth = this.minDate.getMonth(),
              lastYear = new Date(this.minDate).setMonth(minMonth - 11),
              nextYear = new Date(this.minDate).setMonth(minMonth + 11)
            return (
              time.valueOf() < lastYear.valueOf() ||
              time.valueOf() > nextYear.valueOf()
            )
          }
          return false
        },
        onPick: ({ minDate, maxDate }) => {
          this.minDate = minDate
          this.maxDate = maxDate
        },
      },
      // 店铺时间入参
      reqParams: {
        code: '',
        startTime: '',
        endTime: '',
      },
      // 拿店铺数据入参
      storeReqParams: {
        sortField: 'orderNum', //	店铺排序字段条件 订单数(orderNum) 订单额(orderSales)
        sortOrder: 'ASC', // 店铺排序条件 ASC为正序 DESC为倒序
      },
      // 拿链接畅销榜数据入参
      urlReqParams: {
        sortField: 'total_num', // 链接排序字段条件 订单数(total_num) 订单额(total_amount)
        sortOrder: 'DESC', // 链接排序条件 ASC为正序 DESC为倒序
      },
      // 拿链接退货榜入参
      salesReturn: {
        sortField: 'total_amount', // 链接排序字段条件 订单数(total_num) 订单额(total_amount)
        sortOrder: 'DESC', // 链接排序条件 ASC为正序 DESC为倒序
      },
      // 饼图数据
      pieChartOption: {},
      // 柱状图数据
      barChartOption: {},
      // 折线图数据
      lineChartOption: {},
    }
  },
  components: { lineChart, barChart, pieChart },
  async created() {
    this.getDate() // 获取当月时间戳或缓存中的时间戳
    await this.getTotalData() // 获取总订单数
    await this.getStoreData() // 获取店铺信息数据
    await this.getStoreTableData() // 获取店铺销售数据
    await this.getTotalListData() // 获取总数据(饼图)
    await this.getBarData() // 获取柱状图、折线图数据
    await this.getUrlSellDataList() // 获取链接畅销榜数据
    await this.getUrlRefundDataList() // 获取链接退货榜数据
  },
  methods: {
    // 获取总数据
    async getTotalData() {
      const res = await getTotalData({
        startTime: this.reqParams.startTime,
        endTime: this.reqParams.endTime,
      })
      this.orderTotal = res.data.totalOrderNum
      this.salesTotal = res.data.totalOrderSales
    },

    // 切换链接畅销榜榜单
    changeUrlType() {
      if (this.selectUrlType === 0) {
        this.urlReqParams.sortField = 'total_num'
        this.urlReqParams.sortOrder = 'DESC'
      } else if (this.selectUrlType === 1) {
        this.urlReqParams.sortField = 'total_num'
        this.urlReqParams.sortOrder = 'ASC'
      } else if (this.selectUrlType === 2) {
        this.urlReqParams.sortField = 'total_amount'
        this.urlReqParams.sortOrder = 'DESC'
      } else {
        this.urlReqParams.sortField = 'total_amount'
        this.urlReqParams.sortOrder = 'ASC'
      }
      this.getUrlSellDataList()
    },

    // 获取链接畅销榜数据
    async getUrlSellDataList() {
      const res = await getUrlSellData({
        ...this.reqParams,
        ...this.urlReqParams,
      })
      this.sellTableList = res.data
    },

    // 获取链接退货榜数据
    async getUrlRefundDataList() {
      const res = await getUrlRefundData({
        ...this.reqParams,
        ...this.urlReqParams,
      })
      this.refundTableList = res.data
    },

    // 获取店铺销售数据
    async getStoreTableData() {
      const res = await getStoreOrderData({
        ...this.reqParams,
        ...this.storeReqParams,
      })
      this.storeTableList = res.data
    },

    // 获取柱状图、折线图数据
    async getBarData() {
      const res = await getHistogramData({ ...this.reqParams })

      // 柱状图数据
      let exampleBarOptions = {
        // title: {
        //   text: '订单量',
        // },
        legend: {
          // orient: 'vertical',
          left: 'left',
        },
        tooltip: {
          trigger: 'axis',
        },
        xAxis: {
          type: 'category',
          data: [],
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            name: '订单数',
            data: [],
            markPoint: {
              data: [{ type: 'max' }],
            },
            type: 'bar',
          },
          {
            name: '退单数',
            data: [],
            markPoint: {
              data: [{ type: 'max' }],
            },
            type: 'bar',
          },
        ],
      }
      exampleBarOptions.xAxis.data = res.data.curDate
      exampleBarOptions.series[0].data = res.data.numList
      exampleBarOptions.series[1].data = res.data.refundNumList
      this.barChartOption = exampleBarOptions

      // 折线数据
      let exampleLineOptions = {
        // title: {
        //   text: '订单额',
        // },
        legend: {
          // orient: 'vertical',
          left: 'left',
          data: ['订单额', '退款额'],
        },
        tooltip: {
          trigger: 'axis',
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: [],
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            name: '订单额',
            type: 'line',
            data: [],
            markPoint: {
              data: [{ type: 'max' }],
            },
          },
          {
            name: '退款额',
            type: 'line',
            data: [],
            markPoint: {
              data: [{ type: 'max' }],
            },
          },
        ],
      }
      exampleLineOptions.xAxis.data = res.data.curDate
      exampleLineOptions.series[0].data = res.data.priceList
      exampleLineOptions.series[1].data = res.data.refundPriceList
      this.lineChartOption = exampleLineOptions
      console.log('折线数据', this.lineChartOption)

      // 同比环比数据
      this.YOYData = res.data.yearOnYear
      this.QOQData = res.data.monthOnMonth
      // console.log('option', this.barChartOption)
    },

    // 获取当月时间戳
    getDate() {
      const localData = cache.local.getJSON('selectTime')
      if (localData) {
        // 本地有数据从本地拿
        this.timeValue = localData
        this.reqParams.startTime = localData[0]
        this.reqParams.endTime = localData[1]
      } else {
        const now = new Date()
        // 设置当月第一天
        now.setDate(1)
        // 设置时分秒为0
        now.setHours(0, 0, 0, 0)
        // 获取时间戳
        const timestamp = now.getTime() + ''
        this.timeValue = [timestamp, timestamp]
        this.reqParams.startTime = timestamp
        this.reqParams.endTime = timestamp
      }
    },

    // 获取店铺信息数据
    async getStoreData() {
      const res = await getStoreInfo()
      this.storeOptions = res.data
    },

    // 获取总数据(饼图)
    async getTotalListData() {
      let exampleOptions = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)',
        },
        legend: {
          // orient: 'vertical',
          left: 'left',
        },
        series: [
          {
            name: '订单数据',
            type: 'pie',
            radius: '50%',
            center: ['25%', '50%'],
            data: [],
            label: {
              formatter: '{b} :\n{c} \n({d}%)',
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          },
          {
            name: '订单额数据',
            type: 'pie',
            radius: '50%',
            center: ['75%', '50%'],
            data: [],
            label: {
              formatter: '{b} :\n{c} \n({d}%)',
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          },
        ],
      }
      // 饼图数据
      const res = await getTotalList({ ...this.reqParams })
      let resData = res.data
      resData.forEach((item, index) => {
        let pieDataOne = { value: null, name: '' }
        if (index == 0 || index == 2) {
          pieDataOne.name = item.label
          pieDataOne.value = +item.value
          exampleOptions.series[0].data.push({ ...pieDataOne })
        } else {
          pieDataOne.name = item.label
          pieDataOne.value = +item.value
          exampleOptions.series[1].data.push({ ...pieDataOne })
        }
      })
      this.pieChartOption = { ...exampleOptions }
      // console.log('饼图数据', this.pieChartOption)
    },

    // 选择店铺变化
    async changeSelecStore(val) {
      console.log(val)
      this.reqParams.code = ''
      if (val.length > 0) {
        this.reqParams.code = val[val.length - 1]
      }
      await this.getTotalListData()
      await this.getBarData()
      await this.getStoreTableData()
      await this.getUrlSellDataList()
      await this.getUrlRefundDataList()
    },

    // 选择时间发生变化
    async changeSelectTime(val) {
      console.log('val', val)
      console.log(cache)
      if (val) {
        // 把数据存到本地 刷新不丢失
        cache.local.setJSON('selectTime', val)
        this.reqParams.startTime = val[0]
        this.reqParams.endTime = val[1]
        await this.getTotalData()
        await this.getTotalListData()
        await this.getBarData()
        await this.getStoreTableData()
        await this.getUrlSellDataList()
        await this.getUrlRefundDataList()
      }
      // console.log('code', this.reqParams)
    },
  },
}
</script>

<style  lang="scss">
.storeReportForms_page {
  padding: 10px;
  .left {
    .left_top {
      display: flex;
      justify-content: center;
      margin: 20px 0;
      .text {
        font-size: 22px;
        margin-bottom: 10px;
        margin-right: 10px;
        border-radius: 5px;
        width: 11vw;
        height: 16vh;
        background-color: #d6ab4d;
        color: #fff;
        font-weight: 600;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        .number {
          margin-top: 5px;
        }
      }
      .text1 {
        background-color: #4d7fff;
      }
    }
  }
  .main {
    padding: 0 10px;
    .main_top {
      .title {
        color: #2f2f2f;
        text-align: center;
      }
    }
    .main_main {
      .compare {
        margin-top: 30px;
        font-size: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        // border-top: 1px solid rgb(59, 59, 59);

        text-align: center;
        .text {
          flex: 1;
          font-size: 16px;
        }
        .number {
          flex: 1;
        }
      }
    }
  }
  .right {
    .el-input__inner {
      font-size: 18px;
    }
    .title {
      margin-top: 10px;
      margin-bottom: 5px;
      font-size: 18px;
      color: #2f2f2f;
    }
    .right_bottom {
      margin-top: 10px;
    }
    // background-color: rgb(214, 240, 176);
  }
}

.pageHight {
  height: 980px;
}
</style>