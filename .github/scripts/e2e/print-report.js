function printReport(report, passLabel) {
  console.log(JSON.stringify(report, null, 2));
  if (!report.pass) {
    for (const err of report.errors) {
      console.error(`E2E ASSERT FAIL: ${err}`);
    }
    process.exit(1);
  }
  console.log(passLabel);
}

module.exports = { printReport };
