# Anti-Spam Report

This report analyzes five anti-spam filters—Akismet, CleanTalk, OOPSpam, ModerationAPI, and ALTCHA Spam Filter—evaluating their GDPR compliance, accuracy, latency, and features. Most solutions struggle with data privacy compliance and show variable accuracy, often failing to detect spam reliably or generating false positives. Latency issues also affect their suitability for real-time applications.

ALTCHA Spam Filter excels with high accuracy, comprehensive language support, and robust privacy measures, making it the preferred choice for users needing a fast, reliable, and GDPR-compliant anti-spam solution. This report highlights the need for anti-spam filters that ensure both high detection accuracy and adherence to data privacy standards.

__Download the full report in PDF__: [/report/anti-spam-report-v1-EN.pdf](https://raw.githubusercontent.com/altcha-org/anti-spam-report/main/report/anti-spam-report-v1-EN.pdf)

## Methodology

This section outlines the systematic approach employed to evaluate the performance, accuracy, and compliance of various spam filters. The methodology is designed to ensure fairness, transparency, and reproducibility of the results.

### Objectives and Scope

The primary objective of this evaluation is to measure the performance and accuracy of selected spam filters in classifying user-submitted data across multiple languages. Additionally, the privacy policies of these filters are examined for compliance with GDPR and other relevant regulations.

### Accuracy Tests

To evaluate the accuracy of the spam filters, we prepared a comprehensive set of 50 test samples, generated by ChatGPT. These samples are designed to reflect common messages submitted via contact forms, including both legitimate (non-spam) and spam content. The samples cover text in seven languages: English, German, Spanish, French, Italian, Portuguese, and Dutch. The evaluation criteria are as follows:

- **Legitimate Samples**: Messages that are genuine and non-spam.
- **Spam Samples**: Messages that contain spam or harmful content, including pills and drugs advertisements, profanity, and harmful code (e.g., SQL/HTML injection).

Each sample was submitted to the spam filters using their respective HTTP APIs. The classification results were compared with the expected outcomes to calculate accuracy scores. A test is considered _passed_ if the platform correctly classifies the sample as either spam or non-spam.

### Latency Tests

To measure the average latency of each spam filter, we conducted five consecutive classifications using the same content (text only). The latency, defined as the full HTTP round-trip time, was recorded. Tests were conducted from AWS data centers located in two regions:

- **EU Region**: AWS eu-central-1
- **US Region**: AWS us-west-1

By testing from these locations, we ensured a comprehensive assessment of the response times from different geographical points.

### Statistical Analysis

The accuracy was determined by the proportion of correctly classified samples out of the total number of samples. Latency was averaged across the five tests for each region to provide a representative measure of performance.

## Environment Variables

To execute the test, you'll need API Keys for each system. Follow the instructions in the documentation to create them and configure them in a `.env` file. Refer to the [shared.ts](/shared.ts) file for available ENV variables.

To avoid problems with rate-limiters, each test is executed after a delay of 25 seconds, configurable with `TEST_DELAY` env variable (in milliseconds).

## Usage

You'll need [Bun](https://bun.sh) to execute the test.

### 1. Configure your API Keys in `.env`.

### 2. Run the classification tests:

```sh
bun run classify.ts
```

### 3. Run the latency test:

```sh
bun run latency.ts
```

## Results

Explore the accuracy data in the [/data](/data) folder and access the full report in the [/report](/report) folder.