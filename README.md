# RESTful API Generator for https://github.com/hagopj13/node-express-boilerplate

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/b7b890f18f104347ba55dc638495ac23)](https://www.codacy.com/gh/dzero1/restgen/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=dzero1/restgen&amp;utm_campaign=Badge_Grade)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

This is a simple tool to generate a RESTful CRUD services by using data model name.

You can use https://github.com/hagopj13/node-express-boilerplate boilerplate/starter project for quickly building RESTful APIs using Node.js, Express, and Mongoose. Please follow the link and get the full description about it.

## Quick Start

After you made your project using bolderplate, first install the restgen:

```bash
npm install -g https://github.com/dzero1/restgen.git
```

Then, simply run:

```bash
restgen -m <datamodel> -f "<model field set>"
```

## Arguments

-m - is the data model name.
  Ex: -m person
-f - is model field set.
  Ex: -f "name, height(number), gender|male, color"

  * When you are using fields, you have to comma seperate the fields names.
  * The default feild type will be string. But you can simply add the data type using parentheses "()"
  * For any default value just use pipe "|" character
  * Both data type and default can be combined, but make sure to use default after the data type. Ex: height(number)|25

## Contributing

At the moment this is just a simple project which used by me. So if you feel any suggetions or any bugs related to this, please feel free post it here or contact me.

## License

[MIT](LICENSE)
