//app.js
App({
  onLaunch: function() {

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
              this.addUser(this.globalData.userInfo)
            }
          })
        } else {
          // 跳转登录页面让用户登录
          wx.switchTab({
            url: 'pages/user/user'
          })
        }
      }
    })
  },

  globalData: {
    hasUser: false, // 数据库中是否有用户
    hasUserInfo: false, // 小程序的userInfo是否有获取
    userInfo: null,
    checkResult: null,
    code: null,
    openId: null,
    flag: 0,
    nickName: '',
    allData: {
      albums: []
    },
    id: null,
    dbName: "demo"
  },
  dbCollect: null,
  // 如果数据库没有此用户，则添加
  async addUser(user) {
    if (this.globalData.hasUser) {
      return
    }
    var dbuser = await this.queryUser();
    console.log(dbuser);
    let result;
    if (dbuser.data && dbuser.data.length > 0) {
      result = dbuser.data[0];
      this.globalData.allData.albums = result.albums;
    } else {
      // 插入用户信息
      const db = this.getDBCollect();
      result = await db.collection(this.globalData.dbName).add({
        data: {
          createTime: db.serverDate(),
          updateTime: db.serverDate(),
          nickName: user.nickName,
          albums: []
        }
      })
    }
    this.globalData.nickName = user.nickName
    this.globalData.id = result._id
    this.globalData.hasUser = true
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
    return (await db.collection(this.globalData.dbName).where({
        _openid: this.globalData.openId
      })
      .get()
      .then(res => {
        return res;
      }));
  }
})