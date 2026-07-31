import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// Resolved from the project root: under jsdom `import.meta.url` is not a file URL.
const css = readFileSync(resolve(process.cwd(), 'src/assets/styles/tokens.css'), 'utf8').replace(
  /\/\*[\s\S]*?\*\//g,
  '',
)

interface Rule {
  selector: string
  body: string
}

const rules: Rule[] = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
  selector: match[1].trim(),
  body: match[2],
}))

describe('theme tokens', () => {
  /**
   * `var()` inside a custom property is substituted where the property is
   * *declared*. A hue-dependent token declared on `:root` therefore resolves
   * `--player-hue` to its fallback and paints every player the same colour, so
   * those declarations have to live on the panel that carries the hue.
   */
  it('declares every hue-dependent token on the panel itself', () => {
    const offenders = rules
      .filter((rule) => rule.body.includes('var(--player-hue'))
      .filter((rule) => !rule.selector.includes('.panel'))
      .map((rule) => rule.selector)

    expect(offenders).toEqual([])
  })

  it('still defines the hue-dependent panel tokens for both themes', () => {
    for (const theme of ['pulse', 'arena']) {
      const rule = rules.find((r) => r.selector === `[data-theme='${theme}'] .panel`)
      expect(rule, `${theme} panel tokens missing`).toBeDefined()
      expect(rule!.body).toContain('--panel-bg')
      expect(rule!.body).toContain('var(--player-hue')
    }
  })

  it('keeps a fallback hue on every var(--player-hue) reference', () => {
    const references = css.match(/var\(--player-hue[^)]*\)/g) ?? []

    expect(references.length).toBeGreaterThan(0)
    expect(references.every((reference) => reference.includes(','))).toBe(true)
  })
})
