
var openWindowSchema = [
  {
    position: '',
    size: {
      height: '',
      width: '',
    },
    tabs: [{
      url: '',
    }]
  },

];
var openTabs = [];
var savedPresets = [];


const setPreset = (presetName) => {
  const schema = {
    id: '',
    name: '',
    tabs: '',
  }
  let tabToOpenFirst = chrome.tabs.getCurrent();

}
const getPreset = (chosenPreset) => {
  return savedPresets.find(preset => preset.id === chosenPreset.id)
}
const saveCurrentPreset = () => {
  // get all tabs
  // for each tab
  let tabHeight = window.outerHeight;
  let tabWidth = window.outerWidth;

  // save to memory, localstorage? lookup
}
const openPreset = (preset) => {
  // chrome.tabs.remove close all tabs first
  window.open();
}
