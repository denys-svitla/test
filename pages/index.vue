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
import ItemsService from "~/api/items.service";


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
      this.isLoading = true
      const { items, totalItems, totalPages } = await ItemsService.fetch(page, this.perPage, this.searchParam, this.sortOption)
      this.items = items
      this.totalPages = totalPages
      this.totalItems = totalItems
      this.isLoading = false
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
