interface FilterWithLabel extends ProjectFilter {
    label: string
}

interface GroupedFilters {
    label: string;
    filters: FilterWithLabel[];
    children: GroupedFilters[];
}