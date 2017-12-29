import throttler from 'f-throttler'

const generatePromises = (pages, fn) => {
  let arr = []
  for (let i = 0; i < pages; i++) {
    arr.push(fn)
  }
  return arr
}

const flatten = (arr) =>
  arr.reduce((prev, current) =>
    prev.concat(current), [])

const defaultJitter = (i, count) => Math.random() * (i / count) * 100

const paginate = async (paginator, options = {}) => {
  const { results, perPage = 1, hasNext, total } = await paginator(0)

  if (!hasNext) {
    return results
  }

  const {
    jitter = defaultJitter,
    interval = 100,
    concurrency = 2
  } = options
  const pages = Math.ceil(total / perPage)
  const promises = generatePromises(pages, (i) => {
    return paginator(i + 1)
  })

  const allResults = await throttler(promises, {
    jitter,
    interval,
    concurrency
  })

  return flatten(results.concat(allResults))
}

export default paginate
