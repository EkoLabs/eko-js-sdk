# eko-js-sdk

A lightweight SDK that allows for easy integration of eko videos into webpages

# API

## EkoPlayer

Initialize an instance of the `EkoPlayer` to play an [eko](https://eko.com) video.

### Static

#### isSupported()

Will return true if playing eko projects is supported in your current web browser.

**Example**

```javascript
if (!EkoPlayer.isSupported()) {
    alert('Eko is not supported on current environment');
}
```

### Methods

#### EkoPlayer(el)

Creates an instance of an EkoPlayer.
| Param           | Type           | Description  |
| :-------------: |:--------------:| :------------|
| el | `Element, String` | The container element to be used by the player, or a DOM selector string for the container element. |
| embedapi | `String` | Optional. eko embed api version to be used internally. Valid values include `"1.0"`, `"2.0"`. If no value given, default value `"1.0"` will be used. |

#### load(projectId, options) &rarr; Promise

Will load and display an eko project. The EkoPlayerView will display the loading animation while it prepares the project for playback. Returns a promise that will fail if the project id is invalid.

| Param           | Type           | Description  |
| :-------------: |:--------------:| :------------|
| projectId | `String` | The id of a project to load and display. |
| options | `Object` | Options for project delivery. |
| options.params | `Object` | A dictionary of embed params that will affect the delivery. Default includes `{autoplay: true}`.|
| options.events | `String[]` | A list of events that should be forwarded. |
| options.cover | `Element, string, function` | An element or the query selector string for a loading cover. When loading happens a `eko-player-loading` class will be added to the element. When loading completes, the `eko-player-loading` class will be removed and replaced with `eko-player-loaded`. Once video begins playback, the `eko-player-loaded` class will be removed and replaced by `eko-player-started`. If a function is passed, it will be invoked with a string argument (state) whenever the state changes. Some states may also include a 2nd object argument which contains properties pertaining to the state. The possible state values are `loading` (cover should be shown), `loaded` (cover should be hidden and play button shown) and `started` (both cover and play button should be hidden). If no cover is provided, the default eko loading cover will be shown. |
| options.iframeAttributes | `Object` | standard attributes of iframe HTML element
| options.pageParams | `String[]` | Any query params from the page url that should be forwarded to the iframe. Can supply regex and strings. By default, the following query params will automatically be forwarded: autoplay, debug, utm_*, headnodeid. |

**Example**

```javascript
let ekoPlayer = new EkoPlayer('#myContainer', '1.0');
ekoPlayer.load('AWLLK1', {
    params: {
        autoplay: false,
        clearcheckpoints: true,
        debug: true
    },
    events: ['nodestart', 'nodeend', 'playing', 'pause'],
    cover: '#myCoverId',
    iframeAttributes: { title: 'My Eko Player' },
    pageParams: ['myCustomQueryParam']
});
```

#### play()

Will play/resume eko video project.

#### pause()

Will pause eko video project.

#### invoke(method, ...args)

Will call any player function defined on the [eko developer site](https://developer.eko.com/api/). Can also be used to set properties.

| Param           | Type           | Description  |
| :-------------: |:--------------:| :------------|
| method | `String` | The player method to call. |
| args | `Any` | Any arguments that should be passed into the method (must be serializable to json) |

**Example**

```javascript
ekoPlayer.invoke('play'); // Plays the eko project
ekoPlayer.invoke('audio.play', 'ping'); // Plays the "ping" sound effect via the audio plugin
ekoPlayer.invoke('seek', 'myNodeId', 10); // Seeks 10s into myNodeId
```

> The args array is serialized using the [structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm). This means that functions cannot be sent as args.

#### on(eventname, callbackFn)

The eko player triggers a number of events. The app can listen to these events by providing the event name in the load call.
The callbackFn will be invoked with the arguments passed by the triggered event.

#### off(eventname, callbackFn)

#### once(eventname, callbackFn)

# Default Player Events

#### canplay

Triggered when the player has buffered enough media to begin playback.

#### playing

Triggered when playback has begun.

# URLs and Sharing

If you wish to handle opening urls or social sharing yourself, simply add the following `events` to the options in the load call:

* `urls.intent`
* `share.intent`

**Example**

```javascript
let ekoPlayer = new EkoPlayer('#myContainer');

// Handle opening URLs in parent frame
ekoPlayer.on('urls.intent', ({ url }) => {
    window.open(url, '_blank');
});

// Must pass the 'urls.intent' event at load() time
// in order to be able to listen to this event
ekoPlayer.load('AWLLK1', {
    events: ['urls.intent']
});
```
