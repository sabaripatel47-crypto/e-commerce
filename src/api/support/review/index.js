import request from "@/utils/request";

// 复核-全部 table
export function fetch_getAllList(data) {
  return request({
    url: "/server/helpSupport/allPage",
    method: "post",
    data: data,
  });
}

// 复核-我的驳回 table
export function fetch_getRejectList(data) {
  return request({
    url: "/server/helpSupport/rejectPage",
    method: "post",
    data: data,
  });
}

/**
 * 复核 - 单条详情
 * @param {*} helpSupportUuid 
 * @returns 
 * 
applyInformation	申请说明	string	
applyType	申请类型	integer(int32)	
applyTypeName	申请类型中文名称	string	
auditStatus	审核状态	integer(int32)	
auditStatusName	审核状态中文名称	string	
auditUuid	审核人	string	
auditUuidName	审核人中文名称	string	
helpSupportApplyName	帮扶复核人	string	
invalidReason	作废原因	string	
invalidTime	作废时间：时间戳	string	
isInvalid	是否作废	integer(int32)	
isInvalidName	是否作废中文名称	string	
operateApplyName	运营申请人	string	
rejectReason	驳回原因	string	
rejectTime	驳回时间：时间戳	string	
submitTime	提交时间：时间戳 string	
 */
export function fetch_getDetail(helpSupportUuid) {
  return request({
    url: `/server/helpSupport/getDetail/${helpSupportUuid}`,
    method: "get",
  });
}

/**
 * 复核 - 提交
 * @param {*} helpSupportUuid
 *
 */
export function fetch_submit(helpSupportUuid) {
  return request({
    url: `/server/helpSupport/submit/${helpSupportUuid}`,
    method: "get",
  });
}

/**
 * 帮扶复核-页面子级展示
 * POST
/server/helpSupport/sonDetail
入参：
{
categoryUuid	货品分类		false	
string
helpSupportUuid	帮扶uuid		true	
string
page	页码		true	
integer(int32)
pageSize	页大小		true	
integer(int32)
skuUuid	sku		false	
string
spuUuid	产品名称		false	
string
supplierUuid	供应商
}
出参：
allStock	总库存	integer	
categoryLevel	货品等级	string	
categoryLevelName	货品等级中文名称	string	
categoryName	货品分类名称	string	
categoryUuid	货品分类	string	
helpSupportUuid	帮扶主表uuid	string	
mainSupplier	主供应商	string	
mainSupplierName	主供应商中文名称	string	
operationApplyType	申请类型	integer	
operationApplyTypeName	申请类型中文名称	string	
predictRemainDay	预测剩余销售天数:保留一位小数	number	
productionNumber	生成周期	integer	
skuCode	sku编码	string	
skuUrl	sku图片地址	string	
skuUrlUuid	sku图片地址uuid	string	
skuUuid	skuUuid	string	
specsName	sku规格名称	string	
spuShowName	产品名称	string	
spuUuid	产品uuid	string	
stockNum	仓库存库	integer	
supplierStockNum	工厂库存	integer	
thisHelpJinPlan	本次帮扶京东复核数量	integer	
thisHelpMiMaiPlan	本次帮扶Miami复核数量	integer	
thisJinPlan	本次京东申请计划	integer	
thisMiMaiPlan	本次Miami申请计划	integer
 */
export function fetch_sonDetail(data) {
  return request({
    url: `/server/helpSupport/sonDetail`,
    method: "post",
    data,
  });
}

/**
帮扶审核-页面子级展示内容
POST
/server/helpSupport/sonDetailExamineData
{
  "helpSupportUuid": "",
  "linkId": "",
  "skuUuid": "",
  "spuUuid": ""
}
  出参：
  applyMoney	申请金额	number	
fiveteenDaysSales	十五天销量	integer(int32)	
helpSupportName	帮扶负责人中文名称	string	
isMainLink	是否主打	integer(int32)	
isMainLinkName	是否主打中文名称	string	
linkId		string	
linkLevel	链接等级	integer(int32)	
linkLevelName	链接等级中文名称	string	
linkTitle	链接标题	string	
manageName	链接负责人中文名称	string	
manageUuid	链接负责人	string	
planningName	项目负责人中文名称	string	
productionNumber	生成周期	integer(int32)	
sevenDaysSales	七天销量	integer(int32)	
skuCode	sku编码	string	
skuUrl	sku图片地址	string	
skuUrlUuid	sku图片地址uuid	string	
skuUuid	skuUuid	string	
specsName	sku规格名称	string	
storeCode	店铺简称	string	
storeName	店铺名称	string	
storeUuid	店铺uuid	string	
strategyName	项目名称	string	
strategyUuid	项目uuid	string	
supplierName	主供应商名称	string	
supplierUuid	主供应商uuid	string	
thirtyDaysSales	三十天销量	integer(int32)	
thisHelpJinPlan	本次帮扶京东复核数量	integer(int32)	
thisHelpMiMaiPlan	本次帮扶Miami复核数量	integer(int32)	
thisJinPlan	本次京东申请计划	array	string
thisMiMaiPlan	本次Miami申请计划	array	string
total	总数，用于排序出参	integer(int32)	
uuid	uuid	string
 */
export function fetch_sonDetailExamineData(data) {
  return request({
    url: `/server/helpSupport/sonDetailData`,
    method: "post",
    data,
  });
}

// 趋势图接口已迁移到 @/api/purchasingManagement/common.js
// 请使用: import { getLineChart, getTrendTable } from '@/api/purchasingManagement/common'

/**
 * 帮扶复核新增复制接口复制文档复制地址
POST
/server/helpSupport/add
入参：
{
  "applicationStatus": 0,
  "detail": [
    {
      "linkId": "",
      "skuUuid": "",
      "thisHelpJinPlan": 0,
      "thisHelpMiMaiPlan": 0,
      "uuid": ""
    }
  ],
  "helpSupportUuid": ""
}
  出参：
  {
	"code": 0,
	"data": true,
	"msg": ""
}
 */
export function fetch_add(data) {
  return request({
    url: `/server/helpSupport/add`,
    method: "post",
    data,
  });
}
