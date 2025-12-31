import request from "@/utils/request";

// 获取采购看板列表
export function getPurchaseBoardTableList(data) {
  return request({
    url: `/server/purchase/getPurchaseReportsList`,
    method: "post",
    data: data,
  });
}

// 获取运营申请计划列表
export function getOperationApplyPlanTableList(data) {
  return request({
    url: `/server/purchase/getPurchaseReportsList`,
    method: "post",
    data: data,
  });
}