import get from 'lodash.get'

export const canLoadMore = data => {
    return !!get(data, 'links.next') && !get(data, 'request.isLoading')
}

export const getNextUrl = (declaration, selectedData) => {
    const nextUrl = get(selectedData, ['links', 'next'], null)
    return nextUrl
}
