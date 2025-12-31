<template>
  <el-dialog
    :visible.sync="dialogVisible"
    title="停止打爆申请"
    width="90%"
    @close="closeDialog"
    :close-on-click-modal="false"
    :destroy-on-close="true"
  >
    <!-- 搜索表单 -->
    <div class="search-form">
      <el-form class="page-search" inline ref="searchForm">
        <el-form-item label="提交日期:" style="margin-right: 20px">
          <el-date-picker
            class="date-picker-width240"
            v-model="searchParams.timeArr"
            :clearable="false"
            type="daterange"
            align="right"
            unlink-panels
            value-format="timestamp"
            @change="changeTime"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="计划名称:" style="margin-right: 20px">
          <el-input v-model="searchParams.planName" placeholder="请输入"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 第一个表格：申请列表 -->
    <el-table
      v-loading="applyTableLoading"
      border
      max-height="300"
      :data="applyTableData"
      style="width: 100%; margin-bottom: 20px"
      @row-click="handleRowClick"
    >
      <el-table-column width="50" label="序号" type="index" align="center"></el-table-column>
      <el-table-column label="提交日期" width="100" prop="submitTime" align="center">
        <template v-slot="{ row }">
          <span>{{ getFormatDate(row.submitTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="计划名称" show-overflow-tooltip prop="planName" align="center"></el-table-column>
      <el-table-column label="申请人" width="100" prop="applyName" align="center"></el-table-column>
      <el-table-column label="申请类型" width="100" prop="applyTypeName" align="center"></el-table-column>
      <el-table-column label="申请说明" show-overflow-tooltip prop="applyInformation" align="center"></el-table-column>
      <el-table-column label="起始日期" width="100" prop="startTime" align="center">
        <template v-slot="{ row }">
          <span>{{ getFormatDate(row.startTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束日期" width="100" prop="endTime" align="center">
        <template v-slot="{ row }">
          <span>{{ getFormatDate(row.endTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" align="center">
        <template v-slot="{ row }">
          <el-button type="text" @click.stop="handleStopBursting(row)">停止打爆</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="applyTableTotal > 0"
      :total="applyTableTotal"
      :page.sync="searchParams.page"
      :limit.sync="searchParams.pageSize"
      @pagination="handlePageChange"
    />

    <!-- 第二个表格：产品/SKU详情 -->
    <el-table
      v-if="selectedOperationUuid"
      v-loading="detailTableLoading"
      border
      max-height="300"
      :data="detailTableData"
      style="width: 100%; margin-top: 20px"
    >
      <el-table-column width="50" label="序号" type="index" align="center" fixed="left"></el-table-column>
      <el-table-column label="店铺" min-width="180" align="center" fixed="left">
        <template v-slot="{ row }">
          <span>{{ formatStoreInfo(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品标题" min-width="200" align="center">
        <template v-slot="{ row }">
          <span>{{ formatProductTitle(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品等级" width="100" prop="linkLevelName" align="center"></el-table-column>
      <el-table-column label="产品名称" width="150" prop="spuShowName" align="center"></el-table-column>
      <el-table-column label="SKU编码" width="180" align="center">
        <template v-slot="{ row }">
          <span>{{ formatSkuCode(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="SKU图片" width="100" align="center">
        <template v-slot="{ row }">
          <el-image
            v-if="row.skuUrl || row.skuUrlUuid"
            style="height: 30px; width: 30px"
            :src="
              (row.skuUrl || row.skuUrlUuid) +
              '?x-oss-process=image/resize,w_30,h_30,limit_0'
            "
            :preview-src-list="[row.skuUrl || row.skuUrlUuid]"
          ></el-image>
        </template>
      </el-table-column>
      <el-table-column label="负责人" width="120" prop="managerName" align="center"></el-table-column>
      <el-table-column label="货品分类" width="120" prop="categoryName" align="center"></el-table-column>
      <el-table-column label="项目" width="120" prop="strategyList" align="center">
        <template v-slot="{ row }">
          <span>{{ formatStrategyList(row.strategyList) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="申请金额(元)" width="120" prop="applyAmount" align="center">
        <template v-slot="{ row }">
          <span>
            {{
            typeof row.applyAmount === "number"
            ? row.applyAmount.toFixed(2)
            : row.applyAmount || "-"
            }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="本次申请计划" width="200" align="left">
        <template v-slot="{ row }">
          <div style="white-space: pre-wrap">{{ formatPlanQuantity(row.thisPlanQuantity) }}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" align="center" fixed="right">
        <template v-slot="{ row }">
          <!-- 
          TODO 暂无接口
          <el-button type="text" @click="handleDownloadAttachment(row)"
            >下载附件</el-button
          >-->
          <el-button type="text" @click="handleTrendChart(row)">趋势图</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 停止打爆弹窗 -->
    <StopBlowDialog
      :visible.sync="showStopBlowDialog"
      :operation-uuid="stopBlowOperationUuid"
      @success="handleStopBlowSuccess"
      @close="showStopBlowDialog = false"
    />

    <!-- 趋势图弹窗 -->
    <OperationTrendDialog
      :show-dialog.sync="showTrendChartDialog"
      :sku-uuid="trendChartSkuUuid"
      :link-id="trendChartLinkId"
      :append-to-body="true"
    />
  </el-dialog>
</template>

<script>
import { getFormatDate } from '@/utils/common'
import { addDetailPage, getAddDetailPage } from '@/api/stopBursting/apply/index'
import StopBlowDialog from './StopBlowDialog.vue'
import OperationTrendDialog from '@/components/TrendChart/OperationTrendDialog.vue'

export default {
  name: 'AddApplyDialog',
  components: {
    StopBlowDialog,
    OperationTrendDialog,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      dialogVisible: false,
      // 搜索参数
      searchParams: {
        startTime: '',
        endTime: '',
        planName: '',
        page: 1,
        pageSize: 10,
        timeArr: [],
      },
      // 第一个表格：申请列表
      applyTableLoading: false,
      applyTableData: [],
      applyTableTotal: 0,
      // 第二个表格：产品详情
      detailTableLoading: false,
      detailTableData: [],
      // 选中的运营主表uuid
      selectedOperationUuid: '',

      // 停止打爆弹窗
      showStopBlowDialog: false,
      stopBlowOperationUuid: '',

      // 趋势图弹窗
      showTrendChartDialog: false,
      trendChartSkuUuid: '',
      trendChartLinkId: '',
    }
  },
  watch: {
    visible: {
      handler(newVal) {
        this.dialogVisible = newVal
        if (newVal) {
          this.initDialog()
        }
      },
      immediate: true,
    },
  },
  methods: {
    formatStrategyList(strategyList) {
      if (!Array.isArray(strategyList) || strategyList.length === 0) return '-'
      if (strategyList.length === 1) return strategyList[0]
      return strategyList.join(',')
    },
    // 初始化弹窗
    initDialog() {
      this.setDefaultTime()
      this.getApplyList()
      this.selectedOperationUuid = ''
      this.detailTableData = []
    },

    // 默认时间：当月1号至今
    setDefaultTime() {
      const now = new Date()
      now.setDate(1)
      now.setHours(0, 0, 0, 0)
      const start = now.getTime() + ''
      const end = new Date().getTime() + ''
      this.searchParams.timeArr = [start, end]
      this.searchParams.startTime = start
      this.searchParams.endTime = end
    },

    // 时间范围改变
    changeTime(val) {
      if (val) {
        this.searchParams.startTime = val[0]
        this.searchParams.endTime = val[1]
      }
    },

    // 获取申请列表
    async getApplyList() {
      this.applyTableLoading = true
      try {
        const params = {
          startTime: this.searchParams.startTime,
          endTime: this.searchParams.endTime,
          planName: this.searchParams.planName,
          page: this.searchParams.page,
          pageSize: this.searchParams.pageSize,
        }
        const res = await addDetailPage(params)
        const responseData = res.data || {}
        this.applyTableData = responseData.records || []
        this.applyTableTotal = responseData.total || 0
      } finally {
        this.applyTableLoading = false
      }
    },

    // 点击搜索
    handleSearch() {
      this.searchParams.page = 1
      // 隐藏所有表格
      this.selectedOperationUuid = ''
      this.detailTableData = []
      this.getApplyList()
    },

    // 点击分页
    handlePageChange(val) {
      this.searchParams.page = val.page
      this.searchParams.pageSize = val.limit
      this.getApplyList()
    },

    // 点击表格行
    handleRowClick(row) {
      this.selectedOperationUuid = row.operationUuid || ''
      // 根据选中的行获取产品详情列表
      if (this.selectedOperationUuid) {
        this.getDetailTableList()
      } else {
        this.detailTableData = []
      }
    },

    // 获取第二个表格（产品/SKU详情）数据
    async getDetailTableList() {
      if (!this.selectedOperationUuid) return
      this.detailTableLoading = true
      try {
        const res = await getAddDetailPage(this.selectedOperationUuid)
        const responseData = res && res.data ? res.data : {}
        // 接口可能直接返回数组或 {records/list}
        const list = Array.isArray(responseData)
          ? responseData
          : responseData.records || responseData.list || []
        this.detailTableData = list
      } catch (e) {
        this.detailTableData = []
      } finally {
        this.detailTableLoading = false
      }
    },

    // 点击停止打爆
    handleStopBursting(row) {
      const operationUuid = row.operationUuid || ''
      if (!operationUuid) {
        this.$message.warning('缺少运营主表UUID，无法停止打爆')
        return
      }
      this.stopBlowOperationUuid = operationUuid
      this.showStopBlowDialog = true
    },

    // 停止打爆成功
    handleStopBlowSuccess() {
      // 刷新申请列表
      this.getApplyList()
      // 清空选中的运营主表uuid和产品详情
      this.selectedOperationUuid = ''
      this.detailTableData = []
      // 通知父组件刷新主列表
      this.$emit('refresh')
    },

    // 下载附件
    handleDownloadAttachment(row) {
      this.$message.info('下载附件功能待实现')
      // TODO: 实现下载附件功能
    },

    // 趋势图
    handleTrendChart(row) {
      const skuUuid = row.skuUuid || ''
      if (!skuUuid) {
        this.$message.warning('缺少SKU标识，无法查看趋势图')
        return
      }
      this.trendChartSkuUuid = skuUuid
      this.trendChartLinkId = row.linkId || ''
      this.$nextTick(() => {
        this.showTrendChartDialog = true
      })
    },

    // 格式化店铺信息
    formatStoreInfo(row) {
      const platformName = row.platformName || ''
      const storeCode = row.storeCode || ''
      const storeName = row.storeName || ''
      if (storeCode || storeName) {
        return platformName
          ? `${platformName}(${storeCode})${storeName}`
          : `(${storeCode})${storeName}`
      }
      return '-'
    },

    // 格式化商品标题
    formatProductTitle(row) {
      const linkTitle = row.linkTitle || ''
      const linkId = row.linkId || ''
      if (linkTitle || linkId) {
        return `${linkTitle}(${linkId})`
      }
      return '-'
    },

    // 格式化SKU编码
    formatSkuCode(row) {
      const skuCode = row.skuCode || ''
      const specsName = row.specsName || ''
      if (skuCode || specsName) {
        return `(${skuCode})${specsName}`
      }
      return '-'
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

    // 时间戳转日期
    getFormatDate(time) {
      return getFormatDate(+time)
    },

    // 关闭弹窗
    closeDialog() {
      this.dialogVisible = false
      this.$emit('update:visible', false)
      this.$emit('close')
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
</style>
