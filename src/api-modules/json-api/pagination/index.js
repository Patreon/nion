import get from 'lodash.get'

export const canLoadMore = data => {
    return !!get(data, 'extra.links.next') && !get(data, 'request.isLoading')
}

export const getNextUrl = (declaration, selectedData) => {
    const nextUrl = get(selectedData, 'extra.links.next', null)
    return nextUrl
}
