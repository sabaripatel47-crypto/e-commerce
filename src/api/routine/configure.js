import request from "@/utils/request";

// 获取所有流程列表
export function getFlowList(data) {
  return request({
    url: "/server/every/work/query",
    method: "post",
    data,
  });
}

// 获取我配置的发起流程
export function getMyFlows(data) {
  return request({
    url: "/server/every/my/flow",
    method: "post",
    data,
  });
}

// 新增流程配置
export function addFlow(data) {
  return request({
    url: "/server/every/work/add",
    method: "post",
    data,
  });
}

// 获取部门组织架构
export function department() {
  return request({
    url: "/server/files/department",
    method: "get",
  });
}

// 删除流程
export function deleteFlow(ids) {
  return request({
    url: `/server/every/work/delete/${ids}`,
    method: "get",
  });
}

// 配置审批流程
export function addExamine(data) {
  return request({
    url: "/server/every/super/dept/list",
    method: "post",
    data,
  });
}

// 获取流程详情
export function flowDetail(ids) {
  return request({
    url: `/server/every/work/get/${ids}`,
    method: "get",
  });
}

// 修改流程
export function editFlow(data) {
  return request({
    url: "/server/every/work/update",
    method: "post",
    data,
  });
}

// 修改审批流程
export function editExamine(data) {
  return request({
    url: "/server/add/dept/update",
    method: "post",
    data,
  });
}
