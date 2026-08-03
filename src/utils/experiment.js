export const TOTAL_QUESTIONS = 7
export const STARTING_BALANCE = 50
export const DEFAULT_TIME_LIMIT = 15
export const WARNING_THRESHOLD = 3

export const pastelColors = [
  { name: 'Blush', value: '#f8d7e3' },
  { name: 'Mint', value: '#dcefe8' },
  { name: 'Sky', value: '#dbeafe' },
  { name: 'Peach', value: '#fde2cf' },
  { name: 'Lilac', value: '#e8ddff' },
]

export function prepareQuestions(questions) {
  return questions.map((question, index) => ({
    ...question,
    id: `${question.category}-${index}`,
    variant: Math.random() < 0.5 ? 'control' : 'treatment',
  }))
}

export function getQuestionTimeLimit(question, variant) {
  if (question?.[variant]?.time_limit_seconds) {
    return question[variant].time_limit_seconds
  }

  return DEFAULT_TIME_LIMIT
}

export function getQuestionCost(question, variant) {
  const messages = question?.[variant]?.messages ?? []
  return messages.reduce((total, message) => total + Number(message.cost ?? 0), 0)
}

export function getQuestionText(question, variant) {
  const messages = question?.[variant]?.messages ?? []
  return messages.map((message) => message.text).join(' ')
}

export function getQuestionBanner(question, variant) {
  return question?.[variant]?.banner ?? ''
}

export function getNextThemeColor(index) {
  return pastelColors[index % pastelColors.length].value
}

export function createResultEntry(question, variant, decision, cost, balanceAfter, timeUsed) {
  return {
    category: question.category,
    variant,
    decision,
    cost,
    balanceAfter,
    timeUsed,
    message: getQuestionText(question, variant),
  }
}
