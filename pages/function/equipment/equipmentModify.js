const app = new getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    assetnumber: '',
    equipmentname: '',
    typetext:'',
    placetext: '',
    statustext: '',

    tindex: null,
    sindex: null,

    tpicker: ['特种设备', '普通设备'],
    spicker: ['正常', '维修', '报废'],

    multiArray: [],
    selectList: [],
    multiIndex: [0, 0, 0],
    
    storagedate: '2018-12-25',
    scrapdate: '2018-12-25',

    typefinal: null,
    placefinal: null,
    statusfinal: null,
  },

  setassetnumber: function (e) {
    this.setData({
      assetnumber: e.detail.value
    });
  },

  setequipmentname: function (e) {
    this.setData({
      equipmentname: e.detail.value
    });
  },

  getAsset: function () {
    wx.chooseImage({
      count: 1, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        console.log('调用成功');
      }
    });
  },

  PickerChange(e) {
    this.setData({
      tindex: e.detail.value,
    });
    this.setData({
      typefinal: this.data.tpicker[this.data.tindex],
    });
  },

  SPickerChange(e) {
    this.setData({
      sindex: e.detail.value,
    });
    this.setData({
      statusfinal: this.data.spicker[this.data.sindex],
    });
  },

  StorageDateChange(e) {
    this.setData({
      storagedate: e.detail.value
    })
  },

  ScrapDateChange(e) {
    this.setData({
      scrapdate: e.detail.value
    })
  },

  MultiChange(e) {
    this.setData({
      placetext: '',
      multiIndex: e.detail.value
    });
    this.setData({
      placefinal: this.data.multiArray[0][this.data.multiIndex[0]] + this.data.multiArray[1][this.data.multiIndex[1]],
    });
  },

  MultiColumnChange: function (e) {

    this.data.multiIndex[e.detail['column']] = e.detail['value'];

    var multiArray0 = "multiArray[0]";
    var multiArray1 = "multiArray[1]";
    var multiArray2 = "multiArray[2]";

    var arr = this.data.multiIndex;
    var data = this.data.selectList;

    var classroom = [];
    var name = [];

    var i = 0;

    for (i; i < data[arr[0] + ""]["children"].length; i++) {
      classroom[i] = data[arr[0] + ""]["children"][i + ""]["0"]["0"];
    }
    this.setData({
      [multiArray1]: classroom,
    })

    for (var j = 0; j < data["0"]["children"]["0"]["children"].length; j++) {
      name[j] = data[arr[0] + ""]["children"][arr[1] + ""]["children"]["0"];
    }

    this.setData({
      [multiArray2]: name,
    })

  },

  submit: function (e) {
    var date = new Date();
    wx.request({
      url: app.globalData.Url + '/equipment/' + this.data.id,
      data: {
        id: this.data.id,
        asset_number: this.data.assetnumber,
        equipment_name: this.data.equipmentname,
        equipment_type: this.data.typefinal,

        laboratory_build: this.data.multiArray[0][this.data.multiIndex[0]],
        laboratory_class: this.data.multiArray[1][this.data.multiIndex[1]],
        laboratory_room: this.data.multiArray[2][this.data.multiIndex[2]],
        
        build_id: wx.getStorageSync('UserData').id,
        unit_id: wx.getStorageSync('UserData').unit_id,
        status: this.data.statusfinal,
        storage_time:date.getDate(),
        scrap_time: this.data.scrapdate
      },
      method: 'PUT',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success(res) {
        wx.showToast({
          title: "修改成功",
          duration: 2000,
        });
      },
      //TODO:找一个修改失败的图标
      fail(res) {
        wx.showToast({
          title: '修改失败',
          icon: 'fail',
          duration: 2000,
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;

    var build = [];
    var classroom = [];
    var name = [];

    var multiArray0 = "multiArray[0]";
    var multiArray1 = "multiArray[1]";
    var multiArray2 = "multiArray[2]";

    wx.request({
      url: app.globalData.Url + "/getlaboratory/List/" + wx.getStorageSync('UserData').unit_id,
      success(res) {

        that.setData({
          selectList: res.data
        })

        for (var i = 0; i < res.data.length; i++) {
          build[i] = res.data[i + ""]["0"];
        }

        that.setData({
          [multiArray0]: build,
        })


        for (var i = 0; i < res.data["0"]["children"].length; i++) {
          classroom[i] = res.data["0"]["children"][i + ""]["0"]["0"];
        }
        that.setData({
          [multiArray1]: classroom,
        })

        for (var j = 0; j < res.data["0"]["children"]["0"]["children"].length; j++) {
          name[j] = res.data["0"]["children"][j + ""]["children"]["0"];
        }

        that.setData({
          [multiArray2]: name,
        })
      }
    });

    that.setData({
      id: options.id
    });
    //获取id为id的信息
    wx.request({
      url: app.globalData.Url + '/equipment/' + that.data.id,
      method: 'GET',
      success(res) {
        if (res.statusCode != 200) {
          console.log("请求失败");
        }
        var l_id = res.data.result[0].laboratory_id;
        wx.request({
          url: app.globalData.Url + '/equipment/getlaboratory/' + l_id,
          method: 'GET',
          success(res) {
            // console.log(res.statusCode);
            that.setData({
              placetext: res.data[0].laboratory_name,
              placefinal: res.data[0].laboratory_name,
            });
          }
        })
        that.setData({
          assetnumber: res.data.result[0].asset_number,
          equipmentname: res.data.result[0].equipment_name,
          typetext: res.data.result[0].equipment_type,
          typefinal: res.data.result[0].equipment_type,
          statustext: res.data.result[0].status,
          statusfinal: res.data.result[0].status,
          storagedate: res.data.result[0].storage_time,
          scrapdate: res.data.result[0].scrap_time
        });
      }
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