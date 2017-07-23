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

    document.addEventListener('DOMContentLoaded', () => this.refresh);
  }

  public onFind() { }

  private compileElement(element: Element | HTMLElement) {
    var tempName = element.getAttribute(COMPILED_ELEMENT_TEMPLATE),
      tempData = element.getAttribute(COMPILED_ELEMENT_DATA);

    if (nul(tempName)) throw new ReferenceError(COMPILED_ELEMENT_TEMPLATE + ' is undefined');
    if (nul(tempData)) throw new ReferenceError(COMPILED_ELEMENT_DATA + ' is undefined');

    tempName = tempName.trim();
    tempData = tempData.trim();

    try {
      tempData = JSON.parse(tempData);
      element.innerHTML += this.compile(tempName, tempData);
    } catch (ex) {
      console.error('Karkas: failed to compile element', {
        element: element,
        error: ex
      });
    }
  }

  public refresh(refreshItems: boolean) {
    // Views container
    if (refreshItems) this.dispose();

    var templateSelector = `script[type="${VIEW_SCRIPT_MIME_TYPE}"]`;

    if (!refreshItems) templateSelector += ':not([data-loaded])';

    // Select all templates
    var w = document.querySelectorAll(templateSelector);

    // Grep all elements
    for (var c = 0; c < w.length; c++) {
      this.createView(w[c].getAttribute("name"), w[c].innerHTML);
    }

    // find items by attr and parse them
    var requestedToParse = document.querySelectorAll(COMPILED_ELEMENT_SELECTOR);

    if (!requestedToParse.length) return true;

    for (var i = 0; i < requestedToParse.length; i++) {
      this.compileElement(requestedToParse[i]);
    }

    if (typeof this.onFind == 'function') {
      this.onFind();
    }
  };

  public include(url: string, templateName: string, successCallback: Function = null): Promise<string> | void {
    function makeRequest(onSuccess: Function, onError: Function = DEF_ERR_CB) {
      var xhr = new XMLHttpRequest();

      xhr.open("GET", url);
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const template = this.createView(templateName, xhr.response);
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

    if ((typeof successCallback == 'function') || !('Promise' in window)) {
      return makeRequest(successCallback);
    }

    return new Promise(makeRequest);
  };
}

