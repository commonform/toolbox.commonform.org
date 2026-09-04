import commonmark from 'commonform-commonmark'
import analyze from 'commonform-analyze'

document.addEventListener('DOMContentLoaded', (event) => {
  configureTerms()
  configureHeadings()
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
    for (const term of Object.keys(analysis.definitions)) {
      defined.appendChild(element('li', term))
    }

    fragment.appendChild(element('h3', 'Used'))
    const used = document.createElement('ul')
    fragment.appendChild(used)
    for (const term of Object.keys(analysis.uses)) {
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
    for (const heading of Object.keys(analysis.headings)) {
      headings.appendChild(element('li', heading))
    }

    fragment.appendChild(element('h3', 'References'))
    const referenced = document.createElement('ul')
    fragment.appendChild(referenced)
    for (const heading of Object.keys(analysis.references)) {
      referenced.appendChild(element('li', heading))
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
    pre.textContent = JSON.stringify(parsed)
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
    return commonmark.parse(value).form
  }
}
