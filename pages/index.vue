<template lang="pug">
  v-container
    v-row
      v-col(cols)
        DataTable(
          v-if="!isInitialLoading"
          :headers="headers"
          :items="items"
          :filters="filters"
          :sort-options="sortOptions"
          disable-sort
          sortable
          searchable
          dense
          :loading="isLoading"
          :current-page="currentPage"
          :total-items="totalItems"
          :total-pages="totalPages"
          use-server-pagination
          @change-page="onPageChange"
          @update-search="onSearchUpdate"
          @update-sort="onSortUpdate"
        )
        v-progress-circular(
          v-else
          width="2"
          color="rs__primary"
          indeterminate
        ).mx-auto
</template>

<script>
import DataTable from '~/components/DataTable.vue'
import sales from '~/api/sales.js'

export default {
  components: {
    DataTable
  },
  data() {
    return {
      totalItems: 0,
      totalPages: 0,
      currentPage: 1,
      perPage: 10,
      searchParam: '',
      sortOption: false,
      sales,
      isInitialLoading: true,
      isLoading: false,
      items: [],
      headers: [
        { text: 'Name', value: 'fullName', align: 'start' },
        { text: 'Email', value: 'email' },
        { text: 'Gender', value: 'gender' },
        { text: 'Year', value: 'year' },
        { text: 'Sales', value: 'sales' },
        { text: 'Country', value: 'country' },
      ],
      sortOptions: [
        { text: 'Name', value: 'user.last_name'},
        { text: 'Year', value: 'year' },
        { text: 'Sales', value: 'sales' },
      ],
      filters: [
        {name: 'Name', type: 'includes', label: 'Name'},
        {name: 'Country', type: 'exact'}, // label will be the same as type if not defined
        {name: 'Sales', type: 'more', label: 'More Than:'},
        {name: 'Gender'}, // the type by default equals 'includes'
        {name: 'Year', type: 'less', label: 'Less than:'}
      ]
    }
  },
  async created() {
    await this.updateItems(this.currentPage)
    this.isInitialLoading = false
  },
  methods: {
    async updateItems (page) {
      const { items, totalItems, totalPages } = await this.fetchData(page, this.perPage, this.searchParam, this.sortOption)
      this.items = items
      this.totalPages = totalPages
      this.totalItems = totalItems
    },
    async fetchData(page, size, search = '', sortOption = false) {
      this.isLoading = true
      // Pages start from 1, but indexes from 0
      const start = (page - 1) * size
      await this.delay(3000)
      const selection = search ? this.filterArrayByValue(sales.results, search) : [...this.sales.results]
      if (sortOption) selection.sort(this.sortByOption(sortOption))
      const response = await selection.slice(start, start + size)
      const items = response.map(el => {
        const {first_name, last_name, title} = el.user
        // For correct displaying user object in the table
        return {
          ...el,
          fullName: `${title} ${first_name} ${last_name}`
        }
      })
      const totalItems = selection.length
      this.isLoading = false
      // Extend response with pagination data
      return {
        items,
        totalItems: totalItems,
        totalPages: Math.ceil(totalItems / size)
      }
    },
    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    },
    // Imitation for searching in database
    filterArrayByValue(array, string) {
      const filterObject = (object, str) => {
        return Object.keys(object).some(key => {
          const el = object[key]
          if (typeof el !== 'object') return el.toLocaleString().toLowerCase().includes(str.toLowerCase())
          return filterObject(el, str)
        })
      }
      return array.filter(object => filterObject(object, string))
    },
    sortByOption({field, direction}) {
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
    },
    async onPageChange (newPage) {
      this.currentPage = newPage
      await this.updateItems(newPage)
    },
    async onSearchUpdate (searchValue) {
      if (searchValue === this.searchParam) return
      // If search param was changed always start from 1 page
      this.searchParam = searchValue
      this.currentPage = 1
      await this.updateItems(this.currentPage)
    },
    async onSortUpdate (sortOption) {
      // If sort order was changed always start from 1 page
      this.sortOption = sortOption
      this.currentPage = 1
      await this.updateItems(this.currentPage)
    }
  }
}
</script>

<style lang="sass" scoped>
.v-progress-circular
  position: absolute
  top: 50%
  left: 50%
</style>
