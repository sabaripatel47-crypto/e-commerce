import request from "@/utils/request";

// 获取列表
export function getList(data) {
  return request({
    url: "/server/every/my/examine/list",
    method: "post",
    data,
  });
}
