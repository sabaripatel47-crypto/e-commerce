<template>
  <div class="app-container">
    <!-- spu 列表 -->
    <div class="spu-container">
      <el-form class="page-search" inline ref="page-filter">
        <!--时间范围 -->
        <el-form-item label="时间范围" style="margin-right: 20px">
          <el-date-picker
            v-model="reqParams.timeArr"
            :clearable="false"
            type="daterange"
            align="right"
            unlink-panels
            value-format="timestamp"
            :picker-options="pickerOptions"
            @change="changeTime"
            @blur="blurTime"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="商品编码" style="margin-right: 20px">
          <el-input v-model="reqParams.linkId" placeholder="请输入商品编码"></el-input>
        </el-form-item>
        <el-form-item label="平台" style="margin-right: 20px">
          <el-select v-model="reqParams.platform" filterable clearable placeholder="请选择平台">
            <el-option
              v-for="(item, index) in platformList"
              :key="index"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="店铺" style="margin-right: 20px">
          <el-select v-model="reqParams.storeUuid" filterable clearable placeholder="请选择店铺">
            <el-option
              v-for="(item, index) in storeList"
              :key="index"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品等级" style="margin-right: 20px">
          <el-select filterable v-model="reqParams.linkLevel" clearable placeholder="请选择商品等级">
            <el-option
              v-for="item in linkLevelList"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="负责人" prop="manager">
          <el-cascader
            filterable
            v-model="reqParams.managerUuid"
            :options="managerList"
            :show-all-levels="false"
            :props="{
              children: 'children',
              label: 'deptName',
              value: 'deptId',
              checkStrictly: false,
            }"
            clearable
          ></el-cascader>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="clickSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- <el-radio-group v-model="reqParams.sortType" @change="clickSearch">
      <el-radio-button
        v-for="item in sortTypeList"
        :key="item.code"
        :label="item.code"
        >{{ item.name }}</el-radio-button
      >
    </el-radio-group>-->
    <el-table v-loading="tableLoading" :data="tableData" border style="width: 100%">
      <el-table-column width="50" label="序号" type="index" align="center"></el-table-column>
      <el-table-column
        label="平台"
        min-width="80"
        show-overflow-tooltip
        prop="platformName"
        align="center"
      ></el-table-column>
      <el-table-column
        label="店铺"
        min-width="310"
        show-overflow-tooltip
        prop="storeName"
        align="center"
      >
        <template v-slot="{ row }">
          <span>{{ row.storeName || "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="uuid" label="主图" align="center" width="70">
        <template v-slot="{ row }">
          <el-image
            v-if="row.urlAddress"
            style="height: 30px; width: 30px"
            :src="
              row.urlAddress + '?x-oss-process=image/resize,w_30,h_30,limit_0'
            "
            :preview-src-list="[row.urlAddress]"
          ></el-image>
          <div v-else>-</div>
        </template>
      </el-table-column>
      <el-table-column
        prop="linkTitle"
        label="商品标题"
        align="center"
        min-width="120"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <div>{{ scope.row.linkTitle ? scope.row.linkTitle : "-" }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="linkId" label="商品编码" align="center" min-width="200">
        <template slot-scope="scope">
          <div>{{ scope.row.linkId ? scope.row.linkId : "-" }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="linkName" label="商品等级" align="center" min-width="75">
        <template slot-scope="scope">
          <div>{{ scope.row.linkName ? scope.row.linkName : "-" }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="mainLinkName" label="是否主打" align="center" min-width="75">
        <template slot-scope="scope">
          <div>{{ scope.row.mainLinkName ? scope.row.mainLinkName : "-" }}</div>
        </template>
      </el-table-column>

      <el-table-column prop="linkTimeStatusName" label="商品阶段" align="center" min-width="75">
        <template slot-scope="scope">
          <div>
            {{
            scope.row.linkTimeStatusName ? scope.row.linkTimeStatusName : "-"
            }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="listingTimes" label="上架时间" align="center" min-width="100">
        <template slot-scope="scope">
          <div>
            {{
            scope.row.listingTimes
            ? getFormatDate(scope.row.listingTimes)
            : "-"
            }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="strategyName" label="项目名称" align="center" min-width="170">
        <template slot-scope="scope">
          <div>{{ scope.row.strategyName ? scope.row.strategyName : "-" }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="departmentName" label="所属事业部" align="center" min-width="100">
        <template slot-scope="scope">
          <div>{{ scope.row.departmentName ? scope.row.departmentName : "-" }}</div>
        </template>
      </el-table-column>

      <el-table-column prop="manageName" label="负责人" align="center" width="80">
        <template slot-scope="scope">
          <div>{{ scope.row.manageName ? scope.row.manageName : "-" }}</div>
        </template>
      </el-table-column>
      <!-- <el-table-column
        prop="linkTimeStatusName"
        label="商品状态"
        align="center"
        width="75"
      >
        <template slot-scope="scope">
          <div>
            {{
              scope.row.linkTimeStatusName ? scope.row.linkTimeStatusName : "-"
            }}
          </div>
        </template>
      </el-table-column>-->

      <el-table-column label="销售额(销售占比)" align="center" show-overflow-tooltip width="180">
        <template #header>
          <span
            @click="changeType(1)"
            :style="{
              color: reqParams.sortType == 1 ? '#409EFF' : '',
              fontSize: reqParams.sortType == 1 ? '17px' : '14px',
            }"
          >
            销售额(销售占比)
            <i class="el-icon-top"></i>
          </span>
        </template>
        <template slot-scope="scope">
          <div v-if="scope.row.orderAmount || scope.row.orderAmount === 0">
            <span>{{ scope.row.orderAmount.toFixed(2) }}</span>
            (
            <span>
              {{
              scope.row.orderAmountRate !== null
              ? (scope.row.orderAmountRate * 100).toFixed(2) + "%"
              : "-"
              }}
            </span>)
          </div>
          <div v-else>-</div>
        </template>
      </el-table-column>
      <el-table-column
        prop="erpQuantity"
        label="订单数"
        align="center"
        width="70"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <div>{{ scope.row.erpQuantity ? scope.row.erpQuantity : "-" }}</div>
        </template>
      </el-table-column>
      <el-table-column
        prop="customerPrice"
        label="客单价"
        align="center"
        width="100"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <div v-if="scope.row.customerPrice || scope.row.customerPrice === 0">
            <span>{{ scope.row.customerPrice.toFixed(2) }}</span>
          </div>
          <div v-else>-</div>

          <!-- <div>{{ scope.row.customerPrice ? scope.row.customerPrice : '-' }}</div> -->
        </template>
      </el-table-column>
      <el-table-column
        prop="quantityPerNum"
        label="件单量"
        align="center"
        width="100"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <div v-if="scope.row.quantityPerNum || scope.row.quantityPerNum === 0">
            <span>{{ scope.row.quantityPerNum.toFixed(2) }}</span>
          </div>
          <div v-else>-</div>

          <!-- <div>{{ scope.row.quantityPerNum ? scope.row.quantityPerNum : '-' }}</div> -->
        </template>
      </el-table-column>
      <el-table-column label="退款额(退款占比)" align="center" show-overflow-tooltip width="180">
        <template #header>
          <span
            @click="changeType(2)"
            :style="{
              color: reqParams.sortType == 2 ? '#409EFF' : '',
              fontSize: reqParams.sortType == 2 ? '17px' : '14px',
            }"
          >
            退款额(退款占比)
            <i class="el-icon-top"></i>
          </span>
        </template>
        <template slot-scope="scope">
          <div
            v-if="
              scope.row.orderRefundAmount || scope.row.orderRefundAmount === 0
            "
          >
            <span>{{ scope.row.orderRefundAmount.toFixed(2) }}</span>
            (
            <span>
              {{
              scope.row.orderRefundAmountRateb !== null
              ? (scope.row.orderRefundAmountRate * 100).toFixed(2) + "%"
              : "-"
              }}
            </span>)
          </div>
          <div v-else>-</div>
        </template>
      </el-table-column>
      <el-table-column label="退单数(退单占比)" align="center" show-overflow-tooltip width="140">
        <template slot-scope="scope">
          <div
            v-if="
              scope.row.erpRefundQuantity || scope.row.erpRefundQuantity === 0
            "
          >
            <span>{{ scope.row.erpRefundQuantity }}</span>
            (
            <span>
              {{
              scope.row.erpRefundQuantityRate !== null
              ? (scope.row.erpRefundQuantityRate * 100).toFixed(2) + "%"
              : "-"
              }}
            </span>)
          </div>
          <div v-else>-</div>
        </template>
      </el-table-column>
      <el-table-column prop="lastMonthOrderAmount" label="上月日均销售额" align="center" width="110">
        <template slot-scope="scope">
          <div>
            {{
            scope.row.lastMonthOrderAmount
            ? getFixed(scope.row.lastMonthOrderAmount)
            : "-"
            }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="orderDayAvg" label="日均销售订单" align="center" width="110">
        <template slot-scope="scope">
          <div>{{ scope.row.orderDayAvg ? scope.row.orderDayAvg : "-" }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="simpleRefundAmountRate" label="退款率" align="center" width="110">
        <template slot-scope="scope">
          <div>
            {{
            scope.row.simpleRefundAmountRate !== null
            ? (scope.row.simpleRefundAmountRate * 100).toFixed(2) + "%"
            : "-"
            }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="cost" label="推广费" align="center" width="110">
        <template #header>
          <span
            @click="changeType(7)"
            :style="{
              color: reqParams.sortType == 7 ? '#409EFF' : '',
              fontSize: reqParams.sortType == 7 ? '17px' : '14px',
            }"
          >
            推广费
            <i class="el-icon-top"></i>
          </span>
        </template>
        <template slot-scope="scope">
          <div>{{ scope.row.cost ? scope.row.cost : "-" }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="promotionPercentage" label="推广占比" align="center" width="75">
        <template slot-scope="scope">
          <div>
            {{
            scope.row.promotionPercentage
            ? getPercent(scope.row.promotionPercentage)
            : "-"
            }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="roi" label="ROI" align="center" width="75">
        <template slot-scope="scope">
          <div>{{ getFixed(scope.row.roi)}}</div>
        </template>
      </el-table-column>
      <el-table-column prop="rankCount" label="榜单个数" align="center" width="75">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.rankCount"
            type="text"
            @click="getRankDetail(scope.row)"
          >{{ scope.row.rankCount }}</el-button>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="120">
        <template slot-scope="scope">
          <el-button
            type="text"
            :disabled="scope.row.linkId === '无链接'"
            @click="lookBoardGoods(scope.row)"
            size="small"
          >看板</el-button>
          <el-button
            type="text"
            :disabled="scope.row.linkId === '无链接'"
            size="small"
            @click="itemDetailGoods(scope.row)"
          >明细</el-button>
          <el-tooltip
            :disabled="scope.row.isPromotionJump"
            content="当前商品无推广数据"
            placement="top"
            effect="light"
          >
            <el-button
              type="text"
              :disabled="
                scope.row.linkId === '无链接' ||
                scope.row.isPromotionJump == false
              "
              size="small"
              @click="linkBoardGoods(scope.row)"
            >推广</el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="reqParams.page"
      :limit.sync="reqParams.pageSize"
      @pagination="getTableList"
    />

    <!-- 看板弹层 -->
    <el-dialog
      :title="rowParams.linkTitle + '商品链接看板'"
      @close="closeLinkBoardDialog"
      :visible.sync="showLinkBoardDialog"
      show-close
      append-to-body
      fullscreen
    >
      <LinkBoard v-if="showLinkBoardDialog" :rowParams="rowParams" :storeDisabled="true"></LinkBoard>
    </el-dialog>

    <!-- 明细 -->
    <LinkStatistic
      v-if="linkDetailStatus"
      @closeDialog="detailStatus"
      :show="linkDetailStatus"
      :view="'link'"
      :row="rowData"
      :title="detailTitle"
    ></LinkStatistic>

    <el-dialog
      v-if="inkPromotionStatus"
      fullscreen
      :visible.sync="inkPromotionStatus"
      append-to-body
    >
      <LinkPromotion :dateRange="reqParams.timeArr" :rowData="promotionParams"></LinkPromotion>
    </el-dialog>

    <!-- 榜单详情弹窗 -->
    <RankDetails :visible.sync="rankDetailsVisible" :linkId="rankDetailsLinkId"></RankDetails>
  </div>
</template>

<script>
import {
  addDay,
  addDayEnd,
  getDeptTreeData,
  getLastValue,
  getFormatDate,
} from '@/utils/common.js'
import { department } from '@/api/information/department'
import { getTableList } from '@/api/bulletinboard/linkStatistics'
import {
  listPlatform,
  listStore,
  listLinkLevel,
} from '@/api/baseData/common.js'
import LinkBoard from '@/views/bulletinboard/linkBoard'
import LinkStatistic from '@/views/bulletinboard/storestatistics/components/LinkStatistic.vue'
import LinkPromotion from '@/views/promotionData/linkPromotion/index.vue'
import RankDetails from './components/RankDetails.vue'
export default {
  name: 'LinkStatistics',
  components: {
    LinkStatistic,
    LinkBoard,
    LinkPromotion,
    RankDetails,
  },
  data() {
    return {
      // 查询列表入参
      reqParams: {
        timeArr: [], // 时间范围原数组
        storeUuid: '', // 店铺uuid
        platform: '', // 平台
        linkId: '', // 链接id
        linkLevel: '', // 商品等级
        managerUuid: '', // 负责人
        sortType: 1, // 排序类型 1：销售额  2：退款额
        page: 1,
        pageSize: 10,
        formatType: 2,
        startTime: '',
        endTime: '',
      },
      // 显示链接看板
      showLinkBoardDialog: false,
      //商品链接状态
      linkDetailStatus: false,
      // 看板弹层入参
      rowParams: {},

      // 明细dialog标题
      detailTitle: '',

      //当前选择的dialog数据
      rowData: null,

      // 列表数据
      tableData: [],
      // 列表加载状态
      tableLoading: false,
      // 总条数
      total: 0,

      // 平台下拉框数据
      platformList: [],
      // 店铺下拉框数据
      storeList: [],
      // 商品等级下拉框
      linkLevelList: [],
      // 商品等级下拉框
      managerList: [],
      // 排序类型单选数据
      sortTypeList: this.$store.state.statistics.SORT_TYPE,

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
      // 推广看板显示隐藏
      inkPromotionStatus: false,
      // 推广看板传参
      promotionParams: {},
      // 榜单详情弹窗
      rankDetailsVisible: false,
      // 榜单详情linkId
      rankDetailsLinkId: '',
    }
  },
  async created() {
    this.reqParams.startTime = addDay(-7)
    this.reqParams.endTime = addDayEnd(-1)
    this.reqParams.timeArr.push(this.reqParams.startTime)
    this.reqParams.timeArr.push(this.reqParams.endTime)

    await this.getTableList()
    await this.getStoreList()
    await this.getPlatformList()
    await this.getLinkLevelList()
    await this.getDeptTree()
  },

  methods: {
    // 查看榜单明细
    getRankDetail(row) {
      this.rankDetailsLinkId = row.linkId
      this.rankDetailsVisible = true
    },

    //商品链接看板
    lookBoardGoods(row) {
      // console.log('row', { ...row })
      this.rowParams = {
        linkTitle: row.storeName || '',
        storeUuid: row.storeUuId,
        platformUuid: row.platform,
        linkId: row.linkId,
        startTime: this.reqParams.startTime,
        endTime: this.reqParams.endTime,
        formatType: this.reqParams.formatType,
      }
      this.showLinkBoardDialog = true
    },

    // 关闭明细
    detailStatus() {
      this.linkDetailStatus = false
    },

    //商品链接明细
    itemDetailGoods(row) {
      const rowDataAss = Object.assign(row, {
        timeArr: this.reqParams.timeArr,
      })
      this.rowData = rowDataAss
      this.detailTitle = '商品链接明细'
      this.linkDetailStatus = true
    },

    // 关闭链接看板
    closeLinkBoardDialog() {
      this.showLinkBoardDialog = false
    },

    // 点击搜索
    clickSearch() {
      this.reqParams.page = 1
      this.getTableList()
    },
    // 排序类型改变
    changeType(val) {
      this.reqParams.sortType = val
      this.reqParams.page = 1
      this.getTableList()
    },

    // 选择时间
    changeTime(val) {
      if (val) {
        this.reqParams.startTime = val[0]
        this.reqParams.endTime = val[1]
      }
    },

    // 时间选择失焦时将startPickerTime置空 目的是清除禁用的时间范围
    blurTime() {
      this.startPickerTime = ''
    },

    // 获取列表数据
    async getTableList() {
      this.tableLoading = true
      this.reqParams.managerUuid = getLastValue(this.reqParams.managerUuid)
      const res = await getTableList(this.reqParams)
      this.tableData = res.data.records
      this.total = res.data.total
      this.tableLoading = false
    },

    //获取店铺
    async getStoreList() {
      const res = await listStore()
      this.storeList = res.data
    },

    //获取平台
    async getPlatformList() {
      const res = await listPlatform()
      this.platformList = res.data
    },

    //商品等级的下拉框
    async getLinkLevelList() {
      const res = await listLinkLevel()
      this.linkLevelList = res.data
    },

    // 负责人组织架构数据
    async getDeptTree() {
      const res = await department()
      this.managerList = await getDeptTreeData(res.data)
    },
    // 时间戳转换
    getFormatDate(date) {
      return getFormatDate(date)
    },
    // 百分比转换
    getPercent(num) {
      if (num || num === 0) {
        return (num * 100).toFixed(2) + '%'
      } else {
        return '-'
      }
    },
    // 保留两位小数
    getFixed(num) {
      if (num || num === 0) {
        return num.toFixed(2)
      } else {
        return '-'
      }
    },
    linkBoardGoods(row) {
      this.inkPromotionStatus = true
      this.promotionParams = row
    },
  },
}
</script>

<style>
</style>