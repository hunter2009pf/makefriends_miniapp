// pages/my_info/myInfo.ts

import {Person, BASE_URL} from '../../app';
import {getValueByKeyFromHttpResponse} from "../../utils/util";
const FormData = require('../../utils/formData.js') // 引入表单定义

Page({

  /**
   * 页面的初始数据
   */
  data: {
      name: "",
      disabled: true,

      genderList: ["男", "女"],
      index: 0,

      ageList: [1960],
      ageIndex: 0,

      heightList: [
        "未知",
        140
      ],
      heightIndex: 0,

      weightList: [
        "未知",
        35
      ],
      weightIndex: 0,
      
      starList: [
        "未知",
        "白羊座","金牛座","双子座","巨蟹座","狮子座","处女座","天秤座","天蝎座","射手座","摩羯座","水瓶座","双鱼座"
      ],
      starIndex: 0,

      region: ['广东省', '广州市', '海珠区'],
      customItem: '全部',

      currentPlace: ['广东省', '广州市', '海珠区'],

      marryList: ['未婚', '离异未育', '离异带孩', '离异不带孩', '丧偶'],
      marryIndex: 0,

      eduList: ['初中', '高中', '专科', '本科', '硕士', '博士'],
      eduIndex: 3,

      jobList: ['未知', '服务业', '学校老师', '培训机构', '销售人员', '公务员', '事业单位', '国企职工', '工程师', '设计师', '银行职员', '商铺老板', '老板创业者', '公司职员', '公司中层', '公司高管', '律师', '军人', '警察', '辅警', '医生', '护士', 'IT从业者', '科研人员', '人力资源', '财务人员', '客服人员', '电商直播/运营', '在校学生', '自由职业', '其他'],
      jobIndex: 0,

      salaryList: ['未知', '5千到1万', '1万到1.5万', '1.5万到2万', '2万到3万', '3万到5万', '5万以上'],
      salaryIndex: 0,

      liveList: ['未知', '已购房', '未购房', '有能力购房', '和父母同住'],
      liveIndex: 0,

      carList: ['未知', '有车', '无车', '婚后购车', '需要时购车'],
      carIndex: 0,

      uniqueChildList: ['未知', '是独生子女', '有兄弟姐妹'],
      uniqueChildIndex: 0
  },

  modifyNickName() {
    this.setData({
      disabled: false
    })
  },

  /**
   * 输入框实时回调
   * @param {*} options 
   */
  userNameInputAction (options: any) {
    //获取输入框输入的内容
    let value = options.detail.value;
    console.log("输入框输入的内容是 " + value)
    this.data.name = value
  },

  bindPickerChange(e: any) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },

  bindAgeChange(e: any) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      ageIndex: e.detail.value
    })
  },

  bindHeightChange(e: any) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      heightIndex: e.detail.value
    })
  },

  bindWeightChange(e: any) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      weightIndex: e.detail.value
    })
  },

  bindStarChange(e: any) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      starIndex: e.detail.value
    })
  },

  bindRegionChange (e: any) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      region: e.detail.value
    })
  },

  bindCurrentPlaceChange (e: any) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      currentPlace: e.detail.value
    })
  },

  bindMarriageChange (e: any) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      marryIndex: e.detail.value
    })
  },

  bindEducationChange (e: any) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      eduIndex: e.detail.value
    })
  },

  bindJobChange (e: any) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      jobIndex: e.detail.value
    })
  },

  bindSalaryChange (e: any) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      salaryIndex: e.detail.value
    })
  },

  bindLiveChange (e: any) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      liveIndex: e.detail.value
    })
  },

  bindCarChange (e: any) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      carIndex: e.detail.value
    })
  },

  bindUniqueChildChange (e: any) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      uniqueChildIndex: e.detail.value
    })
  },

  submitMyInfo() {
    var tempPerson: Person = getApp().globalData.person
    tempPerson.name = this.data.name
    tempPerson.isBoy = (this.data.index == 0)
    var date =new Date()
    var curYear = date.getFullYear()
    tempPerson.age = (curYear - this.data.ageList[this.data.ageIndex])
    if (this.data.heightIndex > 0) {
      tempPerson.height = this.data.heightList[this.data.heightIndex] as number
    }
    if (this.data.weightIndex > 0) {
      tempPerson.weight = this.data.weightList[this.data.weightIndex] as number
    }
    tempPerson.star = this.data.starList[this.data.starIndex]
    tempPerson.birthPlace = this.data.region[0] + '-' + this.data.region[1] + '-' + this.data.region[2]
    tempPerson.currentPlace = this.data.currentPlace[0] + '-' + this.data.currentPlace[1] + '-' + this.data.currentPlace[2]
    tempPerson.marryStatus = this.data.marryList[this.data.marryIndex]
    tempPerson.degree = this.data.eduList[this.data.eduIndex]
    tempPerson.job = this.data.jobList[this.data.jobIndex]
    tempPerson.monthSalary = this.data.salaryList[this.data.salaryIndex]
    tempPerson.houseStatus = this.data.liveList[this.data.liveIndex]
    tempPerson.carStatus = this.data.carList[this.data.carIndex]
    tempPerson.uniqueChildStatus = this.data.uniqueChildList[this.data.uniqueChildIndex]

    // 发送个人信息到服务器
    let formData = new FormData(); // 实例化formData
    formData.append("info", JSON.stringify(tempPerson.getJson())); // 文本字段
    let data = formData.getData();//组合成data
    
    wx.request({//请求函数
        url: BASE_URL + "/uploadInfo", //接口地址
        method: 'POST',// 请求方式
        data: data.buffer, //数据字段
        header: {
            'content-type':data.contentType
        },
        success: (res) => {
          console.log("upload personal info successfully")
          var code = getValueByKeyFromHttpResponse(res.data, 'code')
          if (code == 0) {
            getApp().globalData.person = tempPerson
            wx.showToast(
              {
                title: '保存成功',
                icon: 'success',
                duration: 1000
              }
            )
          }
        },
        fail: function(error) {
        wx.showToast({
          title: error.errMsg || '请求失败'
        })
        console.log(error)
        }
    })
  },

  matchInfo(person: Person) {
      var i:number

      this.data.index = (person.isBoy? 0 : 1)

      if (person.age > 0) {
        var date = new Date();
        var curYear = date.getFullYear() //年
        var personYear = curYear - person.age
        for (i = 0; i < this.data.ageList.length; i++) {
          if (personYear == this.data.ageList[i]) {
            this.data.ageIndex = i
            break;
          }
        }
      }

      if (person.height > 0) {
        for (i = 1; i < this.data.heightList.length; i++) {
          if (person.height == this.data.heightList[i]) {
            this.data.heightIndex = i
            break;
          }
        }
      }

      if (person.weight > 0) {
        for (i = 1; i < this.data.weightList.length; i++) {
          if (person.weight == this.data.weightList[i]) {
            this.data.weightIndex = i
            break;
          }
        }
      }

      if (person.star != '') {
        for (i = 1; i < this.data.starList.length; i++) {
          if (person.star == this.data.starList[i]) {
            this.data.starIndex = i
            break;
          }
        }
      }

      if (person.birthPlace != '') {
        var splits = person.birthPlace.split("-");
        if (splits.length == 3) {
          this.data.region = splits
        }
      }

      if (person.currentPlace != '') {
        var splits = person.currentPlace.split("-");
        if (splits.length == 3) {
          this.data.currentPlace = splits
        }
      }

      if (person.marryStatus != '') {
        for (i = 0; i < this.data.marryList.length; i++) {
          if (person.marryStatus == this.data.marryList[i]) {
            this.data.marryIndex = i
            break;
          }
        }
      }

      if (person.degree != '') {
        for (i = 0; i < this.data.eduList.length; i++) {
          if (person.degree == this.data.eduList[i]) {
            this.data.eduIndex = i
            break;
          }
        }
      }

      if (person.job != '') {
        for (i = 1; i < this.data.jobList.length; i++) {
          if (person.job == this.data.jobList[i]) {
            this.data.jobIndex = i
            break;
          }
        }
      }

      if (person.monthSalary != '') {
        for (i = 1; i < this.data.salaryList.length; i++) {
          if (person.monthSalary == this.data.salaryList[i]) {
            this.data.salaryIndex = i
            break;
          }
        }
      }

      if (person.houseStatus != '') {
        for (i = 1; i < this.data.liveList.length; i++) {
          if (person.houseStatus == this.data.liveList[i]) {
            this.data.liveIndex = i
            break;
          }
        }
      }

      if (person.carStatus != '') {
        for (i = 1; i < this.data.carList.length; i++) {
          if (person.carStatus == this.data.carList[i]) {
            this.data.carIndex = i
            break;
          }
        }
      }

      if (person.uniqueChildStatus != '') {
        for (i = 1; i < this.data.uniqueChildList.length; i++) {
          if (person.uniqueChildStatus == this.data.uniqueChildList[i]) {
            this.data.uniqueChildIndex = i
            break;
          }
        }
      }

      this.setData({
        name: person.name,
        index: this.data.index,
        heightIndex: this.data.heightIndex,
        weightIndex: this.data.weightIndex,
        starIndex: this.data.starIndex,
        region: this.data.region,
        currentPlace: this.data.currentPlace,
        marryIndex: this.data.marryIndex,
        eduIndex: this.data.eduIndex,
        jobIndex: this.data.jobIndex,
        salaryIndex: this.data.salaryIndex,
        liveIndex: this.data.liveIndex,
        carIndex: this.data.carIndex,
        uniqueChildIndex: this.data.uniqueChildIndex
      })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    var i:number
    var tempHeightList = []
    for(i = 142;i<210;i++) {
      tempHeightList.push(i)
    }

    var j:number
    var tempWeightList = []
    for(j = 36;j<125;j++) {
      tempWeightList.push(j)
    }

    var k:number
    var tempAgeList = []
    for(k = 1961;k < 2030;k++) {
      tempAgeList.push(k)
    }

    this.setData({
      heightList: [...this.data.heightList, ...tempHeightList],
      weightList: [...this.data.weightList, ...tempWeightList],
      ageList: [...this.data.ageList, ...tempAgeList]
    })

    this.matchInfo(getApp().globalData.person)
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