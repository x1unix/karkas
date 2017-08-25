/**
 * Karkas.js (https://github.com/odin3/karkas)
 * Licensed by MIT license
 *
 * @package karkas
 * @version 4.0.0
 * @author Denis Sedchenko
 */

import { Karkas } from './karkas';

function def(e: any) { return typeof e !== 'undefined'; }
function nul(e: any) { return e === null }

const COMPILED_ELEMENT_SELECTOR = '*[data-compile]',
      COMPILED_ELEMENT_DATA = 'data-compile',
      COMPILED_ELEMENT_TEMPLATE = 'data-view',
      VIEW_SCRIPT_MIME_TYPE = 'text/karkas';

const DEF_ERR_CB = (e: any) => console.error(e);


export class KarkasDOM extends Karkas {
  public constructor() {
    super();

    if (!def(window)) throw new ReferenceError('Karkas DOM extensions requries browser');
    if (!def(window.document)) throw new Error('Karkas DOM extensions requires a document object');

    document.addEventListener('DOMContentLoaded', () => this.refresh());
  }

  public onFind() { }

  /**
   * Process single DOM element
   *
   * @private
   * @param {(Element | HTMLElement)} element
   * @memberof KarkasDOM
   */
  private compileElement(element: Element | HTMLElement) {
    let tempName = element.getAttribute(COMPILED_ELEMENT_TEMPLATE),
        tempData = element.getAttribute(COMPILED_ELEMENT_DATA);

    let source = null;

    const noTemplateName = nul(tempName);
    const hasTemplateData = !nul(tempData);

    if (hasTemplateData) {
      try {
        source = JSON.parse(tempData);
      } catch(error) {
        console.error(`Karkas: Failed to parse source object from attribute: "${error}"`, {
          element,
          error,
          data: tempData
        });

        source = null;
      }
    }

    /**
     * If template name is defined at 'data-view' attribute - try to find registered view.
     * Otherwize, create a new instance on the fly with div content
     */
    const template = noTemplateName ? this.view(String(element.innerHTML)) : this.getView(String(tempName).trim());

    if (noTemplateName) {
      // If template name is not defined - replace inner HTML with the compiled one
      element.innerHTML = template.compile(source);
    } else {
      // Otherwize, append HTML
      element.innerHTML += template.compile(source);
    }
  }

  /**
   * Re-start DOM check
   *
   * @param {boolean} [refreshItems=true]
   * @returns
   * @memberof KarkasDOM
   */
  public refresh(refreshItems: boolean = true) {
    // Views container
    if (refreshItems) this.dispose();

    let templateSelector = `script[type="${VIEW_SCRIPT_MIME_TYPE}"]`;

    if (!refreshItems) templateSelector += ':not([data-loaded])';

    // Select all templates
    let w = document.querySelectorAll(templateSelector);

    // Grep all elements
    for (let c = 0; c < w.length; c++) {
      this.createView(w[c].getAttribute("name"), w[c].innerHTML);
    }

    // find items by attr and parse them
    let requestedToParse = document.querySelectorAll(COMPILED_ELEMENT_SELECTOR);

    if (!requestedToParse.length) return true;

    for (let i = 0; i < requestedToParse.length; i++) {
      this.compileElement(requestedToParse[i]);
    }

    if (typeof this.onFind === 'function') {
      this.onFind();
    }
  };

  /**
   * Load template from external resource
   *
   * @param {string} url Resource URL
   * @param {string} templateName Template name
   * @param {Function} [successCallback=null] Callback function (if not defined, Promise will be returned)
   * @returns {(Promise<string> | void)}
   * @memberof KarkasDOM
   */
  public include(url: string, templateName: string, successCallback: Function = null): Promise<string> | void {
    const self = this;
    function makeRequest(onSuccess: Function, onError: Function = DEF_ERR_CB) {
      let xhr = new XMLHttpRequest();

      xhr.open("GET", url);
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const template = self.createView(templateName, xhr.response);
          onSuccess(template, xhr.response);
        } else {
          onError({
            status: this.status,
            statusText: xhr.statusText
          });
        }
      };

      xhr.onerror = () => {
        if (def(onError)) {
          onError({
            status: xhr.status,
            statusText: xhr.statusText
          });
        } else {
          console.error('Karkas: Failed to import remote template: ', {
            status: xhr.status,
            statusText: xhr.statusText
          });
        }
      };

      xhr.send();
    }

    if (typeof url !== 'string') throw new ReferenceError('Karkas: Url is not a String');

    templateName = templateName || url;

    if ((typeof successCallback === 'function') || !('Promise' in window)) {
      return makeRequest(successCallback);
    }

    return new Promise(makeRequest);
  };
}

