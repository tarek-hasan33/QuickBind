const path = require("path");
const { rcedit } = require("rcedit");

module.exports = async (context) => {
  if (context.electronPlatformName !== "win32") {
    return;
  }

  const exeName = "QuickBindBeta.exe";
  const exePath = path.join(context.appOutDir, exeName);
  const iconPath = path.join(context.packager.projectDir, "assets", "icon.ico");

  await rcedit(exePath, {
    icon: iconPath,
    "version-string": {
      CompanyName: "QuickBind Beta",
      FileDescription: "QuickBind Beta",
      InternalName: "QuickBindBeta",
      OriginalFilename: exeName,
      ProductName: "QuickBind Beta",
    },
  });
};
