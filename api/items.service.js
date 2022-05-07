import sales from "~/api/sales";
import { filterArrayByValue, sortByOption, delay } from "~/api/helpers";

export default {
  fetch: async (page, size, search, sortOption) => {
    // Pages start from 1, but indexes from 0
    const start = (page - 1) * size
    await delay(3000)
    const selection = search ? filterArrayByValue(sales.results, search) : [...sales.results]
    if (sortOption) selection.sort(sortByOption(sortOption))
    const response = selection.slice(start, start + size)
    const items = response.map(el => {
      const {first_name, last_name, title} = el.user
      // For correct displaying user object in the table
      return {
        ...el,
        fullName: `${title} ${first_name} ${last_name}`
      }
    })
    const totalItems = selection.length
    // Extend response with pagination data
    return {
      items,
      totalItems: totalItems,
      totalPages: Math.ceil(totalItems / size)
    }
  }
}
