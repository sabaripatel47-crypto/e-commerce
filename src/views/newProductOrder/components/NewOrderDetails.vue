<template>
  <div>
    <el-dialog
      :visible.sync="dialogVisible"
      @close="closeDialog"
      :fullscreen="true"
    >
      <el-button
        type="text"
        icon="el-icon-arrow-left"
        class="dialog-back-button"
        @click="closeDialog"
        >返回</el-button
      >
      <div class="content">
        <el-form>
          <el-form-item label="采购日期:" label-width="100px">
            {{ getFormaMonth(+propsData.purchaseTime) }}
          </el-form-item>
          <el-form-item label="总周次:" label-width="100px">
            <el-select v-model="week" placeholder="请选择" @change="getWeek">
              <el-option
                v-for="item in weekList"
                :key="item"
                :label="item"
                :value="item"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="采购名称:" label-width="100px">
            <el-input
              disabled
              class="input-width"
              :rows="2"
              placeholder="系统自动生成"
              v-model="reqParams.purchaseName"
            >
            </el-input>
          </el-form-item>
          <el-form-item label="采购说明:" label-width="100px">
            <el-input
              type="textarea"
              class="input-width"
              :rows="2"
              placeholder="请输入内容"
              v-model="reqParams.purchaseDescribe"
            >
            </el-input>
          </el-form-item>
        </el-form>
      </div>
      <div>
        <el-table height="480" :data="orderList">
          <el-table-column
            prop="date"
            label="序号"
            min-width="25"
            type="index"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="spuShowName"
            label="产品名称"
            width="180"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="categoryName"
            show-overflow-tooltip
            label="货品分类"
            align="center"
          ></el-table-column>
          <el-table-column
            prop=""
            min-width="220"
            label="SKU编码"
            align="center"
          >
            <template slot-scope="scope">
              <el-select
                v-model="scope.row.skuUuid"
                filterable
                style="width: 100%"
                :filter-method="filterMethod"
                @change="getSkuInfoById(scope)"
                @visible-change="visibleChange"
                v-el-select-loadmore="loadMore"
                :loading="selectLoading"
              >
                <el-option
                  v-for="(item, index) in skuList"
                  :key="item.code"
                  :label="`${item.extendKeyword}(${item.name})`"
                  :value="item.code"
                ></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="SKU图片" align="center">
            <template v-slot="{ row, $index }">
              <el-image
                v-if="row.skuUrl"
                style="height: 30px"
                :src="
                  row.skuUrl + '?x-oss-process=image/resize,w_30,h_30,limit_0'
                "
                :preview-src-list="[row.skuUrl]"
              ></el-image>
            </template>
          </el-table-column>
          <el-table-column
            label="供应商"
            width="180"
            min-width="120"
            align="center"
          >
            <template v-slot="{ row }">
              <el-select v-model="row.mainSupplier" placeholder="请选择">
                <el-option
                  v-for="item in row.otherSupplier"
                  :key="item.uuid"
                  :label="item.supplierName"
                  :value="item.uuid"
                ></el-option>
              </el-select>
            </template>
          </el-table-column>

          <el-table-column label="实际采购数量" width="180" align="center">
            <template #default="{ row }">
              <el-input
                v-model="row.purchaseQuantity"
                oninput="value=value.replace(/^0+(\d)|[^\d]+/g,'')"
                placeholder="请输入采购数量"
              ></el-input>
            </template>
          </el-table-column>

          <el-table-column
            :label="`第${n}周`"
            align="center"
            width="180"
            v-for="n in week"
            :key="n"
          >
            <template #default="{ row }">
              <div>
                <span>本地：</span>
                <el-input
                  class="custom-width"
                  oninput="value=value.replace(/^0+(\d)|[^\d]+/g,'')"
                  v-model="
                    row.addNewProductsWeeksDetails[n - 1]
                      .addNewProductsWeeksNumDetail[0].quantity
                  "
                  placeholder="请输入采购数量"
                ></el-input>
              </div>
              <div>
                <span>京仓：</span>
                <el-input
                  class="custom-width"
                  oninput="value=value.replace(/^0+(\d)|[^\d]+/g,'')"
                  v-model="
                    row.addNewProductsWeeksDetails[n - 1]
                      .addNewProductsWeeksNumDetail[1].quantity
                  "
                  placeholder="请输入采购数量"
                ></el-input>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="splitList(scope)"
                >拆分</el-button
              >
              <el-button type="text" size="small" @click="deleteList(scope)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <div class="add-btn">
          <i
            class="el-icon-circle-plus-outline"
            style="font-size: 24px; color: #1e98d7"
            @click="addPurchase"
          ></i>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="newOrderSubmit(0)">暂存</el-button>
        <el-button type="primary" @click="newOrderSubmit(1)">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getFormaMonth, getFormatDate } from "@/utils/common";
