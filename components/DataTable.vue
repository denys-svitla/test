<template lang="pug">
  v-data-table(
    :headers="headersWithFilters"
    :items="items"
    v-bind="$attrs"
    :hide-default-footer="useServerPagination"
  ).elevation-3.mt-10
    template(
      v-slot:top
    )
      v-row
        v-col(cols="12" md="4" v-if="sortable")
          v-select(
            dense
            outlined
            hide-details
            :items="extendedSortOptions"
            item-value="value"
            label="Sort By"
            v-model="activeSortOption"
            @change="onSortOptionChange"
          ).sort-field.px-4
            template(v-slot:selection="{item}")
              | {{item.text}}
              v-icon(v-if="item.direction" :title="item.direction").ml-2
                | {{`mdi-sort-${item.direction}`}}
            template(v-slot:item="{item}")
              v-icon(v-if="item.direction" :title="item.direction").mr-2
                | {{`mdi-sort-${item.direction}`}}
              | {{item.text}}
        v-col(cols="12" md="8"  v-if="searchable")
          v-form(
            @submit.prevent="executeSearch"
          )
            div.d-flex.align-center.px-4
              v-text-field(
                v-model="search"
                :label="searchPlaceholder"
                outlined
                dense
                clearable
                hide-details
                prepend-inner-icon="mdi-magnify"
              ).search-field.mr-4
              v-btn(
                type="submit"
                color="primary"
                :style="{height: '40px'}"
              )
                | Search

    template(
      v-slot:body.prepend
      v-if="isFiltersDisplayed"
    )
      tr.d-none.d-sm-table-row
        td(v-for="(filter, i) in filtersArray" :key="i")
          v-text-field(
            v-if="filter"
            :value="filtersValues[filter.value]"
            @input="onFilterChange(filter.name, $event)"
            :label="filter.label || filter.name"
            hide-details
            outlined
            dense
            prepend-inner-icon="mdi-filter"
          ).py-2.filter-field
      tr.d-sm-none
        td
          v-expansion-panels
            v-expansion-panel.ma-4
              v-expansion-panel-header
                | Filters
              v-expansion-panel-content(
                v-for="(filter, i) in filtersArray"
                :key="i"
                :class="{'mb-n4': !filter}"
              )
                v-text-field(
                  v-if="filter"
                  :value="filtersValues[filter.value]"
                  @input="onFilterChange(filter.name, $event)"
                  :label="`${filter.name} ${filter.label && filter.label !== filter.name ? `( ${filter.label} )` : ''}`"
                  hide-details
                  outlined
                  dense
                  prepend-inner-icon="mdi-filter"
                ).pa-2.filter-field
    template(
      v-slot:footer
      v-if="useServerPagination"
    )
      v-divider
      div.pa-4
        v-pagination(
          :value="currentPage"
          @input="$emit('change-page', $event)"
          :length="totalPages"
          total-visible="7"
        )
</template>

<script>
export default {
  props: {
    headers: {
      type: Array,
      required: true
    },
    items: {
      type: Array,
      required: true
    },
    sortable: {
      type: Boolean,
      default: false
    },
    searchable: {
      type: Boolean,
      default: false
    },
    searchPlaceholder: {
      type: String,
      default: 'Search'
    },
    totalPages: {
      type: Number,
      default: 0
    },
    totalItems: {
      type: Number,
      default: 0
    },
    currentPage: {
      type: Number,
      default: 0
    },
    useServerPagination: {
      type: Boolean,
      default: false
    },
    /**
     * Options for 'Sorted by' Select
     * Each item should contain 'text' and 'value'
     */
    sortOptions: {
      type: Array,
      default: () => []
    },
    /**
     * Filters for each column in the table
     * Each item should contain 'name' corresponding to the 'text' in headers
     * Additionally 'type' and 'label' can be specified
     */
    filters: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      search: '',
      filtersValues: {},
      activeSortOption: {text: 'Default', value: false}
    }
  },
  computed: {
    isFiltersDisplayed() {
      return this.filters.length
    },
    filterNames() {
      return this.filters.map(({name}) => name)
    },
    filtersArray() {
      return this.headers.map(({text}) => {
        return this.filterNames.includes(text)
          ? this.filters.find(({name}) => name === text)
          : null
      })
    },
    headersWithFilters() {
      return this.headers.map(header => {
        const relatedFilter = this.filters.find(({name}) => name === header.text)
        if (!relatedFilter) return header
        let filterFunction
        switch (relatedFilter.type) {
          case 'less':
            filterFunction = value => {
              if (!this.filtersValues[relatedFilter.name]) return true;
              return value < parseInt(this.filtersValues[relatedFilter.name]);
            }
            break
          case 'more':
            filterFunction = value => {
              if (!this.filtersValues[relatedFilter.name]) return true;
              return value > parseInt(this.filtersValues[relatedFilter.name]);
            }
            break
          case 'exact':
            filterFunction = value => {
              if (!this.filtersValues[relatedFilter.name]) return true;
              return value == this.filtersValues[relatedFilter.name];
            }
            break
          case 'includes':
            filterFunction = f => {
              return (f + '').toLowerCase().includes((this.filtersValues[relatedFilter.name] || '').toLowerCase())
            }
            break
          default:
            filterFunction = f => {
              return (f + '').toLowerCase().includes((this.filtersValues[relatedFilter.name] || '').toLowerCase())
            }
        }
        return {
          ...header,
          filter: filterFunction
        }
      })
    },
    /**
     * Extend sort options with Asc and Desc properties
     *
     */
    extendedSortOptions () {
      const options = [{text: 'Default', value: false}]
      const directions = ['ascending', 'descending']
      for (const {text, value} of this.sortOptions) {
        for (const direction of directions) {
          options.push({text, value: {field: value, direction }, direction})
        }
      }
      return options
    }
  },
  methods: {
    /**
     * Gets called when the user change filter for any column
     *
     */
    onFilterChange(name, value) {
      this.$set(this.filtersValues, name, value)
    },
    /**
     * Gets called when the user submit new search param
     *
     */
    executeSearch() {
      this.$emit('update-search', this.search)
    },
    /**
     * Gets called when the user change option in 'Sort by' select
     *
     */
    onSortOptionChange(option) {
      this.$emit('update-sort', option)
    }
  }
}
</script>

<style lang="sass" scoped>
.v-data-table
  max-width: 100%

.search-field, .sort-field
  max-width: 500px
</style>
