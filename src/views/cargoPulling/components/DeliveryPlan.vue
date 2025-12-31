<template>
  <div class="container">
    <el-dialog
      :visible.sync="dialogVisible"
      append-to-body
      @close="closeDialog()"
      :fullscreen="true"
    >
      <el-button
        type="text"
        icon="el-icon-arrow-left"
        class="dialog-back-button"
        @click="closeDialog"
      >返回</el-button>
      <div slot="title">拉货计划</div>
      <div class="page-search">
        <el-form :inline="true" :model="propsData" class="demo-form-inline">
          <el-form-item label="拉货时间：">{{ getFormaMonth(Number(propsData.ofldTime)) }}</el-form-item>
          <el-form-item label="拉货仓库：">
            <el-select v-model="reqParams.ofldWarehouseUuid" filterable placeholder="请选择">
              <el-option
                v-for="item in pullList"
                :key="item.code"
                :label="item.name"
                :value="item.code"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="到货仓库：">
            <el-select v-model="reqParams.deliveryWarehouseUuid" filterable placeholder="请选择">
              <el-option
                v-for="item in dispatchList"
                :key="item.code"
                :label="item.name"
                :value="item.code"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submit()">提交</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table
        border
        v-loading="loading"
        :data="OfldOrderList"
        center
        :row-style="rowStyle"
        @row-click="handleCurrentChange"
        style="width: 100%"
        height="480"
      >
        <!-- max-height="480" -->
        <el-table-column prop="date" label="序号" min-width="25" type="index" align="center"></el-table-column>
        <el-table-column label="SKU编码" min-width="200" align="center">
          <template slot-scope="scope">
            <el-select
              v-if="scope.row.skuType == 1"
              style="width: 100%;"
              v-model="scope.row.skuUuid"
              filterable
              :filter-method="filterMethod"
              @change="getSupplierList(scope)"
              @visible-change="visibleChange"
              v-el-select-loadmore="loadMore"
              :loading="selectLoading"
            >
              <el-option
                v-for="(item,index) in skuList"
                :key="item.code"
                :label="`${item.extendKeyword}(${item.name})`"
                :value="item.code"
              ></el-option>
            </el-select>
            <span v-if="scope.row.skuType != 1">{{ scope.row.specsName }}({{ scope.row.skuCode }})</span>
          </template>
        </el-table-column>
        <el-table-column prop="spuShowName" label="产品名称" align="center"></el-table-column>
        <el-table-column prop="supplierName" label="供应商" min-width="130" align="center">
          <template v-slot="{row, $index }">
            <el-select
              v-model="row.supplierUuid"
              placeholder="请选择"
              @change="getInfoBySupplier(row,$index)"
            >
              <el-option
                v-for="item in row.otherSupplier"
                :key="item.uuid"
                :label="item.supplierName"
                :value="item.uuid"
              ></el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="SKU图片" align="center">
          <template v-slot="{ row, $index }">
            <el-image
              v-if="row.skuUrl"
              style="height: 30px; width: 30px"
              :src="row.skuUrl + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
              :preview-src-list="[row.skuUrl]"
            ></el-image>
          </template>
        </el-table-column>
        <el-table-column label="下下月备货量" min-width="70" align="center">
          <template v-slot="{row}">
            <el-input
              v-model="row.stockUpQuantity"
              oninput="value=value.replace(/^0+(\d)|[^\d]+/g,'')"
              placeholder="请输入采购数量"
            ></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="productionCycle" width="90" label="生产周期" align="center"></el-table-column>
        <el-table-column prop="stockNum" label="仓库库存" align="center"></el-table-column>
        <el-table-column prop label="总仓库库存" width="90" align="center">
          <template v-slot="{row}">
            <el-button
              type="text"
              size="small"
              @click="warehouseInventoryList(row.skuUuid)"
            >{{row.allStock}}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="supplierStockNum" label="工厂库存" align="center"></el-table-column>
        <el-table-column prop="predictRemainDay" label="预测剩余销售天数" width="80" align="center"></el-table-column>
        <el-table-column label="操作" align="center" width="210">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              v-if="scope.row.skuUuid != null"
              @click="jumpToSkuDate(scope.row)"
            >SKU看板</el-button>
            <el-button
              type="text"
              size="small"
              v-if="scope.row.skuUuid != null"
              @click="openSalesDialog(scope.row)"
            >销量</el-button>
            <el-button
              type="text"
              size="small"
              v-if="scope.row.skuUuid != null"
              @click="getPurchaseDetails(scope.row.skuUuid)"
            >运营计划</el-button>
            <el-button
              type="text"
              size="small"
              v-if="scope.row.ofldPlanList ? (scope.row.ofldPlanList.every(item => item.lastOfldTime == false || item.lastOfldTime == undefined) ? true : false)  : true "
              @click="deleteList(scope,$event)"
            >删除</el-button>
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

      <el-table :data="testList" v-if="selectIndex != -1">
        <el-table-column
          align="center"
          v-for="(item,index) in ofldPlanList"
          :key="index"
          :label="getFormatDate(item.ofldTime)"
        >
          <el-table-column label="拉货数量" align="center">
            <template #default="{ row }">
              <el-input
                :disabled="item.lastOfldTime"
                oninput="value=value.replace(/^0+(\d)|[^\d]+/g,'')"
                v-model="ofldPlanList[index].planOfldQuantity"
                placeholder="请输入"
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column label="几天后到货" width="100" align="center">
            <template #default="{ row }">
              <el-input
                :disabled="item.lastOfldTime"
                oninput="value=value.replace(/^0+(\d)|[^\d]+/g,'')"
                v-model="ofldPlanList[index].planGoodsArrrivedTime"
                placeholder="请输入"
              ></el-input>
            </template>
          </el-table-column>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer"></div>
    </el-dialog>
    <el-dialog title="销量" append-to-body :visible.sync="salesDialogVisible" width="80%">
      <el-form :inline="true">
        <el-form-item label="时间范围：">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            align="right"
            unlink-panels
            value-format="timestamp"
            @blur="blurTime"
            :picker-options="pickerOptions"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="getSalesVolumeList()">查询</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="salesList" v-loading="salesLoading">
        <el-table-column prop="realSales" align="center"></el-table-column>
        <el-table-column
          v-for="(item,index) in salesData"
          min-width="100"
          :key="index"
          :label="getFormatDate(item.orderTime)"
          align="center"
        >
          <span>{{ item.actualSales }}</span>
        </el-table-column>
      </el-table>
    </el-dialog>
    <ApplicationPlanDialog :visible.sync="planDialogVisible" :data="planData"></ApplicationPlanDialog>
    <InventoryDetails ref="InventoryDetails" :tableData="warehouseList"></InventoryDetails>

    <!-- sku看板 -->
    <el-dialog
      :title="productTitle"
      @close="productStatusSku"
      :visible.sync="productShowSku"
      width="96%"
      show-close
      append-to-body
    >
      <product-sku
        v-if="productShowSku"
        :currentRow="searchParms"
        :selectSpuChange="selectSpuChangeToSku"
        :selectSkuChange="selectSkuChangeToSku"
      ></product-sku>
    </el-dialog>
  </div>
