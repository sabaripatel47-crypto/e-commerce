import request from "@/utils/request";

// 店铺管理数据列表
export function getStoreList(params) {
  return request({
    url: "/server/store/list",
    method: "get",
    params,
  });
}

// 新增店铺
export function addStore(data) {
  return request({
    url: "/server/store/add",
    method: "post",
    data,
  });
}

// 店铺详情
export function storeDetail(id) {
  return request({
    url: `/server/store/${id}`,
    method: "get",
  });
}

// 修改店铺
export function editStore(data) {
  return request({
    url: `/server/store/edit`,
    method: "post",
    data,
  });
}

// 删除店铺
export function deleteStore(ids) {
  return request({
    url: `/server/store/delete/${ids}`,
    method: "post",
  });
}
