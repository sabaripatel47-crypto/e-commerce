import request from "@/utils/request";

// 大客户成交记录列表
export function dealListTop(data) {
  return request({
    url: "/server/bigCustomer/deal_list",
    method: "post",
    data: data,
  });
}

// 大客户成交记录-删除
export function deleteItem(data) {
  return request({
    url: "/server/deal/deal/delete",
    method: "get",
    params: data,
  });
}


// 大客户成交记录条件查询详情
export function detail(data) {
  return request({
    url: "/server/deal/deal/detail",
    method: "get",
    params: data,
  });
}

// 大客户成交记录条件查询列表-下层
export function queryList(data) {
  return request({
    url: "/server/deal/deal/query",
    method: "post",
    data: data,
  });
}

// 订单号录入
export function dealAdd(data) {
  return request({
    url: "/server/deal/deal_add",
    method: "post",
    data: data,
  });
}


// 是否下拉
export function isSaleOption(data) {
  return request({
    url: "/server/deal/deal/sale",
    method: "get",
    params: data,
  });
}

