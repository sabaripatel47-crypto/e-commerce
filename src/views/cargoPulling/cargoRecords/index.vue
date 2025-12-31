<template>
  <div class="app-container">
    <div class="page-search">
      <el-form :model="reqParams" :inline="true" label-width="100px">
        <el-form-item label="拉货时间：">
          <el-date-picker
            :clearable="false"
            v-model="reqParams.ofldTime"
            style="width: 240px"
            value-format="timestamp"
            type="month"
            placeholder="请选择日期"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="记录时间：">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            align="right"
            unlink-panels
            value-format="timestamp"
            @blur="blurTime"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="到货仓库：">
          <el-select v-model="reqParams.ofldWarehouseType" clearable filterable placeholder="请选择">
            <el-option
              v-for="item in ofldWarehouseTypeList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin-right: 20px;">
          <el-button type="primary" icon="el-icon-search" @click="getPageList(1)">搜索</el-button>
        </el-form-item>
        <el-form-item style="margin-right: 20px;">
          <el-button type="primary" icon="el-icon-plus" plain @click="jumpToAdd()">新增</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table
      border
      v-loading="loading"
      :data="pullingRecordsList"
      center
      :row-style="rowStyle"
      @row-click="handleCurrentChange"
      style="width: 100%"
      height="480"
    >
      <el-table-column prop="date" label="序号" min-width="25" type="index" align="center"></el-table-column>
      <el-table-column label="拉货时间" align="center">
        <template v-slot="{row}">
          <span>{{ getFormatDate(row.ofldTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="recordUserName" label="记录人" align="center"></el-table-column>
      <el-table-column label="记录时间" align="center">
        <template v-slot="{row}">
          <span>{{ getFormatDate(row.recordTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="ofldWarehouseName" label="拉货仓库" align="center"></el-table-column>
      <el-table-column prop="destinateWarehouseName" label="到货仓库" align="center"></el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="showModal(scope.row)">修改</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      v-show="total > 0"
      :page.sync="reqParams.page"
      :limit.sync="reqParams.pageSize"
      :total="total"
      @pagination="getPageList"
    />
    <div class="child-search">
      <el-form :inline="true" :model="childParams" class="demo-form-inline">
        <el-form-item label="供应商：" style="margin-right: 20px">
          <el-select v-model="childParams.supplierUuid" clearable filterable placeholder="请选择">
            <el-option
              v-for="item in supplierList"
              :key="item.uuid"
              :label="item.supplierName"
              :value="item.uuid"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="产品名称：" style="margin-right: 20px">
          <el-select
            filterable
            v-model="childParams.spuUuid"
            clearable
            @change="getSkuList()"
            placeholder="请选择"
          >
            <el-option
              v-for="item in productNameList"
              :key="item.uuid"
              :label="item.name"
              :value="item.uuid"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="SKU：" style="margin-right: 20px">
          <el-select
            v-model="childParams.skuUuidList"
            multiple
            filterable
            clearable
            placeholder="请选择"
          >
            <el-option
              v-for="item in skuList"
              :key="item.code"
              :label="`(${item.name})${item.extendKeyword}`"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            @click="getChildPageList(1)"
            v-if="childParams.ofldUuid != ''"
          >搜索</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div>
      <el-table
        v-if="pullingRecordsChildList.length > 0"
        border
        v-loading="childLoading"
        :data="pullingRecordsChildList"
        center
        :span-method="spanMethod"
        style="width: 100%"
        ref="table"
        max-height="480"
      >
        <el-table-column prop="date" label="序号" min-width="25" type="index" align="center"></el-table-column>
        <el-table-column prop="supplierName" label="供应商" align="center"></el-table-column>
        <el-table-column prop="spuShowName" label="产品名称" align="center"></el-table-column>
        <el-table-column label="SKU编码" align="center">
          <template v-slot="{row}">
            <span>({{row.skuCode}}){{row.specsName}}</span>
          </template>
        </el-table-column>
        <el-table-column label="SKU图片" align="center">
          <template v-slot="{ row, $index }">
            <el-image
              v-if="row.skuUrl"
              style="height: 30px; width: 30px"
              :src="row.skuUrl + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
              :preview-src-list="[row.skuUrl]"
              :initial-index="0"
            ></el-image>
          </template>
        </el-table-column>
        <el-table-column prop="stockUpQuantity" label="下月备货量" align="center"></el-table-column>
        <el-table-column
          v-if="isShow && maxChildCount > 0"
          class="table-colum"
          v-for="(item,index) in maxChildCount"
          :key="index"
          :label="(index+1).toString()"
          align="center"
        >
          <el-table-column label="拉货数量" align="center">
            <template v-slot="{row}">
              <span
                v-if="row.updateOfldPlanVOList != null"
              >{{ row.updateOfldPlanVOList[index].planOfldQuantity}}</span>
            </template>
          </el-table-column>
          <el-table-column width="100" label="几天后到货" align="center">
            <template v-slot="{row}">
              <span
                v-if="row.updateOfldPlanVOList != null"
              >{{ row.updateOfldPlanVOList[index].planGoodsArrrivedTime }}</span>
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <el-button type="text" size="small" @click="isShow = !isShow">{{isShow?'收起':'展开'}}</el-button>
        </el-table-column>
      </el-table>
    </div>
    <!-- 分页 -->
    <Pagination
      v-show="childTotal > 0"
      :page.sync="childParams.page"
      :limit.sync="childParams.pageSize"
      :total="childTotal"
      @pagination="getChildPageList"
    />
    <DeliveryPlan
      ref="modal"
      :propsData="propsData"
      @modalClosed="modalClosed"
      :orderLists="orderLists"
    ></DeliveryPlan>
    <el-dialog :visible.sync="cargoRecordDetailVisible" @close="closeCargoRecordDetail" fullscreen>
      <el-button
        type="text"
        icon="el-icon-arrow-left"
        class="dialog-back-button"
        @click="closeCargoRecordDetail"
      >返回</el-button>
      <cargo-record-detail v-if="cargoRecordDetailVisible"></cargo-record-detail>
    </el-dialog>
  </div>
</template>

<script>
import {
  getPullingRecordsList,
  getPullingRecordsChildList,
  getPullingRecordsDetail,
} from '@/api/cargoPulling/cargoRecords'
import {
  getArrivalWarehouseList,
  getSupplierList,
  getProductNameList,
  getSkuList,
} from '@/api/cargoPulling/common'
import { getFormatDate } from '@/utils/common'
import DeliveryPlan from '../components/DeliveryPlan'
import CargoRecordDetail from '../components/CargoRecordDetail'
import { isEqualWith } from 'lodash'
export default {
  name: 'cargoRecords',
  data() {
    return {
      reqParams: {
        ofldTime: '',
        ofldWarehouseType: '',
        page: 1,
        pageSize: 10,
        recordEndTime: '',
        recordStartTime: '',
      },
      // 时间范围
      dateRange: [],
      // 到货仓库下拉
      ofldWarehouseTypeList: [],
      // 拉货记录
      pullingRecordsList: [],
      total: 0,
      loading: false,
      // 选择行的索引值
      selectIndex: -1,
      // 子表传参
      childParams: {
        ofldUuid: '',
        page: 1,
        pageSize: 10,
        skuUuidList: [],
        spuUuid: '',
        supplierUuid: '',
      },
      // 子表数据
      pullingRecordsChildList: [],
      childTotal: 0,
      childLoading: false,
      // 供应商列表
      supplierList: [],
      // 产品名称列表
      productNameList: [],
      // SKU列表
      skuList: [],
      isShow: false,
      // 弹窗参数
      propsData: {
        ofldUuid: '',
        status: 0,
        ofldTime: '',
        deliveryWarehouseUuid: '',
        ofldWarehouseUuid: '',
      },
      orderLists: [],
      // 拉货记录详情弹窗
      cargoRecordDetailVisible: false,
    }
  },
  components: {
    DeliveryPlan,
    CargoRecordDetail,
  },
  computed: {
    // 计算属性
    maxChildCount() {
      if (this.pullingRecordsChildList != []) {
        return Math.max(
          ...this.pullingRecordsChildList.map((item) => {
            if (item.updateOfldPlanVOList != null) {
              return item.updateOfldPlanVOList.length
            } else {
              return 0
            }
          })
        )
      } else {
        return 0
      }
    },
  },
  created() {
    // 获取当前日期
    let currentDate = new Date()
    // 设置为下一个月
    currentDate.setMonth(currentDate.getMonth() + 1)
    this.reqParams.ofldTime = currentDate.getTime()
    this.getArrivalWarehouseList()
    this.getPageList(1)
    this.getSuppliers()
    this.getProductNameList()
  },
  methods: {
    // 到货仓库下拉
    async getArrivalWarehouseList() {
      const res = await getArrivalWarehouseList()
      this.ofldWarehouseTypeList = res.data
    },
    // 拉货记录列表
    async getPageList(page) {
      this.loading = true
      if (page == 1) {
        this.reqParams.page = 1
      }
      this.selectIndex = -1
      this.childParams = this.$options.data().childParams
      console.log('this.dateRange', this.dateRange)
      if (this.dateRange != null) {
        this.reqParams.recordStartTime = this.dateRange[0]
        this.reqParams.recordEndTime = this.dateRange[1]
      } else {
        this.reqParams.recordStartTime = ''
        this.reqParams.recordEndTime = ''
      }
      this.pullingRecordsChildList = []
      this.childTotal = 0
      const res = await getPullingRecordsList(this.reqParams)
      this.pullingRecordsList = res.data.records
      this.total = res.data.total
      this.loading = false
    },
    // 点击查看子表
    handleCurrentChange(row) {
      this.selectIndex = this.pullingRecordsList.indexOf(row)
      this.childParams.ofldUuid = row.ofldUuid
      this.getChildPageList(1)
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
    // 时间选择失焦时将startPickerTime置空 目的是清除禁用的时间范围
    blurTime() {
      this.startPickerTime = ''
    },

    // 查看子表
    async getChildPageList(page) {
      if (page == 1) {
        this.childParams.page = 1
      }
      const res = await getPullingRecordsChildList(this.childParams)

      if (res.data.records == null) {
        this.pullingRecordsChildList = []
      } else {
        this.pullingRecordsChildList = res.data.records
      }
      console.log('子表数据', this.pullingRecordsChildList)
      this.childTotal = res.data.total
    },
    // 获取供应商列表
    async getSuppliers() {
      const res = await getSupplierList()
      this.supplierList = res.data
    },
    // 获取产品名称列表
    async getProductNameList() {
      const res = await getProductNameList()
      this.productNameList = res.data
    },
    // 获取SKU列表
    async getSkuList() {
      this.childParams.skuUuidList = []
      this.skuList = []
      console.log(this.childParams.spuUuid)
      if (this.childParams.spuUuid != '') {
        const res = await getSkuList(this.childParams.spuUuid)
        this.skuList = res.data
      }
    },
    // 单元格合并
    spanMethod({ row, column, rowIndex, columnIndex, columns }) {
      const tableRef = this.$refs.table

      if (tableRef && tableRef.columns) {
        const columnCount = tableRef.columns.length
        const lastColumnIndex = columnCount - 1

        if (columnIndex === lastColumnIndex) {
          if (rowIndex === 0) {
            return [this.pullingRecordsChildList.length, 1]
          } else {
            return [0, 0]
          }
        }
      }

      return [1, 1]
    },
    // 日期转换
    getFormatDate(time) {
      return getFormatDate(parseInt(time))
    },
    // 打开弹窗
    async showModal(row) {
      const res = await getPullingRecordsDetail(row.ofldUuid)
      this.propsData.ofldUuid = row.ofldUuid
      this.propsData.ofldTime = res.data.ofldMonth
      this.propsData.ofldWarehouseUuid = res.data.ofldWarehouseUuid
      this.propsData.deliveryWarehouseUuid = res.data.destinateWarehouseUuid
      this.orderLists = res.data.updateOfldRecordListVOList
      this.orderLists.forEach((item) => {
        item.ofldPlanList = item.updateOfldPlanVOList
        delete item.updateOfldPlanVOList
      })
      this.$nextTick(() => {
        if (this.$refs.modal) {
          this.$refs.modal.openDialog()
        } else {
          console.error('Modal reference is not defined')
        }
      })
      // this.$refs.modal.openDialog()
    },
    jumpToAdd() {
      // this.$router.push({name:'CargoRecordDetail'})
      this.cargoRecordDetailVisible = true
    },
    // 关闭拉货记录详情弹窗
    closeCargoRecordDetail() {
      this.cargoRecordDetailVisible = false
      this.getPageList(1)
    },
    // 关闭弹窗
    modalClosed() {
      this.getPageList(1)
    },
  },
}
</script>

<style>
.child-search {
  margin-top: 30px;
}
</style>