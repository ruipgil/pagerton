import throttler from 'f-throttler'

// Generates an array for the same function
const generateFunctions = (pages, fn) => {
  let arr = []
  for (let i = 0; i < pages; i++) {
    arr.push(fn)
  }
  return arr
}

// Flattens an array
const flatten = (arr) =>
  arr.reduce((prev, current) =>
    prev.concat(current), [])

// Default jitter function
const defaultJitter = (i, count) => Math.random() * 100

/**
 * Efficiently paginates a resource based on a paginator function
 *
 * @param  {!function(Number=):Promise} paginator Paginator function
 *  the promise should return an object in the form of:
 *  { results: Array, perPage: Number, total: Number }
 *  where:
 *  - total is total number of resources
 *  - perPage is the number of resources per page
 *  - results is the result gathered from a page
 *
 * @param  {Object} options Options object to pass to  the `throttler`
 *  package. In the form:
 *  {
 *    jitter: Function(Number=, Number=),
 *    interval: Number,
 *    concurrency: Number
 *  }
 *  where:
 *  - jitter: is a function that returns a number, it will be
 *    used to delay the execution of the function. The default
 *    function returns a random number between 0 and 100 (ms).
 *  - interval: minimum number of milliseconds between requests
 *  - concurrency: number of requests made concurrently
 */
const paginate = async (paginator, options = {}) => {
  const { results, perPage = 1, total } = await paginator(0)

  if (results.length >= total) {
    return results
  }

  const {
    jitter = defaultJitter,
    interval = 100,
    concurrency = 2
  } = options
  const pages = Math.ceil(total / perPage)
  const promises = generateFunctions(pages, (i) => paginator(i + 1))

  const allResults = await throttler(promises, {
    jitter,
    interval,
    concurrency
  })

  return flatten(results.concat(allResults))
}

export default paginate
