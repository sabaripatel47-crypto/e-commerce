import request from "@/utils/request";
//项目品类下拉框
export function category(data) {
  return request({
    url: "/server/strategy/statistics/tree/category",
    method: "get",
    params: data,
  });
}

//项目赛道下拉框
export function track(data) {
  return request({
    url: "/server/strategy/statistics/tree/track",
    method: "get",
    params: data,
  });
}

//项目状态下拉框
export function type(data) {
  return request({
    url: "/server/strategy/statistics/strategy/type",
    method: "get",
    params: data,
  });
}

// 项目器型下拉
export function shape() {
  return request({
    url: "/server/strategy/statistics/tree/shape",
    method: "get",
  });
}

// 项目价格带下拉
export function price() {
  return request({
    url: "/server/strategy/statistics/tree/price_zone",
    method: "get",
  });
}

// 项目人群下拉
export function crowd() {
  return request({
    url: "/server/strategy/statistics/tree/crowd",
    method: "get",
  });
}

//商品项目配置分页列表
export function pageList(data) {
  return request({
    url: "/server/strategy/statistics/configuration/page",
    method: "POST",
    data: data,
  });
}

//商品项目配置删除接口
export function delstrategy(data) {
  return request({
    url: "/server/strategy/statistics/delete/strategy",
    method: "get",
    params: data,
  });
}

//商品项目配置新增接口
export function addStrategy(data) {
  return request({
    url: "/server/strategy/statistics/add/strategy",
    method: "post",
    data: data,
  });
}

//商品项目配置修改接口
export function editStrategy(data) {
  return request({
    url: "/server/strategy/statistics/update/strategy",
    method: "post",
    data: data,
  });
}

//商品项目配置详情接口
export function detailStrategy(data) {
  return request({
    url: "/server/strategy/statistics/strategy/detail",
    method: "get",
    params: data,
  });
}

//项目状态下拉框
export function strategyGrade(data) {
  return request({
    url: "/server/strategy/statistics/strategy_status",
    method: "get",
    params: data,
  });
}

// 获取oss文件上传签名
export function getOssSign() {
  return request({
    url: "/server/files/token_strategy",
    method: "get",
  });
}

// 项目统计配置导出
export function exportStrategy(data) {
  return request({
    url: "/server/strategy/statistics/configuration/page/export",
    method: "post",
    data: data,
    responseType: "blob",
  });
}
