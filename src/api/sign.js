import request from '@/utils/request'

export function getSignList(query) {
  return request({
    url: '/sign/list',
    method: 'get',
    params: query
  })
}

export function createSign(data) {
  return request({
    url: '/sign',
    method: 'post',
    data
  })
}

export function updateSign(id, state) {
  return request({
    url: '/sign',
    method: 'put',
    params: {
      id,
      state
    }
  })
}

export function deleteSign(id) {
  return request({
    url: '/sign',
    method: 'delete',
    params: {
      id
    }
  })
}

export function getSignRecord(id) {
  return request({
    url: '/sign/record',
    method: 'get',
    params: {
      id
    }
  })
}

export function getSignRecords() {
  return request({
    url: '/sign/records',
    method: 'get',
  })
}


export function sign(data) {
  return request({
    url: '/sign',
    method: 'put',
    data
  })
}
