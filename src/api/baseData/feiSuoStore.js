import request from "@/utils/request";

// 店铺列表
export function getStoreList(data){
    return request({
        url:'/server/afterSale/storeList',
        method:'post',
        data
    })
}

// 店铺新增
export function storeAdd(data){
    return request({
        url:'/server/afterSale/add',
        method:'post',
        data
    })
}

// 店铺删除
export function storeDelete(data){
    return request({
        url:'/server/afterSale/delete',
        method:'delete',
        data
    })
}