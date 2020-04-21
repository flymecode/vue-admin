import request from '@/utils/request'

export function getGradeInfo(id) {
  return request({
    url: '/grade/info',
    method: 'get',
    params: {
      id
    }
  })
}
export function commitGrade(data) {
  return request({
    url: '/grade',
    method: 'post',
    data
  })
}

export function getSumGrade(query) {
  return request({
    timeout: 20000000,
    url: '/grade/sum',
    method: 'post',
    data: query
  })
}
export function getMyGrade(query) {
  return request({
    timeout: 20000000,
    url: '/grade/my',
    method: 'post',
    data: query
  })
}

