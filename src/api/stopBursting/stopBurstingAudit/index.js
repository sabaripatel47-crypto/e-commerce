import request from "@/utils/request";

/**
停止打爆审核：分页-全部复制接口复制文档复制地址
POST
/server/operation/stopBlow/allExaminePage
入参：
{
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
  {
	"code": 0,
	"data": {
		"records": [
			{
				"applicationTime": "",
				"applyInformation": "",
				"applyName": "",
				"applyUuid": "",
				"auditStatus": 0,
				"auditStatusName": "",
				"invalid": true,
				"operationUuid": "",
				"planName": "",
				"submitTime": ""
			}
		],
		"total": 0
	},
	"msg": ""
}
 */
export function fetch_getAllList(data) {
  return request({
    url: "/server/operation/stopBlow/allExaminePage",
    method: "post",
    data: data,
  });
}

/**
 * 停止打爆审核：分页-待处理复制接口复制文档复制地址
POST
/server/operation/stopBlow/waitDealWith
入参：
{
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
msg
 */
export function fetch_getWaitDealWithList(data) {
  return request({
    url: "/server/operation/stopBlow/waitDealWith",
    method: "post",
    data: data,
  });
}

/**
 * 停止打爆审核：通过按钮复制接口复制文档复制地址
GET
/server/operation/stopBlow/confirm/{operationUuid}
入参：
operationUuid
入参：
{
	"code": 0,
	"data": true,
	"msg": ""
}
 */
export function fetch_confirm(operationUuid) {
  return request({
    url: `/server/operation/stopBlow/confirm/${operationUuid}`,
    method: "get",
  });
}

/**
 * 运营申请审核：驳回按钮复制接口复制文档复制地址
POST
/server/operation/getReject
入参：
{
  "operationUuid": "",
  "rejectReason": ""
}
  出参：
  {
	"code": 0,
	"data": true,
	"msg": ""
}
 */
export function fetch_getReject(data) {
  return request({
    url: "/server/operation/getReject",
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
入参：
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
export function fetch_getDetail(operationUuid) {
  return request({
    url: `/server/operation/stopBlow/detail/${operationUuid}`,
    method: "get",
  });
}

/**
 * 停止打爆审核：明细申请单复制接口复制文档复制地址
GET
/server/operation/stopBlow/sonExamineDetailDes/{operationUuid}
入参：
operationUuid
code		integer(int32)	integer(int32)
data		StopBlowSonExamineDetailVO	StopBlowSonExamineDetailVO
applyInformation	申请说明	string	
applyName	申请人	string	
applyType	申请类型	integer(int32)	
applyTypeName	申请类型中文名称	string	
endTime	结束时间时间戳	string	
startTime	起始时间时间戳	string	
submitTime	提交时间：时间戳	string	
msg		string
 */
export function fetch_getSonExamineDetailDes(operationUuid) {
  return request({
    url: `/server/operation/stopBlow/sonExamineDetailDes/${operationUuid}`,
    method: "get",
  });
}

/**
 * 停止打爆审核：明细表格
 * POST /server/operation/stopBlow/sonExamineDetailTable
 * @param {Object} data - 请求参数
 * @param {string} data.linkCode
 * @param {Array} data.linkId
 * @param {string} data.linkLevel
 * @param {string} data.operationUuid
 * @param {string} data.platformId
 * @param {string} data.skuUuid
 * @param {string} data.storeUuid
 * @returns {Promise}
 */

export function fetch_sonExamineDetailTable(data) {
  return request({
    url: "/server/operation/stopBlow/sonExamineDetailTable",
    method: "post",
    data,
  });
}

/**
 * 运营趋势图-停止打爆审核趋势图：表格复制接口复制文档复制地址
POST
/server/operation/getTrendTable
入参：linkId	linkId		true	
string
skuUuid	sku		true	
string
出参：
code		integer(int32)	integer(int32)
data		array	TrendTableVO
avgOrderNum	平均订单数	number	
avgRefundNum	平均退单数量	number	
avgSaleAmount	平均销售额	number	
avgSaleNum	平均销售数量	number	
avgSort	平均天数：7标识近7天；15标识近15天；30标识近30天；	integer(int32)	
skuCode	sku编码	string	
skuUuid	skuUuid	string	
specsName	sku规格名称	string	
spuShowName	产品名称	string	
spuUuid	产品uuid	string	
msg		string	
 */
export function fetch_getTrendTable(data) {
  return request({
    url: "/server/operation/getTrendTable",
    method: "post",
    data: data,
  });
}

/**
 * 运营趋势图-停止打爆审核趋势图：折线图复制接口复制文档复制地址
POST
/server/operation/getLineChart
{
  "linkId": "",
  "skuUuid": ""
}
出参：
code		integer(int32)	integer(int32)
data		array	LineChartsVO
actualQuantity	实际数量:保留两位小数	integer(int32)	
returnQuantity	退货数量:保留两位小数	integer(int32)	
saleQuantity	销售数量:保留两位小数	integer(int32)	
saleTime	销售时间	string	
msg		string	
 */
export function fetch_getLineChart(data) {
  return request({
    url: "/server/operation/getLineChart",
    method: "post",
    data: data,
  });
}

/**
 * 运营申请记录：作废按钮复制接口复制文档复制地址
POST
/server/operation/getIisInvalid

入参：
isInvalidDTO	isInvalidDTO	body	true	
IsInvalidDTO
IsInvalidDTO
invalidReason	作废原因		true	
string
operationUuid	运营主表uuid/帮扶主表uuid		true	
string
 */
export function fetch_getIsInvalid(data) {
  return request({
    url: "/server/operation/getIisInvalid",
    method: "post",
    data: data,
  });
}
