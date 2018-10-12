
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
  // if (chosenPreset)
  // let presetToLoad = savedPresets.find(preset => preset.id === chosenPreset.id)
  // chrome.tabs.remove close all tabs first ? 
  let windows;
  chrome.storage.sync.get('presets', function (data) {
    windows = data.presets;
    windows.forEach(window => {
      chrome.windows.create({
        url: window.tabs.map(tab => tab.url),
        left: window.left,
        top: window.top,
        width: window.width,
        height: window.height,
        focused: window.focused,
        incognito: window.incognito,
        type: window.typ,
        // see bug with setting state here:
        // https://bugs.chromium.org/p/chromium/issues/detail?id=459841
        // state: window.state
      });
    });
  });
}

const saveNewPreset = (presetName) => {
  const schema = {
    id: '',
    name: '',
    windows: '',
  }
}