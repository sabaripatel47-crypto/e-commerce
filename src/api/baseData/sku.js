import request from "@/utils/request";

// sku管理数据列表
export function getSkuList(params) {
  return request({
    url: "/server/sku/list",
    method: "get",
    params,
  });
}

// 新增sku
export function addSku(data) {
  return request({
    url: "/server/sku/add",
    method: "post",
    data,
  });
}

// sku详情
export function skuDetail(id) {
  return request({
    url: `/server/sku/${id}`,
    method: "get",
  });
}

// 修改sku
export function editSku(data) {
  return request({
    url: `/server/sku/edit`,
    method: "post",
    data,
  });
}

// 删除sku
export function deleteSku(ids) {
  return request({
    url: `/server/sku/delete/${ids}`,
    method: "post",
  });
}
