<template>
  <div class="app-container">
    <div class="page-search">
      <el-form :model="reqParams" :inline="true" label-width="100px">
        <el-form-item label="到货日期:">
          <el-date-picker
            :clearable="false"
            v-model="reqParams.actualGoodsArrived"
            style="width: 240px"
            value-format="timestamp"
            type="date"
             :picker-options="pickerOptions"
            placeholder="请选择日期"
          ></el-date-picker>
        </el-form-item>
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
          <el-form-item label="核对状态:" style="margin-right: 20px">
            <el-select
              v-model="reqParams.arrivalStatus"
              clearable
              placeholder="请选择"
            >
              <el-option
                v-for="item in notarizeStatusList"
                :key="item.code"
                :label="item.name"
                :value="item.code"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="margin-right: 20px;">
          <el-button type="primary" icon="el-icon-search" @click="getPageList(1)">搜索</el-button>
        </el-form-item>
        </el-form>
      </div>
        <el-table
        border
        v-loading="loading"
        :data="tableData"
        center
        style="width:100%"
        height="480"
        :row-style="rowStyle"
        @row-click="handleEdit"
      >
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
          prop="actualOfldQuantity"
          label="应到货数量"
          align="center"
        ></el-table-column>
        <el-table-column
        prop="actualGoodsArrivedQuantity"
          label="实际到货数量"
          align="center"
        >
      </el-table-column>
      <el-table-column
        prop="ofldWarehouseUuidName"
          label="拉货仓库"
          align="center"
        >
      </el-table-column>
      <el-table-column
        prop="deliveryWarehouseUuidName"
          label="到货仓库"
          align="center"
        >
      </el-table-column>

        <el-table-column
          prop="checkUserName"
          label="核对人"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="arrivalStatusName"
          label="状态"
          align="center"
        ></el-table-column>
        </el-table>
        <Pagination
        v-show="total > 0"
        :page.sync="reqParams.page"
        :limit.sync="reqParams.pageSize"
        :total="total"
        @pagination="getPageList"
      />
        <el-form :inline="true" label-width="100px" style="margin-top: 20px;">
          <el-form-item label="核对状态:" style="margin-right: 20px">
            <el-select
              v-model="notarizeParams.arrivalStatus"
              clearable
              placeholder="请选择"
            >
              <el-option
                v-for="item in notarizeStatusList"
                :key="item.code"
                :label="item.name"
                :value="item.code"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="handleNotarize()" v-if="notarizeParams.supplierUuid != '' && notarizeParams.ofldWarehouseUuid != ''">搜索</el-button>
            <el-button v-if="orderLists.length > 0" @click="notarizeWriteOffAll()">批量核销</el-button>
          </el-form-item>
        </el-form>
        
          <el-table :data="notarizeList" ref="tabel" center style="width: 100%;" v-if="notarizeList.length > 0" @selection-change="handleSelectionChange" row-key="skuUuid">
            <el-table-column type="selection" :reserve-selection="true" :selectable="selectable"> </el-table-column>
            <el-table-column
            prop="date"
            label="序号"
            min-width="25"
            type="index"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="spuShowName"
            label="产品名称"
            align="center"
          ></el-table-column>
          <el-table-column
            label="SKU编码"
            align="center"
          >
            <template v-slot="{row}">
              <span>({{row.skuCode}}){{ row.specsName }}</span>
            </template>
        </el-table-column>
          <el-table-column
            prop="planOfldQuantity"
            label="应到货数量"
            align="center"
          >
          </el-table-column>
          <el-table-column
            label="已到货数量"
            align="center"
          >
          <template v-slot="{row}">
            <el-button type="text"
            size="small" v-if="row.actualOfldQuantity != 0" @click="openDialog(row)">{{ row.actualOfldQuantity }}</el-button>
            <span v-if="row.actualOfldQuantity == 0">{{ row.actualOfldQuantity }}</span>
          </template>
        </el-table-column>
        <el-table-column
            label="实际到货日期"
            width="200"
            align="center"
          >
          <template v-slot="{row}" >
            <el-date-picker
            v-if="row.arrivalStatus == 0"
            style="width: 100%"
            v-model="row.actualGoodsArrived"
            value-format="timestamp"
            type="date"
            placeholder="请选择日期"
          ></el-date-picker>
          <span v-if="row.arrivalStatus == 1">{{ getFormatDate(row.actualOfldTime) }}</span>
          </template>
        </el-table-column>
          <el-table-column
            label="本次到货数量"
            align="center"
          >
          <template v-slot="{row}">
            <el-input v-if="row.arrivalStatus == 0" v-model="row.thisOfldQuantity" ></el-input>
            <span v-if="row.arrivalStatus == 1">{{ row.thisOfldQuantity }}</span>
          </template>
        </el-table-column>
        <el-table-column
            prop="arrivalStatusName"
            label="状态"
            align="center"
          ></el-table-column>
        <el-table-column
            label="操作"
            align="center"
          >
          <template v-slot="{row}">
            <el-button type="text" v-if="row.arrivalStatus == 0" @click="notarizeConfirm(row)">保存</el-button>
            <el-button type="text" v-if="row.arrivalStatus == 0" @click="notarizeWriteOff(row)">核销</el-button>
          </template>
        </el-table-column>
        </el-table>
        <el-dialog title="详情" @close="dialogVisible = false" :visible.sync="dialogVisible" width="40%">
          <el-table :data="arrivalList" center>
            <el-table-column
            
            label="实际到货日期"
            align="center"
          >
          <template v-slot="{row}">
            <span>{{ getFormatDate(row.actualOfldTime) }}</span>
          </template>
          </el-table-column>
          <el-table-column
            prop="actualOfldQuantity"
            label="本次到货数量"
            align="center"
          >
          </el-table-column>
          <el-table-column
            prop="checkUserName"
            label="操作人"
            align="center"
          >
          </el-table-column>
          </el-table>
        </el-dialog>
  </div>
