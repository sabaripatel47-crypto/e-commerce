import request from "@/utils/request";

// 公司管理数据列表
export function getEnterpriseList(query) {
  return request({
    url: "/server/enterprise/list",
    method: "post",
    params: query,
  });
}

// 新增公司
export function addEnterprise(data) {
  return request({
    url: "/server/enterprise/add",
    method: "post",
    data,
  });
}

// 公司详情
export function enterpriseDetail(id) {
  return request({
    url: `/server/enterprise/${id}`,
    method: "get",
  });
}

// 修改公司
export function editEnterprise(data) {
  return request({
    url: `/server/enterprise/edit`,
    method: "post",
    data,
  });
}

// 删除公司
export function deleteEnterprise(ids) {
  return request({
    url: `/server/enterprise/delete/${ids}`,
    method: "post",
  });
}
