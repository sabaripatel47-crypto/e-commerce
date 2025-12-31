<template>
  <div class="app-container">
    <!-- 搜索 -->
    <div class="head-container">
      <el-form class="page-search" inline ref="page-filter">
        <el-form-item label="spu搜索:" style="margin-right: 20px;">
          <el-input
            placeholder="请输入spu名称"
            v-model="reqParams.keyword"
            clearable
            class="handle-input"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="clickSpuSeacher()">搜索</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" plain icon="el-icon-plus" @click="addSpuData()">新增</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="container">
      <!-- spu表格 -->
      <el-table
        max-height="600"
        :data="spuList"
        style="width: 100%"
        v-loading="tableLoading"
        @row-click="handleCurrentChange"
      >
        <el-table-column type="index" label="序号" width="70" align="center"></el-table-column>
        <el-table-column
          class="el-form-item-width40"
          prop="showName"
          label="产品名称"
          align="center"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          class="el-form-item-width40"
          prop="purchaseManageName"
          label="spu采购负责人"
          align="center"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          class="el-form-item-width40"
          prop="spuLevelName"
          label="产品等级"
          align="center"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          class="el-form-item-width40"
          prop="brandUuidName"
          label="品牌名称"
          align="center"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          class="el-form-item-width40"
          prop="spuTypeName"
          label="产品类别"
          align="center"
        ></el-table-column>
        <el-table-column
          class="el-form-item-width40"
          prop="isGiftsName"
          label="是否是赠品"
          align="center"
        ></el-table-column>
        <!-- <el-table-column class="el-form-item-width40" prop="intro" label="介绍" align="center"></el-table-column> -->
        <el-table-column
          class="el-form-item-width40"
          prop="spuStatusName"
          label="产品运营状态"
          align="center"
        ></el-table-column>
        <el-table-column
          class="el-form-item-width40"
          prop="listingDate"
          label="上架时间"
          align="center"
        ></el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template v-slot="{ row }">
            <el-button size="mini" type="text" icon="el-icon-edit" @click="editSpuData(row)">修改</el-button>
            <!-- <el-button size="mini" type="text" icon="el-icon-delete" @click="spuDelete(row.uuid)">删除</el-button> -->
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="reqParams.page"
        :limit.sync="reqParams.pageSize"
        @pagination="getListSpu"
      />
    </div>
    <!-- 新增弹层 -->
    <el-dialog
      :title="isEdit ? '修改spu' : '新增spu'"
      :visible="showAddDialog"
      :close-on-click-modal="false"
      :before-close="cleanAdd"
      width="40%"
    >
      <el-form
        :model="editDetail"
        :rules="spuRules"
        ref="addDetailRef"
        label-width="120px"
        label-position="right"
      >
        <el-form-item label="ERP产品名称" prop="erpSpuName">
          <el-input
            class="el-form-item-width40"
            v-model="editDetail.erpSpuName"
            clearable
            placeholder="请输入ERP产品名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="显示名称" prop="showName">
          <el-input
            class="el-form-item-width40"
            v-model="editDetail.showName"
            clearable
            placeholder="请输入显示名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="spu采购负责人" prop="purchaseManage">
          <el-cascader
            class="el-form-item-width40"
            filterable
            v-model="editDetail.purchaseManage"
            :options="managerList"
            :show-all-levels="false"
            :props="{ children: 'children', label: 'deptName', value: 'deptId', checkStrictly: false }"
            clearable
          ></el-cascader>
        </el-form-item>
        <el-form-item label="产品等级" prop="spuLevel">
          <el-select
            class="el-form-item-width40"
            v-model="editDetail.spuLevel"
            filterable
            placeholder="请选择产品等级"
          >
            <el-option
              v-for="item in levelSpuList"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>

        <!-- 下拉选择品类 -->
        <el-form-item label="货品分类" style="margin-right: 20px;width: 360px;" prop="categoryUuid">
          <el-cascader
            class="el-form-item-width40"
            filterable
            v-model="editDetail.categoryUuid"
            :options="Cadepartments"
            :show-all-levels="false"
            :props="{ children: 'children', label: 'cateName', value: 'uuid', checkStrictly: false,multiple: false }"
            clearable
          ></el-cascader>
        </el-form-item>

        <el-form-item label="所属品牌" prop="brandUuid">
          <el-select
            class="el-form-item-width40"
            v-model="editDetail.brandUuid"
            filterable
            placeholder="请选择所属品牌"
          >
            <el-option
              v-for="item in brandList"
              :label="item.name"
              :value="item.code"
              :key="item.name"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="产品类别" prop="spuType">
          <el-select
            class="el-form-item-width40"
            v-model="editDetail.spuType"
            filterable
            placeholder="请选择产品类别"
          >
            <el-option
              v-for="item in typeSpuList"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否是赠品" prop="isGifts">
          <el-radio-group class="el-form-item-width40" v-model="editDetail.isGifts">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="上架时间" prop="listingTime">
          <el-date-picker
            v-model="editDetail.listingTime"
            type="datetime"
            placeholder="选择日期时间"
            @change="handleDateChange"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="产品状态" prop="spuStatus">
          <el-radio-group class="el-form-item-width40" v-model="editDetail.spuStatus">
            <el-radio :label="0">运营</el-radio>
            <el-radio :label="1">关闭</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="产品介绍">
          <el-input
            type="textarea"
            class="el-form-item-width40"
            v-model="editDetail.intro"
            clearable
            placeholder="请输入产品介绍"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cleanAdd">取 消</el-button>
        <!-- <el-button type="primary" @click="submitForm">确 定</el-button> -->
        <DebounceButton :type="'primary'" :onClick="submitForm">确 定</DebounceButton>
      </span>
    </el-dialog>

    <!-- sku搜索 -->
    <div class="head-container sku-content">
      <el-form class="page-search" inline ref="page-filter">
        <el-form-item label="sku搜索:" style="margin-right: 20px;">
          <el-input
            placeholder="请输入sku编码"
            v-model="reqParamsSku.keyword"
            clearable
            class="handle-input"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">全量搜索</el-button>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            v-if="reqParamsSku.spuUuid !== ''"
            @click="SkuSearch"
          >搜索</el-button>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            plain
            icon="el-icon-plus"
            v-if="reqParamsSku.spuUuid !== ''"
            @click="addSkuData"
          >新增</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="container">
      <!-- sku表格 -->
      <el-table :data="skuList" max-height="600" style="width: 100%">
        <el-table-column type="index" label="序号" width="70" align="center"></el-table-column>
        <el-table-column
          class="el-form-item-width40"
          prop="skuCode"
          label="SKU编码"
          align="center"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          class="el-form-item-width40"
          prop="specsName"
          label="规格名称"
          align="center"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          class="el-form-item-width40"
          prop="mainSupplierName"
          label="主供应商"
          align="center"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          class="el-form-item-width40"
          label="全部供应商"
          align="center"
          show-overflow-tooltip
        >
          <template v-slot="{row}">
            <span
              v-for="item in row.mainSupplierValue"
            >{{ item.supplierName ? item.supplierName + ',' : ''}}</span>
          </template>
        </el-table-column>
        <el-table-column
          class="el-form-item-width40"
          prop="salesPrice"
          label="出售价格"
          align="center"
          show-overflow-tooltip
        ></el-table-column>
        <!-- <el-table-column class="el-form-item-width40" prop="info" label="商品介绍" align="center"></el-table-column> -->
        <el-table-column
          class="el-form-item-width40"
          prop="skuStatusName"
          label="上架状态"
          align="center"
        ></el-table-column>
        <el-table-column class="el-form-item-width40" label="SKU图片" align="center">
          <template v-slot="{ row, $index }">
            <el-image
              v-if="row.image"
              style="height: 30px;width: 30px;"
              :src="row.image + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
              :preview-src-list="[row.image]"
            ></el-image>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template v-slot="{ row }">
            <el-button size="mini" type="text" icon="el-icon-edit" @click="editSkuData(row)">修改</el-button>
            <!-- <el-button size="mini" type="text" icon="el-icon-delete" @click="skuDelete(row.uuid)">删除</el-button> -->
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <pagination
        v-show="totalSku > 0"
        :total="totalSku"
        :page.sync="reqParamsSku.page"
        :limit.sync="reqParamsSku.pageSize"
        @pagination="getListSku"
      />
    </div>
    <!-- 新增弹层 -->
    <el-dialog
      :title="isEdit ? '修改sku' : '新增sku'"
      :visible="showAddSkuDialog"
      :close-on-click-modal="false"
      :before-close="cleanAddSku"
      width="40%"
    >
      <el-form
        :model="editDetail"
        :rules="skuRules"
        ref="addDetailSkuRef"
        label-width="120px"
        label-position="right"
      >
        <el-form-item label="sku编码" prop="skuCode">
          <el-input
            class="el-form-item-width40"
            v-model="editDetail.skuCode"
            clearable
            placeholder="请输入sku编码"
          ></el-input>
        </el-form-item>
        <el-form-item label="规格名称" prop="specsName">
          <el-input
            class="el-form-item-width40"
            v-model="editDetail.specsName"
            clearable
            placeholder="请输入规格名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="主供应商">
          <el-select
            class="el-form-item-width40"
            v-model="editDetail.mainSupplier"
            @change="changeSupplier"
            filterable
            placeholder="请选择主供应商"
          >
            <el-option
              v-for="item in supplierList"
              :label="item.supplierName"
              :value="item.uuid"
              :key="item.uuid"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="全部供应商"
          v-if="editDetail.mainSupplierAll.length>0"
          v-for="(item,index) in editDetail.mainSupplierAll"
          :label="'全部供应商'+(index+1)"
          :key="index"
        >
          <div style="display: flex;">
            <el-form-item>
              <el-select v-model="item.supplierUuid" clearable filterable placeholder="请选择供应商">
                <el-option
                  v-for="item in supplierList"
                  :label="item.supplierName"
                  :value="item.uuid"
                  :key="item.uuid"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-input placeholder="请输入周期（天数）" class="add_input" v-model="item.productionNumber"></el-input>
            </el-form-item>
            <el-button style="margin-left: 10px;" @click="deleteAllSupplier(index)">删除</el-button>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button v-if="editDetail.mainSupplier" @click="addAllSupplier()">新增全部供应商</el-button>
        </el-form-item>
        <el-form-item label="指导价格">
          <el-input
            class="el-form-item-width40"
            v-model="editDetail.salesPrice"
            clearable
            placeholder="请输入指导价格"
          ></el-input>
        </el-form-item>
        <el-form-item prop="image">
          <template #label>
            <span class="required-star">*</span>图片
          </template>
          <OSSFileUpload
            :sign.sync="sign"
            :fileType.sync="fileType"
            :fileRecordList.sync="fileRecordList"
            :isPicture.sync="isPicture"
            :showLoading.sync="showLoading"
            @getFileUrl="getFileUrl"
            @getFileName="getFileName"
            @deleteFile="deleteFile"
            ref="OSSFileUploadRef"
          ></OSSFileUpload>
        </el-form-item>
        <el-form-item label="sku状态" prop="skuStatus">
          <el-radio-group class="el-form-item-width40" v-model="editDetail.skuStatus">
            <el-radio :label="0">运营</el-radio>
            <el-radio :label="1">关闭</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="产品介绍">
          <el-input
            type="textarea"
            class="el-form-item-width40"
            v-model="editDetail.info"
            clearable
            placeholder="请输入产品介绍"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cleanAddSku">取 消</el-button>
        <!-- <el-button type="primary" v-if="editDetail.setUuid !== ''" @click="submitSkuForm()">确 定</el-button> -->
        <DebounceButton
          :type="'primary'"
          v-if="editDetail.setUuid !== ''"
          :onClick="submitSkuForm"
        >确 定</DebounceButton>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  getSpuList,
  getSkuList,
  addSpu,
  editSpu,
  deleteSpu,
  addSku,
  editSku,
  deleteSku,
  getOssSign,
  getSupplierList,
  getSupplierListById,
  category,
} from '@/api/baseData/spuAndSku'
import {
  listSpuLevel,
  brandPush,
  spuTypeList,
  getOSSFileUuid,
  categoryList,
} from '@/api/baseData/common'
import { department } from '@/api/information/department'
import { deepClone } from '@/utils/common'
import { getDeptTreeData, getFormatDate } from '@/utils/common'
export default {
  name: 'SpuAndSku',
  data() {
    return {
      //产品等级下拉框
      levelSpuList: [],

      fileType: ['.jpg', '.png', '.jpeg', '.webp'],
      // 文件上传是否为图片
      isPicture: true,

      // 获取文件uuid入参
      getUrlUuidReqParams: {
        fileName: '',
        originalName: '',
        platformType: 1,
      },

      // 图片大图预览数组
      // srcList: [],

      // oss文件上传签名
      sign: {},

      // 显示文件上传中
      showLoading: true,

      //产品类别
      typeSpuList: [],

      // 文件记录
      fileRecordList: [],

      //品牌
      brandList: [],

      //编辑的数据
      editDetail: {
        image: '',
        spuUuid: '',
        mainSupplierAll: [],
      },
      //是否是编辑
      isEdit: false,

      //spu总条数
      total: 0,

      //sku总条数
      totalSku: 0,

      //spu集合数据
      spuList: [],

      //sku集合数据
      skuList: [],

      //供应商下拉框
      supplierList: [],
      // 负责人下拉
      managerList: [],
      //品类下拉框
      Cadepartments: [],
      //spu入参
      reqParams: {
        keyword: '',
        page: 1,
        pageSize: 10,
      },

      //sku入参
      reqParamsSku: {
        keyword: '',
        page: 1,
        pageSize: 10,
        spuUuid: '',
      },

      // 列表加载中
      tableLoading: false,

      singleTableLoading: false,

      showAddDialog: false,

      showAddSkuDialog: false,

      //sku新增入参
      skuRules: {
        skuCode: [
          { required: true, message: '请输入sku编码', trigger: 'blur' },
          {
            min: 2,
            max: 32,
            message: '长度在 2 到 32 个字符',
            trigger: 'blur',
          },
        ],
        mainSupplier: [
          { required: true, message: '请选择主供应商', trigger: 'blur' },
        ],
        specsName: [
          { required: true, message: '请输入规格名称', trigger: 'blur' },
          {
            min: 2,
            max: 32,
            message: '长度在 2 到 32 个字符',
            trigger: 'blur',
          },
        ],
        salesPrice: [
          { required: true, message: '请输入指导价格', trigger: 'blur' },
        ],
        info: [{ required: true, message: '请输入产品介绍', trigger: 'blur' }],
        image: [
          // { required: true, message: '请添加图片', trigger: 'change' },
          {
            validator: (rule, value, callback) => {
              if (!this.editDetail.image) {
                // console.log('收款方式空空空', value)
                callback(new Error('请添加图片'))
              } else {
                // console.log('收款方式有有有', value)
                callback()
              }
            },
            trigger: 'change',
          },
        ],
        skuStatus: [
          { required: true, message: '请选择sku状态', trigger: 'change' },
        ],
      },
      //spu新增
      spuRules: {
        erpSpuName: [
          { required: true, message: '请输入ERP产品名称', trigger: 'blur' },
          {
            min: 2,
            max: 20,
            message: '长度在 2 到 20 个字符',
            trigger: 'blur',
          },
        ],
        categoryUuid: [
          { required: true, message: '请选择货品分类', trigger: 'change' },
        ],
        spuLevel: [
          { required: true, message: '请选择产品级别', trigger: 'change' },
        ],
        showName: [
          { required: true, message: '请输入显示名称', trigger: 'blur' },
          {
            min: 2,
            max: 32,
            message: '长度在 2 到 32 个字符',
            trigger: 'blur',
          },
        ],
        intro: [{ required: true, message: '请输入产品介绍', trigger: 'blur' }],
        brandUuid: [
          { required: true, message: '请选择所属品牌', trigger: 'change' },
        ],
        spuType: [
          { required: true, message: '请选择产品类别', trigger: 'change' },
        ],
        isGifts: [{ required: true, message: '是否是赠品', trigger: 'change' }],
        spuStatus: [
          { required: true, message: '请选择spu状态', trigger: 'change' },
        ],
        listingTime: [
          { required: true, message: '请选择上架时间', trigger: 'change' },
        ],
      },
    }
  },
  async created() {
    //产品类别下拉框
    await this.listSpuType()

    //品牌下拉框
    await this.listBrand()

    //产品等级下拉框
    await this.listSpu()

    // 获取spu列表信息
    await this.getListSpu()
    await this.getCategory()

    //获取sku列表
    // this.getListSku()
  },
  methods: {
    //时间戳
    handleDateChange(value) {
      // 将选择的时间转换为时间戳
      if (value) {
        const timestamp = Date.parse(value)
        // 更新数据模型中的时间戳
        this.editDetail.listingTime = timestamp
      } else {
        // 如果没有选择时间，则清空时间戳
        this.editDetail.listingTime = null
      }
    },

    // 删除文件
    deleteFile(val) {
      this.editDetail.image = ''
      this.getUrlUuidReqParams = {
        fileName: '', // 文件地址
        originalName: '', // 源文件名
        platformType: 1,
      }
    },
    // 获取文件源名称
    getFileName(val) {
      this.getUrlUuidReqParams.originalName = val
    },

    // 获取上传文件签名
    async getOssSignData() {
      const res = await getOssSign()
      this.sign = res.data
    },

    // 获取上传后的文件url
    async getFileUrl(val) {
      this.getUrlUuidReqParams.fileName = val
      // 如果上传新文件 重新获取uuid提交
      if (this.getUrlUuidReqParams.fileName !== '') {
        const res = await getOSSFileUuid(this.getUrlUuidReqParams)
        this.editDetail.image = res.data
        this.$modal.closeLoading()
      }
    },

    //产品类别下拉框
    async listSpuType() {
      const res = await spuTypeList()
      this.typeSpuList = res.data
    },

    //品牌下拉框
    async listBrand() {
      const res = await brandPush()
      this.brandList = res.data
    },

    //产品等级下拉框
    async listSpu() {
      const res = await listSpuLevel()
      this.levelSpuList = res.data
    },

    //数据集的选中行触发事件
    async handleCurrentChange(val) {
      this.reqParamsSku.spuUuid = val.uuid
      this.editDetail.spuUuid = val.uuid
      this.getListSku()
    },

    // 获取spu列表信息
    async getListSpu() {
      this.tableLoading = true
      const res = await getSpuList(this.reqParams)
      this.skuList = []
      this.reqParamsSku.page = 1
      this.reqParamsSku.spuUuid = ''
      this.totalSku = 0
      this.spuList = res.data.records
      this.total = res.data.total

      //把上架时间格式化
      for (let i = 0; i < this.spuList.length; i++) {
        var item = this.spuList[i]
        item.listingDate = getFormatDate(item.listingTime)
      }
      this.tableLoading = false
    },

    // 点击spu搜索
    clickSpuSeacher() {
      this.reqParams.page = 1

      this.getListSpu()
    },

    // 全量搜索sku
    async handleSearch() {
      this.reqParamsSku.page = 1
      this.reqParamsSku.spuUuid = ''
      this.singleTableLoading = true
      const res = await getSkuList(this.reqParamsSku)
      this.skuList = res.data.records

      this.totalSku = res.data.total
      this.singleTableLoading = false
    },
    // 搜索sku
    async SkuSearch() {
      this.reqParamsSku.page = 1
      this.reqParamsSku.spuUuid = ''
      this.singleTableLoading = true
      const res = await getSkuList(this.reqParamsSku)
      this.skuList = res.data.records
      // console.log(this.skuList)
      this.totalSku = res.data.total
      this.singleTableLoading = false
    },
    // 搜索sku
    async SkuSearch() {
      this.reqParamsSku.page = 1

      // 这段代码重复了
      this.singleTableLoading = true
      const res = await getSkuList(this.reqParamsSku)
      this.skuList = res.data.records
      // console.log(this.skuList)
      this.totalSku = res.data.total
      this.singleTableLoading = false
    },
    //获取sku列表
    async getListSku() {
      this.singleTableLoading = true
      const res = await getSkuList(this.reqParamsSku)

      // 提取图片列表
      // this.srcList = res.data.records
      //   .filter((item) => item.image && item.image.trim())
      //   .map((item) => item.image)

      this.skuList = res.data.records
      this.totalSku = res.data.total
      this.singleTableLoading = false
    },

    //新增spu
    addSpuData() {
      this.isEdit = false
      this.ListPrincipal()
      this.showAddDialog = true
    },

    //新增sku
    addSkuData() {
      this.isEdit = false
      this.getOssSignData()
      this.ListSupplier()
      console.log(this.editDetail)
      this.showAddSkuDialog = true
    },

    //spu取消新增
    cleanAdd() {
      this.showAddDialog = false

      this.$refs['addDetailRef'].resetFields()

      this.editDetail = this.$options.data().editDetail

      this.isEdit = false
    },
    //sku取消
    cleanAddSku() {
      this.showAddSkuDialog = false

      this.$refs['addDetailSkuRef'].resetFields()
      this.$nextTick(() => {
        this.$refs.OSSFileUploadRef.clearFileList()
      })
      this.getUrlUuidReqParams = {
        fileName: '', // 文件地址
        originalName: '', // 源文件名
        platformType: 1,
      }
      this.editDetail = {
        image: '',
        spuUuid: this.editDetail.spuUuid,
        mainSupplierAll: [],
      }

      this.fileRecordList = []

      this.isEdit = false
    },
    //项目品类组织架构下拉框
    async getCategory() {
      const res = await categoryList()
      this.Cadepartments = await getDeptTreeData(res.data)
    },
    // spu修改
    editSpuData(row) {
      this.isEdit = true
      this.ListPrincipal()
      this.editDetail = { ...row } // 深拷贝数据，确保数据结构正确

      this.showAddDialog = true // 打开对话框
    },

    // sku修改
    async editSkuData(row) {
      this.getOssSignData()
      this.ListSupplier()
      this.isEdit = true
      if (row.image && row.image !== '') {
        this.fileRecordList.push(row.image)
      }
      this.editDetail = { ...this.editDetail, ...row } // 深拷贝数据，确保数据结构正确
      this.editDetail.image = this.editDetail.imageUuid
      const res = await getSupplierListById(row.uuid)
      this.editDetail.mainSupplierAll = res.data
      this.showAddSkuDialog = true // 打开对话框
    },

    //spu新增/编辑的保存
    async submitForm() {
      if (Array.isArray(this.editDetail.purchaseManage)) {
        this.editDetail.purchaseManage =
          this.editDetail.purchaseManage[
            this.editDetail.purchaseManage.length - 1
          ]
      }
      if (Array.isArray(this.editDetail.categoryUuid)) {
        this.editDetail.categoryUuid =
          this.editDetail.categoryUuid[this.editDetail.categoryUuid.length - 1]
      }
      //必填校验
      this.$refs['addDetailRef'].validate(async (valid) => {
        if (valid) {
          if (this.isEdit) {
            await editSpu(this.editDetail)
          } else {
            await addSpu(this.editDetail)
          }
          this.$message({
            type: 'success',
            message: this.isEdit ? '修改成功' : '新增成功！',
          })
          //关闭弹窗
          this.cleanAdd()
          //刷新数据
          this.getListSpu()
        }
      })
    },
    // 新增全部供应商
    addAllSupplier() {
      this.editDetail.mainSupplierAll.push({
        productionNumber: '',
        supplierUuid: '',
      })
    },
    changeSupplier() {
      if (
        this.editDetail.mainSupplierAll.length < 1 &&
        this.editDetail.mainSupplier != undefined
      ) {
        this.editDetail.mainSupplierAll.push({
          productionNumber: '',
          supplierUuid: this.editDetail.mainSupplier,
        })
      }
      if (
        this.editDetail.mainSupplier == undefined ||
        this.editDetail.mainSupplier == ''
      ) {
        this.editDetail.mainSupplierAll = []
      }
    },
    // 删除全部供应商
    deleteAllSupplier(index) {
      this.editDetail.mainSupplierAll.splice(index, 1)
    },
    //sku新增/编辑的保存
    async submitSkuForm() {
      const list = this.editDetail.mainSupplierAll.map(
        (item) => item.supplierUuid
      )
      const nums = this.editDetail.mainSupplierAll.map(
        (item) => item.productionNumber
      )

      if (list.some((item, index) => list.indexOf(item) !== index)) {
        return this.$message({
          type: 'error',
          message: '请选择不同的供应商',
        })
      }
      // console.log(this.editDetail.mainSupplier)
      if (
        this.editDetail.mainSupplier != undefined &&
        this.editDetail.mainSupplier != '' &&
        !list.includes(this.editDetail.mainSupplier)
      ) {
        return this.$message({
          type: 'error',
          message: '全部供应商需包含主供应商',
        })
      }
      if (
        this.editDetail.mainSupplierAll.some(
          (item) => item.productionNumber == '' || item.supplierUuid == ''
        )
      ) {
        return this.$message({
          type: 'error',
          message: '请填写完整全部供应商的值或删除不需要的空行',
        })
      }
      //必填校验
      this.$refs['addDetailSkuRef'].validate(async (valid) => {
        if (valid) {
          if (this.isEdit) {
            await editSku(this.editDetail)
          } else {
            await addSku(this.editDetail)
          }
          this.$message({
            type: 'success',
            message: this.isEdit ? '修改成功' : '新增成功！',
          })
          //关闭弹窗
          this.cleanAddSku()
          //刷新数据
          this.getListSku()
        }
      })
    },

    //spu删除
    spuDelete(id) {
      let ids = []
      ids.push(id)
      this.$confirm('确定删除此spu数据，删除后不可恢复？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        beforeClose: async (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '删除中...'
            const [err, res] = await this.$to(deleteSpu({ ids: ids }))
            if (err) {
              console.error('spu删除失败', err)
            }
            instance.confirmButtonLoading = false
            await done()
            await this.getListSpu()
            if (res) {
              this.$message({
                type: 'success',
                message: '删除spu成功！',
              })
            }
          } else {
            await done()
          }
        },
      })
    },
    skuDelete(id) {
      let ids = []
      ids.push(id)

      this.$confirm('确定删除此sku数据，删除后不可恢复？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        beforeClose: async (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '删除中...'
            const [err, res] = await this.$to(deleteSku({ ids: ids }))
            if (err) {
              console.error('sku删除失败', err)
            }
            instance.confirmButtonLoading = false
            await done()
            await this.getListSku()
            if (res) {
              this.$message({
                type: 'success',
                message: '删除sku成功！',
              })
            }
          } else {
            await done()
          }
        },
      })
    },
    // 供应商下拉框
    async ListSupplier() {
      await getSupplierList().then((item) => {
        this.supplierList = item.data
      })
    },
    // 负责人下拉
    async ListPrincipal() {
      const res = await department()
      this.managerList = await getDeptTreeData(res.data)
      console.log(this.managerList)
    },
  },
}
</script>
<style lang="scss" scoped>
.sku-content {
  margin-top: 20px;
}
.add_input {
  margin-left: 10px;
  width: 8vw;
}
</style>
