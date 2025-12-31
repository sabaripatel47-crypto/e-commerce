import request from "@/utils/request";

// 获取列表
export function getList(query) {
  return request({
    url: "/server/every/my/dispose/list",
    method: "get",
    params: query,
  });
}
