<template>
  <div class="statistics">
    <el-dialog :title="title" @close="closeDialog" :visible.sync="delogShow" show-close fullscreen>
      <el-button
        type="text"
        icon="el-icon-arrow-left"
        class="dialog-back-button"
        @click="closeDialog"
      >返回</el-button>
      <div class="statistics-container">
        <!-- 链接列表 -->
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
                  @change="changeLinkTime"
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
            <el-button type="primary" icon="el-icon-search" @click="clickSearch">搜索</el-button>
          </el-form-item>
        </el-form>
        <el-table v-loading="tableLoading" fit :data="tableDataList" border style="width: 100%">
          <el-table-column prop="urlAddress" label="主图" width="80" align="center">
            <template v-slot="{ row, $index }">
              <el-image
                v-if="row.urlAddress"
                style="height: 30px;width: 30px;"
                :src="row.urlAddress + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
                :preview-src-list="[row.urlAddress]"
              ></el-image>
              <span v-else>暂无主图</span>
            </template>
          </el-table-column>
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
            prop="linkId"
            label="商品链接编码"
            align="center"
            width="160"
            show-overflow-tooltip
          >
            <template slot-scope="{row}">
              <div>{{ formatTableItemCode(row.linkId) }}</div>
            </template>
          </el-table-column>
          <el-table-column
            prop="linkTitle"
            label="商品名称"
            align="center"
            width="200"
            show-overflow-tooltip
          >
            <template slot-scope="{row}">
              <div>{{ formatTableItemCode(row.linkTitle) }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="linkName" label="商品等级" align="center" width="80">
            <template slot-scope="{row}">
              <div>{{ formatTableItemCode(row.linkName) }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="linkTimeStatusName" label="商品阶段" align="center" width="80">
            <template slot-scope="{row}">
              <div>{{ formatTableItemCode(row.linkTimeStatusName) }}</div>
            </template>
          </el-table-column>
          <el-table-column
            prop="manageName"
            label="负责人"
            align="center"
            width="80"
            show-overflow-tooltip
          >
            <template slot-scope="{row}">
              <div>{{ formatTableItemCode(row.manageName) }}</div>
            </template>
          </el-table-column>
          <el-table-column
            prop="time"
            :label="item"
            v-for="(item, index) in timeTableArr"
            :key="`link-${index}`"
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

          <el-table-column label="操作" width="80" show-overflow-tooltip>
            <template slot-scope="scope">
              <el-button
                type="text"
                size="small"
                :disabled="STA_KEY_ARR.includes(reqParams.statisticsType)"
                @click="getLinkLineOptions(tableDataList , scope.row)"
              >趋势</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div style="margin-top: 50px;">
        <el-radio-group v-model="activeRadio" @change="SkuRadioChange">
          <el-radio-button label="sku">SKU</el-radio-button>
          <el-radio-button label="spu">SPU</el-radio-button>
        </el-radio-group>
        <LinkSkuStatistic
          v-if="activeRadio==='sku'"
          :tableDataList.sync="linkSkuTableData"
          :statisticsType.sync="reqParams.statisticsType"
          :STA_KEY_ARR.sync="STA_KEY_ARR"
          :timeTableArr.sync="timeTableArr"
          :tableLoading.sync="tableLoading"
        ></LinkSkuStatistic>
        <LinkSpuStatistic
          v-if="activeRadio==='spu'"
          :tableDataList.sync="linkSpuTableData"
          :statisticsType.sync="reqParams.statisticsType"
          :STA_KEY_ARR.sync="STA_KEY_ARR"
          :timeTableArr.sync="timeTableArr"
          :tableLoading.sync="tableLoading"
        ></LinkSpuStatistic>
        <pagination
          v-show="total>0"
          :total="total"
          :page.sync="reqParams.page"
          :limit.sync="reqParams.pageSize"
          @pagination="pageChange"
        />
      </div>
    </el-dialog>
    <el-dialog
      width="70%"
      title="链接趋势"
      :visible.sync="showLinkLine"
      append-to-body
      style="overflow-x: auto;"
    >
      <line-chart
        v-if="showLinkLine"
        :option="lineChartOption"
        :chartData="lineChartOption"
        :height="'320px'"
      ></line-chart>
    </el-dialog>
  </div>
</template>

<script>
import lineChart from '@/components/charts/LineChart.vue'
import LinkSkuStatistic from '@/views/bulletinboard/storestatistics/components/LinkSkuStatistic.vue'
import LinkSpuStatistic from '@/views/bulletinboard/storestatistics/components/LinkSpuStatistic.vue'
import { getFormatDate, getFormaMonth } from '@/utils/common.js'
import {
  getLinkDetailList,
  getLinkSkuDetailList,
  getLinkSpuDetailList,
  tableHander,
} from '@/api/bulletinboard/storestatistics'
import { fromStatisticsType, setItemColor } from '@/utils/statisticsCommon.js'
import { addDay, addDayEnd } from '@/utils/common.js'
export default {
  name: 'LinkStatistic',
  components: { lineChart, LinkSkuStatistic, LinkSpuStatistic },
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
      default: '链接明细',
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
  data() {
    return {
      // 分页总条数
      total: 0,
      // sku spu的radio
      activeRadio: 'sku',
      // 同比环比的数据配置key
      STA_KEY_ARR: [10, 11, 12],
      // 展示链接趋势图
      showLinkLine: false,
      // 趋势图折线数据
      lineChartOption: {},
      // 弹窗是否显示
      delogShow: true,
      // 链接明细列表入参
      reqParams: {
        linkId: '', // 链接uuid
        statisticsType: null, // 统计类型
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
      // sku列表数据
      linkSkuTableData: [],
      // spu列表数据
      linkSpuTableData: [],
      // 时间列头
      timeTableArr: [],
      // 链接时间范围
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
    this.reqParams.formatType = this.row.formatType || 2
    this.timeScope = this.row.timeArr
    this.changeLinkTime(this.timeScope)
    // 统计类型赋默认值
    this.reqParams.statisticsType = this.gradeType[0].code

    // 获取列表数据
    this.getLinkList()
  },
  methods: {
    // 链接趋势图
    getLinkLineOptions(data, row) {
      this.showLinkLine = true
      this.lineChartOption = {}
      const option = {
        title: {
          text:
            row.linkTitle +
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
      // console.log('data', data)

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
          name: row.linkTitle,
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

    // 点击搜索按钮
    clickSearch() {
      this.reqParams.page = 1
      this.getLinkList()
    },

    // 获取列表数据
    async getLinkList() {
      this.tableLoading = true
      // 赋值链接uuid
      this.reqParams.linkId = this.row.linkId
      // console.log('row', this.row)

      // console.log('this.reqParams', this.reqParams)

      // 获取动态表头的数据
      let timeRes = await tableHander(this.reqParams)
      this.timeTableArr = timeRes.data
      this.assemblyHeader()

      // 请求列表接口数据
      const res = await getLinkDetailList(this.reqParams)
      this.tableDataList = [res.data]

      this.assemblyTableData(this.tableDataList)
      await this.getSkuOrSpuList()
      this.tableLoading = false
    },

    // 分页页码切换
    async pageChange(val) {
      console.log('val', val)
      this.tableLoading = true
      this.reqParams.page = val.page
      await this.getSkuOrSpuList()
      this.tableLoading = false
    },

    // sku spu切换
    async SkuRadioChange(val) {
      this.tableLoading = true
      this.activeRadio = val
      this.reqParams.page = 1
      await this.getSkuOrSpuList()
      this.tableLoading = false
    },

    // 获取sku或spu的列表数据
    async getSkuOrSpuList() {
      if (this.activeRadio === 'sku') {
        const res = await getLinkSkuDetailList(this.reqParams)
        this.linkSkuTableData = res.data.records
        this.total = res.data.total
        this.assemblyTableData(this.linkSkuTableData)
      } else {
        const res = await getLinkSpuDetailList(this.reqParams)
        this.linkSpuTableData = res.data.records
        this.total = res.data.total
        this.assemblyTableData(this.linkSpuTableData)
      }
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
    assemblyTableData(data) {
      data.forEach((item, i) => {
        this.$set(data[i], 'origin', [])
        item.dataTimeVOList.map((obj, index) => {
          data[i].origin.push(
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
          data[i][this.timeTableArr[index]] = str
        })
      })
      console.log('最终的列表数据', data)
    },

    // 时间范围选择change事件
    changeLinkTime(val) {
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
      this.clickSearch()
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