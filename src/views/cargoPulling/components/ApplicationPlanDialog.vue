<template>
  <el-dialog
    :visible="visible"
    width="80%"
    :modal="true"
    @close="close"
    append-to-body
  >
    <el-table border :data="data" center style="width: 100%" max-height="400">
      <el-table-column
        prop="date"
        label="序号"
        min-width="25"
        type="index"
        align="center"
      ></el-table-column>
      <el-table-column prop="" label="店铺" align="center">
        <template #default="{ row }">
          <span
            >{{ row.platformName }}({{ row.storeCode }}){{
              row.storeName
            }}</span
          >
        </template>
      </el-table-column>
      <el-table-column
        prop="spuShowName"
        label="产品名称"
        align="center"
      ></el-table-column>
      <el-table-column label="SKU编码" align="center">
        <template slot-scope="scope">
          <span>({{ scope.row.skuCode }}){{ scope.row.specsName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="SKU图片" width="90" align="center">
        <template v-slot="{ row, $index }">
          <el-image
            v-if="row.skuUrl"
            style="height: 30px; width: 30px"
            :src="row.skuUrl + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
            :preview-src-list="[row.skuUrl]"
          ></el-image>
        </template>
      </el-table-column>
      <el-table-column label="商品链接" align="center">
        <template #default="{ row }">
          <span>({{ row.linkTitle }}){{ row.linkId }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="categoryName"
        label="货品分类"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="applyTypeName"
        label="运营申请类型"
        align="center"
      ></el-table-column>
      <el-table-column label="起始日期" align="center">
        <template #default="{ row }">
          <span>{{ getFormatDate(row.applyStartTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束日期" align="center">
        <template #default="{ row }">
          <span>{{ getFormatDate(row.applyEndTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="本次本地仓复核数量" align="center">
        <template #default="{ row }">
          <!-- 数组 -->
          <!-- <div v-for="(item,index) in row.applyPlanQuantity" :key="index">
            <span >{{item}}</span>
           </div> -->

          <div>
            {{ row.applyPlanQuantity }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="本次京仓复核数量" align="center">
        <template #default="{ row }">
          <!-- 数组 -->
          <!-- <div v-for="(item,index) in row.applyPlanQuantity" :key="index">
            <span >{{item}}</span>
           </div> -->

          <div>
            {{ row.applyPlanJinQuantity }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="submitUserName"
        label="提交人"
        align="center"
      ></el-table-column>
      <el-table-column label="提交时间" align="center">
        <template #default="{ row }">
          <span>{{ getFormatDate(row.submitTime) }}</span>
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <el-button @click="close">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { getFormatDate } from "@/utils/common";
export default {
  name: "ApplicationPlanDialog",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    close() {
      this.$emit("update:visible", false);
    },
    // 获取月
    getFormatDate(timestamp) {
      return getFormatDate(timestamp);
    },
  },
};
</script>
