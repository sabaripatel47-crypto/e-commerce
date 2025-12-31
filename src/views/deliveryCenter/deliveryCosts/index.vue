<template>
  <div class="app-container">
    <div class="filter-container">
      <el-radio-group v-model="activeName" @change="searchList()">
        <el-radio-button :label="1">SPU</el-radio-button>
        <el-radio-button :label="2">SKU</el-radio-button>
      </el-radio-group>
      <el-form :inline="true" :model="reqParams" class="demo-form-inline">
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            :clearable="false"
            type="daterange"
            align="right"
            unlink-panels
            value-format="timestamp"
            :picker-options="pickerOptions"
            @change="changeTime"
            @blur="blurTime"
          />
        </el-form-item>
        <el-form-item label="货品名称" prop style="margin-right: 20px">
          <el-select
            v-model="reqParams.spuUuid"
            filterable
            clearable
            placeholder="请选择货品名称"
            @change="getSku"
            @clear="getSku"
          >
            <el-option
              v-for="item in spuSelectList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="SKU：" v-show="activeName === 2" style="margin-right: 20px">
          <el-select
            v-model="reqParams.skuUuidList"
            filterable
            clearable
            multiple
            placeholder="请选择"
          >
            <el-option
              v-for="item in skuList"
              :key="item.code"
              :label="`(${item.name})${item.extendKeyword}`"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="产品等级" style="margin-right: 20px" v-show="activeName === 1">
          <el-select v-model="reqParams.spuLevel" filterable clearable placeholder="请选择货品等级">
            <el-option
              v-for="item in spuLevelSelectList"
              :label="item.name"
              :value="item.code"
              :key="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="searchList()">搜索</el-button>
        </el-form-item>
      </el-form>

      <!-- <el-radio-group v-model="reqParams.costType" @change="getPageList()">
        <el-radio-button
          v-for="item in sortTypeList"
          :key="item.value"
          :label="item.value"
          >{{ item.label }}</el-radio-button
        >
      </el-radio-group>-->
      <div class="wrapper">
        <div class="container">
          <div class="row">
            <span class="label">售后补偿数量:</span>
            <span class="data">
              {{
              totalData.afterSaleCompensationQuantity
              ? totalData.afterSaleCompensationQuantity
              : "-"
              }}
            </span>
          </div>
          <div class="row">
            <span class="label">售后补偿金额:</span>
            <span class="data">
              {{
              totalData.afterSaleCompensationAmount
              ? totalData.afterSaleCompensationAmount
              : "-"
              }}
            </span>
          </div>

          <div class="row">
            <span class="label">补偿均额:</span>
            <span class="data">
              {{
              totalData.afterSaleCompensationAverageAmount
              ? totalData.afterSaleCompensationAverageAmount
              : "-"
              }}
            </span>
          </div>
        </div>

        <div class="container">
          <div class="row">
            <span class="label">换货数量:</span>
            <span class="data">
              {{
              totalData.exchangeQuantity ? totalData.exchangeQuantity : "-"
              }}
            </span>
          </div>
          <div class="row">
            <span class="label">换货金额:</span>
            <span class="data">
              {{
              totalData.exchangeAmount ? totalData.exchangeAmount : "-"
              }}
            </span>
          </div>

          <div class="row">
            <span class="label">换发均额:</span>
            <span class="data">
              {{
              totalData.exchangeAverageAmount
              ? totalData.exchangeAverageAmount
              : "-"
              }}
            </span>
          </div>
        </div>
        <div class="container">
          <div class="row">
            <span class="label">订单数量:</span>
            <span class="data">
              {{
              totalData.orderQuantity ? totalData.orderQuantity : "-"
              }}
            </span>
          </div>
          <div class="row">
            <span class="label">订单金额:</span>
            <span class="data">
              {{
              totalData.orderAmount ? totalData.orderAmount : "-"
              }}
            </span>
          </div>

          <div class="row">
            <span class="label">商品数量:</span>
            <span class="data">
              {{
              totalData.orderNumber ? totalData.orderNumber : "-"
              }}
            </span>
          </div>
        </div>

        <div class="container">
          <div class="row">
            <span class="label">退款数量:</span>
            <span class="data">
              {{
              totalData.refundQuantity ? totalData.refundQuantity : "-"
              }}
            </span>
          </div>
          <div class="row">
            <span class="label">退款金额:</span>
            <span class="data">
              {{
              totalData.refundAmount ? totalData.refundAmount : "-"
              }}
            </span>
          </div>

          <div class="row">
            <span class="label">退款均额:</span>
            <span class="data">
              {{
              totalData.refundAverageAmount
              ? toFixed2(totalData.refundAverageAmount)
              : "-"
              }}
            </span>
          </div>
        </div>

        <div class="container">
          <div class="row">
            <span class="label">补发数量:</span>
            <span class="data">
              {{
              totalData.reissueQuantity ? totalData.reissueQuantity : "-"
              }}
            </span>
          </div>
          <div class="row">
            <span class="label">补发金额:</span>
            <span class="data">
              {{
              totalData.reissueAmount ? totalData.reissueAmount : "-"
              }}
            </span>
          </div>

          <div class="row">
            <span class="label">补发均额:</span>
            <span class="data">
              {{
              totalData.reissueAverageAmount
              ? totalData.reissueAverageAmount
              : "-"
              }}
            </span>
          </div>
        </div>

        <div class="container">
          <div class="row">
            <span class="label">缺货赔偿数量:</span>
            <span class="data">
              {{
              totalData.shortageCompensationQuantity
              ? totalData.shortageCompensationQuantity
              : "-"
              }}
            </span>
          </div>
          <div class="row">
            <span class="label">缺货赔偿金额:</span>
            <span class="data">
              {{
              totalData.shortageCompensationAmount
              ? totalData.shortageCompensationAmount
              : "-"
              }}
            </span>
          </div>

          <div class="row">
            <span class="label">赔偿均额:</span>
            <span class="data">
              {{
              totalData.shortageCompensationAverageAmount
              ? totalData.shortageCompensationAverageAmount
              : "-"
              }}
            </span>
          </div>
        </div>

        <div class="container">
          <div class="row">
            <span class="label">售后线下返款:</span>
            <span class="data">
              {{
              totalData.afterSaleOfflineReturnAmount
              ? totalData.afterSaleOfflineReturnAmount
              : "-"
              }}
            </span>
          </div>
          <div class="row">
            <span class="label">交付售后成本:</span>
            <span class="data">
              {{
              totalData.deliveryCost ? totalData.deliveryCost : "-"
              }}
            </span>
          </div>

          <div class="row">
            <span class="label">交付占比:</span>
            <span class="data">
              {{
              totalData.deliveryProportion
              ? toPercent(totalData.deliveryProportion)
              : "-"
              }}
            </span>
          </div>
        </div>

        <div class="container">
          <div class="row">
            <span class="label">总数:</span>
            <span class="data">
              {{
              totalData.totalQuantity ? totalData.totalQuantity : "-"
              }}
            </span>
          </div>
          <div class="row">
            <span class="label">合计费用:</span>
            <span class="data">
              {{
              totalData.totalCost ? totalData.totalCost : "-"
              }}
            </span>
          </div>

          <div class="row">
            <span class="label">总均额:</span>
            <span class="data">
              {{
              totalData.totalAverageAmount ? totalData.totalAverageAmount : "-"
              }}
            </span>
          </div>
        </div>
        <div class="container">
          <div class="row">
            <span class="label">平台+售后分摊:</span>
            <span class="data">
              {{
              totalData.platformAfterSaleShareAmount
              ? totalData.platformAfterSaleShareAmount
              : "-"
              }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div>
      <!-- spu表格 -->
      <el-table
        v-if="activeName == 1"
        :data="tableData"
        style="width: 100%"
        v-loading="tableLoading"
        height="400"
        @row-click="tableRowClick"
        :span-method="spuMethod"
      >
        <el-table-column type="index" label="序号" width="50" align="center"></el-table-column>
        <el-table-column label="货品名称" width="140" prop="spuShowName" align="center"></el-table-column>
        <el-table-column label="货品等级" prop="categoryLevelName" align="center"></el-table-column>
        <el-table-column width="120" label="销售额" prop="orderAmount" align="center">
          <template v-slot="{ row }">
            {{
            nullToComponent(row.orderAmount)
            }}
          </template>
        </el-table-column>
        <el-table-column width="120" label="销售量" prop="orderNumber" align="center">
          <template v-slot="{ row }">
            {{
            nullToComponent(row.orderNumber)
            }}
          </template>
        </el-table-column>
        <el-table-column width="120" label="订单量" prop="orderQuantity" align="center">
          <template v-slot="{ row }">
            {{
            nullToComponent(row.orderQuantity)
            }}
          </template>
        </el-table-column>
        <el-table-column label="补发数量" prop="reissueQuantity" align="center" min-width="120">
          <template #header>
            <span
              :style="{
                color: reqParams.costType == 7 ? '#409EFF' : '',
                fontSize: reqParams.costType == 7 ? '17px' : '14px',
              }"
              @click="sortChange(7)"
            >
              补发数量
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template v-slot="{ row }">
            {{
            nullToComponent(row.reissueQuantity)
            }}
          </template>
        </el-table-column>
        <el-table-column label="补发金额" prop="reissueAmount" align="center" min-width="120">
          <template #header>
            <span
              :style="{
                color: reqParams.costType == 77 ? '#409EFF' : '',
                fontSize: reqParams.costType == 77 ? '17px' : '14px',
              }"
              @click="sortChange(77)"
            >
              补发金额
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template v-slot="{ row }">
            {{
            nullToComponent(row.reissueAmount)
            }}
          </template>
        </el-table-column>
        <el-table-column label="补发均额" prop="reissueAverageAmount" align="center">
          <template v-slot="{ row }">
            {{
            nullToComponent(row.reissueAverageAmount)
            }}
          </template>
        </el-table-column>
        <el-table-column label="换货数量" prop="exchangeQuantity" align="center" min-width="120">
          <template #header>
            <span
              :style="{
                color: reqParams.costType == 6 ? '#409EFF' : '',
                fontSize: reqParams.costType == 6 ? '17px' : '14px',
              }"
              @click="sortChange(6)"
            >
              换货数量
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template v-slot="{ row }">
            {{
            nullToComponent(row.exchangeQuantity)
            }}
          </template>
        </el-table-column>
        <el-table-column label="换货金额" prop="exchangeAmount" align="center" min-width="120">
          <template #header>
            <span
              :style="{
                color: reqParams.costType == 66 ? '#409EFF' : '',
                fontSize: reqParams.costType == 66 ? '17px' : '14px',
              }"
              @click="sortChange(66)"
            >
              换货金额
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template v-slot="{ row }">
            {{
            nullToComponent(row.exchangeAmount)
            }}
          </template>
        </el-table-column>
        <el-table-column label="换货均额" prop="exchangeAverageAmount	" align="center">
          <template v-slot="{ row }">
            {{
            nullToComponent(row.exchangeAverageAmount)
            }}
          </template>
        </el-table-column>
        <el-table-column label="退款数量" prop="refundQuantity" align="center" min-width="120">
          <template #header>
            <span
              :style="{
                color: reqParams.costType == 5 ? '#409EFF' : '',
                fontSize: reqParams.costType == 5 ? '17px' : '14px',
              }"
              @click="sortChange(5)"
            >
              退款数量
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template v-slot="{ row }">
            {{
            nullToComponent(row.refundQuantity)
            }}
          </template>
        </el-table-column>
        <el-table-column label="退款金额" prop="refundAmount" align="center" min-width="120">
          <template #header>
            <span
              :style="{
                color: reqParams.costType == 55 ? '#409EFF' : '',
                fontSize: reqParams.costType == 55 ? '17px' : '14px',
              }"
              @click="sortChange(55)"
            >
              退款金额
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template v-slot="{ row }">
            {{
            nullToComponent(row.refundAmount)
            }}
          </template>
        </el-table-column>
        <el-table-column label="退款均额" prop="refundAverageAmount" align="center">
          <template v-slot="{ row }">
            {{
            nullToComponent(row.refundAverageAmount)
            }}
          </template>
        </el-table-column>
        <el-table-column
          label="缺货赔偿数量"
          prop="shortageCompensationQuantity"
          width="140"
          align="center"
        >
          <template #header>
            <span
              :style="{
                color: reqParams.costType == 11 ? '#409EFF' : '',
                fontSize: reqParams.costType == 11 ? '17px' : '14px',
              }"
              @click="sortChange(11)"
            >
              缺货赔偿数量
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template v-slot="{ row }">
            {{
            nullToComponent(row.shortageCompensationQuantity)
            }}
          </template>
        </el-table-column>
        <el-table-column
          label="缺货赔偿金额"
          width="140"
          prop="shortageCompensationAmount"
          align="center"
        >
          <template #header>
            <span
              :style="{
                color: reqParams.costType == 111 ? '#409EFF' : '',
                fontSize: reqParams.costType == 111 ? '17px' : '14px',
              }"
              @click="sortChange(111)"
            >
              缺货赔偿金额
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template v-slot="{ row }">
            {{
            nullToComponent(row.shortageCompensationAmount)
            }}
          </template>
        </el-table-column>
        <el-table-column
          label="赔偿均额"
          width="140"
          prop="shortageCompensationAverageAmount"
          align="center"
        >
          <template v-slot="{ row }">
            {{
            nullToComponent(row.shortageCompensationAverageAmount)
            }}
          </template>
        </el-table-column>
        <el-table-column
          label="售后补偿数量"
          width="140"
          prop="afterSaleCompensationQuantity"
          align="center"
        >
          <template #header>
            <span
              :style="{
                color: reqParams.costType == 12 ? '#409EFF' : '',
                fontSize: reqParams.costType == 12 ? '17px' : '14px',
              }"
              @click="sortChange(12)"
            >
              售后补偿数量
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template v-slot="{ row }">
            {{
            nullToComponent(row.afterSaleCompensationQuantity)
            }}
          </template>
        </el-table-column>
        <el-table-column
          label="售后补偿金额"
          width="140"
          prop="afterSaleCompensationAmount"
          align="center"
        >
          <template #header>
            <span
              :style="{
                color: reqParams.costType == 122 ? '#409EFF' : '',
                fontSize: reqParams.costType == 122 ? '17px' : '14px',
              }"
              @click="sortChange(122)"
            >
              售后补偿金额
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template v-slot="{ row }">
            {{
            nullToComponent(row.afterSaleCompensationAmount)
            }}
          </template>
        </el-table-column>
        <el-table-column
          label="补偿均额"
          width="120"
          prop="afterSaleCompensationAverageAmount"
          align="center"
        >
          <template v-slot="{ row }">
            {{
            nullToComponent(row.afterSaleCompensationAverageAmount)
            }}
          </template>
        </el-table-column>
        <el-table-column
          label="售后线下返款"
          width="120"
          prop="afterSaleOfflineReturnAmount"
          align="center"
        >
          <template v-slot="{ row }">
            {{
            nullToComponent(row.afterSaleOfflineReturnAmount)
            }}
          </template>
        </el-table-column>
        <el-table-column
          label="平台+售后分摊"
          width="120"
          prop="platformAfterSaleShareAmount"
          align="center"
        >
          <template v-slot="{ row }">
            {{
            nullToComponent(row.platformAfterSaleShareAmount)
            }}
          </template>
        </el-table-column>

        <el-table-column label="总数" prop="totalQuantity" align="center">
          <template v-slot="{ row }">
            {{
            nullToComponent(row.totalQuantity)
            }}
          </template>
        </el-table-column>
        <el-table-column label="总均额" prop="totalAverageAmount" align="center">
          <template v-slot="{ row }">
            {{
            nullToComponent(row.totalAverageAmount)
            }}
          </template>
        </el-table-column>
        <el-table-column label="交付占比" prop="deliveryProportion" align="center">
          <template v-slot="{ row }">
            {{
            toPercent(row.deliveryProportion)
            }}
          </template>
        </el-table-column>

        <el-table-column label="合计费用" prop="totalCost" align="center">
          <template v-slot="{ row }">
            {{
            nullToComponent(row.totalCost)
            }}
          </template>
        </el-table-column>
        <el-table-column width="120" label="交付售后成本" prop="deliveryCost" align="center">
          <template v-slot="{ row }">
            {{
            nullToComponent(row.deliveryCost)
            }}
          </template>
        </el-table-column>
        <el-table-column width="120" label="操作" align="center">
          <template v-slot="{ row }">
            <el-button type="text" size="small" @click="toSkuDetail(row)">明细</el-button>
            <el-button type="text" size="small" @click="lookBoardSpu(row)">看板</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <pagination
        v-if="activeName == 1"
        v-show="total > 0"
        :total="total"
        :page.sync="reqParams.page"
        :limit.sync="reqParams.pageSize"
        @pagination="getSpuList"
      />
    </div>
    <div>
      <!-- sku表格 -->
      <el-table
        v-if="activeName == 2"
        :data="tableData"
        style="width: 100%"
        v-loading="tableLoading"
        height="400"
        @row-click="tableRowClick"
        :span-method="skuMethod"
      >
        <el-table-column type="index" label="序号" width="50" align="center"></el-table-column>
        <el-table-column label="SKU编号" width="140" prop="skuCode" align="center"></el-table-column>
        <el-table-column label="SKU名称" width="140" prop="spaceName" align="center"></el-table-column>
        <el-table-column prop="skuUrl" label="SKU图片" min-width="100" align="center">
          <template v-slot="{ row }">
            <el-image
              v-if="row.skuImageUrl || row.skuImageUrl == []"
              style="height: 30px; width: 30px"
              :src="
                row.skuImageUrl +
                '?x-oss-process=image/resize,w_30,h_30,limit_0'
              "
              :preview-src-list="[row.skuImageUrl]"
            ></el-image>
            <span v-else>暂无主图</span>
          </template>
        </el-table-column>
        <el-table-column label="货品名称" width="140" prop="spuShowName" align="center">
          <template v-slot="{ row }">
            <span>{{ row.spuShowName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="供应商" prop="supplierListName" align="center">
          <template v-slot="{ row }">
            <div v-for="(item, index) in row.supplierListName" :key="item.uuid">
              <span>{{ item.supplierName }}</span>
              <span v-if="index !== row.supplierListName.length - 1">,</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column width="120" label="销售额" prop="orderAmount" align="center">
          <template v-slot="{ row }">
            {{
            nullToComponent(row.orderAmount)
            }}
          </template>
        </el-table-column>
        <el-table-column width="120" label="销售量" prop="orderNumber" align="center">
          <template v-slot="{ row }">
            {{
            nullToComponent(row.orderNumber)
            }}
          </template>
        </el-table-column>
        <el-table-column width="120" label="订单量" prop="orderQuantity" align="center">
          <template v-slot="{ row }">
            {{
            nullToComponent(row.orderQuantity)
            }}
          </template>
        </el-table-column>
        <el-table-column label="补发数量" prop="reissueQuantity" align="center" min-width="120">
          <template #header>
            <span
              :style="{
                color: reqParams.costType == 7 ? '#409EFF' : '',
                fontSize: reqParams.costType == 7 ? '17px' : '14px',
              }"
              @click="sortChange(7)"
            >
              补发数量
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template v-slot="{ row }">
            {{
            nullToComponent(row.reissueQuantity)
            }}
          </template>
        </el-table-column>
        <el-table-column label="补发金额" prop="reissueAmount" align="center" min-width="120">
          <template #header>
            <span
              :style="{
                color: reqParams.costType == 77 ? '#409EFF' : '',
                fontSize: reqParams.costType == 77 ? '17px' : '14px',
              }"
              @click="sortChange(77)"
            >
              补发金额
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template v-slot="{ row }">
            {{
            nullToComponent(row.reissueAmount)
            }}
          </template>
        </el-table-column>
        <el-table-column label="补发均额" prop="reissueAverageAmount" align="center">
          <template v-slot="{ row }">
            {{
            nullToComponent(row.reissueAverageAmount)
            }}
          </template>
        </el-table-column>
        <el-table-column label="换货数量" prop="exchangeQuantity" align="center" min-width="120">
          <template #header>
            <span
              :style="{
                color: reqParams.costType == 6 ? '#409EFF' : '',
                fontSize: reqParams.costType == 6 ? '17px' : '14px',
              }"
              @click="sortChange(6)"
            >
              换货数量
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template v-slot="{ row }">
            {{
            nullToComponent(row.exchangeQuantity)
            }}
          </template>
        </el-table-column>
        <el-table-column label="换货金额" prop="exchangeAmount" align="center" min-width="120">
          <template #header>
            <span
              :style="{
                color: reqParams.costType == 66 ? '#409EFF' : '',
                fontSize: reqParams.costType == 66 ? '17px' : '14px',
              }"
              @click="sortChange(66)"
            >
              换货金额
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template v-slot="{ row }">
            {{
            nullToComponent(row.exchangeAmount)
            }}
          </template>
        </el-table-column>
        <el-table-column label="换货均额" prop="exchangeAverageAmount	" align="center">
          <template v-slot="{ row }">
            {{
            nullToComponent(row.exchangeAverageAmount)
            }}
          </template>
        </el-table-column>
        <el-table-column label="退款数量" prop="refundQuantity" align="center" min-width="120">
          <template #header>
            <span
              :style="{
                color: reqParams.costType == 5 ? '#409EFF' : '',
                fontSize: reqParams.costType == 5 ? '17px' : '14px',
              }"
              @click="sortChange(5)"
            >
              退款数量
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template v-slot="{ row }">
            {{
            nullToComponent(row.refundQuantity)
            }}
          </template>
        </el-table-column>
        <el-table-column label="退款金额" prop="refundAmount" align="center" min-width="120">
          <template #header>
            <span
              :style="{
                color: reqParams.costType == 55 ? '#409EFF' : '',
                fontSize: reqParams.costType == 55 ? '17px' : '14px',
              }"
              @click="sortChange(55)"
            >
              退款金额
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template v-slot="{ row }">
            {{
            nullToComponent(row.refundAmount)
            }}
          </template>
        </el-table-column>
        <el-table-column label="退款均额" prop="refundAverageAmount" align="center">
          <template v-slot="{ row }">
            {{
            nullToComponent(row.refundAverageAmount)
            }}
          </template>
        </el-table-column>
        <el-table-column
          label="缺货赔偿数量"
          prop="shortageCompensationQuantity"
          width="140"
          align="center"
        >
          <template #header>
            <span
              :style="{
                color: reqParams.costType == 11 ? '#409EFF' : '',
                fontSize: reqParams.costType == 11 ? '17px' : '14px',
              }"
              @click="sortChange(11)"
            >
              缺货赔偿数量
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template v-slot="{ row }">
            {{
            nullToComponent(row.shortageCompensationQuantity)
            }}
          </template>
        </el-table-column>
        <el-table-column
          label="缺货赔偿金额"
          width="140"
          prop="shortageCompensationAmount"
          align="center"
        >
          <template #header>
            <span
              :style="{
                color: reqParams.costType == 111 ? '#409EFF' : '',
                fontSize: reqParams.costType == 111 ? '17px' : '14px',
              }"
              @click="sortChange(111)"
            >
              缺货赔偿金额
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template v-slot="{ row }">
            {{
            nullToComponent(row.shortageCompensationAmount)
            }}
          </template>
        </el-table-column>
        <el-table-column
          label="赔偿均额"
          width="140"
          prop="shortageCompensationAverageAmount"
          align="center"
        >
          <template v-slot="{ row }">
            {{
            nullToComponent(row.shortageCompensationAverageAmount)
            }}
          </template>
        </el-table-column>
        <el-table-column
          label="售后补偿数量"
          width="140"
          prop="afterSaleCompensationQuantity"
          align="center"
        >
          <template #header>
            <span
              :style="{
                color: reqParams.costType == 12 ? '#409EFF' : '',
                fontSize: reqParams.costType == 12 ? '17px' : '14px',
              }"
              @click="sortChange(12)"
            >
              售后补偿数量
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template v-slot="{ row }">
            {{
            nullToComponent(row.afterSaleCompensationQuantity)
            }}
          </template>
        </el-table-column>
        <el-table-column
          label="售后补偿金额"
          width="140"
          prop="afterSaleCompensationAmount"
          align="center"
        >
          <template #header>
            <span
              :style="{
                color: reqParams.costType == 122 ? '#409EFF' : '',
                fontSize: reqParams.costType == 122 ? '17px' : '14px',
              }"
              @click="sortChange(122)"
            >
              售后补偿金额
              <i class="el-icon-top"></i>
            </span>
          </template>
          <template v-slot="{ row }">
            {{
            nullToComponent(row.afterSaleCompensationAmount)
            }}
          </template>
        </el-table-column>
        <el-table-column
          label="补偿均额"
          width="120"
          prop="afterSaleCompensationAverageAmount"
          align="center"
        >
          <template v-slot="{ row }">
            {{
            nullToComponent(row.afterSaleCompensationAverageAmount)
            }}
          </template>
        </el-table-column>
        <el-table-column
          label="售后线下返款"
          width="120"
          prop="afterSaleOfflineReturnAmount"
          align="center"
        >
          <template v-slot="{ row }">
            {{
            nullToComponent(row.afterSaleOfflineReturnAmount)
            }}
          </template>
        </el-table-column>
        <el-table-column
          label="平台+售后分摊"
          width="120"
          prop="platformAfterSaleShareAmount"
          align="center"
        >
          <template v-slot="{ row }">
            {{
            nullToComponent(row.platformAfterSaleShareAmount)
            }}
          </template>
        </el-table-column>
        <el-table-column label="总数" prop="totalQuantity" align="center">
          <template v-slot="{ row }">
            {{
            nullToComponent(row.totalQuantity)
            }}
          </template>
        </el-table-column>
        <el-table-column label="总均额" prop="totalAverageAmount" align="center">
          <template v-slot="{ row }">
            {{
            nullToComponent(row.totalAverageAmount)
            }}
          </template>
        </el-table-column>
        <el-table-column label="交付占比" prop="deliveryProportion" align="center">
          <template v-slot="{ row }">
            {{
            toPercent(row.deliveryProportion)
            }}
          </template>
        </el-table-column>
        <el-table-column label="合计费用" prop="totalCost" align="center">
          <template v-slot="{ row }">
            {{
            nullToComponent(row.totalCost)
            }}
          </template>
        </el-table-column>
        <el-table-column width="120" label="交付售后成本" prop="deliveryCost" align="center">
          <template v-slot="{ row }">
            {{
            nullToComponent(row.deliveryCost)
            }}
          </template>
        </el-table-column>

        <el-table-column width="120" label="操作" align="center">
          <template v-slot="{ row, $index }">
            <el-button type="text" size="small" @click="lookBoardSku(row)">看板</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <pagination
        v-if="activeName == 2"
        v-show="total > 0"
        :total="total"
        :page.sync="reqParams.page"
        :limit.sync="reqParams.pageSize"
        @pagination="getSkuList"
      />
    </div>

    <div class="table-content">
      <!-- 产品下订单列表 -->
      <el-table :data="orderTableData" v-loading="orderTableLoading" height="400">
        <el-table-column type="index" label="序号" width="50" align="center"></el-table-column>
        <el-table-column label="订单编号" prop="erpOrderId" align="center"></el-table-column>
        <el-table-column label="店铺名称" min-width="200" align="center">
          <template v-slot="{ row }">
            {{
            row.platformName +
            "(" +
            (row.storeCode || "-") +
            ")" +
            row.storeName
            }}
          </template>
        </el-table-column>
        <el-table-column label="商品编号" prop="linkId" align="center">
          <template v-slot="{ row }">{{ row.linkId || "-" }}</template>
        </el-table-column>
        <el-table-column label="商品名称" prop="linkTitle" align="center">
          <template v-slot="{ row }">{{ row.linkTitle || "-" }}</template>
        </el-table-column>
        <el-table-column label="飞梭图片" align="center">
          <template v-slot="{ row }">
            <el-image
              v-if="row.feiSuoImageAddress || row.feiSuoImageAddress == []"
              style="height: 30px; width: 30px"
              :src="
                row.feiSuoImageAddress +
                '?x-oss-process=image/resize,w_30,h_30,limit_0'
              "
              :preview-src-list="[row.feiSuoImageAddress]"
            ></el-image>
            <span v-else>暂无主图</span>
          </template>
        </el-table-column>
        <el-table-column label="类型" prop="costType" align="center"></el-table-column>
        <el-table-column label="文字描述" prop="descriptionList" align="center"></el-table-column>
        <el-table-column label="数量" prop="num" align="center"></el-table-column>
        <el-table-column label="金额(元)" prop="amount" align="center"></el-table-column>
      </el-table>

      <pagination
        v-show="orderTableTotal > 0"
        :total="orderTableTotal"
        :page.sync="orderReqParams.page"
        :limit.sync="orderReqParams.pageSize"
        @pagination="getOrderTableList"
      />
    </div>
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
import { listSpuName, listSpuLevel } from '@/api/baseData/common'
import { addDay, addDayEnd, nullToComponent } from '@/utils/common'
import {
  getDeliveryCostToLinkList, // 获取产品下链接维度列表
  getDeliveryCostToOrderList, // 获取产品下订单维度列表
  getDeliveryCostToSpuList, // 获取产品维度的列表
  getDeliveryCostToSkuList,
  getTotal,
} from '@/api/deliveryCenter/deliveryCosts'
import ProductSpu from '@/views/bulletinboard/components/ProductSpu.vue'
import ProductSku from '@/views/bulletinboard/components/ProductSku.vue'
import { skuCodeToProductCode } from '@/api/purchasingManagement/purchaseRecord'

