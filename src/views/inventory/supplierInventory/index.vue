<template>
  <div class="app-container">
    <div class="page-search">
      <el-form :inline="true" :model="reqParams" class="demo-form-inline">
        <el-form-item label="供应商：" style="margin-right: 20px">
          <el-select v-model="reqParams.supplierStorkUuid" clearable filterable placeholder="请选择">
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
            v-model="reqParams.spuUuid"
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
        <el-form-item label="产品类型:" style="margin-right: 20px">
          <el-select filterable v-model="reqParams.spuType" clearable placeholder="请选择">
            <el-option
              v-for="item in spuTypeList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="SKU：" style="margin-right: 20px">
          <el-select v-model="reqParams.skuUuid" filterable multiple clearable placeholder="请选择">
            <el-option
              v-for="item in skuList"
              :key="item.code"
              :label="`(${item.name})${item.extendKeyword}`"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="getPageList(1)">搜索</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table
      border
      v-loading="loading"
      :data="tableData"
      center
      :row-style="rowStyle"
      style="width: 100%"
      @row-click="handleCurrentChange"
      max-height="500"
    >
      <el-table-column prop="date" label="序号" min-width="25" type="index" align="center"></el-table-column>
      <el-table-column prop="supplierName" label="供应商" align="center"></el-table-column>
      <el-table-column prop="productName" label="产品名称" align="center"></el-table-column>
      <el-table-column label="SKU编码" show-overflow-tooltip align="center">
        <template v-slot="{ row }">
          <span>({{ row.skuCode }}){{ row.specsName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="SKU图片" width="80" align="center">
        <template v-slot="{ row, $index }">
          <el-image
            v-if="row.skuUrl"
            style="height: 30px; width: 30px"
            :src="row.skuUrl + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
            :preview-src-list="[row.skuUrl]"
          ></el-image>
        </template>
      </el-table-column>
      <el-table-column prop="supplierStockNum" label="工厂库存" width="120" align="center">
        <template v-slot:header>
          <span
            @click="sortChange"
            :style="{
              color: '#409EFF',
              fontSize: '17px',
              cursor: 'pointer'}"
          >
            工厂库存
            <i v-if="reqParams.sortType === 1" class="el-icon-top"></i>
            <i v-if="reqParams.sortType === 0" class="el-icon-bottom"></i>
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="sumStock" width="100" label="总库存" align="center">
        <template v-slot:header>
          <span>总库存</span>
          <el-tooltip class="item" effect="dark" content="总库存=当前sku所有供应商下单数量的累加" placement="top">
            <svg class="icon" preserveAspectRatio="xMidYMid meet">
              <use xlink:href="#icon-question" />
            </svg>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="surplusDays" label="预测剩余销售天数" width="80" align="center"></el-table-column>
      <el-table-column label="修改时间" align="center">
        <template v-slot="{ row }">
          <span v-if="row.updateTime">{{ getFormatDate(row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="updateUser" label="修改人" width="80" align="center"></el-table-column>
      <el-table-column label="操作" align="center" width="100">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="handleReturn(scope.row)">退货</el-button>
          <el-button type="text" size="small" @click="handleExchange(scope.row)">换货</el-button>
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
        <!--时间范围 -->
        <el-form-item label="时间范围：" style="margin-right: 20px;">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            align="right"
            unlink-panels
            value-format="timestamp"
            @blur="blurTime"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="修改类型：" style="margin-right: 20px">
          <el-select v-model="childParams.updateType" clearable filterable placeholder="请选择">
            <el-option
              v-for="item in updateTypeList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            @click="getChildPageList(1)"
            v-if="this.childParams.skuUuid != '' && this.childParams.supplierStorkUuid != ''"
          >搜索</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table border :data="childTableData" center style="width: 100%" max-height="500">
      <el-table-column prop="date" label="序号" min-width="25" type="index" align="center"></el-table-column>
      <el-table-column prop="updateTypeName" label="修改类型" align="center"></el-table-column>
      <el-table-column prop="destinateWarehouseName" label="到货仓库" align="center"></el-table-column>
      <el-table-column prop="goodsQuantity" label="数量" align="center"></el-table-column>
      <el-table-column prop="nowStock" label="库存结存" align="center"></el-table-column>
      <el-table-column label="备注" align="center">
        <template v-slot="{row}">
          <span>{{row.refundReasonName}}</span>
          <span v-if="row.remark != null">-{{row.remark}}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改时间" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.createTime != null">{{ getFormatDate(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="createUser" label="修改人" align="center"></el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      v-show="total > 0"
      :page.sync="childParams.page"
      :limit.sync="childParams.pageSize"
      :total="childTotal"
      @pagination="getChildPageList"
    />
    <!-- 退货弹窗 -->
    <el-dialog
      title="退货"
      @close="returnClose"
      :visible.sync="returnVisible"
      width="40%"
      :close-on-click-modal="false"
    >
      <el-form
        :model="returnForm"
        ref="returnForm"
        :rules="returnRules"
        label-position="right"
        label-width="120px"
      >
        <el-form-item label="供应商：" style="margin-right: 20px">
          <span>{{ returnData.supplierName }}</span>
        </el-form-item>
        <el-form-item label="产品名称：" style="margin-right: 20px">
          <span>{{ returnData.productName }}</span>
        </el-form-item>
        <el-form-item label="SKU编码：" style="margin-right: 20px">
          <span>({{ returnData.skuCode }}){{ returnData.specsName }}</span>
        </el-form-item>
        <el-form-item label="SKU图片：" style="margin-right: 20px">
          <el-image
            v-if="returnData.skuUrl"
            style="height: 30px; width: 30px"
            :src="returnData.skuUrl"
            :preview-src-list="[returnData.skuUrl]"
          ></el-image>
        </el-form-item>
        <el-form-item label="退货原因：" prop="refundReason" style="margin-right: 20px">
          <el-select
            v-model="returnForm.refundReason"
            class="el-form-item-width40"
            clearable
            placeholder="请选择"
          >
            <el-option
              v-for="item in refundReasonList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="退货数量：" style="margin-right: 20px" prop="goodsQuantity">
          <el-input
            class="el-form-item-width40"
            v-model="returnForm.goodsQuantity"
            placeholder="请输入退货数量"
          ></el-input>
        </el-form-item>
        <el-form-item label="备注：" style="margin-right: 20px">
          <el-input class="el-form-item-width40" v-model="returnForm.remark" placeholder="请输入退货备注"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="returnClose">取消</el-button>
        <el-button type="primary" @click="returnSubmit">确定</el-button>
      </div>
    </el-dialog>
    <!-- 换货弹窗 -->
    <el-dialog title="换货" @close="changeClose" :visible.sync="changeVisible" width="40%">
      <el-form
        :model="changeForm"
        ref="changeForm"
        :rules="changeRules"
        label-position="right"
        label-width="120px"
      >
        <el-form-item label="供应商：" style="margin-right: 20px">
          <span>{{ returnData.supplierName }}</span>
        </el-form-item>
        <el-form-item label="产品名称：" style="margin-right: 20px">
          <span>{{ returnData.productName }}</span>
        </el-form-item>
        <el-form-item label="原SKU编码：" style="margin-right: 20px">
          <span>({{ returnData.skuCode }}){{ returnData.specsName }}</span>
        </el-form-item>
        <el-form-item label="原SKU图片：" style="margin-right: 20px">
          <el-image
            v-if="returnData.skuUrl"
            style="height: 30px; width: 30px"
            :src="returnData.skuUrl"
            :preview-src-list="[returnData.skuUrl]"
          ></el-image>
        </el-form-item>
        <el-form-item label="现SKU编码：" prop="exchangeGoodsSkuUuid" style="margin-right: 20px">
          <el-select
            filterable
            v-model="changeForm.exchangeGoodsSkuUuid"
            class="el-form-item-width40"
            clearable
            @change="getImgBySkuCode"
            placeholder="请选择"
          >
            <el-option
              v-for="item in skuCodeList"
              :key="item.skuUuid"
              :label="`(${item.skuCode})${item.specsName}`"
              :value="item.skuUuid"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="SKU图片：" style="margin-right: 20px">
          <el-image
            v-if="changeForm.skuUrl"
            style="height: 30px; width: 30px"
            :src="changeForm.skuUrl"
            :preview-src-list="[changeForm.skuUrl]"
          ></el-image>
        </el-form-item>
        <el-form-item label="换货数量：" prop="goodsQuantity" style="margin-right: 20px">
          <el-input
            class="el-form-item-width40"
            v-model="changeForm.goodsQuantity"
            placeholder="请输入换货数量"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="changeClose">取消</el-button>
        <el-button type="primary" @click="changeSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getSupplierList,
  getProductNameList,
  getSkuList,
  supplierInventoryList,
  supplierInventoryRecordList,
  getChangeTypeList,
  returnGoods,
  exchangeGoods,
  returnGoodsDetail,
  listPlatform,
  getSkuCodeList,
  getImgUrl,
} from '@/api/inventory/supplierInventory'
import { getSpuTypeSelectList } from '@/api/baseData/common'
import { getFormatDate } from '@/utils/common'
export default {
  name: 'SupplierInventory',
  data() {
    return {
      reqParams: {
        page: 1,
        pageSize: 10,
        spuType: '1',
        skuUuid: [],
        spuUuid: '',
        sortType: 1,
        supplierStorkUuid: '',
      },
      // 供应商列表
      supplierList: [],
      // 产品名称列表
      productNameList: [],
      // SKU列表
      skuList: [],
      // 列表数据
      tableData: [],
      // 列表加载
      loading: false,
      // 列表总数
      total: 0,
      // 选择行的索引值
      selectIndex: -1,
      // 子表请求参数
      childParams: {
        endTime: 0,
        page: 1,
        pageSize: 10,
        skuUuid: '',
        startTime: 0,
        supplierStorkUuid: '',
        updateType: null,
      },
      // 子表总数
      childTotal: 0,
      // 子表数据
      childTableData: [],
      // 子表加载
      childLoading: false,
      // 日期范围
      dateRange: [],
      // 修改类型下拉
      updateTypeList: [
        { code: 1, name: '下单' },
        { code: 2, name: '换货' },
        { code: 3, name: '退货' },
        { code: 4, name: '拉货' },
      ],
      returnVisible: false,
      returnData: {},
      // 退货参数
      returnForm: {
        goodsQuantity: '',
        refundReason: '',
        skuUuid: '',
        supplierStorkUuid: '',
        supplierUuid: '',
        remark: '',
      },
      returnRules: {
        refundReason: [
          { required: true, message: '请选择退货原因', trigger: 'change' },
        ],
        goodsQuantity: [
          { required: true, message: '请输入退货数量', trigger: 'blur' },
        ],
      },
      changeRules: {
        exchangeGoodsSkuUuid: [
          { required: true, message: '请选择换货sku', trigger: 'change' },
        ],
        goodsQuantity: [
          { required: true, message: '请输入换货数量', trigger: 'blur' },
        ],
      },
      changeVisible: false,
      // 修改参数
      changeForm: {
        exchangeGoodsSkuUuid: '',
        goodsQuantity: '',
        supplierStorkUuid: '',
        supplierUuid: '',
        skuUrl: '',
      },
      // 退货原因下拉
      refundReasonList: [],
      // sku编码下拉
      skuCodeList: [],

      // 产品类型下拉框
      spuTypeList: [],
    }
  },
  created() {
    this.getSpuTypeList()
    this.getSuppliers()
    this.getProductNameList()
    this.getPageList()
    this.supplierInventoryList()
    this.getRefundReasonList()
  },
  methods: {
    // 切换排序
    sortChange() {
      // sortType 1:倒序 2:正序
      this.reqParams.sortType === 1
        ? (this.reqParams.sortType = 0)
        : (this.reqParams.sortType = 1)
      this.getPageList(1)
    },

    // 获取产品类型下拉框
    async getSpuTypeList() {
      const res = await getSpuTypeSelectList()
      this.spuTypeList = res.data
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
      this.reqParams.skuUuid = []
      this.skuList = []
      if (this.reqParams.spuUuid != '') {
        const res = await getSkuList(this.reqParams.spuUuid)
        this.skuList = res.data
      }
    },
    // 时间选择失焦时将startPickerTime置空 目的是清除禁用的时间范围
    blurTime() {
      this.startPickerTime = ''
    },
    async getPageList(page) {
      this.loading = true
      if (page == 1) {
        this.reqParams.page = 1
      }
      this.selectIndex = -1
      this.childParams = this.$options.data().childParams
      const res = await supplierInventoryList(this.reqParams)
      this.tableData = res.data.records
      this.total = res.data.total
      this.childTableData = []
      this.loading = false
    },
    // 子表查询
    async getChildPageList(page) {
      this.childLoading = true
      if (page == 1) {
        this.reqParams.page = 1
      }
      if (this.dateRange != null) {
        this.childParams.startTime = this.dateRange[0]
        this.childParams.endTime = this.dateRange[1]
      } else {
        this.childParams.startTime = 0
        this.childParams.endTime = 0
      }
      const res = await supplierInventoryRecordList(this.childParams)
      this.childTableData = res.data.records
      this.childTotal = res.data.total
      this.childLoading = false
    },
    async handleCurrentChange(row) {
      this.selectIndex = this.tableData.indexOf(row)
      this.childParams.skuUuid = row.skuUuid
      this.childParams.supplierStorkUuid = row.supplierStockUuid
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
    // 修改类型下拉
    async supplierInventoryList() {
      const res = await getChangeTypeList()
      this.updateTypeList = res.data
    },
    // 退货原因下拉
    async getRefundReasonList() {
      const res = await listPlatform()
      this.refundReasonList = res.data
    },
    // 打开退货弹窗
    async handleReturn(row) {
      let formData = new FormData()
      formData.append('supplierStockUuid', row.supplierStockUuid)
      const res = await returnGoodsDetail(formData)
      this.returnData = res.data
      this.returnForm.skuUuid = this.returnData.skuUuid
      this.returnForm.supplierUuid = this.returnData.supplierUuid
      this.returnForm.supplierStorkUuid = this.returnData.supplierStockUuid
      console.log(this.returnForm)
      this.returnVisible = true
    },
    // 提交退货
    async returnSubmit() {
      this.$refs['returnForm'].validate(async (valid) => {
        if (valid) {
          const res = await returnGoods(this.returnForm)
          if (res.data == true) {
            this.$message.success('退货成功')
          } else {
            this.$message.error('退货失败')
          }

          this.getPageList(1)
          this.returnClose()
        }
      })
    },
    // 关闭退货弹窗
    returnClose() {
      this.returnVisible = false
      this.returnData = {}
      this.returnForm = this.$options.data().returnForm
      this.$refs['returnForm'].resetFields()
    },
    // 打开换货弹窗
    async handleExchange(row) {
      let formData = new FormData()
      formData.append('supplierStockUuid', row.supplierStockUuid)
      const res = await returnGoodsDetail(formData)
      this.returnData = res.data
      this.getSkuCodeList()
      this.changeVisible = true
    },
    // sku编码下拉框
    async getSkuCodeList() {
      let formData = new FormData()
      formData.append('supplierUuid', this.returnData.supplierUuid)
      const res = await getSkuCodeList(formData)
      this.skuCodeList = res.data
    },
    // 根据sku编码获取图片
    async getImgBySkuCode() {
      let formData = new FormData()
      formData.append('skuUuid', this.changeForm.exchangeGoodsSkuUuid)
      const res = await getImgUrl(formData)
      this.changeForm.skuUrl = res.data.url
      console.log(this.changeForm.skuUrl)
    },
    // 关闭换货弹窗
    changeClose() {
      this.changeVisible = false
      this.returnData = {}
      this.changeForm = this.$options.data().changeForm
      this.$refs['changeForm'].resetFields()
    },
    // 提交换货
    async changeSubmit() {
      this.$refs['changeForm'].validate(async (valid) => {
        if (valid) {
          this.changeForm.supplierUuid = this.returnData.supplierUuid
          this.changeForm.supplierStorkUuid = this.returnData.supplierStockUuid
          const res = await exchangeGoods(this.changeForm)
          if (res.data == true) {
            this.$message.success('换货成功')
          } else {
            this.$message.error('换货失败')
          }
          this.$refs.changeForm.resetFields()
          this.getPageList(1)
          this.changeClose()
        }
      })
    },
    getFormatDate(time) {
      return getFormatDate(parseInt(time))
    },
  },
}
</script>

<style lang="scss" scoped>
.child-search {
  margin-top: 30px;
}
.icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: #606266;
}
</style>