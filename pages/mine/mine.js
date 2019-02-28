const app = getApp()

Page({
  data: {
    aboutUsTitle: '',
    aboutUsContent: '',
    servicePhoneNumber: '13831959783',
    balance: 0,
    freeze: 0,
    score: 0,
    score_sign_continuous: 0,
    iconSize: 45,
    iconColor: '#999999'
  },
  onPullDownRefresh: function () {
    var that = this
    wx.showNavigationBarLoading()
    that.onShow()
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },
  onLoad() {
    let that = this;
    that.setData({
      version: app.globalData.version,
      background_color: app.globalData.globalBGColor,
      bgRed: app.globalData.bgRed,
      bgGreen: app.globalData.bgGreen,
      bgBlue: app.globalData.bgBlue
    })

    let userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      wx.navigateTo({
        url: "/pages/authorize/authorize"
      })
    }
  },
  onShow() {
    var that = this;
    that.getUserApiInfo();
    that.getUserAmount();
    // that.checkScoreSign();
    that.getAboutUs();
    // that.getservicePhoneNumber();

    var userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      that.setData({
        userInfo: userInfo,
      })
    }

  },
  scoresign: function () {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/score/sign',
      data: {
        token: wx.getStorageSync('token')
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.getUserAmount();
          that.checkScoreSign();
        } else {
          wx.showModal({
            title: '错误',
            content: res.data.msg,
            showCancel: false
          })
        }
      }
    })
  },
  aboutUs: function () {
    var that = this
    wx.showModal({
      title: that.data.aboutUsTitle,
      content: that.data.aboutUsContent,
      showCancel: false
    })
  },
  makePhoneCall: function () {
    var that = this;
    wx.makePhoneCall({
      phoneNumber: that.data.servicePhoneNumber,
      success: function (res) { },
      fail: function (res) {
        wx.showModal({
          title: '呼叫失败',
          content: '请稍后再试',
          showCancel: false,
        })
      },
      complete: function (res) { },
    })
  },
  getUserApiInfo: function () {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/user/detail',
      data: {
        token: wx.getStorageSync('token')
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            apiUserInfoMap: res.data.data,
            userMobile: res.data.data.base.mobile
          });
        }
      }
    })

  },
  getUserAmount: function () {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/user/amount',
      data: {
        token: wx.getStorageSync('token')
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            balance: res.data.data.balance,
            freeze: res.data.data.freeze,
            score: res.data.data.score
          });
        }
      }
    })

  },
  getAboutUs: function () {
    var that = this
    //  获取关于我们Title
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/config/get-value',
      data: {
        key: 'aboutUsTitle'
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            aboutUsTitle: res.data.data.value
          })
        }
      }
    })
    //  获取关于我们内容
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/config/get-value',
      data: {
        key: 'aboutUsContent'
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            aboutUsContent: res.data.data.value
          })
        }
      }
    })
  },
  relogin: function () {
    wx.navigateTo({
      url: "/pages/authorize/authorize"
    })
    this.onLoad()
  }
})