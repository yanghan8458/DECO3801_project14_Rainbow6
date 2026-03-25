const { analyzePage } = require("./src/analyzer");

const fs = require("fs").promises;
const path = require("path");

const url = process.argv[2];

if (!url) {
  console.log("❌ Please provide a URL");
  process.exit(1);
}

analyzePage(url).then(async (result) => {
  const output = JSON.stringify(result, null, 2);
  console.log(output);

  // 创建 outputs 文件夹
  const outputDir = path.join(__dirname, "outputs");
  await fs.mkdir(outputDir, { recursive: true });

  // 文件名 = URL + 时间戳
  const safeUrl = url.replace(/https?:\/\//, "").replace(/[\/:?&=]/g, "_");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  const filename = `${safeUrl}-${timestamp}.json`;
  const filePath = path.join(outputDir, filename);

  await fs.writeFile(filePath, output, "utf8");
  console.log(`✅ 结果已保存到文件：${filePath}`);
}).catch(err => {
  console.error("❌ 分析失败：", err.message);
  process.exit(1);
});
