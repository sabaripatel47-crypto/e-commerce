<template>
  <div class="operationSubtable-page">
    <div class="search-form">
      <el-form class="page-search" inline ref="page-filter">
        <el-form-item label="平台" style="margin-right: 20px">
          <el-select
            v-model="reqParams.platformId"
            class="select-width120"
            filterable
            clearable
            placeholder="请选择"
          >
            <el-option
              v-for="(item, index) in platformSelectList"
              :key="index"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="店铺名称" style="margin-right: 20px">
          <el-select
            v-model="reqParams.storeUuid"
            filterable
            clearable
            @change="storeSelectChange"
            placeholder="请选择店铺名称"
          >
            <el-option
              v-for="(item, index) in storeSelectList"
              :key="index"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品标题" style="margin-right: 20px">
          <el-select v-model="reqParams.linkId" filterable multiple clearable placeholder="请选择商品标题">
            <el-option
              v-for="(item, index) in linkSelectList"
              :key="index"
              :label="item.extendKeyword + '(' + item.name + ')'"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品等级" style="margin-right: 20px">
          <el-select
            v-model="reqParams.linkLevel"
            class="select-width120"
            filterable
            clearable
            placeholder="请选择"
          >
            <el-option
              v-for="(item, index) in linkLevelSelectList"
              :key="index"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="SKU编码" style="margin-right: 20px">
          <el-select
            v-model="reqParams.skuUuid"
            filterable
            clearable
            :filter-method="filterMethod"
            @visible-change="visibleChange"
            v-el-select-loadmore="loadMore"
            :loading="skuSelectLoading"
          >
            <el-option
              v-for="(item, index) in skuSelectList"
              :key="item.code"
              :label="item.extendKeyword + '(' + item.name + ')'"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品链接" style="margin-right: 20px">
          <el-input v-model="reqParams.linkCode" placeholder="请输入商品链接"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-if="operationUuid" icon="el-icon-search" @click="getList()">搜索</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table v-loading="tableLoading" border max-height="400" :data="tableData">
      <el-table-column width="50" label="序号" type="index" align="center"></el-table-column>
      <el-table-column
        label="店铺名称"
        width="150"
        show-overflow-tooltip
        prop="storeName"
        align="center"
      >
        <template v-slot="{ row }">
          {{
          row.platformName + "(" + (row.storeCode || "-") + ")" + row.storeName
          }}
        </template>
      </el-table-column>
      <el-table-column label="商品标题" width="140" prop="linkTitle" align="center">
        <template v-slot="{ row }">
          {{
          row.linkTitle + "(" + row.linkId + ")"
          }}
        </template>
      </el-table-column>
      <el-table-column label="商品等级" width="80" prop="linkLevelName" align="center"></el-table-column>
      <el-table-column
        label="产品名称"
        width="100"
        show-overflow-tooltip
        prop="spuShowName"
        align="center"
      ></el-table-column>
      <el-table-column
        label="SKU编码"
        width="160"
        show-overflow-tooltip
        prop="skuCode"
        align="center"
      >
        <template v-slot="{ row }">
          <span v-if="!row.isAdd">
            {{
            row.specsName + "(" + row.skuCode + ")"
            }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="SKU图片" width="80" prop="skuUrl" align="center">
        <template v-slot="{ row }">
          <el-image
            v-if="row.skuUrl"
            style="height: 30px; width: 30px"
            :src="row.skuUrl + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
            :preview-src-list="[row.skuUrl]"
          ></el-image>
        </template>
      </el-table-column>
      <el-table-column label="链接负责人" width="100" prop="managerName" align="center"></el-table-column>
      <el-table-column label="帮扶负责人" width="100" prop="helpSupportName" align="center"></el-table-column>
      <el-table-column label="项目实施人" width="100" prop="planningName" align="center"></el-table-column>
      <el-table-column label="货品分类" width="100" prop="categoryName" align="center"></el-table-column>
      <!-- <el-table-column label="申请类型" width="80" prop="applyTypeName" align="center"></el-table-column> -->
      <el-table-column label="项目" min-width="250" prop="submitTime" align="center">
        <template v-slot="{row}">
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
      <el-table-column label="申请金额(元)" width="100" prop="applyAmount" align="center"></el-table-column>
      <!-- <el-table-column
        label="上月申请计划"
        width="100"
        prop="applyPlanQuantity"
        align="center"
      ></el-table-column>-->

      <el-table-column label="上次帮扶本地仓复核数量" width="170" prop="lastHelpMiMaiPlan" align="center"></el-table-column>

      <el-table-column label="上次帮扶京东仓复核数量" width="170" prop="lastHelpJinPlan" align="center"></el-table-column>
      <!-- <el-table-column
        label="本次申请计划"
        width="100"
        prop="thisPlanQuantity"
        align="center"
      >
        <template v-slot="{ row }">
          <div v-if="row.thisPlanQuantity && row.thisPlanQuantity.length">
            <div v-for="(item, index) in row.thisPlanQuantity" :key="index">
              {{ item }}
            </div>
          </div>
        </template>
      </el-table-column>-->

      <el-table-column label="本次京仓申请计划" width="150" prop="thisPlanJinQuantity" align="center">
        <template v-slot="{ row }">
          <div v-if="row.thisPlanJinQuantity && row.thisPlanJinQuantity.length">
            <div v-for="(item, index) in row.thisPlanJinQuantity" :key="index">{{ item }}</div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="本次本地仓申请计划" width="150" prop="thisPlanQuantity" align="center">
        <template v-slot="{ row }">
          <div v-if="row.thisPlanQuantity && row.thisPlanQuantity.length">
            <div v-for="(item, index) in row.thisPlanQuantity" :key="index">{{ item }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column width="80" label="操作" align="center">
        <template v-slot="{ row }">
          <el-button type="text" @click="openTrendDialog(row)">趋势图</el-button>
          <el-button type="text" @click="itemDetailSku(row)">sku明细</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- sku明细 -->
    <StatisticsSpu
      v-if="spuDetailStatus"
      @closeDialog="detailStatus"
      :show="spuDetailStatus"
      :view="spuOrsku"
      :row="rowData"
      :title="detailTitle"
    ></StatisticsSpu>

    <!-- 趋势图弹层 -->
    <OperationTrendDialog
      v-if="showTrendChartDialog"
      :show-dialog.sync="showTrendChartDialog"
      :link-id="trendLinkId"
      :sku-uuid="trendSkuUuid"
    ></OperationTrendDialog>
  </div>
</template>

<script>
import {
  getLinkSelectList,
  listStore,
  listPlatform,
  listLinkLevel,
} from '@/api/baseData/common'
import {
  getLinkSkuSelectList, // 获取全量的sku下拉框数据
} from '@/api/operationManage/common'
import {
  getChildList, // 获取子列表（申请计划详情）
} from '@/api/operationManage/operationApplicationRecord'
import { debounce } from 'lodash'
// 趋势图组件
import OperationTrendDialog from '@/components/TrendChart/OperationTrendDialog.vue'
import StatisticsSpu from '@/views/bulletinboard/statistics/components/StatisticsSpu.vue'
import { getFormatDate, addDay } from '@/utils/common'

export default {
  name: 'OperationSubtable',
  components: { OperationTrendDialog, StatisticsSpu },
  props: {
    operationUuid: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      /* ---------------- 趋势图 ------------------------------- */
      // 控制弹层
      showTrendChartDialog: false,
      // linkid
      trendLinkId: '',
      // sku编码
      trendSkuUuid: '',

      // 列表接口入参
      reqParams: {
        linkCode: '', // 商品链接关键字：链接id
        linkId: [], // 	链接id
        linkLevel: '', // 商品等级
        operationUuid: '',
        platformId: '', // 平台id
        skuUuid: '', // skuuuid
        storeUuid: '', // 店铺uuid
      },

      // 列表数据
      tableData: [],
      // 列表加载
      tableLoading: false,

      // 下拉框
      platformSelectList: [], // 平台
      storeSelectList: [], // 店铺
      linkSelectList: [], // 商品链接
      linkLevelSelectList: [], // 商品等级

      // 全量sku下拉框
      skuSelectList: [], // 数据
      skuSelectLoading: false, // 加载状态
      skuSelectTotal: 0, // 总条数
      selectFlag: true, // 是否选择
      // 全量sku下拉框入参
      skuListReqParams: {
        keyword: '',
        page: 1,
        pageSize: 10,
      },
      rowData: {},
      spuOrsku: 'sku',
      detailTitle: 'sku明细',
      // sku明细状态
      spuDetailStatus: false,
    }
  },
  directives: {
    'el-select-loadmore': (el, binding) => {
      // 获取element-ui定义好的scroll盒子
      const SELECTWRAP_DOM = el.querySelector(
        '.el-select-dropdown .el-select-dropdown__wrap'
      )
      if (SELECTWRAP_DOM) {
        SELECTWRAP_DOM.addEventListener('scroll', function () {
          // 触底了加载更多列表
          const condition =
            this.scrollHeight - (Math.round(this.scrollTop) + 1) <=
            this.clientHeight

          if (condition) binding.value()
        })
      }
    },
  },

  created() {
    // 获取下拉框们
    this.getPlatformSelectList() // 平台
    this.getStoreSelectList() // 店铺
    this.getLinkLevelSelectList() // 商品等级
    this.getLinkSkuSelectList() // sku
  },
  methods: {
    /* --------------- 趋势图 --------------------------------- */
    openTrendDialog(row) {
      this.trendLinkId = row.linkId
      this.trendSkuUuid = row.skuUuid
      this.showTrendChartDialog = true
    },

    // 获取列表
    async getList() {
      this.$nextTick(async () => {
        this.tableLoading = true
        this.reqParams.operationUuid = this.operationUuid
        const res = await getChildList(this.reqParams)
        this.tableData = res.data
        this.tableLoading = false
      })
    },

    // 清空列表
    clearList() {
      this.tableData = []
      // 重置查询条件
      this.reqParams = {
        linkCode: '', // 商品链接关键字：链接id
        linkId: [], // 	链接id
        linkLevel: '', // 商品等级
        operationUuid: '',
        platformId: '', // 平台id
        skuUuid: '', // skuuuid
        storeUuid: '', // 店铺uuid
      }
    },

    // 店铺change事件
    storeSelectChange(val) {
      // 默认清空数据
      this.reqParams.linkId = []
      this.linkSelectList = []
      if (val) {
        this.getLinkSelectList()
      }
    },

    // 获取平台下拉框
    async getPlatformSelectList() {
      const res = await listPlatform()
      this.platformSelectList = res.data
    },
    // 获取店铺下拉框
    async getStoreSelectList() {
      const res = await listStore()
      this.storeSelectList = res.data
    },
    // 获取商品标题下拉框
    async getLinkSelectList() {
      const res = await getLinkSelectList({
        storeUuidList: [this.reqParams.storeUuid],
      })
      this.linkSelectList = res.data
    },
    // 获取商品等级下拉框
    async getLinkLevelSelectList() {
      const res = await listLinkLevel()
      this.linkLevelSelectList = res.data
    },
    // 获取SKU编码下拉框
    async getLinkSkuSelectList() {
      let res = await getLinkSkuSelectList(this.skuListReqParams)
      this.skuSelectList = res.data.records
      this.skuSelectTotal = res.data.total
    },

    // sku下拉框弹层显示隐藏事件
    async visibleChange(flag) {
      if (!flag || (flag && this.isEdit)) {
        this.skuListReqParams.keyword = ''
        this.skuListReqParams.page = 1
        await this.getLinkSkuSelectList()
        // this.filterMethod()
      }
    },

    // sku下拉框关键词查询事件
    filterMethod: debounce(async function (filterVal) {
      this.skuListReqParams.page = 1
      this.skuSelectLoading = true
      this.skuListReqParams.keyword = filterVal ? filterVal : ''
      await this.getLinkSkuSelectList()
      this.selectFlag = true
      this.skuSelectLoading = false
      // this.loadMore()
    }, 500),

    // sku下拉框加载更多
    async loadMore() {
      if (this.skuSelectList.length < this.skuSelectTotal && this.selectFlag) {
        this.skuListReqParams.page += 1
        this.selectFlag = false
        let res = await getLinkSkuSelectList(this.skuListReqParams)
        if (this.skuListReqParams.page == 1) {
          this.skuSelectList = []
        }
        res.data.records.forEach((item) => {
          this.skuSelectList.push(item)
        })
        this.skuSelectTotal = res.data.total

        this.selectFlag = true
        // console.log('this.reissueArrName', this.reissueArrName)
      }
    },
    // sku明细
    itemDetailSku(row) {
      const rowDataAss = Object.assign(row, {
        timeArr: [addDay(-7), addDay(-1)],
      })

      this.rowData = rowDataAss
      this.spuOrsku = 'sku'
      this.detailTitle = 'sku明细'
      this.spuDetailStatus = true
    },
    // 关闭明细
    detailStatus() {
      this.spuDetailStatus = false
    },
  },
}
</script>

<style lang="scss" scoped>
.operationSubtable-page {
  margin-top: 30px;

  .search-form {
    .el-form-item {
      margin-bottom: 10px;
    }
  }

  .select-width120 {
    width: 120px;
  }
}
</style>
