import request from "@/utils/request";

// 获取SPU总看板列表
export function getSpuTableList(data) {
  return request({
    url: `/server/purchase/getPurchaseReports`,
    method: "post",
    data: data,
  });
}

// 获取SPU销量列表
export function getSalesTableList(spuUuid) {
  return request({
    url: `/server/purchase/getPurchaseReports/${spuUuid}`,
    method: "get",
  });
}

// 获取SPU销量折线图
export function getSalesLineList(spuUuid) {
  return request({
    url: `/server/purchase/getPurchaseReportsLine/${spuUuid}`,
    method: "get",
  });
}
