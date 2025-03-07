/* eslint-disable filenames/match-regex */
import { existsSync, readFileSync } from 'fs'
import { URL } from 'url'
import { Arcdown } from 'arcdown'
import arcStaticImg from 'markdown-it-arc-static-img'
import navDataLoader, {
  unslug,
  other as otherLinks,
} from '../../docs/nav-data.mjs'
import HljsLineWrapper from '../../docs/hljs-line-wrapper.mjs'
import redirects from '../../lib/docs-redirects.mjs'

const arcdown = new Arcdown({
  pluginOverrides: {
    markdownItToc: {
      containerClass: 'toc mbe2 mis-2 leading2',
      listType: 'ul',
    },
  },
  plugins: [arcStaticImg],
  hljs: {
    sublanguages: { javascript: ['xml', 'css'] },
    plugins: [new HljsLineWrapper({ className: 'code-line' })],
  },
})

/** @type {import('@enhance/types').EnhanceApiFn} */
export async function get(request) {
  const { path: activePath } = request
  let docPath = activePath.replace(/^\/?docs\//, '') || 'index'

  // Redirects for new marketing pages
  if (redirects[docPath]) {
    return {
      statusCode: 301,
      location: redirects[docPath],
    }
  }

  if (docPath.endsWith('/')) {
    docPath += 'index' // trailing slash == index.md file
  }

  const gacode =
    process.env.ARC_ENV === 'production' ? 'G-FQHNPN78V3' : 'G-0ES194BJQ6'

  let docURL = new URL(`../../docs/md/${docPath}.md`, import.meta.url)
  if (!existsSync(docURL.pathname)) {
    docURL = new URL(`../../docs/md/${docPath}/index.md`, import.meta.url)
    if (existsSync(docURL.pathname)) {
      return {
        status: 302,
        location: `${activePath}/`,
      }
    }
  }

  const navData = navDataLoader('docs', activePath)

  let docMarkdown
  try {
    docMarkdown = readFileSync(docURL.pathname, 'utf-8')
  } catch (_err) {
    let searchTerm = null
    if (!docPath.endsWith('/index')) {
      const docPathParts = docPath.split('/')
      searchTerm = docPathParts.pop()
      searchTerm = unslug(searchTerm)
    }
    const initialState = {
      doc: {
        title: '404',
        path: docPath,
        html: `<docs-404 search-term="${searchTerm}"></docs-404>`,
      },
      otherLinks,
      navData,
      searchTerm,
      gacode,
    }

    return { statusCode: 404, json: initialState }
  }
  const doc = await arcdown.render(docMarkdown)

  let gitHubLink = 'https://github.com/enhance-dev/enhance.dev/edit/main/'
  gitHubLink += `app/docs/md/${docPath}.md`

  const initialState = {
    doc,
    gitHubLink,
    otherLinks,
    navData,
    gacode,
  }

  let cacheControl =
    process.env.ARC_ENV === 'production'
      ? 'max-age=3600;'
      : 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0'

  return {
    cacheControl,
    json: initialState,
  }
}
