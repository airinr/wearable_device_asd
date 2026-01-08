// babel.config.js (YANG BENAR UNTUK V4)
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel", // Ini tetap dibutuhkan di v4 untuk preset, tapi cara kerjanya beda
    ],
    plugins: ["react-native-reanimated/plugin"], // Tambahkan ini karena Anda pakai reanimated
  };
};
