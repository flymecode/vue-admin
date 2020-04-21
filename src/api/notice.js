import request from '@/utils/request'

export function getNoticeList(query) {
  return request({
    url: '/notice/list',
    method: 'get',
    params: query
  })
}

export function createNotice(data) {
  return request({
    url: '/notice',
    method: 'post',
    data
  })
}

export function getNotices() {
  return request({
    url: '/notice/info',
    method: 'get'
  })
}

export function deleteNotice(id) {
  return request({
    url: '/notice',
    method: 'delete',
    params: {
      id
    }
  })

}

