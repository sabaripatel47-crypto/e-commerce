<template>
  <div class="app-container">
    <div class="head-contatiner">
      <el-form class="page-search" inline ref="page-filter">
        <!--时间范围 -->
        <el-form-item label="时间范围：" style="margin-right: 20px">
          <div class="time-class">
            <div class="time-radio">
              <el-radio-group v-model="reqParams.formatType" size="mini">
                <el-radio-button :label="2">按日</el-radio-button>
                <el-radio-button :label="1">按月</el-radio-button>
              </el-radio-group>
            </div>
            <div class="time-pick">
              <el-date-picker
                ref="datePick"
                v-model="timeValueArr"
                :clearable="false"
                :type="reqParams.formatType == 2 ? 'daterange' : 'monthrange'"
                :key="reqParams.formatType == 2 ? 'daterange' : 'monthrange'"
                align="right"
                unlink-panels
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="timestamp"
                style="padding-right: 20px; width: 300px"
              ></el-date-picker>
            </div>
          </div>
          <div v-for="(item, index) in updateTimeArr" style="margin-top: 5px" :key="index">
            <p class="upadte_time" style>{{ item }}</p>
          </div>
        </el-form-item>
        <!-- </el-form>

        <el-form class="page-search" inline ref="page-filter">-->
        <el-form-item label="平台名称：" style="margin-right: 20px">
          <el-select
            v-model="reqParams.platform"
            filterable
            clearable
            placeholder="请选择"
            @change="getPromotionType"
            @clear="clearShopSelect()"
            class="board-form-item-width"
            :disabled="isJump"
          >
            <el-option
              v-for="item in platformList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="推广方式：" style="margin-right: 20px">
          <el-select
            class="board-form-item-width"
            v-model="reqParams.uploadDataType"
            filterable
            clearable
            placeholder="请选择"
          >
            <el-option
              v-for="item in promotionList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="店铺名称：" style="margin-right: 20px">
          <el-select
            class="board-form-item-width"
            v-model="reqParams.storeUuid"
            filterable
            clearable
            placeholder="请选择"
            :disabled="isJump"
          >
            <el-option
              v-for="item in storeList"
              :key="item.code"
              :label="
                item.standbyKeyword + '(' + item.extendKeyword + ')' + item.name
              "
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="项目名称：" style="margin-right: 20px">
          <el-select
            class="board-form-item-width"
            v-model="reqParams.strategyUuid"
            filterable
            clearable
            placeholder="请选择"
          >
            <el-option
              v-for="item in strategyList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="赛道名称：" style="margin-right: 20px">
          <el-cascader
            class="board-form-item-width"
            :options="trackList"
            v-model="track"
            filterable
            @change="handleChange"
            placeholder="请选择赛道"
            clearable
            ref="cascaderHandle"
            :props="{
              children: 'children',
              label: 'cateName',
              value: 'uuid',
              checkStrictly: true,
            }"
          ></el-cascader>
        </el-form-item>
        <!-- <el-form-item label="产品名称：" style="margin-right: 20px">
          <el-select
            v-model="reqParams.spuUuid"
            filterable
            clearable
            placeholder="请选择"
          >
            <el-option
              v-for="item in spuList"
              :key="item.code"
              :label="item.name"
              :value="item.name"
            ></el-option>
          </el-select>
        </el-form-item>-->
        <el-form-item label="是否主打：" style="margin-right: 20px">
          <el-select
            class="board-form-item-width"
            v-model="reqParams.isMainLink"
            filterable
            clearable
            placeholder="请选择"
          >
            <el-option
              v-for="item in isMainLinkList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品等级：" style="margin-right: 20px">
          <el-select
            class="board-form-item-width"
            v-model="reqParams.linkLevel"
            filterable
            clearable
            placeholder="请选择"
          >
            <el-option
              v-for="item in levelList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品阶段：" style="margin-right: 20px">
          <el-select
            class="board-form-item-width"
            v-model="reqParams.linkTimeStatus"
            filterable
            clearable
            placeholder="请选择"
          >
            <el-option
              v-for="item in stageList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品ID：" style="margin-right: 20px">
          <el-input v-model="reqParams.linkId" clearable placeholder="请输入" :disabled="isJump"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="getData()">搜索</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="card" style="display: flex; justify-content: space-around; margin-bottom: 20px">
      <ColoredCard
        title="推广费用"
        unit="元"
        :num="String(promotionCosts.afterSaleByAmount)"
        :type="promotionCosts.increaseRate"
      ></ColoredCard>
      <ColoredCard
        title="推广占比"
        :num="
          promotionalShare.afterSaleByAmount
            ? getPercentage(promotionalShare.afterSaleByAmount)
            : 'null'
        "
        :type="promotionalShare.increaseRate"
        toolTip="推广占比=推广花费/销售额"
      ></ColoredCard>
      <ColoredCard
        title="实际推广占比"
        :num="
          actualPromotionalShare.afterSaleByAmount
            ? getPercentage(actualPromotionalShare.afterSaleByAmount)
            : 'null'
        "
        :type="actualPromotionalShare.increaseRate"
        toolTip="推广占比=推广花费/实际销售额"
      ></ColoredCard>
      <ColoredCard
        title="销售额"
        unit="元"
        :num="String(salesFigures.afterSaleByAmount)"
        :type="salesFigures.increaseRate"
        toolTip="销售额=销售的总金额，包含退款成功的金额"
      ></ColoredCard>
      <ColoredCard
        title="实际销售额"
        unit="元"
        :num="String(actualSalesFigures.afterSaleByAmount)"
        :type="actualSalesFigures.increaseRate"
        toolTip="实际销售额=销售额-退款额"
      ></ColoredCard>
      <ColoredCard
        title="销售量"
        unit="个"
        :num="String(salesVolume.afterSaleByQuantity)"
        :type="salesVolume.increaseRate"
        toolTip="销售数量= 总的售卖产品数量"
      ></ColoredCard>

      <ColoredCard
        title="订单数"
        unit="单"
        :num="String(orderNUmber.afterSaleByQuantity)"
        :type="orderNUmber.increaseRate"
        toolTip="订单量 = 销售的总订单（一单算一个数量，相同的单号算一个）"
      ></ColoredCard>
      <ColoredCard
        title="退单数"
        unit="单"
        :num="
          (cancellationNumber.afterSaleByQuantity === null
            ? '-'
            : String(cancellationNumber.afterSaleByQuantity)) +
          '|' +
          String(
            getPercentage(
              cancellationNumber.afterSaleByQuantity /
                orderNUmber.afterSaleByQuantity
            )
          )
        "
        :type="cancellationNumber.increaseRate"
        toolTip="退单量 = 退款成功的总订单（一单算一个数量，相同的单号算一个）"
      ></ColoredCard>

      <ColoredCard
        title="退货量"
        unit="个"
        :num="
          (returnQuantity.afterSaleByQuantity === null
            ? '-'
            : String(returnQuantity.afterSaleByQuantity)) +
          '|' +
          (salesVolume.afterSaleByQuantity
            ? String(
                getPercentage(
                  returnQuantity.afterSaleByQuantity /
                    salesVolume.afterSaleByQuantity
                )
              )
            : '-')
        "
        :type="returnQuantity.increaseRate"
        toolTip="退货量 = 退款成功的产品数量"
      ></ColoredCard>
    </div>

    <!-- <el-radio-group
      v-model="reqParams.sortType"
      @change="getLinkPromotionList(1)"
    >
      <el-radio-button :label="1">roi</el-radio-button>
      <el-radio-button :label="2">展现量</el-radio-button>
      <el-radio-button :label="3">花费</el-radio-button>
      <el-radio-button :label="4">点击量</el-radio-button>
      <el-radio-button :label="5">点击率</el-radio-button>
      <el-radio-button :label="6">点击转化率</el-radio-button>
      <el-radio-button :label="7">平均点击花费</el-radio-button>
      <el-radio-button :label="8">成交额</el-radio-button>
      <el-radio-button :label="9">成交笔数</el-radio-button>
    </el-radio-group>-->

    <!-- 链接表格 -->
    <el-table
      :data="tableData"
      style="width: 100%"
      v-loading="tableLoading"
      height="400"
      @row-click="getChild"
    >
      <el-table-column type="index" label="序号" width="50" align="center"></el-table-column>
      <el-table-column label="平台名称" prop="strategyName" align="center">
        <template v-slot="{ row }">
          <span>{{ row.platformName != null ? row.platformName : "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="店铺名称" prop="strategyName" align="center" min-width="100">
        <template v-slot="{ row }">
          <span>{{ row.storeName != null ? row.storeName : "-" }}</span>
          <span>({{ row.storeCode != null ? row.storeCode : "-" }})</span>
        </template>
      </el-table-column>
      <el-table-column label="店铺负责人" prop="storeManagerName" align="center" min-width="100">
        <template v-slot="{ row }">
          <span>{{ row.storeManagerName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="项目名称" prop="strategyName" align="center" min-width="100">
        <template v-slot="{ row }">
          <span>{{ row.strategyName != null ? row.strategyName : "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="赛道" prop="trackName" align="center" min-width="100">
        <template v-slot="{ row }">
          <span>{{ row.trackName != null ? row.trackName : "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="产品名称" prop="linkTitle" align="center">
        <template v-slot="{ row }">
          <span>{{ row.linkTitle != null ? row.linkTitle : "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="链接负责人" prop="linkIdManagerName" align="center" min-width="100">
        <template v-slot="{ row }">
          <span>{{ row.linkIdManagerName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="图片" prop="url" align="center">
        <template v-slot="{ row }">
          <el-image
            v-if="row.url"
            style="height: 30px; width: 30px"
            :src="row.url + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
            :preview-src-list="[row.url]"
          ></el-image>
        </template>
      </el-table-column>
      <el-table-column label="是否主打" prop="isMainLinkName" align="center">
        <template v-slot="{ row }">
          <span>{{ row.isMainLinkName != null ? row.isMainLinkName : "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品ID" prop="linkId" align="center" min-width="140">
        <template v-slot="{ row }">
          <span>{{ row.linkId != null ? row.linkId : "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="阶段" prop="linkTimeStatusName" align="center">
        <template v-slot="{ row }">
          <span>{{ row.linkTimeStatusName != null ? row.linkTimeStatusName : "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="允许ROI" prop="roi" align="center">
        <template v-slot="{ row }">
          <span>{{ row.roiName != null ? row.roiName : "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="ROI" prop="roiName" align="center">
        <template v-slot="{ row }">
          <span>{{ row.roi != null ? row.roi.toFixed(2) : "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="展现量" prop="impressions" min-width="90" align="center">
        <template #header>
          <span
            @click="changeLinkSortType(2)"
            :style="{
              color: reqParams.sortType == 2 ? '#409EFF' : '',
              fontSize: reqParams.sortType == 2 ? '17px' : '14px',
            }"
          >
            展现量
            <i class="el-icon-top"></i>
          </span>
        </template>
        <template v-slot="{ row }">
          <span>{{ row.impressions != null ? row.impressions : "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="点击量" prop="htis" min-width="90" align="center">
        <template #header>
          <span
            @click="changeLinkSortType(4)"
            :style="{
              color: reqParams.sortType == 4 ? '#409EFF' : '',
              fontSize: reqParams.sortType == 4 ? '17px' : '14px',
            }"
          >
            点击量
            <i class="el-icon-top"></i>
          </span>
        </template>
        <template v-slot="{ row }">
          <span>{{ row.htis != null ? row.htis : "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="总成交笔数" prop="totalQuantity" min-width="130" align="center">
        <template #header>
          <span
            @click="changeLinkSortType(9)"
            :style="{
              color: reqParams.sortType == 9 ? '#409EFF' : '',
              fontSize: reqParams.sortType == 9 ? '17px' : '14px',
            }"
          >
            总成交笔数
            <i class="el-icon-top"></i>
          </span>
        </template>
        <template v-slot="{ row }">
          <span>{{ row.totalQuantity != null ? row.totalQuantity : "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="推广占比" prop="promotionPercentage" align="center">
        <template v-slot="{ row }">
          <span>
            {{
            row.promotionPercentage != null
            ? getPercentage(row.promotionPercentage)
            : "-"
            }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="实际推广占比" prop="percentageActual" align="center">
        <template v-slot="{ row }">
          <span>
            {{
            row.percentageActual != null
            ? getPercentage(row.percentageActual)
            : "-"
            }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="点击率" prop="clickRate" align="center">
        <template v-slot="{ row }">
          <span>{{ row.htisRate != null ? getPercentage(row.htisRate) : "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="点击转化率" prop="clickConversionRate" align="center">
        <template v-slot="{ row }">
          <span>
            {{
            row.clickConversionRate != null
            ? getPercentage(row.clickConversionRate)
            : "-"
            }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="平均点击花费" prop="directAmount" align="center">
        <template v-slot="{ row }">
          <span>{{ row.directAmount != null ? row.directAmount : "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="花费" prop="cost" align="center">
        <template #header>
          <span
            @click="changeLinkSortType(3)"
            :style="{
              color: reqParams.sortType == 3 ? '#409EFF' : '',
              fontSize: reqParams.sortType == 3 ? '17px' : '14px',
            }"
          >
            花费
            <i class="el-icon-top"></i>
          </span>
        </template>
        <template v-slot="{ row }">
          <span>{{ row.cost != null ? row.cost : "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="总成交金额" prop="totalAmount" align="center" width="140">
        <template v-slot:header>
          <span
            @click="changeLinkSortType(8)"
            :style="{
              color: reqParams.sortType == 8 ? '#409EFF' : '',
              fontSize: reqParams.sortType == 8 ? '17px' : '14px',
            }"
          >
            总成交金额
            <i class="el-icon-top"></i>
          </span>
          <el-tooltip class="item" effect="dark" content="总成交金额：是推广促成的销售额" placement="top">
            <svg class="icon" width="13px" height="13px">
              <use xlink:href="#icon-question" />
            </svg>
          </el-tooltip>
        </template>
        <template v-slot="{ row }">
          <span>{{ row.totalAmount != null ? row.totalAmount : "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="销售额" prop="sales" align="center" min-width="90">
        <template #header>
          <span
            @click="changeLinkSortType(10)"
            :style="{
              color: reqParams.sortType == 10 ? '#409EFF' : '',
              fontSize: reqParams.sortType == 10 ? '17px' : '14px',
            }"
          >
            销售额
            <i class="el-icon-top"></i>
          </span>
        </template>
        <template v-slot="{ row }">
          <span>{{ row.sales != null ? row.sales : "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="实际销售额" prop="actualSales" min-width="170" align="center">
        <template #header>
          <span
            @click="changeLinkSortType(11)"
            :style="{
              color: reqParams.sortType == 11 ? '#409EFF' : '',
              fontSize: reqParams.sortType == 11 ? '17px' : '14px',
            }"
          >
            实际销售额
            <i class="el-icon-top"></i>
          </span>
        </template>
        <template v-slot="{ row }">
          <span>{{ row.actualSales != null ? row.actualSales : "-" }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column
        label="健康评估指数"
        prop="healthAssessmentIndex"
        align="center"
        ><template v-slot="{ row }"
          ><span>{{
            row.healthAssessmentIndex != null ? row.healthAssessmentIndex : "-"
          }}</span></template
        ></el-table-column
      >-->
      <el-table-column label="操作" align="center" min-width="120">
        <template v-slot="{ row }">
          <el-button type="text" size="small" v-if="row.flag" @click="getLinkStatistics(row)">人群分析</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      v-show="total > 0"
      :page.sync="reqParams.page"
      :limit.sync="reqParams.pageSize"
      :total="total"
      @pagination="getLinkPromotionList"
    />
    <el-table
      :data="childTableData"
      style="width: 100%; margin-top: 20px"
      v-loading="childLoading"
      height="400"
    >
      <el-table-column type="index" label="序号" width="50" align="center"></el-table-column>
      <el-table-column label="推广方式" prop="uploadDataTypeName" align="center">
        <template v-slot="{ row }">
          <span>{{ row.uploadDataTypeName != null ? row.uploadDataTypeName : "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="计划名称" prop="planName" align="center" min-width="130">
        <template v-slot="{ row }">
          <span>{{ row.planName != null ? row.planName : "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="计划ID" prop="planID" align="center" min-width="120">
        <template v-slot="{ row }">
          <span>{{ row.planID != null ? row.planID : "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="开始时间" prop="timeMarketStart" align="center" min-width="100">
        <template v-slot="{ row }">
          <span>
            {{
            row.timeMarketStart != null
            ? getFormatDate(row.timeMarketStart)
            : "-"
            }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="结束时间" prop="timeMarketEnd" align="center">
        <template v-slot="{ row }">
          <span>
            {{
            row.timeMarketEnd != null ? getFormatDate(row.timeMarketEnd) : "-"
            }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="持续时间（小时）" prop="duration" align="center">
        <template v-slot="{ row }">
          <span>{{ row.duration != null ? row.duration : "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="出价方式" prop="priceType" align="center">
        <template v-slot="{ row }">
          <span>{{ row.priceType != null ? row.priceType : "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="出价ROI" prop="priceRoi" align="center">
        <template v-slot="{ row }">
          <span>{{ row.priceRoi != null ? row.priceRoi : "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="主图" prop="image" align="center">
        <template v-slot="{ row }">
          <el-image
            v-if="row.image"
            style="height: 30px; width: 30px"
            :src="row.image + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
            :preview-src-list="[row.image]"
          ></el-image>
        </template>
      </el-table-column>
      <el-table-column label="短视频" align="center">
        <template v-slot="{ row }">
          <el-button @click="openVideo(row)" v-if="row.videoUpload" style="padding: 0">
            <img src="../../../assets/images/vedio-icon.svg" width="40" alt />
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="图文" align="center">
        <template v-slot="{ row }">
          <el-image
            v-if="row.photo"
            style="height: 30px; width: 30px"
            :src="row.photo + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
            :preview-src-list="[row.photo]"
          ></el-image>
        </template>
      </el-table-column>
      <el-table-column label="ROI" prop="roi" align="center">
        <template v-slot="{ row }">
          <span>{{ row.roi != null ? row.roi.toFixed(2) : "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="展现量" prop="impressions" align="center">
        <template v-slot="{ row }">
          <span>{{ row.impressions != null ? row.impressions : "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="点击量" prop="htis" align="center">
        <template v-slot="{ row }">
          <span>{{ row.htis != null ? row.htis : "-" }}</span>
        </template>
      </el-table-column>

      <el-table-column label="加购量" prop="totalShoppingCart" align="center">
        <template v-slot="{ row }">
          <span>{{ row.totalShoppingCart != null ? row.totalShoppingCart : "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="总成交笔数" prop="totalQuantity" align="center">
        <template v-slot="{ row }">
          <span>{{ row.totalQuantity != null ? row.totalQuantity : "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="点击率" prop="htisRate" align="center">
        <template v-slot="{ row }">
          <span>{{ row.htisRate != null ? getPercentage(row.htisRate) : "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="转化率" prop="clickConversionRate" align="center">
        <template v-slot="{ row }">
          <span>
            {{
            row.clickConversionRate != null
            ? getPercentage(row.clickConversionRate)
            : "-"
            }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="加购率" prop="purchaseRate" align="center">
        <template v-slot="{ row }">
          <span>
            {{
            row.purchaseRate != null ? getPercentage(row.purchaseRate) : "-"
            }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="收藏率" prop="collectionRate" align="center">
        <template v-slot="{ row }">
          <span>
            {{
            row.collectionRate != null
            ? getPercentage(row.collectionRate)
            : "-"
            }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="花费" prop="cost" align="center">
        <template v-slot="{ row }">
          <span>{{ row.cost != null ? row.cost : "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="平均点击花费" prop="directAmount" align="center">
        <template v-slot="{ row }">
          <span>{{ row.directAmount != null ? row.directAmount : "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="总成交金额" prop="totalAmount" align="center">
        <template v-slot="{ row }">
          <span>{{ row.totalAmount != null ? row.totalAmount : "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="总成交额" prop="totalQuantity" align="center">
        <template v-slot="{ row }">
          <span>{{ row.totalQuantity != null ? row.totalQuantity : "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="直接成交笔数" prop="directQuantity" align="center">
        <template v-slot="{ row }">
          <span>{{ row.directQuantity != null ? row.directQuantity : "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="总购物车数" prop="totalShoppingCart" align="center">
        <template v-slot="{ row }">
          <span>{{ row.totalShoppingCart != null ? row.totalShoppingCart : "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="直接购物车数" prop="directShoppingCart" align="center">
        <template v-slot="{ row }">
          <span>{{ row.directShoppingCart != null ? row.directShoppingCart : "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="加购成本" prop="additionalPurchaseCost" align="center">
        <template v-slot="{ row }">
          <span>
            {{
            row.additionalPurchaseCost != null
            ? row.additionalPurchaseCost
            : "-"
            }}
          </span>
        </template>
      </el-table-column>
      <!-- <el-table-column
        label="健康评估指数"
        prop="healthAssessmentIndex"
        align="center"
        ><template v-slot="{ row }"
          ><span>{{
            row.healthAssessmentIndex != null ? row.healthAssessmentIndex : "-"
          }}</span></template
        ></el-table-column
      >-->
    </el-table>
    <Pagination
      v-show="childTotal > 0"
      :page.sync="childReqParams.page"
      :limit.sync="childReqParams.pageSize"
      :total="childTotal"
      @pagination="getLinkPromotionChildList"
    />

    <el-dialog :visible.sync="isVideoDialogVisible" title="视频播放" width="70%" @close="closeVideo">
      <div class="video-container">
        <video controls :key="videoUrl" autoplay>
          <source :src="videoUrl" type="video/mp4" />你的浏览器不支持 HTML5 视频。
        </video>
      </div>
    </el-dialog>
    <el-dialog
      width="70%"
      :visible.sync="dialogVisible"
      append-to-body
      v-if="dialogVisible"
      @close="closeDialog"
    >
      <CrowdAnalysis :req="reqParams" :linkRow="linkRow"></CrowdAnalysis>
    </el-dialog>
  </div>
</template>

<script>
import {
  getPlatformSelect,
  listStore,
  getLinkPromotionList,
  getPromotionFee,
  getPromotionSales,
  getPromotionActualSales,
  getPromotionRatio,
  getPromotionOrder,
  getPromotionReturnOrder,
  getLinkPromotionChildList,
  listStrategy,
  getPromotionType,
  getPromotionActualRatio,
  getPromotionUpdateTime,
} from '@/api/promotionData/linkPromotion'
import {
  getStrategyGradeSelect,
  getTrackSelect,
} from '@/api/productCenter/strategyBoard'
import { listSpuName, listLinkTimeStatus } from '@/api/baseData/common'
import { addDay, getDeptTreeData, getFormatDate } from '@/utils/common'
import ColoredCard from './components/ColoredCard'
import CrowdAnalysis from './components/CrowdAnalysis'
export default {
  name: 'LinkPromotion',
  components: {
    ColoredCard,
    CrowdAnalysis,
  },
  props: {
    dateRange: {
      type: Array,
      default: () => [],
    },
    rowData: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      // 平台列表
      platformList: [],
      // 店铺列表
      storeList: [],
      // 推广方式列
      promotionList: [],
      // 项目名称列
      strategyList: [],
      // 赛道名称列
      trackList: [],
      // 产品名称列
      spuList: [],
      // 商品等级列
      levelList: [],
      // 商品阶段列
      stageList: [],
      // 商品ID列
      spuUuidList: [],
      //   是否主打
      isMainLinkList: [
        { code: 0, name: '否' },
        { code: 1, name: '是' },
      ],
      linkRow: {},
      track: [],
      // 请求参数
      reqParams: {
        endTime: '',
        formatType: 2,
        isMainLink: '',
        linkId: '',
        linkLevel: '',
        linkTimeStatus: '',
        page: 1,
        pageSize: 10,
        platform: '',
        sortType: 2,
        spuUuid: '',
        startTime: '',
        storeUuid: '',
        strategyUuid: '',
        track: '',
        uploadDataType: '',
      },
      loading: false,
      // 子表请求参数
      childReqParams: {
        endTime: '',
        formatType: 2,
        isMainLink: '',
        linkId: '',
        linkLevel: 0,
        linkTimeStatus: 0,
        page: 1,
        pageSize: 10,
        platform: '',
        sortType: '',
        spuUuid: '',
        startTime: '',
        storeUuid: '',
        strategyUuid: '',
        track: '',
        uploadDataType: '',
      },
      childLoading: false,
      // 子表数据
      childTableData: [],
      // 子表总条数
      childTotal: 0,
      tableData: [],
      tableLoading: false,
      total: 0,
      timeValueArr: [],

      // 推广费用
      promotionCosts: {},
      // 销售额
      salesFigures: {},
      // 实际销售额
      actualSalesFigures: {},
      // 推广占比
      promotionalShare: {},
      // 订单数
      orderNUmber: {},
      // 退单数
      cancellationNumber: {},
      // 销售量
      salesVolume: {},
      // 退货量
      returnQuantity: {},
      actualPromotionalShare: {},
      isVideoDialogVisible: false, // 控制视频弹窗的显示与隐藏
      videoUrl: '',
      dialogVisible: false,
      // 每个平台更新时间数组
      updateTimeArr: [],
      // 是否跳转过来的
      isJump: false,
    }
  },
  created() {
    if (this.dateRange.length > 0) {
      console.log(this.rowData)
      this.timeValueArr = this.dateRange
      this.reqParams.platform = this.rowData.platform
      if (this.rowData.linkLevel) {
        this.reqParams.linkLevel = this.rowData.linkLevel.toString()
      }
      this.reqParams.isMainLink = this.rowData.mainLink
      this.reqParams.linkTimeStatus = this.rowData.linkTimeStatus
      this.getShopSelect()
      this.reqParams.storeUuid = this.rowData.storeUuId
      this.reqParams.linkId = this.rowData.linkId
      this.isJump = true
    } else {
      this.timeValueArr = [addDay(-2), addDay(-2)]
    }
    this.getPromotionUpdateTime()
    this.getPlatformSelect()
    this.getStrategyGradeSelect()
    this.getTrackSelect()
    this.getSpuList()
    this.getLinkTimeStatus()
    this.getData()
    this.getStrategyList()
  },
  methods: {
    // 获取最新更新时间
    async getPromotionUpdateTime() {
      const data = await getPromotionUpdateTime()
      this.updateTimeArr = data.data
    },
    // 获取平台下拉
    async getPlatformSelect() {
      const data = await getPlatformSelect()
      this.platformList = data.data
    },
    // 获取店铺下拉
    async getShopSelect() {
      this.storeList = []
      this.reqParams.storeUuid = ''
      if (this.reqParams.platform == '') {
        return
      }
      const data = await listStore(this.reqParams.platform)
      this.storeList = data.data
    },
    clearShopSelect() {
      this.promotionList = []
      this.reqParams.uploadDataType = ''
      this.reqParams.storeUuid = ''
      this.storeList = []
    },
    // 获取项目等级下拉
    async getStrategyGradeSelect() {
      const data = await getStrategyGradeSelect()
      this.levelList = data.data
    },
    // 获取赛道下拉
    async getTrackSelect() {
      const data = await getTrackSelect()
      this.trackList = data.data
    },
    // 获取名称下拉
    async getSpuList() {
      const data = await listSpuName()
      this.spuList = data.data
    },
    // 商品阶段下拉
    async getLinkTimeStatus() {
      const data = await listLinkTimeStatus()
      this.stageList = data.data
    },
    // 项目下拉
    async getStrategyList() {
      const data = await listStrategy()
      this.strategyList = data.data
    },
    // 获取推广方式和店铺
    async getPromotionType(platform) {
      this.promotionList = []
      this.reqParams.uploadDataType = ''
      if (platform == '') {
        return
      }
      const data = await getPromotionType(platform)
      this.promotionList = data.data
      this.getShopSelect()
    },
    // 获取数据
    getData() {
      const len = this.track.length
      this.reqParams.track = this.track[len - 1]
      this.getLinkPromotionList(1)
      this.getPromotionFee()
      this.getPromotionSales()
      this.getPromotionActualSales()
      this.getPromotionRatio()
      this.getPromotionOrder()
      this.getPromotionReturnOrder()
      this.getPromotionActualRatio()
    },
    // 获取链接表格
    async getLinkPromotionList(page) {
      if (page == 1) {
        this.reqParams.page = 1
      }
      this.tableLoading = true
      this.reqParams.startTime = this.timeValueArr[0]
      this.reqParams.endTime = this.timeValueArr[1]
      const data = await getLinkPromotionList(this.reqParams)
      this.tableData = data.data.records
      this.total = data.data.total
      this.tableLoading = false
      this.childTableData = []
      this.childTotal = 0
    },
    // 切换排序方式
    changeLinkSortType(val) {
      this.reqParams.sortType = val
      this.getLinkPromotionList(1)
    },
    // 获取链接子表
    async getLinkPromotionChildList(page) {
      this.childLoading = true
      if (page == 1) {
        this.childReqParams.page = 1
      }
      this.childReqParams.startTime = this.timeValueArr[0]
      this.childReqParams.endTime = this.timeValueArr[1]
      this.childReqParams.linkLevel = this.reqParams.linkLevel
      this.childReqParams.linkTimeStatus = this.reqParams.linkTimeStatus
      this.childReqParams.platform = this.reqParams.platform
      this.childReqParams.storeUuid = this.reqParams.storeUuid
      this.childReqParams.strategyUuid = this.reqParams.strategyUuid
      this.childReqParams.track = this.reqParams.track
      this.childReqParams.spuUuid = this.reqParams.spuUuid
      this.childReqParams.isMainLink = this.reqParams.isMainLink
      this.childReqParams.sortType = this.reqParams.sortType
      this.childReqParams.formatType = this.reqParams.formatType
      this.childReqParams.uploadDataType = this.reqParams.uploadDataType
      const data = await getLinkPromotionChildList(this.childReqParams)
      this.childTableData = data.data.records
      this.childTotal = data.data.total
      this.childLoading = false
    },
    // 链接字表
    getChild(row) {
      this.childReqParams.linkId = row.linkId
      this.getLinkPromotionChildList(1)
    },
    // 卡片部分数据
    // 获取推广费用
    async getPromotionFee() {
      this.reqParams.startTime = this.timeValueArr[0]
      this.reqParams.endTime = this.timeValueArr[1]
      const data = await getPromotionFee(this.reqParams)
      this.promotionCosts = data.data
    },
    // 获取实际推广占比
    async getPromotionActualRatio() {
      const data = await getPromotionActualRatio(this.reqParams)
      this.actualPromotionalShare = data.data
    },
    // 获取销售额、销售数量
    async getPromotionSales() {
      const data = await getPromotionSales(this.reqParams)
      this.salesFigures = data.data.deliveryCenterAllAmountVO
      this.salesVolume = data.data.deliveryCenterAllQuantityVO
    },
    // 获取实际销售金额、退货量
    async getPromotionActualSales() {
      const data = await getPromotionActualSales(this.reqParams)
      this.actualSalesFigures = data.data.deliveryCenterAllAmountVO
      this.returnQuantity = data.data.deliveryCenterAllQuantityVO
    },
    //   推广占比
    async getPromotionRatio() {
      const data = await getPromotionRatio(this.reqParams)
      this.promotionalShare = data.data
    },
    // 订单数
    async getPromotionOrder() {
      const data = await getPromotionOrder(this.reqParams)
      this.orderNUmber = data.data
    },
    // 退单数
    async getPromotionReturnOrder() {
      const data = await getPromotionReturnOrder(this.reqParams)
      this.cancellationNumber = data.data
    },
    // 保留两位小数并转成百分比
    getPercentage(num) {
      if (num == 0) {
        return '0%'
      }
      if (!num) {
        return '-'
      }
      let numBer = Math.floor((num * 10000).toFixed(1)) / 100
      numBer = numBer + '%'
      return numBer
    },
    // 打开视频弹窗
    openVideo(row) {
      this.videoUrl = row.videoUpload
      // console.log(this.videoUrl);
      this.isVideoDialogVisible = true
    },
    // 关闭视频弹窗
    closeVideo() {
      this.videoUrl = ''
      this.isVideoDialogVisible = false
    },
    getLinkStatistics(row) {
      this.linkRow = row
      this.dialogVisible = true
    },
    closeDialog() {
      this.linkRow = {}
      this.dialogVisible = false
    },
    getFormatDate(date) {
      return getFormatDate(date)
    },
    handleClear() {
      this.track = []
      // 确保焦点移除
    },
    handleChange() {
      this.$nextTick(() => {
        this.$refs.cascaderHandle.dropDownVisible = false
      })
    },
  },
}
</script>

<style lang='scss' scoped>
.time-class {
  margin-top: -32px;

  .time-pick {
    margin-top: -4px;
  }
}

.head-contatiner {
  margin-top: 20px;
}

.upadte_time {
  font-size: 12px;
  line-height: 13px;
  color: gray;
  margin: 0;
}
</style>
