import request from '@/utils/request'

export function addContest(data) {
  return request({
    url: '/contest',
    method: 'post',
    data
  })
}

export function fetchContestList(ids) {
  return request({
    url: '/contest',
    method: 'get',
    params: {
      ids
    }
  })
}

export function updateContestSate(id, state) {
  return request({
    url: '/contest',
    method: 'put',
    params: {
      id,
      state
    }
  })
}

export function commitContest(data) {
  return request({
    url: '/contest/commit',
    method: 'post',
    data
  })
}

export function getContestRecord(id) {
  return request({
    url: '/contest/record',
    method: 'get',
    params: {
      id
    }
  })
}

export function getContestRecords(id) {
  return request({
    url: '/contest/record/list',
    method: 'get',
    params: {
      id
    }
  })
}

export function getContestList(query) {
  return request({
    url: '/contest/list',
    method: 'get',
    params: query
  })
}

export function getMetrics(id) {
  return request({
    url: '/contest/metrics',
    method: 'get',
    params: {
      contestId:id
    }
  })
}
