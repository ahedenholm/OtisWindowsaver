const saveAsButton = document.getElementById('saveAsButton');
const importButton = document.getElementById('importButton');
const exportButton = document.getElementById('exportButton');
let closeAllWindowsCheckbox = document.getElementById('closeAllWindowsCheckbox');
let presetList = document.getElementById('presetList');

window.onload = () => {
  loadSavedPresets();
  importButton.onchange = importPresets;
}

saveAsButton.onclick = function () {
  inputPresetName();
}
exportButton.onclick = function () {
  exportPresets();
}

const importPresets = () => {
  let files = importButton.files;
  if (files.length <= 0) {
    return false;
  }

  var fr = new FileReader();
  fr.onload = function (event) {
    let parsedPresets = JSON.parse(event.target.result);
    for (var key in parsedPresets) {

      // presetName = parsedPresets[key].name helps avoid async issues when calling createPresetListItem()
      let presetName = parsedPresets[key].name;
      if (parsedPresets[key].isPreset){
        chrome.storage.local.set({
          [parsedPresets[key].name]: {
            name: parsedPresets[key].name,
            windows: parsedPresets[key].windows,
            isPreset: parsedPresets[key].isPreset,
          }
        }, function () {
          createPresetListItem(presetName);
        });
      }
    }
  }
  fr.readAsText(files.item(0));
}

const exportPresets = () => {
  chrome.storage.local.get(null, function (presets) {
    var dataStr = "data:text/json;charset=utf-8," + JSON.stringify(presets);
    var dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "OtisWindowsaverPresets.json");
    dlAnchorElem.click();
  });
}

const inputPresetName = () => {
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
  presetNameInput.focus();
}

const saveNewPreset = (presetName) => {
  // if (presetList.find(preset => preset.name === presetName)
  //    prompt overwrite

  chrome.windows.getAll({ populate: true }, function (windows) {
    chrome.storage.local.set({
      [presetName]: { name: presetName, windows: windows, isPreset: true, }
    }, function () {
      createPresetListItem(presetName);
    });
  });
}

const loadSavedPresets = () => {
  chrome.storage.local.get(null, function (data) {
    for (var key in data) {
      if (data[key].isPreset) {
        createPresetListItem(data[key].name);
      }
    }
  });
}

const createPresetListItem = (presetName) => {
  let presetListItem = document.createElement("div");
  presetListItem.className = "button width100percent positionRelative displayFlex flexCenter";
  presetListItem.textContent = presetName;
  presetListItem.setAttribute("id", presetName);
  presetListItem.addEventListener('click', () => openPreset(presetName));
  presetList.appendChild(presetListItem);

  let deleteIcon = document.createElement("img");
  deleteIcon.className = "positionAbsolute right10px opacityHover0p3";
  deleteIcon.setAttribute("src", "./images/baseline_delete_black_18dp.png");
  deleteIcon.addEventListener('click', () => deletePreset(presetName));
  presetListItem.appendChild(deleteIcon);
}

const deletePreset = (presetName) => {
  chrome.storage.local.remove(presetName);
  let preset = document.getElementById(presetName);
  preset.parentNode.removeChild(preset);
}

const openPreset = (chosenPreset) => {
  let windows;
  // TODO async might cause problems here
  if (closeAllWindowsCheckbox.checked) {
    closeAllWindows();
  }
  chrome.storage.local.get(null, function (data) {
    for (var key in data) {
      if (key === chosenPreset) {
        windows = data[key].windows;
      }
    }

    if (windows === undefined) {
      return;
    }

    windows.forEach(window => {
      chrome.windows.create({
        url: window.tabs.map(tab => tab.url),
        left: window.left,
        top: window.top,
        width: window.width,
        height: window.height,
        focused: window.focused,
        incognito: window.incognito,
        type: window.type,
        // see bug with setting state here:
        // https://bugs.chromium.org/p/chromium/issues/detail?id=459841
        // state: window.state
      });
    });
  });
}

const closeAllWindows = () => {
  chrome.windows.getAll(function (windows) {
    setTimeout(() => 
    windows.forEach(window => {
      chrome.windows.remove(window.id)
    })
    , 0)
  });
}