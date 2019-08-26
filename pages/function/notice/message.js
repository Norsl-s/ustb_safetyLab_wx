// pages/function/notice/message.js
const app = new getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabList:['最近消息','历史消息'],
    messageList: {
     
    },
    name:null,
    msg:null,
    id:null,
    user_id: null,
    winWidth: 0,
    winHeight: 0,
    // tab切换  
    currentTab: 0,
    startDate: '2018-12',
    endDate: '2019-12',
    end:'',//结束日期
    // TabCur: 0,
    // scrollLeft: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var timestamp = Date.parse(new Date());
    var date = new Date(timestamp);
    //获取年份  
    var Y = date.getFullYear();
    //获取月份  
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    var date = Y + '-' + M; 
    var i;
    that.setData({
      endDate: date,
      end: date
    });
     wx.getSystemInfo({

      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }

    });
    wx.request({
      url: app.globalData.Url +'/notice/notices',
      data: {
        'user_id':wx.getStorageSync('UserData').user_id,
      },
      header: {},
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function(res) {
        console.log(res.data);
        for(i=0;i<res.data.length;i++){
          if (res.data[i]['noticeType'] == "chemical"){
            res.data[i]['msg'] = res.data[i]['user_name_1'] + "申请" + res.data[i]['type'] + res.data[i]['stock'] + res.data[i]['chemical_name'];
          }else{
            res.data[i]['msg'] = res.data[i]['title'];
          }
        }
        that.setData({
          messageList: res.data
        })
      },
      fail: function(res) {},
      complete: function(res) {},
    })

  },

  getOneMessage(e) {
    console.log(e.currentTarget.dataset)
    wx.navigateTo({
      url: 'messageDetail?id=' + e.currentTarget.dataset.id + '&name=' + e.currentTarget.dataset.name + '&title=' + e.currentTarget.dataset.title + '&comment=' + e.currentTarget.dataset.comment + '&pictures=' + e.currentTarget.dataset.pictures,
      success: function (res) {

      }
    })
  },

  // ListTouch触摸开始
  ListTouchStart(e) {
    this.setData({
      ListTouchStart: e.touches[0].pageX
    })
  },

  // ListTouch计算方向
  ListTouchMove(e) {
    this.setData({
      ListTouchDirection: e.touches[0].pageX - this.data.ListTouchStart > 0 ? 'right' : 'left'
    })
  },

  // ListTouch计算滚动
  ListTouchEnd(e) {
    if (this.data.ListTouchDirection == 'left') {
      this.setData({
        modalName: e.currentTarget.dataset.target
      })
    } else {
      this.setData({
        modalName: null
      })
    }
    this.setData({
      ListTouchDirection: null
    })
  },
  exit: function () {
    wx.navigateTo({
      url: './pages/index/index',
    })
  },

  tabSelect(e) {
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      scrollLeft: (e.currentTarget.dataset.id - 1) * 60
    })
  },

  /** 
    * 滑动切换tab 
    */
  bindChange: function (e) {
    var that = this;
    that.setData({ currentTab: e.detail.current });
  },
  /** 
   * 点击tab切换 
   */
  swichNav: function (e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  },

  StartDateChange(e) {
    this.setData({
      startDate: e.detail.value
    })
  },

  EndDateChange(e) {
    this.setData({
      endDate: e.detail.value
    })
  },

  //模态框
  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target,
      name: e.currentTarget.dataset.name,
      msg: e.currentTarget.dataset.msg,
      id: e.currentTarget.dataset.id,
      user_id: e.currentTarget.dataset.user_id,
    })
    console.log(e.currentTarget.dataset)
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 出入库确认 
   */
  confirm(e){
    console.log(e.target.dataset)
    wx.request({
      url: app.globalData.Url + "/notice/test",
      data: {
        chemicalId:e.target.dataset.chemical,
        type: e.target.dataset.type,
        stock:e.target.dataset.stock,
        id:e.target.dataset.id
      },
      header: {},
      method: 'PUT',
      dataType: 'json',
      responseType: 'text',
      success: function(res) {
        console.log(res)
      },
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})