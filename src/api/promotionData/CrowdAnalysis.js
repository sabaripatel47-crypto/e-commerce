import request from "@/utils/request";

// 获取展现量点击量加购量成交量
export function getLinkStatisticsList(data) {
    return request({
        url: "/server/analysis/impressions",
        method: "post",
        data,
    });
}

// 时间类型下拉框
export function getTimeTypeList() {
    return request({
        url: "/server/analysis/pushBytime",
        method: "get",
    });
}

// 趋势图
export function getTrendList(data) {
    return request({
        url: "/server/analysis/trendChart",
        method: "post",
        data,
    });
}

// 获取分析类型
export function getAnalysisTypeList() {
    return request({
        url: "system/dict/data/promotionByPush",
        method: "get",
    });
}