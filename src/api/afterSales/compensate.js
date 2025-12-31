import request from "@/utils/request";

// 获取客服补偿单列表
export function customerList(data) {
  return request({
    url: "/server/compensate/customerList",
    method: "post",
    data,
  });
}

// 财务: 分页获取补偿登记数据
export function financeList(data) {
  return request({
    url: "/server/compensate/financeList",
    method: "post",
    data,
  });
}

// 根据订单号查询订单信息
export function orderNumberDetails(originalOrderId) {
  return request({
    url: `/server/compensate/orderNumberDetails/${originalOrderId}`,
    method: "get",
  });
}

//新增补偿登记
export function add(data) {
  return request({
    url: "/server/compensate/add",
    method: "post",
    data,
  });
}

//修改补偿登记
export function update(data) {
  return request({
    url: "/server/compensate/update",
    method: "put",
    data,
  });
}

//根据uuid查补偿登记的详情
export function details(uuid) {
  return request({
    url: `/server/compensate/details/${uuid}`,
    method: "get",
  });
}

//财务: 确认补偿登记数据
export function confirmed(uuid) {
  return request({
    url: `/server/compensate/confirmed/${uuid}`,
    method: "put",
  });
}

//客服: 作废补偿登记数据
export function customerVoid(data) {
  return request({
    url: "/server/compensate/customerVoid",
    method: "delete",
    data,
  });
}

//财务: 作废补偿登记数据
export function financeVoid(data) {
  return request({
    url: "/server/compensate/financeVoid",
    method: "delete",
    data,
  });
}

//补偿的oss图片签名
export function getCompensateOssSign() {
  return request({
    url: "/server/files/token_file_compensate",
    method: "get",
  });
}
