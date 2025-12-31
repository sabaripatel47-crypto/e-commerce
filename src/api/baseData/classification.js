import request from "@/utils/request";

// 品类列表
export function getCategoryList(data) {
  return request({
    url: `/server/classify/category/list`,
    method: "post",
    data: data,
  });
}

// 新增品类
export function addCategory(data) {
  return request({
    url: `/server/classify/category/add`,
    method: "post",
    data: data,
  });
}

// 修改品类
export function updateCategory(data) {
  return request({
    url: `/server/classify/category/update`,
    method: "post",
    data: data,
  });
}

// 赛道列表
export function getTrackList(data) {
  return request({
    url: `/server/classify/track/list`,
    method: "post",
    data: data,
  });
}

// 新增赛道
export function addTrack(data) {
  return request({
    url: `/server/classify/track/add`,
    method: "post",
    data: data,
  });
}

// 修改赛道
export function updateTrack(data) {
  return request({
    url: `/server/classify/track/update`,
    method: "post",
    data: data,
  });
}

// 人群列表
export function getCrowdList(data) {
  return request({
    url: `/server/classify/crowd/list`,
    method: "post",
    data: data,
  });
}

// 新增人群
export function addCrowd(data) {
  return request({
    url: `/server/classify/crowd/add`,
    method: "post",
    data: data,
  });
}

// 修改人群
export function updateCrowd(data) {
  return request({
    url: `/server/classify/crowd/update`,
    method: "post",
    data: data,
  });
}

// 价格带列表
export function getPriceList(data) {
  return request({
    url: `/server/classify/price/list`,
    method: "post",
    data: data,
  });
}

// 新增价格带
export function addPrice(data) {
  return request({
    url: `/server/classify/price/add`,
    method: "post",
    data: data,
  });
}

// 修改价格带
export function updatePrice(data) {
  return request({
    url: `/server/classify/price/update`,
    method: "post",
    data: data,
  });
}

// 器型列表
export function getShapeList(data) {
  return request({
    url: `/server/classify/shape/list`,
    method: "post",
    data: data,
  });
}

// 新增器型
export function addShape(data) {
  return request({
    url: `/server/classify/shape/add`,
    method: "post",
    data: data,
  });
}

// 修改器型
export function updateShape(data) {
  return request({
    url: `/server/classify/shape/update`,
    method: "post",
    data: data,
  });
}

// 获取状态列表
export function getStatusList() {
  return request({
    url: `/server/strategy/statistics/strategy/type`,
    method: "get",
  });
}
