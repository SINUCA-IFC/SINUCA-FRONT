const defaultStyle = {
  icon: 'mdi mdi-dots-horizontal',
  activeStyle: 'background-color: #01295F;',
}

export function getCategoryStyle(id, styles = {}) {
  return styles[id] || defaultStyle
}
