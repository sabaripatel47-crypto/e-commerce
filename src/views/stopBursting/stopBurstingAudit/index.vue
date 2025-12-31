<template>
  <div class="app-container">
    <div class="search-form">
      <el-form class="page-search" inline ref="page-filter">
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
              v-for="item in auditStatusSelectList"
              :key="item.code"
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
      </el-form>
    </div>

    <el-radio-group v-model="searchType" @change="clickSearch" style="margin-bottom: 10px">
      <el-radio-button
        v-for="item in searchTypeList"
        :key="item.code"
        :label="item.code"
      >{{ item.name }}</el-radio-button>
    </el-radio-group>

    <el-table
      v-loading="tableLoading"
      height="500"
      border
      :data="tableData"
      style="width: 100%"
      row-key="operationUuid"
      @row-click="handleRowClick"
    >
      <el-table-column width="50" label="序号" type="index" align="center"></el-table-column>
      <el-table-column label="停止提交日期" width="120" prop="submitTime" align="center">
        <template v-slot="{ row }">
          <span>{{ getFormatDate(row.submitTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="计划名称" show-overflow-tooltip prop="planName" align="center"></el-table-column>
      <el-table-column label="停止日期" width="120" prop="applicationTime" align="center">
        <template v-slot="{ row }">
          <span>
            {{
            row.applicationTime ? getFormatDate(row.applicationTime) : "-"
            }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="停止申请人" width="100" prop="applyName" align="center"></el-table-column>

      <el-table-column label="停止申请说明" show-overflow-tooltip prop="applyInformation" align="center"></el-table-column>
      <el-table-column label="审核状态" width="120" prop="auditStatusName" align="center"></el-table-column>
      <!-- <el-table-column label="是否作废" width="100" align="center">
        <template v-slot="{ row }">
          <span>{{ row.invalid ? "是" : "否" }}</span>
        </template>
      </el-table-column>-->
      <!-- 操作 -->
      <el-table-column label="操作" width="240" align="center" fixed="right">
        <template v-slot="{ row }">
          <template v-if="row.auditStatus == 1">
            <el-button
              type="text"
              size="mini"
              @click.stop="handlePass(row)"
              v-if="isShowInvalidButton(row)"
            >通过</el-button>
            <el-button
              type="text"
              size="mini"
              @click.stop="handleReject(row)"
              v-if="isShowInvalidButton(row)"
            >驳回</el-button>
          </template>

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
    <!-- 主表格分页 -->
    <pagination
      v-show="tableTotal > 0"
      :total="tableTotal"
      :page.sync="reqParams.page"
      :limit.sync="reqParams.pageSize"
      @pagination="handlePageChange"
    />
    <!-- 明细申请单 -->
    <div
      v-if="selectedOperationUuid"
      style="margin-top: 12px; border: 1px solid #ebeef5; padding: 12px"
    >
      <div style="font-weight: 600; margin-bottom: 8px"></div>
      <el-skeleton v-if="examineDetailLoading" :rows="3" animated />
      <template v-else>
        <div v-if="examineDetailData">
          <div style="display: flex; flex-wrap: wrap; gap: 54px">
            <div style="min-width: 500px">提交日期： {{ getFormatDate(examineDetailData.submitTime) }}</div>
            <div style="min-width: 200px">起始日期： {{ getFormatDate(examineDetailData.startTime) }}</div>
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
                v-if="examineDetailData.plantName"
                :content="`计划名称： ${examineDetailData.plantName}`"
                placement="top"
              >
                <div
                  style="
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                  "
                >计划名称： {{ examineDetailData.plantName }}</div>
              </el-tooltip>
              <div v-else>计划名称： -</div>
            </div>
            <div
              style="margin-top: 6px; min-width: 200px; flex-shrink: 0"
            >结束日期： {{ getFormatDate(examineDetailData.endTime) }}</div>
          </div>
          <div style="margin-top: 6px">申请人： {{ examineDetailData.applyName || "-" }}</div>
          <div style="margin-top: 6px">申请类型： {{ examineDetailData.applyTypeName || "-" }}</div>
          <div style="margin-top: 6px">申请说明： {{ examineDetailData.applyInformation || "-" }}</div>
        </div>
        <div v-else style="color: #909399">暂无数据</div>
      </template>
    </div>

    <!-- 明细表格筛选 -->
    <div v-if="selectedOperationUuid" style="margin-top: 12px">
      <el-form class="page-search" inline>
        <el-form-item label="平台:">
          <el-select
            v-model="examineFilter.platformId"
            placeholder="请选择"
            class="select-width120"
            filterable
            clearable
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
            filterable
            clearable
            @change="storeSelectChange"
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
          <el-select
            v-model="examineFilter.linkId"
            filterable
            multiple
            clearable
            placeholder="请选择商品标题"
            class="select-width220"
          >
            <el-option
              v-for="(item, index) in linkSelectList"
              :key="index"
              :label="item.extendKeyword + '(' + item.name + ')'"
              :value="item.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="商品等级:">
          <el-select
            v-model="examineFilter.linkLevel"
            placeholder="请选择"
            class="select-width120"
            clearable
            filterable
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
          <el-input v-model="examineFilter.linkCode" placeholder="请输入" class="select-width220" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="clickExamineSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 明细表格 -->
    <el-table
      v-if="selectedOperationUuid"
      v-loading="examineTableLoading"
      border
      style="width: 100%; margin-top: 12px"
      :data="examineTableData"
      max-height="500"
    >
      <el-table-column width="50" label="序号" type="index" align="center" fixed="left"></el-table-column>
      <el-table-column
        label="店铺"
        prop="storeName"
        width="150"
        show-overflow-tooltip
        align="center"
        fixed="left"
      >
        <template v-slot="{ row }">
          {{
          row.platformName + "(" + (row.storeCode || "-") + ")" + row.storeName
          }}
        </template>
      </el-table-column>
      <el-table-column
        label="商品标题"
        prop="linkTitle"
        width="140"
        show-overflow-tooltip
        align="center"
        fixed="left"
      >
        <template v-slot="{ row }">
          {{
          row.linkTitle + "(" + row.linkId + ")"
          }}
        </template>
      </el-table-column>
      <el-table-column label="商品等级" prop="linkLevelName" width="100" align="center"></el-table-column>
      <el-table-column label="产品名称" prop="spuShowName" show-overflow-tooltip align="center"></el-table-column>
      <el-table-column
        label="SKU编码"
        prop="skuCode"
        width="160"
        show-overflow-tooltip
        align="center"
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
      <el-table-column label="申请类型" prop="applyTypeName" width="100" align="center"></el-table-column>
      <el-table-column label="起始日期" prop="startTime" width="120" align="center">
        <template v-slot="{ row }">
          <span>{{ getFormatDate(row.startTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束日期" prop="endTime" width="120" align="center">
        <template v-slot="{ row }">
          <span>{{ getFormatDate(row.endTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="项目" prop="strategyList" width="120" align="center">
        <template v-slot="{ row }">
          <div v-if="row.strategyList && row.strategyList.length">
            <span v-for="(item, index) in row.strategyList" :key="index">
              {{
              item ? item + "；" : ""
              }}
            </span>
          </div>
          <div v-else>暂无</div>
        </template>
      </el-table-column>
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
      <el-table-column label="上月申请计划" prop="lastPlanDesc" width="160" align="center"></el-table-column>
      <el-table-column label="本次申请计划" prop="thisPlanQuantity" width="160" align="left">
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
                  style="display: inline-block; min-width: 60px; flex-shrink: 0"
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
      <el-table-column label="操作" width="160" align="center" fixed="right">
        <template v-slot="{ row }">
          <!-- <el-button type="text" disabled>下载附件</el-button> -->
          <el-button type="text" @click="openTrendChart(row)">趋势图</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 明细表格分页 -->
    <!-- <pagination
      v-if="selectedOperationUuid"
      v-show="examineTableTotal > 0"
      :total="examineTableTotal"
      :page.sync="examineTablePage"
      :limit.sync="examineTablePageSize"
      @pagination="handleExamineTablePageChange"
    />-->
    <!-- 驳回弹窗 -->
    <RejectDialog
      :visible.sync="showRejectDialog"
      :operation-uuid="rejectOperationUuid"
      @success="getList"
      @close="showRejectDialog = false"
    />
    <!-- 作废弹窗 -->
    <InvalidDialog
      :visible.sync="showInvalidDialog"
      :operation-uuid="invalidOperationUuid"
      @success="getList"
      @close="showInvalidDialog = false"
    />
    <!-- 详情弹窗 -->
    <StopBlowDetailDialog
      :visible.sync="showDetailDialog"
      :operation-uuid="detailOperationUuid"
      @close="showDetailDialog = false"
    />

    <!-- 趋势图弹窗 -->
    <OperationTrendDialog
      :show-dialog.sync="showTrendChartDialog"
      :sku-uuid="trendChartSkuUuid"
      :link-id="trendChartLinkId"
    />
  </div>
</template>

<script>
import { getFormatDate } from '@/utils/common'
import {
  fetch_getAllList,
  fetch_getWaitDealWithList,
  fetch_confirm,
  fetch_getSonExamineDetailDes,
  fetch_sonExamineDetailTable,
} from '@/api/stopBursting/stopBurstingAudit/index'
import {
  getAuditStatusSelectList,
  getLinkSkuSelectList,
} from '@/api/operationManage/common'
import { debounce } from 'lodash'
import {
  listPlatform,
  listStore,
  listLinkLevel,
  getLinkSelectList,
} from '@/api/baseData/common'
import StopBlowDetailDialog from '@/views/stopBursting/apply/components/StopBlowDetailDialog.vue'
import RejectDialog from './components/RejectDialog.vue'
import InvalidDialog from './components/InvalidDialog.vue'
import OperationTrendDialog from '@/components/TrendChart/OperationTrendDialog.vue'

export default {
  name: 'stopBurstingAudit',
  components: {
    RejectDialog,
    InvalidDialog,
    StopBlowDetailDialog,
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
      searchType: 'all',
      searchTypeList: [
        { name: '全部', code: 'all' },
        { name: '待处理', code: 'wait' },
      ],
      auditStatusSelectList: [],
      tableLoading: false,
      tableData: [],
      tableTotal: 0,
      // 驳回
      showRejectDialog: false,
      rejectOperationUuid: '',

      // 作废
      showInvalidDialog: false,
      invalidOperationUuid: '',

      // 详情
      showDetailDialog: false,
      detailOperationUuid: '',

      // 行点击详请
      selectedOperationUuid: '',
      examineDetailLoading: false,
      examineDetailData: null,
      examineTableLoading: false,
      examineTableData: [],
      examineTablePage: 1,
      examineTablePageSize: 10,
      examineTableTotal: 0,

      // 明细筛选
      examineFilter: {
        platformId: '',
        storeUuid: '',
        linkId: [],
        linkLevel: '',
        skuUuid: '',
        skuSpecName: '',
        linkCode: '',
      },
      platformSelectList: [],
      storeSelectList: [],
      linkSelectList: [], // 商品标题下拉列表
      linkLevelOptions: [
        { label: 'S', value: 'S' },
        { label: 'A', value: 'A' },
        { label: 'B', value: 'B' },
      ],
      skuSpecOptions: [],

      // 趋势图
      showTrendChartDialog: false,
      trendChartSkuUuid: '',
      trendChartLinkId: '',

      // SKU下拉（参考 OperationSubtable）
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
    // 明细筛选下拉：参考 OperationSubtable 获取
    this.getPlatformSelectList()
    this.getStoreSelectList()
    this.getLinkLevelSelectList()
    // 初始化SKU下拉
    await this.getLinkSkuSelectList()
  },
  methods: {
    // 是否展示作废按钮
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
    // 分页
    handlePageChange(val) {
      this.reqParams.page = val.page
      this.getList()
    },
    // 列表
    async getList() {
      this.tableLoading = true
      try {
        this.reqParams.isInvalid = this.reqParams.isInvalidValue ? 1 : 0
        const params = { ...this.reqParams }
        const res =
          this.searchType === 'wait'
            ? await fetch_getWaitDealWithList(params)
            : await fetch_getAllList(params)
        const responseData = res.data || {}
        this.tableData = responseData.records || []
        this.tableTotal = responseData.total || 0
      } finally {
        this.tableLoading = false
      }
    },
    // 搜索
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
    // 时间变化
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
    // 时间格式化
    getFormatDate(time) {
      return getFormatDate(+time)
    },
    // 显示"本次申请计划"
    formatPlanQuantity(arr) {
      if (!Array.isArray(arr) || arr.length === 0) return '-'
      return arr
        .map((it, idx) => {
          const label = it.weeksName || `第${idx + 1}周`
          const parts = [label]

          // 添加京东仓信息
          if (it.jinNum) {
            parts.push(it.jinNum)
          }

          // 添加本地仓信息
          if (it.miMiaNum) {
            parts.push(it.miMiaNum)
          }

          // 如果没有 jinNum 和 miMiaNum，则使用原来的逻辑
          if (parts.length === 1) {
            const qty =
              typeof it.quantity === 'number'
                ? it.quantity
                : it.num || it.quantityValue || 0
            parts.push(`:${qty}`)
          }

          return parts.join('  ')
        })
        .join('  ')
    },
    // 操作：通过
    async handlePass(row) {
      const operationUuid = row && row.operationUuid
      if (!operationUuid) {
        this.$message.warning('缺少标识，无法通过')
        return
      }
      try {
        await this.$confirm('确认通过该申请吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
      } catch (e) {
        return // 用户取消
      }
      try {
        const res = await fetch_confirm(operationUuid)
        if (res && res.code === 200 && (res.data === true || res.data === 1)) {
          this.$message.success('操作成功')
          this.getList()
        } else {
          this.$message.error(res.msg || '操作失败')
        }
      } catch (error) {
        console.error('通过失败:', error)
        this.$message.error('操作失败，请重试')
      }
    },
    // 操作：驳回
    handleReject(row) {
      const operationUuid = row && row.operationUuid
      if (!operationUuid) return this.$message.warning('缺少标识，无法驳回')
      this.rejectOperationUuid = operationUuid
      this.showRejectDialog = true
    },
    // 详情
    handleDetail(row) {
      const operationUuid = row && row.operationUuid
      if (!operationUuid) return this.$message.warning('缺少标识，无法查看详情')
      this.detailOperationUuid = operationUuid
      this.showDetailDialog = true
    },
    // 操作：作废
    handleInvalid(row) {
      const operationUuid = row && row.operationUuid
      if (!operationUuid) return this.$message.warning('缺少标识，无法作废')
      this.invalidOperationUuid = operationUuid
      this.showInvalidDialog = true
    },
    // 行点击，加载明细申请单+表格
    async handleRowClick(row) {
      const operationUuid = row && row.operationUuid
      if (!operationUuid) return
      this.selectedOperationUuid = operationUuid
      this.examineTablePage = 1 // 重置分页
      // 清空明细表格筛选条件
      this.examineFilter = {
        platformId: '',
        storeUuid: '',
        linkId: [],
        linkLevel: '',
        skuUuid: '',
        skuSpecName: '',
        linkCode: '',
      }
      // 清空相关的下拉列表数据
      this.linkSelectList = []
      this.getExamineDetailDes()
      this.getExamineDetailTable()
    },
    async getExamineDetailDes() {
      if (!this.selectedOperationUuid) return
      this.examineDetailLoading = true
      try {
        const res = await fetch_getSonExamineDetailDes(
          this.selectedOperationUuid
        )
        if (res && res.code === 200) {
          this.examineDetailData = res.data || null
        } else {
          this.examineDetailData = null
        }
      } catch (e) {
        this.examineDetailData = null
      } finally {
        this.examineDetailLoading = false
      }
    },
    async getExamineDetailTable() {
      if (!this.selectedOperationUuid) return
      this.examineTableLoading = true
      try {
        const params = {
          operationUuid: this.selectedOperationUuid,
          platformId: this.examineFilter.platformId || undefined,
          storeUuid: this.examineFilter.storeUuid || undefined,
          linkId:
            this.examineFilter.linkId && this.examineFilter.linkId.length > 0
              ? this.examineFilter.linkId
              : undefined,
          linkLevel: this.examineFilter.linkLevel || undefined,
          skuUuid: this.examineFilter.skuUuid || undefined,
          linkCode: this.examineFilter.linkCode || undefined,
          page: this.examineTablePage,
          pageSize: this.examineTablePageSize,
        }
        const res = await fetch_sonExamineDetailTable(params)
        // 处理不同的数据格式：可能是数组，也可能是对象包含 records/total
        let dataList = []
        let total = 0
        if (res && res.code === 200) {
          if (Array.isArray(res.data)) {
            // 如果返回的是数组
            dataList = res.data || []
            total = res.data.length || 0
          } else {
            // 如果返回的是对象
            const responseData = res.data || {}
            dataList = responseData.records || responseData.list || []
            total = responseData.total || dataList.length || 0
          }
        } else if (res && res.data) {
          // 兼容没有 code 字段的情况
          if (Array.isArray(res.data)) {
            dataList = res.data || []
            total = res.data.length || 0
          } else {
            const responseData = res.data || {}
            dataList = responseData.records || responseData.list || []
            total = responseData.total || dataList.length || 0
          }
        }
        this.examineTableData = dataList
        this.examineTableTotal = total
      } catch (e) {
        console.error('获取明细表格数据失败:', e)
        this.examineTableData = []
        this.examineTableTotal = 0
      } finally {
        this.examineTableLoading = false
      }
    },

    clickExamineSearch() {
      this.examineTablePage = 1 // 重置分页
      this.getExamineDetailTable()
    },
    // 明细表格分页
    handleExamineTablePageChange(val) {
      this.examineTablePage = val.page
      this.examineTablePageSize = val.limit
      if (this.selectedOperationUuid) {
        this.getExamineDetailTable()
      }
    },
    // 参考 OperationSubtable.vue 获取筛选下拉
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
    // 店铺选择改变事件
    storeSelectChange(val) {
      // 默认清空商品标题数据
      this.examineFilter.linkId = []
      this.linkSelectList = []
      if (val) {
        this.getLinkSelectList()
      }
    },
    // 获取商品标题下拉框
    async getLinkSelectList() {
      if (!this.examineFilter.storeUuid) {
        this.linkSelectList = []
        return
      }
      try {
        const res = await getLinkSelectList({
          storeUuidList: [this.examineFilter.storeUuid],
        })
        this.linkSelectList = (res && res.data) || []
      } catch (e) {
        this.linkSelectList = []
      }
    },
    async getLinkLevelSelectList() {
      try {
        const res = await listLinkLevel()
        // 与页面期望字段对齐
        this.linkLevelOptions = (res && res.data) || []
      } catch (e) {
        this.linkLevelOptions = []
      }
    },

    // 打开趋势图
    openTrendChart(row) {
      const skuUuid = (row && (row.skuUuid || row.skuUrlUuid)) || ''
      const linkId = (row && (row.linkId || row.linkCode)) || ''
      if (!skuUuid) {
        this.$message.warning('缺少SKU标识，无法查看趋势图')
        return
      }
      if (!linkId) {
        this.$message.warning('缺少链接ID，无法查看趋势图')
        return
      }
      this.trendChartSkuUuid = skuUuid
      this.trendChartLinkId = linkId
      this.$nextTick(() => {
        this.showTrendChartDialog = true
      })
    },

    // ---- SKU 下拉（参考 OperationSubtable） ----
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
</style>
