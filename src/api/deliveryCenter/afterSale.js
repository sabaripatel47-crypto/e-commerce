import request from "@/utils/request";

// 四个问题量
export function getFourQuestion(data) {
  return request({
    url: "/server/afterSale/afterSale_productNumber",
    method: "post",
    data
  });
}

// 售后表格
export function getAfterSaleTable(data) {
  return request({
    url: "/server/afterSale/afterSale_table",
    method: "post",
    data
  });
}

// 柱状图/折线图
export function getAfterSaleChart(data) {
  return request({
    url: "/server/afterSale/afterSale_quantityLineChart",
    method: "post",
    data
  });
}

// 标题数据
export function getAfterSaleTitle(data) {
  return request({
    url: "/server/afterSale/afterSale_tableTitle",
    method: "post",
    data
  });
}

// 详情部分

// 职能部门
export function getAfterSaleDetail(data) {
  return request({
    url: "/server/afterSale/afterSaleDetail_deptFurtherTable",
    method: "post",
    data
  });
}

// 职能部门子表
export function getAfterSaleDetailChild(data) {
  return request({
    url: "/server/afterSale/afterSaleDetail_deptSonTable",
    method: "post",
    data
  });
}
//职能部门二级表格
export function getAfterSaleDetailChild2(data) {
  return request({
    url: "/server/afterSale/afterSaleDetail_deptLevelTwoTable",
    method: "post",
    data
  });
}

// 职能部门折线图
export function getAfterSaleDetailChart(data) {
  return request({
    url: "/server/afterSale/afterSaleDetail_amountLineChart",
    method: "post",
    data
  });
}

// 职能部门耳机表格折线图
export function getAfterSaleDetailChart2(data) {
  return request({
    url: "/server/afterSale/afterSaleDetail_levelTwoLineChart",
    method: "post",
    data
  });
}
// SPU
// 职能下拉框
export function getAfterSaleDetailSPU() {
  return request({
    url: "/server/afterSale/getDeptPush",
    method: "get",
  });
}

// 问题类型下拉框
export function getAfterSaleDetailSPUType(id) {
  return request({
    url: `/server/afterSale/getDeptLevelPush/${id}`,
    method: "get",
  });
}
// 职能问题二下拉框
export function getAfterSaleDetailSPUType2(id) {
  return request({
    url: `/server/afterSale/getDeptLevelTwoPush/${id}`,
    method: "get",
  });
}

// SPU表格数据
export function getAfterSaleDetailSPUTable(data) {
  return request({
    url: "/server/afterSale/afterSaleDetailSpu",
    method: "post",
    data
  });
}

// SKU表格数据
export function getAfterSaleDetailSKUTable(data) {
  return request({
    url: "/server/afterSale/afterSaleDetailSpuBySku",
    method: "post",
    data
  });
}

// SPU折线图
export function getAfterSaleDetailSPUChart(data) {
  return request({
    url: "/server/afterSale/afterSale_spuLineChart",
    method: "post",
    data
  });
}
// SKU折线图
export function getAfterSaleDetailSKUChart(data) {
  return request({
    url: "/server/afterSale/afterSaleDetail_skuLineChart",
    method: "post",
    data
  });
}

// 跳转订单明细
export function getAfterSaleDetailOrder(data) {
  return request({
    url: "/server/afterSale/getFeiSuoOrderDetail",
    method: "post",
    data
  });
}