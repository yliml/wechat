// miniprogram/pages/user/user.js
//获取应用实例
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    dbCollect: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })

      this.addUser(app.globalData.userInfo)
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = async res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })

        await this.addUser(res.userInfo)
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: async res => {
          app.globalData.userInfo = res.userInfo

          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })

          await this.addUser(app.globalData.userInfo)
        }
      })
    }
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

  },

  getUserInfo(e) {
    if (e.detail.userInfo) {
      app.globalData.userInfo = e.detail.userInfo

      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      })

      this.addUser(app.globalData.userInfo)
    }
  },

  // 如果数据库没有此用户，则添加
  async addUser(user) {
    if (app.globalData.hasUser) {
      return
    }
    var dbuser = await this.queryUser();
    console.log(dbuser);
    let result;
    if (dbuser.data && dbuser.data.length > 0) {
      result = dbuser.data[0];
    } else {
      // 插入用户信息
      const db = this.getDBCollect();
      result = await db.collection(app.globalData.dbName).add({
        data: {
          createTime: db.serverDate(),
          updateTime: db.serverDate(),
          nickName: user.nickName,
          albums: []
        }
      })
    }
    app.globalData.nickName = user.nickName
    app.globalData.id = result._id
  },
  getDBCollect() {
    if (this.dbCollect) {
      return this.dbCollect;
    }
    // 获取数据库实例
    this.dbCollect = wx.cloud.database({});

    return this.dbCollect;
  },
  async queryUser() {
    var db = this.getDBCollect();
    return (await db.collection(app.globalData.dbName).where({
      _openid: app.globalData.openId
    })
      .get()
      .then(res => {
        return res;
      }));
  }
})