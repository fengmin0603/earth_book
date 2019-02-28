var app = getApp();
var starscore = require("../../templates/starscore/starscore.js");
Page(Object.assign({}, {
  data: {
    onLoadStatus: true,
    shopLogo: 'https://cdn.it120.cc/apifactory/2018/06/10/527a0d6e3b3f1ffc32748193d743da26.jpg',
    categories: [],
    shopDelivery: [],
    shopPrompt: '正常营业时间8:00AM-19:00PM',
    activeCategoryId: null,
    goods: [],
    goodsList: [],
    classifyViewed: '',
    scrolltop: 0,
    activeCategoryId: null,
    goodsListCurrent:[],
    page: 1,
    pageSize: 5000,
    width: 0,
    height: 0
  },
  onLoad: function (options) {
    console.log('options:::', options);
    var that = this
    /**
     * 设置当前页面顶部标题
     */
    wx.setNavigationBarTitle({
      title: wx.getStorageSync('mallName')
    })

    that.setData({
      categories: app.globalData.categories,
      goods: app.globalData.goods,
      goodsList: app.globalData.goodsList,
      onLoadStatus: app.globalData.onLoadStatus,
      activeCategoryId: app.globalData.activeCategoryId,
      background_color: app.globalData.globalBGColor,
      bgRed: app.globalData.bgRed,
      bgGreen: app.globalData.bgGreen,
      bgBlue: app.globalData.bgBlue
    })

    /**
     * 遍历商品分类数组，初始化选中某一分类的状态，并获取该分类下商品数组
     */
    for (var i = 0; i < that.data.categories.length; i++) {
      if (that.data.activeCategoryId === that.data.categories[i].id) {
        that.setData({
          classifyViewed: that.data.categories[i].id,
          scrolltop: 0,
          goodsListCurrent: that.data.goodsList[i],
        })
      }
    }

    //获取系统信息  
    wx.getSystemInfo({
      //获取系统信息成功，将系统窗口的宽高赋给页面的宽高  
      success: function (res) {
        that.width = res.windowWidth / 2.9  //2.6
        that.height = res.windowWidth / 2.9  //2.6
      }
    })

    that.getDelivery();

  },
  //onReady生命周期函数，监听页面初次渲染完成  
  onReady: function () {
    //调用canvasClock函数  
    this.canvasClock()
    //对canvasClock函数循环调用  
    this.interval = setInterval(this.canvasClock, 1000)
  },
  canvasClock: function () {
    var context = wx.createCanvasContext(this.canvasId, this)//创建并返回绘图上下文（获取画笔）  
    //设置宽高  
    var width = this.width
    var height = this.height
    var R = width / 4.5;//设置文字距离时钟中心点距离  
    //重置画布函数  
    function reSet() {
      context.height = context.height;//每次清除画布，然后变化后的时间补上  
      context.translate(width / 2.9, height / 2.9);//设置坐标轴原点  
      context.save();//保存中点坐标1  
    }
    //绘制中心圆和外面大圆  
    function circle() {
      //外面大圆  
      /*context.setLineWidth(1);
      context.beginPath();
      context.arc(0, 0, width / 2 - 30, 0, 2 * Math.PI, true);
      context.closePath();
      context.stroke();*/
      //中心圆  
      context.beginPath();
      context.arc(0, 0, 1.5, 0, 2 * Math.PI, true);
      context.closePath();
      context.stroke();
    }
    //绘制字体  
    function num() {
      // var R = width/2-60;//设置文字距离时钟中心点距离  
      context.setFontSize(width / 14)//设置字体样式  
      context.textBaseline = "middle";//字体上下居中，绘制时间  
      for (var i = 1; i < 13; i++) {
        //利用三角函数计算字体坐标表达式  
        var x = R * Math.cos(i * Math.PI / 6 - Math.PI / 2);
        var y = R * Math.sin(i * Math.PI / 6 - Math.PI / 2);
        if (i == 11 || i == 12) {//调整数字11和12的位置  
          context.fillText(i, x - width / 23, y + width / 50);
        } else if (i == 10) {//调整数字10的位置
          context.fillText(i, x - width / 25, y + width / 40);
        }
        else {
          context.fillText(i, x - width / 45, y);
        }
      }
    }
    //绘制小格  
    function smallGrid() {
      context.setLineWidth(0.5);
      context.rotate(-Math.PI / 2);//时间从3点开始，倒转90度  
      for (var i = 0; i < 60; i++) {
        context.beginPath();
        context.rotate(Math.PI / 30);
        context.moveTo(width / 3.425, 0);
        context.lineTo(width / 3.75, 0);
        context.stroke();
      }
    }
    //绘制大格  
    function bigGrid() {
      context.setLineWidth(1);
      for (var i = 0; i < 12; i++) {
        context.beginPath();
        context.rotate(Math.PI / 6);
        context.moveTo(width / 3.42, 0);
        context.lineTo(width / 3.85, 0);
        context.stroke();
      }
    }
    //指针运动函数  
    function move() {
      var t = new Date();//获取当前时间  
      var h = t.getHours();//获取小时  
      h = h > 12 ? (h - 12) : h;//将24小时制转化为12小时制  
      var m = t.getMinutes();//获取分针  
      var s = t.getSeconds();//获取秒针  
      context.save();//再次保存2  
      //旋转角度=30度*（h+m/60+s/3600）  
      //分针旋转角度=6度*（m+s/60）  
      //秒针旋转角度=6度*s  

      //绘制时针  
      context.setLineWidth(1.2);
      context.beginPath();
      context.rotate((Math.PI / 6) * (h + m / 60 + s / 3600));
      context.moveTo(-width / 24, 0);//指针开始位置
      context.setLineCap('round')
      context.lineTo(width / 9, 0);//指针结束位置，可以决定指针长度
      context.stroke();
      context.restore();//恢复到2,（最初未旋转状态）避免旋转叠加  
      context.save();//3  
      //画分针  
      context.setLineWidth(0.8);
      context.beginPath();
      context.rotate((Math.PI / 30) * (m + s / 60));
      context.moveTo(-width / 24, 0);
      context.lineTo(width / 7.2, 0);
      context.stroke();
      context.restore();//恢复到3，（最初未旋转状态）避免旋转叠加  
      context.save();
      //绘制秒针  
      context.setLineWidth(0.5);
      context.beginPath();
      context.rotate((Math.PI / 30) * s);
      context.moveTo(-width / 24, 0);
      context.lineTo(width / 6.2, 0);
      context.stroke();
    }
    //调用  
    function drawClock() {
      reSet();
      circle();
      num();
      smallGrid();
      bigGrid();
      move();
    }
    drawClock()//调用运动函数  
    // 调用 wx.drawCanvas，通过 canvasId 指定在哪张画布上绘制，通过 actions 指定绘制行为  
    wx.drawCanvas({
      canvasId: 'myCanvas',
      actions: context.getActions()
    })
  },
  //页面卸载，清除画布绘制计时器  
  onUnload: function () {
    clearInterval(this.interval)
  },
  onConfirm: function () {
    this.hideDialog('.onLoad-err')
    this.reLoad()
  },
  onCancel: function () {
    this.hideDialog('.onLoad-err')
  },
  /**
   * 切换商品分类菜单
   */
  tapClassify: function (e) {
    var that = this;
    var id = e.target.dataset.id;
    if (id === that.data.classifyViewed) {
      that.setData({
        scrolltop: 0,
      })
    } else {
      that.setData({
        classifyViewed: id,
      });
      console.log('id:', that.data.classifyViewed)
      for (var i = 0; i < that.data.categories.length; i++) {
        if (id === that.data.categories[i].id) {
          that.setData({
            page: 1,
            scrolltop: 0,
            goodsListCurrent: that.data.goodsList[i]
          })
        }
      }
    }
    for (let i = 0; i < that.data.categories.length; i++) {
      if (id === that.data.categories[i].key) {
        that.setData({
          activeCategoryId: that.data.categories[i].id,
          page: 1,
          scrolltop: 0,
        });
      }
    }
  },
  /**
   * 跳转到商品详情页
   */
  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/bookDetail/bookDetail?id=" + e.currentTarget.dataset.id
    })
  },
  /**
   * 获取快递相关提示
   */
  getDelivery: function () {
    var that = this
    //  获取关于我们Title
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/config/get-value',
      data: {
        key: 'shopDelivery'
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            shopDelivery: res.data.data.value
          })
        }
      }
    })
  },

}));

