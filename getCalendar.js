
let fileLocation = "https://www.phpclasses.org/browse/download/1/file/63438/name/example.ics"
async function t(fileLocation) {
    console.log(fileLocation)
    const icsRes = await fetch(fileLocation)
    const icsData = await icsRes.text()
    // Convert
    const data = icsToJson(icsData)
    console.log(data)
    return data
}
console.log(t(fileLocation))