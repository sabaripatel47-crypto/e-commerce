<template>
  <div>
    <el-dialog :visible="showDialog" title="补单申请计划单" fullscreen @close="closeDialog" append-to-body>
      <el-button
        type="text"
        icon="el-icon-arrow-left"
        class="dialog-back-button"
        @click="closeDialog"
      >返回</el-button>
      <div>
        <el-button type="primary" plain @click="openAddDialog">新增</el-button>
        <el-button type="primary" plain v-if="tableList.length" @click="openPlanMonthDialog">提交审核</el-button>
      </div>
      <div class="table-content">
        <el-row :gutter="30">
          <el-col :span="8">
            <el-table
              v-loading="tableLoading"
              max-height="600"
              :data="tableList"
              border
              @row-click="getChildTableList"
            >
              <el-table-column label="店铺名称" prop="storeName" align="center">
                <template v-slot="{ row }">
                  {{
                  row.platformName +
                  "(" +
                  (row.storeCode || "-") +
                  ")" +
                  row.storeName
                  }}
                </template>
              </el-table-column>

              <el-table-column label="商品标题" prop="linkTitle" align="center">
                <template v-slot="{ row }">
                  {{
                  row.linkTitle + "(" + row.linkId + ")"
                  }}
                </template>
              </el-table-column>
              <el-table-column label="项目负责人" prop="planningName" align="center">
                <template v-slot="{ row }">{{ row.planningName }}</template>
              </el-table-column>
              <el-table-column label="帮扶负责人" prop="helpSupportName" align="center">
                <template v-slot="{ row }">{{ row.helpSupportName }}</template>
              </el-table-column>

              <el-table-column label="操作" width="80" prop="storeName" align="center">
                <template v-slot="{ row }">
                  <el-button type="text" @click.stop="updateItemLink(row)">修改</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
          <el-col :span="16">
            <el-table v-loading="childTableLoading" border max-height="600" :data="childTableList">
              <el-table-column label="序号" width="50" type="index" align="center"></el-table-column>

              <el-table-column label="产品名称" prop="spuShowName" align="center"></el-table-column>
              <el-table-column label="SKU编码" prop="skuCode" align="center">
                <template v-slot="{ row }">
                  <span v-if="!row.isAdd">
                    {{
                    row.specsName + "(" + row.skuCode + ")"
                    }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="SKU图片" width="80" align="center" prop="skuUrl">
                <template v-slot="{ row }">
                  <el-image
                    v-if="row.skuUrl"
                    style="height: 30px; width: 30px"
                    :src="
                      row.skuUrl +
                      '?x-oss-process=image/resize,w_30,h_30,limit_0'
                    "
                    :preview-src-list="[row.skuUrl]"
                  ></el-image>
                </template>
              </el-table-column>
              <el-table-column label="货品分类" width="80" prop="categoryName" align="center"></el-table-column>
              <el-table-column label="上月帮扶复核本地仓" prop="lastHelpMiMaiPlan" align="center" width="90"></el-table-column>
              <el-table-column label="上月帮扶复核京仓" prop="lastHelpJinPlan" align="center" width="90"></el-table-column>
              <el-table-column label="本次申请计划本地仓" prop="thisMonthPlan" align="center" width="90"></el-table-column>
              <el-table-column label="本次申请计划京仓" prop="thisMonthJinPlan" align="center" width="90"></el-table-column>
              <el-table-column label="操作" width="80" prop="storeName" align="center">
                <template v-slot="{ row }">
                  <el-button type="text" @click="openTrendDialog(row)">趋势图</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
      </div>
    </el-dialog>

    <!-- 新增弹层 -->
    <el-dialog
      :visible="showAddDialog"
      :title="isPlanEdit ? '修改' : '新增'"
      fullscreen
      class="fullscreen-dialog-width90"
      @close="closeAddDialog"
    >
      <el-form :model="linkListReqParams" class="page-search" ref="addFormRef" inline>
        <el-form-item label="申请类型:" prop="hospitalUuid" style="margin-right: 20px;">补单申请</el-form-item>
        <el-form-item label="申请日期:" prop="hospitalUuid" style="margin-right: 20px;">
          {{
          getFormatDate(planTime)
          }}
        </el-form-item>
        <el-form-item label="平台:" prop="platform" style="margin-right: 20px;">
          <el-select
            class="form-item-width"
            v-model="linkListReqParams.platform"
            filterable
            clearable
            :disabled="this.isPlanEdit"
            placeholder="请选择平台"
            @change="platformSelectChange"
          >
            <el-option
              v-for="(item, index) in platformSelectList"
              :key="index"
              :label="item.name"
              :value="item.extendKeyword"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="店铺:" prop="storeUuid" style="margin-right: 20px;">
          <el-select
            class="form-item-width"
            v-model="linkListReqParams.storeUuid"
            filterable
            clearable
            :disabled="this.isPlanEdit"
            placeholder="请选择店铺"
            @change="storeSelectChange"
          >
            <el-option
              v-for="(item, index) in storeSelectList"
              :key="index"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="链接等级:" prop="linkLevel" style="margin-right: 20px;">
          <el-select
            class="form-item-width"
            v-model="linkListReqParams.linkLevel"
            filterable
            clearable
            :disabled="this.isPlanEdit"
            placeholder="请选择链接等级"
            @change="linkLevelChange"
          >
            <el-option
              v-for="(item, index) in linkLevelSelectList"
              :key="index"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <el-table
        v-loading="linkTableLoading"
        v-if="!isPlanEdit"
        border
        :max-height="400"
        :data="linkTableData"
        @row-click="linkSelectChange"
      >
        <el-table-column label="平台" prop="platformName" align="center"></el-table-column>
        <el-table-column label="店铺" align="center">
          <template v-slot="{row}">
            <span>({{ row.storeCode }}){{ row.storeName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="商品名称" prop="linkTitle" align="center">
          <template v-slot="{row}">
            <span>{{ row.linkTitle }}({{ row.linkId }})</span>
          </template>
        </el-table-column>
        <el-table-column label="链接等级" width="100" prop="linkLevelName" align="center"></el-table-column>
      </el-table>
      <pagination
        v-show="linkTableTotal > 0"
        v-if="!isPlanEdit"
        :total="linkTableTotal"
        :page.sync="linkListReqParams.page"
        :limit.sync="linkListReqParams.pageSize"
        @pagination="linkPageChange"
      />

      <el-table
        v-loading="addTableLoading"
        border
        style="margin-top: 20px;"
        :max-height="600"
        :data="addTableList"
      >
        <el-table-column label="产品名称" width="140" prop="spuShowName" align="center"></el-table-column>
        <el-table-column label="SKU编码" prop="skuCode" align="center">
          <template v-slot="{ row, $index }">
            <span v-if="!row.isAdd">
              {{
              row.specsName + "(" + row.skuCode + ")"
              }}
            </span>
            <el-select
              style="width: 80%"
              v-else
              v-model="row.skuUuid"
              filterable
              :filter-method="filterMethod"
              @visible-change="visibleChange"
              v-el-select-loadmore="loadMore"
              :loading="skuSelectLoading"
              @change="(val) => changeSelect(val, row, $index)"
            >
              <el-option
                v-for="(item, index) in skuSelectList"
                :key="item.code"
                :label="item.extendKeyword + '(' + item.name + ')'"
                :value="item.code"
              ></el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="SKU图片" width="80" align="center" prop="skuUrl">
          <template v-slot="{ row }">
            <el-image
              v-if="row.skuUrl"
              style="height: 30px; width: 30px"
              :src="
                row.skuUrl + '?x-oss-process=image/resize,w_30,h_30,limit_0'
              "
              :preview-src-list="[row.skuUrl]"
            ></el-image>
          </template>
        </el-table-column>
        <el-table-column label="货品分类" width="120" prop="categoryName" align="center"></el-table-column>
        <el-table-column label="上次帮扶复核本地仓" width="150" prop="lastHelpMiMaiPlan" align="center"></el-table-column>
        <el-table-column label="上次帮扶复核京仓" width="150" prop="lastHelpJinPlan" align="center"></el-table-column>
        <el-table-column label="本次申请计划本地仓" width="150" prop="thisMonthPlanQuantity" align="center">
          <template v-slot="{ row, $index }">
            <!-- 创建一个只能输入正整数的输入框保留两位小数 -->
            <el-input-number
              class="table-input-number"
              v-model="row.thisMonthPlanQuantity"
              :precision="0"
              :min="0"
              label="请输入"
              style="width: 100%"
              size="small"
            ></el-input-number>
          </template>
        </el-table-column>
        <el-table-column
          label="本次申请计划京仓"
          width="150"
          prop="thisMonthPlanJinQuantity"
          align="center"
        >
          <template v-slot="{ row, $index }">
            <!-- 创建一个只能输入正整数的输入框保留两位小数 -->
            <el-input-number
              class="table-input-number"
              v-model="row.thisMonthPlanJinQuantity"
              :precision="0"
              :min="0"
              label="请输入"
              style="width: 100%"
              size="small"
            ></el-input-number>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center">
          <template v-slot="{ row, $index }">
            <el-button type="text" @click="deleteSkuItem($index)">删除</el-button>
            <el-button type="text" @click="getTendencyChart(row)">趋势图</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="add-icon">
        <i
          class="el-icon-circle-plus-outline"
          style="font-size: 24px; color: #1e98d7"
          @click="addRow"
        ></i>
      </div>
      <OperationTrend
        style="margin-top: 10px;"
        v-if="showTendencyChart"
        :link-id="trendLinkId"
        :sku-uuid="tendencyChartSkuUuid"
      ></OperationTrend>
      <div class="footer-btn">
        <el-button @click="closeAddDialog">取 消</el-button>
        <el-button type="primary" @click="clickSave('save')">保 存</el-button>
        <el-button type="primary" @click="clickSave('saveAndNext')">保存并录入下一个</el-button>
      </div>
    </el-dialog>

    <!-- 提交审核弹层 -->
    <el-dialog :visible="showSubmitDialog" title="提交审核" @close="closeSubmitDialog">
      <el-form :label-position="'right'" label-width="140px">
        <el-form-item label="计划名称：">
          {{
          submitReqParams.planName
          }}
        </el-form-item>
        <el-form-item label="申请说明：">
          <el-input
            type="textarea"
            :rows="2"
            :autosize="{ minRows: 3, maxRows: 6 }"
            placeholder="请输入内容"
            v-model="submitReqParams.applyInformation"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeSubmitDialog">取 消</el-button>
        <el-button type="primary" @click="submitApply">确 定</el-button>
      </span>
    </el-dialog>

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
  getLinkSkuSelectList, // 获取全量的sku下拉框数据
  getLinkLevelSelectList, // 获取链接等级下拉框数据
} from '@/api/operationManage/common'
import {
  getSkuAddList, // 新增时获取链接下的所有sku列表（切换商品标题）
  addSingleLinkApply, // 新增单条链接申请单（点击保存、保存并录入下一个时触发）
  getSkuDetail, // 获取sku详情信息
  updateSingleLinkApply, // 修改单条链接申请单
  getSkuApplyList, // 获取单链接下的sku申请列表
  getSingleLinkDetail, // 获取单链接申请的修改详情
  getPlanName, // 获取计划名称
  submitOperationAuditAdd, // 提交运营申请审核
  getOperationApplyDetail, // 获取运营申请的修改详情
  reapplyOperation, // 重新发起运营申请
  getLinkList, // 链接列表
} from '@/api/operationManage/operationApplicationRecord'
import { getFormatDate } from '@/utils/common'
import {
  listPlatform,
  listStoreByPlatformKey,
  fetch_StoreToLinkLevelPush,
} from '@/api/baseData/common'
import { debounce } from 'lodash'
import OperationTrendDialog from '@/components/TrendChart/OperationTrendDialog.vue'
import OperationTrend from '@/components/TrendChart/OperationTrend.vue'
export default {
  name: 'PlaceAnOrderForAReplacement',
  components: { OperationTrendDialog, OperationTrend },
  props: {
    showDialog: {
      type: Boolean,
      default: false,
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
    applyUuid: {
      type: String,
      default: '',
    },
    planTime: {
      type: Number,
      default: null,
    },
    auditStatus: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      // 列表
      tableList: [],
      tableLoading: false,

      // 子列表
      childTableList: [],
      childTableLoading: false,

      /* ---------------- 趋势图 ------------------------------- */
      // 控制弹层
      showTrendChartDialog: false,
      // linkid
      trendLinkId: '',
      // sku编码
      skuUuid: '',

      /* -------------- 提交审核 ------------------------------- */

      // 提交审核
      showSubmitDialog: false,
      // 提交审核入参
      submitReqParams: {
        planName: '',
        applyInformation: '',
      },

      /* -------------- 新增 ------------------------------- */
      // 新增
      showAddDialog: false, // 弹层
      // 新增入参
      addReqParams: {
        addOperationLagerDetails: [],
        updateOperationDetailList: [],
        linkId: '',
        operationUuid: '',
        storeUuid: '',
        platform: '',
        linkLevel: '',
      },
      // 是否是修改计划
      isPlanEdit: false,
      // 新增的计划列表
      addTableList: [],
      // 新增表格的加载状态
      addTableLoading: false,

      // 新增的校验
      addRules: {
        platform: [
          {
            required: true,
            message: '请选择平台',
            trigger: 'change',
          },
        ],
        storeUuid: [
          {
            required: true,
            message: '请选择店铺',
            trigger: 'change',
          },
        ],
        linkId: [
          {
            required: true,
            message: '请选择商品链接',
            trigger: 'change',
          },
        ],
        linkLevel: [
          {
            required: true,
            message: '请选择等级',
            trigger: 'change',
          },
        ],
      },

      // 获取全量sku下拉框数据
      skuSelectList: [],
      skuSelectLoading: false,
      // 全量sku总条数
      skuSelectTotal: 0,
      selectFlag: true,
      // 全量sku下拉框入参
      skuListReqParams: {
        keyword: '',
        page: 1,
        pageSize: 10,
      },

      // 链接列表参数
      linkListReqParams: {
        page: 1,
        pageSize: 10,
        platform: '',
        storeUuid: '',
        linkLevel: '',
      },
      linkTableData: [],
      linkTableLoading: false,
      linkTableTotal: 0,

      // 下拉框列表
      platformSelectList: [], // 平台
      storeSelectList: [], // 店铺
      linkLevelSelectList: [], // 链接等级

      // 选中的link row数据
      selectLinkRow: '',

      // 新增里面的趋势图
      showTendencyChart: false,
      tendencyChartSkuUuid: '',
      trendLinkId: '',
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
          const condition =
            this.scrollHeight - (Math.round(this.scrollTop) + 1) <=
            this.clientHeight

          if (condition) binding.value()
        })
      }
    },
  },
  async created() {
    this.getPlatformSelectList()
    this.getStoreList()
    this.getLinkSkuSelectList()
    this.getLinkLevelSelectList()

    // 获取列表数据
    this.addReqParams.operationUuid = this.applyUuid
    await this.getTableList()
  },
  methods: {
    /* --------------- 趋势图 --------------------------------- */
    openTrendDialog(row) {
      this.trendLinkId = row.linkId || this.addReqParams.linkId
      this.trendSkuUuid = row.skuUuid
      this.showTrendChartDialog = true
    },

    getTendencyChart(row) {
      if (row.skuUuid == undefined) {
        this.tendencyChartSkuUuid = ''
        this.trendLinkId = ''
        return
      }
      this.showTendencyChart = true
      this.tendencyChartSkuUuid = row.skuUuid
      this.trendLinkId = this.addReqParams.linkId
    },

    /* --------------- 审核 --------------------------------- */
    // 提交审核
    async submitApply() {
      if (this.auditStatus == 3) {
        const res = await reapplyOperation({
          applyInformation: this.submitReqParams.applyInformation,
          operationUuid: this.applyUuid,
        })
        if (res.code === 200) {
          this.$message.success('提交成功')
          this.closeSubmitDialog()
          this.closeDialog()
        }
      } else {
        const res = await submitOperationAuditAdd({
          applyInformation: this.submitReqParams.applyInformation,
          operationUuid: this.applyUuid,
        })
        if (res.code === 200) {
          this.$message.success('提交成功')
          this.closeSubmitDialog()
          this.closeDialog()
        }
      }
    },

    // 打开提交审核弹层
    async openPlanMonthDialog() {
      const res = await getPlanName(this.applyUuid)
      this.submitReqParams.planName = res.data
      this.showSubmitDialog = true
    },

    // 关闭提交审核弹层
    closeSubmitDialog() {
      this.submitReqParams = {
        planName: '',
        applyInformation: '',
      }
      this.showSubmitDialog = false
    },

    // 添加行数据
    addRow() {
      this.addTableList.push({
        skuCode: '',
        skuUrl: '',
        skuName: '',
        skuCode: '',
        categoryName: '',
        lastMonthPlan: '',
        skuUuid: '',
        thisMonthPlanQuantity: undefined,
        thisMonthJinPlan: undefined,
        isAdd: true,
      })
    },

    // 获取子列表数据
    async getChildTableList(val) {
      this.childTableLoading = true
      let params = {
        linkId: val.linkId,
        operationUuid: val.operationUuid,
      }
      const res = await getSkuApplyList(params)
      this.childTableList = res.data
      this.childTableLoading = false
    },

    /* --------------- 新增 --------------------------------- */
    // 获取列表数据
    async getTableList() {
      this.tableLoading = true
      const res = await getOperationApplyDetail(this.addReqParams.operationUuid)
      this.tableList = res.data
      this.tableLoading = false
    },

    //

    // 点击新增的保存并录入下一个
    async clickSave(type, isClose) {
      // type 为saveAndNext时 点击的保存并

      // 筛选出有数据的sku
      let addOperationDetails = JSON.parse(
        JSON.stringify(this.addTableList.filter((item) => item.skuUuid !== ''))
      )
      // 如果没有进行提示
      if (addOperationDetails.length === 0) {
        return this.$message.error('至少添加一条SKU信息！')
      }

      // 判断是否存在本月计划为空的情况
      let flag = addOperationDetails.some(
        (item) =>
          (!item.thisMonthPlanQuantity && item.thisMonthPlanQuantity !== 0) ||
          (!item.thisMonthPlanJinQuantity &&
            item.thisMonthPlanJinQuantity !== 0)
      )
      if (flag) {
        this.$confirm(
          '本月计划不能为空！是否需要将本月计划为空的数据置为“0”？',
          {
            confirmButtonText: '是',
            cancelButtonText: '否',
            type: 'warning',
            beforeClose: async (action, instance, done) => {
              if (action === 'confirm') {
                instance.confirmButtonLoading = true
                instance.confirmButtonText = '提交中...'
                // 组装本月的计划为空的值
                addOperationDetails.forEach((item) => {
                  if (
                    !item.thisMonthPlanQuantity &&
                    item.thisMonthPlanQuantity !== 0
                  ) {
                    item.thisMonthPlanQuantity = 0
                  }
                  if (
                    !item.thisMonthPlanJinQuantity &&
                    item.thisMonthPlanJinQuantity !== 0
                  ) {
                    item.thisMonthPlanJinQuantity = 0
                  }
                })
                // 调用接口
                const [err, res] = await this.$to(
                  this.saveAdd(addOperationDetails, isClose)
                )
                instance.confirmButtonLoading = false
                await done()
                if (type === 'saveAndNext') {
                  this.openAddDialog()
                }
              } else {
                await done()
              }
            },
          }
        )
      } else {
        await this.saveAdd(addOperationDetails, isClose)
        if (type === 'saveAndNext') {
          this.openAddDialog()
        }
      }
    },

    // 调用保存/修改接口
    async saveAdd(addOperationDetails, isClose) {
      console.log('isClose', isClose)

      // 调用接口
      // if (this.isPlanEdit) {
      this.addReqParams.updateOperationDetailList = addOperationDetails
      this.addReqParams.storeUuid = this.selectLinkRow.storeUuid
      this.addReqParams.platform = this.selectLinkRow.platform
      this.addReqParams.linkLevel = this.selectLinkRow.linkLevel
      const res = await updateSingleLinkApply(this.addReqParams)
      if (res.code == 200) {
        // 刷新外层的子列表
        this.getChildTableList(this.addReqParams)
        if (isClose !== false) {
          this.closeAddDialog()
        }
        this.$message.success('修改成功')
      }
      // } else {
      //   this.addReqParams.addOperationLagerDetails = addOperationDetails
      //   const res = await addSingleLinkApply(this.addReqParams)
      //   if (res.code == 200) {
      //     this.closeAddDialog()
      //     this.$message.success('保存成功')
      //   }
      // }
    },

    // sku下拉框的change
    async changeSelect(val, row, index) {
      if (!val) {
        // 删除选中的货品时 需要强刷新
        this.$forceUpdate()
        return
      }
      try {
        // 只检查 linkId 是否存在，不需要验证整个表单
        if (!this.addReqParams.linkId) {
          this.$message.warning('请先选择商品标题')
          // 清空选中的 SKU
          row.skuUuid = ''
          return
        }
        let params = {
          linkId: this.addReqParams.linkId,
          planMonth: this.planTime,
          skuUuid: val,
        }
        const res = await getSkuDetail(params)
        // 赋值行数据
        if (res.code === 200) {
          const {
            categoryName,
            categoryUuid,
            lastMonthPlan,
            skuCode,
            skuUrl,
            skuUrlUuid,
            skuUuid,
            specsName,
            spuShowName,
            spuUuid,
            lastHelpJinPlan,
            lastHelpMiMaiPlan,
          } = res.data
          row.categoryName = categoryName
          row.categoryUuid = categoryUuid
          row.lastMonthPlan = lastMonthPlan
          row.skuCode = skuCode
          row.skuUrl = skuUrl
          row.skuUrlUuid = skuUrlUuid
          row.skuUuid = skuUuid
          row.specsName = specsName
          row.spuShowName = spuShowName
          row.spuUuid = spuUuid
          row.lastHelpJinPlan = lastHelpJinPlan
          row.lastHelpMiMaiPlan = lastHelpMiMaiPlan
        }
      } catch (error) {
        console.error('changeSelect 处理错误:', error)
        this.$message.error('获取SKU详情失败')
      }
    },

    // 删除单行sku
    deleteSkuItem(index) {
      this.addTableList.splice(index, 1)
    },

    // 点击修改
    async updateItemLink(row) {
      this.isPlanEdit = true
      let params = {
        linkId: row.linkId,
        operationUuid: row.operationUuid,
      }
      const res = await getSingleLinkDetail(params)
      if (res.code === 200) {
        const {
          linkId,
          linkTitle,
          storeUuid,
          platformKey,
          operationLagerDetailVOList,
          linkLevel,
        } = res.data
        this.addReqParams.linkId = linkId
        this.linkListReqParams.storeUuid = storeUuid
        this.linkListReqParams.platform = platformKey
        this.linkListReqParams.linkLevel = linkLevel ? linkLevel.toString() : ''
        this.addTableList = operationLagerDetailVOList
        // console.log('this.addTableList', this.addTableList)

        // 获取平台、店铺下拉框数据
        this.getPlatformSelectList()
        this.getStoreList()
        // 组装列表数据
        this.assemblyTableList()
        this.getLinkTableList()
      }
      this.showAddDialog = true
    },

    // 打开新增弹层
    openAddDialog() {
      this.isPlanEdit = false
      this.showAddDialog = true
      this.getLinkTableList()
    },

    // 关闭新增弹层
    closeAddDialog() {
      this.showAddDialog = false
      // 重置数据
      this.addReqParams = {
        addOperationLagerDetails: [],
        linkId: '',
        operationUuid: '',
        storeUuid: '',
        platform: '',
        linkLevel: '',
      }
      // 链接列表参数
      this.linkListReqParams = {
        page: 1,
        pageSize: 10,
        platform: '',
        storeUuid: '',
        linkLevel: '',
      }

      this.addReqParams.operationUuid = this.applyUuid

      this.showTendencyChart = false
      this.storeSelectList = []
      this.addTableList = []
      this.linkTableData = []
      this.linkTableTotal = 0

      this.getTableList()
    },

    // 关闭弹层
    closeDialog() {
      this.$emit('update:showDialog', false)
      this.$emit('update:planTime', null)
      this.$emit('getList')
    },

    // 获取平台下拉框
    async getPlatformSelectList() {
      const res = await listPlatform()
      this.platformSelectList = res.data
    },

    //获取店铺
    async getStoreList() {
      if (!this.linkListReqParams.platform) {
        return
      }
      const res = await listStoreByPlatformKey({
        platformKey: this.linkListReqParams.platform,
      })
      this.storeSelectList = res.data
    },

    // 链接列表分页
    linkPageChange(val) {
      this.linkListReqParams.page = val.page
      this.getLinkTableList()
    },

    // 获取链接列表
    async getLinkTableList() {
      this.linkTableLoading = true
      // this.linkListReqParams.platform = this.addReqParams.platform
      // this.linkListReqParams.storeUuid = this.addReqParams.storeUuid
      // this.linkListReqParams.linkLevel = this.addReqParams.linkLevel
      const [err, res] = await this.$to(getLinkList(this.linkListReqParams))
      if (res) {
        this.linkTableData = res.data.records
        this.linkTableTotal = res.data.total
      }
      this.linkTableLoading = false

      this.showTendencyChart = false
      this.tendencyChartSkuUuid = ''
      this.trendLinkId = ''
    },

    // 平台选择change事件
    platformSelectChange() {
      this.addReqParams.storeUuid = ''
      this.storeSelectList = []
      this.getStoreList()
      this.storeSelectChange()
    },

    // 店铺选择的change事件
    storeSelectChange() {
      // 默认清空数据
      this.addReqParams.linkId = ''
      this.addReqParams.linkLevel = ''
      // this.addTableList = []
      this.linkTableTotal = 0
      this.linkTableData = []
      this.getLinkTableList()
    },

    // 等级选择的change事件
    linkLevelChange() {
      // 清除商品标题和table列表
      this.addReqParams.linkId = ''
      // this.addTableList = []
      this.linkTableTotal = 0
      this.linkTableData = []

      // 获取链接列表数据
      this.getLinkTableList()
    },

    // 链接change事件
    async linkSelectChange(val) {
      if (this.addReqParams.linkId) {
        this.$confirm('是否保存上条数据', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(async () => {
            await this.clickSave('save', false)
            this.getSkuTableList(val)
          })
          .catch(() => {
            this.getSkuTableList(val)
          })
      } else {
        this.getSkuTableList(val)
      }
    },

    // 获取sku列表
    async getSkuTableList(val) {
      this.addTableLoading = true
      // 默认清空数据
      this.addTableList = []

      if (val) {
        // 暂存选中的数据
        this.selectLinkRow = val
        this.addReqParams.linkId = val.linkId
        // 获取sku的列表
        let params = {
          linkId: val.linkId,
          planTime: this.planTime,
        }
        const [err, res] = await this.$to(getSkuAddList(params))
        if (res) {
          this.addTableList = res.data
        }
        // 组装列表数据
        this.assemblyTableList()
      }

      this.addTableLoading = false
    },

    // 组装列表数据
    assemblyTableList() {
      this.addTableList.forEach((item) => {
        // if (this.isPlanEdit) {
        this.$set(item, 'thisMonthPlanQuantity', item.thisMonthPlan)
        this.$set(item, 'thisMonthPlanJinQuantity', item.thisMonthJinPlan)
        // } else {
        //   this.$set(item, 'thisMonthPlanQuantity', undefined)
        //   this.$set(item, 'thisMonthPlanJinQuantity', undefined)
        // }
      })
    },

    // 获取全量的下拉框数据
    async getLinkSkuSelectList() {
      let res = await getLinkSkuSelectList(this.skuListReqParams)
      this.skuSelectList = res.data.records
      this.skuSelectTotal = res.data.total
    },
    // 获取链接等级下拉框列表
    async getLinkLevelSelectList() {
      const res = await getLinkLevelSelectList()
      this.linkLevelSelectList = res.data // 链接等级下拉框列表
    },

    // sku下拉框弹层显示隐藏事件
    async visibleChange(flag) {
      try {
        if (!flag || (flag && this.isEdit)) {
          this.skuListReqParams.keyword = ''
          this.skuListReqParams.page = 1
          await this.getLinkSkuSelectList()
          // this.filterMethod()
        }
      } catch (error) {
        console.warn('visibleChange 处理错误:', error)
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

    // 转化时间戳为年月日
    getFormatDate(timeStamp) {
      return getFormatDate(+timeStamp)
    },
  },
}
</script>

<style lang="scss" scoped>
.add-icon {
  text-align: center;
}

.footer-btn {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.table-content {
  margin-top: 20px;
}
</style>
