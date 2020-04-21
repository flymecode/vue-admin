const questionTypeOptions = [
  { key: 0, display_name: '选择题' },
  { key: 1, display_name: '题空题' },
  { key: 2, display_name: '问答题' },
  { key: 3, display_name: '判断题' }
]
const questionTypeKeyValue = questionTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export { questionTypeOptions, questionTypeKeyValue }
