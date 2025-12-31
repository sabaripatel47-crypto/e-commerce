import request from "@/utils/request";

export function getLinkStatisticsList(data) {
  return request({
    url: "/server/linkStatistics/list",
    method: "post",
    data: data,
  });
}

export function deleteLinkStatistics(uuid) {
  return request({
    url: `/server/linkStatistics/delete/${uuid}`,
    method: "delete",
  });
}

export function uploadLinkStatistics(data) {
  return request({
    url: `/server/linkStatistics/upload`,
    method: "post",
    data: data,
  });
}

//取指定链接的状态
export function getLinkStatisticsStatus(uuid) {
  return request({
    url: `/server/linkStatistics/getLinkStatisticsStatus/${uuid}`,
    method: "get",
  });
}
