<template>
  <!--查看日报 弹窗 -->
  <el-dialog
    fullscreen
    :title="'商品链接日报'"
    :visible="showDialog"
    @open="showDaily"
    append-to-body
    :before-close="closeDialog"
  >
    <el-button
      type="text"
      icon="el-icon-arrow-left"
      class="dialog-back-button"
      @click="closeDialog"
    >返回</el-button>
    <el-descriptions :column="4">
      <el-descriptions-item label="商品名称">{{ row.linkTitle }}</el-descriptions-item>
      <el-descriptions-item label="商品链接编码">{{ row.linkId }}</el-descriptions-item>
      <el-descriptions-item class="linkLevel-class" label="商品等级">{{ row.linkLevel }}</el-descriptions-item>
      <el-descriptions-item label="负责人">{{ row.managerName }}</el-descriptions-item>
      <el-descriptions-item label="主图">
        <template>
          <el-image
            v-if="row.url"
            style="height: 40px; width: 40px"
            :src="row.url + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
            :preview-src-list="row.srcList"
          ></el-image>
          <span v-else>暂无主图</span>
        </template>
      </el-descriptions-item>
    </el-descriptions>
    <!-- 折线图 -->
    <el-row>
      <el-col :span="12">
        <line-chart :option="purchaseLineChart" :height="'35vh'"></line-chart>
      </el-col>
      <el-col :span="12">
        <line-chart :option="amountLineChart" :height="'35vh'"></line-chart>
      </el-col>
    </el-row>
    <div class="dialog-table-class">
      <el-radio-group v-model="showAllTable" size="mini" @change="switchRadio">
        <el-radio-button :label="true">展开</el-radio-button>
        <el-radio-button :label="false">收缩</el-radio-button>
      </el-radio-group>
      <el-table
        :data="viewDaily"
        style="width: 100%"
        max-height="calc(80vh)"
        :span-method="arraySpanMethod"
      >
        <el-table-column
          column-key="timeStamp"
          prop="timeStamp"
          label="日期"
          width="120"
          show-overflow-tooltip
        >
          <template v-slot="{ row }">{{ getFormatDate(row.timeStamp) }}</template>
        </el-table-column>

        <el-table-column
          v-if="showAllTable"
          prop="dailyTempCategory"
          column-key="dailyTempCategory"
          label="在哪端"
          width="100"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column prop="dailyTempItemName" label="在哪个端口" width="120" show-overflow-tooltip></el-table-column>

        <template v-for="(item, index) in detailTitleList">
          <el-table-column
            v-if="item.uuid === '2' || item.uuid === '1' ? true : showAllTable"
            :prop="item.title"
            :label="item.title"
            :width="columnWidth[item.uuid]"
            show-overflow-tooltip
          >
            <template v-slot="{ row }">
              <div
                class="file"
                v-if="
                  (item.uuid === '3' || item.uuid === '5') &&
                  row[item.title].value.length > 0
                "
              >
                <el-tooltip
                  class="item"
                  effect="dark"
                  :content="splitFileName(row[item.title].value).originalName"
                  placement="top"
                >
                  <a
                    class="file-a"
                    :href="row[item.title].value"
                  >{{ splitFileName(row[item.title].value).shrinkName }}</a>
                </el-tooltip>
              </div>
              <div v-else>{{ row[item.title].value }}</div>
            </template>
          </el-table-column>
        </template>
        <el-table-column
          column-key="feedback"
          prop="feedback"
          label="上级点评(纠偏)"
          width="250"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <div v-if="readOnly">
              <!--可操作状态-->
              <el-input
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 4 }"
                v-model="viewDaily[scope.$index].feedback"
                @focus="feedbackFocus(viewDaily[scope.$index])"
              ></el-input>
              <el-button
                v-show="viewDaily[scope.$index].isShowFeedbackButton"
                type="primary"
                @click="saveFeedback(viewDaily[scope.$index])"
              >保 存</el-button>
            </div>
            <div v-else>
              <!--只读状态-->
              {{ viewDaily[scope.$index].feedback }}
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="closeDialog">关 闭</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {
  getViewDailyDetail,
  addFeedback,
  getPurchaseLineChart,
  getCollectionLineChart,
  getRefundLineChart,
  getConversionLineChart,
  getClickThroughLineChart,
  getSearchConversionRateChart,
  getUVCostChart,
  getaverageDurationChart,
  getPayCountChart,
  getPayingBuyersCountChart,
  getRepeatPurchaseCountChart,
  getSearchVisitorsChart,
  getVisitorsCountChart,
  getRefundAmountChart,
  getPayAmountChart,
} from '@/api/dailyManage/viewDaily'

