export default class IIMHandler {
  constructor() {
    this.receiveListenerList = [];
  }

  /**
   * 消息接收监听函数
   * @param listener
   */
  setOnReceiveMessageListener({
    listener
  }) {
    this.receiveListenerList.push(listener);
  }

  //发送信息
  sendMsg(msg) {
    console.log('IIMHandler---发送消息：' + msg);
    console.log("length is " + this.receiveListenerList.length)
    if (this.receiveListenerList.length > 0)
    for (var index = 0; index < this.receiveListenerList.length; index++) {
      console.log("发送消息啦！！！")
      this.receiveListenerList[index](msg); 
    }
  }
}
