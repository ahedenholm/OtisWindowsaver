
const openButton = document.getElementById('openButton');
const saveButton = document.getElementById('saveButton');
const saveAsButton = document.getElementById('saveAsButton');
let closeAllWindowsCheckbox = document.getElementById('closeAllWindowsCheckbox');
let presetList = document.getElementById('presetList');

openButton.onclick = function (element) {
  openPreset();
};
saveButton.onclick = function (element) {
  saveCurrentPreset();
};
saveAsButton.onclick = function (element) {
  inputPresetName();

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
  chrome.storage.sync.get(null, function (data) {
    console.log('chosenPreset: ', chosenPreset);
    console.log('data: ', data);
    for (var key in data) {
      console.log('key: ', key);
      console.log('object[key]: ', data[key]);
      if (key === chosenPreset) {
        windows = data[key];
      }
    }

    if (windows === undefined) {
      console.log('chrome.storage.get === undefined');
      return;
    }
    console.log('chrome.storage.get ', data);

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

inputPresetName = () => {
  let presetNameInput = document.createElement("input");
  let presetNameButton = document.createElement("button");
  presetNameInput.setAttribute("type", "text");
  presetNameInput.setAttribute("placeholder", "Enter preset name");
  presetNameButton.setAttribute("class", "button");
  presetNameButton.setAttribute("id", "presetNameButton");
  document.getElementById('presetNameButton').addEventListener('click', 
      saveNewPreset(presetNameInput.value),
      presetNameInput.parentNode.removeChild(presetNameInput),
      presetNameInput.parentNode.removeChild(presetNameButton)
      );
  saveAsButton.parentNode.appendChild(presetNameInput);
  saveAsButton.parentNode.appendChild(presetNameButton);

  presetNameButton.appendChild(document.createTextNode('OK'));

}

const saveNewPreset = (presetName) => {
  // if (presetList.find(preset => preset.name === presetName)
  //    prompt overwrite
  chrome.windows.getAll({ populate: true }, function (windows) {
    chrome.storage.sync.set({
      [presetName]: { name: presetName, windows: windows }
    }, function () {
    });
  });

  let presetListItem = document.createElement("div");
  presetListItem.className = "button";
  presetListItem.textContent = presetName;
  presetListItem.setAttribute("id", presetName);
  presetListItem.setAttribute("onclick", function () { openPreset(presetName) });
  presetList.appendChild(presetListItem);
}