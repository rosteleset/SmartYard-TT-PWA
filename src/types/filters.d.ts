interface GroupedFilter extends ProjectFilter {
    label: string
}

interface GroupedFilters {
    label: string;
    filters: GroupedFilter[];
    children: GroupedFilters[];
}