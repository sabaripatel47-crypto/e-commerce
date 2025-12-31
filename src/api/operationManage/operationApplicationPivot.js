import request from "@/utils/request";

// 获取数据透视表数据
export function getList(data) {
  return request({
    url: "/server/linkTable/perspective",
    method: "post",
    data: data,
  });
}

// 获取数据透视表数据合计条目
export function getTotal(data) {
  return request({
    url: "/server/linkTable/perspective/total",
    method: "post",
    data: data,
  });
}

// 获取数据透视表数据子表
export function getSubTable(data) {
  return request({
    url: "/server/linkTable/linkPerspective/detail",
    method: "post",
    data: data,
  });
}
