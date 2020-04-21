import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)
import Layout from '@/layout'

export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/Login'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/home/Home'),
      meta: { title: '主页', icon: 'dashboard' }
    }]
  }

]

const student = [
  {
    path: '/s/clazz',
    component: Layout,
    redirect: '/s/clazz/list',
    name: 'Clazz',
    meta: { title: '信息管理', icon: 'example', roles: ['student'] },
    children: [
      {
        path: 'course',
        name: 'Trees',
        component: () => import('@/views/client/MyCourse'),
        meta: { title: '我的课程', icon: 'tree' }
      }
    ]
  },

  {
    path: '/s/contest',
    component: Layout,
    name: 'Contest',
    meta: { title: '测试', icon: 'example', roles: ['student'] },
    children: [
      {
        path: 'list',
        name: 'MyContest',
        component: () => import('@/views/client/MyContest'),
        meta: { title: '我的测试', icon: 'tree' }
      }
    ]
  },

  {
    path: '/s/sign',
    component: Layout,
    name: 'Sign',
    meta: { icon: 'example', roles: ['student'] },
    children: [
      {
        path: 'list',
        name: 'MySign',
        component: () => import('@/views/client/MySign'),
        meta: { title: '我的签到', icon: 'tree' }
      }
    ]
  },
  {
    path: '/s/notice',
    component: Layout,
    meta: { icon: 'example', roles: ['student'] },
    children: [
      {
        path: 'list',
        name: 'MyNotice',
        component: () => import('@/views/client/MyNotice'),
        meta: { title: '我的通知', icon: 'tree' }
      }
    ]
  },
  {
    path: '/s/grade',
    component: Layout,
    meta: { icon: 'example', roles: ['student'] },
    children: [
      {
        path: 'list',
        name: 'MyGrade',
        component: () => import('@/views/client/MyGrade'),
        meta: { title: '我的成绩', icon: 'tree' }
      }
    ]
  }
]

const teacher = [
  {
    path: '/admin/resource',
    component: Layout,
    redirect: '/admin/resource/question',
    meta: { title: '资源管理', icon: 'example', roles: ['teacher'] },
    children: [
      {
        path: 'question',
        name: 'Question',
        component: () => import('@/views/question/QuestionManager'),
        meta: { title: '试题库' }
      },
      {
        path: 'paper',
        name: 'Paper',
        component: () => import('@/views/question/MyQuestionPaper'),
        meta: { title: '试卷库' }
      }
    ]
  },
  {
    path: '/admin/',
    component: Layout,
    redirect: '/admin/course',
    meta: { roles: ['teacher'] },
    children: [
      {
        path: 'course',
        name: 'Course',
        component: () => import('@/views/course/CourseManager'),
        meta: { title: '课程管理', icon: 'tree' }
      },
      {
        path: 'course/info',
        component: () => import('@/views/course/CourseInfo'),
        hidden: true
      }
    ]
  },

  {
    path: '/admin',
    component: Layout,
    redirect: '/admin/homework',
    meta: { title: '任务管理', icon: 'form', roles: ['teacher'] },
    children: [
      {
        path: 'homework',
        name: 'HomeWork',
        component: () => import('@/views/work/homework/HomeWork'),
        meta: { title: '作业', icon: 'form' }
      },
      {
        path: 'notice',
        name: 'Notice',
        component: () => import('@/views/work/notice/CreateNotice'),
        meta: { title: '通知', icon: 'form' }
      },
      {
        path: 'contest',
        name: 'Contest',
        meta: { title: '考试', icon: 'form' },
        component: () => import('@/views/work/contest/Contest')
      },
      {
        path: 'contest/info',
        name: 'ContestInfo',
        meta: { title: '考试', icon: 'form' },
        component: () => import('@/views/work/contest/ContestInfo'),
        hidden: true
      },
      {
        path: 'sign',
        name: 'Sign',
        component: () => import('@/views/work/sign/Sign'),
        meta: { title: '签到', icon: 'form' }
      },
      {
        path: 'other',
        name: 'Other',
        component: () => import('@/views/work/others/Others'),
        meta: { title: '其他', icon: 'form' }
      }
    ]
  },
  {
    path: '/admin/grade',
    component: Layout,
    redirect: '/grade/list',
    children: [
      {
        path: 'list',
        name: 'Grade',
        component: () => import('@/views/grade/GradeManager'),
        meta: { title: '成绩管理', icon: 'form', roles: ['teacher'] }
      }
    ]
  },
  {
    path: '/admin/complain',
    component: Layout,
    redirect: '/admin/complain/list',
    name: 'Complains',
    meta: { title: '申诉管理', icon: 'nested', roles: ['teacher'] },
    children: [
      {
        path: 'list',
        component: () => import('@/views/reply/Reply'),
        name: 'Complain',
        meta: { title: '申诉列表' }
      }
    ]
  }
]
export const asyncRoutes = student.concat(teacher)
const createRouter = () => new Router({
  mode: 'history',
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher
}

export default router
