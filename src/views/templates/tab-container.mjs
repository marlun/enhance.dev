import buildScoper from '../scope-css.mjs'
export default function TabContainerTemplate({ html, state = {} }) {
  const addTabs = state?.attrs['add-tabs']
  const id = Math.random().toString(32).slice(2)
  const quantity = parseInt(state?.attrs?.quantity, 10) || 1
  const defaultTab = parseInt(state?.attrs['default-tab'], 10) || 1
  const scope = buildScoper({
    instance: id,
    scopeTo: 'tab-container',
    disable: !state?.store?.scopedCSS
  })
  return html`
    ${scope`
    <style enh-scope="component">
      :host {
        display:block;
      }

      ::slotted([slot^="title"]){
        color:var(--p2);
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
        font-size: 1.333rem;
      }

      .tabs {
        position: relative;
        height: 100vh;
        width: 100%;
        margin: 25px 0;
      }
      .tab {
        float: left;
      }
      .tab label {
        background: white; 
        padding: .5rem; 
        border: 1px solid red;
        cursor: pointer;
        margin-left: -1px; 
      }
      .tab:first-child label {
        margin-left: 0;
      }
      .tab input[type=radio] {
       position: absolute;
       opacity:0;
      }

    
      .tab-content {
        position: absolute;
        top: 2rem;
        left: 0;
        right: 0;
        bottom: 0;
        background: white;
        border: 1px solid #ccc;
        display: none;
      }
      input[type=radio][name="tab-group-${id}"]:checked ~ label {
        background: white;
        border-bottom: 1px solid white;
      }
    
     
       input[type=radio][name="tab-group-${id}"]:not(:checked) ~ label {
        background: gray;
        border-bottom: 1px solid white;
      }
      input[type=radio][name="tab-group-${id}"]:checked ~ label ~ .tab-content {
        display: block;
      }
    </style>
      `}

    <div class="tabs">
      ${[...Array(quantity)]
        .map(
          (_, i) => `
      <div class="tab">
        <input type="radio" id="tab${i + 1}-${id}" name="tab-group-${id}" ${
            i + 1 === defaultTab ? 'checked' : ''
          } />
        <label for="tab${i + 1}-${id}"><slot name="title${i + 1}">tab${
            i + 1
          }</slot>
          ${
            addTabs && i > 0
              ? `
          <button type="button" >
            <svg
             width="1.5rem"
             height="1.5rem"
           xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
</svg>
        </button>`
              : ''
          }
          </label>
        <div class="tab-content">
          <slot name="content${i + 1}">text ${i + 1}</slot>
        </div>
      </div>
      `
        )
        .join('')}
      ${addTabs
        ? `
      <button
        class="js-add-tab border-solid font-extrabold p-5 ml0 border border-solid radius3"
        type="button">
        <svg
          width="1.5rem"
          height="1.5rem"
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 4v16m8-8H4" />
        </svg>
      </button>`
        : ''}
      <slot name="add-tab-content"></slot>
    </div>

    <script type="module">
      class TabContainer extends HTMLElement {
        constructor() {
          super()
          this.addTab = this.addTab.bind(this)
          this.newTabTemplate = this.querySelector(
            'div[slot="add-tab-content"]'
          )
          this.newTabButton = this.querySelector('button.js-add-tab')
          this.tabs = this.querySelector('div.tabs')
          this.newTitle = this.newTabTemplate?.querySelector('[slot="title"]')
          this.newContent =
            this.newTabTemplate?.querySelector('[slot="content"]')
          if (this.addTabs) {
            this.newTabButton?.addEventListener('click', this.addTab)
          }
        }
        get addTabs() {
          console.log('checking add-tabs')
          return this.getAttribute('add-tabs')
        }
        connectedCallback() {}
        addTab() {
          console.log('trying to add')
          const id = Math.random().toString(32).slice(2)
          const group = this.querySelector('input').getAttribute('name')
          const newTabHTML = (id, title, content, group) => \`
      <div class="tab">
        <input type="radio" id="tab-\${id}" name="\${group}"  />
        <label for="tab-\${id}">
          \${title} 
          <button type="button" >
            <svg
             width="1.5rem"
             height="1.5rem"
           xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
</svg>
        </button>
        </label>
        <div class="tab-content">
          \${content}
        </div>
      </div>
      \`

          const title = this.newTitle.outerHTML
          const content = this.newContent.outerHTML
          const newTab = newTabHTML(id, title, content, group)
          this.newTabButton.insertAdjacentHTML('beforebegin', newTab)
        }
      }
      customElements.define('tab-container', TabContainer)
    </script>
  `
}
