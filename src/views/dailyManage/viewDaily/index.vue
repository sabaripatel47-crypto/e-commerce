<template>
  <div class="app-container">
    <!-- 搜索 -->
    <div class="head-container">
      <el-form class="page-search" inline ref="page-filter">
        <el-form-item label="商品链接：" style="margin-right: 20px">
          <el-input
            placeholder="请输入商品链接id"
            v-model="reqParams.linkId"
            clearable
            class="handle-input"
          ></el-input>
        </el-form-item>
        <el-form-item label="商品等级：" style="margin-right: 20px">
          <el-select filterable v-model="reqParams.linkLevel" multiple placeholder="请选择商品链接等级">
            <el-option
              v-for="item in linkLevels"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="平台：" style="margin-right: 20px">
          <el-select v-model="reqParams.platform" placeholder="请选择平台" clearable>
            <el-option
              v-for="item in platforms"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="店铺：" prop="storeUuid" style="margin-right: 20px">
          <el-select filterable v-model="reqParams.storeUuid" placeholder="请选择店铺" clearable>
            <el-option
              v-for="item in stores"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="负责人/助理：" style="margin-right: 20px">
          <el-cascader
            filterable
            v-model="reqParams.manager"
            :options="departments"
            :show-all-levels="false"
            :props="{
              children: 'children',
              label: 'deptName',
              value: 'deptId',
              checkStrictly: false,
            }"
            clearable
          ></el-cascader>
        </el-form-item>
        <el-form-item label="上级点评：" prop="fillOutSign" style="margin-right: 20px">
          <el-select filterable v-model="reqParams.fillOutSign" placeholder="请选择上级点评" clearable>
            <el-option
              v-for="item in fillOutSignSelectList"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="填写日报日期：">
          <el-date-picker
            v-model="reqParams.fillInTime"
            type="date"
            placeholder="选择日期时间"
            align="right"
            value-format="timestamp"
            :picker-options="pickerOptions"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="getList(1)">搜索</el-button>
        </el-form-item>
      </el-form>
      <el-radio-group
        class="el-form-item-width40"
        v-model="reqParams.sortType"
        @input="sortTypeChangeEvent"
      >
        <el-radio-button
          v-for="item in sortTypeList"
          :key="item.code"
          :label="item.code"
        >{{ item.name }}</el-radio-button>
      </el-radio-group>
    </div>
    <div class="container">
      <!-- 表格 -->
      <el-table :data="linkList" style="width: 100%" v-loading="tableLoading" max-height="700">
        <el-table-column type="index" label="序号" width="70" align="center"></el-table-column>
        <el-table-column prop="linkId" label="商品链接编码" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="uuid" label="主图" align="center">
          <template v-slot="{ row, $index }">
            <el-image
              v-if="row.url"
              style="height: 30px; width: 30px"
              :src="row.url + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
              :preview-src-list="[row.url]"
            ></el-image>
          </template>
        </el-table-column>
        <el-table-column prop="linkLevel" label="商品等级" align="center"></el-table-column>
        <el-table-column prop="storeName" label="所属店铺" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="platformName" label="所属平台" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="managerName" label="负责人" align="center"></el-table-column>
        <el-table-column prop="updateTime" label="修改时间" align="center">
          <template v-slot="{ row }">
            {{
            getFormatDateTime(row.updateTime)
            }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" align="center">
          <template v-slot="{ row }">
            <el-button size="mini" type="text" icon="el-icon-delete" @click="dailyDetail(row)">日报详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="reqParams.page"
        :limit.sync="reqParams.pageSize"
        @pagination="getList"
      />
    </div>

    <ViewDailyDialog :row.sync="currentRow" :showDialog.sync="showViewDailyDialog" :readOnly="true"></ViewDailyDialog>
  </div>
</template>

<script>
import { getLeaderLinkDailyList } from '@/api/dailyManage/viewDaily'
import {
  getDeptTreeData,
  getFormatDate,
  getFormatDateTime,
} from '@/utils/common'
import { department } from '@/api/information/department'
import { listPlatform, listStore, listLinkLevel } from '@/api/baseData/common'

import ViewDailyDialog from '@/views/dailyManage/viewDaily/viewDailyDialog'

export default {
  name: 'ViewDaily',
  components: {
    ViewDailyDialog,
  },
  data() {
    return {
      total: 0,
      linkList: [],

      // 商品等级下拉框数据
      linkLevels: [],

      // 图片大图预览数组
      srcList: [],

      //部门人员的下拉框
      departments: [],

      //平台下拉框
      platforms: [],

      //店铺下拉框
      stores: [],

      //日报查看的当前查看行
      currentRow: {},

      //查看日报的dialog标记
      showViewDailyDialog: false,

      // 是否填写日报
      fillOutSignSelectList: [
        { code: 1, name: '已点评' },
        { code: 0, name: '未点评' },
      ],

      reqParams: {
        keyword: '',
        manager: null,
        linkLevel: [],
        sortType: 1, //默认是按商品等级排序
        linkId: '',
        fillOutSign: null,
        page: 1,
        pageSize: 20,
        fillInTime: '',
      },
      // 跳转传值
      row: {},

      // 列表加载状态
      tableLoading: false,

      //排序方式的内容
      sortTypeList: [
        { code: '1', name: '商品等级正序' },
        { code: '2', name: '修改时间倒序' },
      ],

      // 商品等级的下拉框
      pickerOptions: {
        shortcuts: [
          {
            text: '今天',
            onClick(picker) {
              const date = new Date()
              date.setHours(0, 0, 0, 0) // 设置为当天的零点
              const timestamp = date.getTime() // 获取时间戳
              console.log('时间戳')
              console.log(timestamp)
              picker.$emit('pick', timestamp)
            },
          },
          {
            text: '昨天',
            onClick(picker) {
              const date = new Date()
              date.setDate(date.getDate() - 1) // 获取昨天的日期
              date.setHours(0, 0, 0, 0) // 设置为昨天的零点
              const timestamp = date.getTime() // 获取时间戳
              picker.$emit('pick', timestamp)
            },
          },
          {
            text: '一周前',
            onClick(picker) {
              const date = new Date()
              date.setDate(date.getDate() - 7) // 获取一周前的日期
              date.setHours(0, 0, 0, 0) // 设置为一周前的零点
              const timestamp = date.getTime() // 获取时间戳
              picker.$emit('pick', timestamp)
            },
          },
        ],
      },
    }
  },
  created() {
    //部门和人的级联
    this.getDeptTree()
    //平台下拉框
    this.listPlatform()
    //店铺下拉框
    this.listStore()
    // 商品等级下拉框
    this.listLinkLevel()

    this.getList()
    if (this.$route.query.row?.linkId) {
      console.log('跳转传值', this.$route.query.row)
      this.row = this.$route.query.row
      this.jumpDailyDetail(this.row)
      this.$router.replace({ path: this.$route.path, query: {} })
    }
  }, 
  methods: {
    // 链接级别的下拉框
    async listLinkLevel() {
      const res = await listLinkLevel()
      this.linkLevels = res.data
    },
    // 负责人组织架构数据
    async getDeptTree() {
      const res = await department()
      this.departments = await getDeptTreeData(res.data)
    },
    //时间格式化
    getFormatDateTime(timeStamp) {
      if (!timeStamp) {
        return ''
      }
      return getFormatDateTime(timeStamp)
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
    //排序方式的事件
    sortTypeChangeEvent() {
      this.getList(1)
    },

    // 获取列表信息
    async getList(page) {
      this.tableLoading = true
      if (page == 1) {
        this.reqParams.page = page
      }

      if (Array.isArray(this.reqParams.manager)) {
        this.reqParams.manager =
          this.reqParams.manager[this.reqParams.manager.length - 1]
      }

      const res = await getLeaderLinkDailyList(this.reqParams)
      this.linkList = res.data.records
      this.srcList = res.data.records
        .filter((item) => item.url && item.url.trim())
        .map((item) => item.url)
      this.total = res.data.total
      this.tableLoading = false
    },

    // 日报详情
    dailyDetail(row) {
      row.srcList = []
      row.srcList.push(row.url)
      this.currentRow = row
      this.showViewDailyDialog = true
    },
    // 打开时的日报详情
    jumpDailyDetail(row) {
      this.$nextTick(() => {
        row.srcList = []
        if (row.urlAddress != null) {
          row.srcList.push(row.urlAddress)
        }
        this.currentRow = row
        this.showViewDailyDialog = true
      })
    },
  },
}
</script>

<style scoped></style>
