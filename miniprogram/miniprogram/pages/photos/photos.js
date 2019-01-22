// miniprogram/pages/photos/photos.js
const app = getApp()
Page({

  // 相册 ID
  albumId: 0,
  db: null,
  /**
   * 页面的初始数据
   */
  data: {
    albumIndex: '',
    photos: [],
    photoIds: []

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    // 初始化数据库
    this.db = wx.cloud.database({});
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

    this.getPhotos()
  },

  // 长按事件
  longpress(e) {
    const imgIndex = e.currentTarget.dataset.index

    // 展示操作菜单
    wx.showActionSheet({
      itemList: ['删除照片'],
      success: res => {
        if (res.tapIndex === 0) {
          this.deleteFile(imgIndex)
        }
      }
    })
  },

  // 删除照片
  async deleteFile(idx) {
    const fileId = this.data.photoIds[idx]
    // 删除文件
    return wx.cloud.deleteFile({
      fileList: [fileId]
    }).then(res => {
      this.saveImageDelele(fileId)
    })
    // 此处插入删除文件代码
  },

  async saveImageDelele(fileId) {
    const photos = app.globalData.allData.albums[this.albumId].photos
    const newFileIds = this.data.photoIds.filter(id => id !== fileId)
    const newPhotos = photos.filter(photo => !!~newFileIds.indexOf(photo.fileID))

    app.globalData.allData.albums[this.albumId].photos = newPhotos

    // 写入集合
    this.db.collection(app.globalData.dbName).doc(app.globalData.id).update({
      data: {
        updateTime: this.db.serverDate(),
        albums: this.db.command.set(app.globalData.allData.albums)
      }
    }).then(result => {
      console.log('写入成功', result)
      this.getPhotos();
      wx.navigateBack()
    })
  },

  // 获取相册中的数据
  async getPhotos() {

    if (!app.globalData.allData.albums || app.globalData.allData.albums.length == 0) {
      this.photos = [];
      return;
    }
    console.log(this.albumId)

    // 获取照片列表
    const fileList = app.globalData.allData.albums[this.albumId].photos.map(photo => photo.fileID);

    // 根据照片列表拉取照片的实际地址
    const photoIds = []
    const realUrlsRes = await wx.cloud.getTempFileURL({
      fileList
    });
    const realUrls = realUrlsRes.fileList.map(file => {
      photoIds.push(file.fileID)
      return file.tempFileURL
    });

    this.setData({
      albumIndex: this.albumId,
      photos: realUrls,
      photoIds
    });
  },

  // 预览图片
  async previewImage(e) {
    // 获取被点击的图片的 index
    const currentIndex = e.currentTarget.dataset.index

    // 获取当前被点击的图片的实际地址
    const currentUrl = this.data.photos[currentIndex]

    wx.previewImage({
      current: currentUrl,
      urls: this.data.photos
    })
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