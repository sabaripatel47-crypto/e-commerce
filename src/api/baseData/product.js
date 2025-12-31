import request from "@/utils/request";

// 产品管理数据列表
export function getProductList(query) {
  return request({
    url: "/server/product/list",
    method: "post",
    params: query,
  });
}

// 新增产品
export function addProduct(data) {
  return request({
    url: "/server/product/add",
    method: "post",
    data,
  });
}

// 产品详情
export function productDetail(id) {
  return request({
    url: `/server/product/${id}`,
    method: "get",
  });
}

// 修改产品
export function editProduct(data) {
  return request({
    url: `/server/product/edit`,
    method: "post",
    data,
  });
}

// 删除产品
export function deleteProduct(ids) {
  return request({
    url: `/server/product/delete/${ids}`,
    method: "post",
  });
}
