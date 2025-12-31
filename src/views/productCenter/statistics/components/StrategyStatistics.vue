<template>
  <div class="statistics">
    <el-dialog :title="title" @close="closeDialog" :visible.sync="delogShow" show-close fullscreen>
      <div class="statistics-container">
        <!-- 项目列表 -->
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
                  @change="chandeStrategyTime"
                  @blur="blurTime"
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
            <el-button type="primary" icon="el-icon-search" @click="getStrategyList">搜索</el-button>
          </el-form-item>
        </el-form>
        <el-table v-loading="tableLoading" fit :data="tableDataList" border style="width: 100%">
          <el-table-column
            prop="strategyTitle"
            align="center"
            label="项目标题"
            min-width="140"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <div>{{ scope.row.strategyTitle ? scope.row.strategyTitle : '-' }}</div>
            </template>
          </el-table-column>
          <el-table-column
            prop="strategyNumber"
            align="center"
            label="项目编号"
            min-width="130"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <div>{{ scope.row.strategyNumber ? scope.row.strategyNumber : '-'}}</div>
            </template>
          </el-table-column>
          <el-table-column prop="strategyGradeName" label="项目等级" align="center" min-width="80"></el-table-column>
          <el-table-column prop="strategyTimeStatusName" label="项目阶段" align="center" min-width="75"></el-table-column>
          <el-table-column prop="managerName" label="项目实施人" align="center" width="80"></el-table-column>
          <el-table-column
            prop="trackUrl"
            label="产品图片"
            align="center"
            min-width="110"
            show-overflow-tooltip
          >
            <template v-slot="{ row }">
              <el-image
                v-for="(item, index) in row.imageUrls"
                :key="index"
                style="height: 30px; width: 30px"
                :src="item.url + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
                :preview-src-list="[item.url]"
                :initial-index="0"
              ></el-image>
            </template>
          </el-table-column>
          <el-table-column prop="track" label="赛道" min-width="150" align="center">
            <template slot-scope="scope">
              <div>{{ scope.row.track ? scope.row.track : '-'}}</div>
            </template>
          </el-table-column>
          <el-table-column prop="category" align="center" label="品类" min-width="150">
            <template slot-scope="scope">
              <div v-if="scope.row.categoryValue && scope.row.categoryValue.length>0">
                <div v-for="(item,index) in scope.row.categoryValue" :key="index">{{ item }}</div>
              </div>
              <div v-else>-</div>
            </template>
          </el-table-column>
          <el-table-column
            prop="groundingTimeDate"
            label="上架时间"
            min-width="110"
            align="center"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <div>{{ scope.row.groundingTimeDate ? getFormatDate(scope.row.groundingTimeDate) : '-'}}</div>
            </template>
          </el-table-column>
          <el-table-column
            prop="statusName"
            label="状态"
            min-width="60"
            align="center"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="time"
            :label="item"
            v-for="(item, index) in timeTableArr"
            :key="`strategy-${index}`"
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
        </el-table>
      </div>
      <div style="margin-top: 60px;" v-if="!STA_KEY_ARR.includes(reqParams.statisticsType)">
        <line-chart
          :option="strategyChartOption"
          :chartData="strategyChartOption"
          :width="'100%'"
          :height="'60vh'"
        ></line-chart>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import lineChart from '@/components/charts/LineChart.vue'
import { getFormatDate, getFormaMonth } from '@/utils/common.js'
import { tableHander } from '@/api/bulletinboard/storestatistics'
import { getStrategyDetailList } from '@/api/productCenter/strategyStatistics.js'
import { fromStatisticsType, setItemColor } from '@/utils/statisticsCommon.js'
import { addDay, addDayEnd } from '@/utils/common.js'
export default {
  name: 'StrategyStatistics',
  components: { lineChart },
  props: {
    // 是否显示dialog
    show: {
      type: Boolean,
      default: false,
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
      default: '项目明细',
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
      // 展示项目趋势图
      showStrategyStrategy: false,
      // 趋势图折线数据
      strategyChartOption: {},
      // 弹窗是否显示
      delogShow: true,
      // 项目明细列表入参
      reqParams: {
        uuid: '', // 项目uuid
        statisticsType: '', // 统计类型
        formatType: 2, // 时间类型 1按月 2按日
        startTime: '', // 开始时间
        endTime: '', // 结束时间
        page: 1,
        pageSize: 10,
      },
      // 列表加载状态
      tableLoading: false,
      // 列表数据
      tableDataList: [],
      // 时间列头
      timeTableArr: [],
      // 项目时间范围
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
    this.reqParams.formatType = this.row.formatType || 2
    console.log('row', this.row)
    this.chandeStrategyTime(this.timeScope)
    // 统计类型赋默认值
    this.reqParams.statisticsType = this.gradeType[0].code

    // 获取列表数据
    this.getStrategyList()
  },
  methods: {
    // 时间格式转化
    getFormatDate(time) {
      return getFormatDate(parseInt(time))
    },
    // 项目趋势图
    getStrategyStrategyOptions(data, row) {
      this.showStrategyStrategy = true
      this.strategyChartOption = {}
      const option = {
        title: {
          text:
            row.strategyTitle +
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
      console.log('data', data)

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
        console.log('item.origin', item.origin)

        option.series.push({
          name: row.strategyTitle,
          type: 'line',
          data: [...item.origin],
        })
      })
      console.log('option', option)
      this.$nextTick(() => {
        this.strategyChartOption = { ...option }
      })
    },

    // 关闭明细页面
    closeDialog() {
      this.$emit('closeDialog')
    },

    // 获取列表数据
    async getStrategyList() {
      this.tableLoading = true
      // 赋值项目uuid
      this.reqParams.uuid = this.row.uuid

      // console.log('this.reqParams', this.reqParams)

      // 获取动态表头的数据
      let timeRes = await tableHander(this.reqParams)
      this.timeTableArr = timeRes.data
      this.assemblyHeader()

      // 请求列表接口数据
      const [err, res] = await this.$to(getStrategyDetailList(this.reqParams))
      this.tableDataList = [res.data]

      this.assemblyTableData()
      this.getStrategyStrategyOptions(this.tableDataList, this.tableDataList[0])

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
        if (item.list) {
          item.list.map((obj, index) => {
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
    chandeStrategyTime(val) {
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
      this.getStrategyList()
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