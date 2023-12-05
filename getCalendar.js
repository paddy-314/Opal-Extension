
let fileLocation = "http://www.htwk-stundenplan.de/22719242"
async function t(fileLocation) {
    const icsRes = await fetch(fileLocation)
    const icsData = await icsRes.text()
    // Convert
    const data = icsToJson(icsData)
    console.log(data)
    return data
}


t(fileLocation).then(res => res.forEach(element => {
    let pattern = /(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/
    let eventStart = new Date(element.startDate.replace(pattern,'$1-$2-$3T$4:$5:$6'))
    let refDate = new Date(Date.now() + 24*60*60*1000)
    if(eventStart - refDate < 0) {console.log(element)}
}))