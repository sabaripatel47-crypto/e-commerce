
import request from "@/utils/request";

// 获取推广导入错误列表
export function getPromotionImportErrors(data) {
    return request({
        url: "/server/automation/error_massage",
        method: "post",
        data: data
    });
}

// 重试
export function retry(uuid) {
    return request({
        url: `/server/automation/retry/${uuid}`,
        method: "get",
    });
}