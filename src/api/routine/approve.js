import request from "@/utils/request";

// 获取所有发起的流程列表
export function getList(query) {
  return request({
    url: "/server/every/user/leaders",
    method: "get",
    params: query,
  });
}

// 提交审批
export function submitApp(data) {
  return request({
    url: "/server/every/leaders/audit/update",
    method: "post",
    data,
  });
}

// 获取详情
export function getDetail(ids) {
  return request({
    url: `/server/query/user/selectById/${ids}`,
    method: "get",
  });
}
