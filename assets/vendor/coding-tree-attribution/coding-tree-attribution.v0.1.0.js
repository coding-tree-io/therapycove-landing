const i = `:host {
  --leaf-color-light: #88d89d;
  --leaf-color-medium: #4da86d;
  --brand-color-deep: #1f6d43;
  --accent-color-cool: #5d85a8;
  --text-color-muted: rgba(36, 44, 56, 0.66);
  --focus-ring-color: rgba(77, 168, 109, 0.48);

  /* Compact green leaf palette adapted from the unorthodocss leaf proportions */
  --attribution-leaf-base: #78be4a;
  --attribution-leaf-dark: #3f7f2a;
  --attribution-leaf-highlight: #dff5bd;
  --attribution-leaf-outline: #295f24;

  color: var(--text-color-muted);
  display: inline-block;
  font-family: inherit;
  line-height: 1.35;
  overflow: visible;
  vertical-align: baseline;
}

:host([theme="light"]) {
  --leaf-color-light: #a8e3b8;
  --leaf-color-medium: #6dc08a;
  --brand-color-deep: #235c3a;
  --accent-color-cool: #678dad;
  --text-color-muted: rgba(28, 36, 48, 0.76);
  --focus-ring-color: rgba(109, 192, 138, 0.46);
}

:host([theme="dark"]) {
  --leaf-color-light: #90d9a4;
  --leaf-color-medium: #58b77a;
  --brand-color-deep: #d9f2e2;
  --accent-color-cool: #a8c1e1;
  --text-color-muted: rgba(230, 238, 248, 0.86);
  --focus-ring-color: rgba(88, 183, 122, 0.58);
}

.credit-line {
  align-items: center;
  color: var(--text-color-muted);
  display: inline-flex;
  font-size: 0.6rem;
  gap: 0.32rem;
  letter-spacing: 0.015em;
  line-height: inherit;
  margin: 0;
  overflow: visible;
  padding-block: 0.02em 0.1em;
  position: relative;
  text-wrap: balance;
}

:host([size="md"]) .credit-line {
  font-size: 0.68rem;
  gap: 0.38rem;
}

:host([size="lg"]) .credit-line {
  font-size: 0.8rem;
  gap: 0.42rem;
}

.leaf-icon {
  --leaf-icon-size: 11px;
  --leaf-outline-thickness: max(1px, calc(var(--leaf-icon-size) * 0.11));

  background:
    radial-gradient(circle at 24% 25%, var(--attribution-leaf-highlight) 0 20%, transparent 22%),
    radial-gradient(circle at 58% 70%, color-mix(in srgb, var(--attribution-leaf-base) 68%, var(--attribution-leaf-dark) 32%) 0 38%, transparent 41%),
    linear-gradient(150deg, var(--attribution-leaf-base) 0%, var(--attribution-leaf-dark) 100%);
  border: var(--leaf-outline-thickness) solid var(--attribution-leaf-outline);
  border-radius: 74% 28% 76% 34%;
  box-shadow:
    inset calc(var(--leaf-icon-size) * -0.06) calc(var(--leaf-icon-size) * 0.08) 0 0 color-mix(in srgb, var(--attribution-leaf-dark) 78%, black 22%),
    inset calc(var(--leaf-icon-size) * 0.08) calc(var(--leaf-icon-size) * -0.08) 0 0 color-mix(in srgb, var(--attribution-leaf-highlight) 58%, white 42%);
  box-sizing: border-box;
  display: inline-block;
  flex-shrink: 0;
  height: var(--leaf-icon-size);
  position: relative;
  transform: rotate(-26deg);
  transform-origin: center;
  width: var(--leaf-icon-size);
}

.leaf-icon::after {
  background: var(--attribution-leaf-outline);
  border-radius: 999px;
  content: "";
  height: calc(var(--leaf-icon-size) * 0.68);
  left: calc(var(--leaf-icon-size) * 0.28);
  position: absolute;
  top: calc(var(--leaf-icon-size) * 0.76);
  transform: rotate(44deg);
  transform-origin: top center;
  width: max(1px, calc(var(--leaf-icon-size) * 0.12));
}

:host([size="md"]) .leaf-icon {
  --leaf-icon-size: 13px;
}

:host([size="lg"]) .leaf-icon {
  --leaf-icon-size: 15px;
}

.prefix-text,
.brand-link {
  display: inline-block;
  line-height: inherit;
}

.brand-link {
  color: var(--brand-color-deep);
  font-weight: 600;
  letter-spacing: 0.02em;
  text-decoration: none;
  transition: color 0.2s ease;
}

@supports ((-webkit-background-clip: text) or (background-clip: text)) {
  .brand-link {
    background: linear-gradient(
      90deg,
      var(--brand-color-deep) 0%,
      var(--leaf-color-medium) 55%,
      var(--accent-color-cool) 100%
    );
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
}

.brand-link:visited {
  color: color-mix(in srgb, var(--brand-color-deep) 85%, #4f7f67 15%);
}

.brand-link:active {
  color: color-mix(in srgb, var(--brand-color-deep) 90%, #1f3318 10%);
}

.brand-link:focus-visible {
  border-radius: 2px;
  outline: 2px solid var(--focus-ring-color);
  outline-offset: 3px;
}
`, a = `<p class="credit-line" part="credit-line">
  <span class="leaf-icon" aria-hidden="true" part="leaf-icon"></span>
  <span class="prefix-text" part="prefix-text">Built by</span>
  <a class="brand-link" part="brand-link" target="_blank" rel="noopener noreferrer">Coding Tree</a>
</p>
`, o = `<style>${i}</style>${a}`, l = "https://github.com/coding-tree-io", e = "Coding Tree";
class c extends HTMLElement {
  static get observedAttributes() {
    return ["href"];
  }
  brandLinkElement;
  constructor() {
    if (super(), this.attachShadow({ mode: "open" }), !this.shadowRoot)
      throw new Error("The component requires a shadow root.");
    this.shadowRoot.innerHTML = o;
    const n = this.shadowRoot.querySelector(".brand-link");
    if (!(n instanceof HTMLAnchorElement))
      throw new Error("The component brand link could not be initialized.");
    this.brandLinkElement = n;
  }
  connectedCallback() {
    this.renderBrandLink();
  }
  attributeChangedCallback(n, t, r) {
    n === "href" && t !== r && this.renderBrandLink();
  }
  renderBrandLink() {
    const n = this.getConfiguredDestinationUrl();
    this.brandLinkElement.setAttribute("href", n), this.brandLinkElement.textContent = e, this.brandLinkElement.setAttribute("aria-label", `Open ${e}`);
  }
  getConfiguredDestinationUrl() {
    const n = this.getAttribute("href");
    return !n || n.trim().length === 0 ? l : n;
  }
}
customElements.get("coding-tree-attribution") || customElements.define("coding-tree-attribution", c);
export {
  c as CodingTreeAttribution
};
