import request from "@/utils/request";

// 销售、退款、成交率、退款率计算
export function getSalesReport(data) {
    return request({
        url: "/server/deliverycenter/salesRate",
        method: "post",
        data,
    });
}

// 销售额、实际销售额、退款率柱状图
export function getSalesReportBar(data) {
    return request({
        url: "/server/deliverycenter/salesHistogram",
        method: "post",
        data,
    });
}

// 售前退款额-售前退款率
export function getPreSalesReport(data) {
    return request({
        url: "/server/deliverycenter/afterRefundAmount",
        method: "post",
        data,
    });
}

// 售前退款额柱状图
export function getPreSalesReportBar(data) {
    return request({
        url: "/server/deliverycenter/afterRefundAmountHistogram",
        method: "post",
        data,
    });
}

// 退货退款额-退货退款率
export function getAfterSalesReport(data) {
    return request({
        url: "/server/deliverycenter/refundAmountAndGoods",
        method: "post",
        data,
    });
}

// 退货退款额柱状图
export function getAfterSalesReportBar(data) {
    return request({
        url: "/server/deliverycenter/refundAmountAndGoodsHistogram",
        method: "post",
        data,
    });
}

// 退款不退货额-退款不退货率
export function getNoReturnSalesReport(data) {
    return request({
        url: "/server/deliverycenter/refundAmountNotGoods",
        method: "post",
        data,
    });
}

// 退款不退货额柱状图
export function getNoReturnSalesReportBar(data) {
    return request({
        url: "/server/deliverycenter/refundAmountNotGoodsHistogram",
        method: "post",
        data,
    });
}