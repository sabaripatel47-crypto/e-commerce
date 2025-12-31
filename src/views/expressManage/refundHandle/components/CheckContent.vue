<template>
  <div>
    <!-- 搜索 -->
    <div class="page_search">
      <el-form inline ref="page-filter">
        <el-form-item label="店铺：" class="search_item">
          <el-select v-model="reqParams.storeUuid" clearable filterable placeholder="请选择店铺">
            <el-option
              v-for="item in storeDataList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态：" class="search_item">
          <el-select v-model="reqParams.expressStatus" clearable placeholder="请选择状态">
            <el-option
              v-for="item in statusDataList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="快递单号搜索：" class="search_item">
          <el-input
            placeholder="请输入快递单号"
            clearable
            v-model="reqParams.expressNum"
            class="handle_input"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="getList()">搜索</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="container">
      <!-- 表格 -->
      <el-table v-loading="tableLoading" :data="tableList" style="width: 100%">
        <el-table-column type="index" label="序号" width="70" align="center"></el-table-column>
        <el-table-column prop="expressNum" label="快递单号" align="center"></el-table-column>
        <el-table-column prop="money" label="金额" align="center"></el-table-column>
        <el-table-column prop="storeName" label="店铺" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="originalOrderId" label="订单号" align="center"></el-table-column>
        <el-table-column prop="imageFileList" label="交易截图" align="center">
          <template v-slot="{ row }">
            <el-image
              v-for="(item, index) in row.imageFileList"
              :key="index"
              style="height: 30px; width: 30px"
              :src="item.url + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
              @click="handlePictureCardPreview(item.url)"
              :initial-index="0"
            ></el-image>
          </template>
        </el-table-column>
        <el-table-column prop="conductorName" label="处理人" align="center"></el-table-column>
        <el-table-column prop="expressStatusName" label="状态" align="center">
          <template v-slot="{ row }">
            <div>{{ row.expressStatus == 2 ? '待确认' : row.expressStatus == 3 ? '已确认' : '待提交' }}</div>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog :visible.sync="dialogVisible">
        <img width="100%" :src="dialogImageUrl" alt />
      </el-dialog>
      <!-- 分页 -->
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="reqParams.page"
        :limit.sync="reqParams.pageSize"
        @pagination="getList()"
      />
    </div>
  </div>
</template>

<script>
import { getStatusList, getAllDataList } from '@/api/expressManage/refundHandle'
import { listStore } from '@/api/baseData/common'
export default {
  name: 'CheckContent',
  data() {
    return {
      dialogImageUrl: '',
      dialogVisible: false,

      // 状态下拉框数据
      statusDataList: [],

      // 查询入参
      reqParams: {
        expressStatus: null, // 状态
        page: 1, // 页码
        pageSize: 20, // 页数量
        expressNum: '', // 快递单号
        storeUuid: '', // 店铺uuid
      },

      // 控制列表加载状态
      tableLoading: false,

      // 店铺下拉框数据
      storeDataList: [],

      // 表格数据
      tableList: [],

      total: 0,
    }
  },
  async created() {
    await this.getList()
    await this.getStoreData()
    await this.getStatusData()
  },

  methods: {
    handlePictureCardPreview(utl) {
      this.dialogImageUrl = utl
      this.dialogVisible = true
    },
    // 查询
    async getList() {
      this.tableLoading = true
      const res = await getAllDataList(this.reqParams)
      console.log('res: ', res)
      this.tableList = res.data.records
      console.log(' this.tableList: ', this.tableList)
      // console.log('查询列表数据', res)
      this.tableLoading = false
    },

    // 获取状态下拉框数据
    async getStatusData() {
      const res = await getStatusList()
      this.statusDataList = res.data
      console.log('状态下拉框数据', res)
    },

    // 获取店铺下拉框数据
    async getStoreData() {
      const res = await listStore()
      this.storeDataList = res.data
    },
  },
}
</script>

<style lang="scss" scoped>
.page_search {
  .search_item {
    margin-right: 20px;
  }
}
</style>
