import request from '@/utils/request'

export function createCourse(data) {
  return request({
    url: '/course',
    method: 'post',
    data
  })
}

export function fetchCourseList() {
  return request({
    url: '/course',
    method: 'get'
  })
}

export function getCourseAndClazz() {
  return request({
    url: '/course/info',
    method: 'get'
  })
}

export function getMyCourse(data) {
  return request({
    url: '/course/my',
    method: 'post',
    data
  })
}
