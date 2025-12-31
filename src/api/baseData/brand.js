import request from "@/utils/request";

// 品牌管理数据列表
export function getBrandList(query) {
  return request({
    url: "/server/brand/list",
    method: "post",
    params: query,
  });
}

// 新增品牌
export function addBrand(data) {
  return request({
    url: "/server/brand/add",
    method: "post",
    data,
  });
}

// 品牌详情
export function brandDetail(id) {
  return request({
    url: `/server/brand/${id}`,
    method: "get",
  });
}

// 修改品牌
export function editBrand(data) {
  return request({
    url: `/server/brand/edit`,
    method: "post",
    data,
  });
}

// 删除品牌
export function deleteBrand(ids) {
  return request({
    url: `/server/brand/delete/${ids}`,
    method: "post",
  });
}

// 图片上传
export function imgUpload(data) {
  return request({
    url: `/server/sku/upload`,
    method: "post",
    data,
  });
}
