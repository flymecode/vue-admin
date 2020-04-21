import request from '@/utils/request'

export function getClazzList(id) {
  return request({
    url: '/clazz',
    method: 'get',
    params: {
      id
    }
  })
}

export function createClazz(data) {
  return request({
    timeout: 20000,
    url: '/clazz',
    method: 'post',
    data
  })
}

export function getClazzStudents(query) {
  return request({
    url: '/clazz/info',
    method: 'get',
    params: query
  })
}
