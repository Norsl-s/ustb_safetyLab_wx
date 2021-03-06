// pages/function/notice/message.js
const app = new getApp();
var common = require('../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabList:['最近消息','历史消息'],
    messageList: app.globalData.messageList,
    historyMessageList:[],
    name:null,
    msg:null,
    id:null,
    user_id: null,
    winWidth: 0,
    winHeight: 0,
    // tab切换  
    currentTab: 0,
    startDate: '2018-01',
    endDate: '',
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
    var mInt = parseInt(M)+1;
    var date = Y + '-' + String(mInt); 
    var i;

    if (app.globalData.messageList == []){
      wx.showToast({
        title: '暂无消息',
      })
    }
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
    that.setData({
      messageList: app.globalData.messageList
    })

  },

  getOneMessage(e) {
    console.log(e.currentTarget.dataset)
    wx.navigateTo({
      url: 'messageDetail?id=' + e.currentTarget.dataset.id + '&name=' + e.currentTarget.dataset.name + '&title=' + e.currentTarget.dataset.title + '&comment=' + e.currentTarget.dataset.comment + '&pictures=' + e.currentTarget.dataset.pictures + '&received=' + e.currentTarget.dataset.received,
      success: function (res) {

      }
    })
  },

  getHistoryMessage(){
    var that = this;
    var startDate = that.data.startDate;
    var endDate = that.data.endDate;
    wx.request({
      url: app.globalData.Url + '/notice/getHistoryMessage',
      data: {
        user_id: wx.getStorageSync('UserData').user_id,
        startDate: startDate,
        endDate:  endDate,
      },
      success: function(res) {
        var user_id = wx.getStorageSync('UserData').user_id;
        for(var i = 0 ; i < res.data.length ; i++){
          if(res.data[i]['noticeType'] == "notice"){
            res.data[i]['msg'] = res.data[i]['title'];
          }else{
            //user_id_2是自己 101
            if (res.data[i]['user_id_2'] == user_id && res.data[i]['isConfirm_2'] == "0" && res.data[i]['receive'] == "1"){
              res.data[i]['msg'] = '您已驳回"' + res.data[i]['type'] + res.data[i]['stock'] + res.data[i]['unit_type'] + '的' + res.data[i]['chemical_name'] + '"';
            }
            //102
            if (res.data[i]['user_id_2'] == user_id && res.data[i]['receive'] == "2") {
              res.data[i]['msg'] = '您已驳回"' + res.data[i]['type'] + res.data[i]['stock'] + res.data[i]['unit_type'] + '的' + res.data[i]['chemical_name'] + '" 对方已读';}
            //111
            if (res.data[i]['user_id_2'] == user_id && res.data[i]['isConfirm_2'] == "1" && res.data[i]['receive'] == "1" ){
              res.data[i]['msg'] = '您已同意"' + res.data[i]['type'] + res.data[i]['stock'] + res.data[i]['unit_type'] + '的' + res.data[i]['chemical_name'] + '"';
              }


            //user_id_1是自己 102
            if (res.data[i]['user_id_1'] == user_id && res.data[i]['isConfirm_2'] == "0" && res.data[i]['receive'] == "2") {
              res.data[i]['msg'] = '对方已驳回您的申请' + res.data[i]['type'] + res.data[i]['stock'] + res.data[i]['unit_type'] + '的' + res.data[i]['chemical_name'] + '"';
            }
          }
        }
        that.setData({
          historyMessageList: res.data
        })

      },
      fail: function(res) {},
      complete: function(res) {},
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
    that.getHistoryMessage();
  },
  /** 
   * 点击tab切换 
   */
  swichNav: function (e) {
    var that = this;
    that.getHistoryMessage();
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
      startDate: e.detail.value,
      historyMessageList: []
    })
    common.clearHistoryMessageList();
    this.getHistoryMessage();
  },

  EndDateChange(e) {
    common.clearHistoryMessageList();
    this.setData({
      endDate: e.detail.value,
      historyMessageList: []
    })
    this.getHistoryMessage();
  },

  //模态框
  showModal(e) {
    console.log(e)
    this.setData({
      modalName: e.currentTarget.dataset.target,
      name: e.currentTarget.dataset.name,
      msg: e.currentTarget.dataset.msg,
      id: e.currentTarget.dataset.id,
      user_id: e.currentTarget.dataset.user_id,
      chemicalId:e.currentTarget.dataset.chemical,
      stock:e.currentTarget.dataset.stock,
      receive:e.currentTarget.dataset.receive,
      type: e.currentTarget.dataset.type,
      remarks:e.currentTarget.dataset.remarks
    })
    // console.log(e.currentTarget.dataset)
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
  isConfirm(e){
    let that = this
    that.setData({
      modalName: e.currentTarget.dataset.target,
      chemicalId:e.target.dataset.chemical,
      id: e.target.dataset.id,
      stock: e.target.dataset.stock,
      type: e.target.dataset.type
    })
  },
  /**
   * 出入库确认 
   */
  confirm(e){
    // this.hideModal();
    let that = this 
    console.log(e)
    wx.request({
      url: app.globalData.Url + "/chemical/confirm",
      data: {
        chemicalId: e.target.dataset.chemical,
        type: e.target.dataset.type,
        stock: e.target.dataset.stock,
        id: e.target.dataset.id,
        status:e.target.dataset.status
      },
      header: {},
      method: 'PUT',
      dataType: 'json',
      responseType: 'text',
      success: function(res) {
        if (res.data == "入库成功" || res.data == "出库成功" || res.data == "驳回申请完成"){
          that.hideModal();
          wx.showToast({
            title: res.data,
            content: res.data,
          })
          // that.onLoad();
          that.changeData();
          common.clearHistoryMessageList();
        }
      },
      fail: function(res) {},
      complete: function(res) {},
    })
  },

  know:function(e){
    this.hideModal();
    console.log(e.currentTarget.dataset);
    wx.request({
      url: app.globalData.Url +'/chemical/know',
      data: {
        id: e.currentTarget.dataset
      },
      method: 'PUT',
      success: function(res) {
        console.log("服务器说它知道了");
      },
      fail: function(res) {},
      complete: function(res) {},
    })
  },

  changeData: function () {
    common.clearMessageList();
    common.getAllMessageList();
    
    this.setData({
      messageList: app.globalData.messageList
    })
  },

  /**
 * 生命周期函数--监听页面初次渲染完成
 */
  onReady: function () {

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