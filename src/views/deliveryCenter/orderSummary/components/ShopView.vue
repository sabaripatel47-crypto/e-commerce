<template>
  <div>
    <!-- <el-radio-group v-model="activeName" @change="getPageList(1)">
      <el-radio-button :label="1">退货量</el-radio-button>
      <el-radio-button :label="2">售前退款</el-radio-button>
      <el-radio-button :label="3">退款不退货</el-radio-button>
      <el-radio-button :label="4">退货退款</el-radio-button>
      <el-radio-button :label="5">销售金额</el-radio-button>
      <el-radio-button :label="6">销售数量</el-radio-button>
    </el-radio-group>-->
    <div class="wrapper">
      <div class="container">
        <div class="row">
          <span class="label">售前退款:</span>
          <span class="data">
            {{
            totalData.afterRefundQuantity ? totalData.afterRefundQuantity : "-"
            }}
          </span>
        </div>
        <div class="row">
          <span class="label">售前退款率:</span>
          <span class="data">
            {{
            totalData.afterRefundQuantityPercentage
            ? numberToPercentage(totalData.afterRefundQuantityPercentage)
            : "-"
            }}
          </span>
        </div>
      </div>
      <div class="container">
        <div class="row">
          <span class="label">退款金额:</span>
          <span class="data">
            {{
            totalData.orderRefundAmount
            ? toFixed2(totalData.orderRefundAmount)
            : "-"
            }}
          </span>
        </div>
        <div class="row">
          <!-- <span class="label">退款率:</span> -->
          <span
            class="label"
            v-if="
              reqParams.sortType == 1 ||
              reqParams.sortType == 5 ||
              reqParams.sortType == 6
            "
          >总退款率:</span>
          <span v-if="reqParams.sortType == 2">售前退款的退款率:</span>
          <span v-if="reqParams.sortType == 4">退货退款的退款率:</span>
          <span v-if="reqParams.sortType == 3">退货不退款的退款率:</span>
          <span class="data">
            {{
            totalData.refundAmountRate
            ? numberToPercentage(totalData.refundAmountRate)
            : "-"
            }}
          </span>
        </div>
      </div>
      <div class="container">
        <div class="row">
          <span class="label">退货退款:</span>
          <span class="data">
            {{
            totalData.refundGoodsAndAmountRate
            ? totalData.refundGoodsAndAmountRate
            : "-"
            }}
          </span>
        </div>
        <div class="row">
          <span class="label">退货退款率:</span>
          <span class="data">
            {{
            totalData.refundGoodsAndAmountPercentage
            ? numberToPercentage(totalData.refundGoodsAndAmountPercentage)
            : "-"
            }}
          </span>
        </div>
      </div>
      <div class="container">
        <div class="row">
          <span class="label">退款不退货:</span>
          <span class="data">
            {{
            totalData.refundJustRate ? totalData.refundJustRate : "-"
            }}
          </span>
        </div>
        <div class="row">
          <span class="label">退款不退货率:</span>
          <span class="data">
            {{
            totalData.refundJustPercentage
            ? numberToPercentage(totalData.refundJustPercentage)
            : "-"
            }}
          </span>
        </div>
      </div>
      <div class="container">
        <div class="row">
          <span class="label">退单量/退货量:</span>
          <span class="data">
            {{
            totalData.erpRefundQuantity ? totalData.erpRefundQuantity : "-"
            }}
          </span>
        </div>
        <div class="row">
          <span class="label">退单率/退货率:</span>
          <span class="data">
            {{
            totalData.refundRate
            ? numberToPercentage(totalData.refundRate)
            : "-"
            }}
          </span>
        </div>
      </div>
      <div class="container">
        <div class="row">
          <span class="label">销售金额:</span>
          <span class="data">
            {{
            totalData.orderAmount ? toFixed2(totalData.orderAmount) : "-"
            }}
          </span>
        </div>
        <div class="row">
          <span class="label">销售数量:</span>
          <span class="data">
            {{
            totalData.orderQuantity ? totalData.orderQuantity : "-"
            }}
          </span>
        </div>
      </div>
      <!-- <div class="container">
        <div class="row">
          <span class="label">指标偏离度:</span>
          <span class="data">{{
            totalData.deviation ? numberToPercentage(totalData.deviation) : "-"
          }}</span>
        </div>
      </div>-->
    </div>
    <el-table :data="tableData" style="width: 100%" border height="480" v-loading="loading">
      <el-table-column prop="date" label="序号" min-width="30" type="index" align="center"></el-table-column>
      <el-table-column prop="platformName" label="平台" align="center"></el-table-column>
      <el-table-column prop label="店铺" align="center">
        <template v-slot="{ row }">
          <span>({{ row.storeCode }}){{ row.storeName }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="orderRefundAmount" label="退款金额" align="center">
        <template v-slot="{ row }">
          <span>
            {{
            row.orderRefundAmount == null ? "-" : row.orderRefundAmount
            }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="erpRefundQuantity" label="退单量/退货量" align="center" min-width="120">
        <template #header>
          <span
            :style="{
              color: reqParams.sortType == 1 ? '#409EFF' : '',
              fontSize: reqParams.sortType == 1 ? '17px' : '14px',
            }"
            @click="changeType(1)"
          >
            退单量/退货量
            <i class="el-icon-top"></i>
          </span>
        </template>
        <template v-slot="{ row }">
          <span>
            {{
            row.erpRefundQuantity == null ? "-" : row.erpRefundQuantity
            }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="afterRefundQuantity" label="售前退款" align="center">
        <!-- 自定义表头 -->
        <template #header>
          <span v-if="reqParams.sortType != 2" @click="changeType(2)">
            售前退款
            <i class="el-icon-top"></i>
          </span>
          <span style="color: #409eff; fontsize: 17px" v-else>
            售前(退单率/退货率)
            <i class="el-icon-top"></i>
          </span>
        </template>
        <template v-slot="{ row }">
          <span>
            {{
            row.afterRefundQuantity == null ? "-" : row.afterRefundQuantity
            }}
          </span>
          <span
            v-if="
              row.afterRefundQuantityPercentage != null &&
              reqParams.sortType == 2
            "
          >/{{ numberToPercentage(row.afterRefundQuantityPercentage) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="refundJustRate" label="退款不退货" align="center">
        <!-- 自定义表头 -->
        <template #header>
          <span style="color: #409eff; fontsize: 17px" v-if="reqParams.sortType == 3">
            退款不退货(退单率/退货率)
            <i class="el-icon-top"></i>
          </span>
          <span @click="changeType(3)" v-else>
            退款不退货
            <i class="el-icon-top"></i>
          </span>
        </template>
        <template v-slot="{ row }">
          <span>
            {{
            row.refundJustRate == null ? "-" : row.refundJustRate
            }}
          </span>
          <span
            v-if="row.refundJustPercentage != null && reqParams.sortType == 3"
          >/{{ numberToPercentage(row.refundJustPercentage) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="refundGoodsAndAmountRate" label="退货退款" align="center">
        <!-- 自定义表头 -->
        <template #header>
          <span style="color: #409eff; font-size: 17px" v-if="reqParams.sortType == 4">
            退货退款(退单率/退货率)
            <i class="el-icon-top"></i>
          </span>
          <span v-else @click="changeType(4)">
            退货退款
            <i class="el-icon-top"></i>
          </span>
        </template>
        <template v-slot="{ row }">
          <span>
            {{
            row.refundGoodsAndAmountRate == null
            ? "-"
            : row.refundGoodsAndAmountRate
            }}
          </span>
          <span
            v-if="
              row.refundGoodsAndAmountPercentage != null &&
              reqParams.sortType == 4
            "
          >/{{ numberToPercentage(row.refundGoodsAndAmountPercentage) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="orderAmount" label="销售金额" align="center">
        <template #header>
          <span
            :style="{
              color: reqParams.sortType == 5 ? '#409EFF' : '',
              fontSize: reqParams.sortType == 5 ? '17px' : '14px',
            }"
            @click="changeType(5)"
          >
            销售金额
            <i class="el-icon-top"></i>
          </span>
        </template>
        <template v-slot="{ row }">
          <span>{{ row.orderAmount == null ? "-" : row.orderAmount }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="orderQuantity" label="销售数量" align="center">
        <template #header>
          <span
            :style="{
              color: reqParams.sortType == 6 ? '#409EFF' : '',
              fontSize: reqParams.sortType == 6 ? '17px' : '14px',
            }"
            @click="changeType(6)"
          >
            销售数量
            <i class="el-icon-top"></i>
          </span>
        </template>
        <template v-slot="{ row }">
          <span>{{ row.orderQuantity == null ? "-" : row.orderQuantity }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="refundRate" align="center">
        <!-- 自定义表头 -->
        <template #header>
          <span
            v-if="
              reqParams.sortType == 1 ||
              reqParams.sortType == 5 ||
              reqParams.sortType == 6
            "
          >总退款率</span>
          <span v-if="reqParams.sortType == 2">售前退款的退款率</span>
          <span v-if="reqParams.sortType == 4">退货退款的退款率</span>
          <span v-if="reqParams.sortType == 3">退货不退款的退款率</span>
        </template>
        <template v-slot="{ row }">
          <span>{{ numberToPercentage(row.refundAmountRate) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="refundRate" label="退单率/退货率" align="center">
        <template v-slot="{ row }">
          <span>{{ numberToPercentage(row.refundRate) }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column
        prop="deviation"
        label="指标偏离度"
        align="center"
      ></el-table-column>-->
      <el-table-column label="操作" width="150" align="center">
        <template v-slot="{ row, $index }">
          <el-button type="text" @click="getShopTrend(row)">趋势</el-button>
          <el-button type="text" @click="lookBoardStore(row)">看板</el-button>
          <el-button type="text" @click="openDetail(row)">明细</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="reqParams.page"
      :limit.sync="reqParams.pageSize"
      @pagination="getPageList"
    />

    <el-dialog title="详情" :visible.sync="detailDialogVisible" width="90%">
      <el-form class="page-search" inline style="margin-top: 10px">
        <el-form-item label="商品编码：" style="margin-right: 20px">
          <el-input v-model="linkParams.linkId" placeholder="请输入商品编码"></el-input>
        </el-form-item>
        <el-form-item label="商品等级：" style="margin-right: 20px">
          <el-select filterable v-model="linkParams.linkLevel" clearable placeholder="请选择商品等级">
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
            v-model="linkParams.managerUuid"
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
        <el-form-item style="margin-right: 20px">
          <el-button type="primary" icon="el-icon-search" @click="getLinkTable(1)">搜索</el-button>
        </el-form-item>
      </el-form>
      <!-- <el-radio-group v-model="linkParams.sortType" @change="getLinkTable(1)">
        <el-radio-button :label="1">退货量</el-radio-button>
        <el-radio-button :label="2">售前退款</el-radio-button>
        <el-radio-button :label="3">退款不退货</el-radio-button>
        <el-radio-button :label="4">退货退款</el-radio-button>
        <el-radio-button :label="5">销售金额</el-radio-button>
        <el-radio-button :label="6">销售数量</el-radio-button>
      </el-radio-group>-->
      <el-table
        :data="linkData"
        style="width: 100%"
        border
        v-loading="linkLoading"
        height="480"
        :row-style="rowStyle"
        @row-click="rowClick"
      >
        <el-table-column prop="date" label="序号" min-width="30" type="index" align="center"></el-table-column>
        <el-table-column prop label="主图" align="center">
          <template v-slot="{ row, $index }">
            <el-image
              v-if="row.urlUuid"
              style="height: 30px; width: 30px"
              :src="
                row.urlUuid + '?x-oss-process=image/resize,w_30,h_30,limit_0'
              "
              :preview-src-list="[row.urlUuid]"
            ></el-image>
          </template>
        </el-table-column>
        <el-table-column prop label="商品链接" align="center">
          <template v-slot="{ row }">
            <span>({{ row.linkId }}){{ row.linkTitle }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="linkLevelName" label="商品等级" align="center"></el-table-column>
        <el-table-column prop="orderRefundAmount" label="退款金额" align="center">
          <template v-slot="{ row }">
            <span>
              {{
              row.orderRefundAmount == null ? "-" : row.orderRefundAmount
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="erpRefundQuantity" label="退单量/退货量" align="center">
          <template #header>
            <span
              :style="{
                color: linkParams.sortType == 1 ? '#409EFF' : '',
                fontSize: linkParams.sortType == 1 ? '17px' : '14px',
              }"
              @click="changeLinkSort(1)"
            >
              退单量/退货量
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template v-slot="{ row }">
            <span>
              {{
              row.erpRefundQuantity == null ? "-" : row.erpRefundQuantity
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="afterRefundQuantity" label="售前退款" align="center">
          <!-- 自定义表头 -->
          <template #header>
            <span v-if="linkParams.sortType != 2" @click="changeLinkSort(2)">
              售前退款
              <i class="el-icon-top"></i>
            </span>
            <span style="color: #409eff; fontsize: 17px" v-else>
              售前退款/售前(退单率/退货率)
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template v-slot="{ row }">
            <span>
              {{
              row.afterRefundQuantity == null ? "-" : row.afterRefundQuantity
              }}
            </span>
            <span
              v-if="
                row.afterRefundQuantityPercentage != null &&
                linkParams.sortType == 2
              "
            >
              /{{
              numberToPercentage(row.afterRefundQuantityPercentage)
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="refundJustRate" label="退款不退货" align="center" min-width="100">
          <!-- 自定义表头 -->
          <template #header>
            <span style="color: #409eff; fontsize: 17px" v-if="linkParams.sortType == 3">
              退款不退货/退款不退货(退单率/退货率)
              <i class="el-icon-top"></i>
            </span>
            <span @click="changeLinkSort(3)" v-else>
              退款不退货
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template v-slot="{ row }">
            <span>
              {{
              row.refundJustRate == null ? "-" : row.refundJustRate
              }}
            </span>
            <span
              v-if="
                row.refundJustPercentage != null && linkParams.sortType == 3
              "
            >/{{ numberToPercentage(row.refundJustPercentage) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="refundGoodsAndAmountRate" label="退货退款" align="center">
          <!-- 自定义表头 -->
          <template #header>
            <span style="color: #409eff; fontsize: 17px" v-if="linkParams.sortType == 4">
              退货退款/退货退款(退单率/退货率)
              <i class="el-icon-top"></i>
            </span>
            <span v-else @click="changeLinkSort(4)">
              退货退款
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template v-slot="{ row }">
            <span>
              {{
              row.refundGoodsAndAmountRate == null
              ? "-"
              : row.refundGoodsAndAmountRate
              }}
            </span>
            <span
              v-if="
                row.refundGoodsAndAmountPercentage != null &&
                linkParams.sortType == 4
              "
            >
              /{{
              numberToPercentage(row.refundGoodsAndAmountPercentage)
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="orderAmount" label="销售金额" align="center" min-width="110">
          <template #header>
            <span
              :style="{
                color: linkParams.sortType == 5 ? '#409EFF' : '',
                fontSize: linkParams.sortType == 5 ? '17px' : '14px',
              }"
              @click="changeLinkSort(5)"
            >
              销售金额
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template v-slot="{ row }">
            <span>{{ row.orderAmount == null ? "-" : row.orderAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderQuantity" label="销售数量" align="center" min-width="110">
          <template #header>
            <span
              :style="{
                color: linkParams.sortType == 6 ? '#409EFF' : '',
                fontSize: linkParams.sortType == 6 ? '17px' : '14px',
              }"
              @click="changeLinkSort(6)"
            >
              销售数量
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template v-slot="{ row }">
            <span>
              {{
              row.orderQuantity == null ? "-" : row.orderQuantity
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="refundRate" align="center">
          <!-- 自定义表头 -->
          <template #header>
            <span
              v-if="
                linkParams.sortType == 1 ||
                linkParams.sortType == 5 ||
                linkParams.sortType == 6
              "
            >总退款率</span>
            <span v-if="linkParams.sortType == 2">售前退款的退款率</span>
            <span v-if="linkParams.sortType == 4">退货退款的退款率</span>
            <span v-if="linkParams.sortType == 3">退货不退款的退款率</span>
          </template>
          <template v-slot="{ row }">
            <span>{{ numberToPercentage(row.refundAmountRate) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="refundRate" label="退单率/退货率" align="center">
          <template v-slot="{ row }">
            <span>{{ numberToPercentage(row.refundRate) }}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column
          prop="deviation"
          label="指标偏离度"
          align="center"
        ></el-table-column>-->
        <el-table-column label="操作" align="center">
          <template v-slot="{ row }">
            <el-button type="text" @click="getLinkTrend(row)">趋势</el-button>
            <el-button type="text" @click="lookBoardGoods(row)">看板</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <pagination
        v-show="linkTotal > 0"
        :total="linkTotal"
        :page.sync="linkParams.page"
        :limit.sync="linkParams.pageSize"
        @pagination="getLinkTable"
      />
      <el-radio-group
        v-model="childActiveName"
        @change="handleChange"
        v-if="skuParams.linkId != ''"
      >
        <el-radio-button :label="1">SKU</el-radio-button>
        <el-radio-button :label="2">SPU</el-radio-button>
      </el-radio-group>
      <el-form class="page-search" inline style="margin-top: 10px" v-if="skuParams.linkId != ''">
        <el-form-item label="SKU编码：" min-width="150px" align="center" v-if="childActiveName == 1">
          <el-select
            style="width: 100%"
            v-model="skuParams.keyWord"
            filterable
            clearable
            :filter-method="filterMethod"
            @visible-change="visibleChange"
            v-el-select-loadmore="loadMore"
            :loading="selectLoading"
          >
            <el-option
              v-for="item in skuList"
              :key="item.code"
              :label="`${item.standbyKeyword}(${item.name})`"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label min-width="150px" align="center">
          <el-button
            type="primary"
            @click="getSkuTable(1)"
            v-if="childActiveName == 1"
            icon="el-icon-search"
          >搜索</el-button>
        </el-form-item>
      </el-form>
      <!-- <el-radio-group
        v-model="childSortType"
        @change="handleChange"
        v-if="skuParams.linkId != ''"
      >
        <el-radio-button :label="1">退货量</el-radio-button>
        <el-radio-button :label="2">售前退款</el-radio-button>
        <el-radio-button :label="3">退款不退货</el-radio-button>
        <el-radio-button :label="4">退货退款</el-radio-button>
        <el-radio-button :label="5">销售金额</el-radio-button>
        <el-radio-button :label="6">销售数量</el-radio-button>
      </el-radio-group>-->
      <el-table
        :data="spuData"
        style="width: 100%"
        border
        height="480"
        v-loading="spuLoading"
        v-if="childActiveName == 2 && spuParams.linkId != ''"
      >
        <el-table-column label="序号" min-width="30" type="index" align="center"></el-table-column>
        <el-table-column prop="spuName" label="货品名称" align="center">
          <template v-slot="{ row }">
            <span>{{ row.spuName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="categoryLevelName" label="货品等级" align="center">
          <template v-slot="{ row }">
            <span>{{ row.categoryLevelName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderRefundAmount" label="退款金额" align="center">
          <template v-slot="{ row }">
            <span>
              {{
              row.orderRefundAmount == null ? "-" : row.orderRefundAmount
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="erpRefundQuantity" label="退单量/退货量" align="center" min-width="100">
          <template #header>
            <span
              :style="{
                color: spuParams.sortType == 1 ? '#409EFF' : '',
                fontSize: spuParams.sortType == 1 ? '17px' : '14px',
              }"
              @click="changeSpuSort(1)"
            >
              退单量/退货量
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template v-slot="{ row }">
            <span>
              {{
              row.erpRefundQuantity == null ? "-" : row.erpRefundQuantity
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="afterRefundQuantity" label="售前退款" align="center">
          <!-- 自定义表头 -->
          <template #header>
            <span v-if="spuParams.sortType != 2" @click="changeSpuSort(2)">
              售前退款
              <i class="el-icon-top"></i>
            </span>
            <span style="color: #409eff; fontsize: 17px" v-else>
              售前退款/售前(退单率/退货率)
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template v-slot="{ row }">
            <span>
              {{
              row.afterRefundQuantity == null ? "-" : row.afterRefundQuantity
              }}
            </span>
            <span
              v-if="
                row.afterRefundQuantityPercentage != null &&
                spuParams.sortType == 2
              "
            >
              /{{
              numberToPercentage(row.afterRefundQuantityPercentage)
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="refundJustRate" label="退款不退货" align="center">
          <!-- 自定义表头 -->
          <template #header>
            <span style="color: #409eff; fontsize: 17px" v-if="spuParams.sortType == 3">
              退款不退货/退款不退货(退单率/退货率)
              <i class="el-icon-top"></i>
            </span>
            <span @click="changeSpuSort(3)" v-else>
              退款不退货
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template v-slot="{ row }">
            <span>
              {{
              row.refundJustRate == null ? "-" : row.refundJustRate
              }}
            </span>
            <span
              v-if="row.refundJustPercentage != null && spuParams.sortType == 3"
            >/{{ numberToPercentage(row.refundJustPercentage) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="refundGoodsAndAmountRate" label="退货退款" align="center">
          <!-- 自定义表头 -->
          <template #header>
            <span style="color: #409eff; fontsize: 17px" v-if="spuParams.sortType == 4">
              退货退款/退货退款(退单率/退货率)
              <i class="el-icon-top"></i>
            </span>
            <span v-else @click="changeSpuSort(4)">
              退货退款
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template v-slot="{ row }">
            <span>
              {{
              row.refundGoodsAndAmountRate == null
              ? "-"
              : row.refundGoodsAndAmountRate
              }}
            </span>
            <span
              v-if="
                row.refundGoodsAndAmountPercentage != null &&
                spuParams.sortType == 4
              "
            >
              /{{
              numberToPercentage(row.refundGoodsAndAmountPercentage)
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="orderAmount" label="销售金额" align="center">
          <template #header>
            <span
              :style="{
                color: spuParams.sortType == 5 ? '#409EFF' : '',
                fontSize: spuParams.sortType == 5 ? '17px' : '14px',
              }"
              @click="changeSpuSort(5)"
            >
              销售金额
              <i class="el-icon-top"></i>
            </span>
          </template>

          <template v-slot="{ row }">
            <span>{{ row.orderAmount == null ? "-" : row.orderAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderQuantity" label="销售数量" align="center">
          <template #header>
            <span
              :style="{
                color: spuParams.sortType == 6 ? '#409EFF' : '',
                fontSize: spuParams.sortType == 6 ? '17px' : '14px',
              }"
              @click="changeSpuSort(6)"
            >
              销售数量
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template v-slot="{ row }">
            <span>
              {{
              row.orderQuantity == null ? "-" : row.orderQuantity
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="refundRate" align="center">
          <!-- 自定义表头 -->
          <template #header>
            <span
              v-if="
                spuParams.sortType == 1 ||
                spuParams.sortType == 5 ||
                spuParams.sortType == 6
              "
            >总退款率</span>
            <span v-if="spuParams.sortType == 2">售前退款的退款率</span>
            <span v-if="spuParams.sortType == 4">退货退款的退款率</span>
            <span v-if="spuParams.sortType == 3">退货不退款的退款率</span>
          </template>
          <template v-slot="{ row }">
            <span>{{ numberToPercentage(row.refundAmountRate) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="refundRate" label="退单率/退货率" min-width="100" align="center">
          <template v-slot="{ row }">
            <span>{{ numberToPercentage(row.refundRate) }}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column
          prop="deviation"
          label="指标偏离度"
          align="center"
        ></el-table-column>-->
        <el-table-column label="操作" align="center">
          <template v-slot="{ row }">
            <el-button type="text" @click="getSpuTrend(row)">趋势</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <pagination
        v-show="spuTotal > 0 && childActiveName == 2 && spuParams.linkId != ''"
        :total="spuTotal"
        :autoScroll="false"
        :page.sync="spuParams.page"
        :limit.sync="spuParams.pageSize"
        @pagination="getSpuTable"
      />

      <el-table
        :data="skuData"
        style="width: 100%"
        border
        height="480"
        v-loading="skuLoading"
        v-if="childActiveName == 1 && skuParams.linkId != ''"
      >
        <el-table-column prop="date" label="序号" min-width="30" type="index" align="center"></el-table-column>
        <el-table-column prop label="SKU编码" align="center">
          <template v-slot="{ row }">
            <span>({{ row.skuCode }}){{ row.spacesName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop label="SKU图片" align="center">
          <template v-slot="{ row }">
            <el-image
              v-if="row.skuUrlAddress"
              style="height: 30px; width: 30px"
              :src="
                row.skuUrlAddress +
                '?x-oss-process=image/resize,w_30,h_30,limit_0'
              "
              :preview-src-list="[row.skuUrlAddress]"
            ></el-image>
          </template>
        </el-table-column>
        <el-table-column prop="orderRefundAmount" label="退款金额" align="center">
          <template v-slot="{ row }">
            <span>
              {{
              row.orderRefundAmount == null ? "-" : row.orderRefundAmount
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="erpRefundQuantity" label="退单量/退货量" align="center" min-width="120">
          <template #header>
            <span
              :style="{
                color: skuParams.sortType == 1 ? '#409EFF' : '',
                fontSize: skuParams.sortType == 1 ? '17px' : '14px',
              }"
              @click="changeSkuSort(1)"
            >
              退单量/退货量
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template v-slot="{ row }">
            <span>
              {{
              row.erpRefundQuantity == null ? "-" : row.erpRefundQuantity
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="afterRefundQuantity" label="售前退款" align="center" min-width="120">
          <!-- 自定义表头 -->
          <template #header>
            <span v-if="skuParams.sortType != 2" @click="changeSkuSort(2)">
              售前退款
              <i class="el-icon-top"></i>
            </span>
            <span style="color: #409eff; font-size: 17px" v-else>
              售前退款/售前(退单率/退货率)
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template v-slot="{ row }">
            <span>
              {{
              row.afterRefundQuantity == null ? "-" : row.afterRefundQuantity
              }}
            </span>
            <span
              v-if="
                row.afterRefundQuantityPercentage != null &&
                skuParams.sortType == 2
              "
            >
              /{{
              numberToPercentage(row.afterRefundQuantityPercentage)
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="refundJustRate" label="退款不退货" align="center">
          <!-- 自定义表头 -->
          <template #header>
            <span style="color: #409eff; font-size: 17px" v-if="skuParams.sortType == 3">
              退款不退货/退款不退货(退单率/退货率)
              <i class="el-icon-top"></i>
            </span>
            <span @click="changeSkuSort(3)" v-else>
              退款不退货
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template v-slot="{ row }">
            <span>
              {{
              row.refundJustRate == null ? "-" : row.refundJustRate
              }}
            </span>
            <span
              v-if="row.refundJustPercentage != null && skuParams.sortType == 3"
            >/{{ numberToPercentage(row.refundJustPercentage) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="refundGoodsAndAmountRate" label="退货退款" align="center">
          <!-- 自定义表头 -->
          <template #header>
            <span style="color: #409eff; font-size: 17px" v-if="skuParams.sortType == 4">
              退货退款/退货退款(退单率/退货率)
              <i class="el-icon-top"></i>
            </span>
            <span v-else @click="changeSkuSort(4)">
              退货退款
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template v-slot="{ row }">
            <span>
              {{
              row.refundGoodsAndAmountRate == null
              ? "-"
              : row.refundGoodsAndAmountRate
              }}
            </span>
            <span
              v-if="
                row.refundGoodsAndAmountPercentage != null &&
                skuParams.sortType == 4
              "
            >
              /{{
              numberToPercentage(row.refundGoodsAndAmountPercentage)
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="orderAmount" label="销售金额" align="center" min-width="110">
          <template #header>
            <span
              :style="{
                color: skuParams.sortType == 5 ? '#409EFF' : '',
                fontSize: skuParams.sortType == 5 ? '17px' : '14px',
              }"
              @click="changeSkuSort(5)"
            >
              销售金额
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template v-slot="{ row }">
            <span>{{ row.orderAmount == null ? "-" : row.orderAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderQuantity" label="销售数量" align="center" min-width="110">
          <template #header>
            <span
              :style="{
                color: skuParams.sortType == 6 ? '#409EFF' : '',
                fontSize: skuParams.sortType == 6 ? '17px' : '14px',
              }"
              @click="changeSkuSort(6)"
            >
              销售数量
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template v-slot="{ row }">
            <span>
              {{
              row.orderQuantity == null ? "-" : row.orderQuantity
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="refundRate" align="center">
          <!-- 自定义表头 -->
          <template #header>
            <span
              v-if="
                skuParams.sortType == 1 ||
                skuParams.sortType == 5 ||
                skuParams.sortType == 6
              "
            >总退款率</span>
            <span v-if="skuParams.sortType == 2">售前退款的退款率</span>
            <span v-if="skuParams.sortType == 4">退货退款的退款率</span>
            <span v-if="skuParams.sortType == 3">退货不退款的退款率</span>
          </template>
          <template v-slot="{ row }">
            <span>{{ numberToPercentage(row.refundAmountRate) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="refundRate" label="退单率/退货率" min-width="100" align="center">
          <template v-slot="{ row }">
            <span>{{ numberToPercentage(row.refundRate) }}</span>
          </template>
        </el-table-column>
        <!-- <el-table-columnx
          prop="deviation"
          label="指标偏离度"
          align="center"
        ></el-table-columnx>-->
        <el-table-column label="操作" align="center">
          <template v-slot="{ row }">
            <el-button type="text" @click="getSkuTrend(row)">趋势</el-button>
            <el-button type="text" @click="lookBoardSku(row)">看板</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <pagination
        v-show="skuTotal > 0 && childActiveName == 1 && skuParams.linkId != ''"
        :total="skuTotal"
        :autoScroll="false"
        :page.sync="skuParams.page"
        :limit.sync="skuParams.pageSize"
        @pagination="getSkuTable"
      />
    </el-dialog>
    <TrendChart
      @updateValue="handleValueChange"
      v-if="trendDialog && trendData != []"
      :detailDialogVisible="trendDialog"
      :dialogTitle="trendTitle"
      :tableData="trendData"
    ></TrendChart>
    <!-- 看板弹层 -->
    <el-dialog
      :title="'看板'"
      @close="closeBoardDialog"
      :visible.sync="showStoreBoardDialog"
      show-close
      append-to-body
      fullscreen
    >
      <StoreBoard v-if="showStoreBoardDialog" :rowParams="rowParams"></StoreBoard>
    </el-dialog>
    <el-dialog
      :title="'商品链接看板'"
      @close="closeLinkBoardDialog"
      :visible.sync="showLinkBoardDialog"
      show-close
      append-to-body
      fullscreen
    >
      <LinkBoard v-if="showLinkBoardDialog" :rowParams="rowParams" :storeDisabled="true"></LinkBoard>
    </el-dialog>
    <el-dialog
      :title="productTitle"
      @close="productStatusSku"
      :visible.sync="productShowSku"
      show-close
      fullscreen
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
  getShopTable,
  getShopSkuTable,
  getShopConnTable,
  getConnSpuTable,
  getShopTrend,
  getShopConnTrend,
  getConnSpuTrend,
  getShopSkuTrend,
  getTotal,
} from '@/api/deliveryCenter/orderSummary'
import { getDeptTreeData, getFormatDate } from '@/utils/common'
import { department } from '@/api/information/department'
import { getSkuListPush } from '@/api/cargoPulling/cargoRecordDetail'
import { debounce } from 'lodash'
import { listStore, listLinkLevel } from '@/api/baseData/common'
import StoreBoard from '@/views/bulletinboard/store'
import LinkBoard from '@/views/bulletinboard/linkBoard'
import TrendChart from './TrendChart.vue'
import ProductSku from '@/views/bulletinboard/components/ProductSku.vue'

export default {
  name: 'ShopView',
  components: {
    StoreBoard,
    LinkBoard,
    TrendChart,
    ProductSku,
  },
  data() {
    return {
      activeName: 1,
      // 店铺请求参数
      reqParams: {
        endTime: '',
        page: 1,
        pageSize: 10,
        platform: '',
        sortType: 1,
        startTime: '',
        statisticsType: 0,
        storeUuid: '',
      },
      // 加载
      loading: false,
      // 店铺数量
      total: 0,
      // 店铺表格
      tableData: [],
      // 合计数据
      totalData: {},
      detailDialogVisible: false,
      // 商品等级
      linkLevels: [],
      // 部门
      departments: [],
      // 链接请求参数
      linkParams: {
        endTime: '',
        linkId: '',
        linkLevel: '',
        managerUuid: '',
        page: 1,
        pageSize: 10,
        sortType: 1,
        startTime: '',
        statisticsType: 0,
        storeUuid: '',
      },
      linkLoading: false,
      linkData: [],
      linkTotal: 0,
      selectIndex: -1,
      childActiveName: 1,
      // 切换子表排序类型
      childSortType: 1,
      skuList: [],
      // 搜索加载
      selectLoading: false,
      // sku全部值
      skuTotal: 0,
      // sku下拉加载更多状态
      selectFlag: true,
      skuLoading: false,
      // sku请求参数
      skuParams: {
        endTime: '',
        keyWord: '',
        linkId: '',
        page: 1,
        pageSize: 10,
        sortType: 1,
        startTime: '',
        statisticsType: 0,
      },
      spuLoading: false,
      skuData: [],
      skuTotal: 0,
      // spu请求参数
      spuParams: {
        endTime: '',
        linkId: '',
        page: 1,
        pageSize: 10,
        sortType: 1,
        startTime: '',
        statisticsType: 0,
      },
      spuData: [],
      spuTotal: 0,
      // 趋势图数据
      trendData: [],
      // 趋势图标题
      trendTitle: '',
      // 趋势图弹窗
      trendDialog: false,
      // 趋势图请求参数
      trendParams: {
        startTime: '',
        endTime: '',
        storeUuid: '',
      },
      // 显示店铺看板
      showStoreBoardDialog: false,

      // 显示链接看板
      showLinkBoardDialog: false,

      // 看板弹层入参
      rowParams: {},
      currentStoreUuid: '',
      // spu sku看板
      productTitle: '',
      productShowSku: false,
      searchParms: {},
      selectSkuChange: false,
    }
  },
  props: {
    platformUuid: {
      type: String,
      default: '',
    },
    storeUuid: {
      type: String,
      default: '',
    },
    dateTime: {
      type: Array,
      default: () => [],
    },
    statisticsType: {
      type: Number,
      default: 2,
    },
  },
  directives: {
    'el-select-loadmore': (el, binding) => {
      // 获取element-ui定义好的scroll盒子
      const SELECTWRAP_DOM = el.querySelector(
        '.el-select-dropdown .el-select-dropdown__wrap'
      )
      if (SELECTWRAP_DOM) {
        SELECTWRAP_DOM.addEventListener('scroll', function () {
          // console.log('this.scrollHeight: ', this.scrollHeight)
          // console.log('this.scrollTop: ', Math.round(this.scrollTop) + 1)
          // console.log('this.clientHeight: ', this.clientHeight)

          const condition =
            this.scrollHeight - (Math.round(this.scrollTop) + 1) <=
            this.clientHeight
          // console.log('condition: ', condition)
          if (condition) binding.value()
        })
      }
    },
  },
  created() {
    this.handleClick()
    this.listLinkLevel()
    this.getDeptTree()
  },
  methods: {
    // 重制主表排序参数
    handleClick() {
      this.reqParams.sortType = 1
      this.getPageList(1)
      this.getTotal()
    },
    // 切换主表排序方式
    changeType(val) {
      this.reqParams.sortType = val
      this.getPageList(1)
      this.getTotal()
    },
    // 获取合计数据
    async getTotal() {
      const res = await getTotal(this.reqParams)
      this.totalData = res.data
    },
    async getPageList(page) {
      if (page == 1) {
        this.reqParams.page = 1
      }
      this.loading = true
      this.reqParams.startTime = this.dateTime[0]
      this.reqParams.endTime = this.dateTime[1]
      this.reqParams.statisticsType = this.statisticsType
      this.reqParams.platform = this.platformUuid
      this.reqParams.storeUuid = this.storeUuid
      const res = await getShopTable(this.reqParams)
      this.tableData = res.data.records
      this.total = res.data.total
      this.loading = false
    },
    async getDeptTree() {
      const res = await department()
      this.departments = await getDeptTreeData(res.data)
    },
    //商品等级的下拉框
    async listLinkLevel() {
      const res = await listLinkLevel()
      this.linkLevels = res.data
    },
    // 重制链接排序
    resetLinkSort() {
      this.linkParams.sortType = 1
      this.getLinkTable(1)
    },
    // 切换链接排序
    changeLinkSort(val) {
      this.linkParams.sortType = val
      this.getLinkTable(1)
    },
    // 获取链接表格
    async getLinkTable(page) {
      if (page == 1) {
        this.linkParams.page = 1
      }
      this.linkLoading = true
      this.spuData = []
      this.skuData = []
      this.skuParams.keyWord = ''
      this.skuParams.linkId = ''
      this.spuParams.linkId = ''
      this.selectIndex = -1
      if (Array.isArray(this.linkParams.managerUuid)) {
        this.linkParams.managerUuid =
          this.linkParams.managerUuid[this.linkParams.managerUuid.length - 1]
      }
      this.skuParams = this.$options.data().skuParams
      this.linkParams.startTime = this.dateTime[0]
      this.linkParams.endTime = this.dateTime[1]
      this.linkParams.statisticsType = this.statisticsType
      const res = await getShopConnTable(this.linkParams)
      this.linkData = res.data.records
      this.linkTotal = res.data.total
      this.linkLoading = false
    },
    // 获取sku列表
    async getSkuListPush() {
      this.selectLoading = true
      const res = await getSkuListPush(this.skuParams)
      this.skuList = res.data.records
      this.skuTotal = res.data.total
      this.selectLoading = false
    },
    // 下拉框出现时，调用过滤方法
    async visibleChange(flag) {
      this.skuParams.keyword = ''
      this.skuParams.page = 1
      if (flag) {
        await this.getSkuListPush()
      }
      // this.filterMethod()
    },
    filterMethod: debounce(async function (filterVal) {
      this.skuParams.page = 1
      // console.log('filterVal: ', filterVal)
      this.selectLoading = true
      this.skuParams.keyword = filterVal ? filterVal : ''
      await this.getSkuListPush()
      this.selectFlag = true
      this.selectLoading = false
    }, 500),
    // sku下拉框加载更多
    async loadMore() {
      if (
        (this.skuList.length < this.skuTotal && this.selectFlag) ||
        this.skuList.length < this.skuTotal
      ) {
        this.skuParams.page += 1
        this.selectFlag = false
        let res1 = await getSkuListPush(this.skuParams)
        if (this.skuParams.page == 1) {
          this.skuList = []
        }
        res1.data.records.forEach((item) => {
          if (!this.skuList.includes(item.skuUuid)) {
            this.skuList.push(item)
          }
        })
        this.skuTotal = res1.data.total
        this.selectFlag = true
        // console.log('this.reissueArrName', this.reissueArrName)
      }
    },
    // 点击修改tab行颜色
    rowStyle({ row, rowIndex }) {
      if (this.selectIndex === rowIndex) {
        return {
          'background-color': 'rgb(235,240,240)',
          cursor: 'pointer',
        }
      }
      return { cursor: 'pointer' }
    },
    // 重制sku排序
    resetSkuSort() {
      this.skuParams.sortType = 1
      this.getSkuTable(1)
    },
    // 切换sku排序
    changeSkuSort(val) {
      this.skuParams.sortType = val
      this.getSkuTable(1)
    },
    // 获取sku表格
    async getSkuTable(page) {
      if (page == 1) {
        this.skuParams.page = 1
      }
      this.skuLoading = true
      this.skuParams.startTime = this.dateTime[0]
      this.skuParams.endTime = this.dateTime[1]
      this.skuParams.statisticsType = this.statisticsType
      const res = await getShopSkuTable(this.skuParams)
      this.skuData = res.data.records
      this.skuTotal = res.data.total
      this.skuLoading = false
    },
    // 重制spu排序
    resetSpuSort() {
      this.spuParams.sortType = 1
      this.getSpuTable(1)
    },
    // 切换spu排序
    changeSpuSort(val) {
      this.spuParams.sortType = val
      this.getSpuTable(1)
    },
    // 获取spu表格
    async getSpuTable(page) {
      if (page == 1) {
        this.spuParams.page = 1
      }
      this.spuLoading = true
      this.spuParams.startTime = this.dateTime[0]
      this.spuParams.endTime = this.dateTime[1]
      this.spuParams.statisticsType = this.statisticsType
      const res = await getConnSpuTable(this.spuParams)
      this.spuData = res.data.records
      this.spuTotal = res.data.total
      this.spuLoading = false
    },
    // 打开弹窗
    openDetail(row) {
      this.linkParams.linkId = ''
      this.linkParams.linkLevel = ''
      this.linkParams.managerUuid = ''
      this.trendParams.storeUuid = row.storeUuId
      this.currentStoreUuid = row.storeUuId
      this.linkParams.storeUuid = row.storeUuId
      this.getLinkTable(1)
      this.detailDialogVisible = true
    },
    rowClick(row) {
      this.selectIndex = this.linkData.indexOf(row)
      this.skuParams.linkId = row.linkId
      this.trendParams.linkId = row.linkId
      this.spuParams.linkId = row.linkId
      if (this.childActiveName == 1) {
        this.getSkuTable(1)
      } else if (this.childActiveName == 2) {
        this.getSpuTable(1)
      }
    },
    handleChange() {
      if (this.childActiveName == 1) {
        // this.getSkuTable(1);
        this.resetSkuSort()
      } else if (this.childActiveName == 2) {
        // this.getSpuTable(1);
        this.resetSpuSort()
      }
    },
    // 保留两位小数并转成百分比
    getPercentage(num) {
      if (num == null || num === '' || num === undefined) {
        return '-' // 如果值为null或空字符串，返回0%
      } else {
        let numBer = Math.floor((num * 10000).toFixed(1)) / 100 + '%'
        return numBer
      }
    },
    // 获取店铺趋势图
    async getShopTrend(row) {
      this.trendParams.startTime = this.dateTime[0]
      this.trendParams.endTime = this.dateTime[1]
      this.trendParams.storeUuid = row.storeUuId
      this.trendParams.statisticsType = this.statisticsType
      const res = await getShopTrend(this.trendParams)
      this.trendData = res.data
      this.trendDialog = true
    },
    // 获取店铺下链接趋势图
    async getLinkTrend(row) {
      this.trendParams.startTime = this.dateTime[0]
      this.trendParams.endTime = this.dateTime[1]
      this.trendParams.linkId = row.linkId
      this.trendParams.statisticsType = this.statisticsType
      const res = await getShopConnTrend(this.trendParams)
      this.trendData = res.data
      this.trendDialog = true
    },
    // 获取链接spu趋势图
    async getSpuTrend(row) {
      this.trendParams.startTime = this.dateTime[0]
      this.trendParams.endTime = this.dateTime[1]
      this.trendParams.spuUuid = row.spuUuid
      this.trendParams.statisticsType = this.statisticsType
      const res = await getConnSpuTrend(this.trendParams)
      this.trendData = res.data
      this.trendDialog = true
    },
    // 获取链接sku趋势图
    async getSkuTrend(row) {
      this.trendParams.startTime = this.dateTime[0]
      this.trendParams.endTime = this.dateTime[1]
      this.trendParams.skuUuid = row.skuUuid
      this.trendParams.statisticsType = this.statisticsType
      const res = await getShopSkuTrend(this.trendParams)
      this.trendData = res.data
      this.trendDialog = true
    },
    handleValueChange(newValue) {
      const value = newValue
      this.trendDialog = value
    },
    // 关闭店铺看板
    closeBoardDialog() {
      this.showStoreBoardDialog = false
    },

    // 跳转店铺看板
    lookBoardStore(row) {
      console.log('row', row)
      this.rowParams = {
        storeName: row.storeName,
        storeUuid: row.storeUuId,
        platformUuid: row.platform,
        startTime: this.dateTime[0],
        endTime: this.dateTime[1],
        formatType: 2,
      }
      this.showStoreBoardDialog = true
    },

    // 关闭链接看板
    closeLinkBoardDialog() {
      this.showLinkBoardDialog = false
    },

    //商品链接看板
    lookBoardGoods(row) {
      // console.log('row', { ...row })
      // console.log(this.currentStoreUuid)
      this.rowParams = {
        linkTitle: row.linkTitle,
        storeUuid: this.currentStoreUuid,
        platformUuid: row.platform,
        linkId: row.linkId,
        startTime: this.dateTime[0],
        endTime: this.dateTime[1],
        formatType: 2,
      }
      console.log(this.rowParams)
      this.showLinkBoardDialog = true
    },
    // sku看板
    lookBoardSku(row) {
      this.productTitle = `${row.skuCode}(${row.spacesName})看板`
      this.selectSpuChange = false
      this.selectSkuChange = false
      // console.log("row: ", row);
      // this.searchParms
      Object.assign(this.searchParms, {
        from: 'sku', //入口来源
        timeScopeArr: this.dateTime, //时间范围数组
        timeScopeType: 2, //时间范围类型
        spu: {
          spuUuid: [], //spu uuid
          spuNameArr: [], //spu名称数组
        },
        sku: {
          skuUuid: [row.skuUuid], //sku uuid
          skuCode: [], //sku编码
          skuNameArr: [], //sku名称数组
          skuCodeArr: [], //sku编码数组
        },
        linkIdList: [row.linkId],
      })
      this.productShowSku = true
    },
    productStatusSku() {
      this.productShowSku = false
    },
    // 数字转百分比
    numberToPercentage(value) {
      if (value == null || value === '' || value === undefined) {
        return '-' // 如果值为null或空字符串，返回0%
      } else {
        return (value * 100).toFixed(2) + '%' // 保留两位小数
      }
    },
    // 保留两位小数
    toFixed2(num) {
      if (num || num === 0) {
        return Number(num).toFixed(2)
      }
      return '-'
    },
  },
}
</script>

<style lang="scss" scoped>
.wrapper {
  display: flex;
  flex-wrap: wrap; /* 允许换行 */
  gap: 10px; /* 控制各个 container 之间的间距 */
  font-size: 14px;
  border: 1px solid black;
  padding: 5px;
  margin-bottom: 5px;
}

.container {
  display: flex;
  flex-direction: column;
  gap: 10px; /* 控制行之间的间距 */
  flex: 1 1 130px; /* 允许 container 自适应大小并且有一个最小宽度 */
}

.row {
  display: flex;
  justify-content: flex-start; /* 左对齐 row 中的内容 */
  align-items: center;
}

.label {
  margin-right: 5px; /* 控制名称与数据之间的间距 */
}

.data {
}
</style>