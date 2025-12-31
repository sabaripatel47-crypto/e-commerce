import request from "@/utils/request";



// 拉货记录列表
export function getPullingRecordsList(data) {
  return request({
    url: "/server/ofld/ofldRecordPage",
    method: "post",
    data
  });
}

// 拉货记录子集
export function getPullingRecordsChildList(data) {
  return request({
    url: "/server/ofld/ofldPageDetail",
    method: "post",
    data
  });
}

// 修改获取详情列表
export function getPullingRecordsDetail(id) {
  return request({
    url: `/server/ofld/ofldRecordUpate/${id}`,
    method: "get",
  });
}