import commonmark from 'commonform-commonmark'
import analyze from 'commonform-analyze'
import lint from 'commonform-lint'
import critique from 'commonform-critique'
import rename from 'commonform-rename'

document.addEventListener('DOMContentLoaded', (event) => {
  configureTerms()
  configureHeadings()
  configureLint()
  configureCritique()
  configureRename()
  configureParse()
})

function configureTerms () {
  const section = document.getElementById('terms')
  const input = section.querySelector('textarea')
  const output = section.querySelector('output')
  input.addEventListener('input', event => {
    let parsed
    try {
      parsed = parse(input.value)
    } catch (error) {
      output.innerText = error.message
      return
    }

    const analysis = analyze(parsed.form)
    const fragment = document.createDocumentFragment()

    fragment.appendChild(element('h3', 'Defined'))
    const defined = document.createElement('ul')
    fragment.appendChild(defined)
    for (const term of Object.keys(analysis.definitions).sort()) {
      defined.appendChild(element('li', term))
    }

    fragment.appendChild(element('h3', 'Used'))
    const used = document.createElement('ul')
    fragment.appendChild(used)
    for (const term of Object.keys(analysis.uses).sort()) {
      used.appendChild(element('li', term))
    }

    output.replaceChildren()
    output.appendChild(fragment)
  })
}

function configureHeadings () {
  const section = document.getElementById('headings')
  const input = section.querySelector('textarea')
  const output = section.querySelector('output')
  input.addEventListener('input', event => {
    let parsed
    try {
      parsed = parse(input.value)
    } catch (error) {
      output.innerText = error.message
      return
    }

    const analysis = analyze(parsed.form)
    const fragment = document.createDocumentFragment()

    fragment.appendChild(element('h3', 'Headings'))
    const headings = document.createElement('ul')
    fragment.appendChild(headings)
    for (const heading of Object.keys(analysis.headings).sort()) {
      headings.appendChild(element('li', heading))
    }

    fragment.appendChild(element('h3', 'References'))
    const referenced = document.createElement('ul')
    fragment.appendChild(referenced)
    for (const heading of Object.keys(analysis.references).sort()) {
      referenced.appendChild(element('li', heading))
    }

    output.replaceChildren()
    output.appendChild(fragment)
  })
}

function configureCritique () {
  const section = document.getElementById('critique')
  const input = section.querySelector('textarea')
  const output = section.querySelector('output')
  input.addEventListener('input', event => {
    let parsed
    try {
      parsed = parse(input.value)
    } catch (error) {
      output.innerText = error.message
      return
    }

    const annotations = critique(parsed.form)
    output.replaceChildren()
    output.appendChild(annotationsTable(annotations))
  })
}

function configureLint () {
  const section = document.getElementById('lint')
  const input = section.querySelector('textarea')
  const output = section.querySelector('output')
  input.addEventListener('input', event => {
    let parsed
    try {
      parsed = parse(input.value)
    } catch (error) {
      output.innerText = error.message
      return
    }

    const annotations = lint(parsed.form)
    output.replaceChildren()
    output.appendChild(annotationsTable(annotations))
  })
}

function configureParse () {
  const section = document.getElementById('parse')
  const input = section.querySelector('textarea')
  const output = section.querySelector('output')
  input.addEventListener('input', event => {
    let parsed
    try {
      parsed = parse(input.value)
    } catch (error) {
      output.innerText = error.message
      return
    }

    output.replaceChildren()
    const pre = document.createElement('pre')
    pre.textContent = JSON.stringify(parsed.form, null, 2)
    output.appendChild(pre)
  })
}

function configureRename () {
  const section = document.getElementById('rename')
  const textarea = section.querySelector('textarea')
  const output = section.querySelector('output')
  const select = section.getElementById('renameType')
  const fromInput = section.getElementById('renameFrom')
  const toInput = section.getElementById('renameTo')
  section.querySelector('form').addEventListener('submit', event => {
    event.preventDefault()
    event.stopPropagation()

    const from = fromInput.value
    const to = toInput.value
    if (!from || !to) return
    let parsed
    try {
      parsed = parse(textarea.value)
    } catch (error) {
      output.innerText = error.message
      return
    }

    const transformer = select.value === 'term'
      ? rename.term
      : rename.heading

    transformer(from, to, parsed.form)
    textarea.value = commonmark.stringify(parsed.form)
  })
}

function element (name, text) {
  const e = document.createElement(name)
  e.textContent = text
  return e
}

function annotationsTable (annotations) {
  const table = document.createElement('table')
  table.classNames = 'annotations'
  const thead = document.createElement('thead')
  thead.innerHTML = '<tr><th>Level</th><th>Message</th><th>Location</th></tr>'
  table.appendChild(thead)
  const tbody = document.createElement('tbody')
  table.appendChild(tbody)
  for (const { message, level, path } of annotations) {
    const tr = document.createElement('tr')
    tbody.appendChild(tr)
    tr.appendChild(element('td', level))
    tr.appendChild(element('td', message))
    tr.appendChild(element('td', path.join(':')))
  }
  return table
}

function parse (value) {
  if (value.trim()[0] === '{') {
    return JSON.parse(value)
  } else {
    return commonmark.parse(value)
  }
}
