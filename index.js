// The main module for the client-side script served to users.
// See the `build` script in `package.json`.
import commonmark from 'commonform-commonmark'
import analyze from 'commonform-analyze'
import lint from 'commonform-lint'
import critique from 'commonform-critique'
import rename from 'commonform-rename'
import diff from 'word-diff'

document.addEventListener('DOMContentLoaded', (event) => {
  configureTerms()
  configureHeadings()
  configureLint()
  configureCritique()
  configureRename()
  configureDiff()
  configureParse()
  configureCopyButtons()
}, { once: true })

function configureTerms () {
  const section = document.getElementById('terms')
  const input = section.querySelector('textarea')
  const output = section.querySelector('output')
  input.addEventListener('input', event => {
    let form
    try {
      form = parse(input.value)
    } catch (error) {
      output.innerText = error.message
      return
    }

    const analysis = analyze(form)
    const fragment = document.createDocumentFragment()

    fragment.appendChild(elementWithText('h3', 'Defined'))
    const definitions = Object.keys(analysis.definitions).sort()
    if (definitions.length === 0) {
      fragment.appendChild(elementWithText('p', 'No definitions found.'))
    } else {
      const definitionsList = document.createElement('ul')
      fragment.appendChild(definitionsList)
      for (const term of definitions) {
        definitionsList.appendChild(elementWithText('li', term))
      }
    }

    fragment.appendChild(elementWithText('h3', 'Used'))
    const uses = Object.keys(analysis.uses).sort()
    if (uses.length === 0) {
      fragment.appendChild(elementWithText('p', 'No uses found.'))
    } else {
      const usesList = document.createElement('ul')
      fragment.appendChild(usesList)
      for (const term of uses) {
        usesList.appendChild(elementWithText('li', term))
      }
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
    let form
    try {
      form = parse(input.value)
    } catch (error) {
      output.innerText = error.message
      return
    }

    const analysis = analyze(form)
    const fragment = document.createDocumentFragment()

    fragment.appendChild(elementWithText('h3', 'Headings'))
    const headings = Object.keys(analysis.headings).sort()
    if (headings.length === 0) {
      fragment.appendChild(elementWithText('p', 'No headings found.'))
    } else {
      const headingsList = document.createElement('ul')
      fragment.appendChild(headingsList)
      for (const heading of headings) {
        headingsList.appendChild(elementWithText('li', heading))
      }
    }

    fragment.appendChild(elementWithText('h3', 'References'))
    const references = Object.keys(analysis.references).sort()
    if (references.length === 0) {
      fragment.appendChild(elementWithText('p', 'No references found.'))
    } else {
      const referencesList = document.createElement('ul')
      fragment.appendChild(referencesList)
      for (const heading of references) {
        referencesList.appendChild(elementWithText('li', heading))
      }
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
    let form
    try {
      form = parse(input.value)
    } catch (error) {
      output.innerText = error.message
      return
    }

    const annotations = critique(form)
    output.replaceChildren()
    output.appendChild(annotationsTable(annotations))
  })
}

function configureLint () {
  const section = document.getElementById('lint')
  const input = section.querySelector('textarea')
  const output = section.querySelector('output')
  input.addEventListener('input', event => {
    let form
    try {
      form = parse(input.value)
    } catch (error) {
      output.innerText = error.message
      return
    }

    const annotations = lint(form)
    output.replaceChildren()
    output.appendChild(annotationsTable(annotations))
  })
}

function configureRename () {
  const section = document.getElementById('rename')
  const textarea = section.querySelector('textarea')
  const output = section.querySelector('output')
  const select = document.getElementById('renameType')
  const fromInput = document.getElementById('renameFrom')
  const toInput = document.getElementById('renameTo')
  section.querySelector('form').addEventListener('submit', event => {
    event.preventDefault()
    event.stopPropagation()

    const from = fromInput.value
    const to = toInput.value
    if (!from || !to) return

    let form
    try {
      form = parse(textarea.value)
    } catch (error) {
      output.innerText = error.message
      return
    }

    const transformer = select.value === 'term'
      ? rename.term
      : rename.heading
    transformer(from, to, form)

    textarea.value = commonmark.stringify(form)
    fromInput.value = ''
    toInput.value = ''
  })
}

function configureDiff () {
  const section = document.getElementById('diff')
  const before = document.getElementById('diffBefore')
  const after = document.getElementById('diffAfter')
  const output = section.querySelector('output')
  function handler (event) {
    const beforeText = before.value
    const afterText = after.value
    const difference = diff.diffString(beforeText, afterText)
    let diffText = ''
    for (const span of difference) {
      if (Object.hasOwn(span, 'remove')) diffText += `{--${span.remove}--}`
      if (Object.hasOwn(span, 'add')) diffText += `{--${span.add}--}`
      if (Object.hasOwn(span, 'text')) diffText += span.text
    }
    output.textContent = diffText
  }
  before.addEventListener('input', handler)
  after.addEventListener('input', handler)
}

function configureParse () {
  const section = document.getElementById('parse')
  const input = section.querySelector('textarea')
  const output = section.querySelector('output')
  input.addEventListener('input', event => {
    let form
    try {
      form = parse(input.value)
    } catch (error) {
      output.innerText = error.message
      return
    }

    output.replaceChildren()
    const pre = document.createElement('pre')
    pre.textContent = JSON.stringify(form, null, 2)
    output.appendChild(pre)
  })
}

function configureCopyButtons () {
  for (const [buttonSelector, sourceSelector] of [
    ['.copyTextArea', 'textarea'],
    ['.copyOutput', 'output']
  ]) {
    for (const button of document.querySelectorAll(buttonSelector)) {
      button.addEventListener('click', ({ target }) => {
        const source = target.parentNode.querySelector(sourceSelector)
        navigator.clipboard.writeText(source.textContent || source.value)
        const originalText = target.textContent
        target.textContent = 'Copied!'
        setTimeout(() => {
          target.textContent = originalText
        }, 3000)
      })
    }
  }
}

/* Helper Functions */

function elementWithText (name, text) {
  const e = document.createElement(name)
  e.textContent = text
  return e
}

function annotationsTable (annotations) {
  if (annotations.length === 0) {
    return elementWithText('p', 'No Results')
  }
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
    const levelCell = document.createElement('td')
    const span = document.createElement('span')
    levelCell.appendChild(span)
    span.classList.add(level)
    span.textContent = level
    tr.appendChild(levelCell)
    tr.appendChild(elementWithText('td', message))
    tr.appendChild(elementWithText('td', path.join(', ')))
  }
  return table
}

function parse (value) {
  if (value.trim()[0] === '{') {
    console.error('parsing as JSON')
    return JSON.parse(value)
  } else {
    return commonmark.parse(value).form
  }
}
