<template>
  <div class="app-container">
    <div class="head-container">
      <el-radio-group v-model="activeName">
        <el-radio-button :label="1">职能部门</el-radio-button>
        <el-radio-button :label="2">SPU</el-radio-button>
      </el-radio-group>

      <el-form class="page-search" inline style="margin-top: 10px">
        <!--时间范围 -->
        <el-form-item label="时间范围：" style="margin-right: 20px">
          <el-date-picker
            v-model="dateRange"
            :clearable="false"
            type="daterange"
            align="right"
            :picker-options="pickerOptions"
            unlink-panels
            value-format="timestamp"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="产品名称：" style="margin-right: 20px">
          <el-select v-model="spuUuid" filterable clearable @change="getSkuList" placeholder="请选择">
            <el-option
              v-for="item in spuList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="SKU：" v-if="activeName === 1" style="margin-right: 20px">
          <el-select v-model="skuUuid" filterable clearable placeholder="请选择">
            <el-option
              v-for="item in skuList"
              :key="item.code"
              :label="`(${item.name})${item.extendKeyword}`"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="职能：" style="margin-right: 20px">
          <el-select
            clearable
            filterable
            v-model="departmentUuid"
            @change="getTypeList(), getProblemTypeList()"
            placeholder="请选择"
          >
            <el-option
              v-for="item in funcList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="问题类型：" v-if="activeName === 2" style="margin-right: 20px">
          <el-select v-model="departmentLevelUuid" filterable clearable placeholder="请选择">
            <el-option
              v-for="item in typeList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="问题细分：" v-if="activeName === 2" style="margin-right: 20px">
          <el-select v-model="problemTypes" filterable clearable placeholder="请选择">
            <el-option
              v-for="item in problemTypeList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin-right: 20px">
          <el-button
            type="primary"
            v-if="activeName === 1"
            icon="el-icon-search"
            @click="searchDepartment"
          >查询</el-button>

          <span style="color: #409eff" v-if="activeName === 1">
            <el-tooltip
              class="item"
              effect="dark"
              content="百分比计算方式：售后问题量/飞梭店铺中过滤赠品和配件的总订单数"
              placement="top"
            >
              <svg class="icon" preserveAspectRatio="xMidYMid meet">
                <use xlink:href="#icon-question" fill="#409EFF" />
              </svg>
            </el-tooltip>
          </span>
          <el-button
            type="primary"
            v-if="activeName === 2"
            icon="el-icon-search"
            @click="searchSpu"
          >查询</el-button>
        </el-form-item>
      </el-form>
    </div>
    <DepartmentView
      @changeTab="changeToSpu"
      ref="departmentView"
      :date="dateRange"
      :spu="spuUuid"
      :sku="skuUuid"
      :department="departmentUuid"
      v-if="activeName === 1"
    />
    <SPUView
      @changeTab="changeToDepartment"
      ref="spuView"
      :date="dateRange"
      :spu="spuUuid"
      :problemTypes="problemTypes"
      :departmentLevelUuid="departmentLevelUuid"
      :departmentUuid="departmentUuid"
      v-if="activeName === 2"
    />
  </div>
</template>

<script>
import {
  getAfterSaleDetailSPU,
  getAfterSaleDetailSPUType,
  getAfterSaleDetailSPUType2,
} from '@/api/deliveryCenter/afterSale'
import {
  listSpuName,
  skuCodeToProductCode,
} from '@/api/purchasingManagement/purchaseRecord'
import DepartmentView from './components/DepartmentView.vue'
import SPUView from './components/SPUView.vue'
import { addDay, getFormaMonth } from '@/utils/common'

export default {
  name: 'AfterSale',
  components: {
    DepartmentView,
    SPUView,
  },
  data() {
    return {
      // 职能/SPU切换
      activeName: 1,
      // 日期
      dateRange: [],
      // 职能列表
      funcList: [],
      // 问题类型列表
      typeList: [],
      // sku列表
      skuList: [],
      // 产品列表
      spuList: [],
      // 产品
      spuUuid: '',
      // sku
      skuUuid: '',
      // 职能
      departmentUuid: '',
      // 问题类型
      departmentLevelUuid: '',
      // 问题细分
      problemTypes: '',
      problemTypeList: '',
      // 日期限制
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
            const one = 31 * 24 * 3600 * 1000
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
            return time.getTime() >= Date.now()
          }
        },
      },
    }
  },
  created() {
    this.dateRange[0] = addDay(-7)
    this.dateRange[1] = addDay(-1)
    if (this.$route.query.date) {
      this.dateRange = this.$route.query.date
    }
    this.getFuncList()
    this.getSpuList()
  },
  methods: {
    // 职能下拉框
    async getFuncList() {
      const res = await getAfterSaleDetailSPU()
      this.funcList = res.data
      // this.departmentUuid = this.funcList[0].code;
      // this.getTypeList();
      // this.getSPUList()
    },
    // 问题类型下拉框
    async getTypeList() {
      this.departmentLevelUuid = ''
      this.typeList = []
      if (this.departmentUuid != '') {
        const res = await getAfterSaleDetailSPUType(this.departmentUuid)
        this.typeList = res.data
      }
    },
    // 问题细分下拉框
    async getProblemTypeList() {
      this.departmentLevelUuid = ''
      this.typeList = []
      if (this.departmentUuid != '') {
        const res = await getAfterSaleDetailSPUType2(this.departmentUuid)
        this.problemTypeList = res.data
      }
    },
    // 产品名称下拉
    async getSpuList() {
      const res = await listSpuName()
      this.spuList = res.data
    },
    // SKU下拉
    async getSkuList() {
      this.skuList = []
      this.skuUuid = ''
      if (this.spuUuid != '') {
        const res = await skuCodeToProductCode(this.spuUuid)
        this.skuList = res.data
      }
    },
    // 切换到SPU
    changeToSpu(departmentUuid, departmentLevelUuid, problemTypes) {
      this.skuUuid = ''
      this.departmentUuid = departmentUuid
      this.getTypeList()
      this.getProblemTypeList()
      this.problemTypes = problemTypes
      this.departmentLevelUuid = departmentLevelUuid
      this.activeName = 2
    },
    // 切换到职能
    changeToDepartment(spu, sku) {
      this.departmentLevelUuid = ''
      this.spuUuid = spu
      this.getSkuList()
      this.skuUuid = sku
      this.activeName = 1
    },
    // spu搜索
    searchSpu() {
      this.$refs.spuView.getSpuList(1)
    },
    // 职能搜索
    searchDepartment() {
      this.$refs.departmentView.getAfterSaleDetailData()
    },
  },
}
</script>

<style lang="scss" scoped>
.icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: #606266;
}
</style>
