const saveAsButton = document.getElementById('saveAsButton');
const importInput = document.getElementById('importInput');
const exportButton = document.getElementById('exportButton');
const presetList = document.getElementById('presetList');
const closeAllWindowsCheckbox = document.getElementById('closeAllWindowsCheckbox');

const overwriteModal = document.getElementById("overwriteModal");
const modalYesButton = document.getElementById("modalYesButton");
const modalNoButton = document.getElementById("modalNoButton");

window.onload = () => {
  renderSavedPresets();
  importInput.onchange = importPresets;
}

closeAllWindowsCheckbox.onclick = function () {
  let checkboxImage = document.getElementById("checkboxImage");
  if (closeAllWindowsCheckbox.checked) {
    checkboxImage.setAttribute("src", "/images/baseline-check_box-24px.svg");
  } else {
    checkboxImage.setAttribute("src", "/images/baseline-check_box_outline_blank-24px.svg");
  }
}

saveAsButton.onclick = function () {
  if (!document.getElementById("presetNameInput")) {
    inputPresetName();
  } else {
    document.getElementById("presetNameInput").parentNode.removeChild(document.getElementById("presetNameInput"));
    document.getElementById("presetNameButton").parentNode.removeChild(document.getElementById("presetNameButton"));
  }
}

exportButton.onclick = function () {
  exportPresets();
}

chrome.commands.onCommand.addListener(function (command) {
  switch (command) {
    case "OpenPreset1": {
      const presetName = getPresetNames()[0];
      if (presetName)
        openPreset(presetName);
      break;
    }
    case "OpenPreset2": {
      const presetName = getPresetNames()[1];
      if (presetName)
        openPreset(presetName);
      break;
    }
    case "OpenPreset3": {
      const presetName = getPresetNames()[2];
      if (presetName)
        openPreset(presetName);
      break;
    }
    case "OpenPreset4": {
      const presetName = getPresetNames()[3];
      if (presetName)
        openPreset(presetName);
      break;
    }
    case "OpenPreset5": {
      const presetName = getPresetNames()[4];
      if (presetName)
        openPreset(presetName);
      break;
    }
  }
});

const getPresetNames = () => {
  let presetElements = presetList.childNodes;
  let presetNamesArray = [];
  presetElements.forEach(element => {
    if (element.id) {
      presetNamesArray.push(element.id);
    }
  })
  return presetNamesArray;
}

