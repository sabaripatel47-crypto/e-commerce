<template>
  <div class="app-container">
      <div class="page-search">
        <el-form :inline="true" :model="reqParams" class="demo-form-inline">
        <el-form-item label="供应商:" style="margin-right: 20px">
            <el-select
              v-model="reqParams.supplierUuid"
              clearable
              filterable
              placeholder="请选择"
            >
              <el-option
                v-for="item in supplierList"
                :key="item.uuid"
                :label="item.supplierName"
                :value="item.uuid"
              ></el-option>
            </el-select>
          </el-form-item>
          <!-- 下拉选择品类 -->
        <el-form-item label="品类:" style="margin-right: 20px;width: 360px;">
          <el-cascader
            style="min-width: 300px;"
            filterable
            v-model="categoryList"
            :options="Cadepartments"
            :show-all-levels="false"
            :props="{ children: 'children', label: 'cateName', value: 'uuid', checkStrictly: false,multiple: true }"
            clearable
          ></el-cascader>
        </el-form-item>
          <el-form-item label="产品名称:" style="margin-right: 20px">
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
          <el-form-item label="SKU:" style="margin-right: 20px">
            <el-select
              v-model="reqParams.skuUuid"
              multiple
              clearable
              filterable
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
          <el-form-item label="安全库存警戒线:" style="margin-right: 20px">
            <el-select
              v-model="reqParams.safeLone"
              clearable
              placeholder="请选择"
            >
              <el-option
                v-for="item in  safetyStockList"
                :key="item.code"
                :label="item.name"
                :value="item.code"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="getPageList(1)">搜索</el-button>
          </el-form-item>
      </el-form>
      <el-button @click="showModal()">生成下月拉货计划</el-button>
      <el-button @click="showMonthModal()">生成本月拉货计划</el-button>
      </div>
      <el-table
        border
        v-loading="loading"
        :data="tableData"
        center
        row-key="uuid"
        ref="table"
        style="width:100%"
        height="480"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" :reserve-selection="true"> </el-table-column>
        <el-table-column
          prop="date"
          label="序号"
          min-width="25"
          type="index"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="supplierName"
          label="供应商"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="spuShowName"
          label="产品名称"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="categoryName"
          label="货品分类"
          align="center"
        ></el-table-column>
        <el-table-column
          
          label="SKU编码"
          align="center"
        >
        <template v-slot="{ row }">
          <span>({{ row.skuCode }}){{ row.specsName }}</span>
        </template>
      </el-table-column>
        <el-table-column
        
          label="SKU图片"
          align="center"
        ><template v-slot="{ row, $index }">
          <el-image
            v-if="row.skuUrl"
            style="height: 30px;width: 30px;"
            :src="row.skuUrl+ '?x-oss-process=image/resize,w_30,h_30,limit_0'"
            :preview-src-list="[row.skuUrl]"
          ></el-image>
        </template></el-table-column>
        <el-table-column
          prop="productionCycle"
          label="生产周期"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="stockNum"
          label="仓库库存"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="allStock"
          label="总仓库库存"
          align="center"
        >
        <template v-slot="{row}">
            <el-button type="text" size="small" @click="warehouseInventoryList(row.skuUuid)">{{row.allStock}}</el-button>
          </template>
      </el-table-column>
        <el-table-column
          prop="supplierStockNum"
          label="工厂库存"
          align="center"
        ></el-table-column>
        <el-table-column
          label="预测剩余销售天数"
          align="center"
        >
        <template v-slot="{ row }">
          <span v-if="row.predictRemainDay != null">{{ getDays(row.predictRemainDay) }}</span>
        </template>
      </el-table-column>
        <el-table-column
          label="操作"
          align="center"
        >
        <template v-slot="{ row }">
          <el-button type="text" size="small" @click="handleReturn(row)">退货</el-button>
            <el-button type="text" size="small" @click="handleExchange(row)">换货</el-button>
        </template>
      </el-table-column>
        </el-table>
         <!-- 分页 -->
    <Pagination
      v-show="total>0"
      :page.sync="reqParams.page"
      :limit.sync="reqParams.pageSize"
      :total="total"
      @pagination="getPageList"
    />

     <!-- 退货弹窗 -->
     <el-dialog title="退货" @close="returnClose" append-to-body :visible.sync="returnVisible" width="40%" :close-on-click-modal="false">
      <el-form :model="returnForm" ref="returnForm" :rules="returnRules" label-position="right" label-width="120px">
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
          <el-input class="el-form-item-width30"   v-model="returnForm.goodsQuantity" placeholder="请输入退货数量"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="returnClose">取消</el-button>
        <el-button type="primary" @click="returnSubmit">确定</el-button>
      </div>
    </el-dialog>
      <!-- 换货弹窗 -->
    <el-dialog title="换货" @close="changeClose()" append-to-body :visible.sync="changeVisible" width="40%">
      <el-form :model="changeForm" ref="changeForm" :rules="changeRules" label-position="right" label-width="120px">
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
          <el-input class="el-form-item-width30" v-model="changeForm.goodsQuantity" placeholder="请输入换货数量"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="changeClose()">取消</el-button>
        <el-button type="primary" @click="changeSubmit">确定</el-button>
      </div>
    </el-dialog>
    <DeliveryPlan ref="modal" :propsData="propsData" :isNext="isNextMonth" :orderLists="orderLists"></DeliveryPlan>
    <InventoryDetails ref="InventoryDetails" :tableData="warehouseList"></InventoryDetails>
  </div>
