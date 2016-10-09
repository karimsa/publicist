# publicist

A publication manager to write publications in markdown.

*This project is for internal usage. Do with it what you will.*

### publicist over GitBook

It's not meant to be a "competitor". GitBook hasn't been updated in a while,
and it's issues with MathJax show up time and time again and rarely ever works
together.

## Usage

```

  Usage: publicist <command> [OPTIONS]


  Commands:

    init|i [directory]             initializes a new project
    build|b [options] [directory]  compiles publication into output forms

  A publication manager to write publications in markdown.

  Options:

    -h, --help     output usage information
    -V, --version  output the version number


```

## Notes

 - The table of contents specifies the order of published sections in the publication. If
 its not in there, it won't show up on the output.
 - The abstract of the publication belongs in the "SUMMARY.md" file. The length is irrelevant.
 - The author(s) name(s) go in the "README.md" file along with the TOC. It must be put in regular
 text in a byline by writing "Byline: [author names]".