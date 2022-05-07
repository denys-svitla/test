const delay = ms => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Filter Array by given value with handling nested objects
 * @param {array} array
 * @param {string} string
 * @returns {array}
 */
const filterArrayByValue =(array, string) => {
  const filterObject = (object, str) => {
    return Object.keys(object).some(key => {
      const el = object[key]
      if (typeof el !== 'object') return el.toLocaleString().toLowerCase().includes(str.toLowerCase())
      return filterObject(el, str)
    })
  }
  return array.filter(object => filterObject(object, string))
}

/**
 * Sort array by given field in ascending or descending direction
 * @param {object} option
 * @param {string} option.field
 * @param {string} option.direction
 * @returns {number}
 */
const sortByOption = (option) => {
  const {field, direction} = option
  // field can be simple /'name'/ and complex /'user.name'/
  const keys = field.split('.')

  // Extract values from nested object
  const getValue = (obj, keysArray) => {
    let result = obj
    for (const key of keysArray) {
      result = result[key]
    }
    // For compare strings regardless of casing
    return typeof result === 'string' ? result.toLowerCase() : result
  }
  return function(a, b) {
    const first = getValue(a, keys)
    const second = getValue(b, keys)
    if (direction === 'ascending') {
      if (first < second) return -1;
      if (first > second) return 1;
    } else {
      if (first > second) return -1;
      if (first < second) return 1;
    }
    return 0;
  }
}

export {filterArrayByValue, sortByOption, delay}
