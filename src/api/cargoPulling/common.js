import request from "@/utils/request";

// 到货仓库下拉
export function getArrivalWarehouseList() {
  return request({
    url: "/server/ofld/ofldPush",
    method: "get"
  });
}
// 拉货仓库下拉
export function getPullingWarehouseList() {
  return request({
    url: "/server/ofld/pullOfldPush",
    method: "get"
  });
}
// 供应商列表
export function getSupplierList() {
  return request({
    url: '/server/supplier_home/list',
    method: 'get'
  })
}

// 产品名称列表
export function getProductNameList() {
  return request({
    url: '/server/product_manage/productName',
    method: 'get'
  })
}

// SKU列表
export function getSkuList(id) {
  return request({
    url: `/server/sku_manage/skuPush/${id}`,
    method: 'get'
  })
}

//货品分类下拉框
export function category(data) {
  return request({
    url: "/server/strategy/statistics/tree/category",
    method: "get",
    params: data,
  });
}

export function systemData() {
  return request({
    url: `/server/public/systemData`,
    method: "get",
  });
}

// 仓库记录
export function warehouseInventoryList(id) {
  return request({
    url: `/server/local_stock/record/List?skuUuid=${id}`,
    method: 'get',
  })
}