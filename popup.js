
const openButton = document.getElementById('openButton');
const saveButton = document.getElementById('saveButton');
let closeAllWindowsCheckbox = document.getElementById('closeAllWindowsCheckbox');
let presetList = document.getElementById('presetList');

saveButton.onclick = function (element) {
  saveCurrentPreset();
};
saveAsButton.onclick = function (element) {
  inputPresetName();
};

const openPreset = (chosenPreset) => {
  // if (chosenPreset)
  // let presetToLoad = savedPresets.find(preset => preset.id === chosenPreset.id)
  // chrome.tabs.remove close all tabs first ? 
  let windows;
  chrome.storage.local.get(null, function (data) {
    for (var key in data) {
      if (key === chosenPreset) {
        windows = data[key].windows;
      }
    }

    if (windows === undefined) {
      console.log('chrome.storage.get === undefined');
      return;
    }

    if (Array.isArray(windows)){
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
    } else {
      chrome.windows.create({
        url: windows.tabs.map(tab => tab.url),
        left: windows.left,
        top: windows.top,
        width: windows.width,
        height: windows.height,
        focused: windows.focused,
        incognito: windows.incognito,
        type: windows.typ,
      });
    }
  });
}

inputPresetName = () => {
  let presetNameInput = document.createElement("input");
  let presetNameButton = document.createElement("button");
  presetNameInput.setAttribute("type", "text");
  presetNameInput.setAttribute("placeholder", "Enter preset name");
  presetNameButton.setAttribute("class", "button width100percent");
  presetNameButton.setAttribute("id", "presetNameButton");
  saveAsButton.parentNode.appendChild(presetNameInput);
  saveAsButton.parentNode.appendChild(presetNameButton);
  presetNameButton.appendChild(document.createTextNode('OK'));

  presetNameButton.onclick = function () {
    saveNewPreset(presetNameInput.value);
    presetNameInput.parentNode.removeChild(presetNameInput);
    presetNameButton.parentNode.removeChild(presetNameButton);
  };
}

const saveCurrentPreset = () => {
  chrome.windows.getAll({ populate: true }, function (windows) {
    chrome.storage.local.set({ presetstest: windows }, function () {
    });
  });
}

const saveNewPreset = (presetName) => {
  // if (presetList.find(preset => preset.name === presetName)
  //    prompt overwrite
  
  chrome.windows.getAll({ populate: true }, function (windows) {
    chrome.storage.local.set({
      [presetName]: { name: presetName, windows: windows }
    }, function () {
      let presetListItem = document.createElement("div");
      presetListItem.className = "button width100percent";
      presetListItem.textContent = presetName;
      presetListItem.setAttribute("id", presetName);
      presetList.appendChild(presetListItem);
      presetListItem.onclick = function () {
        openPreset(presetName);
      }
    });
  });
}