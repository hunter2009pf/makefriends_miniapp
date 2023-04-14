// app.ts

import {getValueByKeyFromHttpResponse} from './utils/util';

import IIMHandler from "./utils/messageHandler";

import { getFileNameFromPath } from "./utils/util";

const FormData = require('./utils/formData') // 引入这个文件

export const BASE_URL = "http://192.168.132.111:10086";

export const COMMAND_UPLOAD_PHOTO_AS_AVATAR = "upload photo as avatar";

export class User {
  id:number = 0;

  sessionKey:string = "";

  openId:string = "";

  isVip:boolean = false;

  idolList:number[] = [];

  fanList:number[] = [];

  constructor(jsonData: any) { 
    this.id = jsonData['id']
    this.sessionKey = jsonData['session_key']
    this.openId = jsonData['openid']
    this.isVip = jsonData['is_vip']
    if (jsonData['idol_list'] != null)
      this.idolList = jsonData['idol_list']
    if (jsonData['fan_list'] != null)
      this.fanList = jsonData['fan_list']
 }
}

export class Person {
  id:number = 0;
  name:string = "hello";
  avatarUrl:string = "";
  isBoy:boolean = false;
  age:number = 0;
  height:number = 0;
  weight:number = 0;
  star:string = "";
  birthPlace:string = "";
  currentPlace:string = "";
  marryStatus:string = "";
  degree:string = "";
  job:string = "";
  monthSalary:string = "";
  houseStatus:string = "";
  carStatus:string = "";
  uniqueChildStatus:string = "";
  wechat:string = "";
  photos:string[] = []

  constructor(jsonData: any) {
    this.id = jsonData['id']
    this.name = jsonData['name']
    this.avatarUrl = jsonData['avatar_url']
    this.isBoy = jsonData['is_boy']
    this.age = jsonData['age']
    this.height = jsonData['height']
    this.weight = jsonData['weight']
    this.star = jsonData['star']
    this.birthPlace = jsonData['birth_place']
    this.currentPlace = jsonData['current_place']
    this.marryStatus = jsonData['marry_status']
    this.degree = jsonData['degree']
    this.job = jsonData['job']
    this.monthSalary = jsonData['month_salary']
    this.houseStatus = jsonData['house_status']
    this.carStatus = jsonData['car_status']
    this.uniqueChildStatus = jsonData['unique_child_status']
    this.wechat = jsonData['wechat']
    if (jsonData['photos'] != null)
      this.photos = jsonData['photos']
 } 

  getJson() {
    var personJson: any = {}
    personJson['id'] = this.id
    personJson['name'] = this.name
    personJson['avatar_url'] = this.avatarUrl
    personJson['is_boy'] = this.isBoy
    personJson['age'] = this.age
    personJson['height'] = this.height
    personJson['weight'] = this.weight
    personJson['star'] = this.star
    personJson['birth_place'] = this.birthPlace
    personJson['current_place'] = this.currentPlace
    personJson['marry_status'] = this.marryStatus
    personJson['degree'] = this.degree
    personJson['job'] = this.job
    personJson['month_salary'] = this.monthSalary
    personJson['house_status'] = this.houseStatus
    personJson['car_status'] = this.carStatus
    personJson['unique_child_status'] = this.uniqueChildStatus
    personJson['wechat'] = this.wechat
    personJson['photos'] = this.photos
    return personJson
  }
}

function updatePhotoAsAvatar() {
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
            wx.showToast({
              title: '上传头像成功',
              icon: 'success',
              duration: 2000
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
}

App<IAppOption>({
  globalData: {},
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 初始化消息通知器
    this.iIMHandler = new IIMHandler()

    // 登录
    var that = this
    wx.login({
      success: res => {
        console.log(res.code)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (res.code) {
          //发起网络请求
          wx.request({
            url: BASE_URL + '/onLogin',
            data: {
              code: res.code
            },
            success (res) {
              console.log(res.data)
              if (res.data == null || res.data == '') return
              var code = getValueByKeyFromHttpResponse(res.data, 'code')
              if (code != 0) return
              var jsonStr = getValueByKeyFromHttpResponse(res.data, 'data')
              console.log(jsonStr)
              console.log(typeof jsonStr)
              if (jsonStr == null || jsonStr == '') return;
              var jsonData = JSON.parse(jsonStr)
              that.globalData.user = new User(jsonData['user'])
              console.log(that.globalData.user.idolList.length)
              that.globalData.person = new Person(jsonData['person'])

              var loginMsg = {
                onLogin: true,
                message: "log in successfully"
              };
              getApp().getIMHandler().sendMsg(loginMsg);
              
              // 检测到用户未上传头像，建议ta上传一张生活照用来展示
              //showCancel:是否显示取消按钮
              //cancelText，cancelColor，confirmText，confirmColor可设置
              if (that.globalData.person.avatarUrl == '') {
                wx.showModal({
                  title: '提示',
                  content: '建议您上传一张生活照作为个人头像，该图片会在眼缘模块展示您的风采时优先使用',
                  success (res) {
                    if (res.confirm) {
                      console.log('用户点击确定')
                      updatePhotoAsAvatar()
                    } else if (res.cancel) {
                      console.log('用户点击取消')
                      // TODO: 用户取消后，以后登录都不再求取图片了
                    }
                  }
                })
              }

            }
          })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      },
    })
  },
  getIMHandler() {
    return this.iIMHandler
  }
})