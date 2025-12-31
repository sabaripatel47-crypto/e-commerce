<template>
  <div class="app-container">
    <el-form class="page-search" inline ref="page-filter">
      <!--提交时间范围 -->
      <el-form-item label="计划拉货时间:" style="margin-right: 20px">
        <el-date-picker
          v-model="reqParams.ofldMonth"
          :clearable="false"
          type="month"
          align="right"
          value-format="timestamp"
          @change="changeTime"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="供应商:" style="margin-right: 20px;">
        <el-select v-model="reqParams.supplierUuid" filterable clearable placeholder="请选择供应商">
          <el-option
            v-for="(item, index) in supplierSelectList"
            :key="item.uuid"
            :label="item.supplierName"
            :value="item.uuid"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="产品名称:" style="margin-right: 20px;">
        <el-select
          v-model="reqParams.spuUuid"
          filterable
          clearable
          @change="spuSelectChange"
          placeholder="请选择产品名称"
        >
          <el-option
            v-for="(item, index) in spuSelectList"
            :key="item.uuid"
            :label="item.name"
            :value="item.uuid"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="SKU:" style="margin-right: 20px;">
        <el-select
          v-model="reqParams.skuUuidList"
          filterable
          multiple
          clearable
          placeholder="请选择SKU"
        >
          <el-option
            v-for="(item, index) in skuSelectList"
            :key="item.code"
            :label="item.extendKeyword + '(' + item.name + ')'"
            :value="item.code"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="clickSearch()">搜索</el-button>
        <!-- 导出 -->
        <el-button type="primary" @click="outputExcel">导出</el-button>

      </el-form-item>
    </el-form>

    <el-table
      v-loading="tableLoading"
      border
      max-height="700"
      :data="tableList"
      style="width: 100%"
    >
      <el-table-column
        label="供应商"
        width="150"
        show-overflow-tooltip
        prop="supplierName"
        align="center"
      ></el-table-column>
      <el-table-column
        label="产品名称"
        width="150"
        show-overflow-tooltip
        prop="spuShowName"
        align="center"
      ></el-table-column>
      <el-table-column
        label="SKU编码"
        min-width="240"
        show-overflow-tooltip
        prop="skuCode"
        align="center"
      >
        <template v-slot="{ row }">
          <span v-if="!row.isAdd">{{ row.specsName + "(" + row.skuCode + ")" }}</span>
        </template>
      </el-table-column>
       <el-table-column
        label="采购负责人"
        width="150"
        show-overflow-tooltip
        prop="purchaseManageName"
        align="center"
      ></el-table-column>
      <el-table-column label="仓库库存" show-overflow-tooltip prop="stockNum" align="center"></el-table-column>
      <el-table-column label="工厂库存" show-overflow-tooltip prop="supplierStockNum" align="center"></el-table-column>
      <el-table-column
        label="下月备货量"
        width="100"
        show-overflow-tooltip
        prop="stockUpQuantity"
        align="center"
      ></el-table-column>
      <template v-for="(item,index) in headList">
        <el-table-column
          width="90"
          :label="getFormatDate(item)"
          show-overflow-tooltip
          align="center"
        >
          <template v-slot="{row}">
            <span>{{ row.ofldSalseReportsVOList[index].salesNum }}</span>
          </template>
        </el-table-column>
      </template>
    </el-table>
    <pagination
      v-show="tableTotal > 0"
      :total="tableTotal"
      :page.sync="reqParams.page"
      :limit.sync="reqParams.pageSize"
      @pagination="handlePageChange"
    />
  </div>
</template>

<script>
import { getCargoBoardList,downloadFile } from '@/api/cargoPulling/cargoBoard'
import { tansParams, blobValidate } from "@/utils/ruoyi";

import {
  skuCodeToProductCode, // 根据spuUuid获取sku下拉框数据
  getSupplierSelectList, // 供应商下拉框
} from '@/api/baseData/common'
import {
  getProductNameList, // 产品下拉框
} from '@/api/cargoPulling/common'
import { getFormatDate,getFormaMonth } from '@/utils/common'
import { saveAs } from 'file-saver'
export default {
  name: 'CargoBoard',
  data() {
    return {
      // 列表
      tableList: [], // 数据
      tableLoading: false, // 加载状态
      tableTotal: 0, // 数据总数
      headList: [], // 表头

      // 下拉框
      supplierSelectList: [], // 供应商
      spuSelectList: [], // 产品
      skuSelectList: [], // sku

      // 列表请求入参
      reqParams: {
        ofldMonth: '', // 计划拉货时间
        page: 1,
        pageSize: 10,
        skuUuidList: [],
        spuUuid: '',
        supplierUuid: '',
      },
    }
  },
  async created() {
    this.reqParams.ofldMonth = new Date().getTime()
    await this.getList()
    this.getSupplierSelectList()
    this.getSpuSelectList()
  },
  methods: {
    // 时间change
    changeTime(e) {
      console.log('e', e)
    },

    // 时间格式转换
    getFormatDate(time) {
      return getFormatDate(+time)
    },
    getFormaMonth(timestamp){
      return getFormaMonth(timestamp)
    },
    // 获取列表数据
    async getList() {
      this.tableLoading = true

      const res = await getCargoBoardList(this.reqParams)
      this.tableTotal = res.data.total
      this.tableList = res.data.records || []
      if (this.tableList.length) {
        this.headList = this.tableList[0].ofldSalseReportsVOList.map(
          (item) => item.salesTime
        )
      } else {
        this.headList = []
      }

      this.tableLoading = false
    },

    // 点击分页
    handlePageChange(val) {
      this.reqParams.page = val.page
      this.getList()
    },

    // 点击搜索
    clickSearch() {
      this.reqParams.page = 1
      this.getList()
    },

    // 产品名称选择change 获取sku下拉框数据
    spuSelectChange(val) {
      this.reqParams.skuUuidList = []
      if (val) {
        return this.getSkuSelectList()
      }
      this.skuSelectList = []
    },

    // 获取供应商下拉框
    async getSupplierSelectList() {
      const res = await getSupplierSelectList()
      this.supplierSelectList = res.data
    },

    // 获取产品下拉框
    async getSpuSelectList() {
      const res = await getProductNameList()
      this.spuSelectList = res.data
    },

    // 获取sku下拉框
    async getSkuSelectList() {
      const res = await skuCodeToProductCode(this.reqParams.spuUuid)
      this.skuSelectList = res.data
    },
    jsonToUrlEncoded(jsonObj) {
      return Object.keys(jsonObj)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(jsonObj[key])}`)
      .join('&');
    },
    async outputExcel(){
      // this.download('/server/ofld/ofldReportsForExcel',this.reqParams,'拉货看板.xlsx')
      // downloadFile(this.reqParams).then(res => {
      //   saveAs(res, '拉货看板.xlsx')
      // })
      if(this.tableList.length == 0){
        return this.$message.error('暂无数据导出')
      }
      downloadFile(this.reqParams).then(async (data) => {
        console.log(data)
        const isBlob = blobValidate(data);
      if (isBlob) {
        const blob = new Blob([data]);
        saveAs(blob, `${getFormaMonth(this.reqParams.ofldMonth)}_拉货记录.xlsx`);
      }
      }).catch((r) => {
      console.error(r);
      Message.error("下载文件出现错误，请联系管理员！");
      downloadLoadingInstance.close();
    });
    }
  },
}
</script>

<style>
</style>