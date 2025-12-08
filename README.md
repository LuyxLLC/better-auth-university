# Better Auth University Plugin

A university plugin for Better Auth that allows restriction of email domains.

## Installation

```bash
npm install better-auth-university
```

## Setup

To use the Better Auth University Plugin, you need to configure it with a list of universities and their associated email domains. You can also specify allowed email domains for user registration. If you would like a comprehensive list of universities, consider going to the [university-domains-list](https://github.com/Hipo/university-domains-list) for options of obtaining the data. There is a world_universities_and_domains.json which can be easily passed to the `university` parameter.

```typescript
import { universityResolver } from "better-auth-university";

const plugin = universityResolver({
  universities: [
    {
      name: "Massachusetts Institute of Technology",
      domains: ["mit.edu"],
      web_pages: ["http://web.mit.edu/"],
      country: "United States",
      alpha_two_code: "US",
      "state-province": "Massachusetts",
    },
  ],
  allowedEmailDomains: [".edu", ".ac.uk"],
});
```
