import request from "@/utils/request";

export function getErpSaleOrderList(data) {
  return request({
    url: "/server/ErpSaleOrder/list",
    method: "post",
    data: data,
  });
}

export function deleteOrderImport(uuid) {
  return request({
    url: `/server/ErpSaleOrder/delete/${uuid}`,
    method: "delete",
  });
}

export function uploadOrderImport(data) {
  return request({
    url: "/server/ErpSaleOrder/upload",
    method: "post",
    data: data,
  });
}

//取指定链接的状态
export function getErpOrderStatus(uuid) {
  return request({
    url: `/server/ErpSaleOrder/getErpOrderStatus/${uuid}`,
    method: "get",
  });
}

// 退货数据导入
export function uploadReturnOrderImport(data) {
  return request({
    url: "/server/erpRefundGoods/upload",
    method: "post",
    data: data,
  });
}