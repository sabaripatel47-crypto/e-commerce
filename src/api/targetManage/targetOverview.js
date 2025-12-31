import request from "@/utils/request";

// 获取环形进度条数据
export function getDataList(data) {
  return request({
    url: `/server/goal`,
    method: "post",
    data,
  });
}

// 获取下拉框数据
export function getOptionData() {
  return request({
    url: `/server/sales/operate_dept`,
    method: "get",
  });
}

// 获取部门 团组织架构
export function getDeptData(path) {
  return request({
    url: `/server/target/department/${path}`,
    method: "get",
  });
}
