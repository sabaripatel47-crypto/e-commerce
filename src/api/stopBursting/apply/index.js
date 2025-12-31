import request from "@/utils/request";

/**
 * 停止打爆申请：分页-全部
 * 入参
 * {
  "auditStatus": 0,
  "endTime": "",
  "isInvalid": 0,
  "page": 0,
  "pageSize": 0,
  "planName": "",
  "sourceType": 0,
  "startTime": ""
}
  出参：
  code		integer(int32)	integer(int32)
data		PageResult«StopBlowPageVO»	PageResult«StopBlowPageVO»
records		array	StopBlowPageVO
applicationTime	停止日期：时间戳	string	
applyInformation	停止申请说明	string	
applyName	停止申请人中文名称	string	
applyUuid	停止申请人Uuid	string	
auditStatus	审核状态	integer	
auditStatusName	审核状态中文名称	string	
invalid		boolean	
operationUuid	运营主表uuid	string	
planName	原计划名称	string	
submitTime	停止提交日期：时间戳	string	
total		integer(int64)	
msg		string
 */
export function getApplyList(data) {
  return request({
    url: "/server/operation/stopBlow/allPage",
    method: "post",
    data: data,
  });
}

/**
 * 停止打爆申请：分页-我的驳回
 * 入参
 * {
  "auditStatus": 0,
  "endTime": "",
  "isInvalid": 0,
  "page": 0,
  "pageSize": 0,
  "planName": "",
  "sourceType": 0,
  "startTime": ""
}
  出参：
  code		integer(int32)	integer(int32)
data		PageResult«StopBlowPageVO»	PageResult«StopBlowPageVO»
records		array	StopBlowPageVO
applicationTime	停止日期：时间戳	string	
applyInformation	停止申请说明	string	
applyName	停止申请人中文名称	string	
applyUuid	停止申请人Uuid	string	
auditStatus	审核状态	integer	
auditStatusName	审核状态中文名称	string	
invalid		boolean	
operationUuid	运营主表uuid	string	
planName	原计划名称	string	
submitTime	停止提交日期：时间戳	string	
total		integer(int64)	
msg		string
 */
export function getRejectList(data) {
  return request({
    url: "/server/operation/stopBlow/rejectPage",
    method: "post",
    data: data,
  });
}

/**
 * 停止打爆申请：新增申请1
 * POST
/server/operation/stopBlow/addDetailPage
入参：
{
  "endTime": "",
  "page": 0,
  "pageSize": 0,
  "planName": "",
  "startTime": ""
}
  出参：
  code		integer(int32)	integer(int32)
data		PageResult«OperationRecodeListVO»	PageResult«OperationRecodeListVO»
records		array	OperationRecodeListVO
applyInformation	申请说明	string	
applyName	申请人	string	
applyType	申请类型	integer	
applyTypeName	申请类型中文名称	string	
applyUuidName	申请人Uuid	string	
auditStatus	审核状态	integer	
auditStatusName	审核状态中文名称	string	
endTime	结束时间时间戳	string	
invalid		boolean	
isInvalidName	是否作废中文名称	string	
operationUuid	运营主表uuid	string	
planName	计划名称	string	
startTime	起始时间时间戳	string	
submitStatus	提交状态	integer	
submitStatusName	提交状态中文名称	string	
submitTime	提交日期	string	
total		integer(int64)	
msg		string
 */
export function addDetailPage(data) {
  return request({
    url: "/server/operation/stopBlow/addDetailPage",
    method: "post",
    data: data,
  });
}

/**
 * 停止打爆申请：停止打爆按钮
 * POST
/server/operation/stopBlow/stopBlow
入参：
operationUuid	运营主表uuid		true	
string
stopRemark	停止说明		true	
string
stopTime	停止日期：时间戳		true	
string
出参：
  code		integer(int32)	integer(int32)
data		object	object
msg		string
 */
export function stopBlow(data) {
  return request({
    url: "/server/operation/stopBlow/stopBlow",
    method: "post",
    data: data,
  });
}

/**
 * 停止打爆申请-停止打爆审核：详情复制接口复制文档复制地址
GET
/server/operation/stopBlow/detail/{operationUuid}
入参：
operationUuid
出参：
code		integer(int32)	integer(int32)
data		StopBlowDetailVO	StopBlowDetailVO
applyInformation	停止打爆申请说明	string	
applyName	停止打爆申请人	string	
auditStatus	审核状态	integer(int32)	
auditStatusName	审核状态中文名称	string	
auditUuid	审核人	string	
auditUuidName	审核人中文名称	string	
invalidReason	作废原因	string	
invalidTime	作废时间：时间戳	string	
rejectReason	驳回原因	string	
rejectTime	驳回时间：时间戳	string	
submitTime	停止打爆提交日期：时间戳	string	
msg		string	
 */
