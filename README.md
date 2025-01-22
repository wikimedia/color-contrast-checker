## Color Contrast Monitoring for Dark Mode

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
node index.js --project en.wikipedia
```

### Advanced

Run against mobile:
```
node index.js --project fr.wikipedia --mobile --query "minervanightmode=1"
```

Run against mobile against 10 random  articles with sleep duration of 0s.
```
node index.js --project fr.wikipedia --mobile --query "minervanightmode=1" --source random -z 0 --limit 10
```

Run against desktop night theme against 100 random articles.
```
node index.js --project fr.wikipedia --query "useskin=vector-2022&vectornightmode=1" --source random --limit 100
```

### For wikis wanting dark mode for anonymous users

The web team use the following query to decide whether a project is ready for dark mode. This takes the top 500 most read pages and generates reports for dark mode vs standard mode.

```
node index.js --project 'xx.projectname' -m --limit 500 --zleep 1500 --source pageviews-main
```
### Important Note
This tool is currently in development and should be used cautiously. Stay tuned for updates and improvements!
