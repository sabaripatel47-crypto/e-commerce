
import request from "@/utils/request";

// 获取手动调度列表
export function getManualTaskSchedulingList(data) {
    return request({
        url: "/server/automation/list",
        method: "post",
        data
    });
}