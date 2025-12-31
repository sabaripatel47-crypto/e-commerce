<template>
  <div>
    <el-table
      :row-style="rowStyle"
      :data="tableData"
      border
      @row-click="getAfterSaleDetailChildData"
      v-loading="loading"
    >
      <el-table-column
        prop="departmentName"
        label="职能部门"
        align="left"
      ></el-table-column>
      <el-table-column min-width="190" label="问题汇总" align="center">
        <template v-slot="{ row }">
          <p
            :style="{
              padding: 0,
              margin: 0,
            }"
          >
            <span
              >数量：{{
                row.lastWeeksProblemVO.lastWeeksNum != null
                  ? row.lastWeeksProblemVO.lastWeeksNum
                  : "-"
              }}</span
            >
            <span
              :style="{
                color:
                  row.lastWeeksProblemVO.lastWeeksNumRate < 0
                    ? 'green'
                    : row.lastWeeksProblemVO.lastWeeksNumRate > 0
                    ? 'red'
                    : 'black',
              }"
              >({{
                row.lastWeeksProblemVO.lastWeeksNumRate != null
                  ? row.lastWeeksProblemVO.lastWeeksNumRate
                  : "-"
              }})</span
            >
          </p>
          <p
            :style="{
              padding: 0,
              margin: 0,
            }"
          >
            <span
              >百分比：{{
                row.lastWeeksProblemVO.lastWeeksPercentage != null
                  ? getPercentage(row.lastWeeksProblemVO.lastWeeksPercentage)
                  : "-"
              }}</span
            >
            <span
              :style="{
                color:
                  row.lastWeeksProblemVO.lastWeeksPercentageRate < 0
                    ? 'green'
                    : row.lastWeeksProblemVO.lastWeeksPercentageRate > 0
                    ? 'red'
                    : 'black',
              }"
              >({{
                row.lastWeeksProblemVO.lastWeeksPercentageRate != null
                  ? getPercentage(
                      row.lastWeeksProblemVO.lastWeeksPercentageRate
                    )
                  : "-"
              }})</span
            >
          </p>
        </template>
      </el-table-column>
      <el-table-column
        v-for="(item, index) in dateList"
        :label="getFormatDate(item)"
        min-width="140"
        align="center"
        :key="item"
      >
        <template v-slot="{ row }">
          <p style="padding: 0px; margin: 0px">
            数量：{{
              row.afterSaleTimeVOList[index].afterSaleByQuantity == null
                ? "-"
                : row.afterSaleTimeVOList[index].afterSaleByQuantity
            }}
          </p>
          <p style="padding: 0; margin: 0">
            百分比：{{
              row.afterSaleTimeVOList[index].percentage == null
                ? "-"
                : getPercentage(row.afterSaleTimeVOList[index].percentage)
            }}
          </p>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="180" align="center">
        <template v-slot="{ row }">
          <el-button type="text" size="small" @click="changeTab(row)"
            >SPU明细</el-button
          >
          <el-button type="text" size="small" @click="openDetail(row)"
            >订单明细</el-button
          >
          <el-button type="text" size="small" @click="openDialog(row)"
            >趋势图</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <el-table
      :data="childTableData"
      v-loading="childLoading"
      border
      lazy
      row-key="uuid"
      :load="loadChildren"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      :span-method="spanMethod"
      style="margin-top: 30px"
    >
      <el-table-column
        label="问题类型"
        min-width="200"
        align="left"
        prop="departmentLevelName"
      >
        <template #default="{ row }">
          <span v-if="!row.isLoadMore">{{
            row.departmentLevelName
              ? row.departmentLevelName
              : row.problemTypesName
          }}</span>
          <div v-else class="load-more-cell">
            <el-button
              type="text"
              size="small"
              @click.stop="loadMoreChildren(row)"
              :loading="row.parent.loadingMore"
            >
              <i class="el-icon-refresh"></i>
              加载更多 ({{ row.parent.loadedCount }}/{{
                row.parent.totalChildren
              }})
            </el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column min-width="190" label="问题汇总" align="center">
        <template v-slot="{ row }">
          <div v-if="row.lastWeeksProblemVO != null">
            <p
              :style="{
                padding: 0,
                margin: 0,
              }"
            >
              <span
                >数量：{{
                  row.lastWeeksProblemVO.lastWeeksNum != null
                    ? row.lastWeeksProblemVO.lastWeeksNum
                    : "-"
                }}</span
              >
              <span
                :style="{
                  color:
                    row.lastWeeksProblemVO.lastWeeksNumRate < 0
                      ? 'green'
                      : row.lastWeeksProblemVO.lastWeeksNumRate > 0
                      ? 'red'
                      : 'black',
                }"
                >({{
                  row.lastWeeksProblemVO.lastWeeksNumRate != null
                    ? row.lastWeeksProblemVO.lastWeeksNumRate
                    : "-"
                }})</span
              >
            </p>
            <p
              :style="{
                padding: 0,
                margin: 0,
              }"
            >
              <span
                >百分比：{{
                  row.lastWeeksProblemVO.lastWeeksPercentage != null
                    ? getPercentage(row.lastWeeksProblemVO.lastWeeksPercentage)
                    : "-"
                }}</span
              >
              <span
                :style="{
                  color:
                    row.lastWeeksProblemVO.lastWeeksPercentageRate < 0
                      ? 'green'
                      : row.lastWeeksProblemVO.lastWeeksPercentageRate > 0
                      ? 'red'
                      : 'black',
                }"
                >({{
                  row.lastWeeksProblemVO.lastWeeksPercentageRate != null
                    ? getPercentage(
                        row.lastWeeksProblemVO.lastWeeksPercentageRate
                      )
                    : "-"
                }})</span
              >
            </p>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        v-for="(item, index) in dateList"
        :label="getFormatDate(item)"
        :key="item"
        min-width="140"
        align="center"
      >
        <template v-slot="{ row }">
          <p style="padding: 0px; margin: 0px">
            数量：{{
              row.afterSaleTimeVOList[index].afterSaleByQuantity || "-"
            }}
          </p>
          <p style="padding: 0; margin: 0">
            百分比：{{
              row.afterSaleTimeVOList[index].percentage
                ? getPercentage(row.afterSaleTimeVOList[index].percentage)
                : "-"
            }}
          </p>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="180" align="center">
        <template v-slot="{ row }">
          <el-button type="text" size="small" @click="changeTab(row)"
            >SPU明细</el-button
          >
          <el-button type="text" size="small" @click="openDetail(row)"
            >订单明细</el-button
          >
          <el-button
            type="text"
            size="small"
            v-if="!row.problemTypes"
            @click="openDialog2(row)"
            >趋势图</el-button
          >

          <el-button
            type="text"
            size="small"
            v-if="row.problemTypes"
            @click="openDialog3(row)"
            >趋势图</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      title=""
      append-to-body
      :visible.sync="dialogVisible"
      @close="closeDialog"
    >
      <LineChart
        v-if="dialogVisible"
        :TableData="quantityData"
        :chartName="lineChartTitle + '数量'"
        :xData="lineChartX"
      ></LineChart>
      <LineChartPercent
        v-if="dialogVisible"
        :TableData="percentageData"
        :chartName="lineChartTitle + '百分比'"
        :xData="lineChartX"
      ></LineChartPercent>
    </el-dialog>
    <DetailTable
      ref="detailTable"
      :dateRange="date"
      :skuUuid="sku"
      :spuUuid="spu"
      :departmentUuid="detailDepartment"
      :departmentLevelUuid="detaildepartmentLevel"
      :problemTypes="problemTypes"
    ></DetailTable>
  </div>