</template>

<script>
import { getFormaMonth, getFormatDate, addDay, addDayEnd } from '@/utils/common'
// import{getSupplierList,getProductNameList,getSkuList,category,systemData} from '@/api/cargoPulling/common'
import {
  getArrivalWarehouseList,
  systemData,
  getPullingWarehouseList,
  warehouseInventoryList,
} from '@/api/cargoPulling/common'
import {
  getSkuListPush,
  getSupplierList,
  getSupplierStockList,
  pullingOrder,
  pullingOrderUpdate,
  getSaleNum,
  getPurchaseDetail,
  getProductionCycleList,
} from '@/api/cargoPulling/cargoRecordDetail'
import InventoryDetails from '@/components/InventoryDetails'
import ApplicationPlanDialog from '../components/ApplicationPlanDialog'
import { debounce } from 'lodash'
import ProductSku from '@/views/bulletinboard/components/ProductSku.vue'
export default {
  name: 'DeliveryPlan',
  props: {
    orderLists: {
      type: Array,
      default: () => [],
    },
    propsData: {
      type: Object,
      default: () => {},
    },
    isNext: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      dialogVisible: false,
      // 到货仓库下拉
      dispatchList: [],
      // 拉货仓库下拉
      pullList: [],
      // 请求参数
      reqParams: {
        ofldMonth: '',
        deliveryWarehouseUuid: 'MM_STOCK_ONLY',
        ofldWarehouseUuid: '3',
        ofldUuid: '',
      },
      // 仓库列表数据
      warehouseList: [],
      //
      status: 0,
      loading: false,
      OfldOrderList: [],
      // sku列表
      skuList: [],
      // 搜索加载
      selectLoading: false,
      // sku全部值
      skuTotal: 0,
      // sku下拉加载更多状态
      selectFlag: true,
      // sku请求参数
      skuParams: {
        keyword: '',
        page: 1,
        pageSize: 10,
      },
      // 月数据表格
      ofldPlanList: [],
      testList: [1],
      // 选择行的索引值
      selectIndex: -1,
      // 销量弹奏
      salesDialogVisible: false,
      // 销量请求参数
      salesParams: {
        endTime: '',
        skuUuid: '',
        startTime: '',
      },
      // 销量数据
      salesData: [],
      // 日期数组
      dateRange: [],
      // 销量单行控制
      salesList: [{ realSales: '实际销量' }],
      // 运营计划弹窗
      planDialogVisible: false,
      planData: [],
      lastOfldTime: 0,

      // 看板数据
      // sku看板title
      productTitle: '',
      // sku下拉框是否可以更改
      selectSkuChangeToSku: false,
      // spu下拉框是否可以更改
      selectSpuChangeToSku: false,

      // 看板参数
      searchParms: {
        from: null, //入口来源
        timeScopeArr: [], //时间范围数组
        timeScopeType: 2, //时间范围类型
        spu: {
          spuUuid: [], //spu uuid
          spuNameArr: [], //spu名称数组
        },
        sku: {
          skuUuid: [], //sku uuid
          skuCode: [], //sku编码
          skuNameArr: [], //sku名称数组
          skuCodeArr: [], //sku编码数组
        },
      },
      productShowSku: false,
      // 时间数组
      timeArr: [],
      // 销量列表加载
      salesLoading: false,
      pickerOptions: {
        onPick: ({ maxDate, minDate }) => {
          // 把选择的第一个日期赋值给一个变量。
          this.choiceDate = minDate.getTime()
          // 如何你选择了两个日期了，就把那个变量置空
          if (maxDate) this.choiceDate = ''
        },
        disabledDate: (time) => {
          // 如何选择了一个日期
          if (this.choiceDate) {
            // 7天的时间戳
            const one = 7 * 24 * 3600 * 1000
            // 当前日期 - one = 7天之前
            const minTime = this.choiceDate - one
            // 当前日期 + one = 7天之后
            const maxTime = this.choiceDate + one
            return (
              time.getTime() < minTime ||
              time.getTime() > maxTime ||
              // 限制不能选择今天及以后
              time.getTime() > Date.now()
            )
          } else {
            // 如果没有选择日期，就要限制不能选择今天及以后
            return time.getTime() > Date.now()
          }
        },
      },
    }
  },
  components: { InventoryDetails, ApplicationPlanDialog, ProductSku },
  created() {
    this.getArrivalWarehouseList()
    this.getPullingWarehouseList()
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
    async openDialog() {
      this.OfldOrderList = JSON.parse(JSON.stringify(this.orderLists))
      // console.log(this.OfldOrderList)
      // this.getCurrentTime()
      this.getDaysInMonth()
      this.getSkuList()
      // this.getSkuListByOrder()

      if (this.propsData.status == 1) {
        this.status = 1
      } else {
        this.status = 0
        this.reqParams.deliveryWarehouseUuid =
          this.propsData.deliveryWarehouseUuid
        this.reqParams.ofldWarehouseUuid = this.propsData.ofldWarehouseUuid
        this.reqParams.ofldUuid = this.propsData.ofldUuid
      }
      this.dialogVisible = true
    },
    closeDialog() {
      this.dialogVisible = false
      this.selectIndex = -1
      this.ofldPlanList = []
      this.OfldOrderList = []
      this.reqParams = this.$options.data().reqParams
      this.$emit('modalClosed')
    },
    getFormaMonth(timestamp) {
      return getFormaMonth(timestamp)
    },
    getFormatDate(timestamp) {
      return getFormatDate(timestamp)
    },
    async getArrivalWarehouseList() {
      const res = await getArrivalWarehouseList()
      this.dispatchList = res.data
    },
    async getPullingWarehouseList() {
      const res = await getPullingWarehouseList()
      this.pullList = res.data
    },
    // 获取sku列表
    async getSkuList() {
      this.selectLoading = true
      const res = await getSkuListPush(this.skuParams)
      this.skuList = res.data.records
      this.skuTotal = res.data.total
      this.selectLoading = false
    },
    //     // 打开时获取选中数据的skuUuid对应值
    // async getSkuListByOrder() {
    //   this.OfldOrderList.map(item =>{
    //     item.skuCodeName = item.specsName + '(' + item.skuCode + ')'
    //   })
    // },
    // 下拉框出现时，调用过滤方法
    async visibleChange(flag) {
      this.skuParams.keyword = ''
      this.skuParams.page = 1
      if (flag) {
        await this.getSkuList()
      }
      // this.filterMethod()
    },
    filterMethod: debounce(async function (filterVal) {
      this.skuParams.page = 1
      // console.log('filterVal: ', filterVal)
      this.selectLoading = true
      this.skuParams.keyword = filterVal ? filterVal : ''
      await this.getSkuList()
      this.selectFlag = true
      this.selectLoading = false
    }, 500),

    // sku下拉框加载更多
    async loadMore() {
      const res = this.OfldOrderList.map((obj) =>
        this.skuList.includes(obj.skuUuid)
      )
      if (
        (this.skuList.length < this.skuTotal && this.selectFlag) ||
        (this.skuList.length < this.skuTotal && !res)
      ) {
        this.skuParams.page += 1
        this.selectFlag = false
        let res1 = await getSkuListPush(this.skuParams)
        if (this.skuParams.page == 1) {
          this.skuList = []
        }
        res1.data.records.forEach((item) => {
          if (!this.skuList.includes(item.skuUuid)) {
            this.skuList.push(item)
          }
        })
        this.skuTotal = res1.data.total

        this.selectFlag = true
        // console.log('this.reissueArrName', this.reissueArrName)
      }
    },
    // 时间选择失焦时将startPickerTime置空 目的是清除禁用的时间范围
    blurTime() {
      this.startPickerTime = ''
    },
    // 仓库记录
    async warehouseInventoryList(id) {
      const res = await warehouseInventoryList(id)
      this.warehouseList = res.data
      this.$refs.InventoryDetails.openDialog()
    },
    // 获取销量表格
    async getSalesVolumeList() {
      this.salesLoading = true
      this.salesData = []
      if (this.dateRange.length > 0) {
        this.salesParams.startTime = this.dateRange[0]
        this.salesParams.endTime = this.dateRange[1]
      }
      const res = await getSaleNum(this.salesParams)
      this.salesData = res.data
      this.salesLoading = false
    },
    openSalesDialog(row) {
      this.salesParams.skuUuid = row.skuUuid
      let date = Date.now()
      this.salesParams.startTime = date - 7 * 24 * 60 * 60 * 1000
      this.salesParams.endTime = date
      this.dateRange = [this.salesParams.startTime, this.salesParams.endTime]
      this.getSalesVolumeList()
      this.salesDialogVisible = true
    },
    // 打开运营计划弹窗
    async getPurchaseDetails(id) {
      const monthTime = this.propsData.ofldTime
      const res = await getPurchaseDetail({ monthTime: monthTime, skuUuid: id })
      this.planData = res.data
      this.planDialogVisible = true
    },
    // 拆分
    splitList(scope) {
      // console.log(scope.index)
      let cloneItem = structuredClone(scope.row)
      // console.log(cloneItem)
      cloneItem.stockUpQuantity = ''
      cloneItem.ofldSupplierUuid = ''
      cloneItem.supplierUuid = ''
      if (cloneItem.ofldPlanList) {
        cloneItem.ofldPlanList.map((item) => {
          item.ofldPlanDetailUuid = ''
          item.planGoodsArrrivedTime = null
          item.planOfldQuantity = null
        })
      }
      this.OfldOrderList.splice(scope.$index + 1, 0, cloneItem)
    },
    // 删除
    deleteList(scope, event) {
      event.stopPropagation()
      if (scope.row.deleteTypeSign == true) {
        return this.$message.error(
          '当前sku已经存在拉货计划确认单，无法删除数据'
        )
      }
      this.saveData()
      this.selectIndex = -1
      this.OfldOrderList.splice(scope.$index, 1)
    },
    // 获取当前时间
    //  async getCurrentTime(){
    //   const res = await systemData()
    //   // console.log(res)
    //   const date = new Date(res.data)
    //   date.setMonth(date.getMonth()+1)
    //   this.reqParams.ofldMonth = Number(Date.parse(date))

    // },
    // 根据月份获取数组
    async getDaysInMonth() {
      // const res = await systemData()
      // console.log(res)
      const date = new Date(+this.propsData.ofldTime)
      date.setMonth(date.getMonth())
      this.reqParams.ofldMonth = Number(Date.parse(date))

      const year = date.getFullYear()
      const month = date.getMonth()
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      let days = new Date(year, month, 1).getTime()
      const daysArray = Array.from({ length: daysInMonth }, (_, i) => ({
        ofldTime: days + 86400000 * i,
        planGoodsArrrivedTime: null,
        planOfldQuantity: null,
      }))
      this.ofldPlanList = daysArray
    },
    // 新增
    addPurchase() {
      this.OfldOrderList.push({ skuType: 1 })
      window.onload = function () {
        window.scrollTo(0, document.body.scrollHeight)
      }
    },
    // 获取供应商下拉
    async getSupplierList(scope) {
      let res = await getSupplierList(scope.row.skuUuid)
      res.data.skuType = 1
      this.$set(this.OfldOrderList, scope.$index, res.data)
    },
    async getInfoBySupplier(row, index) {
      const res = await getSupplierStockList({
        skuUuid: row.skuUuid,
        supplierUuid: row.supplierUuid,
      })
      const res1 = await getProductionCycleList({
        skuUuid: row.skuUuid,
        supplierUuid: row.supplierUuid,
      })
      row.supplierStockNum = res.data
      row.productionCycle = res1.data
      // this.$set(this.OfldOrderList,index,{...row,supplierStockNum:res.data})
    },
    // 点击切换行
    handleCurrentChange(row) {
      if (row.skuUuid == '' || row.skuUuid == undefined) {
        return this.$message.error('请先选择sku')
      }
      this.saveData()
      this.lastOfldTime = row.lastOfldTime
      this.selectIndex = this.OfldOrderList.indexOf(row)
      if (row.ofldPlanList) {
        this.ofldPlanList = JSON.parse(JSON.stringify(row.ofldPlanList))
      }
      // console.log(this.OfldOrderList)
    },
    // 存储数据
    saveData() {
      // console.log(this.OfldOrderList)
      if (this.selectIndex == -1 || this.OfldOrderList.length == 0) {
        return false
      }
      this.OfldOrderList[this.selectIndex].ofldPlanList = JSON.parse(
        JSON.stringify(this.ofldPlanList)
      )
      this.ofldPlanList.forEach((item) => {
        ;(item.planGoodsArrrivedTime = null), (item.planOfldQuantity = null)
        ;(item.ofldPlanDetailUuid = null), (item.lastOfldTime = false)
      })
      this.selectIndex = -1
      // console.log(this.ofldPlanList)
    },
    // 新增提交
    async addSubmit() {
      const res = await pullingOrder(this.reqParams)
      if ((res.data = true)) {
        this.$message.success('新增成功')
        this.closeDialog()
      } else {
        this.$message.error('新增失败')
      }
    },
    // 修改提交
    async editSubmit() {
      const res = await pullingOrderUpdate(this.reqParams)
      if ((res.data = true)) {
        this.$message.success('修改成功')
        this.closeDialog()
      } else {
        this.$message.error('修改失败')
      }
    },
    // 提交
    async submit() {
      if (this.selectIndex > -1 && this.OfldOrderList.length > 0) {
        this.OfldOrderList[this.selectIndex].ofldPlanList = JSON.parse(
          JSON.stringify(this.ofldPlanList)
        )
      }
      // if(this.reqParams.deliveryWarehouseUuid == '' || this.reqParams.ofldWarehouseUuid == ''){
      //   return this.$message.error('请先选择拉货和到货仓库')
      // }
      // let isNull = true
      // this.OfldOrderList.map(item =>{
      //   if(item.ofldPlanList == undefined){
      //     isNull = false
      //   }else{
      //     item.ofldPlanList.map(res =>{
      //     if((res.planGoodsArrrivedTime == "" && res.planOfldQuantity != "") || (res.planGoodsArrrivedTime != "" && res.planOfldQuantity == "")){
      //      isNull = false
      //     }
      //   })
      //   }
      // })
      // if(isNull == false){
      //   return this.$message.error('请填写完整')
      // }

      for (let i = 0; i < this.OfldOrderList.length; i++) {
        if (this.OfldOrderList[i].ofldPlanList == undefined) {
          return this.$message.error('请先为每条记录添加计划')
        }
        if (
          this.OfldOrderList[i].supplierUuid == '' ||
          this.OfldOrderList[i].supplierUuid == undefined
        ) {
          return this.$message.error('当前拉货计划的供应商信息必传')
        }
        for (let j = 0; j < this.OfldOrderList[i].ofldPlanList.length; j++) {
          if (this.OfldOrderList[i].ofldPlanList[j].planOfldQuantity === '0') {
            return this.$message.error('拉货数量不能为0')
          }
        }
        for (let j = 0; j < this.OfldOrderList[i].ofldPlanList.length; j++) {
          if (
            this.OfldOrderList[i].ofldPlanList[j].planGoodsArrrivedTime !==
              null &&
            this.OfldOrderList[i].ofldPlanList[j].planGoodsArrrivedTime !==
              '' &&
            (this.OfldOrderList[i].ofldPlanList[j].planOfldQuantity === null ||
              this.OfldOrderList[i].ofldPlanList[j].planOfldQuantity === '')
          ) {
            return this.$message.error('请填写完整拉货数量')
          }
          if (
            (this.OfldOrderList[i].ofldPlanList[j].planGoodsArrrivedTime ===
              null ||
              this.OfldOrderList[i].ofldPlanList[j].planGoodsArrrivedTime ===
                '') &&
            this.OfldOrderList[i].ofldPlanList[j].planOfldQuantity !== null &&
            this.OfldOrderList[i].ofldPlanList[j].planOfldQuantity !== ''
          ) {
            return this.$message.error('请填写完整拉货时间')
          }
        }
        let isNull = this.OfldOrderList[i].ofldPlanList.every(
          (item) =>
            item.planGoodsArrrivedTime === null ||
            item.planGoodsArrrivedTime === ''
        )
        if (isNull) {
          return this.$message.error('每条sku请至少填写一天的数据')
        }
      }

      this.reqParams.addOfldOrderListDTOList = this.OfldOrderList
      if (this.status == 1) {
        this.addSubmit()
      } else {
        this.editSubmit()
      }
    },
    // 跳转到sku画像
    jumpToSkuDate(row) {
      this.getMonthTime()
      this.productTitle = `${row.spuShowName}看板`
      this.selectSkuChangeToSku = false
      this.selectSpuChangeToSku = false
      Object.assign(this.searchParms, {
        from: 'spuToSku', //入口来源
        timeScopeArr: this.timeArr, //时间范围数组
        timeScopeType: 2, //时间范围类型
        spu: {
          spuUuid: [row.spuUuid], //spu uuid
          spuNameArr: [], //spu名称数组
        },
        sku: {
          skuUuid: [row.skuUuid], //sku uuid
          skuCode: [], //sku编码
          skuNameArr: [], //sku名称数组
          skuCodeArr: [], //sku编码数组
        },
      })
      this.productShowSku = true
    },
    // 获取时间数组用于sku画像
    getMonthTime() {
      this.timeArr = [addDay(-7), addDayEnd(-1)]
    },
    // 关闭弹窗
    productStatusSku() {
      this.productShowSku = false
    },
    // 点击修改tab行颜色
    rowStyle({ row, rowIndex }) {
      if (this.selectIndex === rowIndex) {
        return {
          'background-color': 'rgb(235,240,240)',
          cursor: 'pointer',
        }
      }
      return { cursor: 'pointer' }
    },
  },
}
</script>

<style lang="scss" scoped>
.add-btn {
  text-align: center; /* 水平居中 */
}
</style>
