const { withProjectBuildGradle } = require("@expo/config-plugins");

module.exports = function withFixPlayServicesAds(config) {
  return withProjectBuildGradle(config, (config) => {
    const contents = config.modResults.contents;

    const fix = `
// FIX: alinha Kotlin stdlib e faz downgrade do play-services-ads para versão compatível
subprojects {
    configurations.all {
        resolutionStrategy {
            force "org.jetbrains.kotlin:kotlin-stdlib:1.9.10"
            force "org.jetbrains.kotlin:kotlin-stdlib-jdk7:1.9.10"
            force "org.jetbrains.kotlin:kotlin-stdlib-jdk8:1.9.10"
            force "org.jetbrains.kotlin:kotlin-reflect:1.9.10"
            force "com.google.android.gms:play-services-ads:24.0.0"
            force "com.google.android.gms:play-services-ads-lite:24.0.0"
        }
    }
}
`;

    if (contents.includes("play-services-ads:24.0.0")) {
      return config;
    }

    // Remove versão anterior do fix se existir
    const cleaned = contents.replace(/\n\/\/ FIX:[\s\S]*?^}/m, "").trimEnd();

    config.modResults.contents = cleaned + "\n" + fix + "\n";

    return config;
  });
};