import commonmark from 'commonform-commonmark'
import analyze from 'commonform-analyze'
import lint from 'commonform-lint'
import critique from 'commonform-critique'

document.addEventListener('DOMContentLoaded', (event) => {
  configureTerms()
  configureHeadings()
  configureLint()
  configureCritique()
  configureParse()
})

function configureTerms () {
  const terms = document.getElementById('terms')
  const input = terms.querySelector('textarea')
  const output = terms.querySelector('output')
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
  const terms = document.getElementById('headings')
  const input = terms.querySelector('textarea')
  const output = terms.querySelector('output')
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
  const terms = document.getElementById('critique')
  const input = terms.querySelector('textarea')
  const output = terms.querySelector('output')
  input.addEventListener('input', event => {
    let parsed
    try {
      parsed = parse(input.value)
    } catch (error) {
      output.innerText = error.message
      return
    }

    const items = critique(parsed.form)
    console.log(items)
    const fragment = document.createDocumentFragment()

    const table = document.createElement('table')
    fragment.appendChild(table)

    for (const { message, level, path } of items) {
      const tr = document.createElement('tr')
      table.appendChild(tr)
      tr.appendChild(element('td', level))
      tr.appendChild(element('td', message))
      tr.appendChild(element('td', path.join(':')))
    }

    output.replaceChildren()
    output.appendChild(fragment)
  })
}

function configureLint () {
  const terms = document.getElementById('lint')
  const input = terms.querySelector('textarea')
  const output = terms.querySelector('output')
  input.addEventListener('input', event => {
    let parsed
    try {
      parsed = parse(input.value)
    } catch (error) {
      output.innerText = error.message
      return
    }

    const items = lint(parsed.form)
    const fragment = document.createDocumentFragment()

    const table = document.createElement('table')
    fragment.appendChild(table)

    for (const { message, level, path } of items) {
      const tr = document.createElement('tr')
      table.appendChild(tr)
      tr.appendChild(element('td', level))
      tr.appendChild(element('td', message))
      tr.appendChild(element('td', path.join(':')))
    }

    output.replaceChildren()
    output.appendChild(fragment)
  })
}

function configureParse () {
  const terms = document.getElementById('parse')
  const input = terms.querySelector('textarea')
  const output = terms.querySelector('output')
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
    pre.textContent = JSON.stringify(parsed, null, 2)
    output.appendChild(pre)
  })
}

function element (name, text) {
  const e = document.createElement(name)
  e.textContent = text
  return e
}

function parse (value) {
  if (value.trim()[0] === '{') {
    return JSON.parse(value)
  } else {
    return commonmark.parse(value)
  }
}
