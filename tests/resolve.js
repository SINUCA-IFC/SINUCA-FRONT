export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    specifier = new URL(`../src/${specifier.slice(2)}`, import.meta.url).href
  }
  if ((specifier.startsWith('.') || specifier.startsWith('file:')) && !/\.[a-z]+$/i.test(specifier)) {
    specifier += '.js'
  }
  return nextResolve(specifier, context)
}
