import request from "@/utils/request";

// 查询组列表
export function getGroupList() {
  return request({
    url: "/server/allGroup",
    method: "post",
  });
}

// 查询组成员
export function getMemberList(data) {
  return request({
    url: "/server/GroupMemberList",
    method: "post",
    data,
  });
}

// 新增组
export function addGroup(data) {
  return request({
    url: "/server/addGroup",
    method: "post",
    data,
  });
}

// 删除组
export function deleteGroup(data) {
  return request({
    url: "/server/deleteGroup",
    method: "post",
    data,
  });
}

// 添加组成员
export function addMember(data) {
  return request({
    url: "/server/memberAddGroup",
    method: "post",
    data,
  });
}

// 删除组成员
export function deleteMember(data) {
  return request({
    url: "/server/memberDelGroup",
    method: "post",
    data,
  });
}

// 合并组
export function mergeGroup(data) {
  return request({
    url: "/server/mergeGroup",
    method: "post",
    data,
  });
}

// 组重命名
export function renameGroup(data) {
  return request({
    url: "/server/renameGroup",
    method: "post",
    data,
  });
}
