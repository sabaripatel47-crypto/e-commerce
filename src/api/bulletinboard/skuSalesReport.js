import request from "@/utils/request";

// 获取时间动态表头
export function getTableHeader(data) {
  return request({
    url: "/server/movement/table",
    method: "post",
    data,
  });
}

// 获取spu销售表
export function getSkuSalesList(data) {
  return request({
    url: "/server/movement/sku_movement",
    method: "post",
    data,
  });
}
