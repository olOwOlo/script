// ==UserScript==
// @name                e-view
// @description         Load all images in gallery page | 画廊页面载入当前页所有图片
// @icon                https://exhentai.org/favicon.ico
// @version             1.0.0
// @author              olOwOlo
// @namespace           https://olowolo.com
// @homepage            https://github.com/olOwOlo/script/tree/master/e-view
// @supportURL          https://github.com/olOwOlo/script
// @license             BSD 3-clause
// @match               https://e-hentai.org/g/*
// @run-at              document-start
// @grant               GM_addStyle
// ==/UserScript==
//
/*
 * Copyright (c) 2017 olOwOlo
 * Released under the 3-Clause BSD license.
 * ***********************
 * ***** Release Note *****
 * 1.0.0 - first commit
 */
;(function () {
  'use strict'

  // load jQuery and fancybox
  loadCSS('https://cdn.jsdelivr.net/npm/@fancyapps/fancybox@3.1.20/dist/jquery.fancybox.min.css', 'sha256-7TyXnr2YU040zfSP+rEcz29ggW4j56/ujTPwjMzyqFY=')
  loadAsyncScript('https://cdn.jsdelivr.net/npm/jquery@3.2.1/dist/jquery.min.js', 'sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=',
    () => loadAsyncScript('https://cdn.jsdelivr.net/npm/@fancyapps/fancybox@3.1.20/dist/jquery.fancybox.min.js', 'sha256-XVLffZaxoWfGUEbdzuLi7pwaUJv1cecsQJQqGLe7axY='))

  const container = document.createElement('div')
  const control = document.createElement('div')

  document.addEventListener('DOMContentLoaded', () => {
    const targets = document.querySelectorAll('#gdt > div > div > a')
    const body = document.getElementsByTagName('body')[0]

    container.id = 'e-view-container'
    body.insertBefore(container, document.getElementById('cdiv'))

    control.id = 'e-view-control'
    control.innerHTML = '<a href="javascript:void(0)">Click here to load images in this page. / 点击此处载入当前页面的所有图片</a>'
    control.onclick = () => {
      loadImgByFetchPages(targets, targets.length)
      control.onclick = () => window.alert('You should not click this twice.')
    }
    body.insertBefore(control, container)

    GM_addStyle('#e-view-container,#e-view-control{background:#edebdf;border:1px solid #5c0d12;width:99%;min-width:720px;max-width:1200px;margin:10px auto;clear:both;padding:5px;border-radius:9px;text-align:center}#e-view-container .e-view-img-container{margin-bottom:.5rem}#e-view-container img{max-width:100%}#e-view-container .e-view-page-index{font-weight:bold;font-size:14px;padding:.5rem}')
  })

  function createImgContainer (url, imgSrc, pageIndex, loadFail) {
    const imgContainer = document.createElement('div')
    imgContainer.className = 'e-view-img-container'

    const fancyboxWrap = document.createElement('a')
    fancyboxWrap.className = 'fancybox'
    fancyboxWrap.href = imgSrc
    fancyboxWrap.setAttribute('data-fancybox', 'gallery')

    const img = document.createElement('img')
    img.className = 'e-view-img'
    img.src = imgSrc

    fancyboxWrap.appendChild(img)
    imgContainer.appendChild(fancyboxWrap)

    const pageIndexElement = document.createElement('div')
    pageIndexElement.className = 'e-view-page-index'
    pageIndexElement.innerHTML = `--- Page: ${pageIndex} ---`
    imgContainer.appendChild(pageIndexElement)

    const click = document.createElement('a')
    click.href = 'javascript:void(0)'
    click.className = 'e-view-load-fail'
    click.setAttribute('data-loadfail', loadFail)
    click.setAttribute('data-url', url)
    click.innerHTML = 'Click here if the image fails loading'
    click.onclick = function () {
      const loadFail = this.dataset.loadfail
      const lastUrl = this.dataset.url
      const newUrl = lastUrl.includes('nl') ? `${lastUrl}&nl=${loadFail}` : `${lastUrl}?nl=${loadFail}`
      changeImgWhenLoadFail(this, newUrl)
    }
    imgContainer.appendChild(click)
    return imgContainer
  }

  function changeImgWhenLoadFail (target, newUrl) {
    fetchEHentaiPage(newUrl, (src, pageIndex, loadFail) => {
      const oldNode = target.parentElement
      oldNode.parentElement.replaceChild(createImgContainer(newUrl, src, pageIndex, loadFail), oldNode)
    })
  }

  function loadImgByFetchPages (targets, length, index = 0) {
    if (index >= length) return

    const url = targets[index].href

    fetchEHentaiPage(url, (src, pageIndex, loadFail) => {
      container.appendChild(createImgContainer(url, src, pageIndex, loadFail))
      // enable fancybox
      if ($.fancybox) {
        $('.fancybox').fancybox({
          selector: '.fancybox',
          loop: true
        })
      }

      setTimeout(() => loadImgByFetchPages(targets, length, index + 1), 2000)
    })
  }

  function loadAsyncScript (src, integrity, callback) {
    const head = document.getElementsByTagName('head')[0]
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.setAttribute('crossorigin', 'anonymous')
    if (integrity) script.setAttribute('integrity', integrity)
    script.src = src
    script.async = true
    head.appendChild(script)
    if (callback) {
      script.onload = () => callback()
    }
  }

  function loadCSS (href, integrity) {
    const head = document.getElementsByTagName('head')[0]
    const css = document.createElement('link')
    css.setAttribute('rel', 'stylesheet')
    css.setAttribute('crossorigin', 'anonymous')
    if (integrity) css.setAttribute('integrity', integrity)
    css.href = href
    head.appendChild(css)
  }

  function fetchEHentaiPage (url, callback) {
    fetchGenericPage(url, (text) => {
      const srcMatch = text.match(/<div id="i3">.*?<\/div>/)[0].match(/src=".*?"/)
      const src = srcMatch[0].slice(5, srcMatch[0].length - 1)

      const onclickMatch = text.match(/onclick="return nl\('[0-9]+-[0-9]+'\)/)
      const loadFail = onclickMatch[0].slice(20, onclickMatch[0].length - 2)

      const pageIndex = url.slice(url.indexOf('-', 10) + 1)

      console.log(`[e-view]: Get pageIndex[${pageIndex}] src[${src}] loadFail[${loadFail}] from ${url}`)

      callback(src, pageIndex, loadFail)
    })
  }

  function fetchGenericPage (url, callback) {
    fetch(url, {
      method: 'GET', mode: 'same-origin', credentials: 'same-origin'
    }).then((response) => {
      if (response.status >= 200 && response.status < 300) return response
      const error = new Error(response.statusText)
      error.response = response
      throw error
    }).then((response) => {
      return response.text()
    }).then((text) => {
      callback(text)
    }).catch(err => console.log(err))
  }
})()