import {
  getSkuListPush,
  getSkuInfo,
  newOrderSubmit,
  newOrderEdit,
  newOrderEditTemp,
  newOrderReSubmit,
  newOrderTemp,
} from "@/api/newProductOrder/newOrderRecordDetails";
import { debounce } from "lodash";
export default {
  name: "NewOrderDetails",
  data() {
    return {
      dialogVisible: false,

      // 周次
      weekList: [1, 2, 3, 4],
      // 周次
      week: 1,
      reqParams: {
        // 采购说明
        purchaseDescribe: "",
        // 采购名称
        purchaseName: "",
        // 采购状态
        purchaseStatus: 1,
        // 采购时间
        purchaseTime: "",
        purchaseStatusName: "",
        // 提交状态
        submitStatus: 0,
        uuid: "",
      },
      orderList: [],
      selectLoading: false,
      selectFlag: true,
      skuList: [],
      // sku请求参数
      skuParams: {
        keyword: "",
        page: 1,
        pageSize: 10,
      },
    };
  },
  props: {
    propsData: {
      type: Object,
      default: () => {},
    },
    addPurchaseOrderLists: {
      type: Array,
      required: false,
    },
  },
  created() {},
  directives: {
    "el-select-loadmore": (el, binding) => {
      // 获取element-ui定义好的scroll盒子
      const SELECTWRAP_DOM = el.querySelector(
        ".el-select-dropdown .el-select-dropdown__wrap"
      );
      if (SELECTWRAP_DOM) {
        SELECTWRAP_DOM.addEventListener("scroll", function () {
          // console.log('this.scrollHeight: ', this.scrollHeight)
          // console.log('this.scrollTop: ', Math.round(this.scrollTop) + 1)
          // console.log('this.clientHeight: ', this.clientHeight)

          const condition =
            this.scrollHeight - (Math.round(this.scrollTop) + 1) <=
            this.clientHeight;
          // console.log('condition: ', condition)
          if (condition) binding.value();
        });
      }
    },
  },
  methods: {
    openDialog() {
      this.orderList = [];
      this.week = 1;
      this.getSkuList();
      this.reqParams = this.$options.data().reqParams;
      this.orderList = this.addPurchaseOrderLists;
      // this.getPurchaseName()
      this.reqParams.purchaseTime = this.propsData.purchaseTime;
      if (this.propsData.type == 0 || this.propsData.type == 3) {
        // if(this.propsData.total == null){
        //   let details = [
        //     {
        //     weeksType: 0,
        //     addNewProductsWeeksNumDetail: [
        //       {
        //         quantity: "",
        //         warehouseUuid: "MM_STOCK_ONLY"
        //       },
        //       {
        //         quantity: "",
        //         warehouseUuid: "222222222222222"
        //       }
        //     ]
        //   }
        //   ]
        //   this.orderList.forEach(item => {
        //    item.addNewProductsWeeksDetails = JSON.parse(JSON.stringify(details))
        // })
        // }else{
        //   this.week = this.propsData.totalWeek
        // }
        this.week = this.propsData.totalWeek;
        this.reqParams.uuid = this.propsData.uuid;
        this.reqParams.purchaseDescribe = this.propsData.purchaseDescribe;
        this.reqParams.purchaseName = this.propsData.purchaseName;
        this.reqParams.purchaseStatusName = this.propsData.purchaseStatusName;
        this.reqParams.purchaseStatus = this.propsData.purchaseStatus;
        this.reqParams.submitStatus = this.propsData.submitStatus;
        this.getSkuListByOrder();
      }

      this.dialogVisible = true;
    },
    closeDialog() {
      this.$emit("modalClosed");
      this.dialogVisible = false;
    },
    // 获取月
    getFormaMonth(time) {
      return getFormaMonth(time);
    },
    getFormatDate(time) {
      return getFormatDate(time);
    },
    // 新增
    addPurchase() {
      let n = this.week;
      let list = [];
      for (let i = 0; i < n; i++) {
        list.push({
          weeksType: i,
          addNewProductsWeeksNumDetail: [
            {
              quantity: "",
              warehouseUuid: "MM_STOCK_ONLY",
            },
            {
              quantity: "",
              warehouseUuid: "222222222222222",
            },
          ],
        });
      }
      this.orderList.push({
        addNewProductsWeeksDetails: list,
      });
    },
    // 删除
    deleteList(scope) {
      this.orderList.splice(scope.$index, 1);
      this.getPurchaseName();
    },
    // 拆分
    splitList(scope) {
      // console.log(scope.index)
      let cloneItem = structuredClone(scope.row);
      cloneItem.purchaseDetailUuid = "";
      this.orderList.splice(scope.$index + 1, 0, cloneItem);
    },

    // 打开时获取选中数据的skuUuid对应值
    async getSkuListByOrder() {
      for (let i = 0; i < this.orderList.length; i++) {
        console.log(this.orderList[i].skuCode);
        this.skuParams.keyword = this.orderList[i].skuCode;
        this.skuParams.page = 1;
        const res = await getSkuListPush(this.skuParams);
        const skuUuid = res.data.records[0].code;
        let status = true;
        this.skuList.map((item) => {
          if (item.code == skuUuid) {
            status = false;
          }
        });
        if (status) {
          this.skuList.push(res.data.records[0]);
        }
      }
    },
    // 获取sku列表
    async getSkuList() {
      this.selectLoading = true;
      const res = await getSkuListPush(this.skuParams);
      this.skuList = res.data.records;
      this.skuTotal = res.data.total;
      this.selectLoading = false;
    },
    // 下拉框出现时，调用过滤方法
    async visibleChange(flag) {
      this.skuParams.keyword = "";
      this.skuParams.page = 1;
      if (flag) {
        await this.getSkuList();
      }
    },
    filterMethod: debounce(async function (filterVal) {
      this.skuParams.page = 1;
      this.selectLoading = true;
      this.skuParams.keyword = filterVal ? filterVal : "";
      await this.getSkuList();
      this.selectFlag = true;
      this.selectLoading = false;
    }, 500),

    // sku下拉框加载更多
    async loadMore() {
      // const res = this.orderList.map( obj => this.skuList.includes(obj.skuUuid))
      if (this.skuList.length < this.skuTotal && this.selectFlag) {
        // this.skuParams.keyword = ""
        this.skuParams.page += 1;
        this.selectFlag = false;
        let res1 = await getSkuListPush(this.skuParams);
        if (this.skuParams.page == 1) {
          this.skuList = [];
        }
        res1.data.records.forEach((item) => {
          this.skuList.push(item);
        });
        this.skuTotal = res1.data.total;
        this.selectFlag = true;
        // console.log('this.reissueArrName', this.reissueArrName)
      }
    },
    // 根据sku获取信息
    async getSkuInfoById(scope) {
      let res = await getSkuInfo({
        skuUuid: scope.row.skuUuid,
        purchaseTime: this.reqParams.purchaseTime,
      });
      // Object.assign(this.orderList[scope.$index],res.data)
      Object.keys(res.data).forEach((key) => {
        // 使用 Vue.set 确保属性是响应式的
        this.$set(this.orderList[scope.$index], key, res.data[key]);
      });
      this.getPurchaseName();
      // this.$set(this.orderList, scope.$index, res.data)
    },
    // 生成采购名称
    getPurchaseName() {
      this.reqParams.purchaseName = "";
      let list = this.orderList.map((item) => item.spuShowName);
      const uniqueArr = [...new Set(list)];
      this.reqParams.purchaseName = uniqueArr.join(",");
    },
    getWeek() {
      if (this.orderList.length == 0) {
        return false;
      }
      let num = this.orderList[0].addNewProductsWeeksDetails.length;
      if (this.week > num) {
        this.orderList.forEach((item) => {
          for (let i = 0; i < this.week - num; i++) {
            item.addNewProductsWeeksDetails.push({
              addNewProductsWeeksNumDetail: [
                {
                  quantity: "",
                  warehouseUuid: "MM_STOCK_ONLY",
                },
                {
                  quantity: "",
                  warehouseUuid: "222222222222222",
                },
              ],
              weeksType: i + num,
            });
          }
        });
      } else if (this.week < num) {
        this.orderList.forEach((item) => {
          item.addNewProductsWeeksDetails.splice(this.week - 1, num - 1);
        });
      }
    },
    //提交前校验
    async newOrderSubmit(status) {
      this.reqParams.submitStatus = status;
      this.reqParams.addPurchaseOrderLists = this.orderList;
      for (let i = 0; i < this.orderList.length; i++) {
        if (
          this.orderList[i].skuUuid == "" ||
          this.orderList[i].skuUuid == undefined
        ) {
          return this.$message.error("请选择SKU");
        }
        if (
          this.orderList[i].mainSupplier == "" ||
          this.orderList[i].mainSupplier == undefined
        ) {
          return this.$message.error("请选择供应商");
        }
      }
      const purchaseQuantity = this.orderList.every(
        (item) =>
          item.purchaseQuantity != null &&
          item.purchaseQuantity != "" &&
          item.purchaseQuantity != undefined
      );
      if (!purchaseQuantity) {
        return this.$message.error("请填写采购数量");
      }
      if (status == 1) {
        const quantity = this.orderList.every((item) =>
          item.addNewProductsWeeksDetails.some(
            (iem1) =>
              iem1.addNewProductsWeeksNumDetail[0].quantity !== "" &&
              iem1.addNewProductsWeeksNumDetail[1].quantity !== ""
          )
        );
        if (!quantity) {
          return this.$message.error("请至少填写一周数据");
        }
      }
      let flag = this.orderList.some((item) =>
        item.addNewProductsWeeksDetails.some(
          (item1) =>
            item1.addNewProductsWeeksNumDetail[0].quantity === "" ||
            item1.addNewProductsWeeksNumDetail[1].quantity === ""
        )
      );
      if (flag) {
        this.$confirm(
          "每周采购数量不能为空！是否需要将采购数量为空的数据置为“0”？",
          {
            confirmButtonText: "是",
            cancelButtonText: "否",
            type: "warning",
            beforeClose: async (action, instance, done) => {
              if (action === "confirm") {
                instance.confirmButtonLoading = true;
                instance.confirmButtonText = "提交中...";
                // 组装本月的计划为空的值
                this.orderList.map((item) => {
                  item.addNewProductsWeeksDetails.forEach((item1) => {
                    if (item1.addNewProductsWeeksNumDetail[1].quantity === "") {
                      item1.addNewProductsWeeksNumDetail[1].quantity = "0";
                    }
                    if (item1.addNewProductsWeeksNumDetail[0].quantity === "") {
                      item1.addNewProductsWeeksNumDetail[0].quantity = "0";
                    }
                  });
                });

                instance.confirmButtonLoading = false;
                await done();
                // 调用接口

                this.submit(status);
              } else {
                await done();
              }
            },
          }
        );
      } else {
        this.submit(status);
      }
    },
    // 新增提交
    async submit(status) {
      let res = {};
      if (this.propsData.type == 1 && status == 1) {
        res = await newOrderSubmit(this.reqParams);
      } else if (this.propsData.type == 0 && status == 1) {
        res = await newOrderEdit(this.reqParams);
      } else if (
        (this.propsData.type == 0 || this.propsData.type == 3) &&
        status == 0
      ) {
        res = await newOrderEditTemp(this.reqParams);
      } else if (this.propsData.type == 3 && status == 1) {
        res = await newOrderReSubmit(this.reqParams);
      } else if (this.propsData.type == 1 && status == 0) {
        res = await newOrderTemp(this.reqParams);
      }

      if (res.data == true) {
        this.$message.success("操作成功");
        this.closeDialog();
      } else {
        this.$message.error("操作失败");
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.container {
  padding: 40px;
}
.content {
  margin-bottom: 20px;
}
.stat-item {
  display: flex;
  align-items: flex-start; /* 确保所有元素从顶部开始对齐 */
  margin: 10px 0;
}
.input-width {
  width: 300px;
}
.add-btn {
  text-align: center; /* 水平居中 */
}
.custom-width {
  width: 90px;
}
.title {
  text-align: right;
  min-width: 80px;
}
</style>
