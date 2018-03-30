// ==UserScript==
// @name                Pixiv搜索结果排序 | Pixiv search sort
// @name:zh-TW          Pixiv搜索結果排序 | Pixiv search sort
// @description         Pixiv搜索结果按收藏数从大到小排序，适配[TS] Pixiv++ V3 | Pixiv search result sort by bookmark count.
// @description:zh-TW   Pixiv搜索結果按收藏數從大到小排序，適配[TS] Pixiv++ V3 | Pixiv search result sort by bookmark count.
// @icon                https://www.pixiv.net/favicon.ico
// @version             0.4.1
// @author              olOwOlo
// @namespace           https://olowolo.com
// @homepage            https://github.com/olOwOlo/script/tree/master/pixiv-search-sort
// @supportURL          https://github.com/olOwOlo/script
// @license             MIT
// @match               *://www.pixiv.net/search.php?*
// @run-at              document-start
// @grant               none
// ==/UserScript==
//
/*
 * Copyright (c) 2017 olOwOlo
 * Released under the MIT License.
 * ***********************
 * ***** Release Note *****
 * 0.4.1 - 修复：P 站更新
 * 0.4.0 - P站已更新，现在只支持单页排序
 * 0.3.0 - 为兼容最新ECMAScript标准，使用babel与webpack处理脚本，可读性更好的源码可于Github查看
 */
(function () {
  'use strict'

  document.addEventListener('DOMContentLoaded', () => sortInContainer(0))

  /**
   * sort in one page
   * @param index
   * @param rest
   */
  function sortInContainer (index, rest = 6) {
    const containers = document.querySelectorAll('#js-react-search-mid > div')
    if (containers.length !== 0) {
      const container = containers[index]
      const itemsArray = Array.from(container.children)
      itemsArray.sort((a, b) => getBookmarkCount(b) - getBookmarkCount(a))
      .forEach(item => container.appendChild(item))
    } else if (rest > 0) {
      myLog(`Container Not Found. Rest time is ${rest}`)
      setTimeout(() => sortInContainer(index, rest - 1), 500)
    }
  }

  /**
   * return the bookmark-count
   * @param item
   * @returns {number}
   */
  function getBookmarkCount (item) {
    const bookmarkCount = item.getElementsByClassName('bookmark-count')[0]
    return typeof bookmarkCount === 'undefined' ? 0 : Number(bookmarkCount.text)
  }

  const DEBUG = false
  function myLog (message) {
    if (DEBUG) console.log(message)
  }
})()
