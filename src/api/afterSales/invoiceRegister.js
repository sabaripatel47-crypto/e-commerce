import request from "@/utils/request";

// 获取客服补偿单列表
export function customerList(data) {
  return request({
    url: "/server/invoiceRegister/customerList",
    method: "post",
    data,
  });
}

//获取客服补偿单驳回列表
export function customerRejectedList(data) {
  return request({
    url: "/server/invoiceRegister/customerRejectedList",
    method: "post",
    data,
  });
}

//财务(待开发票): 发票登记列表数据
export function financeUnInvoicingList(data) {
  return request({
    url: "/server/invoiceRegister/financeUnInvoicingList",
    method: "post",
    data,
  });
}

//财务(全部): 发票登记列表数据
export function financeList(data) {
  return request({
    url: "/server/invoiceRegister/financeList",
    method: "post",
    data,
  });
}

//根据订单号查询店铺金额等数据
export function orderNumberDetails(query) {
  return request({
    url: `/server/invoiceRegister/orderNumberDetails`,
    method: "get",
    params: query,
  });
}

//发票登记的详情
export function details(query) {
  return request({
    url: `/server/invoiceRegister/details`,
    method: "get",
    params: query,
  });
}

//客服新增发票登记
export function customerAdd(data) {
  return request({
    url: "/server/invoiceRegister/customerAdd",
    method: "post",
    data,
  });
}

//客服修改发票登记
export function customerUpdate(data) {
  return request({
    url: "/server/invoiceRegister/customerUpdate",
    method: "put",
    data,
  });
}

//客服: 修改发票登记数据(驳回后提交)
export function submittedAfterRejection(data) {
  return request({
    url: "/server/invoiceRegister/submittedAfterRejection",
    method: "put",
    data,
  });
}

//客服作废
export function customerVoid(data) {
  return request({
    url: "/server/invoiceRegister/customerVoid",
    method: "delete",
    data,
  });
}

//财务作废
export function financeVoid(data) {
  return request({
    url: "/server/invoiceRegister/financeVoid",
    method: "delete",
    data,
  });
}

//财务: 确认发票登记数据
export function confirmed(query) {
  return request({
    url: "/server/invoiceRegister/confirmed",
    method: "put",
    params: query,
  });
}

//财务: 驳回发票登记数据
export function rejection(data) {
  return request({
    url: "/server/invoiceRegister/rejection",
    method: "put",
    data,
  });
}
