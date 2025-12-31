<template>
  <div class="app-container">
    <div class="container">
      <el-form class="page-search" inline>
        <!--时间范围 -->
        <el-form-item label="时间范围：" style="margin-right: 20px">
          <el-date-picker
            v-model="dateRange"
            :clearable="false"
            type="daterange"
            align="right"
            unlink-panels
            value-format="timestamp"
            :picker-options="pickerOptions"
            @blur="blurTime"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="平台：" style="margin-right: 20px">
          <el-select
            v-model="storeReq.platform"
            placeholder="请选择平台"
            clearable
          >
            <el-option
              v-for="item in platforms"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="店铺名称："
          prop="storeUuid"
          style="margin-right: 20px"
        >
          <el-select
            filterable
            v-model="storeReq.storeUuid"
            placeholder="请选择店铺"
            clearable
          >
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
            v-model="storeReq.manager"
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
          <el-button
            type="primary"
            icon="el-icon-search"
            @click="getSearchStoreList(1)"
            >搜索</el-button
          >
        </el-form-item>
      </el-form>
      <!-- <el-radio-group v-model="storeReq.sortType" @change="getSearchStoreList">
        <el-radio-button :label="1">销售额</el-radio-button>
        <el-radio-button :label="2">退款额</el-radio-button>
      </el-radio-group> -->
      <el-table
        border
        v-loading="storeLoading"
        class="outHeight"
        @row-click="storeListCurrentRowClick"
        :max-height="tabHeight"
        :data="storeDataList"
        cell-class-name="table-cell-center"
      >
        <el-table-column
          prop="date"
          label="序号"
          min-width="30"
          type="index"
        ></el-table-column>
        <el-table-column
          prop="platformName"
          label="所属平台"
          align="center"
          width="80"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <div>
              {{ scope.row.platformName ? scope.row.platformName : "-" }}
            </div>
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
            <div>{{ scope.row.storeName ? scope.row.storeName : "-" }}</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="manageName"
          label="负责人"
          align="center"
          width="90"
        >
          <template slot-scope="scope">
            <div>{{ scope.row.manageName ? scope.row.manageName : "-" }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="销售额(销售占比)"
          min-width="180"
          align="center"
          show-overflow-tooltip
        >
          <template #header>
            <span
              @click="changeSortType(1)"
              :style="{
                color: storeReq.sortType == 1 ? '#409EFF' : '',
                fontSize: storeReq.sortType == 1 ? '17px' : '14px',
              }"
              >销售额(销售占比) <i class="el-icon-top"></i
            ></span>
          </template>
          <template slot-scope="scope">
            <div v-if="scope.row.orderAmount || scope.row.orderAmount === 0">
              <span>{{ scope.row.orderAmount.toFixed(2) }}</span>
              (
              <span>
                {{
                  scope.row.orderAmountRate !== null
                    ? (scope.row.orderAmountRate * 100).toFixed(2) + "%"
                    : "-"
                }} </span
              >)
            </div>
            <div v-else>-</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="erpQuantity"
          align="center"
          label="订单数"
          width="70"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <div>{{ scope.row.erpQuantity ? scope.row.erpQuantity : "-" }}</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="customerPrice"
          align="center"
          label="客单价"
          width="100"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <div
              v-if="scope.row.customerPrice || scope.row.customerPrice === 0"
            >
              <span>{{ scope.row.customerPrice.toFixed(2) }}</span>
            </div>
            <div v-else>-</div>

            <!-- <div>{{ scope.row.customerPrice ? scope.row.customerPrice : '-' }}</div> -->
          </template>
        </el-table-column>
        <el-table-column
          prop="quantityPerNum"
          label="件单量"
          align="center"
          width="100"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <div
              v-if="scope.row.quantityPerNum || scope.row.quantityPerNum === 0"
            >
              <span>{{ scope.row.quantityPerNum.toFixed(2) }}</span>
            </div>
            <div v-else>-</div>

            <!-- <div>{{ scope.row.quantityPerNum ? scope.row.quantityPerNum : '-' }}</div> -->
          </template>
        </el-table-column>
        <el-table-column
          label="退款额(退款占比)"
          align="center"
          min-width="180"
          show-overflow-tooltip
        >
          <template #header>
            <span
              @click="changeSortType(2)"
              :style="{
                color: storeReq.sortType == 2 ? '#409EFF' : '',
                fontSize: storeReq.sortType == 2 ? '17px' : '14px',
              }"
              >退款额(退款占比) <i class="el-icon-top"></i
            ></span>
          </template>
          <template slot-scope="scope">
            <div
              v-if="
                scope.row.orderRefundAmount || scope.row.orderRefundAmount === 0
              "
            >
              <span>{{ scope.row.orderRefundAmount.toFixed(2) }}</span>
              (
              <span>
                {{
                  scope.row.orderRefundAmountRate !== null
                    ? (scope.row.orderRefundAmountRate * 100).toFixed(2) + "%"
                    : "-"
                }} </span
              >)
            </div>
            <div v-else>-</div>
          </template>
        </el-table-column>
        <el-table-column
          label="退单数(退单占比)"
          align="center"
          min-width="140"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <div
              v-if="
                scope.row.erpRefundQuantity || scope.row.erpRefundQuantity === 0
              "
            >
              <span>{{ scope.row.erpRefundQuantity }}</span>
              (
              <span>{{
                (scope.row.erpRefundQuantityRate * 100).toFixed(2) + "%"
              }}</span
              >)
            </div>
            <div v-else>-</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="orderDayAvg"
          label="日均销售订单"
          align="center"
          width="110"
        >
          <template slot-scope="scope">
            <div>
              {{ scope.row.orderDayAvg ? scope.row.orderDayAvg : "-" }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="simpleRefundAmountRate"
          label="退款率"
          align="center"
          width="110"
        >
          <template slot-scope="scope">
            <div>
              {{
                scope.row.simpleRefundAmountRate !== null
                  ? (scope.row.simpleRefundAmountRate * 100).toFixed(2) + "%"
                  : "-"
              }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="cost" label="推广费" align="center" width="110">
          <template #header>
            <span
              @click="changeSortType(7)"
              :style="{
                color: storeReq.sortType == 7 ? '#409EFF' : '',
                fontSize: storeReq.sortType == 7 ? '17px' : '14px',
              }"
              >推广费 <i class="el-icon-top"></i
            ></span>
          </template>
          <template slot-scope="scope">
            <div>{{ scope.row.cost ? scope.row.cost : "-" }}</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="promotionPercentage"
          label="推广占比"
          align="center"
          width="75"
        >
          <template slot-scope="scope">
            <div>
              {{
                scope.row.promotionPercentage
                  ? getPercent(scope.row.promotionPercentage)
                  : "-"
              }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="roi" label="ROI" align="center" width="75">
          <template slot-scope="scope">
            <div>{{ scope.row.roi ? getFixed(scope.row.roi) : "-" }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              @click="lookBoardStore(scope.row)"
              >看板</el-button
            >
            <el-button
              type="text"
              size="small"
              @click="itemDetailStote(scope.row)"
              >明细</el-button
            >

            <el-button
              type="text"
              size="small"
              @click="linkBoardGoods(scope.row)"
              >推广</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <pagination
          v-show="storeTotal > 0"
          :total="storeTotal"
          :page.sync="searchParams.page"
          :limit.sync="searchParams.pageSize"
          @pagination="getStoreList()"
        />
      </div>
    </div>

    <div class="container">
      <el-form class="page-search" inline>
        <el-form-item label="商品编码:" style="margin-right: 20px">
          <el-input
            placeholder="请输入商品编码"
            v-model="linkReq.linkId"
            clearable
            class="handle-input"
          ></el-input>
        </el-form-item>
        <el-form-item label="商品等级：" style="margin-right: 20px">
          <el-select
            filterable
            v-model="linkReq.linkLevel"
            placeholder="请选择商品等级"
            clearable
          >
            <el-option
              v-for="item in linkLevels"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="负责人：" style="margin-right: 20px">
          <el-cascader
            filterable
            v-model="linkReq.manager"
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
        <el-form-item v-if="this.currentStoreUuid">
          <el-button
            type="primary"
            icon="el-icon-search"
            @click="getSearchLinkList(1)"
            >搜索</el-button
          >
        </el-form-item>
      </el-form>
      <el-table
        border
        v-loading="linkLoading"
        class="outHeight"
        :max-height="tabHeight"
        :data="linkDataList"
      >
        <el-table-column
          prop="date"
          label="序号"
          min-width="30"
          type="index"
        ></el-table-column>
        <el-table-column prop="uuid" label="主图" align="center" width="70">
          <template v-slot="{ row, $index }">
            <el-image
              v-if="row.urlAddress"
              style="height: 30px; width: 30px"
              :src="
                row.urlAddress + '?x-oss-process=image/resize,w_30,h_30,limit_0'
              "
              :preview-src-list="[row.urlAddress]"
            ></el-image>
            <div v-else>-</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="linkTitle"
          label="商品标题"
          align="center"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <div>{{ scope.row.linkTitle ? scope.row.linkTitle : "-" }}</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="linkId"
          label="商品编码"
          align="center"
          label-width="140"
        >
          <template slot-scope="scope">
            <div>{{ scope.row.linkId ? scope.row.linkId : "-" }}</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="linkName"
          label="商品等级"
          align="center"
          width="75"
        >
          <template slot-scope="scope">
            <div>{{ scope.row.linkName ? scope.row.linkName : "-" }}</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="linkTimeStatusName"
          label="商品阶段"
          align="center"
          width="75"
        >
          <template slot-scope="scope">
            <div>
              {{
                scope.row.linkTimeStatusName
                  ? scope.row.linkTimeStatusName
                  : "-"
              }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="manageName"
          label="负责人"
          align="center"
          width="80"
        >
          <template slot-scope="scope">
            <div>{{ scope.row.manageName ? scope.row.manageName : "-" }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="销售额(销售占比)"
          align="center"
          show-overflow-tooltip
          width="180"
        >
          <template #header>
            <span
              @click="changeLinkSortType(1)"
              :style="{
                color: linkReq.sortType == 1 ? '#409EFF' : '',
                fontSize: linkReq.sortType == 1 ? '17px' : '14px',
              }"
              >销售额(销售占比) <i class="el-icon-top"></i
            ></span>
          </template>
          <template slot-scope="scope">
            <div v-if="scope.row.orderAmount || scope.row.orderAmount === 0">
              <span>{{ scope.row.orderAmount.toFixed(2) }}</span>
              (
              <span>
                {{
                  scope.row.orderAmountRate !== null
                    ? (scope.row.orderAmountRate * 100).toFixed(2) + "%"
                    : "-"
                }} </span
              >)
            </div>
            <div v-else>-</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="erpQuantity"
          label="订单数"
          align="center"
          width="70"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <div>{{ scope.row.erpQuantity ? scope.row.erpQuantity : "-" }}</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="customerPrice"
          label="客单价"
          align="center"
          width="100"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <div
              v-if="scope.row.customerPrice || scope.row.customerPrice === 0"
            >
              <span>{{ scope.row.customerPrice.toFixed(2) }}</span>
            </div>
            <div v-else>-</div>

            <!-- <div>{{ scope.row.customerPrice ? scope.row.customerPrice : '-' }}</div> -->
          </template>
        </el-table-column>
        <el-table-column
          prop="quantityPerNum"
          label="件单量"
          align="center"
          width="100"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <div
              v-if="scope.row.quantityPerNum || scope.row.quantityPerNum === 0"
            >
              <span>{{ scope.row.quantityPerNum.toFixed(2) }}</span>
            </div>
            <div v-else>-</div>

            <!-- <div>{{ scope.row.quantityPerNum ? scope.row.quantityPerNum : '-' }}</div> -->
          </template>
        </el-table-column>
        <el-table-column
          label="退款额(退款占比)"
          align="center"
          show-overflow-tooltip
          width="180"
        >
          <template #header>
            <span
              @click="changeLinkSortType(2)"
              :style="{
                color: linkReq.sortType == 2 ? '#409EFF' : '',
                fontSize: linkReq.sortType == 2 ? '17px' : '14px',
              }"
              >退款额(退款占比) <i class="el-icon-top"></i
            ></span>
          </template>
          <template slot-scope="scope">
            <div
              v-if="
                scope.row.orderRefundAmount || scope.row.orderRefundAmount === 0
              "
            >
              <span>{{ scope.row.orderRefundAmount.toFixed(2) }}</span>
              (
              <span>
                {{
                  scope.row.orderRefundAmountRateb !== null
                    ? (scope.row.orderRefundAmountRate * 100).toFixed(2) + "%"
                    : "-"
                }} </span
              >)
            </div>
            <div v-else>-</div>
          </template>
        </el-table-column>
        <el-table-column
          label="退单数(退单占比)"
          align="center"
          show-overflow-tooltip
          width="140"
        >
          <template slot-scope="scope">
            <div
              v-if="
                scope.row.erpRefundQuantity || scope.row.erpRefundQuantity === 0
              "
            >
              <span>{{ scope.row.erpRefundQuantity }}</span>
              (
              <span>
                {{
                  scope.row.erpRefundQuantityRate !== null
                    ? (scope.row.erpRefundQuantityRate * 100).toFixed(2) + "%"
                    : "-"
                }} </span
              >)
            </div>
            <div v-else>-</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="orderDayAvg"
          label="日均销售订单"
          align="center"
          width="110"
        >
          <template slot-scope="scope">
            <div>
              {{ scope.row.orderDayAvg ? scope.row.orderDayAvg : "-" }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="simpleRefundAmountRate"
          label="退款率"
          align="center"
          width="110"
        >
          <template slot-scope="scope">
            <div>
              {{
                scope.row.simpleRefundAmountRate !== null
                  ? (scope.row.simpleRefundAmountRate * 100).toFixed(2) + "%"
                  : "-"
              }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="cost" label="推广费" align="center" width="110">
          <template #header>
            <span
              @click="changeLinkSortType(7)"
              :style="{
                color: linkReq.sortType == 7 ? '#409EFF' : '',
                fontSize: linkReq.sortType == 7 ? '17px' : '14px',
              }"
              >推广费 <i class="el-icon-top"></i
            ></span>
          </template>
          <template slot-scope="scope">
            <div>{{ scope.row.cost ? scope.row.cost : "-" }}</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="promotionPercentage"
          label="推广占比"
          align="center"
          width="75"
        >
          <template slot-scope="scope">
            <div>
              {{
                scope.row.promotionPercentage
                  ? getPercent(scope.row.promotionPercentage)
                  : "-"
              }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="roi" label="ROI" align="center" width="75">
          <template slot-scope="scope">
            <div>{{ scope.row.roi ? getFixed(scope.row.roi) : "-" }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="150">
          <template slot-scope="scope">
            <el-button
              type="text"
              :disabled="scope.row.linkId === '无链接'"
              size="small"
              @click="lookBoardGoods(scope.row)"
              >看板</el-button
            >
            <el-button
              type="text"
              :disabled="scope.row.linkId === '无链接'"
              size="small"
              @click="itemDetailGoods(scope.row)"
              >明细</el-button
            >
            <el-button
              type="text"
              size="small"
              @click="linkBoardGoods(scope.row)"
              >推广</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <pagination
          v-show="linkTotal > 0"
          :total="linkTotal"
          :page.sync="linkReq.page"
          :limit.sync="linkReq.pageSize"
          @pagination="getLinkList()"
        />
      </div>
    </div>
    <StoreStatistic
      v-if="storeDetailStatus"
      @closeDialog="detailStatus"
      :show="storeDetailStatus"
      :view="storeOr"
      :row="rowData"
      :title="detailTitle"
    ></StoreStatistic>
    <LinkStatistic
      v-if="linkDetailStatus"
      @closeDialog="detailStatus"
      :show="linkDetailStatus"
      :view="storeOr"
      :row="rowData"
      :title="detailTitle"
    ></LinkStatistic>
    <!-- 看板弹层 -->
    <el-dialog
      :title="rowParams.storeName + '看板'"
      @close="closeBoardDialog"
      :visible.sync="showStoreBoardDialog"
      show-close
      append-to-body
      fullscreen
    >
      <StoreBoard
        v-if="showStoreBoardDialog"
        :rowParams="rowParams"
      ></StoreBoard>
    </el-dialog>
    <el-dialog
      :title="rowParams.linkTitle + '商品链接看板'"
      @close="closeLinkBoardDialog"
      :visible.sync="showLinkBoardDialog"
      show-close
      append-to-body
      fullscreen
    >
      <LinkBoard
        v-if="showLinkBoardDialog"
        :rowParams="rowParams"
        :storeDisabled="true"
      ></LinkBoard>
    </el-dialog>
    <el-dialog
      v-if="linkPromotionStatus"
      fullscreen
      :visible.sync="linkPromotionStatus"
      append-to-body
    >
      <LinkPromotion
        :dateRange="dateRange"
        :rowData="promotionParams"
      ></LinkPromotion>
    </el-dialog>
  </div>
</template>

<script>
import {
  storePage,
  linkPage,
  listPush,
  linkPush,
} from "@/api/bulletinboard/storestatistics.js";
import StoreStatistic from "@/views/bulletinboard/storestatistics/components/StoreStatistic.vue";
import LinkStatistic from "@/views/bulletinboard/storestatistics/components/LinkStatistic.vue";
import { department } from "@/api/information/department";
import StoreBoard from "@/views/bulletinboard/store";
import LinkBoard from "@/views/bulletinboard/linkBoard";
import { addDay, addDayEnd, getDeptTreeData } from "@/utils/common.js";
import LinkPromotion from "@/views/promotionData/linkPromotion/index.vue";

import { listPlatform } from "@/api/baseData/common";

export default {
  name: "Storestatistics",
  components: {
    StoreStatistic,
    LinkStatistic,
    StoreBoard,
    LinkBoard,
    LinkPromotion,
  },
  data() {
    return {
      components: {
        StoreStatistic,
        LinkStatistic,
      },
      //开始时间和结束时间
      INIT_TIME_START: null,
      INIT_TIME_END: null,

      // 显示店铺看板
      showStoreBoardDialog: false,

      // 显示链接看板
      showLinkBoardDialog: false,

      // 看板弹层入参
      rowParams: {},

      //表格高度
      tabHeight: 600,

      //店铺的查询
      storeReq: {
        sortType: 1, // 默认值设为 1
      },

      dateRange: [],

      //链接的查询
      linkReq: {
        linkId: null,
        linkLevel: "",
        manager: "",
        page: 1,
        pageSize: 10,
        sortType: 1, // 默认值设为 1
      },

      //商品列表的分页总条数
      storeTotal: 0,

      //链接列表的分页总条数
      linkTotal: 0,

      //平台下拉框的值
      platforms: [],

      //店铺下拉框的值
      stores: [],

      //负责人下拉框
      departments: [],

      //商品链接的下拉框
      linkLevels: [],

      //店铺表格的loading
      storeLoading: false,

      //链接表格的loading
      linkLoading: false,

      //店铺当前选中行
      currentStoreRow: {},
      //当前选中的商品店铺名称uid
      currentStoreUuid: "",
      // 当前选中的商品平台id
      selectPlatform: "",
      //店铺搜索条件
      searchParams: {
        startTime: null,
        endTime: null,
        formatType: 2, //1----年月，2------年月日
        page: 1,
        pageSize: 10,
      },

      //链接搜索条件
      searchLinkParams: {
        startTime: null,
        endTime: null,
        formatType: 1, //1----年月，2------年月日
        page: 1,
        pageSize: 10,
        storeUuid: null,
      },
      //店铺数据列表
      storeDataList: [],

      //链接数据列表
      linkDataList: [],

      // 店铺明细状态
      storeDetailStatus: false,

      //商品链接状态
      linkDetailStatus: false,

      // 是店铺明细还是商品链接明细
      storeOr: "store",

      // 明细dialog标题
      detailTitle: "",

      //当前选择的dialog数据
      rowData: null,

      // 选中的开始时间
      startPickerTime: "",
      // 时间范围快捷选择
      pickerOptions: {
        shortcuts: [
          {
            text: "最近7天",
            onClick(picker) {
              const end = addDay(-1);
              const start = addDayEnd(-7);
              // start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近14天",
            onClick(picker) {
              const end = addDay(-1);
              const start = addDayEnd(-14);
              // start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近1个月",
            onClick(picker) {
              const end = addDay(-1);
              const start = addDayEnd(-30);
              // start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit("pick", [start, end]);
            },
          },
        ],
        // 当点击时 将时间拿来做禁用时间范围计算
        onPick: (timeObj) => {
          this.startPickerTime = new Date(timeObj.minDate).getTime();
        },
        disabledDate: (time) => {
          if (!this.startPickerTime) return false;
          const now = this.startPickerTime;
          // 31 * 24 * 3600 * 1000 是31天的毫秒数
          const minTime = now - 31 * 24 * 3600 * 1000;
          const maxTime = now + 31 * 24 * 3600 * 1000;

          return time.getTime() < minTime || time.getTime() > maxTime;
        },
      },
      promotionParams: {},
      linkPromotionStatus: false,
    };
  },
  mounted() {
    // 监听屏幕变化
    this.debounceHandleResize = this.debounce(this.handleResize, 300);
    this.handleResize();
    window.addEventListener("resize", this.debounceHandleResize);
  },
  directives: {
    "el-select-loadmore": (el, binding) => {
      // 获取element-ui定义好的scroll盒子
      const SELECTWRAP_DOM = el.querySelector(
        ".el-select-dropdown .el-select-dropdown__wrap"
      );
      if (SELECTWRAP_DOM) {
        SELECTWRAP_DOM.addEventListener("scroll", function () {
          const condition =
            this.scrollHeight - this.scrollTop <= this.clientHeight;
          if (condition) binding.value();
        });
      }
    },
  },
  created() {
    this.INIT_TIME_START = addDay(-7);
    this.INIT_TIME_END = addDayEnd(-1);

    this.setDefaultStoreTime();
    //设置查询的默认时间
    this.dateRange = [this.INIT_TIME_START, this.INIT_TIME_END];

    //部门和人的级联
    this.getDeptTree();
    //平台下拉框
    this.listPlatform();
    //店铺下拉框
    this.listPush();
    // 商品等级下拉框
    this.linkPush();
    //店铺列表
    this.getStoreList();
  },
  methods: {
    handleResize() {
      this.screenWidth = window.innerWidth;
      this.screenHeight = window.innerHeight;
      this.tabHeight =
        this.screenHeight - 460 > 0 ? this.screenHeight - 460 : 600;
    },

    // 时间选择失焦时将startPickerTime置空 目的是清除禁用的时间范围
    blurTime() {
      this.startPickerTime = "";
    },

    // 关闭店铺看板
    closeBoardDialog() {
      this.showStoreBoardDialog = false;
    },

    // 跳转店铺看板
    lookBoardStore(row) {
      console.log("row", row);
      this.rowParams = {
        storeName: row.storeName,
        storeUuid: row.storeUuId,
        platformUuid: row.platform,
        startTime: this.searchParams.startTime,
        endTime: this.searchParams.endTime,
        formatType: this.searchParams.formatType,
      };
      this.showStoreBoardDialog = true;
    },

    // 关闭链接看板
    closeLinkBoardDialog() {
      this.showLinkBoardDialog = false;
    },

    //商品链接看板
    lookBoardGoods(row) {
      // console.log('row', { ...row })
      this.rowParams = {
        linkTitle: this.currentStoreRow.storeName,
        storeUuid: this.currentStoreUuid,
        platformUuid: this.selectPlatform,
        linkId: row.linkId,
        startTime: this.searchParams.startTime,
        endTime: this.searchParams.endTime,
        formatType: this.searchParams.formatType,
      };
      this.showLinkBoardDialog = true;
    },
    //店铺搜索按钮
    getSearchStoreList() {
      this.linkDataList = [];

      this.getStoreList(1);
    },
    // 切换排序
    changeSortType(val) {
      this.storeReq.sortType = val;
      this.linkDataList = [];

      this.getStoreList(1);
    },
    //商品链接搜索按钮
    getSearchLinkList() {
      this.getLinkList(1);
    },
    //设置默认时间spu时间
    setDefaultStoreTime() {
      this.searchParams.startTime = this.INIT_TIME_START;
      this.searchParams.endTime = this.INIT_TIME_END;
    },
    debounce(func, wait) {
      let timeout;
      return function () {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function () {
          func.apply(context, args);
        }, wait);
      };
    },
    // 店铺名称下拉框
    async listPush() {
      const res = await listPush();
      this.stores = res.data;
    },
    // 平台下拉框
    async listPlatform() {
      const res = await listPlatform();
      this.platforms = res.data;
    },
    // 负责人组织架构数据
    async getDeptTree() {
      const res = await department();
      this.departments = await getDeptTreeData(res.data);
    },

    // 链接商品等级下拉框
    async linkPush() {
      const res = await linkPush();
      this.linkLevels = res.data;
    },
    //获取店铺列表
    async getStoreList(page) {
      this.currentStoreUuid = "";

      // 检查时间范围是否发生变化
      const isTimeRangeChanged =
        this.searchParams.startTime !== this.dateRange[0] ||
        this.searchParams.endTime !== this.dateRange[1];

      // 如果时间范围发生变化，将 sortType 置为 1
      if (isTimeRangeChanged) {
        this.storeReq.sortType = 1;
      }

      if (page !== undefined) {
        this.searchParams.page = page;
      }

      if (Array.isArray(this.storeReq.manager)) {
        this.storeReq.manager =
          this.storeReq.manager[this.storeReq.manager.length - 1];
      }

      this.searchParams = Object.assign(this.searchParams, {
        startTime: this.dateRange[0],
        endTime: this.dateRange[1],
        formatType: 2,
        managerUuid: this.storeReq.manager,
        platform: this.storeReq.platform,
        storeUuid: this.storeReq.storeUuid,
        sortType: this.storeReq.sortType,
      });

      this.storeLoading = true;
      const [err, res] = await this.$to(storePage(this.searchParams));
      this.storeLoading = false;
      if (res) {
        this.storeDataList = res.data.records;
        this.storeTotal = res.data.total;
        return;
      }
      this.storeDataList = [];
      this.linkTotal = 0;
    },

    //点击当前行
    storeListCurrentRowClick(row, column, event) {
      this.currentStoreRow = row;
      this.linkDataList = [];
      // 清空链接条件查询
      this.linkReq = {
        linkId: null,
        linkLevel: "",
        manager: "",
        sortType: 1,
        page: 1,
        pageSize: 10,
      };

      this.currentStoreUuid = row.storeUuId;
      this.selectPlatform = row.platform;
      this.getLinkList(1);
      // this.listLinkLevel()
    },

    // 子表排序方式修改
    changeLinkSortType(val) {
      this.linkReq.sortType = val;
      this.getLinkList(1);
    },
    //获取链接列表
    async getLinkList(page) {
      //
      if (this.currentStoreUuid === undefined || this.currentStoreUuid === "") {
        this.$message({
          type: "error",
          message: "请选择店铺",
        });
        return;
      }

      if (page !== undefined) {
        this.linkReq.page = page;
      }

      if (Array.isArray(this.linkReq.manager)) {
        this.linkReq.manager =
          this.linkReq.manager[this.linkReq.manager.length - 1];
      }

      this.searchLinkParams = Object.assign(this.linkReq, {
        startTime: this.dateRange[0],
        endTime: this.dateRange[1],
        formatType: 2,
        storeUuid: this.currentStoreUuid,
        managerUuid: this.linkReq.manager,
        linkLevel: this.linkReq.linkLevel,
        linkId: this.linkReq.linkId,
      });

      this.linkLoading = true;

      let res = await linkPage(this.searchLinkParams);
      this.linkDataList = res.data.records;
      this.linkLoading = false;
      this.linkTotal = res.data.total;
    },
    // 关闭明细
    detailStatus() {
      this.storeDetailStatus = false;
      this.linkDetailStatus = false;
    },
    // 店铺明细
    itemDetailStote(row) {
      const rowDataAss = Object.assign(row, {
        timeArr: this.dateRange,
      });
      this.rowData = rowDataAss;
      this.storeOr = "store";
      this.detailTitle = "店铺明细";
      this.storeDetailStatus = true;
    },
    //商品链接明细
    itemDetailGoods(row) {
      const rowDataAss = Object.assign(row, {
        timeArr: this.dateRange,
      });
      this.rowData = rowDataAss;
      this.storeOr = "link";
      this.detailTitle = "商品链接明细";
      this.linkDetailStatus = true;
    },
    getPercent(num) {
      if (num || num === 0) {
        return (num * 100).toFixed(2) + "%";
      } else {
        return "-";
      }
    },
    // 保留两位小数
    getFixed(num) {
      if (num || num === 0) {
        return num.toFixed(2);
      } else {
        return "-";
      }
    },
    linkBoardGoods(row) {
      this.linkPromotionStatus = true;
      this.promotionParams = row;
    },
  },
};
</script>


<style lang="scss" scoped>
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.table-cell-center {
  text-align: center;
  vertical-align: middle;
}

.outHeight {
  ::v-deep .el-table__body-wrapper {
    overflow-y: auto;
    height: 100px;
  }

  @media screen and (min-width: 768px) {
    /* 平板设备及以上 */
    ::v-deep .el-table__body-wrapper {
      height: 200px;
    }
  }

  @media screen and (min-width: 1024px) {
    /* 桌面设备 */
    ::v-deep .el-table__body-wrapper {
      height: 250px;
    }
  }

  @media screen and (min-width: 1200px) {
    /* 大屏幕设备 */
    ::v-deep .el-table__body-wrapper {
      height: 300px;
    }
  }
}
</style>