import { getFormatDate } from '@/utils/common'
import { addDay, addDayEnd } from '@/utils/common.js'

import lineChart from '@/components/charts/LineChart.vue'

export default {
  name: 'ViewDailyDialog',
  props: {
    //查看日报的dialog标记
    showDialog: {
      type: Boolean,
      required: true,
    },

    row: {
      type: Object,
    },

    parentReqParams: {
      type: Object,
      default: () => {
        return {}
      },
    },

    //反馈是否只读
    readOnly: {
      type: Boolean,
      required: true,
    },
  },
  watch: {
    showDialog(val) {
      if (val) {
        this.showDaily()
      }
    },
  },
  data() {
    return {
      //查看日报的详情
      viewDaily: [],

      // 接口公共入参
      reqParams: {
        endTime: '',
        linkId: '',
        startTime: '',
      },

      // 表格列宽
      columnWidth: {
        1: '',
        3: '',
        4: 100,
        2: '',
        5: 140,
      },

      // 控制列表展开收缩
      showAllTable: localStorage.getItem('mimai_showAllTable')
        ? JSON.parse(localStorage.getItem('mimai_showAllTable'))
        : true,

      //百分比折线图
      purchaseLineChart: {},

      //金额和人数的折线图
      amountLineChart: {},

      //详情的抬头
      detailTitleList: [
        { uuid: '2', title: '存在什么问题' },
        // { uuid: '5', title: '存在什么问题' },
        { uuid: '6', title: '准备怎么解决及支持' },
        { uuid: '1', title: '具体做了什么' },
        { uuid: '4', title: '具体做了多少' },
        { uuid: '3', title: '附件' },
      ],
    }
  },
  components: { lineChart },
  computed: {},
  created() {
    this.reqParams.startTime = addDayEnd(-29)
    this.reqParams.endTime = addDay(0)

    // this.reqParams.linkId = this.row.linkId
  },
  methods: {
    // 截取文件名称
    splitFileName(fileUrl) {
      let dateFileName = fileUrl.split('/')[fileUrl.split('/').length - 1]
      let fileName = dateFileName.split('-')[dateFileName.split('-').length - 1]
      let fileNameObj = {
        originalName: fileName,
        shrinkName:
          fileName.length > 10 ? fileName.substring(0, 6) + '...' : fileName,
      }
      return fileNameObj
    },

    // 切换展开收缩
    switchRadio(val) {
      localStorage.setItem('mimai_showAllTable', JSON.stringify(val))
      console.log('val', val)
    },

    //时间格式化
    getFormatDate(timeStamp) {
      return getFormatDate(timeStamp)
    },

    //关闭查看日报的弹窗
    closeDialog() {
      //子组件传值给父组件
      this.$emit('update:showDialog', false)

      this.viewDaily = []
    },

    //今日日报和昨天日报弹窗里表格的单元格合并事件
    arraySpanMethod({ row, column, rowIndex, columnIndex }) {
      if (column.columnKey === 'timeStamp') {
        return { rowspan: row.dateRowspan, colspan: 1 }
      }
      if (column.columnKey === 'feedback') {
        return { rowspan: row.dateRowspan, colspan: 1 }
      }
    },

    //展示数据
    async showDaily() {
      if (this.parentReqParams.startTime) {
        this.reqParams = { ...this.parentReqParams }
      }
      console.log('this.row', this.row)
      this.reqParams.linkId = this.row.linkId
      const res = await getViewDailyDetail(this.reqParams)
      let tempViewDaily = res.data

      //处理返回的数据，一个是合并单元格的计算，一个是把动态列从行转成列
      for (let y = 0; y < tempViewDaily.length; y++) {
        let daily = tempViewDaily[y]

        //没数据，补一条空的数据
        if (!daily.itemKeyList || daily.itemKeyList.length == 0) {
          //设置一行数据
          this.setItem(null, daily)
          this.viewDaily[this.viewDaily.length - 1].rowspan = 1
          this.viewDaily[this.viewDaily.length - 1].dateRowspan = 1
          continue
        }

        for (let i = 0; i < daily.itemKeyList.length; i++) {
          let item = daily.itemKeyList[i]

          //设置一行数据
          this.setItem(item, daily)
          if (i === 0) {
            this.viewDaily[this.viewDaily.length - 1].dateRowspan =
              daily.itemKeyList.length
          } else {
            this.viewDaily[this.viewDaily.length - 1].dateRowspan = 0
          }
        }
      }

      //百分比的折线图
      await this.geLineChart()

      //钱和人数的折线图
      await this.getAmountLineChart()
    },

    //设置一行数据
    setItem(item, daily) {
      let tempItem = {
        dailyUuid: daily.dailyUuid,
        feedback: daily.feedback,
        timeStamp: daily.timeStamp,
      }
      this.viewDaily.push(tempItem)
      //行数据转成列数据
      this.processItem(item, tempItem)
    },

    processItem(item, tempItem) {
      //-----把行数据转化成列数据,start-----------------------------------
      if (item) {
        tempItem.dailyTempCategory = item.dailyTempCategory
        tempItem.dailyTempItemName = item.dailyTempItemName
      } else {
        tempItem.dailyTempCategory = ''
        tempItem.dailyTempItemName = ''
      }

      //循环列头
      for (let x = 0; x < this.detailTitleList.length; x++) {
        let detailTitle = this.detailTitleList[x]
        //有数据才赋值
        if (
          item &&
          item.dailyTempVOList != null &&
          item.dailyTempVOList.length > 0
        ) {
          for (let z = 0; z < item.dailyTempVOList.length; z++) {
            let dailyTempVO = item.dailyTempVOList[z]
            if (dailyTempVO.dailyDataType === detailTitle.uuid) {
              tempItem[detailTitle.title] = {
                uuid: dailyTempVO.dailyDetailUuid,
                value: dailyTempVO.dailyDataContent,
                dailyDataType: dailyTempVO.dailyDataType,
              }
            }
          }
        }
        //如果行转列的时候，列头对应那行没有数据，则赋值个空字符串
        if (tempItem[detailTitle.title] == null) {
          tempItem[detailTitle.title] = {
            uuid: '',
            value: '',
            dailyDataType: detailTitle.uuid,
          }
        }
      }

      //------把行数据转化成列数据,end------------------------------------
    },

    //百分比折线图
    async geLineChart() {
      let exampleLineOptions = {
        legend: {
          // orient: 'vertical',
          left: 'left',
          data: [
            '加购率',
            '收藏率',
            '退货率',
            '转换率',
            '点击率',
            '搜索转化率',
            'UV价值',
            '平均停留时长',
          ],
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
        yAxis: [
          {
            type: 'value',
          },
          {
            type: 'value',
            yAxisIndex: 1, //在单个图表实例中存在多个y轴的时候有用
          },
        ],
        series: [
          {
            name: '加购率',
            type: 'line',
            data: [],
            markPoint: {
              data: [{ type: 'max' }],
            },
          },
          {
            name: '收藏率',
            type: 'line',
            data: [],
            markPoint: {
              data: [{ type: 'max' }],
            },
          },
          {
            name: '退货率',
            type: 'line',
            data: [],
            markPoint: {
              data: [{ type: 'max' }],
            },
          },
          {
            name: '转换率',
            type: 'line',
            data: [],
            markPoint: {
              data: [{ type: 'max' }],
            },
          },
          {
            name: '点击率',
            type: 'line',
            data: [],

            markPoint: {
              data: [{ type: 'max' }],
            },
          },
          {
            name: '搜索转化率',
            type: 'line',
            data: [],

            markPoint: {
              data: [{ type: 'max' }],
            },
          },
          {
            name: 'UV价值',
            type: 'line',
            data: [],

            markPoint: {
              data: [{ type: 'max' }],
            },
            yAxisIndex: 1, //在单个图表实例中存在多个y轴的时候有用
          },
          {
            name: '平均停留时长',
            type: 'line',
            data: [],

            markPoint: {
              data: [{ type: 'max' }],
            },
            yAxisIndex: 1, //在单个图表实例中存在多个y轴的时候有用
          },
        ],
      }

      //加购率
      const purchaseRes = await getPurchaseLineChart(this.reqParams)
      //加工各种率的数据
      let purchaseResult = this.processRate(purchaseRes.data, true)

      //收藏率
      const collectionRes = await getCollectionLineChart(this.reqParams)
      //加工各种率的数据
      let collectionResult = this.processRate(collectionRes.data, true)

      //退货率
      const refundRes = await getRefundLineChart(this.reqParams)
      //加工各种率的数据
      let refundResult = this.processRate(refundRes.data, true)

      //退货率
      const conversionRes = await getConversionLineChart(this.reqParams)
      //加工各种率的数据
      let conversionResult = this.processRate(conversionRes.data, true)

      //点击率
      const clickThroughRes = await getClickThroughLineChart(this.reqParams)
      //加工各种率的数据
      let clickThrougResult = this.processRate(clickThroughRes.data, true)

      //搜索转化率
      const searchConversionRes = await getSearchConversionRateChart(
        this.reqParams
      )
      //加工各种率的数据
      let searchConversionResult = this.processRate(
        searchConversionRes.data,
        true
      )

      //UV价值
      const UVCostRes = await getUVCostChart(this.reqParams)
      //加工各种率的数据
      let UVCostResult = this.processRate(UVCostRes.data)

      //平均停留时长
      const averageDurationRes = await getaverageDurationChart(this.reqParams)
      let averageDurationResult = this.processRate(averageDurationRes.data)

      exampleLineOptions.xAxis.data = purchaseResult.xAxis
      exampleLineOptions.series[0].data = purchaseResult.series //加购率
      exampleLineOptions.series[1].data = collectionResult.series //收藏率
      exampleLineOptions.series[2].data = refundResult.series //退货率
      exampleLineOptions.series[3].data = conversionResult.series //转换率
      exampleLineOptions.series[4].data = clickThrougResult.series //点击率
      exampleLineOptions.series[5].data = searchConversionResult.series //搜索转化率
      exampleLineOptions.series[6].data = UVCostResult.series //UV价值
      exampleLineOptions.series[7].data = averageDurationResult.series //平均停留时长
      this.purchaseLineChart = exampleLineOptions
    },

    //钱和人折线图
    async getAmountLineChart() {
      let exampleLineOptions = {
        legend: {
          // orient: 'vertical',
          left: 'left',
          data: [
            '支付件数',
            '支付买家数',
            '商品访客数',
            '加购人数',
            '搜索访客',
            '支付金额',
            '退款金额',
          ],
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
        yAxis: [
          {
            type: 'value',
          },
          {
            type: 'value',
            yAxisIndex: 1, //在单个图表实例中存在多个y轴的时候有用
          },
        ],
        series: [
          {
            name: '支付件数',
            type: 'line',
            data: [],
            markPoint: {
              data: [{ type: 'max' }],
            },
          },
          {
            name: '支付买家数',
            type: 'line',
            data: [],
            markPoint: {
              data: [{ type: 'max' }],
            },
          },
          {
            name: '商品访客数',
            type: 'line',
            data: [],
            markPoint: {
              data: [{ type: 'max' }],
            },
          },
          {
            name: '加购人数',
            type: 'line',
            data: [],
            markPoint: {
              data: [{ type: 'max' }],
            },
          },
          {
            name: '搜索访客',
            type: 'line',
            data: [],

            markPoint: {
              data: [{ type: 'max' }],
            },
          },
          {
            name: '支付金额',
            type: 'line',
            data: [],

            markPoint: {
              data: [{ type: 'max' }],
            },
            yAxisIndex: 1, //在单个图表实例中存在多个y轴的时候有用
          },
          {
            name: '退款金额',
            type: 'line',
            data: [],

            markPoint: {
              data: [{ type: 'max' }],
            },
            yAxisIndex: 1, //在单个图表实例中存在多个y轴的时候有用
          },
        ],
      }

      //支付件数
      const payCountRes = await getPayCountChart(this.reqParams)
      //加工各种率的数据
      let payCountResult = this.processRate(payCountRes.data)

      //支付件数
      const payingBuyersCountRes = await getPayingBuyersCountChart(
        this.reqParams
      )
      //加工各种率的数据
      let payingBuyersCountResult = this.processRate(payingBuyersCountRes.data)

      //商品访客数
      const visitorsCountRes = await getVisitorsCountChart(this.reqParams)
      //加工各种率的数据
      let visitorsCountResult = this.processRate(visitorsCountRes.data)

      //加购人数
      const repeatPurchaseCountRes = await getRepeatPurchaseCountChart(
        this.reqParams
      )
      //加工各种率的数据
      let repeatPurchaseCountResult = this.processRate(
        repeatPurchaseCountRes.data
      )

      //搜索访客
      const searchVisitorsRes = await getSearchVisitorsChart(this.reqParams)
      //加工各种率的数据
      let searchVisitorsResResult = this.processRate(searchVisitorsRes.data)

      //支付金额
      const payAmountRes = await getPayAmountChart(this.reqParams)
      //加工各种率的数据
      let payAmountResResult = this.processRate(payAmountRes.data)

      //支付金额
      const refundAmountRes = await getRefundAmountChart(this.reqParams)
      //加工各种率的数据
      let refundAmountResult = this.processRate(refundAmountRes.data)

      exampleLineOptions.xAxis.data = payCountResult.xAxis
      exampleLineOptions.series[0].data = payCountResult.series //支付件数
      exampleLineOptions.series[1].data = payingBuyersCountResult.series //支付买家数
      exampleLineOptions.series[2].data = visitorsCountResult.series //商品访客数
      exampleLineOptions.series[3].data = repeatPurchaseCountResult.series //加购人数
      exampleLineOptions.series[4].data = searchVisitorsResResult.series //搜索访客
      exampleLineOptions.series[5].data = payAmountResResult.series //支付金额
      exampleLineOptions.series[6].data = refundAmountResult.series //退款金额

      this.amountLineChart = exampleLineOptions
    },

    //加工各种率的数据
    processRate(data, needPercentage) {
      //处理数据，时间格式化，加百分号
      let item
      let result = { series: [], xAxis: [] }
      for (let x = 0; x < data.length; x++) {
        item = data[x]
        if (needPercentage != null && needPercentage === true) {
          result.series.push(_.round(_.multiply(100, item.rare), 2))
        } else {
          result.series.push(item.rare)
        }

        result.xAxis.push(getFormatDate(item.time))
      }
      return result
    },

    //反馈时的焦点事件
    feedbackFocus(row) {
      //是否显示反馈的保存按钮
      row.isShowFeedbackButton = true
    },

    //保存反馈
    async saveFeedback(row) {
      row.isShowFeedbackButton = false

      await addFeedback({ dailyUuid: row.dailyUuid, feedback: row.feedback })

      this.$message({
        type: 'success',
        message: '添加成功',
      })
    },
  },
}
</script>

<style lang="scss" scoped>
::v-deep {
  .el-table .cell {
    white-space: pre-line;
  }
  .dialog-table-class {
    .el-table {
      display: flex;
      flex-direction: column;
    }
    .el-table__header-wrapper {
      overflow: visible;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: center;
}

a,
a:focus,
a:hover {
  cursor: pointer;
  color: #46a6ff;
  text-decoration: underline;
}
</style>