export default {
  name: 'DeliveryCosts',
  data() {
    return {
      // 时间范围
      dateRange: [],
      // 选中的开始时间
      startPickerTime: '',
      // 货品名称下拉框
      spuSelectList: [],
      // 货品等级下拉框
      spuLevelSelectList: [],

      // 总列表
      tableData: [], // 数据
      // 合计数据
      totalData: {},
      tableLoading: false, // 加载状态
      total: 0, // 总条数
      // 交付费用明细列表
      reqParams: {
        costType: 6, // 排序方式 默认是换货数量 -- 6
        endTime: '',
        formatType: 2, // 1年月，2年月日
        page: 1,
        pageSize: 20,
        spuLevel: null,
        spuUuid: '',
        startTime: '',
        skuUuidList: [],
      },

      // 订单列表
      orderTableData: [], // 数据
      orderTableLoading: false, // 加载状态
      orderTableTotal: 0, // 总条数
      orderReqParams: {
        page: 0,
        pageSize: 20,
        spuUuid: '',
      },

      activeName: 1,
      // sku列表
      skuList: [],
      skuUuid: '',

      // spu下拉框是否可以更改
      selectSpuChange: false,
      // 看板dialog标题
      productTitle: '',
      // 看板是否显示
      productShowSpu: false,
      // 看板是否显示
      productShowSku: false,
      // sku下拉框是否可以更改
      selectSkuChange: false,
      // 看板参数
      searchParms: {
        from: null, //入口来源
        timeScopeArr: [], //时间范围数组
        timeScopeType: 2, //时间范围类型
        spu: {
          spuUuid: [], //spu uuid
          spuNameArr: [], //spu名称数组
        },
        sku: {
          skuUuid: [], //sku uuid
          skuCode: [], //sku编码
          skuNameArr: [], //sku名称数组
          skuCodeArr: [], //sku编码数组
        },
      },

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
          if (!this.startPickerTime) return time.getTime() > Date.now()
          const now = this.startPickerTime
          // 31 * 24 * 3600 * 1000 是31天的毫秒数
          const minTime = now - 31 * 24 * 3600 * 1000
          const maxTime = now + 31 * 24 * 3600 * 1000

          // 限制选择的时间范围是一个月 并且不能选择今天以后的日期
          return (
            time.getTime() < minTime ||
            time.getTime() > maxTime ||
            time.getTime() > Date.now()
          )
        },
      },

      // 排序方式列表
      sortTypeList: [
        {
          label: '换货数量',
          value: 6,
        },
        {
          label: '换货金额',
          value: 66,
        },
        {
          label: '补发数量',
          value: 7,
        },
        {
          label: '补发金额',
          value: 77,
        },
        {
          label: '退款数量',
          value: 5,
        },
        {
          label: '退款金额',
          value: 55,
        },
        {
          label: '缺货赔偿数量',
          value: 11,
        },
        {
          label: '缺货赔偿金额',
          value: 111,
        },
        {
          label: '售后补偿数量',
          value: 12,
        },
        {
          label: '售后补偿金额',
          value: 122,
        },
      ],
    }
  },
  components: {
    ProductSku,
    ProductSpu,
  },
  created() {
    // 如果是接口跳转过来的取跳转的值
    const query = this.$route.query
    // 给时间范围赋默认值
    if (query.startTime) {
      this.reqParams.startTime = query.startTime
      this.reqParams.endTime = query.endTime
    } else {
      this.reqParams.startTime = addDay(-7)
      this.reqParams.endTime = addDayEnd(-1)
    }

    this.dateRange.push(this.reqParams.startTime)
    this.dateRange.push(this.reqParams.endTime)

    // 获取下拉框数据
    this.getSpuSelectList() // 货品名称
    this.getSpuLevelSelectList() // 货品等级

    // 获取列表数据
    this.clickSearch()
  },
  methods: {
    // 获取合计数据
    async getTotal() {
      const res = await getTotal(this.reqParams)
      this.totalData = res.data || {}
    },
    nullToComponent(val) {
      return nullToComponent(val)
    },

    // 父表格行点击事件
    async tableRowClick(val) {
      this.skuUuid = val.skuUuid
      this.orderReqParams.spuUuid = val.spuUuid
      await this.getOrderTableList()
    },

    // 点击搜索
    clickSearch() {
      this.reqParams.spuUuid = ''
      this.reqParams.skuUuidList = []
      this.reqParams.spuLevel = ''
      this.reqParams.costType = 6
      this.reqParams.page = 1
      console.log('this.reqParams: ', this.reqParams)
      this.getTotal()
      this.getPageList()
    },
    // 切换排序
    sortChange(val) {
      this.reqParams.costType = val
      this.getPageList()
      this.getTotal()
    },
    // 搜索
    searchList() {
      this.reqParams.costType = 6
      this.getTotal()
      this.getPageList()
    },
    getPageList() {
      this.reqParams.page = 1
      if (this.activeName == 1) {
        this.getSpuList()
      } else {
        this.getSkuList()
      }
    },

    // 获取spu列表数据
    async getSpuList() {
      this.tableLoading = true
      const res = await getDeliveryCostToSpuList(this.reqParams)
      this.tableData = res.data.records
      this.total = res.data.total
      this.tableLoading = false

      // 置空子列表的数据
      this.orderTableData = []
      this.orderTableTotal = 0
      this.orderReqParams.spuUuid = ''
      this.skuUuid = ''
    },
    // 获取sku列表数据
    async getSkuList() {
      this.tableLoading = true
      const res = await getDeliveryCostToSkuList(this.reqParams)
      this.tableData = res.data.records
      this.total = res.data.total
      this.tableLoading = false

      // 置空子列表的数据
      this.orderTableData = []
      this.orderTableTotal = 0
      this.orderReqParams.spuUuid = ''
      this.skuUuid = ''
    },
    // spu跳转sku
    async toSkuDetail(row) {
      this.activeName = 2
      this.reqParams.spuUuid = row.spuUuid
      if (this.reqParams.spuUuid != '') {
        this.getSku()
      }
      this.tableLoading = true
      const res = await getDeliveryCostToSkuList(this.reqParams)
      this.tableData = res.data.records
      this.total = res.data.total
      this.tableLoading = false

      // 置空子列表的数据
      this.orderTableData = []
      this.orderTableTotal = 0
      this.orderReqParams.spuUuid = ''
      this.skuUuid = ''
    },

    lookBoardSpu(row) {
      this.productTitle = `${row.spuShowName}看板`
      this.selectSpuChange = false
      // console.log("row: ", row);
      // this.searchParms
      Object.assign(this.searchParms, {
        from: 'spu', //入口来源
        timeScopeArr: this.dateRange, //时间范围数组
        timeScopeType: 2, //时间范围类型
        spu: {
          spuUuid: [row.spuUuid], //spu uuid
          spuNameArr: [row.spuShowName], //spu名称数组
        },
      })
      this.productShowSpu = true
    },
    // sku看板
    lookBoardSku(row) {
      this.productTitle = `${row.skuCode}(${row.spaceName})看板`
      this.selectSpuChange = false
      this.selectSkuChange = false
      // console.log("row: ", row);
      // this.searchParms
      Object.assign(this.searchParms, {
        from: 'sku', //入口来源
        timeScopeArr: this.dateRange, //时间范围数组
        timeScopeType: 2, //时间范围类型
        spu: {
          spuUuid: [row.spuUuid], //spu uuid
          spuNameArr: [], //spu名称数组
        },
        sku: {
          skuUuid: [row.skuUuid], //sku uuid
          skuCode: [row.skuCode], //sku编码
          skuNameArr: [row.specsName], //sku名称数组
          skuCodeArr: [], //sku编码数组
        },
      })
      this.productShowSku = true
    },
    // 关闭看板
    productStatusSpu() {
      this.productShowSpu = false
    },
    productStatusSku() {
      this.productShowSku = false
    },

    // 获取订单列表数据
    async getOrderTableList() {
      this.orderTableLoading = true
      // 组装接口入参
      const reqParams = {
        costType: this.reqParams.costType,
        endTime: this.reqParams.endTime,
        formatType: this.reqParams.formatType,
        page: this.orderReqParams.page,
        pageSize: this.orderReqParams.pageSize,
        spuLevel: this.reqParams.spuLevel,
        spuUuid: this.orderReqParams.spuUuid,
        startTime: this.reqParams.startTime,
        skuUuid: this.skuUuid,
      }
      const res = await getDeliveryCostToOrderList(reqParams)
      this.orderTableData = res.data.records
      this.orderTableTotal = res.data.total
      this.orderTableLoading = false
    },

    // 选择时间
    changeTime(val) {
      if (val) {
        this.reqParams.startTime = val[0]
        this.reqParams.endTime = val[1]
      }
    },

    // 时间选择失焦时将startPickerTime置空 目的是清除禁用的时间范围
    blurTime() {
      this.startPickerTime = ''
    },

    // 获取货品名称下拉框数据
    async getSpuSelectList() {
      const res = await listSpuName()
      this.spuSelectList = res.data
    },
    // SKU下拉
    async getSku() {
      this.skuList = []
      this.reqParams.skuUuidList = []
      if (this.reqParams.spuUuid != '') {
        const res = await skuCodeToProductCode(this.reqParams.spuUuid)
        this.skuList = res.data
      }
    },
    // 获取货品等级下拉框数据
    async getSpuLevelSelectList() {
      const res = await listSpuLevel()
      this.spuLevelSelectList = res.data
    },
    // 转为百分比保留两位小数
    toPercent(num) {
      if (num || num === 0) {
        return (num * 100).toFixed(2) + '%'
      }
      return '-'
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
.table-content {
  width: 100%;
  margin-top: 20px;
}
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