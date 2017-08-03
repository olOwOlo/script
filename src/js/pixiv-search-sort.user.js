// ==UserScript==
// @name         Pixiv搜索结果排序 | Pixiv search sort
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  Pixiv搜索结果排序（仅单页）
// @icon         https://www.pixiv.net/favicon.ico
// @author       olOwOlo
// @homepage     https://olowolo.com
// @match        *://www.pixiv.net/search.php?*
// @run-at       document-start
// @grant        none
// ==/UserScript==
//
/*
Copyright (c) 2017 olOwOlo - Released under the MIT License.
  Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
  The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
(function() {
  'use strict';

  document.addEventListener("DOMContentLoaded", function () {
    let container = document.getElementsByClassName('_image-items')[0];
    let itemsArray = Array.prototype.slice.call(container.children);
    itemsArray.sort(function (a, b) {
      return getBookmarkCount(b) - getBookmarkCount(a);
    }).forEach(function (item) {
      container.appendChild(item);
    });
  });

  /**
   * return the bookmark-count
   * @param item
   * @returns {number}
   */
  function getBookmarkCount(item) {
    let countList = item.lastChild;
    return countList.tagName !== 'UL' ? 0 : Number(countList.children[0].children[0].text);
  }

})();