<template>
  <!-- 订单明细 -->
  <div class="app-container">
    <el-form class="page-search" inline>
      <el-form-item label="统计类型：" style="margin-right: 20px">
        <el-select v-model="statisticsType" placeholder="请选择货品名称">
          <el-option
            v-for="item in statisticsTypeList"
            :key="item.code"
            :label="item.name"
            :value="item.code"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <div class="head-container">
      <el-radio-group v-model="activeName">
        <el-radio-button :label="1">SPU</el-radio-button>
        <el-radio-button :label="2">店铺</el-radio-button>
      </el-radio-group>
      <el-form class="page-search" inline style="margin-top: 5px">
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
        <el-form-item label="货品名称：" v-if="activeName == 1" style="margin-right: 20px">
          <el-select v-model="spu" filterable clearable placeholder="请选择货品名称">
            <el-option
              v-for="item in spuSelectList"
              :key="item.uuid"
              :label="item.name"
              :value="item.uuid"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="产品等级："
          v-if="activeName == 1"
          prop="spuLevel"
          style="margin-right: 20px"
        >
          <el-select v-model="spuLevel" filterable clearable placeholder="请选产品等级">
            <el-option
              v-for="item in levelSpuList"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="平台：" v-if="activeName == 2" style="margin-right: 20px">
          <el-select v-model="platform" placeholder="请选择平台" clearable>
            <el-option
              v-for="item in platforms"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="店铺："
          v-if="activeName == 2"
          prop="storeUuid"
          style="margin-right: 20px"
        >
          <el-select filterable v-model="storeUuid" placeholder="请选择店铺" clearable>
            <el-option
              v-for="item in stores"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin-right: 20px">
          <el-button type="primary" icon="el-icon-search" @click="searchData">搜索</el-button>
        </el-form-item>
      </el-form>
    </div>
    <ShopView
      ref="shopView"
      v-if="activeName == 2"
      :dateTime="dateRange"
      :platformUuid="platform"
      :statisticsType="statisticsType"
      :storeUuid="storeUuid"
    ></ShopView>
    <SpuView
      ref="spuView"
      v-if="activeName == 1"
      :dateTime="dateRange"
      :spuUuid="spu"
      :spuLevel="spuLevel"
      :statisticsType="statisticsType"
    ></SpuView>
  </div>
</template>

<script>
import {
  getProductNameList, // 产品下拉框
} from '@/api/cargoPulling/common'
import { listPlatform, listStore, listSpuLevel } from '@/api/baseData/common'
import ShopView from './components/ShopView.vue'
import SpuView from './components/SpuView.vue'
import { addDay } from '@/utils/common.js'

export default {
  name: 'OrderSummary',
  watch: {
    // 监听路由变化，当路由变化时更新页面数据
    $route(to, from) {
      this.fetchData(to) // 传入新的路由参数，重新加载数据
    },
  },
  data() {
    return {
      activeName: 1,
      // 日期
      dateRange: [],
      // 货品名称
      spuSelectList: [],
      spu: '',
      // 货品等级
      levelSpuList: [],
      spuLevel: '',
      // 平台
      platforms: [],
      platform: '',
      // 店铺
      storeUuid: '',
      // 店铺列表
      stores: [],
      // 统计类型
      statisticsType: 2,
      // 统计类型下拉
      statisticsTypeList: [
        {
          name: '订单',
          code: 1,
        },
        {
          name: '数量',
          code: 2,
        },
      ],
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
            const one = 6 * 24 * 3600 * 1000
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
  components: {
    SpuView,
    ShopView,
  },
  created() {
    this.dateRange = [addDay(-7), addDay(-1)]
    if (this.$route.query.date) {
      this.dateRange = this.$route.query.date
    }
    this.getSpuSelectList()
    this.listSpu()
    this.listStore()
    this.listPlatform()
  },
  methods: {
    fetchData(route) {
      // 你可以在这里根据 `route` 里的参数进行 API 请求，或者根据 `query`/`params` 更新内容
      const { date } = route.query // 假设路由参数是 `id`
      if (date) {
        // 使用 id 做数据请求或更新页面
        this.dateRange = this.$route.query.date
      } else {
      }
    },
    // 获取产品下拉框
    async getSpuSelectList() {
      const res = await getProductNameList()
      this.spuSelectList = res.data
    },
    //产品等级下拉框
    async listSpu() {
      const res = await listSpuLevel()
      this.levelSpuList = res.data
    },
    // 店铺下拉框
    async listStore() {
      const res = await listStore()
      this.stores = res.data
    },
    // 平台下拉框
    async listPlatform() {
      const res = await listPlatform()
      this.platforms = res.data
    },
    searchData() {
      if (this.activeName == 1) {
        this.$refs.spuView.searchTable()
      } else if (this.activeName == 2) {
        this.$refs.shopView.handleClick(1)
      }
    },
  },
}
</script>

<style>
</style>