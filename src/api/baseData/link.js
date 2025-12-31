import request from "@/utils/request";

// 链接管理数据列表
export function getLinkList(query) {
  return request({
    url: "/server/url/list",
    method: "post",
    params: query,
  });
}

// 新增链接
export function addLink(data) {
  return request({
    url: "/server/url/add",
    method: "post",
    data,
  });
}

// 链接详情
export function linkDetail(id) {
  return request({
    url: `/server/url/${id}`,
    method: "get",
  });
}

// 修改链接
export function editLink(data) {
  return request({
    url: `/server/url/edit`,
    method: "post",
    data,
  });
}

// 删除链接
export function deleteLink(ids) {
  return request({
    url: `/server/url/delete/${ids}`,
    method: "post",
  });
}
