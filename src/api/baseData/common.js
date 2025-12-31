import { listKeyData } from "@/api/system/dict/data";
import request from "@/utils/request";

export function systemData() {
  return request({
    url: `/server/public/systemData`,
    method: "get",
  });
}

//平台下拉框
export function listPlatform() {
  return listKeyData("sys_platform");
}

// 项目类型下拉框
export function listStrategyType() {
  return listKeyData("sys_strategy_type");
}

//店铺下拉框
export function listStore() {
  return request({
    url: `/server/store_manage/listPush`,
    method: "get",
  });
}

// 货品分类下拉框
export function categoryList() {
  return request({
    url: "/server/public/tree/category",
    method: "get",
  });
}

//店铺下拉框
export function listStoreByPlatformKey(query) {
  return request({
    url: `/server/store_manage/listPushByPlatform`,
    method: "get",
    params: query,
  });
}

// 根据店铺获取链接下拉框
export function getLinkSelectList(data) {
  return request({
    url: "/server/link_manage/storeToLinkPush",
    method: "post",
    data: data,
  });
}

// 根据店铺+等级获取链接下拉框
export function fetch_StoreToLinkLevelPush(data) {
  return request({
    url: "/server/link_manage/storeToLinkLevelPush",
    method: "post",
    data: data,
  });
}

//链接级别下拉框
export function listLinkLevel() {
  return request({
    url: `/server/public/linkPush`,
    method: "get",
  });
}
//产品等级下拉框
export function listSpuLevel() {
  return request({
    url: `/server/public/greedPush`,
    method: "get",
  });
}

//产品名称下拉框
export function listSpuName() {
  return request({
    url: `/server/product_manage/spuPush`,
    method: "get",
  });
}

//公司下拉框
export function listCompany() {
  return request({
    url: `/server/enterprise/getCompany`,
    method: "get",
  });
}

//所有上级部门的id
export function listAllUpperDept(query) {
  return request({
    url: `/server/every/userUuid/parent`,
    method: "get",
    params: query,
  });
}

// 获取文件uuid
export function getOSSFileUuid(data) {
  return request({
    url: `/server/files/uuid`,
    method: "post",
    data: data,
  });
}

// 根据文件uuid换取文件地址
export function getOSSFileUrl(data) {
  return request({
    url: `/server/files/geturl`,
    method: "post",
    data: data,
  });
}

//品牌下拉框
export function brandPush(query) {
  return request({
    url: `/server/brand/listPush`,
    method: "get",
    params: query,
  });
}
//产品类型下拉框
export function spuTypeList(query) {
  return request({
    url: `/server/public/spuTypePush`,
    method: "get",
    params: query,
  });
}

//链接下拉框
export function linkTypeList(query) {
  return request({
    url: `/server/link_manage/linkPush`,
    method: "get",
    params: query,
  });
}

//sku编码下拉框 TODO：现在没地方用，下版本可以删掉了
export function skuCodeTypeList(query) {
  return request({
    url: `/server/sku_manage/skuCodePush`,
    method: "get",
    params: query,
  });
}

// sku分页下拉框
export function skuPageList(data) {
  return request({
    url: `/server/public/purchaseToSkulist`,
    method: "post",
    data,
  });
}

//sku下拉框
export function skuCodeToProductCode(spuUuid) {
  return request({
    url: `/server/sku_manage/skuPush/${spuUuid}`,
    method: "get",
  });
}

//补偿类型，用于客服管理下补偿新增时使用
export function listCompensateType() {
  return listKeyData("compensate_type");
}

//补发类型下拉框
export function listReissueType() {
  return listKeyData("reissue_type");
}

//发票类型下拉框
export function listInvoiceType() {
  return request({
    url: `/server/invoiceRegister/listInvoiceType`,
    method: "get",
  });
}

//发票登记的状态下拉框
export function listInvoiceStatus() {
  return request({
    url: `/server/invoiceRegister/listInvoiceStatus`,
    method: "get",
  });
}

//链接阶段的下拉框
export function listLinkTimeStatus() {
  return request({
    url: `/server/public/linkType`,
    method: "get",
  });
}

//项目阶段的下拉框
export function listStrategyTimeStatus() {
  return request({
    url: `/server/public/strategyType`,
    method: "get",
  });
}

// 供应商下拉
export function getSupplierSelectList() {
  return request({
    url: `/server/supplier_home/list`,
    method: "get",
  });
}

// 获取品类下拉框
export function getCategorySelectList() {
  return request({
    url: "/server/strategy/statistics/tree/category",
    method: "get",
  });
}

// 获取产品类型下拉框
export function getSpuTypeSelectList() {
  return request({
    url: "/server/public/spuTypePush",
    method: "get",
  });
}
