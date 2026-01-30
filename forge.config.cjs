const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: true,
    extraResource: ["./build-react", "./assets"],
    icon: "./assets/icon",
    executableName: "BracketBuddy", // <-- ensures the exe is BracketBuddy.exe
    appBundleId: "com.yusefwilson.bracketbuddy",
    osxUniversal: {
      mergeASARs: true,
    },
    osxSign: {
      identity: "Developer ID Application",
      identityValidation: true,
      hardenedRuntime: true,
      gatekeeperAssess: false,
      entitlements: "./entitlements.plist",
      entitlementsInherit: "./entitlements.plist",
    },
    osxNotarize: process.env.APPLE_ID ? {
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID,
    } : undefined,
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
        description: "Tournament management software", // description
        exe: "BracketBuddy.exe",                 // exe filename
        setupExe: "BracketBuddy-Setup.exe",      // setup filename
        setupIcon: "./assets/icon.ico",          // icon for installer & exe
        iconUrl: "https://raw.githubusercontent.com/yusefwilson/BracketBuddy/refs/heads/release/assets/icon.ico", // hacky kinda way to get free icon hosting from github
        loadingGif: "./assets/loading.gif",      // optional loading animation for installer
        noMsi: true,                             // disables generating MSI, since Squirrel handles it
      }
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        format: 'ULFO',
        name: 'BracketBuddy',
        icon: './assets/icon.icns',
      },
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