</template>

<script>
import{ getSupplierList } from '@/api/cargoPulling/common'
import { getNotarizeStatus,getNotarizeTable,getNotarizeList,notarize,notarizeWriteOff,getArrivedDetail,batchNotarize } from '@/api/cargoPulling/cargoNotarize'
import{ getFormatDate } from '@/utils/common'
export default {
  data(){
    return{
      reqParams:{
      actualGoodsArrived: "",
      arrivalStatus: "",
      page: 1,
      pageSize: 10,
      supplierUuid: "",
      },
      // 供应商列表
      supplierList:[],
      // 核对状态列表
      notarizeStatusList:[],
      // 主表数据
      tableData:[],
      loading:false,
      total:0,
       // 选择行的索引值
      selectIndex: -1,
      // 核对列表传参
      notarizeParams:{
        planGoodsArrrivedTime: "",
        supplierUuid: "",
        arrivalStatus:"",
        deliveryWarehouseUuid:"",
        ofldWarehouseUuid:""
      },
      // 核对列表数据
      notarizeList:[],
      // 详情核对状态判断
      pickerOptions: {
          shortcuts: [{
            text: '今天',
            onClick(picker) {
              picker.$emit('pick', new Date());
            }
          }, {
            text: '明天',
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() + 3600 * 1000 * 24);
              picker.$emit('pick', date);
            }
          }]
        },
        // 已到货数量记录弹窗
        dialogVisible:false,
        // 选择的核销记录
        orderLists:[],
        // 已到货数量记录列表
        arrivalList:[]
    }
  },
  created(){
    let currentDate = new Date();
    this.reqParams.actualGoodsArrived = currentDate.getTime()
    this.getSuppliers()
    this.getNotarizeStatus()
    this.getPageList(1)
  },
  methods:{
     // 获取供应商列表
    async getSuppliers() {
      const res = await getSupplierList();
      this.supplierList = res.data;
    },
    // 获取核对状态列表
    async getNotarizeStatus() {
      const res = await getNotarizeStatus();
      this.notarizeStatusList = res.data;
    },
    // 获取确认列表
    async getPageList(page) {
      this.notarizeList = []
      this.notarizeParams = this.$options.data().notarizeParams
      this.loading = true
      if(page == 1){
        this.reqParams.page = 1
      }
      this.selectIndex = -1
      const res = await getNotarizeTable(this.reqParams);
      this.tableData = res.data.records;
      this.total = res.data.total
      this.loading = false
    },
    getFormatDate(timestamp){
      return getFormatDate(timestamp)
    },
    // 打开已到货数量记录弹窗
    async openDialog(row){
      const res = await getArrivedDetail({ofldDetailUuidList: row.ofldDetailUuidList})
      this.arrivalList = res.data
      this.dialogVisible = true
    },
    // 获取核对列表
    async handleEdit(row){
      this.selectIndex = this.tableData.indexOf(row)
      this.notarizeParams.supplierUuid = row.supplierUuid
      this.notarizeParams.deliveryWarehouseUuid = row.deliveryWarehouseUuid
      this.notarizeParams.ofldWarehouseUuid = row.ofldWarehouseUuid
      this.notarizeParams.planGoodsArrrivedTime = this.reqParams.actualGoodsArrived
      this.handleNotarize()
      // this.notarizeParams.planGoodsArrrivedTime = this.notarizeList[0].actualOfldTime
    },
    // 点击修改tab行颜色
    rowStyle({ row,rowIndex }) {
      if (this.selectIndex === rowIndex) {
        return {
          'background-color': 'rgb(235,240,240)',
          cursor: 'pointer',
        }
      }
      return { cursor: 'pointer' }
    },
    // 获取核对列表
    async handleNotarize(){
      let res = await getNotarizeList(this.notarizeParams)
      let list = res.data
      list.forEach(item => {
        let currentDate = new Date();
        item.actualGoodsArrived = currentDate.getTime()
      });
      this.notarizeList = list
    },
    handleSelectionChange(val) {
      this.orderLists = val; 
      // console.log(this.orderLists)
    },
    // 保存确认
    async notarizeConfirm(row){
      const res = await notarize(row)
      if(res.data == true){
        this.$message.success('保存成功')
        this.loading = true
        const res = await getNotarizeTable(this.reqParams);
      this.tableData = res.data.records;
      this.loading = false
        this.handleNotarize()
      }else{
        this.$message.error('保存失败')
      }
    },
    // 核销
    async notarizeWriteOff(row){
      if(row.thisOfldQuantity == 0  && row.actualOfldQuantity == 0){
        return this.$message.error('请先确认数量')
      }
      const res = await batchNotarize({addOfldConfirmsDTO:[row]})
      if(res.code == 200){
        this.loading = true
        this.$message.success('核销成功')
        const res = await getNotarizeTable(this.reqParams);
        this.tableData = res.data.records;
        this.total = res.data.total
        this.loading = false
        this.handleNotarize()
      }else{
        this.$message.error(res.data)
      }
    },
    // 批量核销
    async notarizeWriteOffAll(){
      this.orderLists.map(item =>{
        if(item.thisOfldQuantity == 0 && item.actualOfldQuantity == 0){    
          return this.$message.error('请先确认数量')
        }
      })
      const res = await batchNotarize({addOfldConfirmsDTO:this.orderLists})
      if(res.code == 200){
        this.$message.success('批量核销成功')
        this.$refs.tabel.clearSelection()
        this.getPageList(1)
      }else{
        this.$message.error(res.data)
      }
    },
    selectable(row) {
      // 只有 status 为 'active' 的行可以勾选
      return row.arrivalStatus == 0;
    },

  }
}
</script>

<style scoped>

</style>