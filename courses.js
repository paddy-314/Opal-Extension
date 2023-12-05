
$(function () {
    let data = []
    let pagesSelector = document.querySelector('.pager-showall span')
    if (pagesSelector.innerText.includes("alle anzeigen")|| pagesSelector.innerText.includes("Show all"))
    document.querySelector('.pager-showall').click()
    document.querySelectorAll('.table-panel tbody tr td:nth-child(3)').forEach(element => {
        let name = element.innerText
        let href = element.querySelector('a').href
        data.push({'name': name, 'href': href})
    });
    console.log(data)
    chrome.storage.sync.set({courseLinks: data})
}); 
  