</template>

<script>
import { getPullingRecordsList,getSafetyStockList,listPlatform,getChangeTypeList,getImgUrl,returnGoodsDetail,returnGoods,exchangeGoods,getSkuCodeList } from '@/api/cargoPulling/cargoRecordDetail'
import{getSupplierList,getProductNameList,getSkuList,category,systemData,warehouseInventoryList} from '@/api/cargoPulling/common'
import { getDeptTreeData } from '@/utils/common'
import { categoryList } from "@/api/purchasingManagement/common";
import InventoryDetails from '@/components/InventoryDetails';
import DeliveryPlan from '../components/DeliveryPlan';
export default {
  name: 'CargoRecordDetail',
  data(){
    return {
       // 供应商列表
       supplierList: [],
      // 产品名称列表
      productNameList: [],
      // SKU列表
      skuList: [],
      // 安全库存警戒线下拉
      safetyStockList: [],
      // 请求参数
      reqParams: {
      categoryUuid: [],
      page: 1,
      pageSize: 10,
      safeLone: '',
      skuUuid: [],
      spuUuid: "",
      supplierUuid: ""
    },
    warehouseList:[],
    // 
    tableData: [],
    // 全部数据
    total: 0,
    // 数组加载
    loading: false,
    //品类下拉框
    Cadepartments: [],
      // 品类多选数组
      categoryList: [],
      orderLists:[],
      selectList:[],
      // 修改参数
      changeForm: {
        exchangeGoodsSkuUuid: "",
        goodsQuantity: "",
        supplierStorkUuid: "",
        supplierUuid: "",
        skuUrl:""
      },
      // 退货参数
      returnForm: {
        goodsQuantity: '',
        refundReason: '',
        skuUuid: "",
        supplierStorkUuid: "",
        supplierUuid: ""
      },
      // 退货原因下拉
      refundReasonList:[],
       // sku编码下拉
       skuCodeList:[],
      returnVisible:false,
      changeVisible: false,
      returnData:{},
      returnRules: {
        refundReason: [
          { required: true, message: '请选择退货原因', trigger: 'change' },
        ],
        goodsQuantity: [
          { required: true, message: '请输入退货数量', trigger: 'blur' },
        ],
      },
      changeRules:{
        exchangeGoodsSkuUuid:[
          { required: true, message: '请选择换货sku', trigger: 'change' },
        ],
        goodsQuantity: [
          { required: true, message: '请输入换货数量', trigger: 'blur' },
        ],
      },
      // 弹窗参数
      propsData:{
        ofldTime:null,
        status:1
      },
      // 是否下个月
      isNextMonth:1,
    }
  },
  components: {
    DeliveryPlan,
    InventoryDetails
  },
  created(){
    this.getSuppliers()
    this.getProductNameList()
    this.getCategory()
    this.getSafetyStockList()
    this.getRefundReasonList()
    this.supplierInventoryList()
    this.getPageList(1)
  },
  methods: {
    // 获取供应商列表
    async getSuppliers() {
      const res = await getSupplierList();
      this.supplierList = res.data;
    },
    // 获取产品名称列表
    async getProductNameList() {
      const res = await getProductNameList();
      this.productNameList = res.data;
    },
    // 获取SKU列表
    async getSkuList() {
      this.reqParams.skuUuid = [];
      this.skuList = [];
      if (this.reqParams.spuUuid != "") {
        const res = await getSkuList(this.reqParams.spuUuid);
        this.skuList = res.data;
      }
    },
    // 获取安全库存警戒下拉
    async getSafetyStockList() {
      const res = await getSafetyStockList();
      this.safetyStockList = res.data;
    },
    // 获取品类列表
    async getCategory() {
      const res = await categoryList()
      this.Cadepartments = await getDeptTreeData(res.data)
    },
    async getPageList(page){
      if(page == 1){
        this.reqParams.page = page
      }
      this.reqParams.categoryUuid = []
      for (let i = this.categoryList.length; i--; ) {
        let arr = this.categoryList[i]
        if (Array.isArray(arr)) {
          arr = arr[arr.length - 1]
        }
        this.reqParams.categoryUuid.push(arr)
      }
      this.loading = true
     const res = await getPullingRecordsList(this.reqParams)
     this.tableData = res.data.records
     this.total = res.data.total
     this.loading = false
    },
    // 仓库记录
    async warehouseInventoryList(id) {
      const res = await warehouseInventoryList(id)
      this.warehouseList = res.data
      this.$refs.InventoryDetails.openDialog()
    },
    // 天数保留两位小数
    getDays(row){
      if(row == null){
        return  0
      }
      let number = row
      number = Number(number.toString().match(/^\d+(?:\.\d{0,2})?/))
      return number
    },
    handleSelectionChange(val) {
      this.orderLists = val; 
      // console.log(this.orderLists)
    },
    // 打开退货弹窗
    async handleReturn(row){
      let formData = new FormData()
      formData.append("supplierStockUuid", row.supplierStockUuid)
      const res = await returnGoodsDetail(formData)
      this.returnData = res.data
      this.returnForm.skuUuid = this.returnData.skuUuid
      this.returnForm.supplierUuid = this.returnData.supplierUuid
      this.returnForm.supplierStorkUuid = this.returnData.supplierStockUuid
      console.log(this.returnForm)
      this.returnVisible = true;
    },
    // 退货原因下拉
    async getRefundReasonList() {
      const res = await listPlatform()
      this.refundReasonList = res.data
    },
     // 修改类型下拉
     async supplierInventoryList() {
      const res = await getChangeTypeList()
      this.updateTypeList = res.data
    },
    // 根据sku编码获取图片
    async getImgBySkuCode(){
      let formData = new FormData()
      formData.append("skuUuid", this.changeForm.exchangeGoodsSkuUuid)
      const res = await getImgUrl(formData)
      this.changeForm.skuUrl = res.data.url
      console.log(this.changeForm.skuUrl)
    },
    // 提交退货
    async returnSubmit(){
      this.$refs['returnForm'].validate(async (valid) => {
        if (valid) {
          const res = await returnGoods(this.returnForm)
      if(res.data == true){
        this.$message.success("退货成功")
      }else{
        this.$message.error("退货失败")
      }
     
      this.getPageList(1)
      this.returnClose()
        }})
    },
    // 关闭退货弹窗
    returnClose(){
      this.returnVisible = false;
      this.returnData = {}
      this.returnForm = this.$options.data().returnForm
      this.$refs['returnForm'].resetFields()
    },
    // sku编码下拉框
    async getSkuCodeList() {
      let formData = new FormData()
      formData.append("supplierUuid", this.returnData.supplierUuid)
      const res = await getSkuCodeList(formData)
      this.skuCodeList = res.data
    },
    // 打开换货弹窗
    async handleExchange(row){
      let formData = new FormData()
      formData.append("supplierStockUuid", row.supplierStockUuid)
      const res = await returnGoodsDetail(formData)
      this.returnData = res.data
      this.getSkuCodeList()
      this.changeVisible = true;
    },
    // 关闭换货弹窗
    changeClose(){
      this.changeVisible = false;
      this.returnData = {}
      this.changeForm = this.$options.data().changeForm  
      this.$refs['changeForm'].resetFields()
    },
    // 提交换货
    async changeSubmit(){
      this.$refs['changeForm'].validate(async (valid) => {
        if (valid) {
          this.changeForm.supplierUuid = this.returnData.supplierUuid
      this.changeForm.supplierStorkUuid = this.returnData.supplierStockUuid
      const res = await exchangeGoods(this.changeForm)
      if(res.data == true){
        this.$message.success("换货成功")
      }else{
        this.$message.error("换货失败")
      }
      this.$refs.changeForm.resetFields()
      this.getPageList(1)
      this.changeClose()
        }})
    },
    // 打开弹窗
    showModal(){
      this.isNextMonth = 1
      this.getCurrentTime(1)
      this.$refs.modal.openDialog()
      this.$refs.table.clearSelection();
      this.orderLists = []
    },
    // 打开本月拉货计划弹窗
    showMonthModal(){
      this.isNextMonth = 0
      this.getCurrentTime(0)
      this.$refs.modal.openDialog()
      this.$refs.table.clearSelection();
      this.orderLists = []
    },
    // 获取当前时间
    async getCurrentTime(num){
      // const res = await systemData()
      let date = new Date()
      date.setMonth(date.getMonth()+num)
      this.propsData.ofldTime = Number(Date.parse(date))
      // console.log(this.propsData.ofldTime)
    }
  }
}
</script>

<style lang="scss" scoped>

.page-search {
  margin-bottom: 20px;
}
</style>