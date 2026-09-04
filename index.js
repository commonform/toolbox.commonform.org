import { parse } from 'commonform-commonmark'
import analyze from 'commonform-analyze'

document.addEventListener('DOMContentLoaded', (event) => {
  configureTerms()
  configureHeadings()
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
    console.log(analysis)
    const fragment = document.createDocumentFragment()

    fragment.append(element('h3', 'Defined'))
    const defined = document.createElement('ul')
    for (const term of Object.keys(analysis.definitions)) {
      defined.append(element('li', term))
    }

    fragment.append(element('h3', 'Used'))
    const used = document.createElement('ul')
    for (const term of Object.keys(analysis.uses)) {
      used.append(element('li', term))
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

    fragment.append(element('h3', 'Headings'))
    const headings = document.createElement('ul')
    for (const heading of Object.keys(analysis.headings)) {
      headings.append(element('li', heading))
    }

    fragment.append(element('h3', 'References'))
    const referenced = document.createElement('ul')
    for (const heading of Object.keys(analysis.references)) {
      referenced.append(element('li', heading))
    }

    output.replaceChildren()
    output.appendChild(fragment)
  })
}

function element (name, text) {
  const e = document.createElement(name)
  e.textContent = text
  return e
}
