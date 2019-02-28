//app.js
var starscore = require("./templates/starscore/starscore.js");
App({

  /**
   * 小程序初始化完成时触发，全局只触发一次。
   */
  onLaunch: function () {
    var that = this;

    //  获取商城名称
    wx.request({
      url: 'https://api.it120.cc/' + that.globalData.subDomain + '/config/get-value',
      data: {
        key: 'mallName'
      },
      success: function (res) {
        if (res.data.code == 0) {
          wx.setStorageSync('mallName', res.data.data.value);//将商城名称保存在本地存储
        }
      }
    })
  /**
   * 获取全部商品分类
   */
    wx.request({
      url: 'https://api.it120.cc/' + that.globalData.subDomain + '/shop/goods/category/all',
      success: function (res) {
        
        var categories = []; //{ id: 0, name: "全品类" }
        if (res.data.code == 0) {
          for (var i = 0; i < res.data.data.length; i++) {
            categories.push(res.data.data[i]);
          }
        }
        that.globalData.categories = categories
        console.log('～～～～类列表获取完成：：：');
        console.log(that.globalData.categories)
        that.getGoods(0);//获取全品类商品
      },
      fail: function () {
        that.globalData.onLoadStatus = false
        wx.hideLoading()
        console.log('11')
      }
    })

  },
  getGoods: function (categoryId) {
    /**
     * 根据商品分类ID，获取该分类对应的商品数组
     */
    if (categoryId == 0) {
      categoryId = "";
    }
    var that = this;

    wx.request({
      url: 'https://api.it120.cc/' + that.globalData.subDomain + '/shop/goods/list',
      data: {
        page: that.globalData.page,
        pageSize: that.globalData.pageSize,
        categoryId: categoryId
      },
      success: function (res) {
        that.globalData.goods = []
        var goods = [];

        if (res.data.code != 0 || res.data.data.length == 0) {
          /*that.setData({
            prePageBtn: false,
            nextPageBtn: true,
            toBottom: true
          });*/
          return;
        }
        var temp;
        for (var i = 0; i < res.data.data.length; i++) {
          temp = res.data.data[i];
          temp.minPrice = temp.minPrice.toFixed(2);
          temp.originalPrice = temp.originalPrice.toFixed(2);
          goods.push(temp);
        }

        var goodsName = []; //获取全部商品名称，做为智能联想输入库
        for (var i = 0; i < goods.length; i++) {
          goodsName.push(goods[i].name);
        }
        that.globalData.goodsName = goodsName

        var page = that.globalData.page;
        var pageSize = that.globalData.pageSize;
        for (let i = 0; i < goods.length; i++) {
          goods[i].starscore = (goods[i].numberGoodReputation / goods[i].numberOrders) * 5
          goods[i].starscore = Math.ceil(goods[i].starscore / 0.5) * 0.5
          goods[i].starpic = starscore.picStr(goods[i].starscore)

        }
        that.globalData.goods = goods


        wx.request({
          url: 'https://api.it120.cc/' + that.globalData.subDomain + '/shop/goods/list',
          data: {
            page: that.globalData.page,
            pageSize: that.globalData.pageSize,
            categoryId: categoryId
          },
          success: function (res) {
            var categories = that.globalData.categories
            var goodsList = [],
              id,
              key,
              name,
              typeStr,
              goodsTemp = []
            for (let i = 0; i < categories.length; i++) {
              id = categories[i].id;
              key = categories[i].key;
              name = categories[i].name;
              typeStr = categories[i].type;
              goodsTemp = [];
              for (let j = 0; j < goods.length; j++) {
                if (goods[j].categoryId === id) {
                  goodsTemp.push(goods[j])
                }
              }
              if ((that.globalData.activeCategoryId === null) & (goodsTemp.length > 0)) {
                that.globalData.activeCategoryId = categories[i].id
              }
              goodsList.push({ 'id': id, 'key': key, 'name': name, 'type': typeStr, 'goods': goodsTemp })
            }

            that.globalData.goodsList = goodsList
            that.globalData.onLoadStatus = true
            //that.globalData.activeCategoryId = categories[0].id   改为第一个不为null的类
            console.log('～～～～～～商品列表获取完成：：：：', that.globalData.goodsList);
          },
          fail: function () {
            that.globalData.onLoadStatus = false
          }
        })
      }
    })
  },
  sendTempleMsg: function (orderId, trigger, template_id, form_id, page, postJsonString, emphasis_keyword) {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + that.globalData.subDomain + '/template-msg/put',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        token: wx.getStorageSync('token'), //登录接口返回的登录凭证
        type: 0, //0 小程序 1 服务号
        module: 'order', //所属模块：immediately 立即发送模板消息；order 所属订单模块
        business_id: orderId, //登录接口返回的登录凭证
        trigger: trigger, //module不为immediately时必填，代表对应的【订单】触发的状态
        template_id: template_id, //模板消息ID
        form_id: form_id, //type=0时必填，表单提交场景下，为 submit 事件带上的 formId；支付场景下，为本次支付的 prepay_id
        url: page, //小程序：点击模板卡片后的跳转页面，仅限本小程序内的页面。支持带参数,（示例index?foo=bar）；服务号：跳转的网页地址
        postJsonString: postJsonString, //模板消息内容
        emphasis_keyword: emphasis_keyword //小程序："keyword1.DATA" 模板需要放大的关键词，不填则默认无放大
      },
      success: (res) => {
        //console.log(res.data);
      }
    })
  },
  globalData: {
    page: 1, //初始加载商品时的页面号
    pageSize: 10000, //初始加载时的商品数，设置为10000保证小商户能加载完全部商品
    categories: [
      { "dateAdd": "2019-02-27 15:05:33", "dateUpdate": "2019-02-27 15:08:21", "icon": "https://cdn.it120.cc/apifactory/2019/02/27/67fa1d165cc8cb321e60da7b14277e80.png", "id": 30909, "isUse": true, "key": "000", "level": 1, "name": "本地热卖", "paixu": 0, "pid": 0, "type": "旺季热卖商品", "userId": 13040 }
    ],
    goods: [],
    hotGoods: ['桔', '火龙果', '香蕉', '酸奶', '甘蔗'], //自定义热门搜索商品
    goodsName: [],
    goodsList: [],
    onLoadStatus: true,
    activeCategoryId: null,

    globalBGColor: '#00afb4',
    bgRed: 0,
    bgGreen: 175,
    bgBlue: 180,
    userInfo: null,
    subDomain: "dadishuyuan",// 商城后台个性域名tgg
    version: "1.0.0",
    shareProfile: '让您购书更快更方便' // 首页转发的时候术语
  }
  // 根据自己需要修改下单时候的模板消息内容设置，可增加关闭订单、收货时候模板消息提醒
})
