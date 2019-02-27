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


        console.log('goods----------------------')
        console.log(goods)

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
              console.log("你好," + categories[i].name)
            }

            that.globalData.goodsList = goodsList
            that.globalData.onLoadStatus = true
            console.log('categories:', categories)
            //that.globalData.activeCategoryId = categories[0].id   改为第一个不为null的类

          },
          fail: function () {
            that.globalData.onLoadStatus = false
          }
        })





      }
    })
  },
  globalData: {
    page: 1, //初始加载商品时的页面号
    pageSize: 10000, //初始加载时的商品数，设置为10000保证小商户能加载完全部商品
    categories: [],
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
