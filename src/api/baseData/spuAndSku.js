import request from "@/utils/request";

// spu数据列表
export function getSpuList(query) {
  return request({
    url: "/server/product_manage/list",
    method: "post",
    data: query,
  });
}

// 新增spu
export function addSpu(data) {
  return request({
    url: "/server/product_manage/add",
    method: "post",
    data,
  });
}

// 修改spu
export function editSpu(data) {
  return request({
    url: `/server/product_manage/update`,
    method: "put",
    data,
  });
}

// 删除spu
export function deleteSpu(ids) {
  return request({
    url: `/server/product_manage/delete`,
    method: "delete",
    data: ids,
  });
}

// sku数据列表
export function getSkuList(query) {
  return request({
    url: "/server/sku_manage/list",
    method: "post",
    data: query,
  });
}
//sku新增
export function addSku(data) {
  return request({
    url: "/server/sku_manage/add",
    method: "post",
    data,
  });
}

// sku修改
export function editSku(data) {
  return request({
    url: `/server/sku_manage/update`,
    method: "put",
    data,
  });
}

// sku删除
export function deleteSku(ids) {
  return request({
    url: `/server/sku_manage/delete`,
    method: "delete",
    data: ids,
  });
}

// 上传主图密钥
export function getOssSign() {
  return request({
    url: `server/files/token_file_spu`,
    method: "get",
  });
}

// 供应商下拉
export function getSupplierList() {
  return request({
    url: `/server/supplier_home/list`,
    method: "get",
  });
}

// 负责人下拉
export function getPrincipalList() {
  return request({
    url: `/server/files/department`,
    method: "get",
  });
}

//项目品类下拉框
export function category(data) {
  return request({
    url: "/server/strategy/statistics/tree/category",
    method: "get",
    params: data,
  });
}

// 获取修改sku的供应商数据
export function getSupplierListById(id) {
  return request({
    url: `/server/sku_manage/all_supplier?skuUuid=${id}`,
    method: "get",
  });
}
