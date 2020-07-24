# TODO

- **load()**
  - Consider adding some schema validation to options passed to `load()` method (i.e. throw for invalid types)
    Only if we can do it with minimal impact on SDK size.
  - Should we (can we?) return a promise?
  - Is there a way to verify that iframe has loaded successfully? That our projectId exists and embed URL is accessible?
- **start-dev** - currently opens page before server is ready, so requires a reload.
- **EkoPlayer.isSupported()** - Implement! (Tomer)
- **README**
  - Add examples for `invoke()` and `load()`.
  - Document static APIs: `EkoPlayer.isSupported()` and `EkoPlayer.getProjectInfo()`
  - Nice to have: Consider generating API docs from JSDoc