export function getDetail(operationUuid) {
  return request({
    url: `/server/operation/stopBlow/detail/${operationUuid}`,
    method: "get",
  });
}

/**
 * TODO 停止打爆- 作废 未提供
 */
export function invalid(data) {
  return request({
    url: "/server/operation/stopBlow/invalid",
    method: "post",
    data: data,
  });
}

/**
 * 停止打爆申请:新增申请1分页明细复制接口复制文档复制地址
GET
/server/operation/stopBlow/addDetailPage/{operationUuid}
入参：
operationUuid
出参：
code		integer(int32)	integer(int32)
data		array	StopBlowAddPageVO
applyAmount	申请金额	number	
applyType	申请类型	integer(int32)	
applyTypeName	申请类型中文名称	string	
categoryName	货品分类名称	string	
categoryUuid	货品分类	string	
endTime	结束时间时间戳	string	
linkId	链接id	string	
linkLevel	链接等级	integer(int32)	
linkLevelName	链接等级中文名称	string	
linkTitle	链接标题	string	
manager	链接负责人	string	
managerName	链接负责人中文名称	string	
platform	平台id	string	
platformName	平台名称	string	
purchaseUserName	采购人中文名称	string	
skuCode	sku编码	string	
skuUrl	sku图片地址	string	
skuUrlUuid	sku图片地址uuid	string	
skuUuid	skuUuid	string	
specsName	sku规格名称	string	
spuShowName	产品名称	string	
spuUuid	产品uuid	string	
startTime	起始时间时间戳	string	
storeCode	店铺简称	string	
storeName	店铺名称	string	
storeUuid	店铺uuid	string	
strategyList	项目	array	string
thisPlanQuantity	本次申请的计划：常规是数值集合数据只有一个值，打爆申请是集合周期拼接的数据	array	WeeksPlanQuantityVO
jinNum	本地仓：拼接出参：本地仓:10	string	
miMiaNum	京东仓：拼接出参：京东仓:10	string	
weeks	周次数值	integer	
weeksName	中文名称	string	
msg
 */
export function getAddDetailPage(operationUuid) {
  return request({
    url: `/server/operation/stopBlow/addDetailPage/${operationUuid}`,
    method: "get",
  });
}

// 趋势图接口已迁移到 @/api/purchasingManagement/common.js
// 请使用: import { getLineChart, getTrendTable } from '@/api/purchasingManagement/common'

/**
 * 停止打爆申请：明细表格复制接口复制文档复制地址
POST
/server/operation/stopBlow/sonDetailTable
入参：
{
  "operationUuid": "",
  "page": 0,
  "pageSize": 0
}
出参：
code		integer(int32)	integer(int32)
data		PageResult«StopBlowSonDetailTableVO»	PageResult«StopBlowSonDetailTableVO»
records		array	StopBlowSonDetailTableVO
applyAmount	申请金额	number	
categoryName	货品分类名称	string	
categoryUuid	货品分类	string	
purchaseUserName	采购人中文名称	string	
skuCode	sku编码	string	
skuUrl	sku图片地址	string	
skuUrlUuid	sku图片地址uuid	string	
skuUuid	skuUuid	string	
specsName	sku规格名称	string	
spuShowName	产品名称	string	
spuUuid	产品uuid	string	
thisPlanQuantity	本次申请的计划	array	WeeksPlanQuantityVO
jinNum	本地仓：拼接出参：本地仓:10	string	
miMiaNum	京东仓：拼接出参：京东仓:10	string	
weeks	周次数值	integer	
weeksName	中文名称	string	
total		integer(int64)	
msg		string
 */
export function getSonDetailTable(data) {
  return request({
    url: "/server/operation/stopBlow/sonDetailTable",
    method: "post",
    data: data,
  });
}

/**
 * 停止打爆申请：明细申请单复制接口复制文档复制地址
GET
/server/operation/stopBlow/sonDetailDes/{operationUuid}
入参：
operationUuid
code		integer(int32)	integer(int32)
data		StopBlowSonDetailVO	StopBlowSonDetailVO
applyInformation	申请说明	string	
applyName	申请人中文名称	string	
endTime	结束时间时间戳	string	
linkId	商品id	string	
linkLevel	商品等级	integer(int32)	
linkLevelName	商品等级中文名称	string	
linkTitle	商品标题	string	
planName	计划名称	string	
platform	平台id	string	
platformName	平台名称	string	
startTime	起始时间时间戳	string	
storeCode	店铺简称	string	
storeName	店铺名称	string	
storeUuid	店铺uuid	string	
submitTime	运营提交日期：时间戳	string	
msg	
 */
export function getSonDetailDes(operationUuid) {
  return request({
    url: `/server/operation/stopBlow/sonDetailDes/${operationUuid}`,
    method: "get",
  });
}
