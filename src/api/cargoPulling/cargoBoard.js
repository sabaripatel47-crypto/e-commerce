import request from "@/utils/request";

// 获取拉货看板列表
export function getCargoBoardList(data) {
  return request({
    url: `/server/ofld/ofldReports`,
    method: "post",
    data: data,
  });
}

export function downloadFile(data) {
  return request({
    url: `/server/ofld/ofldReportsForExcel`,
    method: "post",
    data,
    responseType: "arraybuffer",
  });
}