/// <reference path="./types/index.d.ts" />
import {User, Person} from '../miniprogram/app'

interface IAppOption {
  globalData: {
    userInfo?: WechatMiniprogram.UserInfo,
    user?:User,
    person?:Person
  }
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback,
}