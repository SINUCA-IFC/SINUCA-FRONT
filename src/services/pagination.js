export async function getAllPages(fetchPage) {
  const results = []
  let page = 1
  let totalPages = 1
  do {
    const data = await fetchPage(page)
    results.push(...data.results)
    totalPages = data.total_pages
    page += 1
  } while (page <= totalPages)
  return results
}
