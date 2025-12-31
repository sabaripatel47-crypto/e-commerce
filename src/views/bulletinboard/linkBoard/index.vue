<template>
  <div class="app-container">
    <div class="head-container">
      <el-form class="page-search" inline ref="page-filter">
        <!--时间范围 -->
        <el-form-item label="时间范围" style="margin-right: 20px">
          <div class="time-class">
            <div class="time-radio">
              <el-radio-group v-model="vModelReqParams.formatType" size="mini">
                <el-radio-button :label="2">按日</el-radio-button>
                <el-radio-button :label="1">按月</el-radio-button>
              </el-radio-group>
            </div>
            <div class="time-pick">
              <el-date-picker
                v-model="timeValueArr"
                :clearable="false"
                :type="
                  vModelReqParams.formatType == 2 ? 'daterange' : 'monthrange'
                "
                :key="
                  vModelReqParams.formatType == 2 ? 'daterange' : 'monthrange'
                "
                align="right"
                unlink-panels
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :picker-options="
                  vModelReqParams.formatType == 2 ? pickerOptions : ''
                "
                value-format="timestamp"
                @change="changeTime"
                @blur="blurTime"
                class="time-pick-class"
              ></el-date-picker>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="平台" style="margin-right: 10px">
          <el-select
            v-model="vModelReqParams.platform"
            filterable
            clearable
            placeholder="请选择平台"
            :disabled="storeDisabled"
            multiple
            class="board-form-item-width"
          >
            <el-option
              v-for="(item, index) in platformList"
              :key="index"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="店铺" style="margin-right: 10px">
          <el-select
            v-model="vModelReqParams.store"
            filterable
            clearable
            placeholder="请选择店铺"
            multiple
            collapse-tags
            :disabled="storeDisabled"
            @change="storeSelectChange"
            class="board-form-item-width"
          >
            <el-option
              v-for="(item, index) in storeList"
              :key="index"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品链接">
          <el-select
            v-model="vModelReqParams.linkId"
            filterable
            clearable
            collapse-tags
            placeholder="请选择商品链接"
            class="board-form-item-width"
            multiple
          >
            <el-option
              v-for="(item, index) in linkList"
              :key="index"
              :label="item.extendKeyword + '(' + item.name + ')'"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品链接" style="margin-right: 10px">
          <el-input
            v-model="vModelReqParams.keyWord"
            class="board-form-item-width"
            placeholder="请输入商品编码"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="getAllData">搜索</el-button>
        </el-form-item>
      </el-form>
      <div v-if="showLinkDetail" class="grade-detail">
        <div class="detail-top">
          <span class="detail-name">
            <span class="name-title">商品名称：</span>
            {{ linkDetail.linkTitle || "-" }}
          </span>
          <span class="detail-name">
            <span class="name-title">商品等级：</span>
            {{ linkDetail.originalGradeName || "-" }}
          </span>
          <span class="detail-name">
            <span class="name-title">商品阶段：</span>
            {{ linkDetail.linkTimeStatusName || "-" }}
          </span>
          <span class="detail-name">
            <span class="name-title">负责人：</span>
            {{ linkDetail.managerName || "-" }}
          </span>

          <span class="detail-picture">
            <span class="name-title">主图：</span>
            <el-image
              v-if="linkDetail.urlAddress"
              style="height: 40px; width: 40px"
              :src="
                linkDetail.urlAddress +
                '?x-oss-process=image/resize,w_30,h_30,limit_0'
              "
              :preview-src-list="[linkDetail.urlAddress]"
            ></el-image>
            <span v-else>-</span>
          </span>

          <span class="detail-name">
            <span class="name-title">赛道：</span>
            {{ linkDetail.track || "-" }}
          </span>
          <span class="detail-name">
            <span class="name-title">项目：</span>
            {{ linkDetail.strategyTitle || "-" }}
          </span>
          <!-- <span class="detail-name">
            <span class="name-title">目标销售额：</span>
            {{ linkDetail.managerName || "-" }}
          </span>
          <span class="detail-name">
            <span class="name-title">目标坑位：</span>
            {{ linkDetail.managerName || "-" }}
          </span>-->
        </div>
        <div class="suggest-content">
          <span class="name-title">建议：</span> 当前产品评级为
          <span class="pre-grade">
            {{
            linkDetail.originalGradeName || "-"
            }}
          </span>，根据销售订单量建议调整为
          <span class="suggest-grade">
            {{
            linkDetail.presentGradeName || "-"
            }}
          </span>。
          <span style="margin-left: 60px" v-if="showRate && linkDetail.jumpButton">
            <el-button type="primary" size="mini" @click="showDailyDetail">日报</el-button>
          </span>
        </div>
      </div>
    </div>

    <!-- 总数据 -->
    <div class="left_top">
      <div class="text1 text">
        <div>总销售额</div>
        <div class="number">{{ overViewData.allAmount || "0" }} 元</div>
      </div>
      <div class="text">
        <div>总订单数</div>
        <div class="number">{{ overViewData.allOrderNum || "0" }} 个</div>
      </div>
      <div class="text1 text">
        <div>客单价</div>
        <div class="number">{{ overViewData.customerPrice || "0" }} 元</div>
      </div>
      <div class="text">
        <div>件单量</div>
        <div class="number">{{ overViewData.quantityPer || "0" }} 件</div>
      </div>
    </div>
    <div class="left_top">
      <div class="text">
        <div>总退款额</div>
        <div class="number">{{ overViewData.refundAmount || "0" }} 元</div>
      </div>
      <div class="text1 text">
        <div>总退款单数</div>
        <div class="number">{{ overViewData.refundNum || "0" }} 个</div>
      </div>

      <div class="text">
        <div>推广费用｜占比</div>
        <div class="number">
          {{
          (promotionFee || "0") +
          "元" +
          " | " +
          toPrecentage(promotionActualRatio)
          }}
        </div>
      </div>
      <!-- <div class="text">
        <div>平均健康指数</div>
        <div class="number">{{ overViewData.quantityPer || "0" }} 件</div>
      </div>
      <div class="text1 text">
        <div>毛利率</div>
        <div class="number">{{ overViewData.refundNum || "0" }} 个</div>
      </div>-->
      <div class="text1 text">
        <div>访客数</div>
        <div class="number">{{ visitorNum || "0" }} 个</div>
      </div>
    </div>

    <el-row :gutter="40">
      <el-col :span="12">
        <!-- 搜索 -->
        <el-radio-group v-model="changeBarChart" @change="changeBar">
          <el-radio-button :label="1">销售金额</el-radio-button>
          <el-radio-button :label="2">销售数量</el-radio-button>
          <el-radio-button :label="3">订单数量</el-radio-button>
        </el-radio-group>
        <!-- 图表内容 -->
        <el-row>
          <!-- 左边 -->
          <el-col :span="12">
            <!-- <div ref="pieChart" style="width: 450px; height: 300px;"></div> -->
            <!-- 订单数 -->
            <pie-chart v-if="changeBarChart === 3" :option="pieChartNumOption" :height="'350px'"></pie-chart>
            <!-- 订单额 -->
            <pie-chart v-if="changeBarChart === 1" :option="pieChartAmountOption" :height="'350px'"></pie-chart>
            <!-- 销售数量 -->
            <pie-chart
              v-if="changeBarChart === 2"
              :option="pieChartSaleNumOption"
              :height="'350px'"
            ></pie-chart>
            <!-- 种菜 -->
            <!-- <pie-chart :option="pieChartBottomOption" :height="'350px'"></pie-chart> -->
          </el-col>

          <!--中间 -->
          <el-col :span="12">
            <!-- <div id="myChartjw" style="width:500px; height:400px;"></div> -->

            <!-- 柱状图 -->
            <div class="main-bar">
              <bar-chart :option="barChartOption" :height="'300px'" v-if="changeBarChart == 3"></bar-chart>
              <line-chart
                v-if="changeBarChart == 2"
                :option="saleNumLineChartOption"
                :height="'300px'"
              ></line-chart>
              <line-chart
                v-if="changeBarChart == 1"
                :key="chartKey"
                :option="lineChartOption"
                :height="'300px'"
              ></line-chart>
              <!-- 同比环比部分 -->
              <div class="main-table" v-if="amountYoyMom.length > 0 && changeBarChart == 3">
                <el-table :data="percentageType" :key="chartKey">
                  <el-table-column prop="name" width="70" fixed align="center"></el-table-column>
                  <template v-for="item in amountYoyMom">
                    <el-table-column :label="item.time" width="90" align="center">
                      <template v-slot="{ row }">
                        {{
                        item[row.valueName]
                        ? (item[row.valueName] * 100).toFixed(2)
                        : 0
                        }}
                      </template>
                    </el-table-column>
                  </template>
                </el-table>
              </div>
            </div>
            <!-- 折线图 -->

            <!-- 同比环比部分 -->
            <div class="main-table" v-if="numYoyMom.length > 0 && changeBarChart == 1">
              <el-table :data="percentageType" :key="chartKey">
                <el-table-column prop="name" width="70" fixed align="center"></el-table-column>
                <template v-for="item in numYoyMom">
                  <el-table-column :label="item.time" width="90" align="center">
                    <template v-slot="{ row }">
                      {{
                      item[row.valueName]
                      ? (item[row.valueName] * 100).toFixed(2)
                      : 0
                      }}
                    </template>
                  </el-table-column>
                </template>
              </el-table>
            </div>

            <div class="main-table" v-if="saleYoyMom.length > 0 && changeBarChart == 2">
              <el-table :data="percentageType" :key="chartKey">
                <el-table-column prop="name" width="70" fixed align="center"></el-table-column>
                <template v-for="item in saleYoyMom">
                  <el-table-column :label="item.time" width="90" align="center">
                    <template v-slot="{ row }">
                      {{
                      item[row.valueName]
                      ? (item[row.valueName] * 100).toFixed(2)
                      : 0
                      }}
                    </template>
                  </el-table-column>
                </template>
              </el-table>
            </div>
          </el-col>
        </el-row>
        <!-- 退单量退单率折线图 -->
        <line-chart
          :option="refundLineChartOption"
          :height="'300px'"
          :width="'100%'"
          style="margin-top: 50px"
        ></line-chart>
      </el-col>
      <!--右边 -->
      <el-col :span="12" style="malgin-left: 0px">
        <el-row>
          <el-col :span="12">
            <pie-chart :option="promotionFeePieChartOption" :height="'350px'"></pie-chart>
          </el-col>
          <el-col :span="12">
            <bar-chart :option="promotionFeeBarChartOption" :height="'300px'"></bar-chart>
          </el-col>
        </el-row>
        <div>
          <span>推广计划明细</span>
          <el-table :data="promotionFeeTableData" border style="width: 100%">
            <el-table-column prop="date" label="序号" min-width="30" type="index" align="center"></el-table-column>
            <el-table-column prop="uploadDataTypeName" label="推广名称" align="center"></el-table-column>
            <el-table-column prop="planId" label="计划ID" align="center"></el-table-column>
            <el-table-column prop="roi" label="ROI" align="center"></el-table-column>
            <el-table-column prop="cost" label="推广花费" align="center"></el-table-column>
            <!-- <el-table-column
              prop="healthAssessmentIndex"
              label="健康评估值"
              align="center"
            ></el-table-column>-->
            <el-table-column prop="timeMarketStart" label="开始时间" align="center">
              <template v-slot="{ row }">
                <span>{{ getFormatDate(+row.timeMarketStart) }}</span>
              </template>
            </el-table-column>
          </el-table>
          <!-- 分页 -->
          <pagination
            v-show="promotionFeeTotal > 0"
            :total="promotionFeeTotal"
            :page.sync="promotionFeeReqParams.page"
            :limit.sync="promotionFeeReqParams.pageSize"
            @pagination="getPromotionFeeTable"
            :autoScroll="false"
          />
        </div>

        <div class="link-sku-type">
          <el-radio-group v-model="linkOrSkuType" @change="linkOrSkuChange">
            <el-radio-button label="link">商品链接</el-radio-button>
            <el-radio-button label="SKU">SKU</el-radio-button>
          </el-radio-group>
        </div>
        <el-row style="margin-top: 20px">
          <el-col :span="12">
            <div class="table-top" style="margin-right: 10px">
              <div class="table-title" style="margin-bottom: 10px">销售和订单量排名</div>
              <el-radio-group v-model="selectedOptionOrder" @change="amountOrNumChange" size="mini">
                <el-radio-button :label="1">金额排行</el-radio-button>
                <el-radio-button :label="2">数量排行</el-radio-button>
              </el-radio-group>
              <!-- 商品链接表格 -->
              <div v-if="linkOrSkuType === 'link'">
                <el-table
                  v-loading="numTableLoading"
                  v-loadmore="loadMoreTableData"
                  :data="tableDataOrder"
                  key="linkId"
                  border
                  style="width: 100%"
                  :max-height="450"
                >
                  <el-table-column width="40" type="index"></el-table-column>

                  <el-table-column label="商品名称" show-overflow-tooltip prop="linkId" align="center"></el-table-column>

                  <el-table-column label="数量" width="70" align="center" prop="quantity"></el-table-column>
                  <el-table-column
                    label="金额"
                    width="100"
                    show-overflow-tooltip
                    prop="paymentPrice"
                    align="center"
                  >
                    <template v-slot="{ row }">
                      <span>{{ row.paymentPrice.toFixed(2) }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="50" v-if="!storeDisabled">
                    <template slot-scope="scope">
                      <el-button type="text" size="small" @click="lookBoardSku(scope.row)">看板</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <!-- SKU表格 -->
              <div v-if="linkOrSkuType === 'SKU'">
                <el-table
                  v-loading="numTableLoading"
                  v-loadmore="loadMoreTableData"
                  :data="tableDataOrder"
                  key="skuUuid"
                  border
                  style="width: 100%"
                  :max-height="450"
                >
                  <el-table-column width="40" type="index"></el-table-column>

                  <el-table-column
                    label="SKU编码"
                    show-overflow-tooltip
                    prop="skuCode"
                    align="center"
                  ></el-table-column>
                  <el-table-column
                    label="规格名称"
                    show-overflow-tooltip
                    prop="spaceName"
                    align="center"
                  ></el-table-column>
                  <el-table-column label="数量" width="70" align="center" prop="quantity"></el-table-column>
                  <el-table-column
                    label="金额"
                    width="100"
                    show-overflow-tooltip
                    prop="paymentPrice"
                    align="center"
                  >
                    <template v-slot="{ row }">
                      <span>{{ row.paymentPrice.toFixed(2) }}</span>
                    </template>
                  </el-table-column>
                  <!-- <el-table-column label="操作" width="50">
                  <template slot-scope="scope">
                    <el-button type="text" size="small" @click="lookBoardSku(scope.row)">详情</el-button>
                  </template>
                  </el-table-column>-->
                </el-table>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="table-bottom" style="margin-left: 10px">
              <div class="table-title" style="margin-bottom: 10px">退款退货排名</div>
              <el-radio-group
                v-model="selectedOptionRefund"
                @change="amountOrNumChange"
                size="mini"
              >
                <el-radio-button :label="3">金额排行</el-radio-button>
                <el-radio-button :label="4">数量排行</el-radio-button>
              </el-radio-group>
              <div v-if="linkOrSkuType === 'link'">
                <el-table
                  v-loading="refundTableLoading"
                  v-loadmore="loadMoreRefundTableData"
                  key="linkId"
                  :data="tableDataRefund"
                  border
                  :max-height="450"
                >
                  <el-table-column width="40" type="index" align="center"></el-table-column>

                  <el-table-column label="商品名称" show-overflow-tooltip prop="linkId" align="center"></el-table-column>

                  <el-table-column label="数量" width="70" prop="quantity" align="center"></el-table-column>
                  <el-table-column
                    label="金额"
                    width="100"
                    show-overflow-tooltip
                    prop="paymentPrice"
                    align="center"
                  ></el-table-column>
                  <el-table-column label="操作" width="50xia" v-if="!storeDisabled">
                    <template slot-scope="scope">
                      <el-button type="text" size="small" @click="lookBoardSku(scope.row)">看板</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <div v-if="linkOrSkuType === 'SKU'">
                <el-table
                  v-loading="refundTableLoading"
                  v-loadmore="loadMoreRefundTableData"
                  key="skuUuid"
                  :data="tableDataRefund"
                  border
                  :max-height="450"
                >
                  <el-table-column width="40" type="index" align="center"></el-table-column>

                  <el-table-column
                    label="SKU编码"
                    show-overflow-tooltip
                    prop="skuCode"
                    align="center"
                  ></el-table-column>
                  <el-table-column
                    label="规格名称"
                    show-overflow-tooltip
                    prop="spaceName"
                    align="center"
                  ></el-table-column>
                  <el-table-column label="数量" width="70" prop="quantity" align="center"></el-table-column>
                  <el-table-column
                    label="金额"
                    width="100"
                    show-overflow-tooltip
                    prop="paymentPrice"
                    align="center"
                  ></el-table-column>
                  <!-- <el-table-column label="操作" width="50">
                  <template slot-scope="scope">
                    <el-button type="text" size="small" @click="lookBoardSku(scope.row)">详情</el-button>
                  </template>
                  </el-table-column>-->
                </el-table>
              </div>
            </div>
          </el-col>
        </el-row>
        <div class="right-table"></div>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="12">
        <div class="main-line" v-if="showRate">
          <!-- 金额人数折线图 -->
          <line-chart :option="purchaseLineChart" :height="'300px'"></line-chart>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="main-line" v-if="showRate">
          <!-- 百分比折线图 -->
          <line-chart :option="amountLineChart" :height="'300px'"></line-chart>
        </div>
      </el-col>
    </el-row>
    <div>
      <span v-if="this.deptReports.linkId.length == 1">7天人群分析</span>
      <div
        style="
          flex-wrap: wrap;
          display: flex;
          justify-content: space-around;
          margin-top: 20px;
        "
        v-if="showLinkDetail"
      >
        <div v-for="item in trendData" :key="item.categoryKeyUuid">
          <CrowdBarChart v-if="item != []" :option="item"></CrowdBarChart>
        </div>
      </div>

      <div class="button-container">
        <el-button type="primary" class="circle-button" @click="goToReport">日报填写</el-button>
        <el-button type="primary" class="circle-button" @click="goToOpinion">意见填写</el-button>
      </div>
    </div>

    <ViewDailyDialog
      :row.sync="currentRow"
      :showDialog.sync="showViewDailyDialog"
      :parentReqParams.sync="reqParams"
      :readOnly="false"
    ></ViewDailyDialog>

    <el-dialog
      :title="productTitle"
      @close="productStatusSku"
      :visible.sync="productShowSku"
      show-close
      fullscreen
      append-to-body
    >
      <product-sku
        v-if="productShowSku"
        :currentRow="searchParms"
        :selectSpuChange="selectSpuChange"
        :selectSkuChange="selectSkuChange"
      ></product-sku>
    </el-dialog>
  </div>
</template>
<script>
import {
  getLinkSelectList, // 链接下拉框
  getGradeDetail, // 查看商品看板当前等级详情
  getOverview, // 数据总览
  getOrderNum, // 订单、退单数饼状图
  getOrderSale, // 订单、退款额饼状图
  getOrderNumHistogram, // 订单、退单数柱状图
  getOrderSalesLineChart, // 订单、退单金额折线图
  getOrderRankingSale, // 链接销售额排行榜
  getOrderRankingNum, // 链接销售数量排行榜
  getRefundRankingSale, // 链接退款额排行榜
  getRefundRankingNum, // 链接退款数量排行榜
  getSkuOrderRankingSale, // SKU销售额排行榜
  getSkuOrderRankingNum, // SKU销售数量排行榜
  getSkuRefundRankingSale, // SKU退款额排行榜
  getSkuRefundRankingNum, // SKU退款数量排行榜
  getLinkRefundLineChart, // 退单量退单率折线图
  getVisitorNum, // 访客数
  getSaleNum, // 销售数量饼图
  getSaleNumLineChart, // 销售数量折线图
  getPromotion, // 推广费用饼图
  getPromotionFeeHistogram, // 推广费用柱状图
  getPromotionFeeTable, // 推广费用表格
  getPromotionFeeProportion, // 推广费用-占比
} from '@/api/bulletinboard/linkBoard'
import {
  getPromotionFee,
  getPromotionActualRatio,
} from '@/api/promotionData/linkPromotion'
import {
  getPurchaseLineChart,
  getCollectionLineChart,
  getRefundLineChart,
  getConversionLineChart,
  getClickThroughLineChart,
  getSearchConversionRateChart,
  getUVCostChart,
  getaverageDurationChart,
  getPayCountChart,
  getPayingBuyersCountChart,
  getRepeatPurchaseCountChart,
  getSearchVisitorsChart,
  getVisitorsCountChart,
  getRefundAmountChart,
  getPayAmountChart,
} from '@/api/dailyManage/viewDaily'
import { listPlatform, listStore } from '@/api/baseData/common'
import {
  getTrendList,
  getAnalysisTypeList,
} from '@/api/promotionData/CrowdAnalysis'
import { getFormatDate, getFormaMonth } from '@/utils/common'
import lineChart from '@/components/charts/LineChart.vue'
import pieChart from '@/components/charts/PieChart.vue'
import barChart from '@/components/charts/BarChart.vue'
import ViewDailyDialog from '@/views/dailyManage/viewDaily/viewDailyDialog'
import { addDay, addDayEnd } from '@/utils/common.js'
import CrowdBarChart from '../../promotionData/linkPromotion/components/BarChart.vue'

import { debounce } from 'lodash'
import { isArray } from 'lodash'
// import ProductSku from '@/views/bulletinboard/components/ProductSku.vue'
export default {
  name: 'LinkBoard',
  props: {
    rowParams: {
      type: Object,
      default: function () {
        return {}
      },
    },
    storeDisabled: {
      typeof: 'boolean',
      default: false,
    },
  },
  directives: {
    loadmore: {
      bind(el, binding) {
        const selectWrap = el.querySelector('.el-table .el-table__body-wrapper')
        selectWrap.addEventListener('scroll', function () {
          const scrollDistance =
            this.scrollHeight - this.scrollTop - this.clientHeight
          if (scrollDistance <= 0.5) {
            binding.value() //执行在使用时绑定的函数
            // console.log('binding: ', binding);
          }
        })
      },
    },
  },
  data() {
    return {
      // 显示日报弹层
      showViewDailyDialog: false,
      // 传给日报的详情信息
      currentRow: {},
      //平台下拉框
      platformList: [],
      //店铺下拉框
      storeList: [],
      // 链接下拉框
      linkList: [],
      // 展示商品链接详情
      showLinkDetail: false,
      //
      // 弹窗标题
      productTitle: '',
      // 弹窗select栏
      selectSpuChange: false,
      selectSkuChange: false,
      // 弹窗展示
      productShowSku: false,
      // prop数据
      searchParms: {},
      propLinkList: [],
      propUuidList: [],
      // sku下拉框的列表
      skuList: [],
      // 商品链接详情
      linkDetail: {},
      // 是否展示金钱、人 百分比的折线图
      showRate: false,
      // 链接或SKUradio
      linkOrSkuType: 'link',
      // 订单排行版选择接收参数
      selectedOptionOrder: 1, // 销售排行榜
      selectedOptionRefund: 3, // 退款排行榜
      tableDataOrder: [], // 销售排行榜
      tableDataRefund: [], // 退款排行榜
      chartPie: null,
      // 公共入参
      deptReports: {
        platform: [],
        store: [],
        startTime: '',
        endTime: '',
        formatType: 2,
        keyWord: '', // 链接id（精准）、链接标题（模糊）
        linkId: [],
        page: 1,
        pageSize: 10,
      },
      // 搜索条件双向绑定的入参
      vModelReqParams: {
        platform: [],
        store: [],
        startTime: '',
        endTime: '',
        formatType: 2,
        keyWord: '', // 链接id（精准）、链接标题（模糊）
        linkId: [],
        page: 1,
        pageSize: 10,
        skuUuid: '',
      },
      // 金额 人 百分比折线图公共入参
      reqParams: {
        startTime: '',
        endTime: '',
        linkId: [],
        keyWord: '',
      },
      // 排行榜的分页
      pageData: {
        top: {
          page: 1,
          pageSize: 10,
        },
        bom: {
          page: 1,
          pageSize: 10,
        },
      },
      // 销售排行榜总条数
      orderTotal: 0,
      // 退款排行榜总条数
      refundTotal: 0,
      // 选中的开始时间
      startPickerTime: '',
      // 时间范围快捷选择
      pickerOptions: {
        shortcuts: [
          {
            text: '最近7天',
            onClick(picker) {
              const end = addDay(-1)
              const start = addDayEnd(-7)
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: '最近14天',
            onClick(picker) {
              const end = addDay(-1)
              const start = addDayEnd(-14)
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: '最近1个月',
            onClick(picker) {
              const end = addDay(-1)
              const start = addDayEnd(-30)
              picker.$emit('pick', [start, end])
            },
          },
        ],
        // 当点击时 将时间拿来做禁用时间范围计算
        onPick: (timeObj) => {
          this.startPickerTime = new Date(timeObj.minDate).getTime()
        },
        disabledDate: (time) => {
          if (!this.startPickerTime) return false
          const now = this.startPickerTime
          // 31 * 24 * 3600 * 1000 是31天的毫秒数
          const minTime = now - 31 * 24 * 3600 * 1000
          const maxTime = now + 31 * 24 * 3600 * 1000

          return time.getTime() < minTime || time.getTime() > maxTime
        },
      },
      //
      timeValueArr: [],
      // 退单加载状态
      refundTableLoading: false,
      // 订单表格加载状态
      numTableLoading: false,
      // 订单量数据
      pieChartNumOption: {},

      //百分比折线图
      purchaseLineChart: {},

      //金额和人数的折线图
      amountLineChart: {},

      // 种菜推广数据
      pieChartBottomOption: {},

      // 订单额数据
      pieChartAmountOption: {},
      // 销售数量数据
      pieChartSaleNumOption: {},

      // 中间柱状图数据
      barChartOption: {},

      // 中间折线图数据
      lineChartOption: {},

      // 销售数量折线图
      saleNumLineChartOption: {},
      // 推广费用饼图
      promotionFeePieChartOption: {},
      // 推广费用柱状图
      promotionFeeBarChartOption: {},
      // 推广费用表格请求参数
      promotionFeeReqParams: {
        page: 1,
        pageSize: 10,
      },
      trendData: [],

      // 推广费用表格
      promotionFeeTableData: [],
      //
      promotionFeeTotal: 0,
      //  强制渲染
      chartKey: 0,
      // 中间退单量退单率折线图
      refundLineChartOption: {},
      // 单量同环比
      numYoyMom: [],

      // 单额同环比
      amountYoyMom: [],

      // 销售同比
      saleYoyMom: [],
      // 同比环比表格模板
      percentageType: [
        { name: '同比(%)', valueName: 'yoy' },
        { name: '环比(%)', valueName: 'mom' },
      ],

      // 获取数据总览
      overViewData: {},
      // 访客数
      visitorNum: '',
      // 推广费用
      promotionFee: '',
      // 推广占比
      promotionActualRatio: '',
      // 图表切换
      changeBarChart: 1,

      // 趋势图入参
      trendParams: {
        analysisTypeList: [],
        linId: '',
        timeType: 7,
      },
    }
  },
  // 采用递归所以得在components内部引入
  components: {
    lineChart,
    barChart,
    pieChart,
    ViewDailyDialog,
    CrowdBarChart,
    ProductSku: () => import('@/views/bulletinboard/components/ProductSku.vue'),
  },
  async created() {
    await this.getStoreList()
    await this.getPlatformList()
    // 提取父组件传的值，赋值查询入参
    if (this.rowParams.startTime) {
      const {
        platformUuid,
        storeUuid,
        startTime,
        endTime,
        formatType,
        linkId,
        skuUuid,
        linkList,
      } = this.rowParams
      // 结构的参数中，只要存在一项，说明是跳转来的
      if (platformUuid != '') {
        this.vModelReqParams.platform.push(platformUuid)
      }
      // this.vModelReqParams.store = storeUuid
      // this.vModelReqParams.linkId = linkId
      if (isArray(linkId)) {
        this.vModelReqParams.linkId = linkId
      } else {
        this.vModelReqParams.linkId.push(linkId)
      }
      if (storeUuid) {
        this.vModelReqParams.store.push(storeUuid)
      } else {
        this.vModelReqParams.store = []
      }
      this.vModelReqParams.skuUuid = skuUuid
      this.vModelReqParams.startTime = startTime
      this.vModelReqParams.endTime = endTime
      this.vModelReqParams.formatType = formatType
      this.timeValueArr = [startTime, endTime]
      // 获取链接下拉框数据
      if (!linkList) {
        this.getLinkList()
      } else {
        this.linkList = linkList
      }
    } else {
      //设置初始时间
      this.vModelReqParams.startTime = addDay(-7)
      this.vModelReqParams.endTime = addDayEnd(-1)
      this.timeValueArr.push(this.vModelReqParams.startTime)
      this.timeValueArr.push(this.vModelReqParams.endTime)
    }

    await this.getAllData()
  },
  methods: {
    // 时间戳格式化
    getFormatDate(date) {
      return getFormatDate(date)
    },

    // 展示日报
    showDailyDetail() {
      this.currentRow = {
        linkTitle: this.linkDetail.linkTitle,
        linkId: this.linkDetail.linkId,
        linkLevel: this.linkDetail.originalGradeName,
        managerName: this.linkDetail.managerName,
        url: this.linkDetail.urlAddress,
        srcList: [this.linkDetail.urlAddress],
      }
      this.showViewDailyDialog = true
      console.log('日报')
    },

    // 查看当前等级详情
    async getGradeDetail() {
      const res = await getGradeDetail(this.deptReports)
      if (res.data && res.data.linkId) {
        this.showLinkDetail = true
        this.linkDetail = res.data
      } else {
        this.showLinkDetail = false
      }
      // console.log('res', res)
    },

    // 店铺选择的change事件
    storeSelectChange(val) {
      this.vModelReqParams.linkId = []
      if (val) {
        // console.log('val', val)
        this.getLinkList()
      }
    },

    // 获取链接下拉框数据
    async getLinkList() {
      const res = await getLinkSelectList({
        storeUuidList: this.vModelReqParams.store,
      })
      this.linkList = res.data
    },
    //获取店铺
    async getStoreList() {
      const res = await listStore()
      this.storeList = res.data
    },
    //获取平台
    async getPlatformList() {
      const res = await listPlatform()
      this.platformList = res.data
    },
    // 获取所有列表数据
    async getAllData() {
      this.deptReports = JSON.parse(JSON.stringify(this.vModelReqParams))
      if (this.deptReports.keyWord || this.deptReports.linkId.length === 1) {
        // 链接详情接口放最前 查不到当前链接信息 不继续调其他接口
        await this.getGradeDetail() // 获取链接详情
        // 按日的时候会再展示百分比、金额、人的折线图
        if (this.deptReports.formatType == 2) {
          this.showRate = true
          this.reqParams.startTime = this.deptReports.startTime
          this.reqParams.endTime = this.deptReports.endTime
          this.reqParams.linkId = this.deptReports.linkId[0]
          this.reqParams.keyWord = this.deptReports.keyWord

          await this.geLineChart() // 百分比的折线图
          await this.getAmountLineChart() //钱和人数的折线图
        } else {
          this.showRate = false
        }
      } else {
        // 链接数量不为一 不展示链接详情
        this.showRate = false
        this.showLinkDetail = false
      }
      this.getOverviewList() // 数据总览
      this.getVisitorNum() // 访客数
      this.createChart() // 数量饼状图
      this.progressBar() // 柱状图
      this.mounted() // 折线图
      this.createChartSale() // 金额饼状图
      this.getSaleNum() // 销售额
      this.getTableList() // 排行榜
      this.getRefundLineChart() // 退单量、退单率折线图
      this.getSaleNumLineChart() // 销售额折线图
      this.getPromotion() // 获取推广费用
      this.getPromotionFeeHistogram() // 获取推广费用柱状图
      this.getPromotionFeeTable(1)
      this.getAnalysisTypeList()
      this.getPromotionFeeProportion()
      // this.getPromotionFee(); // 获取推广费用
      // this.getPromotionActualRatio(); // 获取推广占比
      // await this.createChartVg() // 种菜饼状图
    },

    // 设置默认时间
    getMonthTime() {
      const now = new Date()
      // 设置当月第一天
      now.setDate(1)
      // 设置时分秒为0
      now.setHours(0, 0, 0, 0)
      // 获取时间戳
      const timestamp = now.getTime() + ''
      this.vModelReqParams.startTime = timestamp
      let endTime = new Date().getTime() + ''
      this.vModelReqParams.endTime = endTime
      this.timeValueArr.push(timestamp)
      this.timeValueArr.push(endTime)
    },

    // 选择时间
    changeTime(val) {
      if (val) {
        this.vModelReqParams.startTime = val[0]
        this.vModelReqParams.endTime = val[1]
      }
    },
    // 时间选择失焦时将startPickerTime置空 目的是清除禁用的时间范围
    blurTime() {
      this.startPickerTime = ''
    },
    // 加载销售更多表格数据
    loadMoreTableData: debounce(function () {
      if (this.tableDataOrder.length >= this.orderTotal) {
        return
      }
      this.amountOrNumChange(this.selectedOptionOrder, {
        page: ++this.pageData.top.page,
        pageSize: this.pageData.top.pageSize,
      })
    }, 200),
    // 加载退款更多表格数据
    loadMoreRefundTableData: debounce(function () {
      if (this.tableDataRefund.length >= this.refundTotal) {
        return
      }
      this.amountOrNumChange(this.selectedOptionRefund, {
        page: ++this.pageData.bom.page,
        pageSize: this.pageData.bom.pageSize,
      })
    }, 200),

    // 排行榜
    async getTableList() {
      await this.linkOrSkuChange()
      // //销售
      // const res = await getOrderRankingSale(this.deptReports)
      // this.tableDataOrder = res.data

      // //退款
      // const resRefund = await getRefundRankingSale(this.deptReports)
      // this.tableDataRefund = resRefund.data
    },

    // link-sku的radio change事件
    async linkOrSkuChange(value) {
      // 默认查询金额的
      this.selectedOptionOrder = 1 // 销售排行榜
      this.selectedOptionRefund = 3 // 退款排行榜
      this.pageData = {
        top: {
          page: 1,
          pageSize: 10,
        },
        bom: {
          page: 1,
          pageSize: 10,
        },
      }
      this.deptReports.page = 1
      this.deptReports.pageSize = 10

      await this.getAmountTableList()
      await this.getRefundAmountTableList()
    },

    // 获取排行列表
    async amountOrNumChange(value, pageObj) {
      if (value === 1 || value === 2) {
        if (!pageObj) {
          Object.assign(this.pageData.top, { page: 1, pageSize: 10 })
          this.tableDataOrder = []
        }
      } else {
        // pageObj ? pageObj :
        if (!pageObj) {
          Object.assign(this.pageData.bom, { page: 1, pageSize: 10 })
          this.tableDataRefund = []
        }
      }
      // console.log('pageObj', pageObj)

      this.deptReports.page = pageObj ? pageObj.page : 1
      this.deptReports.pageSize = pageObj ? pageObj.pageSize : 10
      switch (value) {
        case 1:
          // 销售金额排行
          await this.getAmountTableList(pageObj)
          this.numTableLoading = false
          break
        case 2:
          await this.getNumTableList(pageObj)
          this.numTableLoading = false
          break
        case 3:
          await this.getRefundAmountTableList(pageObj)
          this.refundTableLoading = false
          break
        case 4:
          await this.getRefundNumTableList(pageObj)
          break
      }
    },
    // 获取销售金额排行数据
    async getAmountTableList(pageObj) {
      // 销售金额排行
      this.numTableLoading = true
      let amountRes
      if (this.linkOrSkuType === 'link') {
        amountRes = await getOrderRankingSale(this.deptReports)
      } else {
        amountRes = await getSkuOrderRankingSale(this.deptReports)
      }
      this.tableDataOrder = pageObj
        ? [...this.tableDataOrder, ...amountRes.data.records]
        : amountRes.data.records
      this.orderTotal = amountRes.data.total
      this.numTableLoading = false
    },

    // 获取销售数量排行数据
    async getNumTableList(pageObj) {
      this.numTableLoading = true
      let numRes
      if (this.linkOrSkuType === 'link') {
        numRes = await getOrderRankingNum(this.deptReports)
      } else {
        numRes = await getSkuOrderRankingNum(this.deptReports)
      }
      this.tableDataOrder = pageObj
        ? [...this.tableDataOrder, ...numRes.data.records]
        : numRes.data.records
      this.orderTotal = numRes.data.total
      this.numTableLoading = false
    },

    // 获取退款金额排行数据
    async getRefundAmountTableList(pageObj) {
      this.refundTableLoading = true
      let refundAmountRes
      if (this.linkOrSkuType === 'link') {
        refundAmountRes = await getRefundRankingSale(this.deptReports)
      } else {
        refundAmountRes = await getSkuRefundRankingSale(this.deptReports)
      }
      this.tableDataRefund = pageObj
        ? [...this.tableDataRefund, ...refundAmountRes.data.records]
        : refundAmountRes.data.records
      this.refundTotal = refundAmountRes.data.total
      this.refundTableLoading = false
    },

    // 获取退款数量排行数据
    async getRefundNumTableList(pageObj) {
      this.refundTableLoading = true
      let refundNumRes
      if (this.linkOrSkuType === 'link') {
        refundNumRes = await getRefundRankingNum(this.deptReports)
      } else {
        refundNumRes = await getSkuRefundRankingNum(this.deptReports)
      }
      this.tableDataRefund = pageObj
        ? [...this.tableDataRefund, ...refundNumRes.data.records]
        : refundNumRes.data.records
      this.refundTotal = refundNumRes.data.total
      this.refundTableLoading = false
    },

    // 订单、退款额 折线图
    async mounted() {
      const res = await getOrderSalesLineChart(this.deptReports)
      const memberAmountData = res.data.map((item) => item.mermbAmount)
      // 提取渲染同比环比表格数据
      this.numYoyMom = memberAmountData
      this.percentageType = [
        { name: '同比(%)', valueName: 'yoy' },
        { name: '环比(%)', valueName: 'mom' },
      ]
      // 指定图表的配置项和数据
      let option = {
        title: {
          text: '订单、退款额对比图',
          textStyle: {
            fontSize: 16,
          },
          left: '30%',
        },
        tooltip: {},
        legend: {
          orient: 'vertical',
          left: 'left',
        },
        xAxis: {
          boundaryGap: true, // 设置 boundaryGap 为 true
          axisTick: {
            alignWithLabel: true, // 设置刻度线与标签对齐
          },
          data: memberAmountData.map((item) => item.time), // 时间点集合
        },
        yAxis: {},
        grid: {
          left: '4.5%',
          right: '5%',
          bottom: '2%',
          containLabel: true,
        },
        series: [
          {
            name: '订单额',
            type: 'line',
            data: memberAmountData.map((item) => item.orderAmount),
          },
          {
            name: '退款额',
            type: 'line',
            data: memberAmountData.map((item) => item.refundAmount),
          },
        ],
      }
      // 使用刚指定的配置项和数据显示图表
      this.lineChartOption = { ...option }
    },
    // 退单量、退单率 折线图
    async getRefundLineChart() {
      this.percentageType = []
      const res = await getLinkRefundLineChart(this.deptReports)
      const memberAmountData = res.data.countRateVOList
      const formatType = res.data.formatType
      this.percentageType = [
        { name: '同比(%)', valueName: 'yoy' },
        { name: '环比(%)', valueName: 'mom' },
      ]
      // 指定图表的配置项和数据
      let option = {
        title: {
          text: '退单量、退单率对比图',
          textStyle: {
            fontSize: 16,
          },
          left: '30%',
        },
        tooltip: {
          show: true,
          trigger: 'item',
          formatter: (params) => {
            if (params.seriesName === '退单率') {
              return (
                params.name +
                '<br/>' +
                params.seriesName +
                '：' +
                params.value +
                '%'
              )
            } else {
              return (
                params.name + '<br/>' + params.seriesName + '：' + params.value
              )
            }
          },
        },
        legend: {
          orient: 'vertical',
          left: 'left',
        },
        xAxis: {
          boundaryGap: true, // 设置 boundaryGap 为 true
          axisTick: {
            alignWithLabel: true, // 设置刻度线与标签对齐
          },
          data: memberAmountData.map((item) => {
            // 时间格式化 2 按日 1按月
            if (formatType == 1) {
              return getFormaMonth(+item.dayTime)
            } else {
              return getFormatDate(+item.dayTime)
            }
          }), // 时间点集合
        },
        yAxis: [
          {
            type: 'value',
            position: 'left',
          },
          {
            type: 'value',
            position: 'right',
            alignTicks: true,
          },
        ],
        grid: {
          left: '4.5%',
          right: '5%',
          bottom: '2%',
          containLabel: true,
        },
        series: [
          {
            name: '退单量',
            type: 'line',
            yAxisIndex: 0,
            data: memberAmountData.map((item) =>
              item.orderCount === null ? 0 : item.orderCount
            ),
          },
          {
            name: '退单率',
            type: 'line',
            yAxisIndex: 1,
            data: memberAmountData.map((item) =>
              item.countData === null ? 0 : (item.countData * 100).toFixed(2)
            ),
          },
        ],
      }
      // 使用刚指定的配置项和数据显示图表
      this.refundLineChartOption = { ...option }
    },

    //百分比折线图
    async geLineChart() {
      let exampleLineOptions = {
        legend: {
          // orient: 'vertical',
          left: 'left',
          data: [
            '加购率',
            '收藏率',
            '退货率',
            '转换率',
            '点击率',
            '搜索转化率',
            'UV价值',
            '平均停留时长',
          ],
        },
        tooltip: {
          trigger: 'axis',
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: [],
        },
        yAxis: [
          {
            type: 'value',
          },
          {
            type: 'value',
            yAxisIndex: 1, //在单个图表实例中存在多个y轴的时候有用
          },
        ],
        series: [
          {
            name: '加购率',
            type: 'line',
            data: [],
            markPoint: {
              data: [{ type: 'max' }],
            },
          },
          {
            name: '收藏率',
            type: 'line',
            data: [],
            markPoint: {
              data: [{ type: 'max' }],
            },
          },
          {
            name: '退货率',
            type: 'line',
            data: [],
            markPoint: {
              data: [{ type: 'max' }],
            },
          },
          {
            name: '转换率',
            type: 'line',
            data: [],
            markPoint: {
              data: [{ type: 'max' }],
            },
          },
          {
            name: '点击率',
            type: 'line',
            data: [],

            markPoint: {
              data: [{ type: 'max' }],
            },
          },
          {
            name: '搜索转化率',
            type: 'line',
            data: [],

            markPoint: {
              data: [{ type: 'max' }],
            },
          },
          {
            name: 'UV价值',
            type: 'line',
            data: [],

            markPoint: {
              data: [{ type: 'max' }],
            },
            yAxisIndex: 1, //在单个图表实例中存在多个y轴的时候有用
          },
          {
            name: '平均停留时长',
            type: 'line',
            data: [],

            markPoint: {
              data: [{ type: 'max' }],
            },
            yAxisIndex: 1, //在单个图表实例中存在多个y轴的时候有用
          },
        ],
      }

      //加购率
      const purchaseRes = await getPurchaseLineChart(this.reqParams)
      //加工各种率的数据
      let purchaseResult = this.processRate(purchaseRes.data, true)

      //收藏率
      const collectionRes = await getCollectionLineChart(this.reqParams)
      //加工各种率的数据
      let collectionResult = this.processRate(collectionRes.data, true)

      //退货率
      const refundRes = await getRefundLineChart(this.reqParams)
      //加工各种率的数据
      let refundResult = this.processRate(refundRes.data, true)

      //退货率
      const conversionRes = await getConversionLineChart(this.reqParams)
      //加工各种率的数据
      let conversionResult = this.processRate(conversionRes.data, true)

      //点击率
      const clickThroughRes = await getClickThroughLineChart(this.reqParams)
      //加工各种率的数据
      let clickThrougResult = this.processRate(clickThroughRes.data, true)

      //搜索转化率
      const searchConversionRes = await getSearchConversionRateChart(
        this.reqParams
      )
      //加工各种率的数据
      let searchConversionResult = this.processRate(
        searchConversionRes.data,
        true
      )

      //UV价值
      const UVCostRes = await getUVCostChart(this.reqParams)
      //加工各种率的数据
      let UVCostResult = this.processRate(UVCostRes.data)

      //平均停留时长
      const averageDurationRes = await getaverageDurationChart(this.reqParams)
      let averageDurationResult = this.processRate(averageDurationRes.data)

      exampleLineOptions.xAxis.data = purchaseResult.xAxis
      exampleLineOptions.series[0].data = purchaseResult.series //加购率
      exampleLineOptions.series[1].data = collectionResult.series //收藏率
      exampleLineOptions.series[2].data = refundResult.series //退货率
      exampleLineOptions.series[3].data = conversionResult.series //转换率
      exampleLineOptions.series[4].data = clickThrougResult.series //点击率
      exampleLineOptions.series[5].data = searchConversionResult.series //搜索转化率
      exampleLineOptions.series[6].data = UVCostResult.series //UV价值
      exampleLineOptions.series[7].data = averageDurationResult.series //平均停留时长
      this.purchaseLineChart = exampleLineOptions
    },

    //钱和人折线图
    async getAmountLineChart() {
      let exampleLineOptions = {
        legend: {
          // orient: 'vertical',
          left: 'left',
          data: [
            '支付件数',
            '支付买家数',
            '商品访客数',
            '加购人数',
            '搜索访客',
            '支付金额',
            '退款金额',
          ],
        },
        tooltip: {
          trigger: 'axis',
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: [],
        },
        yAxis: [
          {
            type: 'value',
          },
          {
            type: 'value',
            yAxisIndex: 1, //在单个图表实例中存在多个y轴的时候有用
          },
        ],
        series: [
          {
            name: '支付件数',
            type: 'line',
            data: [],
            markPoint: {
              data: [{ type: 'max' }],
            },
          },
          {
            name: '支付买家数',
            type: 'line',
            data: [],
            markPoint: {
              data: [{ type: 'max' }],
            },
          },
          {
            name: '商品访客数',
            type: 'line',
            data: [],
            markPoint: {
              data: [{ type: 'max' }],
            },
          },
          {
            name: '加购人数',
            type: 'line',
            data: [],
            markPoint: {
              data: [{ type: 'max' }],
            },
          },
          {
            name: '搜索访客',
            type: 'line',
            data: [],

            markPoint: {
              data: [{ type: 'max' }],
            },
          },
          {
            name: '支付金额',
            type: 'line',
            data: [],

            markPoint: {
              data: [{ type: 'max' }],
            },
            yAxisIndex: 1, //在单个图表实例中存在多个y轴的时候有用
          },
          {
            name: '退款金额',
            type: 'line',
            data: [],

            markPoint: {
              data: [{ type: 'max' }],
            },
            yAxisIndex: 1, //在单个图表实例中存在多个y轴的时候有用
          },
        ],
      }

      //支付件数
      const payCountRes = await getPayCountChart(this.reqParams)
      //加工各种率的数据
      let payCountResult = this.processRate(payCountRes.data)

      //支付件数
      const payingBuyersCountRes = await getPayingBuyersCountChart(
        this.reqParams
      )
      //加工各种率的数据
      let payingBuyersCountResult = this.processRate(payingBuyersCountRes.data)

      //商品访客数
      const visitorsCountRes = await getVisitorsCountChart(this.reqParams)
      //加工各种率的数据
      let visitorsCountResult = this.processRate(visitorsCountRes.data)

      //加购人数
      const repeatPurchaseCountRes = await getRepeatPurchaseCountChart(
        this.reqParams
      )
      //加工各种率的数据
      let repeatPurchaseCountResult = this.processRate(
        repeatPurchaseCountRes.data
      )

      //搜索访客
      const searchVisitorsRes = await getSearchVisitorsChart(this.reqParams)
      //加工各种率的数据
      let searchVisitorsResResult = this.processRate(searchVisitorsRes.data)

      //支付金额
      const payAmountRes = await getPayAmountChart(this.reqParams)
      //加工各种率的数据
      let payAmountResResult = this.processRate(payAmountRes.data)

      //支付金额
      const refundAmountRes = await getRefundAmountChart(this.reqParams)
      //加工各种率的数据
      let refundAmountResult = this.processRate(refundAmountRes.data)

      exampleLineOptions.xAxis.data = payCountResult.xAxis
      exampleLineOptions.series[0].data = payCountResult.series //支付件数
      exampleLineOptions.series[1].data = payingBuyersCountResult.series //支付买家数
      exampleLineOptions.series[2].data = visitorsCountResult.series //商品访客数
      exampleLineOptions.series[3].data = repeatPurchaseCountResult.series //加购人数
      exampleLineOptions.series[4].data = searchVisitorsResResult.series //搜索访客
      exampleLineOptions.series[5].data = payAmountResResult.series //支付金额
      exampleLineOptions.series[6].data = refundAmountResult.series //退款金额

      this.amountLineChart = exampleLineOptions
    },

    //加工各种率的数据
    processRate(data, needPercentage) {
      //处理数据，时间格式化，加百分号
      let item
      let result = { series: [], xAxis: [] }
      for (let x = 0; x < data.length; x++) {
        item = data[x]
        if (needPercentage != null && needPercentage === true) {
          result.series.push(_.round(_.multiply(100, item.rare), 2))
        } else {
          result.series.push(item.rare)
        }

        result.xAxis.push(getFormatDate(item.time))
      }
      return result
    },

    // 柱状图
    async progressBar() {
      this.percentageType = []
      const res = await getOrderNumHistogram(this.deptReports)
      const memberAmountData = res.data.map((item) => item.mermbAmount)
      // 提取渲染同比环比表格数据
      this.amountYoyMom = memberAmountData
      this.percentageType = [
        { name: '同比(%)', valueName: 'yoy' },
        { name: '环比(%)', valueName: 'mom' },
      ]
      let option = {
        title: {
          text: '订单、退单量对比图',
          textStyle: {
            fontSize: 16,
          },
          left: '30%',
        },
        tooltip: {},
        legend: {
          orient: 'vertical',
          left: 'left',
        },
        xAxis: {
          boundaryGap: true, // 设置 boundaryGap 为 true
          axisTick: {
            alignWithLabel: true, // 设置刻度线与标签对齐
          },
          data: memberAmountData.map((item) => item.time), // 时间点集合
        },
        yAxis: {},
        grid: {
          left: '4.5%',
          right: '5%',
          bottom: '2%',
          containLabel: true,
        },
        series: [
          {
            name: '订单数',
            type: 'bar',
            data: memberAmountData.map((item) => item.orderNum), // 订单数集合
          },
          {
            name: '退单数',
            type: 'bar',
            itemStyle: { color: '#93DB70' },
            data: memberAmountData.map((item) => item.refundNum), // 退单数集合
          },
        ],
      }
      this.barChartOption = { ...option }
    },

    // 种菜饼状图、种菜的接口是订单数的
    async createChartVg() {
      const res = await getOrderNum(this.deptReports)
      const option = {
        tooltip: {
          trigger: 'item',
          position: 'right',
          formatter: '{a} <br/>{b} : {c} ({d}%)',
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: ['推广', '种菜'],
        },
        series: [
          {
            type: 'pie',
            radius: '50%',
            avoidLabelOverlap: false,
            label: {
              show: true,
              position: 'outside',
              formatter: '{b} \n{c} \n({d})%',
            },
            labelLine: {
              show: true,
              length: 10,
              length2: 15,
              length2: 15,
            },
            data: [
              { value: res.data.orderData.orderNum, name: '推广' },
              { value: res.data.refundData.refundNum, name: '种菜' },
            ],
          },
        ],
      }

      this.pieChartBottomOption = { ...option }

      // myChart.setOption(option)
    },
    // 订单、退单量 饼状图
    async createChart() {
      const res = await getOrderNum(this.deptReports)
      // 订单、退单量 饼图数据
      let exampleOptions = {
        tooltip: {
          trigger: 'item',
          position: 'right',
          formatter: '{a} <br/>{b} : {c} ({d}%)',
        },
        legend: {
          orient: 'vertical',
          left: 'left',
        },
        series: [
          {
            type: 'pie',
            radius: '50%',
            center: ['50%', '50%'],
            data: [
              {
                value: res.data.orderData.orderNum,
                name: '订单数',
                itemStyle: { color: '#003399' },
              },
              {
                value: res.data.refundData.refundNum,
                name: '退单数',
                itemStyle: { color: '#33cccc' },
              },
            ],
            label: {
              show: true,
              position: 'outside',
              formatter: (params) => {
                if (params) {
                  return (
                    `${params.name}` +
                    `\n${params.value}` +
                    `\n${params.percent === undefined ? 0 : params.percent}%`
                  )
                }
                return ''
              },
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          },
        ],
      }
      this.pieChartNumOption = { ...exampleOptions }
    },

    // 订单、退款额 饼状图
    async createChartSale() {
      const res = await getOrderSale(this.deptReports)
      const option = {
        tooltip: {
          trigger: 'item',
          position: 'right',
          formatter: '{a} <br/>{b} : {c} ({d}%)',
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: ['退款额', '订单额'],
        },
        series: [
          {
            type: 'pie',
            radius: '50%',
            avoidLabelOverlap: false,
            label: {
              show: true,
              position: 'outside',
              formatter: (params) => {
                if (params) {
                  return (
                    `${params.name}` +
                    `\n${params.value}` +
                    `\n${params.percent === undefined ? 0 : params.percent}%`
                  )
                }
                return ''
              },
            },
            labelLine: {
              show: true,
              length: 10,
              length2: 15,
            },
            data: [
              {
                value: res.data.orderData.orderAmount,
                name: '订单额',
                itemStyle: { color: '#ff6600' },
              },
              {
                value: res.data.refundData.refundAmount,
                name: '退款额',
                itemStyle: { color: '#ffcc33' },
              },
            ],
          },
        ],
      }
      this.pieChartAmountOption = { ...option }
      // myChart.setOption(option)
    },
    // 获取数据总览
    async getOverviewList() {
      const res = await getOverview(this.deptReports)
      this.overViewData = res.data
    },
    // sku看板
    lookBoardSku(row) {
      this.productTitle = `${row.linkId}看板`
      this.selectSpuChange = false
      this.selectSkuChange = false
      console.log('row: ', row)
      // this.searchParms
      this.propLinkList = []
      this.propUuidList = []
      this.propLinkList.push(row.linkUuid)
      row.skuUuidList.forEach((element) => {
        this.propUuidList.push(element.code)
      })
      this.skuList = row.skuUuidList
      Object.assign(this.searchParms, {
        from: 'linkBord', //入口来源
        timeScopeArr: this.timeValueArr, //时间范围数组
        timeScopeType: this.vModelReqParams.formatType, //时间范围类型
        skuNameArrCurrent: this.skuList,
        linkIdList: this.propLinkList,
        spu: {
          spuUuid: [], //spu uuid
          spuNameArr: [], //spu名称数组
        },
        sku: {
          skuUuid: this.propUuidList, //sku uuid
          skuCode: [], //sku编码
          skuNameArr: [], //sku名称数组
          skuCodeArr: [], //sku编码数组
        },
      })
      console.log('search', this.searchParms)
      this.productShowSku = true
    },
    productStatusSku() {
      this.productShowSku = false
    },
    // 获取访客数量
    async getVisitorNum() {
      const res = await getVisitorNum(this.deptReports)
      this.visitorNum = res.data
    },
    // // 获取推广费用
    // async getPromotionFee() {
    //   const res = await getPromotionFee(this.deptReports);
    //   this.promotionFee = res.data;
    // },
    // //  获取推广占比
    // async getPromotionActualRatio() {
    //   const res = await getPromotionActualRatio(this.deptReports);
    //   this.promotionActualRatio = res.data;
    // },
    // 销售量饼图
    async getSaleNum() {
      const res = await getSaleNum(this.deptReports)
      const option = {
        tooltip: {
          trigger: 'item',
          position: 'right',
          formatter: '{a} <br/>{b} : {c} ({d}%)',
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: ['退单金额', '订单销售额'],
        },
        series: [
          {
            type: 'pie',
            radius: '50%',
            avoidLabelOverlap: false,
            label: {
              show: true,
              position: 'outside',
              formatter: (params) => {
                if (params) {
                  return (
                    `${params.name}` +
                    `\n${params.value}` +
                    `\n${params.percent === undefined ? 0 : params.percent}%`
                  )
                }
                return ''
              },
            },
            labelLine: {
              show: true,
              length: 10,
              length2: 15,
            },
            data: [
              {
                value: res.data.orderData.orderNum,
                name: '订单销售额',
                itemStyle: { color: '#ff6600' },
              },
              {
                value: res.data.refundData.refundNum,
                name: '退单金额',
                itemStyle: { color: '#ffcc33' },
              },
            ],
          },
        ],
      }
      this.pieChartSaleNumOption = { ...option }
    },
    // 销售量折线图
    async getSaleNumLineChart() {
      const res = await getSaleNumLineChart(this.deptReports)
      console.log('getSaleNumLineChart', res)
      const memberAmountData = res.data.map((item) => item.mermbAmount)
      // 提取渲染同比环比表格数据
      // this.numYoyMom = memberAmountData;
      this.saleYoyMom = memberAmountData
      console.log('memberAmountData', memberAmountData)
      // 指定图表的配置项和数据
      let option = {
        title: {
          text: '',
          textStyle: {
            fontSize: 12,
          },
          left: '30%',
        },
        tooltip: {},
        legend: {
          orient: 'vertical',
          left: 'left',
        },
        xAxis: {
          boundaryGap: true, // 设置 boundaryGap 为 true
          axisTick: {
            alignWithLabel: true, // 设置刻度线与标签对齐
          },
          data: memberAmountData.map((item) => item.time), // 时间点集合
        },
        yAxis: {},
        grid: {
          left: '4.5%',
          right: '5%',
          top: '40%',
          bottom: '2%',
          containLabel: true,
        },
        series: [
          {
            name: '销售数量',
            type: 'line',
            data: memberAmountData.map((item) => item.orderNum),
          },
          {
            name: '退单数量',
            type: 'line',
            data: memberAmountData.map((item) => item.refundNum),
          },
        ],
      }
      // 使用刚指定的配置项和数据显示图表
      this.saleNumLineChartOption = { ...option }
    },
    // 切换图表时重新渲染图表
    changeBar() {
      console.log('changeBar', this.changeBarChart)
      if (this.changeBarChart == 1) {
        this.mounted()
      } else if (this.changeBarChart == 2) {
        this.getSaleNumLineChart()
      } else {
        this.progressBar()
      }
      this.chartKey++
    },
    // 推广费用饼图
    async getPromotion() {
      const res = await getPromotion(this.deptReports)
      console.log('res', res)
      let exampleOptions = {
        tooltip: {
          trigger: 'item',
          position: 'right',
          formatter: '{a} <br/>{b} : {c} ({d}%)',
        },
        legend: {
          orient: 'vertical',
          left: 'left',
        },
        series: [
          {
            type: 'pie',
            radius: '50%',
            center: ['50%', '50%'],
            data: [
              {
                value: res.data.cost,
                name: '推广费',
                itemStyle: { color: '#003399' },
              },
              {
                value: res.data.salesAmount,
                name: '销售额',
                itemStyle: { color: '#33cccc' },
              },
            ],
            label: {
              show: true,
              position: 'outside',
              formatter: (params) => {
                if (params) {
                  return `${params.name}` + `\n${params.value}`
                }
                return ''
              },
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          },
        ],
      }
      this.promotionFeePieChartOption = { ...exampleOptions }
    },
    // 推广费用柱状图
    async getPromotionFeeHistogram() {
      const res = await getPromotionFeeHistogram(this.deptReports)

      // this.numYoyMom = memberAmountData;
      // 指定图表的配置项和数据
      let option = {
        title: {
          text: '推广花费折线图',
          textStyle: {
            fontSize: 16,
          },
          left: '30%',
        },
        tooltip: {},
        legend: {
          orient: 'vertical',
          left: 'left',
        },
        xAxis: {
          boundaryGap: true, // 设置 boundaryGap 为 true
          axisTick: {
            alignWithLabel: true, // 设置刻度线与标签对齐
          },
          data: res.data.chartAmountVOList.map((item) =>
            getFormatDate(+item.saleTime)
          ), // 时间点集合
        },
        yAxis: {},
        grid: {
          left: '4.5%',
          right: '5%',
          bottom: '2%',
          containLabel: true,
        },
        series: [
          {
            name: '花费',
            type: 'bar',
            data: res.data.chartAmountVOList.map((item) => item.orderAmount), // 订单数集合
          },
        ],
      }
      this.promotionFeeBarChartOption = { ...option }
    },
    // // 推广费用表格
    async getPromotionFeeTable(page) {
      if (page == 1) {
        this.promotionFeeReqParams.page = 1
      }
      const reqParams = Object.assign(
        {},
        this.deptReports,
        this.promotionFeeReqParams
      )
      const res = await getPromotionFeeTable(reqParams)

      this.promotionFeeTableData = res.data.records
      this.promotionFeeTotal = res.data.total
    },

    // 获取人群分析
    async getAnalysisTypeList() {
      this.trendData = []
      if (this.linkDetail.linkId != undefined) {
        this.trendParams.linId = this.linkDetail.linkId
        const res = await getAnalysisTypeList()
        this.trendParams.analysisTypeList = res.data.map(
          (item) => item.dictType
        )
        const res1 = await getTrendList(this.trendParams)
        this.trendData = res1.data
      }
    },

    goToReport() {
      if (
        this.linkDetail.linkUuid != '' ||
        this.linkDetail.linkId != undefined
      ) {
        this.$router.push({
          path: '../../dailyManage/linkDaily',
          query: { linkId: this.linkDetail.linkUuid },
        })
      } else {
        this.$router.push({ name: 'LinkDaily' })
      }
    },
    // 跳转至
    goToOpinion() {
      if (
        this.linkDetail.linkUuid != '' ||
        this.linkDetail.linkId != undefined
      ) {
        this.$router.push({
          path: '../../dailyManage/viewDaily',
          query: { row: this.linkDetail },
        })
      } else {
        this.$router.push({ name: 'ViewDaily' })
      }
    },
    // 获取推广费用-占比数据
    async getPromotionFeeProportion() {
      const res = await getPromotionFeeProportion(this.deptReports)
      // 费用
      this.promotionFee = res.data.cost
      // 占比
      this.promotionActualRatio = res.data.promotionPercentage
    },
    // 转百分比
    toPrecentage(num) {
      if (num == 0 || num == undefined) {
        return '0'
      }
      return (num * 100).toFixed(2) + '%'
    },
  },
}
</script>
<style lang="scss" scoped>
.left_top {
  display: flex;
  justify-content: center;
  margin: 10px 0;
  .text {
    font-size: 2.5vh;
    margin-bottom: 5px;
    margin-right: 45px;
    margin-left: 45px;
    border-radius: 5px;
    width: 17vw;
    height: 12vh;
    background-color: #d6ab4d;
    color: #fff;
    font-weight: 600;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .number {
      margin-top: 5px;
    }
  }

  .text1 {
    background-color: #4d7fff;
  }
}
.head-container {
  margin-top: 20px;

  .grade-detail {
    border: 1px solid #d6d6d6;
    border-radius: 4px;
    padding: 8px 10px;
    // font-size: 14px;
    color: #595959;
    .detail-top {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
    }

    .detail-name {
      margin-right: 30px;
    }
    .name-title {
      font-weight: 600;
    }
    .suggest-content {
      margin-top: 6px;
      .suggest-grade {
        font-size: 18px;
        font-weight: bold;
      }
      .red-icon {
        color: red;
      }
    }
    .detail-picture {
      margin-right: 30px;
      display: flex;
      align-items: center;
    }
  }

  .time-class {
    margin-top: -32px;

    .time-pick {
      margin-top: -4px;

      &-class {
        width: 280px;
      }
    }
  }
}

.main-line {
  margin-top: 60px;
}
.link-sku-type {
  text-align: left;
  margin-top: 20px;
}
.right-table {
  .table-top {
    margin-top: 20px;
  }

  .table-bottom {
    margin-top: 60px;
  }

  .table-title {
    font-weight: 600;
    margin-bottom: 15px;
  }
}

.compare {
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: center;

  .text {
    flex: 1;
    font-size: 16px;
  }

  .number {
    flex: 1;
  }
}
.button-container {
  position: fixed;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  z-index: 1000;
}

.button-container .el-button {
  display: block;
  margin: 10px 0;
}
.circle-button {
  width: 60px;
  height: 60px;
  border-radius: 50%; /* 圆形按钮 */
  padding: 0; /* 取消内边距 */
  display: flex;
  justify-content: center;
  align-items: center;
}

.el-button .icon {
  font-size: 12px; /* 控制图标的大小 */
  color: white;
  text-align: center;

  line-height: 1.2; /* 控制行高，确保两行文本不会重叠 */
}
</style>
