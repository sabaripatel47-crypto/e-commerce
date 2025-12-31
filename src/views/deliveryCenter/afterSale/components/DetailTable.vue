<template>
  <div>
    <el-dialog :visible.sync="dialogVisible" @close="closeDialog" width="95%">
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column
          prop="date"
          label="序号"
          min-width="30"
          type="index"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="originalOrderId"
          label="订单号"
          align="center"
        ></el-table-column>
        <el-table-column label="店铺" align="center">
          <template v-slot="{ row }">
            <span v-if="row.storeCode"
              >{{ row.platformName }} ({{ row.storeCode }})
              {{ row.storeName }}</span
            >
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="linkId"
          label="商品编码"
          width="120"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="showName"
          label="产品名称"
          width="130"
          align="center"
        ></el-table-column>
        <el-table-column label="SKU编码" align="center">
          <template v-slot="{ row }">
            <span>({{ row.skuCode }}){{ row.spacesName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="SKU图片" width="80" align="center">
          <template v-slot="{ row, $index }">
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
        <el-table-column
          prop="departmentLevelName"
          label="问题类型"
          show-overflow-tooltip
          width="140"
          align="center"
        >
          <template v-slot="{ row }">
            <span>{{ row.departmentName }}-{{ row.departmentLevelName }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="problemTypes"
          label="问题细分"
          show-overflow-tooltip
          width="140"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="feiSuoRemark"
          label="备注"
          show-overflow-tooltip
          width="70"
          align="center"
        ></el-table-column>
        <el-table-column label="图片" align="center">
          <template v-slot="{ row, $index }">
            <div v-if="row.feiSuoImageAddress != []">
              <el-image
                v-for="(item, index) in row.feiSuoImageAddress"
                :key="index"
                style="height: 30px; width: 30px; margin-right: 3px"
                :src="item + '?x-oss-process=image/resize,w_30,h_30,limit_0'"
                :preview-src-list="[item]"
              ></el-image>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="视频" align="center">
          <template v-slot="{ row }">
            <el-button
              @click="openVideo(row)"
              v-if="row.videoUpload"
              style="padding: 0"
            >
              <img
                src="../../../../assets/images/vedio-icon.svg"
                width="40"
                alt=""
              />
            </el-button>
          </template>
        </el-table-column>
        <el-table-column
          prop="feiSuoDisposeSchemeName"
          label="处理方法"
          show-overflow-tooltip
          width="120"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="feiSuoActualPaymentAmount"
          width="80"
          label="实付金额"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="feiSuoCreator"
          width="120"
          label="创建人"
          align="center"
        ></el-table-column>
        <el-table-column label="创建日期" width="100" align="center">
          <template v-slot="{ row }">
            {{ getFormatDate(row.feiSuoCreateTime) }}
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <Pagination
        v-if="total > 0"
        :page.sync="reqParams.page"
        :limit.sync="reqParams.pageSize"
        :total="total"
        @pagination="getPageList"
      />
    </el-dialog>

    <el-dialog
      :visible.sync="isVideoDialogVisible"
      title="视频播放"
      width="70%"
      @close="closeVideo"
    >
      <div class="video-container">
        <video controls :key="videoUrl" autoplay>
          <source :src="videoUrl" type="video/mp4" />
          你的浏览器不支持 HTML5 视频。
        </video>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getAfterSaleDetailOrder } from "@/api/deliveryCenter/afterSale";
import { getFormatDate } from "@/utils/common";
export default {
  name: "DetailTable",
  props: {
    dateRange: {
      type: Array,
      default: () => [],
    },
    departmentLevelUuid: {
      type: String,
      default: "",
    },
    departmentUuid: {
      type: String,
      default: "",
    },
    skuUuid: {
      type: String,
      default: "",
    },
    spuUuid: {
      type: String,
      default: "",
    },
    problemTypes: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      dialogVisible: false,
      // 主表数据
      tableData: [],
      // 请求参数
      reqParams: {
        departmentLevelUuid: "",
        problemTypes: "",
        departmentUuid: "",
        endTime: "",
        page: 1,
        pageSize: 10,
        skuUuid: "",
        spuUuid: "",
        startTime: "",
      },
      loading: false,
      total: 0,
      isVideoDialogVisible: false, // 控制视频弹窗的显示与隐藏
      videoUrl: "",
    };
  },
  created() {},
  methods: {
    // 获取表格数据
    async getPageList(page) {
      this.loading = true;
      if (page == 1) {
        this.reqParams.page = 1;
      }
      this.reqParams.departmentLevelUuid = this.departmentLevelUuid;
      this.reqParams.problemTypes = this.problemTypes;
      this.reqParams.departmentUuid = this.departmentUuid;
      this.reqParams.skuUuid = this.skuUuid;
      this.reqParams.spuUuid = this.spuUuid;
      this.reqParams.startTime = this.dateRange[0];
      this.reqParams.endTime = this.dateRange[1];
      const res = await getAfterSaleDetailOrder(this.reqParams);
      this.tableData = res.data.records;
      this.total = res.data.total;
      this.loading = false;
    },
    openDialog() {
      this.getPageList(1);
      this.dialogVisible = true;
    },
    closeDialog() {
      this.dialogVisible = false;
      this.reqParams = this.$options.data().reqParams;
      this.tableData = [];
    },
    getFormatDate(timeStamp) {
      return getFormatDate(timeStamp);
    },
    // 打开视频弹窗
    openVideo(row) {
      this.videoUrl = row.videoUpload;
      // console.log(this.videoUrl);
      this.isVideoDialogVisible = true;
    },
    // 关闭视频弹窗
    closeVideo() {
      this.videoUrl = "";
      this.isVideoDialogVisible = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.video-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

video {
  width: 100%;
  max-height: 500px; /* 控制视频最大高度 */
}
</style>