import request from '@/utils/request'

export function getReplys(data) {
  return request({
    url: '/reply/list',
    method: 'post',
    data
  })
}

export function createReply(data) {
  return request({
    url: '/reply',
    method: 'post',
    data
  })
}

export function handlerAgree(data) {
  return request({
    url: '/reply/agree',
    method: 'put',
    data
  })
}

export function handlerNoAgree(data) {
  return request({
    url: '/reply/no',
    method: 'put',
    data
  })
}

