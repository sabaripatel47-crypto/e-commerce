<template>
  <div class="statistics">
    <div class="statistics-container">
      <!-- 项目搜索 -->
      <div class="spu-container">
        <el-form class="page-search" inline ref="page-filter" style="margin-top: 30px">
          <!--时间范围 -->
          <el-form-item label="时间范围" style="margin-right: 20px">
            <div class="time-class">
              <div class="time-radio">
                <el-radio-group v-model="searchParams.formatType" size="mini">
                  <el-radio-button :label="2">按日</el-radio-button>
                  <el-radio-button :label="1">按月</el-radio-button>
                </el-radio-group>
              </div>
              <div class="time-pick">
                <el-date-picker
                  v-model="spuTimeScope"
                  :clearable="false"
                  :type="
                    searchParams.formatType == 2 ? 'daterange' : 'monthrange'
                  "
                  :key="
                    searchParams.formatType == 2 ? 'daterange' : 'monthrange'
                  "
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  align="right"
                  unlink-panels
                  value-format="timestamp"
                  :picker-options="
                    searchParams.formatType == 2 ? pickerOptions : ''
                  "
                  class="time-pick-class"
                  @blur="blurTime"
                ></el-date-picker>
              </div>
            </div>
          </el-form-item>
          <el-form-item label="项目标题" style="margin-right: 20px">
            <el-input placeholder="请输入" v-model="strategyTitle" clearable class="handle-input"></el-input>
          </el-form-item>
          <!-- 下拉选择赛道 -->
          <el-form-item label="赛道" style="margin-right: 20px">
            <el-cascader
              filterable
              v-model="track"
              :options="Trdepartments"
              :show-all-levels="false"
              :props="{
                children: 'children',
                label: 'cateName',
                value: 'uuid',
                checkStrictly: false,
              }"
              clearable
            ></el-cascader>
          </el-form-item>
          <!-- 下拉选择品类 -->
          <el-form-item label="品类" style="margin-right: 20px">
            <el-cascader
              filterable
              v-model="categoryList"
              :options="Cadepartments"
              :show-all-levels="false"
              :props="{
                children: 'children',
                label: 'cateName',
                value: 'uuid',
                checkStrictly: false,
                multiple: true,
              }"
              clearable
            ></el-cascader>
          </el-form-item>
          <!-- 下拉选择名字 -->
          <el-form-item label="产品名称" style="margin-right: 20px">
            <el-select
              v-model="searchParams.spuUuid"
              clearable
              filterable
              :filter-method="filterMethod"
              v-el-select-loadmore="loadMore(rangeNumber)"
              @visible-change="visibleChange"
            >
              <el-option
                v-for="(item, index) in spuNameArrCurrent.slice(0, rangeNumber)"
                :key="item.code"
                :label="item.name"
                :value="item.code"
              ></el-option>
            </el-select>
          </el-form-item>
          <!-- 器型 -->
          <el-form-item label="器型" style="margin-right: 20px">
            <el-cascader
              filterable
              v-model="shape"
              :options="shapeList"
              :show-all-levels="false"
              :props="{
                children: 'children',
                label: 'cateName',
                value: 'uuid',
                checkStrictly: false,
              }"
              clearable
            ></el-cascader>
          </el-form-item>
          <!-- 价格带 -->
          <el-form-item label="价格带" style="margin-right: 20px">
            <el-cascader
              filterable
              v-model="priceZone"
              :options="priceList"
              :show-all-levels="false"
              :props="{
                children: 'children',
                label: 'cateName',
                value: 'uuid',
                checkStrictly: false,
              }"
              clearable
            ></el-cascader>
          </el-form-item>
          <!-- 人群 -->
          <el-form-item label="人群" style="margin-right: 20px">
            <el-cascader
              filterable
              v-model="crowd"
              :options="crowdList"
              :show-all-levels="false"
              :props="{
                children: 'children',
                label: 'cateName',
                value: 'uuid',
                checkStrictly: false,
              }"
              clearable
            ></el-cascader>
          </el-form-item>
          <el-form-item label="项目品牌" style="margin-right: 20px">
            <el-select v-model="searchParams.brandUuid" clearable filterable placeholder="请选择项目品牌">
              <el-option
                v-for="item in brandList"
                :label="item.name"
                :value="item.code"
                :key="item.name"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="项目等级" style="margin-right: 20px">
            <el-select class="grade-min-width" v-model="strategyGrade" clearable placeholder="请选择">
              <el-option
                v-for="item in strategyLinkLevels"
                :key="item.code"
                :label="item.name"
                :value="item.code"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="strategySearch">搜索</el-button>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              icon="el-icon-download"
              v-hasPermi="['productCenter/strategyStatistics:export']"
              @click="exportStrategyStatistics()"
            >导出</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table
        v-loading="spuLoading"
        class="outHeight"
        :max-height="tabHeight"
        :data="strategyDataList"
        border
        style="width: 100%"
        @row-click="clickStrategyTabRow"
        :row-style="rowStyle"
      >
        <el-table-column type="index" label="序号" width="50" align="center" fixed="left"></el-table-column>
        <el-table-column
          prop="strategyTitle"
          label="项目标题"
          align="center"
          show-overflow-tooltip
          width="130"
          fixed="left"
        ></el-table-column>
        <el-table-column
          prop="strategyNumber"
          label="项目编号"
          show-overflow-tooltip
          align="center"
          width="130"
          fixed="left"
        ></el-table-column>
        <!-- 基础信息类 -->
        <el-table-column label="基础信息" align="center">
          <el-table-column prop="brandName" label="项目品牌" align="center" width="120"></el-table-column>
          <el-table-column prop="strategyGradeName" label="项目等级" align="center" width="80"></el-table-column>
          <el-table-column prop="seasonLevelName" label="季节性等级" align="center" width="90"></el-table-column>
          <el-table-column prop="projectTypeName" label="项目类型" align="center" width="80"></el-table-column>
          <el-table-column prop="customerTypeName" label="项目导向" align="center" width="80"></el-table-column>
          <el-table-column prop="strategyTimeStatusName" label="项目阶段" align="center" width="80"></el-table-column>
          <el-table-column prop="statusName" label="项目状态" align="center" width="80"></el-table-column>
          <el-table-column prop="marketTypeName" label="项目营销" align="center" width="80"></el-table-column>
        </el-table-column>

        <!-- 部门负责人类 -->
        <el-table-column label="部门负责人" align="center">
          <el-table-column
            prop="helpSupportName"
            label="帮扶部"
            show-overflow-tooltip
            align="center"
            width="100"
          ></el-table-column>
          <el-table-column prop="planningName" label="项目企划" align="center" width="100"></el-table-column>
          <el-table-column prop="designerName" label="设计师" align="center" width="100"></el-table-column>
          <el-table-column prop="managerName" label="项目实施" align="center" width="100"></el-table-column>
          <el-table-column prop="shapeDeptName" label="塑造部" align="center" width="100"></el-table-column>
        </el-table-column>

        <el-table-column label align="center">
          <el-table-column prop="uuid" label="产品图片" align="center" width="130">
            <template v-slot="{ row, $index }">
              <el-image
                v-for="(item, index) in row.imageUrls"
                :key="index"
                style="height: 30px; width: 30px"
                :src="item.url + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
                :initial-index="0"
                :preview-src-list="[item.url]"
              ></el-image>
            </template>
          </el-table-column>
          <el-table-column
            prop="spuName"
            label="链接主打产品"
            align="center"
            show-overflow-tooltip
            width="130"
          ></el-table-column>
          <el-table-column label="链接数量" align="center" width="80">
            <template v-slot="{ row }">
              <div
                v-for="(item, index) in row.linkCountList"
              >{{ item.mainLinkName + ":" + item.count }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="track" label="赛道" align="center" width="160"></el-table-column>
          <el-table-column label="品类" align="center" width="130">
            <template v-slot="{ row, $index }">
              <span v-for="item in row.categoryValue">{{ item }},</span>
            </template>
          </el-table-column>
          <el-table-column prop="shape" label="器型" align="center" width="160"></el-table-column>
          <el-table-column prop="priceZone" label="价格带" align="center" width="120"></el-table-column>
          <el-table-column prop="crowd" label="人群" align="center" width="160"></el-table-column>
          <el-table-column
            prop="groundingTime"
            label="上架时间"
            align="center"
            show-overflow-tooltip
            width="150"
          >
            <template slot-scope="scope">
              <div>
                {{
                scope.row.groundingTimeDate
                ? getFormatDate(scope.row.groundingTimeDate)
                : "-"
                }}
              </div>
            </template>
          </el-table-column>
        </el-table-column>

        <el-table-column label align="center">
          <el-table-column label="销售额(销售占比)" align="center" show-overflow-tooltip min-width="130">
            <template slot-scope="scope">
              <div v-if="scope.row.orderAmount || scope.row.orderAmount === 0">
                <span>{{ scope.row.orderAmount.toFixed(2) }}</span>
                (
                <span>
                  {{
                  scope.row.orderAmountRate !== null
                  ? (scope.row.orderAmountRate * 100).toFixed(2) + "%"
                  : "-"
                  }}
                </span>)
              </div>
              <div v-else>-</div>
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            prop="erpQuantity"
            label="订单数"
            width="70"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <div>{{ scope.row.erpQuantity ? scope.row.erpQuantity : "-" }}</div>
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            prop="customerPrice"
            label="客单价"
            width="100"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <div v-if="scope.row.customerPrice || scope.row.customerPrice === 0">
                <span>{{ scope.row.customerPrice.toFixed(2) }}</span>
              </div>
              <div v-else>-</div>
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            prop="quantityPerNum"
            label="件单量"
            width="60"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <div v-if="scope.row.quantityPerNum || scope.row.quantityPerNum === 0">
                <span>{{ scope.row.quantityPerNum.toFixed(2) }}</span>
              </div>
              <div v-else>-</div>
            </template>
          </el-table-column>
          <el-table-column align="center" label="退款额(退款占比)" show-overflow-tooltip min-width="130">
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
                  }}
                </span>)
              </div>
              <div v-else>-</div>
            </template>
          </el-table-column>
          <el-table-column align="center" label="退单数(退单占比)" show-overflow-tooltip min-width="130">
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
                  }}
                </span>)
              </div>
              <div v-else>-</div>
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            prop="simpleRefundAmountRate"
            label="退款率"
            width="70"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <div>{{( scope.row.simpleRefundAmountRate == null || scope.row.simpleRefundAmountRate === '' )? "-" : (scope.row.simpleRefundAmountRate * 100).toFixed(2) + "%" }}</div>
            </template>
          </el-table-column>
          <el-table-column align="center" label="真实销售额(销售占比)" show-overflow-tooltip min-width="150">
            <template slot-scope="scope">
              <div v-if="scope.row.actualOrderAmount || scope.row.actualOrderAmount === 0">
                <span>{{ scope.row.actualOrderAmount.toFixed(2) }}</span>
                (
                <span>
                  {{
                  scope.row.actualOrderAmountRate !== null
                  ? (scope.row.actualOrderAmountRate * 100).toFixed(2) + "%"
                  : "-"
                  }}
                </span>)
              </div>
              <div v-else>-</div>
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            label="推广费"
            show-overflow-tooltip
            min-width="100"
            prop="cost"
          >
            <template v-slot="{row}">
              <div>{{ row.cost ? row.cost : "-" }}</div>
            </template>
          </el-table-column>
          <el-table-column align="center" label="推广占比" show-overflow-tooltip min-width="100">
            <template v-slot="{row}">
              <div>
                {{
                row.promotionPercentage
                ? getPercent(row.promotionPercentage)
                : "-"
                }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="rankCount" label="榜单个数" align="center" width="75">
            <template v-slot="{row}">
              <el-button
                v-if="row.rankCount"
                type="text"
              >{{ row.rankCount }}</el-button>
              <span v-else>-</span>
            </template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="操作" align="center" width="150">
          <template v-slot="{row}">
            <el-button type="text" size="small" @click="lookBoardStrategy(row)">看板</el-button>
            <el-button type="text" size="small" @click="itemDetailStrategy(row)">明细</el-button>
            <el-button type="text" size="small" @click="goSkuInventory(row)">库存</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <pagination
          v-show="strategyTotal > 0"
          :total="strategyTotal"
          :page.sync="searchParams.page"
          :limit.sync="searchParams.pageSize"
          @pagination="getStrategyDataList()"
        />
      </div>

      <!-- 店铺 列表 -->
      <div class="sku-container">
        <el-form class="page-search" inline ref="page-filter">
          <el-form-item label="平台" style="margin-right: 20px">
            <el-select v-model="platform" filterable clearable placeholder="请选择平台">
              <el-option
                v-for="(item, index) in platformList"
                :key="index"
                :label="item.name"
                :value="item.code"
              ></el-option>
            </el-select>
          </el-form-item>
          <!-- 下拉选择店铺名称 -->
          <el-form-item label="店铺" prop="storeUuid" style="margin-right: 20px">
            <el-select filterable v-model="storeUuid" placeholder="请选择店铺" clearable>
              <el-option
                v-for="item in stores"
                :label="item.name"
                :value="item.code"
                :key="item.code"
              ></el-option>
            </el-select>
          </el-form-item>
          <!-- <el-form-item label="SKU编码：" style="margin-right: 20px">
            <el-input v-model="searchSkuParams.skuCode" size="small" placeholder="请输入SKU编码"></el-input>
          </el-form-item>-->
          <el-form-item label="商品等级" style="margin-right: 20px">
            <el-select v-model="linkLevel" clearable placeholder="请选择">
              <el-option
                v-for="item in linkLevels"
                :key="item.code"
                :label="item.name"
                :value="item.code"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="链接阶段" style="margin-right: 20px">
            <el-select clearable v-model="linkTimeStatus" placeholder="请选择">
              <el-option
                v-for="item in linkTimeStatusList"
                :label="item.name"
                :value="item.code"
                :key="item.code"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="是否主打" style="margin-right: 20px">
            <el-select class="grade-min-width" clearable v-model="mainLink" placeholder="请选择">
              <el-option label="是" value="1"></el-option>
              <el-option label="否" value="0"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="负责人：" style="margin-right: 20px">
            <el-cascader
              filterable
              v-model="manager"
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
          <el-form-item v-if="currentSpu">
            <el-button type="primary" icon="el-icon-search" @click="searchSpu(1)">搜索</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table
        v-loading="skuLoading"
        :data="shopDataList"
        border
        style="width: 100%"
        class="outHeight"
        :max-height="tabHeight"
      >
        <el-table-column prop="date" label="序号" min-width="30" type="index" align="center"></el-table-column>
        <el-table-column
          prop="platformName"
          label="平台"
          min-width="80"
          align="center"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <div>{{ scope.row.platformName ? scope.row.platformName : "-" }}</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="storeName"
          label="店铺名称"
          width="310"
          align="center"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <div>{{ scope.row.storeName ? scope.row.storeName : "-" }}</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="goodsName"
          label="商品名称"
          min-width="130"
          align="center"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <div>{{ scope.row.goodsName ? scope.row.goodsName : "-" }}</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="linkId"
          label="商品链接编码"
          show-overflow-tooltip
          align="center"
          min-width="120"
        >
          <template slot-scope="scope">
            <div>{{ scope.row.linkId ? scope.row.linkId : "-" }}</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="linkLevel"
          label="商品等级"
          min-width="80"
          align="center"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <div>{{ scope.row.linkLevelName ? scope.row.linkLevelName : "-" }}</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="linkTimeStatusName"
          label="商品阶段"
          min-width="80"
          align="center"
          show-overflow-tooltip
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
          prop="mainLinkName"
          label="是否主打"
          min-width="80"
          align="center"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <div>{{ scope.row.mainLinkName ? scope.row.mainLinkName : "-" }}</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="managerName"
          label="负责人"
          min-width="70"
          align="center"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <div>{{ scope.row.managerName ? scope.row.managerName : "-" }}</div>
          </template>
        </el-table-column>
        <el-table-column label="销售额(销售占比)" show-overflow-tooltip align="center" width="180">
          <template #header>
            <span
              @click="changeSortType(1)"
              :style="{
                color: linkSortType == 1 ? '#409EFF' : '',
                fontSize: linkSortType == 1 ? '17px' : '14px',
              }"
            >
              销售额(销售占比)
              <i class="el-icon-top"></i>
            </span>
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
                }}
              </span>)
            </div>
            <div v-else>-</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="erpQuantity"
          label="订单数"
          show-overflow-tooltip
          align="center"
          width="70"
        >
          <template slot-scope="scope">
            <div>{{ scope.row.erpQuantity ? scope.row.erpQuantity : "-" }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="customerPrice" label="客单价" align="center" show-overflow-tooltip>
          <template slot-scope="scope">
            <div v-if="scope.row.customerPrice || scope.row.customerPrice === 0">
              <span>{{ scope.row.customerPrice.toFixed(2) }}</span>
            </div>
            <div v-else>-</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="quantityPerNum"
          label="件单量"
          align="center"
          show-overflow-tooltip
          width="70"
        >
          <template slot-scope="scope">
            <div v-if="scope.row.quantityPerNum || scope.row.quantityPerNum === 0">
              <span>{{ scope.row.quantityPerNum.toFixed(2) }}</span>
            </div>
            <div v-else>-</div>
          </template>
        </el-table-column>
        <el-table-column label="退款额(退款占比)" align="center" min-width="180" show-overflow-tooltip>
          <template #header>
            <span
              @click="changeSortType(2)"
              :style="{
                color: linkSortType == 2 ? '#409EFF' : '',
                fontSize: linkSortType == 2 ? '17px' : '14px',
              }"
            >
              退款额(退款占比)
              <i class="el-icon-top"></i>
            </span>
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
                }}
              </span>)
            </div>
            <div v-else>-</div>
          </template>
        </el-table-column>
        <el-table-column label="退单数(退单占比)" align="center" min-width="140" show-overflow-tooltip>
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
                }}
              </span>)
            </div>
            <div v-else>-</div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="真实销售额(销售占比)" show-overflow-tooltip min-width="150">
          <template slot-scope="scope">
            <div v-if="scope.row.actualOrderAmount || scope.row.actualOrderAmount === 0">
              <span>{{ scope.row.actualOrderAmount.toFixed(2) }}</span>
              (
              <span>
                {{
                scope.row.actualOrderAmountRate !== null
                ? (scope.row.actualOrderAmountRate * 100).toFixed(2) + "%"
                : "-"
                }}
              </span>)
            </div>
            <div v-else>-</div>
          </template>
        </el-table-column>
        <el-table-column prop="orderDayAvg" label="日均销售订单" align="center" width="110">
          <template slot-scope="scope">
            <div>{{ scope.row.orderDayAvg ? scope.row.orderDayAvg : "-" }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="simpleRefundAmountRate" label="退款率" align="center" width="110">
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
                color: linkSortType == 7 ? '#409EFF' : '',
                fontSize: linkSortType == 7 ? '17px' : '14px',
              }"
            >
              推广费
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template slot-scope="scope">
            <div>{{ scope.row.cost ? scope.row.cost : "-" }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="promotionPercentage" label="推广占比" align="center" width="75">
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
        <el-table-column prop="rankCount" label="榜单个数" align="center" width="75">
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.rankCount"
              type="text"
              @click="getRankDetail(scope.row)"
            >{{ scope.row.rankCount }}</el-button>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="180">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="lookBoardStrategyLink(scope.row)">看板</el-button>
            <el-button
              type="text"
              :disabled="scope.row.linkId === '无链接'"
              size="small"
              @click="itemDetailGoods(scope.row)"
            >明细</el-button>
            <el-button type="text" size="small" @click="linkBoardGoods(scope.row)">推广</el-button>
            <el-button type="text" size="small" @click="showDailyDetail(scope.row)">日报</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <pagination
          v-show="skuTotal > 0"
          :total="skuTotal"
          :page.sync="searchSkuParams.page"
          :limit.sync="searchSkuParams.pageSize"
          @pagination="getshopDataList()"
        />
      </div>
    </div>

    <StrategyStatistics
      v-if="strategyDetailStatus"
      @closeDialog="detailStatus"
      :show="strategyDetailStatus"
      :view="spuOrsku"
      :row="rowData"
    ></StrategyStatistics>

    <LinkStatistic
      v-if="linkDetailStatus"
      @closeDialog="detailStatus"
      :show="linkDetailStatus"
      :view="storeOr"
      :row="rowData"
    ></LinkStatistic>

    <el-dialog
      :title="rowParams.strategyTitle + '看板'"
      @close="closeStrategyBoardDialog"
      :visible.sync="showStrategyBoardDialog"
      show-close
      append-to-body
      fullscreen
    >
      <StrategyBoard v-if="showStrategyBoardDialog" :rowParams="rowParams"></StrategyBoard>
    </el-dialog>

    <el-dialog
      :title="rowParams.linkTitle + '看板'"
      @close="closeLinkBoardDialog"
      :visible.sync="showLinkBoardDialog"
      show-close
      append-to-body
      fullscreen
    >
      <StrategyLink v-if="showLinkBoardDialog" :rowParams="rowParams" :strategyDisabled="true"></StrategyLink>
    </el-dialog>
    <el-dialog
      v-if="inkPromotionStatus"
      fullscreen
      :visible.sync="inkPromotionStatus"
      append-to-body
    >
      <LinkPromotion :dateRange="spuTimeScope" :rowData="promotionParams"></LinkPromotion>
    </el-dialog>

    <ViewDailyDialog
      :row.sync="currentRow"
      :showDialog.sync="showViewDailyDialog"
      :parentReqParams.sync="searchSkuParams"
      :readOnly="false"
    ></ViewDailyDialog>

    <!-- 榜单详情弹窗 -->
    <RankDetails :visible.sync="rankDetailsVisible" :linkId="rankDetailsLinkId"></RankDetails>
  </div>
</template>

<script>
import {
  listPush,
  link_list,
  home_list,
  linkPush,
  strategy_status,
  category,
  track,
  detailStrategy,
  shape,
  price,
  crowd,
  exportStrategyStatistics,
} from '@/api/productCenter/strategyStatistics.js'
import { spuPush } from '@/api/bulletinboard/statistics.js'
import { getFormatDate } from '@/utils/common'
import { debounce } from 'lodash'

import {
  listPlatform,
  listLinkTimeStatus,
  brandPush,
} from '@/api/baseData/common.js'
import LinkPromotion from '@/views/promotionData/linkPromotion/index.vue'
import LinkStatistic from '@/views/bulletinboard/storestatistics/components/LinkStatistic.vue'
import StrategyStatistics from '@/views/productCenter/statistics/components/StrategyStatistics.vue'
import StrategyBoard from '@/views/productCenter/strategyBoard'
import StrategyLink from '@/views/productCenter/strategyLink'
import { categoryList } from '@/api/purchasingManagement/common'
import { department } from '@/api/information/department'
import { getDeptTreeData } from '@/utils/common.js'
import { addDay, addDayEnd } from '@/utils/common.js'
import ViewDailyDialog from '@/views/dailyManage/viewDaily/viewDailyDialog'
import { tansParams, blobValidate } from '@/utils/ruoyi'
import RankDetails from '@/views/bulletinboard/linkStatistics/components/RankDetails.vue'

export default {
  name: 'Statistics',
  components: {
    StrategyStatistics,
    LinkStatistic,
    StrategyBoard,
    StrategyLink,
    LinkPromotion,
    ViewDailyDialog,
    RankDetails,
  },
  data() {
    return {
      // 显示日报弹层
      showViewDailyDialog: false,
      // 传给日报的详情信息
      currentRow: {},
      // 默认时间
      INIT_TIME_START: null,
      INIT_TIME_END: null,
      // 表格高度
      tabHeight: 600,
      // 屏幕宽度
      screenWidth: window.innerWidth,
      // 屏幕高度
      screenHeight: window.innerHeightMyAgeFrom,

      // false 为不可更改
      // sku下拉框是否可以更改
      selectSkuChange: false,
      // spu下拉框是否可以更改
      selectSpuChange: false,
      // 显示项目看板
      showStrategyBoardDialog: false,

      // 显示链接看板
      showLinkBoardDialog: false,

      // 看板弹层入参
      rowParams: {},

      // 看板是否显示
      productShowSku: false,
      // ============================
      // sku筛选条件
      selectSku: '',
      // 项目等级
      strategyGrade: '',
      // 商品等级
      linkLevel: '',

      // sku加载状态
      skuLoading: false,
      // spu加载状态
      spuLoading: true,
      // spu时间范围
      spuTimeScope: [],
      // 项目标题
      strategyTitle: '',
      // spu搜索条件
      searchParams: {
        startTime: null,
        endTime: null,
        spuUuid: '', //	Spu
        formatType: 2, //1----年月，2------年月日
        productName: [], //	产品名称
        brandUuid: '', // 品牌uuid
        page: 1,
        pageSize: 10,
      },
      // 店铺列表
      strategyDataList: [],
      //链接阶段的下拉框的数据源
      linkTimeStatusList: [],
      // spu列表总数
      strategyTotal: 0,
      // 商品项目名字下拉框默认加载数量
      rangeNumber: 10,
      // spu名字搜索框
      spuSearch: '',
      // 当前选择的spu
      currentSpu: null,
      // 平台下拉框数据
      platformList: [],
      // 店铺列表
      shopDataList: [],
      // sku列表总数
      skuTotal: 0,
      skuCodeArr: [],
      // sku筛选后的列表
      skuNameArrCurrent: [],
      // sku名称搜索框
      skuSearch: '',
      // sku编码搜索框
      skuSearchCode: '',
      // sku搜索条件
      searchSkuParams: {
        startTime: null,
        endTime: null,
        formatType: 2, //1----年月，2------年月日
        skuUuid: '', //	Sku
        // skuCode: '',//	sku编码
        uuid: '',
        page: 1,
        pageSize: 10,
      },
      // sku名字下拉框默认加载数量
      rangeNumberSku: 10,
      // 店铺明细状态
      storeDetailStatus: false,

      //商品链接状态
      linkDetailStatus: false,
      // spu明细状态
      strategyDetailStatus: false,
      // 是spu明细还是sku明细
      spuOrsku: 'spu',
      // 当前选择的dialog数据
      rowData: null,
      // 看板参数
      searchParms: {
        from: null, //入口来源
        timeScopeArr: [], //时间范围数组
        timeScopeType: 2, //时间范围类型
        spu: {
          uuid: [], //spu uuid
          spuNameArr: [], //spu名称数组
        },
        sku: {
          skuUuid: [], //sku uuid
          skuCode: [], //sku编码
          skuNameArr: [], //sku名称数组
          skuCodeArr: [], //sku编码数组
        },
      },
      //赛道下拉框
      Trdepartments: [],
      //赛道选择
      track: '',
      shape: '',
      crowd: '',
      priceZone: '',
      // 品牌下拉框
      brandList: [],
      //品类下拉框
      Cadepartments: [],
      //品类选择
      category: [],
      // 品类暂存
      categoryList: [],
      // 器型下拉框
      shapeList: [],
      // 价格带下拉框
      priceList: [],
      // 人群下拉框
      crowdList: [],
      departments: [],
      //店铺下拉框
      stores: [],
      //店铺名称选择
      storeUuid: '',
      //平台名称选择
      platform: '',
      //链接阶段选择的数据
      linkTimeStatus: '',
      //是否主打
      mainLink: '',
      //负责人
      manager: [],
      //当前选中的商品店铺名称uid
      currentStoreUuid: '',
      // 商品等级下拉框
      linkLevels: [],
      //项目等级下拉框
      strategyLinkLevels: [],
      // 选中的开始时间
      startPickerTime: '',
      // spu筛选后的列表
      spuNameArrCurrent: [],
      linkSortType: 1,
      // 推广看板传递参数
      promotionParams: {},
      // 推广看板是否显示
      inkPromotionStatus: false,
      // 榜单详情弹窗
      rankDetailsVisible: false,
      // 榜单详情linkId
      rankDetailsLinkId: '',
      // 时间范围快捷选择
      pickerOptions: {
        shortcuts: [
          {
            text: '最近7天',
            onClick(picker) {
              const end = addDay(-1)
              const start = addDayEnd(-7)
              // start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: '最近14天',
            onClick(picker) {
              const end = addDay(-1)
              const start = addDayEnd(-14)
              // start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: '最近1个月',
            onClick(picker) {
              const end = addDay(-1)
              const start = addDayEnd(-30)
              // start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
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
    }
  },
  async created() {
    this.INIT_TIME_START = addDay(-7)
    // console.log('this.INIT_TIME_START : ', this.INIT_TIME_START)
    this.INIT_TIME_END = addDayEnd(-1)
    // console.log('this.INIT_TIME_END: ', this.INIT_TIME_END)
    this.setDefaultSpuTime()

    // 商品等级下拉框
    this.linkPush()
    // 项目器型下拉框
    this.listShape()
    // 项目价格带下拉框
    this.listPriceRange()
    // 项目人群下拉框
    this.listStrategyCrowd()
    // 产品下拉
    this.spuPush()
    // 项目等级下拉框
    this.strategyPush()
    // 获取部门组织
    this.getDeptTree()
    // 赛道下拉框数据
    this.getTrack()
    // 项目下拉框数据
    this.getCategory()
    // 店铺下拉框数据
    this.listPush()
    // 获取品牌下拉框
    this.listBrand()

    //平台
    await this.getPlatformList()
    //链接阶段
    await this.getLinkTimeStatus()
    await this.getStrategyDataList()
  },
  mounted() {
    // 监听屏幕变化
    this.debounceHandleResize = this.debounce(this.handleResize, 300)
    this.handleResize()
    window.addEventListener('resize', this.debounceHandleResize)
  },
  watch: {},
  computed: {},
  directives: {
    'el-select-loadmore': (el, binding) => {
      // 获取element-ui定义好的scroll盒子
      const SELECTWRAP_DOM = el.querySelector(
        '.el-select-dropdown .el-select-dropdown__wrap'
      )
      if (SELECTWRAP_DOM) {
        SELECTWRAP_DOM.addEventListener('scroll', function () {
          const condition =
            this.scrollHeight - this.scrollTop <= this.clientHeight
          if (condition) binding.value()
        })
      }
    },
  },
  methods: {
    //品牌下拉框
    async listBrand() {
      const res = await brandPush()
      this.brandList = res.data
    },

    // 跳转到库存
    goSkuInventory(row) {
      // console.log('row', row)
      this.$router.push({
        name: 'SkuInventory',
        params: {
          spuUuid: row.spuUuid,
        },
      })
    },

    // 展示日报
    showDailyDetail(row) {
      this.currentRow = {
        linkTitle: row.goodsName,
        linkId: row.linkId,
        linkLevel: row.linkLevelName,
        managerName: row.managerName,
        url: row.url,
        srcList: [row.url],
      }
      this.showViewDailyDialog = true
      // console.log('日报')
    },

    getFormatDate(date) {
      return getFormatDate(date)
    },

    // 时间选择失焦时将startPickerTime置空 目的是清除禁用的时间范围
    blurTime() {
      this.startPickerTime = ''
    },

    //链接阶段的下拉框
    async getLinkTimeStatus() {
      const res = await listLinkTimeStatus()
      this.linkTimeStatusList = res.data
    },

    // 店铺名称下拉框
    async listPush() {
      const res = await listPush()
      this.stores = res.data
    },

    //项目等级下拉框
    async strategyPush() {
      const res = await strategy_status()
      this.strategyLinkLevels = res.data
    },

    // 店铺等级名称下拉框
    async linkPush() {
      const res = await linkPush()
      this.linkLevels = res.data
    },

    //获取平台
    async getPlatformList() {
      const res = await listPlatform()
      this.platformList = res.data
    },

    //项目品类组织架构下拉框
    async getCategory() {
      const res = await category()
      this.Cadepartments = await getDeptTreeData(res.data)
    },

    // 项目器型下拉框
    async listShape() {
      const res = await shape()
      this.shapeList = await getDeptTreeData(res.data)
    },

    // 项目价格带下拉框
    async listPriceRange() {
      const res = await price()
      this.priceList = await getDeptTreeData(res.data)
    },

    // 项目人群下拉框
    async listStrategyCrowd() {
      const res = await crowd()
      this.crowdList = await getDeptTreeData(res.data)
    },

    //项目赛道组织架构下拉框
    async getTrack() {
      const res = await track()
      this.Trdepartments = await getDeptTreeData(res.data)
    },

    //项目负责人组织架构数据
    async getDeptTree() {
      const res = await department()
      this.departments = await getDeptTreeData(res.data)
    },

    handleResize() {
      this.screenWidth = window.innerWidth
      this.screenHeight = window.innerHeight
      this.tabHeight =
        this.screenHeight - 460 > 0 ? this.screenHeight - 460 : 600
    },

    debounce(func, wait) {
      let timeout
      return function () {
        const context = this
        const args = arguments
        clearTimeout(timeout)
        timeout = setTimeout(function () {
          func.apply(context, args)
        }, wait)
      }
    },

    // 关闭项目看板
    closeStrategyBoardDialog() {
      this.showStrategyBoardDialog = false
    },

    // 关闭链接看板
    closeLinkBoardDialog() {
      this.showLinkBoardDialog = false
    },

    // 关闭明细
    detailStatus() {
      this.strategyDetailStatus = false
      this.linkDetailStatus = false
    },

    // sku明细
    itemDetailStrategy(row) {
      const rowDataAss = Object.assign(row, {
        timeArr: this.spuTimeScope,
        formatType: this.searchParams.formatType,
      })
      this.rowData = rowDataAss
      this.spuOrsku = '项目'
      this.strategyDetailStatus = true
    },

    //商品链接明细
    itemDetailGoods(row) {
      const rowDataAss = Object.assign(row, {
        timeArr: this.spuTimeScope,
        formatType: this.searchParams.formatType,
      })
      this.rowData = rowDataAss
      this.storeOr = 'link'
      this.linkDetailStatus = true
    },

    // 打开项目看板
    async lookBoardStrategy(row) {
      const res = await detailStrategy({ uuid: row.uuid })

      this.rowParams = {
        strategyTitle: row.strategyTitle,
        category: res.data.categoryUuidList,
        track: res.data.trackUuidList,
        shape: res.data.shape,
        priceZone: res.data.priceZone,
        crowd: res.data.crowd,
        uuid: row.uuid,
        strategyGrade: row.strategyGrade,
        startTime: this.searchParams.startTime,
        endTime: this.searchParams.endTime,
        formatType: this.searchParams.formatType,
      }
      this.showStrategyBoardDialog = true
    },

    // 打开项目链接看板
    async lookBoardStrategyLink(row) {
      this.rowParams = {
        linkTitle: row.goodsName + '(' + row.linkId + ')',
        strategyUuid: this.currentSpu,
        linkId: row.linkId,
        startTime: this.searchParams.startTime,
        endTime: this.searchParams.endTime,
        formatType: this.searchParams.formatType,
      }
      this.showLinkBoardDialog = true
    },

    // 项目商品行点击事件
    clickStrategyTabRow(row, column, event) {
      this.storeUuid = ''
      this.manager = ''
      this.linkLevel = ''
      this.platform = ''
      this.linkTimeStatus = ''
      this.mainLink = ''
      this.linkSortType = 1
      // console.log('row: ', row)
      this.currentSpu = row.uuid
      this.searchSkuParams.uuid = this.currentSpu
      this.getshopDataList(1)
    },
    // 商品搜索
    searchSpu() {
      this.linkSortType = 1
      this.getshopDataList(1)
    },

    // 点击修改tab行颜色
    rowStyle({ row }) {
      if (this.currentSpu === row.uuid) {
        return {
          'background-color': 'rgb(235,240,240)',
          cursor: 'pointer',
        }
      }
      return { cursor: 'pointer' }
    },

    // 获取项目商品列表数据
    async getStrategyDataList(page) {
      if (page !== undefined) {
        this.searchParams.page = page
      }
      if (Array.isArray(this.track)) {
        this.track = this.track[this.track.length - 1]
      }
      if (Array.isArray(this.shape)) {
        this.shape = this.shape[this.shape.length - 1]
      }
      if (Array.isArray(this.crowd)) {
        this.crowd = this.crowd[this.crowd.length - 1]
      }
      if (Array.isArray(this.priceZone)) {
        this.priceZone = this.priceZone[this.priceZone.length - 1]
      }
      this.category = []
      for (let i = this.categoryList.length; i--; ) {
        let arr = this.categoryList[i]
        if (Array.isArray(arr)) {
          arr = arr[arr.length - 1]
        }
        this.category.push(arr)
      }
      this.searchParams = Object.assign(this.searchParams, {
        startTime: this.spuTimeScope[0],
        endTime: this.spuTimeScope[1],
        formatType: this.searchParams.formatType, //1----年月，2------年月日
        strategyTitle: this.strategyTitle,
        strategyGrade: this.strategyGrade,
        track: this.track,
        category: this.category,
        shape: this.shape,
        priceZone: this.priceZone,
        crowd: this.crowd,
      })
      // console.log('searchParams', this.searchParams, '')
      this.spuLoading = true
      let res = await home_list(this.searchParams)
      this.strategyDataList = res.data.records
      this.spuLoading = false

      // console.log('res: ', res)
      this.strategyTotal = res.data.total
    },
    // 获取店铺列表数据
    async getshopDataList(page) {
      if (page !== undefined) {
        this.searchSkuParams.page = page
      }
      if (Array.isArray(this.manager)) {
        this.manager = this.manager[this.manager.length - 1]
      }

      this.searchSkuParams = Object.assign(this.searchSkuParams, {
        startTime: this.spuTimeScope[0],
        endTime: this.spuTimeScope[1],
        formatType: this.searchParams.formatType, //1----年月，2------年月日
        strategyUuid: this.currentSpu,
        storeUuid: this.storeUuid,
        mainLink: this.mainLink,
        linkTimeStatus: this.linkTimeStatus,
        platform: this.platform,
        manager: this.manager,
        sortType: this.linkSortType,
        linkLevel: this.linkLevel,
      })

      this.skuLoading = true
      let res = await link_list(this.searchSkuParams)
      this.shopDataList = res.data.records
      this.skuLoading = false
      this.skuTotal = res.data.total
    },
    // 切换排序方式
    changeSortType(val) {
      if (this.currentSpu == '') {
        return
      }
      this.linkSortType = val
      this.getshopDataList(1)
    },
    // 商品项目搜索按钮
    strategySearch() {
      // 将选中的项目uuid置空
      this.currentSpu = ''
      // 将链接的条件查询置空
      this.storeUuid = ''
      this.linkTimeStatus = ''
      this.platform = ''
      this.mainLink = ''
      this.manager = ''
      this.linkLevel = ''
      this.shopDataList = []
      this.getStrategyDataList(1)
    },
    // 设置默认spu时间
    setDefaultSpuTime() {
      this.searchParams.startTime = this.INIT_TIME_START
      this.searchParams.endTime = this.INIT_TIME_END

      this.searchSkuParams.startTime = this.INIT_TIME_START
      this.searchSkuParams.endTime = this.INIT_TIME_END

      this.spuTimeScope = [
        this.searchParams.startTime,
        this.searchParams.endTime,
      ]
    },
    // 下拉框出现时，调用过滤方法
    visibleChange(flag) {
      if (flag) {
        this.filterMethod()
      }
    },
    filterMethod: debounce(function (filterVal) {
      if (filterVal) {
        let filterArr = this.spuNameArr.filter((item) => {
          return item.name.includes(filterVal)
        })
        this.spuNameArrCurrent = filterArr
      } else {
        this.spuNameArrCurrent = this.spuNameArr
      }
    }, 500),
    // spu名称下拉框加载更多
    loadMore(n) {
      // elementui下拉超过7条才会出滚动条,如果初始不出滚动条无法触发loadMore方法
      return () => (this.rangeNumber += 5) // 每次滚动到底部可以新增条数  可自定义
    },
    // 商品名称下拉框
    async spuPush() {
      let res1 = await spuPush()
      this.spuNameArr = res1.data
    },
    // 链接看板跳转
    linkBoardGoods(row) {
      this.inkPromotionStatus = true
      this.promotionParams = { ...row, storeUuId: row.storeUuid }
    },
    // 转为百分比
    getPercent(num) {
      if (num || num === 0) {
        return (num * 100).toFixed(2) + '%'
      } else {
        return '-'
      }
    },
    // 保留两位小数
    getFixed(num) {
      if (num || num === 0) {
        return num.toFixed(2)
      } else {
        return '-'
      }
    },
    // 查看榜单明细
    getRankDetail(row) {
      this.rankDetailsLinkId = row.linkId
      this.rankDetailsVisible = true
    },
    async exportStrategyStatistics() {
      this.searchParams.startTime = this.spuTimeScope[0]
      this.searchParams.endTime = this.spuTimeScope[1]
      const [err, res] = await this.$to(
        exportStrategyStatistics(this.searchParams)
      )
      const isBlob = blobValidate(res)
      if (isBlob) {
        const blob = new Blob([res])
        saveAs(blob, `项目统计数据表.xlsx`)
      } else {
        const resText = await res.text()
        const rspObj = JSON.parse(resText)
        this.$message.error(rspObj.msg)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.statistics {
  padding: 20px;

  .spu-list {
    overflow-y: auto;
  }

  .statistics-container {
    display: flex;
    flex-direction: column;
    flex: 1;

    .spu-container {
      padding-bottom: 20px;
    }
  }
}
.grade-min-width {
  width: 80px;
}

.data-range-style {
  display: flex;
  flex-direction: column;
  margin-top: -35px;
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

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
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
