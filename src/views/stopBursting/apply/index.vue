<template>
  <div class="app-container">
    <div>
      <div class="search-form">
        <el-form class="page-search" inline ref="page-filter">
          <!--提交时间范围 -->
          <el-form-item label="停止提交日期:" style="margin-right: 20px">
            <el-date-picker
              class="date-picker-width240"
              v-model="reqParams.timeArr"
              :clearable="false"
              type="daterange"
              align="right"
              unlink-panels
              value-format="timestamp"
              @change="changeTime"
            ></el-date-picker>
          </el-form-item>
          <el-form-item label="原计划名称:" style="margin-right: 20px">
            <el-input v-model="reqParams.planName" placeholder="请输入计划名称"></el-input>
          </el-form-item>
          <el-form-item label="审核状态:" style="margin-right: 20px">
            <el-select
              v-model="reqParams.auditStatus"
              class="select-width120"
              filterable
              placeholder="请选择"
            >
              <el-option
                v-for="(item, index) in auditStatusSelectList"
                :key="index"
                :label="item.name"
                :value="item.code"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="margin-right: 20px">
            <el-checkbox v-model="reqParams.isInvalidValue">是否作废</el-checkbox>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="clickSearch()">搜索</el-button>
          </el-form-item>
          <br />
        </el-form>
      </div>
      <div style="margin-bottom: 10px">
        <el-button type="primary" icon="el-icon-plus" @click="addDetail">新增</el-button>
      </div>
      <el-radio-group v-model="searchType" @change="clickSearch">
        <el-radio-button
          v-for="item in searchTypeList"
          :key="item.code"
          :label="item.code"
        >{{ item.name }}</el-radio-button>
      </el-radio-group>

      <el-table
        v-loading="applyTableLoading"
        height="500"
        border
        :data="applyTableData"
        style="width: 100%"
        row-key="operationUuid"
        ref="applyTableRef"
        @row-click="handleRowClick"
      >
        <el-table-column width="50" label="序号" type="index" align="center"></el-table-column>
        <el-table-column label="停止提交日期" width="100" prop="submitTime" align="center">
          <template v-slot="{ row }">
            <span>{{ getFormatDate(row.submitTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="原计划名称" show-overflow-tooltip prop="planName" align="center"></el-table-column>
        <el-table-column label="停止日期" width="100" prop="applicationTime" align="center">
          <template v-slot="{ row }">
            <span>
              {{
              row.applicationTime ? getFormatDate(row.applicationTime) : "-"
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="停止申请人" width="100" prop="applyName" align="center"></el-table-column>

        <el-table-column
          label="停止申请说明"
          show-overflow-tooltip
          prop="applyInformation"
          align="center"
        ></el-table-column>
        <el-table-column label="审核状态" width="100" prop="auditStatusName" align="center"></el-table-column>
        <!-- <el-table-column label="是否作废" width="100" align="center">
          <template v-slot="{ row }">
            <span>{{ row.invalid ? "是" : "否" }}</span>
          </template>
        </el-table-column>-->
        <!-- 操作 -->
        <el-table-column label="操作" width="220" align="center">
          <template v-slot="{ row }">
            <!-- <el-button type="text" size="mini" @click.stop="handleEdit(row)"
              >修改</el-button
            >-->
            <el-button
              type="text"
              size="mini"
              @click.stop="handleInvalid(row)"
              v-if="isShowInvalidButton(row)"
            >作废</el-button>
            <el-button type="text" size="mini" @click.stop="handleDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="applyTableTotal > 0"
        :total="applyTableTotal"
        :page.sync="reqParams.page"
        :limit.sync="reqParams.pageSize"
        @pagination="handlePageChange"
      />

      <!-- 明细申请单 -->
      <div
        v-if="selectedOperationUuid"
        style="margin-top: 12px; border: 1px solid #ebeef5; padding: 12px"
      >
        <div style="font-weight: 600; margin-bottom: 8px">原申请单</div>
        <el-skeleton v-if="detailDesLoading" :rows="3" animated />
        <template v-else>
          <div v-if="detailDesData">
            <div style="display: flex; flex-wrap: wrap; gap: 54px">
              <div style="min-width: 500px">提交日期： {{ getFormatDate(detailDesData.submitTime) }}</div>
              <div style="min-width: 200px">起始日期： {{ getFormatDate(detailDesData.startTime) }}</div>
            </div>
            <div
              style="
                display: flex;
                flex-wrap: wrap;
                gap: 54px;
                align-items: center;
              "
            >
              <div
                style="
                  margin-top: 6px;
                  min-width: 500px;
                  max-width: 500px;
                  cursor: pointer;
                "
              >
                <el-tooltip
                  v-if="detailDesData.planName"
                  :content="`计划名称： ${detailDesData.planName}`"
                  placement="top"
                >
                  <div
                    style="
                      overflow: hidden;
                      text-overflow: ellipsis;
                      white-space: nowrap;
                    "
                  >计划名称： {{ detailDesData.planName }}</div>
                </el-tooltip>
                <div v-else>计划名称： -</div>
              </div>
              <div
                style="margin-top: 6px; min-width: 200px; flex-shrink: 0"
              >结束日期： {{ getFormatDate(detailDesData.endTime) }}</div>
            </div>
            <div style="margin-top: 6px">申请人： {{ detailDesData.applyName || "-" }}</div>
            <div style="margin-top: 6px">申请说明： {{ detailDesData.applyInformation || "-" }}</div>
            <div style="margin-top: 6px">
              店铺：
              {{
              (detailDesData.platformName || "-") +
              "(" +
              (detailDesData.storeCode || "-") +
              ")" +
              (detailDesData.storeName || "-")
              }}
            </div>
            <div style="margin-top: 6px">
              商品标题：
              {{
              "(" +
              (detailDesData.linkId || "-") +
              ")" +
              (detailDesData.linkTitle || "-")
              }}
            </div>
            <div style="margin-top: 6px">商品等级： {{ detailDesData.linkLevelName || "-" }}</div>
          </div>
          <div v-else style="color: #909399">暂无数据</div>
        </template>
      </div>

      <!-- 明细表格筛选 -->
      <!-- <div v-if="selectedOperationUuid" style="margin-top: 12px">
        <el-form class="page-search" inline>
          <el-form-item label="平台:">
            <el-select
              v-model="examineFilter.platformId"
              placeholder="请选择"
              class="select-width120"
            >
              <el-option
                v-for="(item, index) in platformSelectList"
                :key="index"
                :label="item.name"
                :value="item.code"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="店铺名称:">
            <el-select
              v-model="examineFilter.storeUuid"
              placeholder="平台(编号)店铺名"
              class="select-width200"
            >
              <el-option
                v-for="(item, index) in storeSelectList"
                :key="index"
                :label="item.name"
                :value="item.code"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="商品标题:">
            <el-input
              v-model="examineFilter.linkTitle"
              placeholder="(编码)名称"
              class="select-width220"
            />
          </el-form-item>
          <el-form-item label="商品等级:">
            <el-select
              v-model="examineFilter.linkLevel"
              placeholder="请选择"
              class="select-width120"
            >
              <el-option
                v-for="(lvl, index) in linkLevelOptions"
                :key="index"
                :label="lvl.name || lvl.label"
                :value="lvl.code || lvl.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="SKU编码:">
            <el-select
              v-model="examineFilter.skuUuid"
              filterable
              clearable
              :filter-method="filterMethod"
              @visible-change="visibleChange"
              v-el-select-loadmore="loadMore"
              :loading="skuSelectLoading"
              class="select-width200"
              placeholder="请选择SKU编码"
            >
              <el-option
                v-for="(item, index) in skuSelectList"
                :key="item.code"
                :label="item.extendKeyword + '(' + item.name + ')'"
                :value="item.code"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="商品链接:">
            <el-input
              v-model="examineFilter.linkCode"
              placeholder="请输入"
              class="select-width220"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="clickExamineSearch">搜索</el-button>
          </el-form-item>
        </el-form>
      </div>-->

      <!-- 明细表格 -->
      <el-table
        v-if="selectedOperationUuid"
        v-loading="subtableLoading"
        border
        style="width: 100%; margin-top: 12px"
        :data="subtableData"
        max-height="500"
      >
        <el-table-column width="50" label="序号" type="index" align="center" fixed="left"></el-table-column>
        <el-table-column
          label="产品名称"
          prop="spuShowName"
          show-overflow-tooltip
          align="center"
          fixed="left"
        ></el-table-column>
        <el-table-column
          label="SKU编码"
          prop="skuCode"
          width="160"
          show-overflow-tooltip
          align="center"
          fixed="left"
        >
          <template v-slot="{ row }">{{ row.skuCode + "(" + row.specsName + ")" }}</template>
        </el-table-column>
        <el-table-column label="SKU图片" prop="skuUrl" width="90" align="center">
          <template v-slot="{ row }">
            <el-image
              :src="row.skuUrl"
              :preview-src-list="[row.skuUrl]"
              style="width: 50px; height: 50px"
              fit="cover"
            />
          </template>
        </el-table-column>
        <el-table-column label="采购负责人" prop="purchaseUserName" width="120" align="center"></el-table-column>
        <el-table-column label="货品分类" prop="categoryName" width="140" align="center"></el-table-column>
        <el-table-column label="申请金额(元)" prop="applyAmount" width="120" align="center">
          <template v-slot="{ row }">
            <span>
              {{
              typeof row.applyAmount === "number"
              ? row.applyAmount.toFixed(2)
              : "-"
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="本次申请计划" prop="thisPlanQuantity" align="left">
          <template v-slot="{ row }">
            <div
              v-if="
                row.thisPlanQuantity &&
                Array.isArray(row.thisPlanQuantity) &&
                row.thisPlanQuantity.length > 0
              "
            >
              <div v-for="(it, idx) in row.thisPlanQuantity" :key="idx" style="margin-bottom: 6px">
                <div v-if="it.miMiaNum || it.jinNum" style="display: flex; align-items: flex-start">
                  <span
                    style="
                      display: inline-block;
                      min-width: 60px;
                      flex-shrink: 0;
                    "
                  >{{ (it.weeksName || `第${idx + 1}周`) + ":" }}</span>
                  <div style="flex: 1; line-height: 1.8">
                    <div v-if="it.miMiaNum">{{ it.miMiaNum }}</div>
                    <div v-if="it.jinNum" style="padding-left: 0">{{ it.jinNum }}</div>
                  </div>
                </div>
              </div>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template v-slot="{ row }">
            <el-button type="text" @click.stop="openTrendChart(row)">趋势图</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-if="selectedOperationUuid"
        v-show="subtableTotal > 0"
        :total="subtableTotal"
        :page.sync="subtablePage"
        :limit.sync="subtablePageSize"
        @pagination="handleSubtablePageChange"
      />
    </div>

    <!-- 新增申请弹窗 -->
    <AddApplyDialog
      :visible.sync="showAddDialog"
      @close="showAddDialog = false"
      @refresh="handleAddDialogRefresh"
    />

    <!-- 详情弹窗 -->
    <StopBlowDetailDialog
      :visible.sync="showDetailDialog"
      :operation-uuid="detailOperationUuid"
      @close="showDetailDialog = false"
    />

    <!-- 作废弹窗 -->
    <StopBlowInvalidDialog
      :visible.sync="showInvalidDialog"
      :operation-uuid="invalidOperationUuid"
      @success="handleAddDialogRefresh"
      @close="showInvalidDialog = false"
    />

    <!-- 趋势图弹窗 -->
    <OperationTrendDialog :show-dialog.sync="showTrendChartDialog" :sku-uuid="trendChartSkuUuid" />
  </div>
</template>

<script>
import { getFormatDate } from '@/utils/common'
import {
  getApplyList,
  getRejectList,
  getSonDetailTable,
  getSonDetailDes,
} from '@/api/stopBursting/apply/index'
import {
  getAuditStatusSelectList,
  getLinkSkuSelectList,
} from '@/api/operationManage/common'
import { debounce } from 'lodash'
import { listPlatform, listStore, listLinkLevel } from '@/api/baseData/common'
import AddApplyDialog from './components/AddApplyDialog.vue'
import StopBlowDetailDialog from './components/StopBlowDetailDialog.vue'
import StopBlowInvalidDialog from './components/StopBlowInvalidDialog.vue'
import OperationTrendDialog from '@/components/TrendChart/OperationTrendDialog.vue'

export default {
  name: 'StopBurstingApply',
  components: {
    AddApplyDialog,
    StopBlowDetailDialog,
    StopBlowInvalidDialog,
    OperationTrendDialog,
  },
  directives: {
    'el-select-loadmore': (el, binding) => {
      const SELECTWRAP_DOM = el.querySelector(
        '.el-select-dropdown .el-select-dropdown__wrap'
      )
      if (SELECTWRAP_DOM) {
        SELECTWRAP_DOM.addEventListener('scroll', function () {
          const condition =
            this.scrollHeight - (Math.round(this.scrollTop) + 1) <=
            this.clientHeight
          if (condition) binding.value()
        })
      }
    },
  },
  data() {
    return {
      // 查询入参
      reqParams: {
        auditStatus: 0,
        startTime: '',
        endTime: '',
        isInvalid: 0,
        isInvalidValue: false,
        planName: '',
        sourceType: 2,
        page: 1,
        pageSize: 10,
        timeArr: [],
      },
      // 列表
      applyTableLoading: false,
      applyTableData: [],
      applyTableTotal: 0,

      // tabs
      searchType: 'all',
      searchTypeList: [
        { name: '全部', code: 'all' },
        { name: '我的驳回', code: 'reject' },
      ],

      // 下拉
      auditStatusSelectList: [],

      // 新增申请弹窗
      showAddDialog: false,

      // 详情弹窗
      showDetailDialog: false,
      detailOperationUuid: '',

      // 作废弹窗
      showInvalidDialog: false,
      invalidOperationUuid: '',

      // 行点击详请
      selectedOperationUuid: '',
      detailDesLoading: false,
      detailDesData: null,
      subtableLoading: false,
      subtableData: [],
      subtableTotal: 0,
      subtablePage: 1,
      subtablePageSize: 10,

      // 明细筛选
      examineFilter: {
        platformId: '',
        storeUuid: '',
        linkTitle: '',
        linkLevel: '',
        skuUuid: '',
        skuSpecName: '',
        linkCode: '',
      },
      platformSelectList: [],
      storeSelectList: [],
      linkLevelOptions: [
        { label: 'S', value: 'S' },
        { label: 'A', value: 'A' },
        { label: 'B', value: 'B' },
      ],

      // 趋势图
      showTrendChartDialog: false,
      trendChartSkuUuid: '',

      // SKU下拉
      skuSelectList: [],
      skuSelectLoading: false,
      skuSelectTotal: 0,
      selectFlag: true,
      skuListReqParams: {
        keyword: '',
        page: 1,
        pageSize: 10,
      },
    }
  },
  async created() {
    this.setDefaultTime()
    this.getAuditStatusSelectList()
    this.getList()
    // 明细筛选下拉
    this.getPlatformSelectList()
    this.getStoreSelectList()
    this.getLinkLevelSelectList()
    // 初始化SKU下拉
    await this.getLinkSkuSelectList()
  },
  methods: {
    // 点击分页
    handlePageChange(val) {
      this.reqParams.page = val.page
      this.getList()
    },

    // 获取列表
    async getList() {
      this.applyTableLoading = true
      try {
        this.reqParams.isInvalid = this.reqParams.isInvalidValue ? 1 : 0
        const params = { ...this.reqParams }
        const res =
          this.searchType === 'reject'
            ? await getRejectList(params)
            : await getApplyList(params)
        const responseData = res.data || {}
        this.applyTableData = responseData.records || []
        this.applyTableTotal = responseData.total || 0
      } finally {
        this.applyTableLoading = false
      }
    },

    // 点击搜索
    async clickSearch() {
      this.reqParams.page = 1
      // 隐藏明细申请单和明细表格
      this.selectedOperationUuid = ''
      await this.getList()
    },

    // 默认时间：当月1号至今
    setDefaultTime() {
      const now = new Date()
      now.setDate(1)
      now.setHours(0, 0, 0, 0)
      const start = now.getTime() + ''
      const end = new Date().getTime() + ''
      this.reqParams.timeArr = [start, end]
      this.reqParams.startTime = start
      this.reqParams.endTime = end
    },

    // 时间范围改变
    changeTime(val) {
      if (val) {
        this.reqParams.startTime = val[0]
        this.reqParams.endTime = val[1]
      }
    },

    // 下拉
    async getAuditStatusSelectList() {
      const res = await getAuditStatusSelectList()
      this.auditStatusSelectList = res.data || []
    },

    // 时间戳转日期
    getFormatDate(time) {
      return getFormatDate(+time)
    },

    // 点击新增
    addDetail() {
      this.showAddDialog = true
    },

    // 新增申请弹窗刷新事件
    handleAddDialogRefresh() {
      // 刷新主列表
      this.getList()
    },

    // 操作：修改
    handleEdit(row) {
      this.$message.info('修改功能待联调')
    },

    // 操作：详情
    handleDetail(row) {
      const operationUuid = row.operationUuid || ''
      if (!operationUuid) {
        this.$message.warning('缺少标识，无法获取详情')
        return
      }
      this.detailOperationUuid = operationUuid
      this.showDetailDialog = true
    },

    // 操作：作废
    handleInvalid(row) {
      const operationUuid = row.operationUuid || ''
      if (!operationUuid) {
        this.$message.warning('缺少标识，无法作废')
        return
      }
      this.invalidOperationUuid = operationUuid
      this.showInvalidDialog = true
    },

    // 行点击，加载明细申请单+表格
    async handleRowClick(row) {
      const operationUuid = row && row.operationUuid
      if (!operationUuid) return
      this.selectedOperationUuid = operationUuid
      this.subtablePage = 1 // 重置分页
      this.loadDetailDes(operationUuid)
      this.loadDetailTable(operationUuid)
    },

    // 计算字符串的显示宽度（中文字符算2个宽度，英文字符算1个宽度）
    getDisplayWidth(str) {
      let width = 0
      for (let i = 0; i < str.length; i++) {
        const char = str.charAt(i)
        // 判断是否为中文字符（包括中文标点）
        if (/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/.test(char)) {
          width += 2
        } else {
          width += 1
        }
      }
      return width
    },

    // 显示"本次申请计划"
    formatPlanQuantity(arr) {
      if (!Array.isArray(arr) || arr.length === 0) return '-'

      // 先找到最长的周名显示宽度，用于统一对齐
      let maxLabelWidth = 0
      arr.forEach((it, idx) => {
        const label = it.weeksName || `第${idx + 1}周`
        const labelPrefix = label + ':'
        const width = this.getDisplayWidth(labelPrefix)
        if (width > maxLabelWidth) {
          maxLabelWidth = width
        }
      })

      return arr
        .map((it, idx) => {
          const label = it.weeksName || `第${idx + 1}周`
          const lines = []

          // 构建每周的显示内容
          // miMiaNum 和 jinNum 已经包含了"本地仓:"和"京东仓:"前缀
          if (
            it.miMiaNum !== undefined &&
            it.miMiaNum !== null &&
            it.miMiaNum !== ''
          ) {
            const labelPrefix = label + ':'
            const currentWidth = this.getDisplayWidth(labelPrefix)
            // 计算需要补齐的空格数（按显示宽度计算）
            const paddingWidth = maxLabelWidth - currentWidth
            const padding = ' '.repeat(paddingWidth)
            lines.push(`${labelPrefix}${padding}${it.miMiaNum}`)
          }
          if (
            it.jinNum !== undefined &&
            it.jinNum !== null &&
            it.jinNum !== ''
          ) {
            // 京东仓使用相同的缩进宽度，使"本地仓:"和"京东仓:"对齐
            const indent = ' '.repeat(maxLabelWidth)
            lines.push(`${indent}${it.jinNum}`)
          }

          // 如果没有 jinNum 和 miMiaNum，则使用原来的逻辑
          if (lines.length === 0) {
            const qty =
              typeof it.quantity === 'number'
                ? it.quantity
                : it.num || it.quantityValue || 0
            lines.push(`${label}:${qty}`)
          }

          return lines.join('\n')
        })
        .join('\n')
    },

    // 明细申请单
    async loadDetailDes(operationUuid) {
      if (!operationUuid) return
      this.detailDesLoading = true
      try {
        const res = await getSonDetailDes(operationUuid)
        this.detailDesData = (res && res.data) || null
      } catch (e) {
        this.detailDesData = null
      } finally {
        this.detailDesLoading = false
      }
    },

    // 明细表格
    async loadDetailTable(operationUuid) {
      if (!operationUuid) return
      this.subtableLoading = true
      try {
        const params = {
          operationUuid,
          page: this.subtablePage,
          pageSize: this.subtablePageSize,
        }
        const res = await getSonDetailTable(params)
        const responseData = res.data || {}
        this.subtableData = responseData.records || []
        this.subtableTotal = responseData.total || 0
      } catch (e) {
        this.subtableData = []
        this.subtableTotal = 0
      } finally {
        this.subtableLoading = false
      }
    },

    // 明细表格分页
    handleSubtablePageChange(val) {
      this.subtablePage = val.page
      this.subtablePageSize = val.limit
      if (this.selectedOperationUuid) {
        this.loadDetailTable(this.selectedOperationUuid)
      }
    },

    // 明细表格搜索
    clickExamineSearch() {
      this.subtablePage = 1
      if (this.selectedOperationUuid) {
        this.loadDetailTable(this.selectedOperationUuid)
      }
    },

    // 参考审核页面获取筛选下拉
    async getPlatformSelectList() {
      try {
        const res = await listPlatform()
        this.platformSelectList = res && res.data ? res.data : []
      } catch (e) {
        this.platformSelectList = []
      }
    },
    async getStoreSelectList() {
      try {
        const res = await listStore()
        this.storeSelectList = res && res.data ? res.data : []
      } catch (e) {
        this.storeSelectList = []
      }
    },
    async getLinkLevelSelectList() {
      try {
        const res = await listLinkLevel()
        this.linkLevelOptions = (res && res.data) || []
      } catch (e) {
        this.linkLevelOptions = []
      }
    },

    // SKU下拉（参考审核页面）
    async getLinkSkuSelectList() {
      const res = await getLinkSkuSelectList(this.skuListReqParams)
      this.skuSelectList =
        res && res.data && res.data.records ? res.data.records : []
      this.skuSelectTotal = (res && res.data && res.data.total) || 0
    },
    async visibleChange(flag) {
      if (!flag) {
        this.skuListReqParams.keyword = ''
        this.skuListReqParams.page = 1
        await this.getLinkSkuSelectList()
      }
    },
    filterMethod: debounce(async function (filterVal) {
      this.skuListReqParams.page = 1
      this.skuSelectLoading = true
      this.skuListReqParams.keyword = filterVal ? filterVal : ''
      await this.getLinkSkuSelectList()
      this.selectFlag = true
      this.skuSelectLoading = false
    }, 500),
    async loadMore() {
      if (this.skuSelectList.length < this.skuSelectTotal && this.selectFlag) {
        this.skuListReqParams.page += 1
        this.selectFlag = false
        const res = await getLinkSkuSelectList(this.skuListReqParams)
        const records = (res && res.data && res.data.records) || []
        records.forEach((item) => this.skuSelectList.push(item))
        this.skuSelectTotal =
          (res && res.data && res.data.total) || this.skuSelectTotal
        this.selectFlag = true
      }
    },

    // 打开趋势图
    openTrendChart(row) {
      const skuUuid = (row && (row.skuUuid || row.skuUrlUuid)) || ''
      if (!skuUuid) {
        this.$message.warning('缺少SKU标识，无法查看趋势图')
        return
      }
      this.trendChartSkuUuid = skuUuid
      this.$nextTick(() => {
        this.showTrendChartDialog = true
      })
    },
    // 是否展示提交按钮
    isShowInvalidButton(row) {
      // row.auditStatus == 2 审核通过
      // row.invalid 作废
      if (row.invalid) {
        return false
      }
      if (row.auditStatus == 2 && row.invalid) {
        return false
      }

      return true
    },
  },
}
</script>


<style lang="scss" scoped>
.search-form {
  .el-form-item {
    margin-bottom: 10px;
  }
}

.date-picker-width240 {
  width: 240px;
}

.select-width120 {
  width: 120px;
}
.select-width200 {
  width: 200px;
}
.select-width220 {
  width: 220px;
}
</style>
