window.onload = () => {
  // chrome.storage.local.clear((msg) => console.log(msg));  
  loadSavedPresets();
}

const saveAsButton = document.getElementById('saveAsButton');
let closeAllWindowsCheckbox = document.getElementById('closeAllWindowsCheckbox');
let presetList = document.getElementById('presetList');

saveAsButton.onclick = function (element) {
  inputPresetName();
};

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
  presetListItem.className = "button width100percent";
  presetListItem.textContent = presetName;
  presetListItem.setAttribute("id", presetName);
  presetListItem.addEventListener('click', () => openPreset(presetName));
  presetList.appendChild(presetListItem);
};

const openPreset = (chosenPreset) => {
  let windows;
  // async might cause problems here
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
    windows.forEach(window => {
      chrome.windows.remove(window.id)
    })
  });
}