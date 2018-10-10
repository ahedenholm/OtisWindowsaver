
let openButton = document.getElementById('openButton');
let saveButton = document.getElementById('saveButton');
let savePresetButton = document.getElementById('savePresetButton');

/* sets background color of changeColorButton element
chrome.storage.sync.get('color', function (data) {
  changeColor.style.backgroundColor = data.color;
  changeColor.setAttribute('value', data.color);
});

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.executeScript(
      tabs[0].id,
      {
        code:
          'window.open("https://isletsound.com", "resizable");'
      });
  });
*/


openButton.onclick = function (element) {
  // window.open('https://isletsound.com', 'resizable');
  openPreset();
};

saveButton.onclick = function (element) {
  saveCurrentPreset();
};

savePresetButton.onclick = function (element) {
};


const getTabUrls = () => {
  let promise = new Promise(function (resolve) {
    let tabUrls = [];
    chrome.tabs.query({}, function (array) {
      array.forEach(tab => {
        tabUrls.push({ url: tab.url, active: tab.active });
      });
    });
    resolve(tabUrls);
  });
  return promise;
}

// TODO problems with saving the getTabUrls() array in chrome.storage.sync.set, 
// async probably ruins it, a hardcoded array works fine 
const saveCurrentPreset = () => {
  let newPreset;
  getTabUrls()
    .then(data => { return data })
    .then(tabs => {
      newPreset = {
        position: {
          x: window.screenX,
          y: window.screenY,
        },
        size: {
          height: window.outerHeight,
          width: window.outerWidth,
        },
        // tabs: tabs
        tabs: [{ url: "https://google.com", active: true }, { url: "https://isletsound.com", active: false }],
      }
    })
    .then(() => {
      chrome.storage.sync.set({ presets: newPreset }, function () {
      });
    });
}


const openPreset = (chosenPreset) => {
  // let presetToLoad = savedPresets.find(preset => preset.id === chosenPreset.id)
  // chrome.tabs.remove close all tabs first
  let preset;
  chrome.storage.sync.get('presets', function (data) {
    preset = data.presets;
    let activeTab = preset.tabs.find(tab => tab.active === true);
    console.log('activeTab: ', activeTab.url);
    window.open(activeTab.url);
    window.moveTo(preset.position.x, preset.position.y);
    window.resizeTo(preset.size.width, preset.size.height);
    
    // TODO window.open stops the process somehow, its called only once
    preset.tabs.forEach(tab => {
      window.open(tab.url);
    });
  });
}

const saveNewPreset = (presetName) => {
  const schema = {
    id: '',
    name: '',
    tabs: '',
  }
  let tabToOpenFirst = chrome.tabs.getCurrent();
}
