<template>
  <div class="app-container">
    <!-- 搜索条件 -->
    <div class="head-container">
      <el-form class="page-search" inline ref="page-filter">
        <!-- 时间范围 -->
        <el-form-item label="时间范围" style="margin-right: 20px">
          <el-date-picker
            v-model="parentParams.timeArr"
            :clearable="false"
            type="daterange"
            align="right"
            unlink-panels
            value-format="timestamp"
            :picker-options="pickerOptions"
            @change="changeTime"
            @blur="blurTime"
            style="width: 250px"
          ></el-date-picker>
        </el-form-item>
        <!-- 平台 -->
        <el-form-item label="平台" style="margin-right: 20px">
          <el-select v-model="parentParams.platform" filterable clearable placeholder="请选择平台">
            <el-option
              v-for="item in platformList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- 店铺 -->
        <el-form-item label="店铺" style="margin-right: 20px">
          <el-select v-model="parentParams.storeUuid" filterable clearable placeholder="请选择店铺">
            <el-option
              v-for="item in storeList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- 负责人 -->
        <el-form-item label="负责人" style="margin-right: 20px">
          <el-cascader
            filterable
            v-model="parentParams.managerUuid"
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
        <!-- 是否主打 -->
        <el-form-item label="是否主打" style="margin-right: 20px">
          <el-select v-model="parentParams.mainLink" filterable clearable placeholder="请选择">
            <el-option label="是" :value="1"></el-option>
            <el-option label="否" :value="0"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="clickSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 父表 -->
    <div class="parent-table-container">
      <el-table
        v-loading="parentTableLoading"
        :data="parentTableData"
        border
        style="width: 100%"
        height="400"
        @row-click="handleRowClick"
      >
        <el-table-column type="index" label="序号" width="50" align="center"></el-table-column>
        <el-table-column
          prop="managerName"
          label="链接负责人"
          align="center"
          min-width="120"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column label="项目数量" align="center">
          <el-table-column prop="scount" label="S" align="center" width="60"></el-table-column>
          <el-table-column prop="acount" label="A" align="center" width="60"></el-table-column>
          <el-table-column prop="bcount" label="B" align="center" width="60"></el-table-column>
          <el-table-column prop="sumCount" label="总计" align="center" width="60"></el-table-column>
        </el-table-column>
        <el-table-column prop="linkCount" align="center" width="100">
          <template slot="header" slot-scope="scope">
            <el-tooltip class="item" effect="dark" content="有销售数据的链接数" placement="top-start">
              <span>
                链接数量
                <i class="el-icon-question"></i>
              </span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="storeCount" label="店铺数" align="center" width="80"></el-table-column>
        <el-table-column prop="platformCount" label="平台数" align="center" width="80"></el-table-column>
        <el-table-column prop="actualAmount" label="真实销售额" align="center" min-width="120">
          <template v-slot="{ row }">{{ getFixed(row.actualAmount) }}</template>
        </el-table-column>
        <el-table-column prop="salesAmount" label="销售额" align="center" min-width="120">
          <template v-slot="{ row }">{{ getFixed(row.salesAmount) }}</template>
        </el-table-column>
        <el-table-column prop="refundAmount" label="退款额" align="center" min-width="120">
          <template v-slot="{ row }">{{ getFixed(row.refundAmount) }}</template>
        </el-table-column>
        <el-table-column prop="cost" label="推广花费" align="center" min-width="120">
          <template v-slot="{ row }">{{ getFixed(row.cost) }}</template>
        </el-table-column>
        <el-table-column
          prop="deptName"
          label="人员归属事业部"
          align="center"
          min-width="140"
          show-overflow-tooltip
        ></el-table-column>
      </el-table>
      <!-- 父表分页 -->
      <pagination
        v-show="parentTotal > 0"
        :total="parentTotal"
        :page.sync="parentParams.page"
        :limit.sync="parentParams.pageSize"
        @pagination="getParentList"
      />
    </div>

    <!-- 子表搜索条件 -->
    <div class="child-search-container" style="margin-top: 20px">
      <el-form class="page-search" inline>
        <!-- 平台 -->
        <!-- <el-form-item label="平台" style="margin-right: 20px">
          <el-select v-model="childParams.platform" filterable clearable placeholder="请选择平台">
            <el-option
              v-for="item in platformList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>-->
        <!-- 店铺 -->
        <!-- <el-form-item label="店铺" style="margin-right: 20px">
          <el-select v-model="childParams.storeUuid" filterable clearable placeholder="请选择店铺">
            <el-option
              v-for="item in storeList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>-->
        <!-- 目标等级 -->
        <el-form-item label="目标等级" style="margin-right: 20px">
          <el-select v-model="childParams.planLinkLevel" filterable clearable placeholder="请选择目标等级">
            <el-option
              v-for="item in linkLevelList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- 实际等级 -->
        <el-form-item label="实际等级" style="margin-right: 20px">
          <el-select v-model="childParams.linkLevel" filterable clearable placeholder="请选择实际等级">
            <el-option
              v-for="item in linkLevelList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="clickChildSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 子表 -->
    <div class="child-table-container">
      <el-table
        v-loading="childTableLoading"
        :data="childTableData"
        border
        style="width: 100%"
        height="400"
        max-height="400"
      >
        <el-table-column type="index" label="序号" width="50" align="center"></el-table-column>
        <el-table-column
          prop="linkTitle"
          label="链接"
          align="center"
          min-width="220"
          show-overflow-tooltip
        >
          <template v-slot="{ row }">
            <span>{{ row.linkTitle + '(' + row.linkId + ')' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="linkUrl" label="图片" align="center" width="100">
          <template v-slot="{ row }">
            <el-image
              v-if="row.linkUrl"
              :src="row.linkUrl"
              :preview-src-list="[row.linkUrl]"
              style="width: 50px; height: 50px"
            ></el-image>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="storeName"
          label="店铺名称"
          align="center"
          min-width="310"
          show-overflow-tooltip
        >
          <template v-slot="{ row }">
            <span>{{ (row.platformName || '-') + '('+( row.storeCode || '-') + ')' + (row.storeName || '-') }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="mainLinkName" label="是否主打" align="center" width="100"></el-table-column>
        <el-table-column prop="linkTimeStatusName" label="商品阶段" align="center" width="120"></el-table-column>
        <el-table-column prop="listingTimes" label="上架时间" align="center" min-width="150">
          <template v-slot="{ row }">
            {{
            row.listingTimes ? getFormatDate(row.listingTimes) : '-'
            }}
          </template>
        </el-table-column>
        <el-table-column prop="planLinkLevelName" label="目标等级" align="center" width="100"></el-table-column>
        <el-table-column prop="linkLevelName" label="实际等级" align="center" width="100"></el-table-column>
        <el-table-column
          prop="strategyName"
          label="项目名称"
          align="center"
          min-width="120"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column prop="projectTypeName" label="项目类型" align="center" width="100"></el-table-column>
        <el-table-column prop="actualAmount" align="center" min-width="150">
          <template #header>
            <span
              @click="changeChildSortType(3)"
              :style="{
                color: childParams.statisticsType == 3 ? '#409EFF' : '',
                fontSize: childParams.statisticsType == 3 ? '17px' : '14px',
                cursor: 'pointer'
              }"
            >
              实际销售额
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template v-slot="{ row }">{{ getFixed(row.actualAmount) }}</template>
        </el-table-column>
        <el-table-column prop="saleAmount" align="center" min-width="120">
          <template #header>
            <span
              @click="changeChildSortType(1)"
              :style="{
                color: childParams.statisticsType == 1 ? '#409EFF' : '',
                fontSize: childParams.statisticsType == 1 ? '17px' : '14px',
                cursor: 'pointer'
              }"
            >
              销售额
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template v-slot="{ row }">{{ getFixed(row.saleAmount) }}</template>
        </el-table-column>
        <el-table-column prop="refundAmount" align="center" min-width="120">
          <template #header>
            <span
              @click="changeChildSortType(2)"
              :style="{
                color: childParams.statisticsType == 2 ? '#409EFF' : '',
                fontSize: childParams.statisticsType == 2 ? '17px' : '14px',
                cursor: 'pointer'
              }"
            >
              退款额
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template v-slot="{ row }">{{ getFixed(row.refundAmount) }}</template>
        </el-table-column>
        <el-table-column prop="erpQuantity" label="订单数" align="center" width="100"></el-table-column>
        <el-table-column prop="erpNumber" label="销售数量" align="center" width="100"></el-table-column>
        <el-table-column label="操作" align="center" width="220">
          <template v-slot="{ row }">
            <el-button
              type="text"
              :disabled="row.linkId === '无链接'"
              size="small"
              @click="lookBoardGoods(row)"
            >看板</el-button>
            <el-button
              type="text"
              :disabled="row.linkId === '无链接'"
              size="small"
              @click="itemDetailGoods(row)"
            >明细</el-button>
            <el-button type="text" size="small" @click="linkBoardGoods(row)">推广</el-button>
            <el-button type="text" size="small" @click="showDailyDetail(row)">日报</el-button>
            <el-button type="text" size="small" @click="goSkuInventory(row)">库存</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 子表分页 -->
      <pagination
        v-show="childTotal > 0"
        :total="childTotal"
        :page.sync="childParams.page"
        :limit.sync="childParams.pageSize"
        @pagination="getChildList"
      />
    </div>

    <!-- 商品链接看板 -->
    <el-dialog
      :title="rowParams.linkTitle + '商品链接看板'"
      @close="closeLinkBoardDialog"
      :visible.sync="showLinkBoardDialog"
      show-close
      append-to-body
      fullscreen
    >
      <el-button
        type="text"
        icon="el-icon-arrow-left"
        class="dialog-back-button"
        @click="closeLinkBoardDialog"
      >返回</el-button>
      <LinkBoard v-if="showLinkBoardDialog" :rowParams="rowParams" :storeDisabled="true"></LinkBoard>
    </el-dialog>

    <!-- 明细弹窗 -->
    <LinkStatistic
      v-if="linkDetailStatus"
      @closeDialog="detailStatus"
      :show="linkDetailStatus"
      :view="storeOr"
      :row="rowData"
      :title="detailTitle"
    ></LinkStatistic>

    <!-- 推广弹窗 -->
    <el-dialog
      v-if="linkPromotionStatus"
      fullscreen
      :visible.sync="linkPromotionStatus"
      append-to-body
    >
      <el-button
        type="text"
        icon="el-icon-arrow-left"
        class="dialog-back-button"
        @click="linkPromotionStatus = false"
      >返回</el-button>
      <LinkPromotion :dateRange="parentParams.timeArr" :rowData="promotionParams"></LinkPromotion>
    </el-dialog>

    <!-- 日报弹窗 -->
    <ViewDailyDialog
      :row.sync="currentRow"
      :showDialog.sync="showViewDailyDialog"
      :parentReqParams.sync="childParams"
      :readOnly="false"
    ></ViewDailyDialog>
  </div>
