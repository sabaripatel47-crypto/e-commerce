import request from "@/utils/request";

// 店铺名称下拉框
export function listPush() {
  return request({
    url: "/server/store_manage/listPush",
    method: "get",
  });
}

// 项目商品列表
export function home_list(data) {
  return request({
    url: "/server/strategy/statistics/page/home_list",
    method: "POST",
    data: data,
  });
}

// 项目店铺列表
export function link_list(data) {
  return request({
    url: "/server/strategy/statistics/page/link_list",
    method: "POST",
    data: data,
  });
}

// 店铺商品等级下拉框
export function linkPush(data) {
  return request({
    url: "/server/public/linkPush",
    method: "get",
    params: data,
  });
}

// 项目等级下拉框
export function strategy_status(data) {
  return request({
    url: "/server/strategy/statistics/strategy_status",
    method: "get",
    params: data,
  });
}

// 项目品类下拉框
export function category(data) {
  return request({
    url: "/server/strategy/statistics/tree/category",
    method: "get",
    params: data,
  });
}

// 项目赛道下拉框
export function track(data) {
  return request({
    url: "/server/strategy/statistics/tree/track",
    method: "get",
    params: data,
  });
}

// 项目明细列表
export function getStrategyDetailList(data) {
  return request({
    url: "/server/strategy/statistics/page/link_details",
    method: "POST",
    data: data,
  });
}

// 商品项目配置详情接口
export function detailStrategy(data) {
  return request({
    url: "/server/strategy/statistics/strategy/detail",
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
// 项目统计配置导出
export function exportStrategyStatistics(data) {
  return request({
    url: "/server/strategy/statistics/page/home_list/export",
    method: "post",
    data: data,
    responseType: "blob",
  });
}
