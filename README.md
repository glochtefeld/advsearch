# ADVSearch
A simple advanced search parser/interpreter written in pure javascript/PHP. This has no external dependencies.

The general principle is that the compilation/linting of search terms can be done in a single pass on the front-end, before sending a neatly compiled array of search terms to the backend. Another single pass through the terms to turn them into a query, and search results can be returned to the front-end. This brushes the limit of what can be considered a DSL, but the principles are the same.

In order to use this effectively in your own tech stack, you'll likely need to reorganize this code, or (more likely) rewrite the php interface in your preferred language with your choice of ORM.

## Credits
Copyright (c) Gavin Lochtefeld 2022.
