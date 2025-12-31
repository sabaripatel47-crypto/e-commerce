import request from "@/utils/request";

// 供应商品明细管理数据列表
export function getSPDList(query) {
  return request({
    url: "/server/supplyProductDetail/list",
    method: "post",
    params: query,
  });
}

// 新增供应商品明细
export function addSPD(data) {
  return request({
    url: "/server/supplyProductDetail/add",
    method: "post",
    data,
  });
}

// 供应商品明细详情
export function SPDDetail(id) {
  return request({
    url: `/server/supplyProductDetail/${id}`,
    method: "get",
  });
}

// 修改供应商品明细
export function editSPD(data) {
  return request({
    url: `/server/supplyProductDetail/edit`,
    method: "post",
    data,
  });
}

// 删除供应商品明细
export function deleteSPD(ids) {
  return request({
    url: `/server/supplyProductDetail/delete/${ids}`,
    method: "post",
  });
}
