// miniprogram/pages/photos/add.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentPhoto: false,
    albumIndex: 0,
    albums: [],
    photosOrigin: [],
    photosNew: [],
    newphotos_url: [],
    index: ''
  },

  db: null,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    this.db = wx.cloud.database();
    if (app.globalData.allData && app.globalData.allData.albums && app.globalData.allData.albums.length > 0) {
      this.photosOrigin = app.globalData.allData.albums[options.id].photos;
    }
  },


  // 提交表单
  formSubmit(e) {
    wx.showLoading({
      title: '加载中'
    })

    // 并发上传图片
    const uploadTasks = this.data.photosNew.map(item => this.uploadPhoto(item.src))
    Promise.all(uploadTasks).then(result => {
      this.addPhotos(result, e.detail.value.desc)
      wx.hideLoading()
    }).catch((err) => {
      console.log(err)
      wx.hideLoading()
      wx.showToast({
        title: '上传图片错误',
        icon: 'error'
      })
    })
  },

  // 选择图片
  chooseImage: function() {
    const items = this.data.photosNew

    wx.chooseImage({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        let tempFilePaths = res.tempFilePaths

        for (const tempFilePath of tempFilePaths) {
          items.push({
            src: tempFilePath
          })
        }

        this.setData({
          photosNew: items
        })
      }
    })
  },

  // 上传图片
  uploadPhoto(filePath) {

    // 调用wx.cloud.uploadFile上传文件
    return wx.cloud.uploadFile({
      cloudPath: `${Date.now()}-${Math.floor(Math.random(0, 1) * 10000000)}.png`,
      filePath
    })
  },

  // 预览图片
  previewImage(e) {
    const current = e.target.dataset.src
    const photos = this.data.photosNew.map(photo => photo.src)

    wx.previewImage({
      current: current.src,
      urls: photos
    })
  },

  // 删除图片
  cancel(e) {
    const index = e.currentTarget.dataset.index
    const photos = this.data.photosNew.filter((p, idx) => idx !== index)

    this.setData({
      photosNew: photos
    })
  },

  // 添加图片信息到数据库
  addPhotos(photos, comment) {

    // 从全局数据中读出用户信息里的照片列表
    let oldPhotos = [];
    if (app.globalData.allData.albums.length > 0) {
      oldPhotos = app.globalData.allData.albums[this.data.albumIndex].photos
    }
    console.log(photos);
    let albumPhotos = photos.map(photo => ({
      fileID: photo.fileID,
      comments: comment
    }))
    if (app.globalData.allData.albums.length > 0) {
      // 合并老照片的数组和新照片的数组
      app.globalData.allData.albums[this.data.albumIndex].photos = [...oldPhotos, ...albumPhotos]
    } else {
      app.globalData.allData.albums.push({
        "photos": albumPhotos
      });
    }
    // 在此插入储存图片信息代码
    // 写入集合
    this.db.collection(app.globalData.dbName).doc(app.globalData.id).update({
      data: {
        albums: this.db.command.set(app.globalData.allData.albums)
      }
    }).then(result => {
      console.log('写入成功', result)
      wx.navigateBack()
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})