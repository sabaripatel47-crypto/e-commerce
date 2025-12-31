import request from "@/utils/request";

//部门组织结果
export function getDepartmentList() {
  return request({
    url: `system/depatment/deptList`,
    method: "get",
  });
}

//部门带成员组织结果
export function getDepartmentUserList() {
  return request({
    url: `system/depatment/deptList_user`,
    method: "get",
  });
}

//平台


//店铺
