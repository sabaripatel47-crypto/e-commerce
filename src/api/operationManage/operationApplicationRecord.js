import request from "@/utils/request";

// 获取全部列表
export function getAllList(data) {
  return request({
    url: "/server/operation/operationPage",
    method: "post",
    data: data,
  });
}

// 获取驳回列表
export function getRejectList(data) {
  return request({
    url: "/server/operation/operationRejectPage",
    method: "post",
    data: data,
  });
}

// 获取子列表
export function getChildList(data) {
  return request({
    url: "/server/operation/operationDetailList",
    method: "post",
    data: data,
  });
}

// 计划月份新增
export function submitPlannedMonth(planTime) {
  return request({
    url: `/server/operation/lagerList/${planTime}`,
    method: "get",
  });
}

// 补单：计划月份补单
export function submitPlannedMonthB(planTime) {
  return request({
    url: `/server/operation/repairPlan/${planTime}`,
    method: "get",
  });
}

// 补单：获取补单计划名称
export function getPlanNameB(uuid) {
  return request({
    url: `/server/operation/getPlanName/${uuid}`,
    method: "get",
  });
}

// 新增时获取店铺（等级）下链接列表
export function getLinkList(data) {
  return request({
    url: `/server/operation/getLinkList`,
    method: "post",
    data: data,
  });
}

// 新增时获取链接下的所有sku列表（切换商品标题）
export function getSkuAddList(data) {
  return request({
    url: `/server/operation/getLinkToSkuList`,
    method: "post",
    data: data,
  });
}

// 获取sku的详情
export function getSkuDetail(data) {
  return request({
    url: "/server/operation/lagerAddAgain",
    method: "post",
    data: data,
  });
}

// 新增单条链接申请单（保存、保存并录入下一个）
export function addSingleLinkApply(data) {
  return request({
    url: "/server/operation/lagerAdd",
    method: "post",
    data: data,
  });
}

// 修改单条链接申请单
export function updateSingleLinkApply(data) {
  return request({
    url: "/server/operation/updateOperationDetail",
    method: "post",
    data: data,
  });
}

// 获取单链接下的sku申请列表
export function getSkuApplyList(data) {
  return request({
    url: `/server/operation/getOperationDetail`,
    method: "post",
    data: data,
  });
}

// 获取单链接申请的修改详情
export function getSingleLinkDetail(data) {
  return request({
    url: `/server/operation/updateOperationList`,
    method: "post",
    data: data,
  });
}

// 获取计划名称
export function getPlanName(operationUuid) {
  return request({
    url: `/server/operation/getPlanName/${operationUuid}`,
    method: "get",
  });
}

// 提交运营申请审核
export function submitOperationAuditAdd(data) {
  return request({
    url: "/server/operation/submitAdd",
    method: "post",
    data: data,
  });
}

// 获取运营申请的修改详情
export function getOperationApplyDetail(operationUuid) {
  return request({
    url: `/server/operation/operationUpdateList/${operationUuid}`,
    method: "get",
  });
}

// 重新发起运营申请
export function reapplyOperation(data) {
  return request({
    url: "/server/operation/submitAgain",
    method: "post",
    data: data,
  });
}

// 作废申请记录
export function invalidApply(data) {
  return request({
    url: "/server/operation/getConfirmIsInvalid",
    method: "post",
    data: data,
  });
}

// 获取申请详情
export function getApplyDetail(operationUuid) {
  return request({
    url: `/server/operation/getDetail/${operationUuid}`,
    method: "get",
  });
}

// 提交打爆申请审核
export function submitBurstAuditAdd(data) {
  return request({
    url: "/server/operation/blowAdd",
    method: "post",
    data: data,
  });
}

// 暂存打爆申请
export function submitBurstAuditSave(data) {
  return request({
    url: "/server/operation/blowStaging",
    method: "post",
    data: data,
  });
}

// 获取打爆申请的修改详情
export function getBurstApplyDetail(operationUuid) {
  return request({
    url: `/server/operation/blowList/${operationUuid}`,
    method: "get",
  });
}

// 暂存修改打爆申请
export function submitBurstAuditSaveUpdate(data) {
  return request({
    url: "/server/operation/blowStagingUpdate",
    method: "post",
    data: data,
  });
}

// 打爆计划修改接口（提交的修改）
export function submitBurstAuditUpdate(data) {
  return request({
    url: "/server/operation/blowUpdate",
    method: "post",
    data: data,
  });
}

// 重新发起打爆申请
export function reapplyBurst(data) {
  return request({
    url: "/server/operation/blowUpdateAgain",
    method: "post",
    data: data,
  });
}

// 获取链接的项目
export function getLinkStrategy(linkId) {
  return request({
    url: `/server/operation/getStrategy/${linkId}`,
    method: "get",
  });
}
