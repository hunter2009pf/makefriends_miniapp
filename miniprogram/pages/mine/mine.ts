// pages/mine/mine.ts

import { User, Person, BASE_URL } from "../../app";
import { getFileNameFromPath, getValueByKeyFromHttpResponse } from "../../utils/util";
const FormData = require('../../utils/formData.js') // 引入这个文件

Page({

  navigateToEdit() {
    wx.navigateTo({
      url: '../my_info/myInfo',
    })
  },

  /**
   * 页面的初始数据
   */
  data: {
      host: BASE_URL,
      defaultAvatar: "/assets/img_avatar.jpg",
      user: new User({'id':0, 'session_key':'', 'openid':'', 'is_vip':false}),
      person: new Person({
        'id': 0,
        'name':"匿名用户",
        'avatarUrl':"",
        'isBoy': false,
        'age':0,
        'height':0,
        'weight':0,
        'star':"",
        'birthPlace':"",
        'marryStatus':"",
        'degree':"",
        'job':"",
        'monthSalary':"",
        'houseStatus':"",
        'carStatus':"",
        'uniqueChildStatus':"",
        'wechat':""
      })
  },

  updateAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        var imgPath = res.tempFiles[0].tempFilePath
        // 上传头像到服务器
        let formData = new FormData(); // 实例化formData
        formData.append("id", getApp().globalData.user.id); // 文本字段
        formData.appendFile("photo", imgPath, getFileNameFromPath(imgPath));//文件字段
        let data = formData.getData();//组合成data
        
        wx.request({//请求函数
            url: BASE_URL + "/uploadPhoto", //接口地址
            method: 'POST',// 请求方式
            data: data.buffer, //数据字段
            header: {
                'content-type':data.contentType
            },
            success: (res) => {
              console.log("upload photo as avatar successfully")
              var code = getValueByKeyFromHttpResponse(res.data, 'code')
              if (code != 0) return
              getApp().globalData.person.avatarUrl = getValueByKeyFromHttpResponse(res.data, 'data')
              this.setData({
                person: getApp().globalData.person
              })
            },
            fail: function(error) {
            wx.showToast({
              title: error.errMsg || '请求失败'
            })
            console.log(error)
            }
        })
      }
    })
  },

  chooseImage() {
    wx.chooseMedia({
      count: 6 - this.data.person.photos.length,
      mediaType: ['image'],
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        // this.setData({
        //   imageList: [...this.data.imageList, res.tempFiles[0].tempFilePath]
        // })

        for (let index = 0; index < res.tempFiles.length; index++) {
          wx.uploadFile({
            url: BASE_URL + "/uploadPhotoToList", // 接口地址
            name: 'photo',
            filePath: res.tempFiles[index].tempFilePath,
            formData:{"id": getApp().globalData.user.id},
            success:res => {
              var jsonData = JSON.parse(res.data)
              console.log(jsonData)
              var code = getValueByKeyFromHttpResponse(jsonData, "code")
              if (code == 0) {
                var photoUrl = getValueByKeyFromHttpResponse(jsonData, 'data')
                console.log("photo url is " + photoUrl)
                this.data.person.photos = [...this.data.person.photos, photoUrl]
                getApp().globalData.person.photos = this.data.person.photos
                this.setData({
                  person: this.data.person
                })
              }
            }
          })
        }
      }
    })
  },
  deleteImage(e: any) {
    const index = e.currentTarget.dataset.index
    console.log('deleted index: '+ index)
    // 从服务器删除这张图片
    var photoUrl = this.data.person.photos[index]
    var requestUrl = BASE_URL + '/deletePhotoFromList?id=' + this.data.person.id + '&photoUrl=' + photoUrl
    let that = this
    wx.request({
      url: requestUrl,
      method:'DELETE',
      success(res) {
        var code = getValueByKeyFromHttpResponse(res.data, 'code')
        if (code == 0) {
          console.log("delete photo url successfully")
          that.data.person.photos.splice(index, 1)
          that.setData({
            person: that.data.person
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.setData({
      user: getApp().globalData.user,
      person: getApp().globalData.person
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})