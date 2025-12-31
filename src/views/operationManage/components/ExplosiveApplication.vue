<template>
  <div>
    <el-dialog
      title="打爆申请计划单"
      :visible="showDialog"
      append-to-body
      fullscreen
      @close="closeApplyDialog"
    >
      <el-button
        type="text"
        icon="el-icon-arrow-left"
        class="dialog-back-button"
        @click="closeApplyDialog"
      >返回</el-button>
      <div>
        <el-form
          :model="addReqParams"
          :rules="addRules"
          class="page-search"
          :label-position="'right'"
          label-width="140px"
          ref="importFormRef"
        >
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="申请类型：" prop="hospitalUuid">打爆采购</el-form-item>

              <el-form-item label="起始日期：" prop="startTime">
                <el-date-picker
                  class="form-item-width"
                  v-model="addReqParams.startTime"
                  type="date"
                  value-format="timestamp"
                  placeholder="选择日期"
                  @change="startTimeChange"
                ></el-date-picker>
              </el-form-item>
              <el-form-item label="申请金额（元）：" prop="applyAmount">
                <!-- <el-input  v-model="addReqParams.applyAmount"></el-input> -->
                <el-input-number
                  class="form-item-width"
                  v-model="addReqParams.applyAmount"
                  :precision="2"
                  label="请输入"
                ></el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="总周次：" prop="weekNum">
                <el-select
                  class="form-item-width"
                  v-model="addReqParams.weekNum"
                  filterable
                  clearable
                  placeholder="请选择周次"
                  @change="selectWeekNumChange"
                >
                  <el-option v-for="(item, index) in 4" :key="index" :label="item" :value="item"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="店铺：" prop="storeUuid">
                <el-select
                  class="form-item-width"
                  v-model="addReqParams.storeUuid"
                  filterable
                  clearable
                  :disabled="this.isEdit"
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
              <el-form-item label="商品标题：" prop="modelLinkId">
                <el-select
                  class="form-item-width"
                  v-model="addReqParams.modelLinkId"
                  value-key="code"
                  filterable
                  clearable
                  :disabled="this.isEdit"
                  placeholder="请选择商品标题"
                  @change="linkSelectChange"
                >
                  <el-option
                    v-for="(item, index) in linkSelectList"
                    :key="index"
                    :label="item.extendKeyword + '(' + item.name + ')'"
                    :value="{
                      code: item.code,
                      extendKeyword: item.extendKeyword,
                    }"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="计划名称：" prop="planName">
                <!-- <el-input class="form-item-width" v-model="addReqParams.planName" disabled></el-input> -->
                <div>{{ addReqParams.planName || "暂无" }}</div>
              </el-form-item>

              <el-form-item label="项目：" prop="strategyName">
                <div v-if="addReqParams.strategyName.length">
                  <span
                    v-for="(item, index) in addReqParams.strategyName"
                    :key="index"
                  >{{ item ? item + "；" : "" }}</span>
                </div>
                <div v-else>暂无</div>
              </el-form-item>
              <el-form-item label="申请说明：" prop="applyInformation">
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 4 }"
                  placeholder="请输入申请说明"
                  class="form-item-width"
                  v-model="addReqParams.applyInformation"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <el-table v-loading="skuTableLoading" border :data="skuTableList">
          <el-table-column label="产品名称" width="160" prop="spuShowName" align="center"></el-table-column>
          <el-table-column label="SKU编码" min-width="240" prop="skuCode" align="center">
            <template v-slot="{ row, $index }">
              <span v-if="!row.isAdd">
                {{
                row.specsName + "(" + row.skuCode + ")"
                }}
              </span>
              <el-select
                v-else
                v-model="row.skuUuid"
                style="width: 80%"
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
          <el-table-column label="货品分类" min-width="140" prop="categoryName" align="center"></el-table-column>

          <el-table-column
            v-for="(item, index) in addReqParams.weekNum"
            :key="`${index}-${Date.now()}-${weekName[index]}`"
            :label="weekName[index]"
            align="center"
            width="170"
          >
            <template v-slot="{ row, $index }">
              <el-input-number
                class="table-input-number"
                v-model="row.addOperationWeeksDetail[index].num"
                :precision="0"
                :min="0"
                label="请输入"
                size="small"
              ></el-input-number>
            </template>
          </el-table-column>

          <el-table-column
            v-for="(item, index) in addReqParams.weekNum"
            :key="`${index}-${Date.now()}-${weekNameJin[index]}`"
            :label="weekNameJin[index]"
            align="center"
            width="170"
          >
            <template v-slot="{ row, $index }">
              <el-input-number
                class="table-input-number"
                v-model="row.addOperationWeeksDetail[index].numByJin"
                :precision="0"
                :min="0"
                label="请输入"
                size="small"
              ></el-input-number>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="180" align="center">
            <template v-slot="{ row, $index }">
              <el-button type="text" @click="deleteSkuItem($index)">删除</el-button>
              <el-button type="text" @click="openTrendDialog(row)">趋势图</el-button>
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
        <div class="footer-btn">
          <el-button @click="closeApplyDialog">取 消</el-button>
          <el-button type="primary" @click="saveApply('save')">暂 存</el-button>
          <el-button type="primary" @click="saveApply('submit')">提 交</el-button>
        </div>
      </div>
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
} from '@/api/operationManage/common'
import {
  getSkuAddList, // 新增时获取链接下的所有sku列表（切换商品标题）
  getSkuDetail, // 获取sku详情信息
  submitBurstAuditAdd, // 提交打爆申请审核
  submitBurstAuditSave, // 暂存打爆申请
  submitBurstAuditSaveUpdate, // 暂存修改打爆申请
  getBurstApplyDetail, // 获取打爆申请的修改详情
  getLinkStrategy, // 获取链接的项目
  reapplyBurst, // 重新发起打爆申请
  submitBurstAuditUpdate, // 修改提交接口
} from '@/api/operationManage/operationApplicationRecord'
import { getLinkSelectList, listStore } from '@/api/baseData/common'
import { getFormatDate } from '@/utils/common'
import { debounce } from 'lodash'
// 趋势图组件
import OperationTrendDialog from '@/components/TrendChart/OperationTrendDialog.vue'
export default {
  name: 'ExplosiveApplication',
  components: { OperationTrendDialog },
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
    auditStatus: {
      type: Number,
      default: 0,
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
      skuUuid: '',

      // 申请的入参
      addReqParams: {
        addOperationDetails: [],
        applyAmount: undefined, // 申请金额
        applyInformation: '', // 申请说明
        linkId: '', // 链接id
        modelLinkId: '', // 数据绑定的linkId
        planName: '', // 计划名称
        startTime: '', // 起始时间
        storeUuid: '', // 店铺uuid
        weekNum: null, // 总周次
        strategyName: [], // 项目名称
        operationUuid: '',
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

      // sku的表格数据
      skuTableList: [],
      skuTableLoading: false,
      // 周数据
      addOperationWeeksDetail: [],

      // 下拉框列表
      storeSelectList: [], // 店铺
      linkSelectList: [], // 链接

      // 新增规则
      addRules: {
        startTime: [
          {
            required: true,
            message: '请选择起始时间',
            trigger: 'change',
          },
        ],
        weekNum: [
          {
            required: true,
            message: '请选择总周次',
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
        modelLinkId: [
          {
            required: true,
            message: '请选择商品标题',
            trigger: 'change',
          },
        ],
        applyInformation: [
          {
            required: true,
            message: '请输入申请说明',
            trigger: 'change',
          },
        ],
        applyAmount: [
          {
            required: true,
            message: '请输入申请金额（元）',
            trigger: 'change',
          },
        ],
      },

      // 周次的常量
      weekName: [
        '第一周本仓',
        '第二周本仓',
        '第三周本仓',
        '第四周本仓',
        '第五周本仓',
        '第六周本仓',
        '第七周本仓',
        '第八周本仓',
        '第九周本仓',
        '第十周本仓',
      ],
      weekNameJin: [
        '第一周京仓',
        '第二周京仓',
        '第三周京仓',
        '第四周京仓',
        '第五周京仓',
        '第六周京仓',
        '第七周京仓',
        '第八周京仓',
        '第九周京仓',
        '第十周京仓',
      ],
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
          // console.log('this.scrollHeight: ', this.scrollHeight)
          // console.log('this.scrollTop: ', Math.round(this.scrollTop) + 1)
          // console.log('this.clientHeight: ', this.clientHeight)

          const condition =
            this.scrollHeight - (Math.round(this.scrollTop) + 1) <=
            this.clientHeight
          // console.log('condition: ', condition)

          if (condition) binding.value()
        })
      }
    },
  },
  async created() {
    this.getStoreList()
    this.getLinkSkuSelectList()
    this.addReqParams.operationUuid = this.applyUuid
    if (this.isEdit) {
      await this.getDetail()
    }
  },

  methods: {
    /* --------------- 趋势图 --------------------------------- */
    openTrendDialog(row) {
      this.trendLinkId = this.addReqParams.modelLinkId.code
      this.trendSkuUuid = row.skuUuid
      this.showTrendChartDialog = true
    },

    // 获取详情
    async getDetail() {
      const res = await getBurstApplyDetail(this.applyUuid)
      const {
        applyAmount,
        applyExplain,
        linkId,
        linkTitle,
        planName,
        startTime,
        storeUuid,
        strategyList,
        totalWeek,
        operationListVOList,
      } = res.data
      this.addReqParams.applyAmount = applyAmount
      this.addReqParams.applyInformation = applyExplain
      this.addReqParams.modelLinkId = {
        code: linkId,
        extendKeyword: linkTitle,
      }
      this.addReqParams.planName = planName
      this.addReqParams.startTime = +startTime
      this.addReqParams.storeUuid = storeUuid
      this.addReqParams.weekNum = totalWeek
      this.addReqParams.strategyName = strategyList
      this.skuTableList = operationListVOList
      // 组装详情渲染的列表数据
      await this.assemblyDetailTableList()
      // 获取链接下拉框
      await this.getLinkSelectList()
      // console.log('res', res.data)
    },

    // 组装详情列表数据
    async assemblyDetailTableList() {
      this.addOperationWeeksDetail = []
      this.skuTableLoading = true

      // 循环周次 组装单周次数据
      for (let index = 0; index < this.addReqParams.weekNum; index++) {
        this.addOperationWeeksDetail.push({
          num: undefined,
          numByJin: undefined,
          operationSkuUuid: '',
          weeksType: index,
        })
      }

      // 将周次数据push到列表的每一项中
      this.skuTableList.forEach((item) => {
        this.$set(item, 'addOperationWeeksDetail', [])
        item.totalWeekVOList.forEach((weekItem, weekIndex) => {
          item.addOperationWeeksDetail.push({
            num: weekItem.planNum,
            numByJin: weekItem.planJinNum,
            operationSkuUuid: weekItem.operationSkuUuid,
            weeksType: weekIndex,
          })
        })
      })
      this.skuTableLoading = false
      // console.log('this.skuTableList', this.skuTableList)
    },

    // 暂存/提交
    async saveApply(type) {
      await this.$refs.importFormRef.validate()

      // 筛选出有数据的sku（
      let addOperationDetails = this.skuTableList.filter(
        (item) => item.skuUuid !== ''
      )

      // 如果没有sku数据进行提示
      if (addOperationDetails.length === 0) {
        return this.$message.error('至少添加一条SKU信息！')
      }

      let weekNumList = []
      addOperationDetails.forEach((item) => {
        weekNumList.push(...item.addOperationWeeksDetail)
      })

      // 判断是否存在周数据为空的情况
      let flag = weekNumList.some((item) => !item.num && item.num !== 0)
      let flagByJin = weekNumList.some(
        (item) => !item.numByJin && item.numByJin !== 0
      )

      if (flag || flagByJin) {
        // flag为true时 周数量存在为空的情况
        if (type === 'save') {
          this.saveTips(addOperationDetails, weekNumList)
        } else {
          this.submitApply(addOperationDetails, weekNumList, flag)
        }
      } else {
        // type为save时为暂存 submit为提交
        // type === 'save' && this.handleSave(addOperationDetails)
        if (type === 'save') {
          this.handleSave(addOperationDetails)
        } else {
          this.submitApply(addOperationDetails, weekNumList, flag)
        }
      }

      // 将处理好的新增列表的数据return出去 提交的时候用
      // return addOperationDetails
    },

    // 暂存的提示弹层
    async saveTips(addOperationDetails, weekNumList) {
      this.$confirm('周数量不能为空！是否需要将周数量为空的数据置为“0”？', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning',
        beforeClose: async (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '提交中...'
            // 组装周为空的值
            weekNumList.forEach((item) => {
              if (!item.num && item.num !== 0) {
                item.num = 0
              }
            })
            weekNumList.forEach((item) => {
              if (!item.numByJin && item.numByJin !== 0) {
                item.numByJin = 0
              }
            })

            const [err, res] = await this.$to(
              this.handleSave(addOperationDetails)
            )

            instance.confirmButtonLoading = false
            await done()
          } else {
            await done()
          }
        },
      }).catch((err) => {
        console.log('err')
      })
    },

    // 调用暂存接口
    async handleSave(addOperationDetails) {
      this.addReqParams.linkId = this.addReqParams.modelLinkId.code
      this.addReqParams.addOperationDetails = addOperationDetails
      if (this.isEdit) {
        const res = await submitBurstAuditSaveUpdate(this.addReqParams)
      } else {
        const res = await submitBurstAuditSave(this.addReqParams)
      }
      this.closeApplyDialog()
    },

    // 提交的提示弹窗
    async submitApply(addOperationDetails, weekNumList, flag) {
      // 弹层提醒是否确定提交 提交后不可修改
      this.$confirm(
        flag
          ? '周数量不能为空！是否需要将周数量为空的数据置为“0”后提交？提交后不可修改！'
          : '是否确定提交？提交后不可修改！',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          beforeClose: async (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true
              instance.confirmButtonText = '提交中...'
              if (flag) {
                // 组装周为空的值
                weekNumList.forEach((item) => {
                  if (!item.num && item.num !== 0) {
                    item.num = 0
                  }
                })
                weekNumList.forEach((item) => {
                  if (!item.numByJin && item.numByJin !== 0) {
                    item.numByJin = 0
                  }
                })
              }
              this.addReqParams.linkId = this.addReqParams.modelLinkId.code
              this.addReqParams.addOperationDetails = addOperationDetails
              let response = ''
              // 走重新发起
              if (this.auditStatus == 3) {
                const [err, res] = await this.$to(
                  reapplyBurst(this.addReqParams)
                )
                response = res
              } else if (this.isEdit) {
                // 走修改
                const [err, res] = await this.$to(
                  submitBurstAuditUpdate(this.addReqParams)
                )
                response = res
              } else {
                // 走新增
                const [err, res] = await this.$to(
                  submitBurstAuditAdd(this.addReqParams)
                )
                response = res
              }
              // 提交成功提示并关弹层
              if (response) {
                this.$message({
                  type: 'success',
                  message: '提交成功！',
                })
                this.$emit('getList')
                this.closeApplyDialog()
              }
              instance.confirmButtonLoading = false
              await done()
            } else {
              await done()
            }
          },
        }
      ).catch((err) => {
        console.log('this.$confirm catch error:', err)
      })
    },

    // 关闭弹层
    closeApplyDialog() {
      this.$emit('update:showDialog', false)
      this.$emit('getList')
      this.$refs.importFormRef.resetFields()
    },

    // sku下拉框的change
    async changeSelect(val, row, index) {
      if (!val) {
        // 删除选中的货品时 需要强刷新
        this.$forceUpdate()
        return
      }
      // await this.$refs.importFormRef.validate()
      console.log(
        'this.addReqParams.modelLinkId',
        this.addReqParams.modelLinkId
      )

      if (!this.addReqParams.startTime) {
        row.skuUuid = ''
        return this.$message.error('请选择起始日期后重新选择！')
      } else if (!this.addReqParams.modelLinkId) {
        row.skuUuid = ''
        return this.$message.error('请选择商品标题后重新选择！')
      }
      let params = {
        linkId: this.addReqParams.modelLinkId.code,
        planMonth: this.addReqParams.startTime,
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
      }
    },

    // 转化时间戳为年月日
    getFormatDate(timeStamp) {
      return getFormatDate(+timeStamp)
    },
    // 选择周次
    selectWeekNumChange(value) {
      if (!value) {
        return
      }
      // 如果有周次值并且有列表数据 则进行组装

      this.assemblyTableList()
    },

    // 组装列表数据
    async assemblyTableList() {
      this.addOperationWeeksDetail = []

      this.skuTableLoading = true

      // 循环周次 组装sku列表的周次数据
      for (let index = 0; index < this.addReqParams.weekNum; index++) {
        this.addOperationWeeksDetail.push({
          num: undefined,
          operationSkuUuid: '',
          weeksType: index,
          numByJin: undefined,
        })
      }

      // 将周次push到列表的每一项中
      this.skuTableList.forEach((item) => {
        this.$set(item, 'addOperationWeeksDetail', [])
        item.addOperationWeeksDetail.push(
          ...JSON.parse(JSON.stringify(this.addOperationWeeksDetail))
        )
      })
      this.skuTableLoading = false
      // console.log('this.skuTableList', this.skuTableList)
    },

    // 添加行数据
    addRow() {
      this.skuTableList.push({
        categoryName: '',
        categoryUuid: '',
        lastMonthPlan: 0,
        skuCode: '',
        skuUrl: '',
        skuUrlUuid: '',
        skuUuid: '',
        specsName: '',
        spuShowName: '',
        spuUuid: '',
        isAdd: true,
        addOperationWeeksDetail: JSON.parse(
          JSON.stringify(this.addOperationWeeksDetail)
        ),
      })
    },

    // 删除单行sku
    deleteSkuItem(index) {
      this.skuTableList.splice(index, 1)
    },

    //获取店铺
    async getStoreList() {
      const res = await listStore()
      this.storeSelectList = res.data
    },

    // 店铺选择的change事件
    storeSelectChange(val) {
      // 默认清空数据
      this.addReqParams.linkId = ''
      this.addReqParams.modelLinkId = ''
      this.linkSelectList = []
      this.addReqParams.addOperationDetails = []
      this.skuTableList = []
      this.addReqParams.strategyName = []
      if (val) {
        // console.log('val', val)
        this.getLinkSelectList()
      }
    },
    // 开始日期change事件
    startTimeChange(val) {
      // console.log('val', val)
      if (val && this.addReqParams.modelLinkId) {
        this.addReqParams.planName =
          this.addReqParams.modelLinkId.extendKeyword +
          this.getFormatDate(val) +
          '打爆计划'
      }
    },

    // 链接change事件
    async linkSelectChange(val) {
      this.skuTableLoading = true
      // 默认清空数据
      this.addReqParams.addOperationDetails = []
      this.skuTableList = []
      this.addReqParams.strategyName = []
      this.addReqParams.planName = ''

      if (val) {
        // 组装打爆计划名称
        if (this.addReqParams.startTime) {
          this.addReqParams.planName =
            this.getFormatDate(this.addReqParams.startTime) +
            val.extendKeyword +
            '(' +
            val.code +
            ')' +
            '打爆计划'
        }

        // 组装获取sku列表入参
        let params = {
          linkId: val.code,
          // 这个字段必须有值 防止后端接口报错（可以是随便一个时间戳）
          planTime: this.addReqParams.startTime || '1735660800000',
        }
        // 获取sku的列表
        const [err, res] = await this.$to(getSkuAddList(params))
        if (res) {
          console.log('res', res.data)
          this.skuTableList = res.data
        }

        // 组装列表数据
        await this.assemblyTableList()

        // 获取链接下的项目
        const strategyRes = await getLinkStrategy(val.code)
        this.addReqParams.strategyName = strategyRes.data
      }

      this.skuTableLoading = false
    },

    // 获取链接下拉框列表
    async getLinkSelectList() {
      const res = await getLinkSelectList({
        storeUuidList: [this.addReqParams.storeUuid],
      })
      this.linkSelectList = res.data
    },

    // 获取全量的下拉框数据
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
  },
}
</script>

<style lang="scss" scoped>
.form-item-width {
  width: 20vw;
}

.add-icon {
  text-align: center;
}

.table-input-number {
  width: 140px;
}

.footer-btn {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
