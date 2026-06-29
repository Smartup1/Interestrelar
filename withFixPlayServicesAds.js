const { withProjectBuildGradle } = require("@expo/config-plugins");

module.exports = function withFixPlayServicesAds(config) {
  return withProjectBuildGradle(config, (config) => {
    const contents = config.modResults.contents;

    const fix = `
// FIX: alinha versão do Kotlin stdlib em todos os subprojetos
subprojects {
    configurations.all {
        resolutionStrategy {
            force "org.jetbrains.kotlin:kotlin-stdlib:1.9.10"
            force "org.jetbrains.kotlin:kotlin-stdlib-jdk7:1.9.10"
            force "org.jetbrains.kotlin:kotlin-stdlib-jdk8:1.9.10"
            force "org.jetbrains.kotlin:kotlin-reflect:1.9.10"
            force "com.google.android.gms:play-services-ads:23.6.0"
        }
    }
}
`;

    // Evita duplicar se já existir
    if (contents.includes("kotlin-stdlib:1.9.10")) {
      return config;
    }

    // Injeta no final do arquivo
    config.modResults.contents = contents.trimEnd() + "\n" + fix + "\n";

    return config;
  });
};