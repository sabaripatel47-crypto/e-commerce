<template>
  <div class="app-container">
    <div class="head-contatiner">
      <div class="card">
        <div class="grade-detail">
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
            <!-- <span
                style="margin-left: 60px"
                v-if="showRate && linkDetail.jumpButton"
            >-->
            <!-- <el-button type="primary" size="mini" @click="showDailyDetail"
                >日报</el-button
            >-->
            <!-- </span> -->
          </div>
        </div>
      </div>
      <div class="card">
        <ColoredCard
          v-for="item in cardList"
          :key="item.type"
          :title="item.name"
          unit="元"
          :num="String(item.deliveryCenterAllQuantityVO.afterSaleByQuantity)"
          :type="item.deliveryCenterAllQuantityVO.increaseRate"
        ></ColoredCard>
      </div>
    </div>
    <el-form :inline="true">
      <el-form-item label="分析类型：">
        <el-select
          class="analysis-select-class"
          v-model="trendParams.analysisTypeList"
          multiple
          clearable
          placeholder="请选择"
        >
          <el-option
            v-for="item in analysisTypeList"
            :key="item.dictType"
            :label="item.dictName"
            :value="item.dictType"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="时间类型：">
        <el-select class="time-select-class" v-model="trendParams.timeType" placeholder="请选择">
          <el-option
            v-for="item in timeTypeList"
            :key="item.code"
            :label="item.code"
            :value="item.code"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="getTrendList()" icon="el-icon-search" type="primary">搜索</el-button>
      </el-form-item>
    </el-form>
    <!-- <ViewDailyDialog
      :row.sync="currentRow"
      :showDialog.sync="showViewDailyDialog"
      :parentReqParams.sync="reqParams"
      :readOnly="false"
    ></ViewDailyDialog>-->
    <div style="flex-wrap: wrap; display: flex; justify-content: space-around">
      <div v-for="item in trendData" :key="item.categoryKeyUuid">
        <BarChart v-if="item != []" :option="item"></BarChart>
      </div>
    </div>
  </div>
</template>

<script>
import { getGradeDetail } from '@/api/bulletinboard/linkBoard'
import ViewDailyDialog from '@/views/dailyManage/viewDaily/viewDailyDialog'
import BarChart from './BarChart.vue'
import ColoredCard from './ColoredCard.vue'
import {
  getLinkStatisticsList,
  getTimeTypeList,
  getTrendList,
  getAnalysisTypeList,
} from '@/api/promotionData/CrowdAnalysis'
export default {
  name: '',
  props: {
    req: {
      tyep: Object,
    },
    linkRow: {
      type: Object,
    },
  },
  data() {
    return {
      // 商品链接详情
      linkDetail: {},
      showViewDailyDialog: false,
      showLinkDetail: false,
      // 日报入参
      deptReports: {
        platform: [],
        store: [],
        startTime: '',
        endTime: '',
        formatType: 2,
        keyWord: '', // 链接id（精准）、链接标题（模糊）
        linkId: [],
      },
      // 卡片入参
      cardParams: {
        endTime: '',
        formatType: '',
        isMainLink: '',
        linkId: '',
        linkLevel: '',
        linkTimeStatus: '',
        platform: '',
        spuUuid: '',
        startTime: '',
        storeUuid: '',
        strategyUuid: '',
        track: '',
        uploadDataType: '',
      },
      currentRow: {},
      // 趋势图入参
      trendParams: {
        analysisTypeList: [],
        linId: '',
        timeType: 1,
      },
      // 分析类型下拉框
      analysisTypeList: [],
      // 时间类型下拉框
      timeTypeList: [],
      // 趋势图数据
      trendData: [],
      cardList: [],
    }
  },
  components: {
    ViewDailyDialog,
    BarChart,
    ColoredCard,
  },
  created() {
    this.trendParams.analysisTypeList = []
    this.getGradeDetail()
    this.getLinkStatisticsList()
    this.getTimeTypeList()
    this.getAnalysisTypeList()
    // this.getTrendList();
  },
  methods: {
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
      this.deptReports.linkId = [this.linkRow.linkId]
      this.deptReports.platform =
        this.req.platform == '' ? [] : [this.req.platform]
      this.deptReports.store = this.linkRow.storeUuid
        ? [this.linkRow.storeUuid]
        : []
      this.deptReports.startTime = this.req.startTime
      this.deptReports.endTime = this.req.endTime
      const res = await getGradeDetail(this.deptReports)
      if (res.data && res.data.linkId) {
        this.showLinkDetail = true
        this.linkDetail = res.data
      } else {
        this.showLinkDetail = false
      }
      // console.log('res', res)
    },
    // getLinkStatisticsList 获取链接统计数据
    async getLinkStatisticsList() {
      this.cardParams.linkId = this.linkRow.linkId
      this.cardParams.platform = this.req.platform
      this.cardParams.formatType = this.req.formatType
      // this.cardParams.storeUuid = this.linkRow.storeUuid;
      this.cardParams.startTime = this.req.startTime
      this.cardParams.endTime = this.req.endTime
      const res = await getLinkStatisticsList(this.cardParams)
      this.cardList = res.data
    },
    // 获取时间类型
    async getTimeTypeList() {
      const res = await getTimeTypeList()
      this.timeTypeList = res.data
      this.trendParams.timeType = res.data[1].code
    },
    // 获取趋势图
    async getTrendList() {
      this.trendData = []
      if (this.trendParams.analysisTypeList.length == 0) {
        this.trendDataq
        return
      }
      this.trendParams.linId = this.linkRow.linkId
      const res = await getTrendList(this.trendParams)
      this.trendData = res.data
    },
    // 获取分析类型
    async getAnalysisTypeList() {
      const res = await getAnalysisTypeList()
      this.analysisTypeList = res.data
      const list = res.data.slice(0, 4)
      this.trendParams.analysisTypeList = list.map((item) => item.dictType)
      this.getTrendList()
    },
  },
}
</script>

<style lang='scss' scoped>
.card {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}
// 分析类型下拉框样式
.analysis-select-class {
  width: 30vw;
}
.time-select-class {
  width: 80px;
}
.grade-detail {
  border: 1px solid #d6d6d6;
  width: 700px;
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
</style>
