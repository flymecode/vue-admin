import request from '@/utils/request'

export function getRules() {
  return request({
    url: '/rule',
    method: 'get'
  })
}

export function createRule(data) {
  return request({
    url: '/rule',
    method: 'post',
    data
  })
}

