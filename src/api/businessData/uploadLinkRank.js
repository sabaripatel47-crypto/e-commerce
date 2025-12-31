import request from '@/utils/request'

// 获取排行榜列表
export function getLinkRankList(data) {
  return request({
    url: '/server/link_rank/list',
    method: 'post',
    data
  })
}

// 导入排行榜
export function importLinkRank(data) {
  return request({
    url: `/server/link_rank/upload`,
    method: 'post',
    data
  })
}

// 获取排行榜状态
export function getLinkRankStatus(uuid) {
  return request({
    url: '/server/link_rank/status/' + uuid,
    method: 'get'
  })
}

// 删除排行榜
export function deleteLinkRank(uuid) {
  return request({
    url: '/server/link_rank/delete/' + uuid,
    method: 'delete'
  })
}
