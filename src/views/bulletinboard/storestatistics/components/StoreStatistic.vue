<template>
  <div class="StoreStatistic">
    <el-dialog :title="title" @close="closeDialog" :visible.sync="delogShow" show-close fullscreen>
      <div class="statistics-container">
        <!-- 店铺列表 -->
        <el-form class="page-search" inline ref="page-filter">
          <!--时间范围 -->
          <el-form-item label="时间范围：" style="margin-right: 20px">
            <div class="time-class">
              <div class="time-radio">
                <el-radio-group v-model="reqParams.formatType" size="mini">
                  <el-radio-button :label="2">按日</el-radio-button>
                  <el-radio-button :label="1">按月</el-radio-button>
                </el-radio-group>
              </div>
              <div class="time-pick">
                <el-date-picker
                  ref="datePick"
                  v-model="timeScope"
                  :clearable="false"
                  :type="reqParams.formatType == 2 ? 'daterange' : 'monthrange'"
                  :key="reqParams.formatType == 2 ? 'daterange' : 'monthrange'"
                  align="right"
                  unlink-panels
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="timestamp"
                  :picker-options="reqParams.formatType == 2 ? pickerOptions : ''"
                  @change="chandeStoreTime"
                  style="padding-right: 20px;"
                ></el-date-picker>
              </div>
            </div>
          </el-form-item>
          <!-- 下拉选择统计类型 -->
          <el-form-item label="统计类型：" style="margin-right: 20px;">
            <el-select
              @change="changeSelectType"
              v-model="reqParams.statisticsType"
              placeholder="请选择统计类型"
            >
              <el-option
                v-for="item in gradeType"
                :key="item.code"
                :label="item.name"
                :value="item.code"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="getStoreList">搜索</el-button>
          </el-form-item>
        </el-form>
        <el-table
          v-loading="tableLoading"
          v-if="view === 'store'"
          fit
          :data="tableDataList"
          border
          style="width: 100%"
        >
          <el-table-column
            prop="platformName"
            label="平台"
            align="center"
            width="100"
            show-overflow-tooltip
          >
            <template slot-scope="{row}">
              <div>{{ formatTableItemCode(row.platformName) }}</div>
            </template>
          </el-table-column>
          <el-table-column
            prop="storeName"
            label="店铺名称"
            align="center"
            width="310"
            show-overflow-tooltip
          >
            <template slot-scope="{row}">
              <div>{{ formatTableItemCode(row.storeName) }}</div>
            </template>
          </el-table-column>
          <el-table-column
            prop="managerName"
            label="负责人"
            align="center"
            width="70"
            show-overflow-tooltip
          >
            <template slot-scope="{row}">
              <div>{{ formatTableItemCode(row.managerName) }}</div>
            </template>
          </el-table-column>
          <el-table-column
            prop="time"
            :label="item"
            v-for="(item, index) in timeTableArr"
            :key="`store-${index}`"
            min-width="90"
          >
            <template slot-scope="{row}">
              <div v-if="STA_KEY_ARR.includes(reqParams.statisticsType)">
                <div
                  :class="{ 'item-red': setItemColor(row.origin[index][0]) === 'red', 'item-green': setItemColor(row.origin[index][0]) === 'green' }"
                >同比：{{ row.origin[index][0] }};</div>
                <div
                  :class="{ 'item-red': setItemColor(row.origin[index][1]) === 'red', 'item-green': setItemColor(row.origin[index][1]) === 'green' }"
                >环比：{{ row.origin[index][1] }}</div>
              </div>
              <div v-else>{{ row[item] }}</div>
            </template>
          </el-table-column>
          <!-- 趋势不用弹层 暂时注释 后期可删除 -->
          <!-- <el-table-column label="操作" width="80" show-overflow-tooltip>
            <template slot-scope="scope">
              <el-button
                type="text"
                size="small"
                :disabled="STA_KEY_ARR.includes(reqParams.statisticsType)"
                @click="getStoreLineOptions(tableDataList , scope.row)"
              >趋势</el-button>
            </template>
          </el-table-column>-->
        </el-table>
      </div>
      <div style="margin-top: 60px;" v-if="!STA_KEY_ARR.includes(reqParams.statisticsType)">
        <line-chart
          :option="lineChartOption"
          :chartData="lineChartOption"
          :width="'100%'"
          :height="'60vh'"
        ></line-chart>
      </div>
    </el-dialog>
    <!-- 单挑数据 趋势直接渲染在表格下 暂时不用弹层了 -->
    <!-- <el-dialog
      width="70%"
      title="店铺趋势"
      :visible.sync="showStoreLine"
      append-to-body
      style="overflow-x: auto;"
    >
      <line-chart
        v-if="showStoreLine"
        :option="lineChartOption"
        :chartData="lineChartOption"
        :height="'320px'"
      ></line-chart>
    </el-dialog>-->
  </div>
