//login.js
//获取应用实例
var app = getApp();
Page({
  data: {
    remind: '加载中',
    angle: 0
  },
  goToIndex: function () {
    wx.switchTab({
      url: '/pages/category/index',
    });
  },
  onLoad: function () {
    var that = this
    that.setData({
      background_color: app.globalData.globalBGColor,
      bgRed: app.globalData.bgRed,
      bgGreen: app.globalData.bgGreen,
      bgBlue: app.globalData.bgBlue
    })
  },
  onShow: function () {
    console.log('!!!!',!wx.getStorageSync('token'));
    if (!wx.getStorageSync('token')){
      wx.switchTab({
        url: '/pages/mine/mine',
      });
    }
  },
  onReady: function () {
    var that = this;
    setTimeout(function () {
      that.setData({
        remind: ''
      });
    }, 1500);
    wx.onAccelerometerChange(function (res) {
      var angle = -(res.x * 30).toFixed(1);
      if (angle > 14) { angle = 14; }
      else if (angle < -14) { angle = -14; }
      if (that.data.angle !== angle) {
        that.setData({
          angle: angle
        });
      }
    });
  },
});