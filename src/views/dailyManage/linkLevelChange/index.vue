<template>
  <div class="app-container">
    <div class="head-container">
      <el-form class="page-search" inline>
        <!--  :format="getFormatDate(storeReq.startTime) + '至' + getFormatDate(storeReq.endTime) + ' (第WW周)'" -->
        <el-form-item label="时间：" style="margin-right: 20px">
          <el-date-picker
            class="date-picker-width"
            v-model="dateRange"
            :clearable="false"
            type="week"
            placeholder="选择周"
            :format="
              getFormatDate(storeReq.startTime) +
              '至' +
              getFormatDate(storeReq.endTime) +
              ' (第WW周)'
            "
            @change="dateChange"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="平台：" style="margin-right: 20px">
          <el-select v-model="storeReq.platform" placeholder="请选择平台" clearable>
            <el-option
              v-for="item in platforms"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="店铺名称：" prop="storeUuid" style="margin-right: 20px">
          <el-select filterable v-model="storeReq.storeUuid" placeholder="请选择店铺" clearable>
            <el-option
              v-for="item in stores"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="负责人：" style="margin-right: 20px">
          <el-cascader
            filterable
            v-model="storeReq.storeManager"
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
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="getSearchStoreList(1)">搜索</el-button>
        </el-form-item>
      </el-form>
      <el-table
        v-loading="storeLoading"
        @row-click="storeListCurrentRowClick"
        :max-height="tabHeight"
        :data="storeDataList"
        cell-class-name="table-cell-center"
      >
        <el-table-column prop="date" label="序号" min-width="30" type="index"></el-table-column>
        <el-table-column prop="platformName" label="平台" align="center" show-overflow-tooltip>
          <template slot-scope="scope">
            <div>{{ scope.row.platformName ? scope.row.platformName : "-" }}</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="storeName"
          label="店铺名称"
          align="center"
          min-width="310"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <div>
              {{
              scope.row.storeName
              ? "(" + scope.row.storeCode + ")" + scope.row.storeName
              : "-"
              }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="storeManagerName" label="负责人" align="center">
          <template slot-scope="scope">
            <div>
              {{
              scope.row.storeManagerName ? scope.row.storeManagerName : "-"
              }}
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <pagination
          v-show="storeTotal > 0"
          :total="storeTotal"
          :page.sync="storeReq.page"
          :limit.sync="storeReq.pageSize"
          @pagination="getSearchStoreList()"
        />
      </div>

      <el-form class="child-search" inline ref="page-filter">
        <el-form-item label="商品链接">
          <el-select
            v-model="linkReq.linkId"
            filterable
            clearable
            placeholder="请选择商品链接"
            class="board-form-item-width"
          >
            <el-option
              v-for="(item, index) in linkList"
              :key="index"
              :label="item.extendKeyword + '(' + item.name + ')'"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="负责人" prop="linkManager">
          <el-cascader
            filterable
            v-model="linkReq.linkManager"
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
        <el-form-item label="链接等级变化" style="margin-right: 20px">
          <el-select filterable v-model="linkReq.difference" clearable placeholder="请选择链接等级变化">
            <el-option label="上升" :value="1"></el-option>
            <el-option label="下降" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="原商品等级" style="margin-right: 20px">
          <el-select filterable v-model="linkReq.originalLevel" clearable placeholder="请选择商品等级">
            <el-option
              v-for="item in linkLevelList"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="this.currentStoreRow.storeUuid">
          <el-button type="primary" icon="el-icon-search" @click="getSearchLinkList(1)">搜索</el-button>
        </el-form-item>
      </el-form>

      <el-table
        v-loading="linkLoading"
        class="child-table"
        :max-height="tabHeight"
        :data="linkDataList"
      >
        <el-table-column prop="date" label="序号" min-width="30" type="index"></el-table-column>
        <el-table-column prop="linkTitle" label="商品标题" align="center" show-overflow-tooltip>
          <template slot-scope="scope">
            <div>{{ scope.row.linkTitle ? scope.row.linkTitle : "-" }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="linkId" label="商品编码" align="center" label-width="140">
          <template slot-scope="scope">
            <div>{{ scope.row.linkId ? scope.row.linkId : "-" }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="uuid" label="主图" align="center" width="70">
          <template v-slot="{ row, $index }">
            <el-image
              v-if="row.imageUrl"
              style="height: 30px; width: 30px"
              :src="
                row.imageUrl + '?x-oss-process=image/resize,w_30,h_30,limit_0'
              "
              :preview-src-list="[row.imageUrl]"
            ></el-image>
            <div v-else>-</div>
          </template>
        </el-table-column>
        <el-table-column prop="linkManagerName" label="负责人" align="center" width="80">
          <template slot-scope="scope">
            <div>{{ scope.row.linkManagerName ? scope.row.linkManagerName : "-" }}</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="strategyTitle"
          align="center"
          label="项目"
          min-width="140"
          show-overflow-tooltip
        >
          <template v-slot="{ row }">
            <div v-for="(item, index) in row.strategyTitles">{{ item }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="linkTimeStatusName" label="链接阶段" align="center" width="75"></el-table-column>
        <el-table-column prop="mainLinkName" label="主打商品" align="center"></el-table-column>
        <el-table-column prop="planLinkLevelName" align="center">
          <template slot="header">
            <span>计划等级</span>
            <el-tooltip class="item" effect="dark" content="计划等级：链接期望达到的目标等级" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="highestLinkLevelName" label="最高等级" align="center">
          <template slot="header">
            <span>最高等级</span>
            <el-tooltip class="item" effect="dark" content="最高等级：链接曾经达到的最高等级" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="standardLinkLevelName" label="标准等级" align="center">
          <template slot="header">
            <span>标准等级</span>
            <el-tooltip
              class="item"
              effect="dark"
              content="标准等级：链接长期存在的平均等级"
              placement="top"
            >
            <i class="el-icon-question"></i>
            </el-tooltip>
          </template>
        </el-table-column>-->
        <el-table-column prop="originalLevelName" label="原商品等级" align="center">
          <template slot="header">
            <span>原商品等级</span>
            <el-tooltip
              class="item"
              effect="dark"
              content="原商品等级：系统根据链接的销售情况，计算的上周的实时等级"
              placement="top"
            >
              <i class="el-icon-question"></i>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="currentLevelName" label="现商品等级" align="center">
          <template slot="header">
            <span>现商品等级</span>
            <el-tooltip
              class="item"
              effect="dark"
              content="现商品等级：系统根据链接的销售情况，计算的实时等级"
              placement="top"
            >
              <i class="el-icon-question"></i>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column width="30" prop align="center">
          <template v-slot="{ row }">
            <i v-if="row.difference == 1" class="el-icon-top green-top"></i>
            <i v-else class="el-icon-bottom red-bottom"></i>
          </template>
        </el-table-column>
        <el-table-column prop label="操作" align="center">
          <template v-slot="{ row }">
            <el-button type="text" :storeDisabled="true" @click="lookBoardGoods(row)">看板</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <pagination
          v-show="linkTotal > 0"
          :total="linkTotal"
          :page.sync="linkReq.page"
          :limit.sync="linkReq.pageSize"
          @pagination="getSearchLinkList()"
        />
      </div>
    </div>
    <!-- 看板弹层 -->
    <el-dialog
      :title="rowParams.linkTitle + '商品链接看板'"
      @close="closeLinkBoardDialog"
      :visible.sync="showLinkBoardDialog"
      show-close
      append-to-body
      fullscreen
    >
      <LinkBoard v-if="showLinkBoardDialog" :rowParams="rowParams"></LinkBoard>
    </el-dialog>
  </div>
</template>

<script>
import {
  addDay,
  addDayEnd,
  getDeptTreeData,
  deepClone,
  getFormatDate,
  getLastWeekMonday,
} from '@/utils/common.js'
import { listPlatform, listStore, listLinkLevel } from '@/api/baseData/common'
import { department } from '@/api/information/department'
import {
  listLinkLevelChangeStoreList,
  listLinkLevelChangeLinkList,
} from '@/api/dailyManage/linkLevelChange'
import {
  getLinkSelectList, // 链接下拉框
} from '@/api/bulletinboard/linkBoard'
import LinkBoard from '@/views/bulletinboard/linkBoard'

export default {
  name: 'LinkLevelChange',
  components: {
    LinkBoard,
  },
  data() {
    return {
      dateRange: '',

      // 看板弹层入参
      rowParams: {},
      // 控制看板弹层显示
      showLinkBoardDialog: false,

      //表格高度
      tabHeight: 400,

      //平台下拉框的值
      platforms: [],

      //店铺下拉框的值
      stores: [],

      //负责人下拉框
      departments: [],

      // 商品等级下拉框
      linkLevelList: [],

      // 链接下拉框
      linkList: [],

      //店铺的查询
      storeReq: {
        page: 1,
        pageSize: 10,
        startTime: '',
        endTime: '',
        platform: '',
        storeUuid: '',
        storeManager: '',
      },

      //链接的查询
      linkReq: {
        page: 1,
        pageSize: 10,
        linkLevelChangeUuid: '',
        storeUuid: '',
        linkId: '',
        linkManager: '',
        difference: '',
        originalLevel: '',
      },

      //店铺表格的loading
      storeLoading: false,

      //链接表格的loading
      linkLoading: false,

      //店铺数据列表
      storeDataList: [],
      //店铺列表的分页总条数
      storeTotal: 0,
      //链接数据列表
      linkDataList: [],
      //链接的分页总条数
      linkTotal: 0,

      //店铺当前选中行
      currentStoreRow: {},
    }
  },

  async created() {
    // 设置默认时间
    this.getDefaultDate()
    //部门和人的级联
    this.getDeptTree()
    //平台下拉框
    this.listPlatform()
    //店铺下拉框
    this.listStore()
    //商品等级下拉框
    this.getLinkLevelList()

    //初始化店铺列表
    this.getSearchStoreList(1)
  },

  methods: {
    // 时间转换
    getFormatDate(tiem) {
      return getFormatDate(+tiem)
    },
    // 设置默认时间为上周
    getDefaultDate() {
      //  = addDayEnd(-7)
      // let today = new Date()
      // today.setDate(today.getDate() - 7)
      // 获取上周周一的时间
      this.dateRange = getLastWeekMonday()
      this.dateChange(this.dateRange)

      console.log('dateRange', getFormatDate(this.dateRange))
    },
    // 日期change事件
    dateChange(val) {
      console.log('val', val)
      // val为点击周的周一
      if (val) {
        let timeStamp = val.getTime() //标准时间转为时间戳，毫秒级别
        this.storeReq.startTime = timeStamp - 24 * 60 * 60 * 1000 //开始时间
        this.storeReq.endTime = timeStamp + 24 * 60 * 60 * 1000 * 5 //结束时间
      }
    },

    // 打开商品链接看板
    lookBoardGoods(row) {
      // console.log('row', { ...row })
      this.rowParams = {
        linkTitle: row.storeName || '',
        storeUuid: this.currentStoreRow.storeUuid,
        platformUuid: this.currentStoreRow.platform,
        linkId: row.linkId,
        startTime: this.storeReq.startTime,
        endTime: this.storeReq.endTime,
        formatType: 2, // 按周查询 所以type写死为按日
      }
      this.showLinkBoardDialog = true
    },

    // 关闭链接看板
    closeLinkBoardDialog() {
      this.showLinkBoardDialog = false
    },

    // 店铺名称下拉框
    async listStore() {
      const res = await listStore()
      this.stores = res.data
    },
    // 平台下拉框
    async listPlatform() {
      const res = await listPlatform()
      this.platforms = res.data
    },
    // 负责人组织架构数据
    async getDeptTree() {
      const res = await department()
      this.departments = await getDeptTreeData(res.data)
    },

    //商品等级的下拉框
    async getLinkLevelList() {
      const res = await listLinkLevel()
      this.linkLevelList = res.data
    },

    // 获取链接下拉框数据
    async getLinkList() {
      const res = await getLinkSelectList({
        storeUuidList: [this.currentStoreRow.storeUuid],
      })
      this.linkList = res.data
    },

    //点击当前行
    storeListCurrentRowClick(row, column, event) {
      this.currentStoreRow = deepClone(row)
      this.linkList = [] //置空原始的下拉框
      // 清空链接条件查询
      this.linkReq = {
        page: 1,
        pageSize: 10,
        linkLevelChangeUuid: '',
        storeUuid: '',
        linkId: '',
        linkManager: '',
        difference: '',
        originalLevel: '',
      }
      this.linkReq.linkLevelChangeUuid =
        this.currentStoreRow.linkLevelChangeUuid
      this.linkReq.storeUuid = this.currentStoreRow.storeUuid
      //获取链接的下拉框
      this.getLinkList()
      //获取链接列表
      this.getSearchLinkList()

      // this.linkDataList = []
    },

    //查询店铺数据
    async getSearchStoreList(page) {
      if (page !== undefined) {
        this.storeReq.page = page
      }

      if (Array.isArray(this.storeReq.storeManager)) {
        this.storeReq.storeManager =
          this.storeReq.storeManager[this.storeReq.storeManager.length - 1]
      }

      this.storeLoading = true
      const [err, res] = await this.$to(
        listLinkLevelChangeStoreList(this.storeReq)
      )
      this.storeLoading = false
      if (res) {
        this.storeDataList = res.data.records
        this.storeTotal = res.data.total
        this.currentStoreRow = [] //置空选中行的数据
        this.linkList = [] //置空原始的下拉框
        this.linkDataList = [] //链接的列表数据置空
        this.linkTotal = 0 // 重置下列表分页条数
        return
      }
    },

    //查询链接数据
    async getSearchLinkList(page) {
      if (page !== undefined) {
        this.linkReq.page = page
      }
      if (Array.isArray(this.linkReq.linkManager)) {
        this.linkReq.linkManager =
          this.linkReq.linkManager[this.linkReq.linkManager.length - 1]
      }

      this.linkLoading = true
      const [err, res] = await this.$to(
        listLinkLevelChangeLinkList(this.linkReq)
      )

      this.linkLoading = false
      if (res) {
        this.linkDataList = res.data.records
        this.linkTotal = res.data.total
        return
      }
    },
  },
}
</script>


<style lang="scss" scoped>
.date-picker-width {
  width: 300px;
}
.child-search {
  margin-top: 30px;
}

.green-top {
  font-size: 20px;
  color: rgb(42, 215, 42);
}

.red-bottom {
  font-size: 20px;
  color: red;
}
</style>

