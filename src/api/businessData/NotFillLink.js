import request from "@/utils/request";

export function listLinkFill(data) {
  return request({
    url: "/server/LinkFillQuery/list",
    method: "post",
    data: data,
  });
}
