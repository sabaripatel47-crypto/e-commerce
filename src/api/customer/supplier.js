import request from "@/utils/request";

// 供应商管理数据列表
export function getSupplierList(query) {
  return request({
    url: "/server/supplier/list",
    method: "post",
    params: query,
  });
}

// 新增供应商
export function addSupplier(data) {
  return request({
    url: "/server/supplier/add",
    method: "post",
    data,
  });
}

// 供应商详情
export function supplierDetail(id) {
  return request({
    url: `/server/supplier/${id}`,
    method: "get",
  });
}

// 修改供应商
export function editSupplier(data) {
  return request({
    url: `/server/supplier/edit`,
    method: "post",
    data,
  });
}

// 删除供应商
export function deleteSupplier(ids) {
  return request({
    url: `/server/supplier/delete/${ids}`,
    method: "post",
  });
}
