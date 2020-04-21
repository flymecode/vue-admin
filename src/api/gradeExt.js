import request from '@/utils/request'

export function getGradeExtInfo(username, courseId, clazzId) {
  return request({
    url: '/ext/info',
    method: 'get',
    params: {
      username,
      courseId,
      clazzId
    }
  })
}

export function getGradeExts(courseId, clazzId) {
  return request({
    url: '/ext',
    method: 'get',
    params: {
      courseId,
      clazzId
    }
  })
}

export function createGradeExt(data) {
  return request({
    url: '/ext',
    method: 'post',
    data
  })
}

export function deleteGradeExt(id) {
  return request({
    url: '/ext',
    method: 'delete',
    params: {
      id
    }
  })
}

export function updateGradeExt(data) {
  return request({
    url: '/ext',
    method: 'put',
    data
  })
}

