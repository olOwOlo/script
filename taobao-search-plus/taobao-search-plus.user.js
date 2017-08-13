// ==UserScript==
// @name:zh-CN          淘宝搜索PLUS
// @name:zh-TW          淘寶搜索PLUS
// @name                taobao search plus
// @description:zh-CN   淘宝搜索页面自动加载店铺评分，无需鼠标悬停查看！快速查看店铺评分以及同行对比！ | 搜索页面自定义排序方式与显示方式
// @description:zh-TW   淘寶搜索頁面自動加載店鋪評分，無需鼠標懸停查看！快速查看店鋪評分以及同行對比！ | 搜索頁面自定義排序方式與顯示方式
// @description         Auto load shop information, customize the default sort order and ui style(gird or list).
// @icon                https://www.taobao.com/favicon.ico
// @version             1.1.0
// @author              olOwOlo
// @namespace           https://olowolo.com
// @homepage            https://github.com/olOwOlo/script/tree/master/taobao-search-plus
// @supportURL          https://github.com/olOwOlo/script
// @license             MIT
// @match               https://s.taobao.com/search?*
// @run-at              document-start
// @grant               GM_setValue
// @grant               GM_getValue
// @grant               GM_addStyle
// @grant               GM_registerMenuCommand
// ==/UserScript==
//
/*
 * Copyright (c) 2017 olOwOlo
 * Released under the MIT License.
 */
