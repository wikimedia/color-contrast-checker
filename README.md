## Color Contrast Monitoring for Dark Mode
🚨 **Work in Progress** 🚨

The provided scripts are designed to monitor color contrast issues, specifically for dark mode. The process involves creating test cases based on the top Wikipedia articles and running accessibility tests using [pa11y](https://github.com/pa11y/pa11y-ci). The results are logged to the console and a CSV file, capturing color contrast violations.

### Scripts

`a11y.config.js`

The configuration file contains settings for the accessibility tests, including the report directory, namespace, defaults, and test cases.

`runA11yTests.js`

This script runs accessibility tests based on the provided configuration. It uses pa11y to test each URL, logs the results to the console, and generates a CSV file summarizing color contrast violations.

### Usage
* Ensure you have the required environment variables set: MW_SERVER, MEDIAWIKI_USER, and MEDIAWIKI_PASSWORD.

* Run the tests using the following command:

```
node runA11yTests.js --config 'a11y.config.js'
```

### Important Note
This tool is currently in development and should be used cautiously. Stay tuned for updates and improvements!
