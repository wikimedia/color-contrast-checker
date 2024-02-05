## Color Contrast Monitoring for Dark Mode
🚨 **Work in Progress** 🚨

The provided scripts are designed to monitor color contrast issues, specifically for dark mode. The process involves creating test cases based on the top Wikipedia articles and running accessibility tests using ~~[pa11y](https://github.com/pa11y/pa11y-ci)~~ [axe-core](https://github.com/dequelabs/axe-core). The results are logged to the console and a CSV file, capturing color contrast violations.

### Scripts

```
Color Contrast Tester
│
├── index.js
│
├── report/
│   ├── index.html
│   └── simplifiedList.csv
│
├── modules/
│   ├── csvWriter.js
│   ├── htmlGenerator.js
│   ├── topArticles.js
│   └── accessibility.test.js
│
└── README.md
```

### Usage
* Ensure you have the required environment variables set: MW_SERVER, MEDIAWIKI_USER, and MEDIAWIKI_PASSWORD.

* Run the tests using the following command:

```
node index.js
```

### Advanced
```
node index.js --project fr.wikipedia --query "minervanightmode=1"
```

### Important Note
This tool is currently in development and should be used cautiously. Stay tuned for updates and improvements!