</template>

<script>
import lineChart from '@/components/charts/LineChart.vue'
import { getFormatDate, getFormaMonth } from '@/utils/common.js'
import {
  getStoreDetailList,
  tableHander,
} from '@/api/bulletinboard/storestatistics'
import { fromStatisticsType, setItemColor } from '@/utils/statisticsCommon.js'
import { addDay, addDayEnd } from '@/utils/common.js'
export default {
  name: 'StoreStatistic',
  components: { lineChart },
  props: {
    // 是否显示dialog
    show: {
      type: Boolean,
      default: false,
    },
    // dialog是店铺还是商品
    view: {
      type: String,
      default: 'store',
    },
    // 选择的数据
    row: {
      type: Object,
      default: () => {
        return {}
      },
    },
    title: {
      type: String,
      default: '店铺明细',
    },
  },
  watch: {
    show(val) {
      // console.log('val: ', val)
      if (val) {
        this.delogShow = val
      }
    },
  },
  components: { lineChart },
  data() {
    return {
      // 同比环比的数据配置key
      STA_KEY_ARR: [10, 11, 12],
      // 展示店铺趋势图
      showStoreLine: false,
      // 趋势图折线数据
      lineChartOption: {},
      // 弹窗是否显示
      delogShow: true,
      // 店铺明细列表入参
      reqParams: {
        storeUuid: '', // 店铺uuid
        statisticsType: '', // 统计类型
        formatType: 2, // 时间类型 1按月 2按日
        startTime: '', // 开始时间
        endTime: '', // 结束时间
      },
      // 列表加载状态
      tableLoading: false,
      // 列表数据
      tableDataList: [],
      // 时间列头
      timeTableArr: [],
      // 店铺时间范围
      timeScope: [],
      // 统计类型下拉框
      gradeType: this.$store.state.statistics.GRADETYPE_LIST_NOLEVEL,

      // 选中的开始时间
      startPickerTime: '',
      // 时间范围快捷选择
      pickerOptions: {
        shortcuts: [
          {
            text: '最近7天',
            onClick(picker) {
              const end = addDay(-1)
              const start = addDayEnd(-7)
              // start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: '最近14天',
            onClick(picker) {
              const end = addDay(-1)
              const start = addDayEnd(-14)
              // start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: '最近1个月',
            onClick(picker) {
              const end = addDay(-1)
              const start = addDayEnd(-30)
              // start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            },
          },
        ],
        // 当点击时 将时间拿来做禁用时间范围计算
        onPick: (timeObj) => {
          this.startPickerTime = new Date(timeObj.minDate).getTime()
        },
        disabledDate: (time) => {
          if (!this.startPickerTime) return false
          const now = this.startPickerTime
          // 31 * 24 * 3600 * 1000 是31天的毫秒数
          const minTime = now - 31 * 24 * 3600 * 1000
          const maxTime = now + 31 * 24 * 3600 * 1000

          return time.getTime() < minTime || time.getTime() > maxTime
        },
      },
    }
  },
  created() {
    // 初次查询列表赋默认入参值
    this.timeScope = this.row.timeArr
    this.chandeStoreTime(this.timeScope)
    // 统计类型赋默认值
    this.reqParams.statisticsType = this.gradeType[0].code

    // 获取列表数据
    this.getStoreList()
  },
  methods: {
    // 店铺趋势图
    getStoreLineOptions(data, row) {
      // this.showStoreLine = true

      this.lineChartOption = {}
      const option = {
        title: {
          text:
            (row.storeName || '') +
            '-' +
            this.$store.state.statistics.GRADETYPE_NAME[
              this.reqParams.statisticsType
            ],
          left: 'center',
        },
        tooltip: {
          formatter:
            this.reqParams.statisticsType === 7
              ? '{a} <br/>{b}  {c}%'
              : '{a} <br/>{b}  {c}',
        },
        legend: { orient: 'vertical', left: 'left', data: [] },
        xAxis: { data: this.timeTableArr }, // 时间点集合
        yAxis: { type: 'value' },
        series: [],
      }

      data.map((item, index) => {
        // 如果是退款率 去除退款率后的%
        if (this.reqParams.statisticsType === 7) {
          item.origin = item.origin.map((el) => {
            if (el) {
              el = el.split('%').join('')
            }
            return el
          })
        }
        // console.log('item.origin', item.origin)

        option.series.push({
          name: row.storeName,
          type: 'line',
          data: [...item.origin],
        })
      })
      this.$nextTick(() => {
        this.lineChartOption = { ...option }
      })
    },

    // 关闭明细页面
    closeDialog() {
      this.$emit('closeDialog')
    },

    // 获取列表数据
    async getStoreList() {
      this.tableLoading = true
      // 赋值店铺uuid
      this.reqParams.storeUuid = this.row.storeUuId

      // console.log('this.reqParams', this.reqParams)

      // 获取动态表头的数据
      let timeRes = await tableHander(this.reqParams)
      this.timeTableArr = timeRes.data
      this.assemblyHeader()

      // 请求列表接口数据
      const [err, res] = await this.$to(getStoreDetailList(this.reqParams))

      this.tableDataList = [res.data]
      this.assemblyTableData()
      this.getStoreLineOptions(this.tableDataList, this.tableDataList[0])

      if (err) {
        this.tableDataList = []
      }
      this.tableLoading = false
    },

    // 处理动态的时间表头
    assemblyHeader() {
      // 将时间戳转化为时间格式
      if (this.reqParams.formatType === 2) {
        this.timeTableArr = this.timeTableArr.map((item) => {
          return getFormatDate(parseInt(item))
        })
      } else {
        this.timeTableArr = this.timeTableArr.map((item) => {
          return getFormaMonth(parseInt(item))
        })
      }
    },

    // 组装列表数据
    assemblyTableData() {
      this.tableDataList.forEach((item, i) => {
        this.$set(this.tableDataList[i], 'origin', [])
        if (item.dataTimeVOList) {
          item.dataTimeVOList.map((obj, index) => {
            // 趋势用的数据
            this.tableDataList[i].origin.push(
              ...fromStatisticsType(
                obj,
                this.reqParams.statisticsType,
                false,
                this.STA_KEY_ARR
              )
            )

            let str = fromStatisticsType(
              obj,
              this.reqParams.statisticsType,
              true,
              this.STA_KEY_ARR
            )
            this.tableDataList[i][this.timeTableArr[index]] = str
          })
        }
      })
      console.log('最终的列表数据', this.tableDataList)
    },

    // 时间范围选择change事件
    chandeStoreTime(val) {
      if (val) {
        this.reqParams.startTime = val[0]
        this.reqParams.endTime = val[1]
      } else {
        this.reqParams.startTime = ''
        this.reqParams.endTime = ''
      }
    },
    // 时间选择失焦时将startPickerTime置空 目的是清除禁用的时间范围
    blurTime() {
      this.startPickerTime = ''
    },

    // 统计类型下拉框change事件
    changeSelectType(val) {
      this.reqParams.statisticsType = val
      this.getStoreList()
    },

    // 转换表格内容空的为-
    formatTableItemCode(str) {
      return str ?? '-'
    },

    // 设置单元格颜色
    setItemColor(origin) {
      return setItemColor(origin)
    },
  },
}
</script>

<style lang="scss" scoped>
::v-deep {
  .el-table--medium .el-table__cell {
    padding: 20px 0 !important;
  }
}
.time-class {
  margin-top: -32px;

  .time-pick {
    margin-top: -4px;
  }
}
.item-red {
  color: red;
}

.item-green {
  color: green;
}
</style>