</template>

<script>
import {
  getAfterSaleDetail,
  getAfterSaleChart,
  getAfterSaleDetailChild,
  getAfterSaleDetailChart,
  getAfterSaleDetailChild2,
  getAfterSaleDetailChart2,
} from "@/api/deliveryCenter/afterSale";
import { getFormatDate } from "@/utils/common";
import LineChart from "./LineChart.vue";
import LineChartPercent from "./LineChartPercent.vue";
import DetailTable from "./DetailTable.vue";
export default {
  name: "DepartmentView",
  data() {
    return {
      // 职能部门数据
      tableData: [],
      // 主表加载
      loading: false,
      // 子表加载
      childLoading: false,
      // 职能部门日期
      dateList: [],
      // 职能部门子表数据
      childTableData: [],
      reqParams: {
        endTime: "",
        startTime: "",
        skuUuid: "",
        spuUuid: "",
      },
      // 折线图弹窗
      dialogVisible: false,
      // 数量折线图数据
      quantityData: [],
      // 百分比折线图数据
      percentageData: [],
      // 折线图标题
      lineChartTitle: "",
      // 折线图x轴
      lineChartX: [],
      // 明细传值
      detailDepartment: "",
      detaildepartmentLevel: "",
      CurrentdetailDepartment: "",
      problemTypes: "",
    };
  },
  components: {
    LineChart,
    DetailTable,
    LineChartPercent,
  },
  props: {
    date: {
      type: Array,
      default: () => [],
    },
    sku: {
      type: String,
      default: () => "",
    },
    spu: {
      type: String,
      default: () => "",
    },
    department: {
      type: String,
      default: () => "",
    },
  },
  created() {
    this.getAfterSaleDetailData();
  },
  watch: {
    // date:{
    //   handler(){
    //     this.getAfterSaleDetailData()
    //   },
    //   deep:true
    // }
  },
  methods: {
    // 职能部门数据
    async getAfterSaleDetailData() {
      this.loading = true;
      this.childTableData = [];
      this.tableData = [];
      this.dateList = [];
      this.reqParams.endTime = this.date[1];
      this.reqParams.startTime = this.date[0];
      this.reqParams.skuUuid = this.sku;
      this.reqParams.spuUuid = this.spu;
      this.reqParams.departmentUuid = this.department;
      const res = await getAfterSaleDetail(this.reqParams);
      this.tableData = res.data;
      if (res.data != "") {
        this.dateList = res.data[0].afterSaleTimeVOList.map(
          (item) => item.saleTime
        );
      }
      this.loading = false;
    },
    // 职能部门子表
    async getAfterSaleDetailChildData(row) {
      this.childTableData = [];
      this.CurrentdetailDepartment = row.departmentUuid;
      this.childLoading = true;
      this.reqParams.endTime = this.date[1];
      this.reqParams.startTime = this.date[0];
      this.reqParams.departmentUuid = row.departmentUuid;
      const res = await getAfterSaleDetailChild(this.reqParams);
      this.childTableData = res.data.map((item) => ({
        ...item,
        uuid: item.departmentLevelUuid,
        hasChildren: true,
      }));
      // console.log(this.childTableData);
      this.childLoading = false;
    },
    getFormatDate(timeStamp) {
      return getFormatDate(timeStamp);
    },
    // 打开职能部门趋势图
    async openDialog(row) {
      this.reqParams.endTime = this.date[1];
      this.reqParams.startTime = this.date[0];
      this.reqParams.departmentUuid = row.departmentUuid;
      this.reqParams.spuUuid = this.spu;
      this.reqParams.skuUuid = this.sku;
      const res = await getAfterSaleChart(this.reqParams);
      this.lineChartTitle = res.data.questionType;
      this.quantityData = res.data.afterSaleQuantityLineChartVOList.map(
        (item) => item.afterSaleByQuantity
      );
      this.percentageData = res.data.afterSaleQuantityLineChartVOList.map(
        (item) => this.getPercent(item.percentage)
      );
      this.lineChartX = res.data.afterSaleQuantityLineChartVOList.map((item) =>
        getFormatDate(item.saleTime)
      );
      this.dialogVisible = true;
    },
    // 打开问题类型趋势图
    async openDialog2(row) {
      this.reqParams.endTime = this.date[1];
      this.reqParams.startTime = this.date[0];
      // this.reqParams.departmentUuid = row.departmentUuid
      this.reqParams.departmentLevelUuid = row.departmentLevelUuid;
      this.reqParams.spuUuid = this.spu;
      this.reqParams.skuUuid = this.sku;
      const res = await getAfterSaleDetailChart(this.reqParams);
      this.lineChartTitle = res.data.questionType;
      this.quantityData = res.data.afterSaleQuantityLineChartVOList.map(
        (item) => item.afterSaleByQuantity
      );
      this.percentageData = res.data.afterSaleQuantityLineChartVOList.map(
        (item) => this.getPercent(item.percentage)
      );
      this.lineChartX = res.data.afterSaleQuantityLineChartVOList.map((item) =>
        getFormatDate(item.saleTime)
      );
      this.dialogVisible = true;
    },
    closeDialog() {
      this.dialogVisible = false;
    },
    // 打开二级表格趋势图
    async openDialog3(row) {
      this.reqParams.endTime = this.date[1];
      this.reqParams.startTime = this.date[0];
      this.reqParams.departmentUuid = row.departmentUuid;
      this.reqParams.departmentLevelUuid = row.departmentLevelUuid;
      this.reqParams.departmentProblemTypesUuid = row.problemTypes;
      this.reqParams.spuUuid = this.spu;
      this.reqParams.skuUuid = this.sku;
      const res = await getAfterSaleDetailChart2(this.reqParams);
      this.lineChartTitle = res.data.questionType;
      this.quantityData = res.data.afterSaleQuantityLineChartVOList.map(
        (item) => item.afterSaleByQuantity
      );
      this.percentageData = res.data.afterSaleQuantityLineChartVOList.map(
        (item) => this.getPercent(item.percentage)
      );
      this.lineChartX = res.data.afterSaleQuantityLineChartVOList.map((item) =>
        getFormatDate(item.saleTime)
      );
      this.dialogVisible = true;
    },
    // 保留两位小数并转成百分比
    getPercentage(num) {
      let numBer = Math.floor((num * 10000).toFixed(1)) / 100;
      numBer = numBer + "%";
      return numBer;
    },
    changeTab(row) {
      this.$emit(
        "changeTab",
        row.departmentUuid,
        row.departmentLevelUuid == null ? "" : row.departmentLevelUuid,
        row.problemTypes == null ? "" : row.problemTypes
      );
    },
    openDetail(row) {
      this.detailDepartment = "";
      this.detaildepartmentLevel = "";
      this.problemTypes = "";
      this.detailDepartment = row.departmentUuid;
      this.detaildepartmentLevel = row.departmentLevelUuid;
      this.problemTypes = row.problemTypes;
      this.$nextTick(() => {
        this.$refs.detailTable.openDialog();
      });
    },
    // 转化成百分比格式
    getPercent(num) {
      return (num * 100).toFixed(2);
    },
    // 点击修改tab行颜色
    rowStyle({ row }) {
      if (this.CurrentdetailDepartment === row.departmentUuid) {
        return {
          "background-color": "rgb(235,240,240)",
          cursor: "pointer",
        };
      }
      return { cursor: "pointer" };
    },
    // 职能部门二级表格
    async fetchChildren(parentId, page, pageSize = 20) {
      const reqParams = {
        departmentLevelUuid: parentId,
        departmentUuid: this.reqParams.departmentUuid,
        endTime: this.date[1],
        page: page,
        pageSize: pageSize,
        skuUuid: this.reqParams.skuUuid,
        spuUuid: this.reqParams.spuUuid,
        startTime: this.date[0],
      };
      const res = await getAfterSaleDetailChild2(reqParams);
      let list = res.data.records.map((item) => ({
        ...item,
        uuid: item.problemTypes,
      }));

      const total = res.data.total;
      return {
        data: {
          list,
          total,
        },
      };
    },
    // 合并单元格方法
    spanMethod({ row, column, rowIndex, columnIndex }) {
      if (row.isLoadMore) {
        if (columnIndex === 0) {
          // 名称列
          return {
            rowspan: 1,
            colspan: 3 + this.dateList.length, // 合并3列
          };
        } else {
          // 其他列
          return {
            rowspan: 0,
            colspan: 0,
          };
        }
      }
    },
    async loadChildren(tree, treeNode, resolve) {
      try {
        // 初始化父节点的必要属性
        const initProps = {
          loadingMore: false,
          currentPage: 1,
          pageSize: 20,
          children: [],
          loadedCount: 0,
          totalChildren: 0,
        };

        // 使用Object.keys确保所有属性都被Vue的响应式系统跟踪
        Object.keys(initProps).forEach((key) => {
          if (!tree.hasOwnProperty(key)) {
            this.$set(tree, key, initProps[key]);
          }
        });

        const { data } = await this.fetchChildren(tree.departmentLevelUuid, 1);

        // 创建子节点数据，确保数据结构完整
        const children = data.list.map((item) => ({
          ...item,
          hasChildren: false,
          uuid: item.problemTypes || item.departmentLevelUuid,
          departmentLevelName:
            item.departmentLevelName || item.problemTypesName,
          lastWeeksProblemVO: {
            lastWeeksNum: item.lastWeeksProblemVO?.lastWeeksNum ?? null,
            lastWeeksNumRate: item.lastWeeksProblemVO?.lastWeeksNumRate ?? null,
            lastWeeksPercentage:
              item.lastWeeksProblemVO?.lastWeeksPercentage ?? null,
            lastWeeksPercentageRate:
              item.lastWeeksProblemVO?.lastWeeksPercentageRate ?? null,
          },
          afterSaleTimeVOList: Array.isArray(item.afterSaleTimeVOList)
            ? item.afterSaleTimeVOList
            : this.dateList.map(() => ({
                afterSaleByQuantity: null,
                percentage: null,
              })),
        }));

        // 更新父节点状态
        this.$set(tree, "totalChildren", data.total);
        this.$set(tree, "loadedCount", data.list.length);
        this.$set(tree, "children", children);

        // 如果有更多数据，添加加载更多节点
        if (data.total > data.list.length) {
          const loadMoreNode = {
            uuid: `${tree.departmentLevelUuid}-load-more-1`,
            isLoadMore: true,
            parent: tree,
            problemTypesName: "",
            departmentLevelName: "加载更多...",
            lastWeeksProblemVO: {
              lastWeeksNum: null,
              lastWeeksNumRate: null,
              lastWeeksPercentage: null,
              lastWeeksPercentageRate: null,
            },
            afterSaleTimeVOList: this.dateList.map(() => ({
              afterSaleByQuantity: null,
              percentage: null,
            })),
          };
          children.push(loadMoreNode);
        }

        // 使用Vue.nextTick确保DOM更新
        this.$nextTick(() => {
          resolve(children);
        });
      } catch (error) {
        console.error("加载子节点失败:", error);
        resolve([]);
      }
    },
    async loadMoreChildren(loadMoreNode) {
      const parent = loadMoreNode.parent;

      // 防御性检查
      if (!parent || parent.loadingMore) {
        console.warn("父节点不存在或正在加载中");
        return;
      }

      try {
        // 设置加载状态
        this.$set(parent, "loadingMore", true);

        // 获取下一页数据
        const nextPage = parent.currentPage + 1;
        const { data } = await this.fetchChildren(
          parent.departmentLevelUuid,
          nextPage
        );

        // 移除当前的加载更多节点
        const loadMoreIndex = parent.children.findIndex(
          (child) => child.isLoadMore
        );
        if (loadMoreIndex !== -1) {
          parent.children.splice(loadMoreIndex, 1);
        }

        // 处理新数据
        const newChildren = data.list.map((item) => ({
          ...item,
          hasChildren: false,
          uuid: item.problemTypes || item.departmentLevelUuid,
          departmentLevelName:
            item.departmentLevelName || item.problemTypesName,
          lastWeeksProblemVO: {
            lastWeeksNum: item.lastWeeksProblemVO?.lastWeeksNum ?? null,
            lastWeeksNumRate: item.lastWeeksProblemVO?.lastWeeksNumRate ?? null,
            lastWeeksPercentage:
              item.lastWeeksProblemVO?.lastWeeksPercentage ?? null,
            lastWeeksPercentageRate:
              item.lastWeeksProblemVO?.lastWeeksPercentageRate ?? null,
          },
          afterSaleTimeVOList: Array.isArray(item.afterSaleTimeVOList)
            ? item.afterSaleTimeVOList
            : this.dateList.map(() => ({
                afterSaleByQuantity: null,
                percentage: null,
              })),
        }));

        // 更新父节点状态
        this.$set(parent, "currentPage", nextPage);
        const newLoadedCount = parent.loadedCount + newChildren.length;
        this.$set(parent, "loadedCount", newLoadedCount);

        // 添加新数据到children数组
        newChildren.forEach((child) => {
          parent.children.push(child);
        });

        // 如果还有更多数据，添加新的加载更多节点
        if (newLoadedCount < parent.totalChildren) {
          const newLoadMoreNode = {
            uuid: `${parent.departmentLevelUuid}-load-more-${nextPage}`,
            isLoadMore: true,
            parent: parent,
            problemTypesName: "",
            departmentLevelName: "加载更多...",
            lastWeeksProblemVO: {
              lastWeeksNum: null,
              lastWeeksNumRate: null,
              lastWeeksPercentage: null,
              lastWeeksPercentageRate: null,
            },
            afterSaleTimeVOList: this.dateList.map(() => ({
              afterSaleByQuantity: null,
              percentage: null,
            })),
          };
          parent.children.push(newLoadMoreNode);
        }

        // 强制更新表格布局
        this.$nextTick(() => {
          const table = this.$el.querySelector(".el-table");
          if (table && table.__vue__) {
            table.__vue__.doLayout();
          }
        });
      } catch (error) {
        console.error("加载更多数据失败:", error);
      } finally {
        this.$set(parent, "loadingMore", false);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.load-more-cell {
  padding: 0 35px;
}
</style>