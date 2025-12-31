import request from "@/utils/request";

// 店铺管理数据列表
export function getStoreList(data) {
  return request({
    url: "/server/store_manage/list",
    method: "post",
    data: data,
  });
}

// 新增店铺
export function addStore(data) {
  return request({
    url: "/server/store_manage/add",
    method: "post",
    data,
  });
}

// 修改店铺
export function editStore(data) {
  return request({
    url: "/server/store_manage/update",
    method: "put",
    data: data,
  });
}

// 删除店铺
export function deleteStore(data) {
  return request({
    url: "/server/store_manage/delete",
    method: "delete",
    data: data,
  });
}
