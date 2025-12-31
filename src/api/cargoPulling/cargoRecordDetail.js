import request from "@/utils/request";
import { listKeyData } from "@/api/system/dict/data";
// 拉货分页列表
export function getPullingRecordsList(data) {
  return request({
    url: "/server/ofld/ofldPage", 
    method: "post",
    data
  });
}

// 安全库存警戒下拉

export function getSafetyStockList() {
  return request({
    url: "/server/ofld/ofldWarnLinePush",
    method: "get"
  });
}

// 退货原因列表
export function listPlatform() {
  return listKeyData("ofld_refund_reason");
}

// sku编码下拉框
export function getSkuCodeList(data) {
  return request({
    url: `/server/stock_supplier/sku_list`,
    method: "post",
    data:data
  });
}

// 根据skuUuid获取图片地址
export function getImgUrl(data) {
  return request({
    url: `/server/stock_supplier/sku_image`,
    method: "post",
    data:data
  });
}

// 修改类型下拉
export function getChangeTypeList() {
  return request({
    url: `/server/stock_supplier/update_type`,
    method: "get"
  });
}

// 退货详情
export function returnGoodsDetail(data) {
  return request({
    url: `/server/stock_supplier/return_details`,
    method: "post",
    data:data
  });
}

// 退货
export function returnGoods(data) {
  return request({
    url: `/server/stock_supplier/return_goods`,
    method: "post",
    data
  });
}

// 换货
export function exchangeGoods(data) {
  return request({
    url: `/server/stock_supplier/exchange_goods`,
    method: "post",
    data
  });
}

// sku下拉框
export function getSkuListPush(data) {
  return request({
    url: '/server/public/purchaseToSkulist',
    method: 'post',
    data
  })
}

// 根据sku获取信息
export function getSkuInfo(id) {
  return request({
    url: `/server/purchase/getSkuDetail/${id}`,
    method: 'post'
  })
}

// 获取供应商
export function getSupplierList(skuUuid) {
  return request({
    url: `/server/ofld/lagerAddAgain/${skuUuid}`,
    method: 'get'
  })
}

// 获取供应商库存数据
export function getSupplierStockList(data) {
  return request({
    url: `/server/ofld/getSupplierStockNum`,
    method: 'post',
    data
  })
}

// 拉货下单
export function pullingOrder(data) {
  return request({
    url: `/server/ofld/addOfldOrder`,
    method: 'post',
    data
  })
}
// 拉货修改
export function pullingOrderUpdate(data) {
  return request({
    url: `/server/ofld/ofldRecordUpate`,
    method: 'post',
    data
  })
}

// 获取销量
export function getSaleNum(data) {
  return request({
    url: `/server/ofld/ofldOrderSales`,
    method: 'post',
    data
  })
}

// 运营计划详情
export function getPurchaseDetail(data) {
  return request({
    url: '/server/ofld/operationDetail',
    method: 'post',
    data
  })
}

// 获取生产周期数据
export function getProductionCycleList(data) {
  return request({
    url: `/server/newProducts/getSupplierProductTime`,
    method: 'post',
    data
  })
}