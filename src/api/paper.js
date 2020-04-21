import request from '@/utils/request'

export function fetchPaperList(query) {
  return request({
    url: '/paper',
    method: 'get',
    params: query
  })
}

export function getPapers(name) {
  return request({
    url: '/paper/list',
    method: 'get',
    params: {
      name
    }
  })
}
