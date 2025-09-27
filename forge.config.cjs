const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: true,
    extraResource: ["./build-react", "./assets"],
    icon: "./assets/icon",
    executableName: "BracketBuddy", // <-- ensures the exe is BracketBuddy.exe
  },
  rebuildConfig: {},
  makers: [
    // {
    //   name: '@electron-forge/maker-wix',
    //   config: {
    //     name: 'BracketBuddy',
    //     manufacturer: 'Yusef Wilson',
    //     ui: {
    //       chooseDirectory: true, // allow user to pick install path
    //     }
    //   }
    // },
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: "BracketBuddy",                     // internal app name
        authors: "Yusef Wilson",                 // author
        exe: "BracketBuddy.exe",                 // exe filename
        setupExe: "BracketBuddy-Setup.exe",      // setup filename
        setupIcon: "./assets/icon.ico",          // icon for installer & exe
        iconUrl: "https://yusefwilson.com/icon.ico",
        //loadingGif: "./assets/loading.gif",      // optional loading animation for installer
        noMsi: true,                             // disables generating MSI, since Squirrel handles it
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