function importPresets() {
  let files = importInput.files;
  if (files.length <= 0) {
    return false;
  }

  var fr = new FileReader();
  fr.onload = function (event) {
    let parsedPresets = JSON.parse(event.target.result);
    for (var key in parsedPresets) {

      // presetName = parsedPresets[key].name helps avoid async issues when calling createPresetListItem()
      let presetName = parsedPresets[key].name;
      if (parsedPresets[key].isPreset) {
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
  let closeAllWindowsLabel = document.getElementById("closeAllWindowsLabel");
  presetNameInput.setAttribute("type", "text");
  presetNameInput.setAttribute("placeholder", "Enter preset name");
  presetNameInput.setAttribute("class", "width100percent");
  presetNameInput.setAttribute("id", "presetNameInput");
  presetNameInput.addEventListener('keydown', (e) => { if (e.keyCode === 13) initSaveNewPreset(presetNameInput, presetNameButton) });
  presetNameButton.setAttribute("class", "button width100percent colorWhite");
  presetNameButton.setAttribute("id", "presetNameButton");
  closeAllWindowsLabel.parentNode.insertBefore(presetNameInput, closeAllWindowsLabel);
  closeAllWindowsLabel.parentNode.insertBefore(presetNameButton, closeAllWindowsLabel);
  presetNameButton.appendChild(document.createTextNode('OK'));

  presetNameButton.onclick = function () { initSaveNewPreset(presetNameInput, presetNameButton); };
  presetNameInput.focus();
}

function initSaveNewPreset(presetNameInput, presetNameButton) {
  if (presetNameInput.value !== null && presetNameInput.value !== undefined && presetNameInput.value.trim() !== "") {
    if (isPresetNameTaken(presetNameInput.value)) {
      showOverwriteModal(presetNameInput.value);
    } else {
      saveNewPreset(presetNameInput.value);
    }
    presetNameInput.parentNode.removeChild(presetNameInput);
    presetNameButton.parentNode.removeChild(presetNameButton);
  }
}

const isPresetNameTaken = (presetName) => {
  if (getPresetNames().includes(presetName)) {
    return true;
  } else {
    return false;
  }
}

const showOverwriteModal = (presetName) => {
  modalYesButton.onclick = function () {
    saveNewPreset(presetName, true);
    overwriteModal.setAttribute("class", "modal displayFlex flexCenter flexColumn displayNone");
  }
  modalNoButton.onclick = function () {
    overwriteModal.setAttribute("class", "modal displayFlex flexCenter flexColumn displayNone");
  }
  overwriteModal.classList.remove("displayNone");
}

const saveNewPreset = (presetName, isOverwritten) => {
  chrome.windows.getAll({ populate: true }, function (windows) {
    chrome.storage.local.set({
      [presetName]: { name: presetName, windows: windows, isPreset: true, }
    }, function () {
      if (!isOverwritten) {
        createPresetListItem(presetName);
      }
    });
  });
}

function renderSavedPresets() {
  chrome.storage.local.get(null, function (data) {
    for (var key in data) {
      if (data[key].isPreset) {
        createPresetListItem(data[key].name);
      }
    }
  });
}

function createPresetListItem(presetName) {
  let presetListItem = document.createElement("div");
  presetListItem.className = "button width100percent positionRelative displayFlex alignItemsCenter listItem";
  presetListItem.textContent = presetName;
  presetListItem.setAttribute("id", presetName);
  presetListItem.addEventListener('click', () => openPreset(presetName));
  presetList.appendChild(presetListItem);

  let deleteIcon = document.createElement("img");
  deleteIcon.className = "positionAbsolute right10px opacityHover0p3";
  deleteIcon.setAttribute("src", "./images/baseline-delete-24px.svg");
  deleteIcon.setAttribute("height", "18px");
  deleteIcon.addEventListener('click', () => deletePreset(presetName));
  presetListItem.appendChild(deleteIcon);
}

const deletePreset = (presetName) => {
  chrome.storage.local.remove(presetName);
  let preset = document.getElementById(presetName);
  preset.parentNode.removeChild(preset);
}

const openPreset = (chosenPreset) => {
  let windowsToOpen;
  let windowsToClose;
  
  if(closeAllWindowsCheckbox.checked){
    chrome.windows.getAll(function (windows) {
      windowsToClose = windows;
    });
  }

  chrome.storage.local.get(null, function (data) {
    for (var key in data) {
      if (key === chosenPreset) {
        windowsToOpen = data[key].windows;
      }
    }

    if (windowsToOpen === undefined) {
      return;
    }

    windowsToOpen.forEach(window => {
      let isMinMaxOrFull = (window.state === "minimized" || window.state === "maximized" || window.state === "fullscreen");
      // see bug with setting state here:
      // https://bugs.chromium.org/p/chromium/issues/detail?id=459841
      // minimized, maximized, fullscreen states are not compatible with left, top, width, height
      // minimized is not compatible with focused: true
      // maximized, fullscreen are not compatible with focused: false
      // https://developer.chrome.com/extensions/windows#method-create
      if (!isMinMaxOrFull) {
        chrome.windows.create({
          url: window.tabs.map(tab => tab.url),
          left: window.left,
          top: window.top,
          width: window.width,
          height: window.height,
          focused: window.focused,
          incognito: window.incognito,
          type: window.type,
          state: window.state
        }, () => {
          if (windowsToClose) {
            closeWindows(windowsToClose);
          }
        });
      } else {
        chrome.windows.create({
          url: window.tabs.map(tab => tab.url),
          focused: window.state === "minimized" ? false : true,
          incognito: window.incognito,
          type: window.type,
          state: window.state
        }, () => {
          if (windowsToClose) {
            closeWindows(windowsToClose);
          }
        });
      }
    });

  });
}

const closeWindows = (windows) => {
  windows.forEach(window => {
    chrome.windows.remove(window.id)
  })
}