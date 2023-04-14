export const formatTime = (date: Date) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return (
    [year, month, day].map(formatNumber).join('/') +
    ' ' +
    [hour, minute, second].map(formatNumber).join(':')
  )
}

const formatNumber = (n: number) => {
  const s = n.toString()
  return s[1] ? s : '0' + s
}

export function getFileNameFromPath(filePath: string):string {
  var fileName = filePath.replace(/^.*[\\\/]/, '')
  return fileName
}

export function getValueByKeyFromHttpResponse(resData: any, specKey: string):any {
  console.log("type of res data: " + typeof resData)
  var jsonStr = null; 
  for (const key of Object.keys(resData)) {
    if (key == specKey) {
      console.log('find ' + specKey)
      jsonStr = resData[key]
      break
    }
  }
  console.log(jsonStr)
  return jsonStr
}
