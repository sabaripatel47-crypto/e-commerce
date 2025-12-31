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
          <span v-if="reqParams.sortType == 3">退款不退货的退款率:</span>
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
    <el-table
      :data="tableData"
      :row-style="rowStyle"
      style="width: 100%"
      border
      v-loading="loading"
      @row-click="rowClick"
    >
      <el-table-column prop="date" label="序号" min-width="30" type="index" align="center"></el-table-column>
      <el-table-column prop="spuName" label="货品名称" align="center"></el-table-column>
      <el-table-column prop="categoryLevelName" label="货品等级" align="center"></el-table-column>
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
      <el-table-column prop="afterRefundQuantity" label="售前退款" align="center" min-width="90">
        <!-- 自定义表头 -->
        <template #header>
          <span v-if="reqParams.sortType != 2" @click="changeType(2)">
            售前退款
            <i class="el-icon-top"></i>
          </span>
          <span style="color: #409eff; font-size: 17px" v-if="reqParams.sortType == 2">
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
              reqParams.sortType == 2
            "
          >/{{ numberToPercentage(row.afterRefundQuantityPercentage) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="refundJustRate" label="退款不退货" align="center">
        <template #header>
          <span style="color: #409eff; font-size: 17px" v-if="reqParams.sortType == 3">
            退款不退货/退款不退货(退单率/退货率)
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
        <template #header>
          <span style="color: #409eff; font-size: 17px" v-if="reqParams.sortType == 4">
            退货退款/退货退款(退单率/退货率)
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
          <span v-if="reqParams.sortType == 3">退退款不退货的退款率</span>
        </template>
        <template v-slot="{ row }">
          <span>{{ numberToPercentage(row.refundAmountRate) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="refundRate" label="总退单率/退货率" align="center">
        <template v-slot="{ row }">
          <span>{{ numberToPercentage(row.refundRate) }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column
        prop="deviation"
        label="指标偏离度"
        align="center"
      ></el-table-column>-->
      <el-table-column label="操作" width="100" align="center">
        <template v-slot="{ row, $index }">
          <el-button type="text" @click="getSPUTrend(row)">趋势</el-button>
          <el-button type="text" @click="lookBoardSpu(row)">看板</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      :autoScroll="false"
      :page.sync="reqParams.page"
      :limit.sync="reqParams.pageSize"
      @pagination="getPageList"
    />
    <el-radio-group v-model="activeChildName" @change="handleSearch">
      <el-radio-button :label="1">商品链接</el-radio-button>
      <el-radio-button :label="2">SKU</el-radio-button>
    </el-radio-group>

    <el-form class="page-search" inline style="margin-top: 10px">
      <!--时间范围 -->
      <el-form-item label="商品等级：" style="margin-right: 20px" v-if="activeChildName == 1">
        <el-select filterable v-model="reqParams2.linkLevel" clearable placeholder="请选择商品等级">
          <el-option
            v-for="item in linkLevels"
            :label="item.name"
            :value="item.code"
            :key="item.code"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="店铺：" v-if="activeChildName == 1">
        <el-select filterable v-model="reqParams2.storeUuid" clearable placeholder="请选择店铺">
          <el-option
            v-for="item in storeList"
            :key="item.code"
            :label="item.name"
            :value="item.code"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="负责人：" style="margin-right: 20px" v-if="activeChildName == 1">
        <el-cascader
          filterable
          v-model="reqParams2.managerUuid"
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
      <el-form-item label="SKU编码：" min-width="150px" align="center" v-if="activeChildName == 2">
        <el-select style="width: 100%" v-model="reqParams3.skuUuid" filterable clearable>
          <el-option
            v-for="item in skuList"
            :key="item.code"
            :label="`${item.name}(${item.extendKeyword})`"
            :value="item.code"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label min-width="150px" align="center">
        <el-button
          type="primary"
          @click="handleSearch"
          v-if="reqParams2.spuUuid != ''"
          icon="el-icon-search"
        >搜索</el-button>
      </el-form-item>
    </el-form>

    <!-- <el-radio-group v-model="sortType" @change="handleSearch">
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
      v-if="activeChildName == 1"
    >
      <el-table-column prop="date" label="序号" min-width="30" type="index" align="center"></el-table-column>
      <el-table-column prop label="主图" align="center">
        <template v-slot="{ row, $index }">
          <el-image
            v-if="row.urlUuid"
            style="height: 30px; width: 30px"
            :src="row.urlUuid + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
            :preview-src-list="[row.urlUuid]"
          ></el-image>
        </template>
      </el-table-column>
      <el-table-column prop label="商品链接" align="center">
        <template v-slot="{ row }">
          <span>({{ row.linkId }}){{ row.linkTitle }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="linkLevelName" label="商品等级" align="center">
        <template v-slot="{ row }">
          <span>{{ row.linkLevelName }}</span>
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
      <el-table-column prop="erpRefundQuantity" label="退单量/退货量" align="center" min-width="160">
        <template #header>
          <span
            :style="{
              color: reqParams2.sortType == 1 ? '#409EFF' : '',
              fontSize: reqParams2.sortType == 1 ? '17px' : '14px',
            }"
            @click="changeLinkType(1)"
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
          <span v-if="reqParams2.sortType != 2" @click="changeLinkType(2)">
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
              reqParams2.sortType == 2
            "
          >/{{ numberToPercentage(row.afterRefundQuantityPercentage) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="refundJustRate" label="退款不退货" align="center" min-width="140">
        <!-- 自定义表头 -->
        <template #header>
          <span style="color: #409eff; font-size: 17px" v-if="reqParams2.sortType == 3">
            退款不退货/退款不退货(退单率/退货率)
            <i class="el-icon-top"></i>
          </span>
          <span @click="changeLinkType(3)" v-else>
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
            v-if="row.refundJustPercentage != null && reqParams2.sortType == 3"
          >/{{ numberToPercentage(row.refundJustPercentage) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="refundGoodsAndAmountRate" label="退货退款" align="center" min-width="140">
        <!-- 自定义表头 -->
        <template #header>
          <span style="color: #409eff; font-size: 17px" v-if="reqParams2.sortType == 4">
            退货退款/退货退款(退单率/退货率)
            <i class="el-icon-top"></i>
          </span>
          <span v-else @click="changeLinkType(4)">
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
              reqParams2.sortType == 4
            "
          >/{{ numberToPercentage(row.refundGoodsAndAmountPercentage) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="orderAmount" label="销售金额" align="center" min-width="120">
        <template #header>
          <span
            :style="{
              color: reqParams2.sortType == 5 ? '#409EFF' : '',
              fontSize: reqParams2.sortType == 5 ? '17px' : '14px',
            }"
            @click="changeLinkType(5)"
          >
            销售金额
            <i class="el-icon-top"></i>
          </span>
        </template>
        <template v-slot="{ row }">
          <span>{{ row.orderAmount == null ? "-" : row.orderAmount }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="orderQuantity" label="销售数量" align="center" min-width="120">
        <template #header>
          <span
            :style="{
              color: reqParams2.sortType == 6 ? '#409EFF' : '',
              fontSize: reqParams2.sortType == 6 ? '17px' : '14px',
            }"
            @click="changeLinkType(6)"
          >
            销售数量
            <i class="el-icon-top"></i>
          </span>
        </template>
        <template v-slot="{ row }">
          <span>{{ row.orderQuantity == null ? "-" : row.orderQuantity }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="refundRate" min-width="140" align="center">
        <!-- 自定义表头 -->
        <template #header>
          <span
            v-if="
              reqParams2.sortType == 1 ||
              reqParams2.sortType == 5 ||
              reqParams2.sortType == 6
            "
          >总退款率</span>
          <span v-if="reqParams2.sortType == 2">售前退款的退款率</span>
          <span v-if="reqParams2.sortType == 4">退货退款的退款率</span>
          <span v-if="reqParams2.sortType == 3">退款不退货的退款率</span>
        </template>
        <template v-slot="{ row }">
          <span>{{ numberToPercentage(row.refundAmountRate) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="总退单率/退货率" align="center">
        <template v-slot="{ row }">
          <span>{{ numberToPercentage(row.refundRate) }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column prop="deviation" label="指标偏离度" align="center">
        <template v-slot="{ row }">
          <span>{{ row.deviation }}</span>
        </template>
      </el-table-column>-->
      <el-table-column label="操作" align="center">
        <template v-slot="{ row }">
          <el-button type="text" @click="getSPUConnTrend(row)">趋势</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <pagination
      v-show="total2 > 0 && activeChildName == 1"
      :total="total2"
      :autoScroll="false"
      :page.sync="reqParams2.page"
      :limit.sync="reqParams2.pageSize"
      @pagination="getLinkList"
    />

    <el-table
      :data="skuData"
      style="width: 100%"
      border
      height="480"
      v-loading="skuLoading"
      v-if="activeChildName == 2"
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
      <el-table-column prop="erpRefundQuantity" label="退单量/退货量" align="center" min-width="100">
        <template #header>
          <span
            :style="{
              color: reqParams3.sortType == 1 ? '#409EFF' : '',
              fontSize: reqParams3.sortType == 1 ? '17px' : '14px',
            }"
            @click="changeSkuType(1)"
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
          <span v-if="reqParams3.sortType != 2" @click="changeSkuType(2)">
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
              reqParams3.sortType == 2
            "
          >/{{ numberToPercentage(row.afterRefundQuantityPercentage) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="refundJustRate" label="退款不退货" align="center">
        <!-- 自定义表头 -->
        <template #header>
          <span style="color: #409eff; font-size: 17px" v-if="reqParams3.sortType == 3">
            退款不退货/退款不退货(退单率/退货率)
            <i class="el-icon-top"></i>
          </span>
          <span @click="changeSkuType(3)" v-else>
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
            v-if="row.refundJustPercentage != null && reqParams3.sortType == 3"
          >/{{ numberToPercentage(row.refundJustPercentage) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="refundGoodsAndAmountRate" label="退货退款" align="center">
        <!-- 自定义表头 -->
        <template #header>
          <span style="color: #409eff; font-size: 17px" v-if="reqParams3.sortType == 4">
            退货退款/退货退款(退单率/退货率)
            <i class="el-icon-top"></i>
          </span>
          <span v-else @click="changeSkuType(4)">
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
              reqParams3.sortType == 4
            "
          >/{{ numberToPercentage(row.refundGoodsAndAmountPercentage) }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="orderAmount" label="销售金额" align="center">
        <template #header>
          <span
            :style="{
              color: reqParams3.sortType == 5 ? '#409EFF' : '',
              fontSize: reqParams3.sortType == 5 ? '17px' : '14px',
            }"
            @click="changeSkuType(5)"
          >
            销售金额
            <i class="el-icon-top"></i>
          </span>
        </template>
        <template v-slot="{ row }">
          <span>
            {{
            row.orderAmount == null ? "-" : row.orderAmount
            }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="orderQuantity" label="销售数量" align="center">
        <template #header>
          <span
            :style="{
              color: reqParams3.sortType == 6 ? '#409EFF' : '',
              fontSize: reqParams3.sortType == 6 ? '17px' : '14px',
            }"
            @click="changeSkuType(6)"
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
      <el-table-column prop="refundRate" min-width="140" align="center">
        <!-- 自定义表头 -->
        <template #header>
          <span
            v-if="
              reqParams3.sortType == 1 ||
              reqParams3.sortType == 5 ||
              reqParams3.sortType == 6
            "
          >总退款率</span>
          <span v-if="reqParams3.sortType == 2">售前退款的退款率</span>
          <span v-if="reqParams3.sortType == 4">退货退款的退款率</span>
          <span v-if="reqParams3.sortType == 3">退退款不退货的退款率</span>
        </template>
        <template v-slot="{ row }">
          <span>{{ numberToPercentage(row.refundAmountRate) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="总退单率/退货率" align="center">
        <template v-slot="{ row }">
          <span>{{ numberToPercentage(row.refundRate) }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column prop="deviation" label="指标偏离度" align="center">
        <template v-slot="{ row }">
          <span>{{ row.deviation }}</span>
        </template>
      </el-table-column>-->
      <el-table-column label="操作" align="center">
        <template v-slot="{ row }">
          <el-button type="text" @click="getSPUSkuTrend(row)">趋势</el-button>
          <el-button type="text" @click="lookBoardSku(row)">看板</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <pagination
      v-show="total3 > 0 && activeChildName == 2"
      :total="total3"
      :autoScroll="false"
      :page.sync="reqParams3.page"
      :limit.sync="reqParams3.pageSize"
      @pagination="getSkuList"
    />
    <TrendChart
      @updateValue="handleValueChange"
      v-if="trendDialog && trendData != []"
      :detailDialogVisible="trendDialog"
      :dialogTitle="trendTitle"
      :tableData="trendData"
    ></TrendChart>

    <el-dialog
      :title="productTitle"
      @close="productStatusSpu"
      :visible.sync="productShowSpu"
      show-close
      fullscreen
    >
      <product-spu
        v-if="productShowSpu"
        :currentRow="searchParms"
        :selectSpuChange="selectSpuChange"
      ></product-spu>
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
  getSPUTable,
  getSPUSkuTable,
  getSPUConnTable,
  getSPUTrend,
  getSPUSkuTrend,
  getSPUConnTrend,
  getTotal,
} from '@/api/deliveryCenter/orderSummary'
import { skuPush } from '@/api/bulletinboard/statistics.js'
import { getDeptTreeData, getFormatDate } from '@/utils/common'
import { department } from '@/api/information/department'
// import { getSkuListPush } from "@/api/cargoPulling/cargoRecordDetail";
import { debounce } from 'lodash'
import ProductSpu from '@/views/bulletinboard/components/ProductSpu.vue'
import ProductSku from '@/views/bulletinboard/components/ProductSku.vue'

import { listStore, listLinkLevel } from '@/api/baseData/common'
import TrendChart from './TrendChart.vue'
export default {
  name: 'SpuView',
  components: { TrendChart, ProductSpu, ProductSku },
  data() {
    return {
      activeName: 1,
      activeName2: 1,
      // 主表请求参数
      reqParams: {
        endTime: '',
        page: 1,
        pageSize: 10,
        sortType: 1,
        spuLevel: 0,
        spuUuid: '',
        startTime: '',
        statisticsType: 0,
      },
      tableData: [],
      total: 0,
      loading: false,
      // 合计数据
      totalData: {},
      // 选择行的索引值
      selectIndex: -1,
      // 子表排序方式
      sortType: 1,
      // 商品链接/sku切换
      activeChildName: 1,
      //店铺下拉框
      storeList: [],
      //商品等级下拉框
      linkLevels: [],
      //部门人员的下拉框
      departments: [],
      // sku列表
      skuList: [],
      // 搜索加载
      selectLoading: false,
      // sku全部值
      skuTotal: 0,
      // sku下拉加载更多状态
      selectFlag: true,
      // sku请求参数
      skuParams: {
        sortType: 1,
        spuUuid: '',
        keyword: '',
        page: 1,
        pageSize: 10,
      },
      // 商品链接子表请求参数
      reqParams2: {
        endTime: '',
        linkLevel: '',
        managerUuid: '',
        page: 1,
        pageSize: 10,
        sortType: 1,
        spuUuid: '',
        startTime: '',
        statisticsType: 0,
        storeUuid: '',
      },
      linkLoading: false,
      linkData: [],
      total2: 0,
      // SKU子表请求参数
      reqParams3: {
        endTime: '',
        page: 1,
        pageSize: 10,
        skuUuid: '',
        sortType: 1,
        spuUuid: '',
        startTime: '',
        statisticsType: 0,
      },
      skuLoading: false,
      skuData: [],
      total3: 0,
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
        spuUuid: '',
      },
      // spu sku看板
      productTitle: '',
      productShowSku: false,
      productShowSpu: false,
      searchParms: {},
      selectSpuChange: false,
      selectSkuChange: false,
    }
  },
  props: {
    spuUuid: {
      type: String,
      default: '',
    },
    spuLevel: {
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
  created() {
    this.searchTable()
    this.getDeptTree()
    this.listLinkLevel()
    this.listStore()
    // this.getSkuListPush();
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
  methods: {
    // 获取主表数据
    async getPageList(page) {
      if (page == 1) {
        this.reqParams.page = 1
      }
      this.loading = true
      this.linkData = []
      this.skuData = []
      this.reqParams3.skuUuid = ''
      this.selectIndex = -1
      this.reqParams2 = this.$options.data().reqParams2
      this.skuParams = this.$options.data().skuParams
      this.reqParams.startTime = this.dateTime[0]
      this.reqParams.endTime = this.dateTime[1]
      this.reqParams.spuUuid = this.spuUuid
      this.reqParams.spuLevel = this.spuLevel
      this.reqParams.statisticsType = this.statisticsType
      const res = await getSPUTable(this.reqParams)
      this.tableData = res.data.records
      this.total = res.data.total
      this.linkData = []
      this.skuList = []
      this.skuData = []
      this.loading = false
    },

    // 获取合计数据
    async getTotal() {
      const res = await getTotal(this.reqParams)
      this.totalData = res.data
    },
    // 点击搜索获取数据
    searchTable() {
      this.reqParams.sortType = 1

      this.getPageList()
      this.getTotal()
    },
    // 切换主表排序方式
    changeType(val) {
      this.reqParams.sortType = val
      this.getPageList(1)
      this.getTotal()
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
    // 负责人组织架构数据
    async getDeptTree() {
      const res = await department()
      this.departments = await getDeptTreeData(res.data)
    },
    //商品等级的下拉框
    async listLinkLevel() {
      const res = await listLinkLevel()
      this.linkLevels = res.data
    },
    //店铺下拉框
    async listStore() {
      const res = await listStore()
      this.storeList = res.data
    },
    // 获取sku列表
    async getSkuListPush() {
      const res = await skuPush(this.skuParams.spuUuid)
      this.skuList = res.data
    },
    // // 下拉框出现时，调用过滤方法
    // async visibleChange(flag) {
    //   this.skuParams.keyword = "";
    //   this.skuParams.page = 1;
    //   if (flag) {
    //     await this.getSkuListPush();
    //   }
    //   // this.filterMethod()
    // },
    // filterMethod: debounce(async function (filterVal) {
    //   this.skuParams.page = 1;
    //   // console.log('filterVal: ', filterVal)
    //   this.selectLoading = true;
    //   this.skuParams.keyword = filterVal ? filterVal : "";
    //   await this.getSkuListPush();
    //   this.selectFlag = true;
    //   this.selectLoading = false;
    // }, 500),
    // // sku下拉框加载更多
    // async loadMore() {
    //   if (
    //     (this.skuList.length < this.skuTotal && this.selectFlag) ||
    //     this.skuList.length < this.skuTotal
    //   ) {
    //     this.skuParams.page += 1;
    //     this.selectFlag = false;
    //     let res1 = await getSkuListPush(this.skuParams);
    //     if (this.skuParams.page == 1) {
    //       this.skuList = [];
    //     }
    //     res1.data.records.forEach((item) => {
    //       if (!this.skuList.includes(item.skuUuid)) {
    //         this.skuList.push(item);
    //       }
    //     });
    //     this.skuTotal = res1.data.total;
    //     this.selectFlag = true;
    //     // console.log('this.reissueArrName', this.reissueArrName)
    //   }
    // },
    rowClick(row) {
      this.selectIndex = this.tableData.indexOf(row)
      this.trendParams.spuUuid = row.spuUuid
      this.reqParams2.spuUuid = row.spuUuid
      this.getLinkList(1)
      this.reqParams3.spuUuid = row.spuUuid
      this.skuParams.spuUuid = row.spuUuid
      this.getSkuListPush()
      this.getSkuList(1)
    },
    handleSearch() {
      if (this.activeChildName == 1 && this.reqParams2.spuUuid != '') {
        this.getLinkList(1)
      } else if (this.activeChildName == 2 && this.reqParams3.spuUuid != '') {
        this.getSkuList(1)
      }
    },
    // 获取sku子表数据
    async getSkuList(page) {
      if (page == 1) {
        this.reqParams3.page = 1
      }
      this.skuLoading = true
      this.reqParams3.statisticsType = this.statisticsType
      this.reqParams3.startTime = this.dateTime[0]
      this.reqParams3.endTime = this.dateTime[1]
      const res = await getSPUSkuTable(this.reqParams3)
      this.skuData = res.data.records
      this.total3 = res.data.total
      this.skuLoading = false
    },
    // 重制sku搜索条件
    resetSku() {
      this.skuParams.sortType = 1
      this.getSkuList(1)
    },
    // 修改sku排序方式
    changeSkuType(val) {
      this.reqParams3.sortType = val
      this.getSkuList(1)
    },
    //重制链接搜索条件
    resetLink() {
      this.reqParams2.sortType = 1
      this.getLinkList(1)
    },
    // 修改链接排序方式
    changeLinkType(val) {
      this.reqParams2.sortType = val
      this.getLinkList(1)
    },
    // 获取链接子表数据
    async getLinkList(page) {
      this.linkData = []
      if (page == 1) {
        this.reqParams2.page = 1
      }
      this.linkLoading = true
      if (Array.isArray(this.reqParams2.managerUuid)) {
        this.reqParams2.managerUuid =
          this.reqParams2.managerUuid[this.reqParams2.managerUuid.length - 1]
      }
      // this.reqParams2.sortType = this.sortType;
      this.reqParams2.statisticsType = this.statisticsType
      this.reqParams2.startTime = this.dateTime[0]
      this.reqParams2.endTime = this.dateTime[1]
      const res = await getSPUConnTable(this.reqParams2)
      this.linkData = res.data.records
      console.log('this.linkData: ', this.linkData)
      this.total2 = res.data.total
      this.$nextTick(() => {})
      this.linkLoading = false
    },
    // 保留两位小数并转成百分比
    getPercentage(num) {
      if (num == null || num == undefined) {
        return '-' // 如果值为null或undefined，返回默认值
      } else {
        let numBer = Math.floor((num * 10000).toFixed(1)) / 100 + '%'
        return numBer
      }
    },
    // 获取spu趋势图数据
    async getSPUTrend(row) {
      this.trendParams.startTime = this.dateTime[0]
      this.trendParams.endTime = this.dateTime[1]
      this.trendParams.spuUuid = row.spuUuid
      this.trendParams.statisticsType = this.statisticsType
      const res = await getSPUTrend(this.trendParams)
      this.trendData = res.data
      this.trendDialog = true
    },
    // 获取sku趋势图数据
    async getSPUSkuTrend(row) {
      this.trendParams.startTime = this.dateTime[0]
      this.trendParams.endTime = this.dateTime[1]
      this.trendParams.skuUuid = row.skuUuid
      this.trendParams.statisticsType = this.statisticsType
      const res = await getSPUSkuTrend(this.trendParams)
      this.trendData = res.data
      this.trendDialog = true
    },
    // 获取链接趋势图数据
    async getSPUConnTrend(row) {
      this.trendParams.startTime = this.dateTime[0]
      this.trendParams.endTime = this.dateTime[1]
      this.trendParams.linkId = row.linkId
      this.trendParams.statisticsType = this.statisticsType
      const res = await getSPUConnTrend(this.trendParams)
      this.trendData = res.data
      this.trendDialog = true
    },
    handleValueChange(newValue) {
      const value = newValue
      this.trendDialog = value
    },
    // 关闭看板
    productStatusSpu() {
      this.productShowSpu = false
    },
    productStatusSku() {
      this.productShowSku = false
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
          spuUuid: [row.spuUuid], //spu uuid
          spuNameArr: [], //spu名称数组
        },
        sku: {
          skuUuid: [row.skuUuid], //sku uuid
          skuCode: [], //sku编码
          skuNameArr: [], //sku名称数组
          skuCodeArr: [], //sku编码数组
        },
      })
      this.productShowSku = true
    },
    // spu看板
    lookBoardSpu(row) {
      this.productTitle = `${row.spuName}看板`
      this.selectSpuChange = false
      // console.log("row: ", row);
      // this.searchParms
      Object.assign(this.searchParms, {
        from: 'spu', //入口来源
        timeScopeArr: this.dateTime, //时间范围数组
        timeScopeType: 2, //时间范围类型
        spu: {
          spuUuid: [row.spuUuid], //spu uuid
          spuNameArr: [], //spu名称数组
        },
      })
      this.productShowSpu = true
    },
    // 数字转百分比
    numberToPercentage(value) {
      if (value === null || value === undefined || value === '') {
        return '-' // 如果值为null或undefined，返回默认值
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