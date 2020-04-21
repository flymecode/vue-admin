import request from '@/utils/request'

export function fetchQuestionList(query) {
  return request({
    url: '/question/list',
    method: 'get',
    params: query
  })
}

export function fetchQuestionsById(ids) {
  return request({
    url: '/question',
    method: 'get',
    params: {
      ids
    }
  })
}

export function createQuestion(data) {
  return request({
    url: '/question',
    method: 'post',
    data
  })
}

export function updateQuestion(data) {
  return request({
    url: '/question',
    method: 'put',
    data
  })
}
