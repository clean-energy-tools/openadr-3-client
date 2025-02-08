
### Using OpenAPIGenerator

This tool (https://openapi-generator.tech/) is a comprehensive framework of code generation technology that appears to have a history with Swagger Tools which I don't understand, and won't try to describe.

The tools are written in Java and for example can be used from Maven or Gradle.  Being allergic to Maven, I'm opting to use the Docker image to run the tools.

For example:

```shell
$ docker run --rm \
   -u1000 \
   -v /home/david/Projects/openadr/openadr-3-ts-types:/local \
   openapitools/openapi-generator-cli \
   generate \
   --skip-validate-spec  \
   -i /local/oadr3.0.1.yaml \
   -g typescript-axios \
   -o /local/out/typescript-axios
```

This is the out-of-the-box conversion from a specification using the TypeScript Axios template.  The `-u1000` option means that all generated files are owned by my user ID, rather than by `root`.  The `-v` option mounts my current directory tree into the Docker container as `/local`.  Hence the spec is at `/local/SPEC-NAME.yaml` and the output is to a directory location within this directory tree.  The `--skip-validate-spec` option is required if your specification does not pass muster with their linting rules.

The output this generates is reasonably good.  It includes type definitions for the `#/components/schemas` declarations, as well as functions corresponding to every API operation.

The type definitions do not include any of the useful JSDOC tags.  Therefore all that useful information is erased.  The functions are overly verbose, and for example do incomplete data validation.

OpenAPIGenerator generates everything through Mustache templates.  It means we can relatively easily customize the output by changing the templates.

To get started customizing Mustache templates for OpenAPIGenerator, run:

```shell
$ docker run --rm \
  -u1000 \
  -v /home/david/Projects/openadr/openadr-3-ts-types:/local \
  openapitools/openapi-generator-cli \
  author template \
  -g typescript-axios \
  --library webclient \
  -o /local/node/builder/typescript-axios
```

The `author template` command extracts the templates for a specific generator, in this case `typescript-axios`.  It's not clear where the templates are stored, but let's not worry about that right now.  It outputs the extracted templates into the directory named in the `-o` option.

The output directory will contain a long list of `.mustache` files in what looks to be structured as a Node.js/npm package.

To get started, let's edit two files starting with `apiInner.mustache`.  Find the text starting with

```js
{{#operation}}
    /**
     * {{&notes}}
     {{#summary}}
```

Immediately after add a line reading ` * Hello, world!`.

Likewise, in `modelGeneric.mustache`, find the text reading:

```js
{{#vars}}
    /**
     * {{{description}}}
     *
```

Immediately after, add a line reading ` * Hello, world!`.

Then run this:

```shell
$ docker run -u1000 --rm \
  -v /home/david/Projects/openadr/openadr-3-ts-types:/local \
  openapitools/openapi-generator-cli \
  generate \
  -i /local/oadr3.0.1.yaml \
  -t /local/node/builder/typescript-axios \
  -g typescript-axios \
  -o /local/node/builder/foo \
  --skip-validate-spec
```

We're running the `generate` command, this time with a `-t` option that specifies the template directory.

You can now run `grep Hello foo/*` to see if any files contain the `Hello, world!` text.  If so, you've successfully generated a customized template.

Let's now do something useful by implementing the missing JSDOC tags.

In their [documentation on templating](https://openapi-generator.tech/docs/templating) there is a section labeled _Models_.  They show some data objects relating to schema's defined in an OpenAPI specification.  The fields in those objects correspond to things you can enter in a Mustache template.  But, it's all not documented well.  After experimenting I found this (following `{{{description}}}` in `modelGeneric.mustache`) to work relatively well:

```js
     {{#isNullable}}
     * @nullable true
     {{/isNullable}}
     {{#default}}
     * @default {{{default}}}
     {{/default}}
     {{#dataFormat}}
     * @format {{{dataFormat}}}
     {{/dataFormat}}
     {{#exclusiveMinimum}}
     * @exclusiveMinimum true
     {{/exclusiveMinimum}}
     {{#exclusiveMaximum}}
     * @exclusiveMaximum true
     {{/exclusiveMaximum}}
     {{#minLength}}
     * @minLength {{{minLength}}}
     {{/minLength}}
     {{#maxLength}}
     * @maxLength {{{maxLength}}}
     {{/maxLength}}
     {{#required}}
     * @required
     {{/required}}
     {{#example}}
     * @example {{{example}}}
     {{/example}}
     {{#pattern}}
     * @pattern {{{pattern}}}
     {{/pattern}}
```

This successfully adds the missing JSDOC tags -- except for `@default`.  That tag, for some reason, is not showing up.

Another problem, in addition to the missing `@default` tag, the `@pattern` is generated this way:

```js
     * @pattern /^[a-zA-Z0-9_-]*$/
```

Doesn't this seem like a reasonable thing to do?  While this is precisely how one writes a regular expression in JavaScript, this does not work in a JSDOC tag.  The slashes are taken as part of the regular expression, meaning the resulting regular expression is something like `/\/^[a-zA-Z0-9_-]*$\//` which is nonsensical, and does not work.  When using `pattern` in an OpenAPI spec, we must not use slashes around the regular expression, and the same holds true of JSDOC `@pattern` tags.

Implementation of data validation in request functions is handled in `apiInner.mustache`.  Try reading the template code.  The auto-generated data validation functions discussed earlier should be utilized in this section of the template.  But, by this point I gave up.