(function () {
  'use strict'

  const DEBUG = false
  function myLog (str) {
    if (DEBUG) console.log(str)
  }

  (function () {
    let globalSort = typeof GM_getValue('sort') === 'undefined' ? 'default' : GM_getValue('sort')
    let globalStyle = typeof GM_getValue('style') === 'undefined' ? 'grid' : GM_getValue('style')
    myLog(`[sort = ${GM_getValue('sort')}, style = ${GM_getValue('style')}]`)

    function parseArgument () {
      const argvMap = new Map()
      const argvArray = window.location.search.substr(1).split('&')
      for (const string of argvArray) {
        argvMap.set(...string.split('='))
      }
      return argvMap
    }

    const argv = parseArgument()

    let href = window.location.href
    if (globalSort !== 'default' && typeof argv.get('sort') === 'undefined') {
      href += `&sort=${globalSort}`
    }
    if (globalStyle !== 'grid' && typeof argv.get('style') === 'undefined') {
      href += `&style=${globalStyle}`
    }
    if (href !== window.location.href) {
      myLog(`redirect... Old href = [${window.location.href}]`)
      window.location.href = href
    }

    const sortOption = ['default', 'renqi-desc', 'sale-desc', 'credit-desc', 'price-asc', 'price-desc', 'total-asc', 'total-desc']
    const styleOption = ['grid', 'list']

    class Setting {
      // 传入数据{sort: sort, style: style}为有效值
      constructor (setting) {
        this.sort = setting.sort
        this.style = setting.style
      }

      toString () {
        return `[sort = ${this.sort}, style = ${this.style}]`
      }

      createUI () {
        const userInterface = document.createElement('div')
        userInterface.innerHTML = '<div class="taobao-plus-container modal-open"><div class="modal fade in" id="taobao-plus-modal" tabindex="-1" role="dialog" aria-labelledby="settingModalLabel"><div class="modal-dialog modal-sm" role="document"><div class="modal-content"><div class="modal-header"><h4 class="modal-title">搜索设置</h4></div><div class="modal-body"><p>默认排序规则</p><div class="radio"><label><input type="radio" name="sortOption" value="default">默认（综合排序）</label></div><div class="radio"><label><input type="radio" name="sortOption" value="renqi-desc">人气从高到低</label></div><div class="radio"><label><input type="radio" name="sortOption" value="sale-desc">销量从高到低</label></div><div class="radio"><label><input type="radio" name="sortOption" value="credit-desc">信用从高到低</label></div><div class="radio"><label><input type="radio" name="sortOption" value="price-asc">价格从低到高</label></div><div class="radio"><label><input type="radio" name="sortOption" value="price-desc">价格从高到低</label></div><div class="radio"><label><input type="radio" name="sortOption" value="total-asc">总价从低到高</label></div><div class="radio"><label><input type="radio" name="sortOption" value="total-desc">总价从高到低</label></div><hr/><p>默认显示风格</p><div class="radio"><label><input type="radio" name="styleOption" value="grid">默认（大部分情况下为网格）</label></div><div class="radio"><label><input type="radio" name="styleOption" value="list">列表</label></div><hr/><div style="text-align:right"><button type="button" id="submit" class="btn btn-success"> 确定</button><button type="button" id="cancel" class="btn btn-default"> 取消</button></div></div></div></div></div> '
        document.body.appendChild(userInterface)
        // display: none
        this.modal = document.getElementById('taobao-plus-modal')
        this.modal.style.display = 'none'
        // init checked
        document.getElementsByName('sortOption')[sortOption.indexOf(this.sort)].checked = true
        document.getElementsByName('styleOption')[styleOption.indexOf(this.style)].checked = true

        /** return checked value */
        function getRadioValue (radioName) {
          const elements = document.getElementsByName(radioName)
          for (const element of elements) {
            if (element.checked) return element.value
          }
        }
        // bind event
        document.getElementById('cancel').onclick = () => this.toggle()
        document.getElementById('submit').onclick = () => {
          const sort = getRadioValue('sortOption')
          const style = getRadioValue('styleOption')
          GM_setValue('sort', sort)
          globalSort = sort
          GM_setValue('style', style)
          globalStyle = style
          this.toggle()
        }
      }

      static isCreated () {
        return document.getElementById('taobao-plus-modal') !== null
      }

      toggle () {
        if (!Setting.isCreated()) {
          GM_addStyle('.taobao-plus-container{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;font-size:14px;line-height:1.42857143;color:#333;-webkit-tap-highlight-color:rgba(0,0,0,0);-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}.taobao-plus-container.modal-open{overflow:hidden;}.taobao-plus-container .modal-open .modal{overflow-x:hidden;overflow-y:auto;}.taobao-plus-container .fade.in{opacity:1;}.taobao-plus-container .modal{position:fixed;top:0;right:0;bottom:0;left:0;z-index:1050;overflow:hidden;-webkit-overflow-scrolling:touch;outline:0;}.taobao-plus-container .fade{opacity:0;-webkit-transition:opacity .15s linear;-o-transition:opacity .15s linear;transition:opacity .15s linear;}.taobao-plus-container .modal.in .modal-dialog{-webkit-transform:translate(0,0);-ms-transform:translate(0,0);-o-transform:translate(0,0);transform:translate(0,0);}.taobao-plus-container .modal.fade .modal-dialog{-webkit-transition:-webkit-transform .3s ease-out;-o-transition:-o-transform .3s ease-out;transition:transform .3s ease-out;}.taobao-plus-container .modal-dialog{position:relative;width:auto;margin:10px;}.taobao-plus-container .modal-content{position:relative;background-color:#fff;-webkit-background-clip:padding-box;background-clip:padding-box;border:1px solid rgba(0,0,0,.2);border-radius:6px;outline:0;-webkit-box-shadow:0 3px 9px rgba(0,0,0,.5);box-shadow:0 3px 9px rgba(0,0,0,.5);}.taobao-plus-container .modal-header{padding:15px;border-bottom:1px solid #e5e5e5;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;content:" ";clear:both;}.taobao-plus-container .modal-title{margin:0;line-height:1.42857143;}.taobao-plus-container h4{font-size:18px;font-family:inherit;font-weight:500;color:inherit;}.taobao-plus-container p{margin:0 0 10px;}.taobao-plus-container .modal-body{position:relative;padding:15px;}.taobao-plus-container .radio{position:relative;display:block;margin-top:10px;margin-bottom:10px;}.taobao-plus-container .radio+.radio{margin-top:-5px;}.taobao-plus-container .radio label{min-height:20px;padding-left:20px;margin-bottom:0;font-weight:400;cursor:pointer;}.taobao-plus-container label{display:inline-block;max-width:100%;margin-bottom:5px;font-weight:700;}.taobao-plus-container .radio input[type=radio]{position:absolute;margin-top:4px\\9;margin-left:-20px;}.taobao-plus-container input[type=radio]{margin:4px 0 0;margin-top:1px\\9;line-height:normal;}.taobao-plus-container input[type=radio]{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;padding:0;}.taobao-plus-container .btn{display:inline-block;margin-right: 10px;padding:6px 12px;margin-bottom:0;font-size:14px;font-weight:400;line-height:1.42857143;text-align:center;white-space:nowrap;vertical-align:middle;-ms-touch-action:manipulation;touch-action:manipulation;cursor:pointer;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;background-image:none;border:1px solid transparent;border-radius:4px;}.taobao-plus-container .btn-default{color:#333;background-color:#fff;border-color:#ccc;}.taobao-plus-container .btn-success{color:#fff;background-color:#5cb85c;border-color:#4cae4c;}.taobao-plus-container hr{height:0;-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;margin-top:20px;margin-bottom:20px;border:0;border-top:1px solid #eee;}@media (min-width:768px){.taobao-plus-container .modal-dialog{width:600px;margin:30px auto;}.taobao-plus-container .modal-sm{width:300px;}.taobao-plus-container .modal-content{-webkit-box-shadow:0 5px 15px rgba(0,0,0,.5);box-shadow:0 5px 15px rgba(0,0,0,.5);}}')
          this.createUI(this.sort, this.style)
        }
        this.modal.style.display === 'none'
          ? this.modal.style.display = 'block'
          : this.modal.style.display = 'none'
      }
    }

    let settingEntry = null
    GM_registerMenuCommand('淘宝搜索PLUS设置', () => {
      if (settingEntry === null) settingEntry = new Setting({sort: globalSort, style: globalStyle})
      settingEntry.toggle()
    })
  })()

  // TODO handleTaskRunin
  // TODO 局部页面切换时flag-last有时还会存在, 局部页面切换时更好的停止上一次tryLoad
  document.addEventListener('DOMContentLoaded', () => {
    myLog('The taobao-search-load-shop-info scrip start.')
    setTimeout(tryLoad, 500)

    GM_addStyle('.my-shopinfo-grid{min-width:auto!important;padding:0 5px 5px!important;border:unset!important;-webkit-box-shadow:unset!important;box-shadow:unset!important}.my-shopinfo-grid .score-box{margin-left:5px;margin-top:auto!important;border-top:unset!important;padding:unset!important}.my-shopinfo-list{float:left;min-width:auto!important;padding:5px!important;border:unset!important;-webkit-box-shadow:unset!important;box-shadow:unset!important}.my-shopinfo-list .score-box{margin-top:auto!important;border-top:unset!important;padding:unset!important}.m-itemlist .items .item.J_MouserOnverReq{height:425px!important}@media(max-width:1250px){.my-shopinfo-grid .score{text-align:center}.my-shopinfo-grid .score .percent{float:none!important}.m-itemlist .items .item.J_MouserOnverReq{height:390px!important}}')
    GM_addStyle('.m-widget-shopinfo .score{margin:3px 0;height:18px;white-space:nowrap}  .m-widget-shopinfo .score .text{float:left;width:96px;color:#3c3c3c}.m-widget-shopinfo .score .highlight{float:left;padding:0 3px;color:#fff}  .m-widget-shopinfo .score .percent{float:left;width:52px;text-align:right}.m-widget-shopinfo .morethan .highlight{background:#f40}.m-widget-shopinfo .morethan .percent{color:#f40}.m-widget-shopinfo .equalthan .highlight{background:#f40}  .m-widget-shopinfo .equalthan .percent{color:#f40}.m-widget-shopinfo .lessthan .highlight{background:#00ba97}.m-widget-shopinfo .lessthan .percent{color:#00ba97}')

    let handleTaskRuning = false
    let taskQueue = []
    let fakeElementQueue = []
    let fakeMirror = []

    /* 捕获 排序|筛选|分页 请求 */
    {
      const MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver
      const target = document.querySelector('head')
      const observer = new MutationObserver((mutations) =>
        mutations.forEach((mutation) => {
          if (mutation.addedNodes) {
            mutation.addedNodes.forEach((node) => {
              const src = node.getAttribute('src')
              if (src !== null && src.includes('https://s.taobao.com/search?')) {
                taskQueue = []
                fakeElementQueue = []
                fakeMirror = []
                setTimeout(() => tryLoad(), 1000)
              }
            })
          }
        })
      )
      const config = { childList: true }
      observer.observe(target, config)
    }

    /**
     * 加载店铺评分
     * @param rest 剩余尝试次数
     * @returns {Promise.<void>}
     */
    async function tryLoad (rest = 10) {
      let {items, state} = getItemsAndPageState()
      if (checkIfSafe() && typeof items !== 'undefined') {
        const length = items.length
        myLog(`Find ${length} Items`)

        const date = new Date()
        for (const item of items) {
          const shopId = getShopId(item)
          if (shopId !== null) taskQueue.push({shopId: shopId, item: item, state: state})
          item.classList.add('flag-last')
        }
        await handleTask(state)

        const realLength = items.length
        myLog(`The Real Length is ${realLength}.`)
        for (let index = length; index < realLength; index++) {
          const shopId = getShopId(items[index])
          if (shopId !== null) taskQueue.push({shopId: shopId, item: items[index], state: state})
          items[index].classList.add('flag-last')
        }
        if (!handleTaskRuning) await handleTask(state)

        myLog(`Task [${date}] finished.`)
      } else {
        myLog(`Items Not Found or unsafe. Rest attempt time is ${rest}.`)
        if (rest !== 0) setTimeout(() => tryLoad(rest - 1), 500)
      }
    }

    async function handleTask (state) {
      handleTaskRuning = true
      while (taskQueue.length !== 0 || fakeElementQueue.length !== 0) {
        myLog(`handleTask start. taskQueue.length = ${taskQueue.length}, fakeElementQueue.length = ${fakeElementQueue.length}`)
        while (taskQueue.length !== 0) {
          myLog('handle a taskQueue.')
          const {shopId, item, state} = taskQueue.shift()
          requestAndCreateShopInfo(shopId, item, state)
          await sleep(250)
        }

        await sleep(500)
        fakeMirror = fakeElementQueue
        fakeElementQueue = []
        while (fakeMirror.length !== 0) {
          myLog('handle a fakeElementQueue.')
          const item = fakeMirror.shift()
          const shopId = getShopId(item)
          if (shopId !== null) taskQueue.push({shopId: shopId, item: item, state: state})
        }
      }
      handleTaskRuning = false
    }

    /**
     * 检查 是否载入了新商品
     * @returns {boolean}
     */
    function checkIfSafe () {
      return document.getElementsByClassName('flag-last').length === 0
    }

    /**
     * 获取商品信息、列表形式
     * @returns {*}
     */
    function getItemsAndPageState () {
      let items = document.getElementsByClassName('item J_MouserOnverReq')
      if (items.length !== 0) {
        return {items: items, state: 'grid'}
      } else if ((items = document.getElementsByClassName('item g-clearfix')).length !== 0) {
        return {items: items, state: 'list'}
      } else {
        return {}
      }
    }

    function getShopId (item) {
      let shopInfo
      if ((shopInfo = item.getElementsByClassName('J_ShopInfo')).length !== 0 ||
        (shopInfo = item.getElementsByClassName('dsr-old J_Dsr')).length !== 0) {
        return shopInfo[0].getAttribute('data-userid')
      } else if (item.getElementsByClassName('fake-line').length !== 0) {
        fakeElementQueue.push(item)
        return null
      } else {
        console.log('无法从页面中获取店铺id...')
        return null
      }
    }

    /**
     * 请求并创建店铺数据
     * @param sid shop id
     * @param item
     * @param state
     */
    function requestAndCreateShopInfo (sid, item, state) {
      // https://s.taobao.com 2454747176
      fetch(`/api?sid=${sid}&callback=shopcard&app=api&m=get_shop_card`, {
        method: 'GET', mode: 'same-origin', credentials: 'same-origin'
      }).then((response) => {
        if (response.status >= 200 && response.status < 300) return response
        const error = new Error(response.statusText)
        error.response = response
        throw error
      }).then((response) => {
        return response.text()
      }).then((text) => {
        text = text.trim()
        createShopInfoElement(item, JSON.parse(text.slice(9, text.length - 2)), state)
      }).catch(err => console.log(err))
    }

    /**
     * 创建店铺信息元素
     * @param itemElement
     * @param shopInfo
     * @param state grid or list
     */
    function createShopInfoElement (itemElement, shopInfo, state) {
      const SMALL_LAPTOP = document.body.scrollWidth <= 1250
      const highlightFormat = (state === 'grid' && !SMALL_LAPTOP) ? '均值' : '比同行均值'

      const shopInfoElement = document.createElement('div')
      shopInfoElement.setAttribute('class', `m-widget-shopinfo my-shopinfo-${state}`)
      shopInfoElement.innerHTML = `<div class="score-box"><ul class="scores">
       <li class="score ${shopInfo.descriptionCompared.class}">
         <span class="text">如实描述：${shopInfo.matchDescription}</span>
         <span class="highlight">${shopInfo.descriptionCompared.text.replace(highlightFormat, '')}</span>
         <span class="percent">${shopInfo.descriptionCompared.rate}</span>
       </li>
       <li class="score ${shopInfo.attitudeCompared.class}">
         <span class="text">服务态度：${shopInfo.serviceAttitude}</span>
         <span class="highlight">${shopInfo.attitudeCompared.text.replace(highlightFormat, '')}</span>
         <span class="percent">${shopInfo.attitudeCompared.rate}</span>
       </li>
       <li class="score ${shopInfo.deliveryCompared.class}">
         <span class="text">物流服务：${shopInfo.deliverySpeed}</span>
         <span class="highlight">${shopInfo.deliveryCompared.text.replace(highlightFormat, '')}</span>
         <span class="percent">${shopInfo.deliveryCompared.rate}</span>
       </li></ul></div>`

      state === 'grid'
        ? itemElement.appendChild(shopInfoElement)
        : itemElement.getElementsByClassName('col col-5')[0].appendChild(shopInfoElement)
    }

    function sleep (ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }
  })
})()
