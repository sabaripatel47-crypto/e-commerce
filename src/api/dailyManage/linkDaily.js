import request from "@/utils/request";

// 链接日报数据列表
export function getLinkDailyList(data) {
  return request({
    url: "/server/daily/linklist",
    method: "post",
    data: data,
  });
}

export function getLinkDailyDetail(data) {
  return request({
    url: "/server/daily/dailyList",
    method: "post",
    data: data,
  });
}

export function addLinkDailyDetail(data) {
  return request({
    url: "/server/daily/add",
    method: "post",
    data: data,
  });
}

// 获取日报问价上传签名
export function getOssSign() {
  return request({
    url: "/server/files/token_file",
    method: "get",
  });
}