</template>

<script>
import {
  getList,
  getTotal,
  getSubTable,
} from '@/api/operationManage/operationApplicationPivot'
import { listPlatform, listStore, listLinkLevel } from '@/api/baseData/common'
import { getPrincipalList } from '@/api/baseData/spuAndSku'
import LinkBoard from '@/views/bulletinboard/linkBoard'
import LinkStatistic from '@/views/bulletinboard/storestatistics/components/LinkStatistic.vue'
import LinkPromotion from '@/views/promotionData/linkPromotion/index.vue'
import ViewDailyDialog from '@/views/dailyManage/viewDaily/viewDailyDialog'
import {
  getDeptTreeData,
  addDay,
  addDayEnd,
  getFormatDate,
  getLastValue,
} from '@/utils/common'

export default {
  name: 'OperationApplicationPivot',
  components: {
    LinkBoard,
    LinkStatistic,
    LinkPromotion,
    ViewDailyDialog,
  },
  data() {
    return {
      // 父表参数
      parentParams: {
        startTime: '',
        endTime: '',
        timeArr: [],
        platform: '',
        storeUuid: '',
        mainLink: undefined,
        managerUuid: '',
        page: 1,
        pageSize: 20,
      },
      // 父表数据
      parentTableData: [],
      // 父表总数
      parentTotal: 0,
      // 父表加载状态
      parentTableLoading: false,
      // 父表合计数据
      totalData: null,

      // 子表参数
      childParams: {
        startTime: '',
        endTime: '',
        platform: '',
        storeUuid: '',
        linkLevel: undefined,
        planLinkLevel: undefined,
        statisticsType: 3, // 默认按实际销售额排序
        managerUuid: '',
        page: 1,
        pageSize: 20,
      },
      // 子表数据
      childTableData: [],
      // 子表总数
      childTotal: 0,
      // 子表加载状态
      childTableLoading: false,

      // 下拉框数据
      platformList: [],
      storeList: [],
      linkLevelList: [],
      managerList: [],

      // 时间选择器配置
      startPickerTime: '',
      pickerOptions: {
        shortcuts: [
          {
            text: '最近7天',
            onClick(picker) {
              const end = addDayEnd(-1)
              const start = addDay(-7)
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: '最近14天',
            onClick(picker) {
              const end = addDayEnd(-1)
              const start = addDay(-14)
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: '最近30天',
            onClick(picker) {
              const end = addDayEnd(-1)
              const start = addDay(-30)
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
          // 30 * 24 * 3600 * 1000 是30天的毫秒数
          const minTime = now - 30 * 24 * 3600 * 1000
          const maxTime = now + 30 * 24 * 3600 * 1000

          return time.getTime() < minTime || time.getTime() > maxTime
        },
      },

      // 控制链接看板
      showLinkBoardDialog: false,
      rowParams: {},

      // ---------- 明细 -----------
      // 商品链接状态
      linkDetailStatus: false,
      // 是店铺明细还是商品链接明细
      storeOr: 'store',
      // 明细dialog标题
      detailTitle: '',
      // 当前选择的dialog数据
      rowData: null,

      // ----------- 推广 -----------
      promotionParams: {},
      linkPromotionStatus: false,

      // ----------- 日报 -----------
      showViewDailyDialog: false,
      currentRow: {},
    }
  },
  async created() {
    // 初始化时间：默认当月第一天到最后一天
    // const now = new Date()
    // const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    // firstDay.setHours(0, 0, 0, 0)
    // const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    // lastDay.setHours(23, 59, 59, 999)

    this.parentParams.startTime = addDayEnd(-1)
    this.parentParams.endTime = addDayEnd(-1)
    this.parentParams.timeArr = [
      this.parentParams.startTime,
      this.parentParams.endTime,
    ]

    // 初始化子表时间
    this.childParams.startTime = this.parentParams.startTime
    this.childParams.endTime = this.parentParams.endTime

    // 获取下拉框数据
    await this.getPlatformList()
    await this.getStoreList()
    await this.getLinkLevelList()
    await this.getManagerList()

    // 获取父表数据
    await this.getParentList()
  },
  methods: {
    // 点击搜索
    clickSearch() {
      this.parentParams.page = 1
      // 重置子表数据
      this.childParams = {
        startTime: this.childParams.startTime,
        endTime: this.childParams.endTime,
        platform: '',
        storeUuid: '',
        linkLevel: undefined,
        planLinkLevel: undefined,
        statisticsType: 3, // 默认按实际销售额排序
        managerUuid: this.childParams.managerUuid,
        page: 1,
        pageSize: 20,
      }
      this.childTableData = []
      this.childTotal = 0

      this.getParentList()
    },

    // 点击子表搜索
    clickChildSearch() {
      this.childParams.page = 1
      this.getChildList()
    },

    // 切换子表排序方式
    changeChildSortType(val) {
      this.childParams.statisticsType = val
      this.childParams.page = 1
      this.getChildList()
    },

    // 关闭链接看板
    closeLinkBoardDialog() {
      this.showLinkBoardDialog = false
    },

    // 商品链接看板
    lookBoardGoods(row) {
      // console.log('row', { ...row })
      this.rowParams = {
        linkTitle: row.linkTitle,
        storeUuid: row.storeUuid,
        platformUuid: row.platform,
        linkId: row.linkId,
        startTime: this.parentParams.startTime,
        endTime: this.parentParams.endTime,
        formatType: 2,
      }
      this.showLinkBoardDialog = true
    },

    // 商品链接明细
    itemDetailGoods(row) {
      const rowDataAss = Object.assign(row, {
        timeArr: this.parentParams.timeArr,
      })
      this.rowData = rowDataAss
      this.storeOr = 'link'
      this.detailTitle = '商品链接明细'
      this.linkDetailStatus = true
    },

    // 关闭明细
    detailStatus() {
      this.storeDetailStatus = false
      this.linkDetailStatus = false
    },

    // 推广
    linkBoardGoods(row) {
      this.linkPromotionStatus = true
      this.promotionParams = row
    },

    // 日报
    showDailyDetail(row) {
      this.currentRow = {
        linkTitle: row.linkTitle,
        linkId: row.linkId,
        linkLevel: row.linkLevelName,
        managerName: row.managerName,
        url: row.linkUrl,
        srcList: [row.linkUrl],
      }
      this.showViewDailyDialog = true
    },

    // 库存
    goSkuInventory(row) {
      this.$router.push({
        name: 'SkuInventory',
        params: {
          spuUuid: row.spuUuid,
        },
      })
    },

    // 时间改变
    changeTime(val) {
      if (val && val.length === 2) {
        this.parentParams.startTime = val[0]
        this.parentParams.endTime = val[1]

        // 同步子表时间
        this.childParams.startTime = val[0]
        this.childParams.endTime = val[1]

        // 验证时间范围不超过30天
        const timeDiff = this.parentParams.endTime - this.parentParams.startTime
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24)

        if (daysDiff > 30) {
          this.$message.warning('时间范围不能超过30天')
          // 重置为之前的值
          this.parentParams.timeArr = []
          this.$nextTick(() => {
            this.parentParams.timeArr = [
              this.parentParams.startTime,
              this.parentParams.endTime,
            ]
          })
        }
      }
    },

    // 时间选择失焦时将startPickerTime置空 目的是清除禁用的时间范围
    blurTime() {
      this.startPickerTime = ''
    },

    // 获取父表数据
    async getParentList() {
      try {
        this.parentTableLoading = true

        // 获取列表数据的参数
        const listParams = {
          ...this.parentParams,
          platform: this.parentParams.platform || undefined,
          storeUuid: this.parentParams.storeUuid || undefined,
          managerUuid: getLastValue(this.parentParams.managerUuid) || undefined,
        }

        // 先获取合计数据（入参和列表一致）
        const totalRes = await getTotal(listParams)
        this.totalData = totalRes.data

        // 获取列表数据
        const listRes = await getList(listParams)

        // 将合计数据插入到第一行
        if (this.totalData) {
          this.parentTableData = [
            {
              ...this.totalData,
              managerName: '合计',
              isTotal: true, // 标记为合计行
            },
            ...(listRes.data.records || []),
          ]
          this.parentTotal = listRes.data.total || 0
        } else {
          this.parentTableData = listRes.data.records || []
          this.parentTotal = listRes.data.total || 0
        }
      } catch (error) {
        console.error('获取父表数据失败:', error)
      } finally {
        this.parentTableLoading = false
      }
    },

    // 获取子表数据
    async getChildList() {
      try {
        this.childTableLoading = true
        const params = {
          ...this.childParams,
          startTime: this.childParams.startTime,
          endTime: this.childParams.endTime,
          platform: this.parentParams.platform,
          storeUuid: this.parentParams.storeUuid,
          mainLink: this.parentParams.mainLink,
          linkLevel: this.childParams.linkLevel,
          planLinkLevel: this.childParams.planLinkLevel,
          statisticsType: this.childParams.statisticsType,
          managerUuid: this.childParams.managerUuid || undefined,
        }
        const res = await getSubTable(params)
        this.childTableData = res.data.records || []
        this.childTotal = res.data.total || 0
      } catch (error) {
        console.error('获取子表数据失败:', error)
      } finally {
        this.childTableLoading = false
      }
    },

    // 父表行点击事件
    handleRowClick(row) {
      // 如果点击的是合计行，不处理
      if (row.isTotal) {
        return
      }
      // 设置子表的负责人参数并刷新子表
      this.childParams.managerUuid = row.managerUuid || ''
      // 重置子表数据
      this.childParams = {
        startTime: this.childParams.startTime,
        endTime: this.childParams.endTime,
        platform: '',
        storeUuid: '',
        linkLevel: undefined,
        planLinkLevel: undefined,
        statisticsType: this.childParams.statisticsType, // 默认按实际销售额排序
        managerUuid: this.childParams.managerUuid,
        page: 1,
        pageSize: 20,
      }

      this.getChildList()
    },

    // 获取平台列表
    async getPlatformList() {
      try {
        const res = await listPlatform()
        this.platformList = res.data || []
      } catch (error) {
        console.error('获取平台列表失败:', error)
      }
    },

    // 获取店铺列表
    async getStoreList() {
      try {
        const res = await listStore()
        this.storeList = res.data || []
      } catch (error) {
        console.error('获取店铺列表失败:', error)
      }
    },

    // 获取链接等级列表
    async getLinkLevelList() {
      try {
        const res = await listLinkLevel()
        this.linkLevelList = res.data || []
      } catch (error) {
        console.error('获取链接等级列表失败:', error)
      }
    },

    // 获取负责人列表
    async getManagerList() {
      try {
        const res = await getPrincipalList()
        this.managerList = await getDeptTreeData(res.data || [])
      } catch (error) {
        console.error('获取负责人列表失败:', error)
      }
    },

    // 时间戳转换
    getFormatDate(date) {
      return getFormatDate(date)
    },

    // 保留两位小数
    getFixed(num) {
      if (num || num === 0) {
        return num.toFixed(2)
      } else {
        return '-'
      }
    },
  },
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.parent-table-container {
  margin-bottom: 30px;
}
</style>