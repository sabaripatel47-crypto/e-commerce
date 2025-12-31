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
export function getSpuSalesList(data) {
  return request({
    url: "/server/movement/spu_movement",
    method: "post",
    data,
  });
}
