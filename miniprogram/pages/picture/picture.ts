// pages/picture.ts

import {Person, BASE_URL} from '../../app';
import {getValueByKeyFromHttpResponse} from '../../utils/util';

const PAGE_SIZE = 10

Page({

  /**
   * 页面的初始数据
   */
  data:{
      cardList:[] as Person[],
      nextPageData:[] as Person[]
  },

  cardChange(e: any) {
      const {direction,index} = e.detail;
      if(index>this.data.cardList.length-3){
      }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    //注册接收消息回调
    let that = this
    getApp().getIMHandler().setOnReceiveMessageListener({
      listener: (msg: any) => {
        console.log('---收到消息')
        var isLogIn = getValueByKeyFromHttpResponse(msg, 'onLogin')
        console.log('log in: ' + isLogIn)
        if (isLogIn) {
          wx.request({
            url: BASE_URL + '/randomGetPhotos',
            data: {
              start_id:  0,
              is_boy: true,
              count: PAGE_SIZE
            },
            success (res) {
              console.log("get photos")
              console.log(res.data)
              if (res.data == null || res.data == '') return
              var candidates = getValueByKeyFromHttpResponse(res.data, 'data')
              var candidatesJson = JSON.parse(candidates)
              if (candidates == null || candidates.length == 0) return
              console.log('candidates length is ' + candidatesJson.length)
              for (var index = 0; index < candidatesJson.length; index++) {
                var p: Person = new Person(candidatesJson[index])
                that.data.cardList.push(p)
                that.data.nextPageData.push(p)
              }
              that.setData({
                cardList: that.data.cardList,
                nextPageData: that.data.nextPageData
              })
            }
          })
        }
      }
    });
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