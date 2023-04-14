// pages/index/components/index.js

import {BASE_URL} from '../../../../app';

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    cardData:{
      type:Object,
      value:{}
    }
  },
  
  /**
   * 组件的初始数据
   */
  data: {
      host: BASE_URL
  },

  /**
   * 组件的方法列表
   */
  methods: {
      onClickPicture(data) {
        console.log(this.properties.cardData.userId);
       
        wx.showToast(
          {
            title: "成功",
            icon: 'success',
            duration: 1000
          }
        )
      }
  }
})
