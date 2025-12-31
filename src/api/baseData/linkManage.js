import request from "@/utils/request";

// 链接管理数据列表
export function getLinkList(data) {
  return request({
    url: "/server/link_manage/list",
    method: "post",
    data: data,
  });
}

// 新增链接
export function addLink(data) {
  return request({
    url: "/server/link_manage/add",
    method: "post",
    data,
  });
}

// 修改链接
export function editLink(data) {
  return request({
    url: "/server/link_manage/update",
    method: "put",
    data: data,
  });
}

// 删除链接
export function deleteLink(data) {
  return request({
    url: "/server/link_manage/delete",
    method: "delete",
    data: data,
  });
}

// 获取oss文件上传签名
export function getOssSign() {
  return request({
    url: "/server/files/token_file_link",
    method: "get",
  });
}

// 获取赛道下拉框数据
export function pullLink(data) {
  return request({
    url: "/server/strategy/statistics/strategy/pull",
    method: "get",
    data: data,
  });
}

// 下架链接
export function downLink(data) {
  return request({
    url: "/server/link_manage/deactivate",
    method: "post",
    data: data,
  });
}

// 链接导出
export function exportLink(data) {
  return request({
    url: "server/link_manage/list",
    method: "post",
    data: data,
    responseType: "blob",
  });
}

// 模糊查询产品名称
export function getProductName(data) {
  return request({
    url: `/server/product_manage/getSpuName`,
    method: "post",
    data: data,
  });
}
