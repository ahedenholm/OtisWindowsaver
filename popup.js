
let openButton = document.getElementById('openButton');
let saveButton = document.getElementById('saveButton');
let savePresetButton = document.getElementById('savePresetButton');

openButton.onclick = function (element) {
  openPreset();
};

saveButton.onclick = function (element) {
  saveCurrentPreset();
};

savePresetButton.onclick = function (element) {
};

const saveCurrentPreset = () => {
  chrome.windows.getAll({ populate: true }, function (windows) {
    chrome.storage.sync.set({ presets: windows }, function () {
    });
  });
}

const openPreset = (chosenPreset) => {
  // let presetToLoad = savedPresets.find(preset => preset.id === chosenPreset.id)
  // chrome.tabs.remove close all tabs first ? 
  let windows;
  chrome.storage.sync.get('presets', function (data) {
    windows = data.presets;
    console.log('windows : ', windows);
    windows.forEach(window => {
      console.log('window.state: ', window.state);
      chrome.windows.create({
        url: window.tabs.map(tab => tab.url),
        left: window.left,
        top: window.top,
        width: window.width,
        height: window.height,
        focused: window.focused,
        incognito: window.incognito,
        type: window.typ,
        // state: window.state
      });
      if (window.state === "maximized"){
        chrome.window.update({state: window.state })
      }
    });
  });
}

const saveNewPreset = (presetName) => {
  const schema = {
    id: '',
    name: '',
    tabs: '',
  }
}