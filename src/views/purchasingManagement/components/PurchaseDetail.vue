<template>
  <div>
    <div>
      <!-- 内容 -->
      <div class="content">
        <el-form>
          <el-form-item label="采购时间:" class="form-item">{{ getFormaMonth(propsData.purchaseTime) }}</el-form-item>
          <el-form-item label="采购状态:" class="form-item">
            {{
            propsData.purchaseStatus == 1
            ? "新品下单"
            : propsData.purchaseStatus == 2
            ? "正常采购"
            : "追加采购"
            }}
          </el-form-item>
          <el-form-item label="采购说明:" class="form-item">
            <el-input
              type="textarea"
              class="input-width"
              :rows="2"
              placeholder="请输入内容"
              v-model="purchaseDescribe"
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
      <!-- 表格 -->
      <div>
        <el-table max-height="480" border :data="orderList" @row-click="getTrendData">
          <el-table-column prop="date" label="序号" width="75" type="index" align="center"></el-table-column>
          <el-table-column prop="spuShowName" label="产品名称" width="180" align="center"></el-table-column>
          <el-table-column prop="categoryName" show-overflow-tooltip label="货品分类" align="center"></el-table-column>
          <el-table-column prop min-width="230" label="SKU编码" align="center">
            <template slot-scope="scope">
              <el-select
                v-if="scope.row.skuType == 1"
                v-model="scope.row.skuUuid"
                filterable
                placeholder="请选择SKU编码"
                style="width: 100%"
                :filter-method="filterMethod"
                @change="getSkuInfoById(scope)"
                @visible-change="visibleChange"
                v-el-select-loadmore="loadMore"
                :loading="selectLoading"
              >
                <el-option
                  v-for="(item, index) in skuList"
                  :key="item.code"
                  :label="`${item.extendKeyword}(${item.name})`"
                  :value="item.code"
                ></el-option>
              </el-select>
              <span v-if="scope.row.skuType != 1">{{ scope.row.specsName }}({{ scope.row.skuCode }})</span>
            </template>
          </el-table-column>
          <el-table-column label="SKU图片" align="center">
            <template v-slot="{ row, $index }">
              <el-image
                v-if="row.skuUrl"
                style="height: 30px"
                :src="
                  row.skuUrl + '?x-oss-process=image/resize,w_30,h_30,limit_0'
                "
                :preview-src-list="[row.skuUrl]"
              ></el-image>
            </template>
          </el-table-column>
          <el-table-column label="供应商" min-width="120" align="center">
            <template v-slot="{ row, $index }">
              <div class="supplier">
                <el-select
                  v-if="row.supplierType == 1"
                  v-model="row.mainSupplier"
                  placeholder="请选择供应商"
                  filterable
                  @change="getInfoBySupplier(row, $index)"
                >
                  <el-option
                    v-for="item in row.otherSupplier"
                    :key="item.uuid"
                    :label="item.supplierName"
                    :value="item.uuid"
                  ></el-option>
                </el-select>
                <div
                  v-if="row.supplierType == undefined || row.supplierType == 2"
                  class="supplier-name"
                >
                  <span>{{ row.mainSupplierName }}</span>
                  <el-button type="text" size="small" @click="choseSupplier(row)">选择</el-button>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="applyPlanNum" width="80" label="本月本地复核数量" align="center">
            <template slot-scope="scope">
              <el-button
                v-if="
                  scope.row.applyPlanNum != null && scope.row.applyPlanNum != 0
                "
                type="text"
                size="small"
                @click="
                  getPurchaseDetails(scope.row.skuUuid, scope.row.nowMonth)
                "
              >{{ scope.row.applyPlanNum }}</el-button>
              <span v-if="scope.row.applyPlanNum == 0">0</span>
              <span v-if="scope.row.applyPlanNum == null">-</span>
            </template>
          </el-table-column>

          <el-table-column prop="applyPlanNum" width="80" label="本月京仓复核数量" align="center">
            <template slot-scope="scope">
              <el-button
                v-if="
                  scope.row.applyJinPlanNum != null &&
                  scope.row.applyJinPlanNum != 0
                "
                type="text"
                size="small"
                @click="
                  getPurchaseDetails(scope.row.skuUuid, scope.row.nowMonth)
                "
              >{{ scope.row.applyJinPlanNum }}</el-button>
              <span v-if="scope.row.applyJinPlanNum == 0">0</span>
              <span v-if="scope.row.applyJinPlanNum == null">-</span>
            </template>
          </el-table-column>

          <el-table-column label="上月本地复核数量" width="80" align="center">
            <template slot-scope="scope">
              <el-button
                v-if="
                  scope.row.lastApplyPlanNum != null &&
                  scope.row.lastApplyPlanNum != 0
                "
                type="text"
                size="small"
                @click="
                  getPurchaseDetails(scope.row.skuUuid, scope.row.lastMonth)
                "
              >{{ scope.row.lastApplyPlanNum }}</el-button>
              <span v-if="scope.row.lastApplyPlanNum == 0">0</span>
              <span v-if="scope.row.lastApplyPlanNum == null">-</span>
            </template>
          </el-table-column>
          <el-table-column label="上月京仓复核数量" width="80" align="center">
            <template slot-scope="scope">
              <el-button
                v-if="
                  scope.row.lastApplyJinPlanNum != null &&
                  scope.row.lastApplyJinPlanNum != 0
                "
                type="text"
                size="small"
                @click="
                  getPurchaseDetails(scope.row.skuUuid, scope.row.lastMonth)
                "
              >{{ scope.row.lastApplyJinPlanNum }}</el-button>
              <span v-if="scope.row.lastApplyJinPlanNum == 0">0</span>
              <span v-if="scope.row.lastApplyJinPlanNum == null">-</span>
            </template>
          </el-table-column>
          <el-table-column label="下月本地复核数量" width="80" align="center">
            <template slot-scope="scope">
              <el-button
                v-if="
                  scope.row.nextMonthNum != null && scope.row.nextMonthNum != 0
                "
                type="text"
                size="small"
                @click="
                  getPurchaseDetails(scope.row.skuUuid, scope.row.nextMonth)
                "
              >{{ scope.row.nextMonthNum }}</el-button>
              <span v-if="scope.row.nextMonthNum == 0">0</span>
              <span v-if="scope.row.nextMonthNum == null">-</span>
            </template>
          </el-table-column>
          <el-table-column label="下月京仓复核数量" width="80" align="center">
            <template slot-scope="scope">
              <el-button
                v-if="
                  scope.row.nextMonthJinNum != null &&
                  scope.row.nextMonthJinNum != 0
                "
                type="text"
                size="small"
                @click="
                  getPurchaseDetails(scope.row.skuUuid, scope.row.nextMonth)
                "
              >{{ scope.row.nextMonthJinNum }}</el-button>
              <span v-if="scope.row.nextMonthJinNum == 0">0</span>
              <span v-if="scope.row.nextMonthJinNum == null">-</span>
            </template>
          </el-table-column>
          <el-table-column label="实际采购数量" align="center">
            <template #default="{ row }">
              <el-input
                v-model="row.purchaseQuantity"
                oninput="value=value.replace(/^0+(\d)|[^\d]+/g,'')"
                placeholder="请输入采购数量"
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="productionNumber" label="生产周期" align="center"></el-table-column>
          <el-table-column prop="predictRemainDay" label="预测剩余销售天数" width="80" align="center"></el-table-column>
          <el-table-column prop="stockNum" label="仓库库存" align="center"></el-table-column>
          <el-table-column prop="supplierStockNum" label="工厂库存" align="center"></el-table-column>
          <el-table-column label="操作" align="center">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click.stop="splitList(scope)">拆分</el-button>
              <el-button type="text" size="small" @click.stop="deleteList(scope)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="add-btn">
          <i
            class="el-icon-circle-plus-outline"
            style="font-size: 24px; color: #1e98d7"
            @click="addPurchase"
          ></i>
        </div>
      </div>
      <ApplicationPlanDialog :visible.sync="planDialogVisible" :data="planData"></ApplicationPlanDialog>
    </div>
    <TendencyChart v-if="showTendencyChart" :skuUuid.sync="skuUuid" :title.sync="trendTitle"></TendencyChart>
  </div>
</template>

<script>
import { getFormaMonth, getFormatDate } from '@/utils/common'
import {
  getSkuListPush,
  getSkuInfo,
  getPurchaseDetail,
  getSupplierStockList,
  getProductionCycleList,
} from '@/api/purchasingManagement/purchaseRecordDetails'
import { debounce } from 'lodash'
import TendencyChart from '@/components/TrendChart/TendencyChart'
import { getLineChart } from '@/api/purchasingManagement/common'
import ApplicationPlanDialog from './ApplicationPlanDialog'
export default {
  name: 'PurchaseDetail',
  props: {
    propsData: {
      type: Object,
      required: true,
    },
    addPurchaseOrderLists: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      // 采购时间
      purchaseTime: '',
      // 采购列表
      orderList: [],
      // 采购说明
      purchaseDescribe: '',
      // sku下拉框
      skuList: [],
      // sku下拉框加载
      selectLoading: false,
      // sku全部数量
      skuTotal: 0,
      // sku请求参数
      skuParams: {
        keyword: '',
        page: 1,
        pageSize: 10,
      },
      // 控制是否加载下一页
      selectFlag: true,
      orderOut: {},
      // 运营详情弹窗
      planDialogVisible: false,
      // 运营详情数据
      planData: [],
      option: [],
      // 趋势图标题
      trendTitle: '',
      // 传递的skuUuid
      skuUuid: '',

      // 展示趋势图
      showTendencyChart: false,
    }
  },
  components: {
    ApplicationPlanDialog,
    TendencyChart,
  },
  created() {
    this.orderList = []
    this.orderList = this.addPurchaseOrderLists
    this.purchaseDescribe = this.propsData.purchaseDescribe
    this.getSkuList()
    // this.getSkuListByOrder()
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
  methods: {
    // 获取月
    getFormaMonth(time) {
      return getFormaMonth(time)
    },
    getFormatDate(time) {
      return getFormatDate(time)
    },
    // 拆分
    splitList(scope) {
      // console.log(scope.index)
      let cloneItem = structuredClone(scope.row)
      cloneItem.purchaseQuantity = ''
      cloneItem.purchaseDetailUuid = ''
      this.orderList.splice(scope.$index + 1, 0, cloneItem)
    },
    // // 打开时获取选中数据的skuUuid对应值
    // async getSkuListByOrder() {
    //   this.orderList.map(item =>{
    //     item.skuCodeName = item.specsName + '(' + item.skuCode + ')'
    //   })
    // },
    // 获取sku列表
    async getSkuList() {
      this.selectLoading = true
      const res = await getSkuListPush(this.skuParams)
      this.skuList = res.data.records
      this.skuTotal = res.data.total
      this.selectLoading = false
    },
    // 下拉框出现时，调用过滤方法
    async visibleChange(flag) {
      this.skuParams.keyword = ''
      this.skuParams.page = 1
      if (flag) {
        await this.getSkuList()
      }
    },
    filterMethod: debounce(async function (filterVal) {
      this.skuParams.page = 1
      this.selectLoading = true
      this.skuParams.keyword = filterVal ? filterVal : ''
      await this.getSkuList()
      this.selectFlag = true
      this.selectLoading = false
    }, 500),

    // sku下拉框加载更多
    async loadMore() {
      // const res = this.orderList.map( obj => this.skuList.includes(obj.skuUuid))
      if (this.skuList.length < this.skuTotal && this.selectFlag) {
        this.skuParams.page += 1
        this.selectFlag = false
        let res1 = await getSkuListPush(this.skuParams)
        if (this.skuParams.page == 1) {
          this.skuList = []
        }
        res1.data.records.forEach((item) => {
          this.skuList.push(item)
        })
        this.skuTotal = res1.data.total
        this.selectFlag = true
        // console.log('this.reissueArrName', this.reissueArrName)
      }
    },
    // 根据sku获取信息
    async getSkuInfoById(scope) {
      let res = await getSkuInfo({
        skuUuid: scope.row.skuUuid,
        purchaseTime: this.propsData.purchaseTime,
      })
      res.data.skuType = 1
      this.$set(this.orderList, scope.$index, res.data)
    },
    // 删除
    deleteList(scope) {
      this.orderList.splice(scope.$index, 1)
      this.option = {}
    },
    // 传值给父组件
    orderOutput() {
      const res = this.orderList.map((item) => ({
        skuUuid: item.skuUuid,
        supplierUuid: item.mainSupplier,
        purchaseQuantity: item.purchaseQuantity,
        purchaseDetailUuid:
          item.purchaseDetailUuid == undefined ? '' : item.purchaseDetailUuid,
      }))
      this.orderOut = {
        addPurchaseOrderLists: res,
        purchaseDescribe: this.purchaseDescribe,
        purchaseTime: this.propsData.purchaseTime,
        purchaseStatus: this.propsData.purchaseStatus,
      }
      this.$emit('update', this.orderOut)
    },
    // 获取运营详情并传值给弹窗
    async getPurchaseDetails(id, time) {
      const res = await getPurchaseDetail({ monthTime: time, skuUuid: id })
      this.planData = res.data
      this.planDialogVisible = true
    },
    // 新增
    addPurchase() {
      this.orderList.push({ skuType: 1 })
    },
    // 获取趋势图数据
    async getTrendData(row) {
      this.trendTitle = `(${row.skuCode})${row.specsName}销售趋势图`
      if (row.skuUuid == undefined) {
        this.skuUuid = ''
        this.option = {}
        return
      }
      this.showTendencyChart = true
      this.skuUuid = row.skuUuid
    },
    // 根据供应商获取库存和生产周期
    async getInfoBySupplier(row, indx) {
      const res = await getSupplierStockList({
        skuUuid: row.skuUuid,
        supplierUuid: row.mainSupplier,
      })
      const res1 = await getProductionCycleList({
        skuUuid: row.skuUuid,
        supplierUuid: row.mainSupplier,
      })
      this.$set(this.orderList, indx, {
        ...row,
        supplierStockNum: res.data,
        productionNumber: res1.data,
      })
    },
    // 点击选择出现供应商下拉框
    choseSupplier(row) {
      this.$set(row, 'supplierType', 1)
    },
  },
}
</script>

<style scoped>
.container {
  padding: 40px;
}
.content {
  margin-bottom: 20px;
}
.stat-item {
  display: flex;
  align-items: flex-start; /* 确保所有元素从顶部开始对齐 */
  margin: 10px 0;
}

.input-width {
  width: 300px;
}
.add-btn {
  text-align: center; /* 水平居中 */
}
.supplier-name {
  display: flex;
  justify-content: space-between;
}
</style>
