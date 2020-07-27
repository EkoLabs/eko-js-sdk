# js-web-sdk
A lightweight SDK that allows for easy integration of eko videos into webpages

# API
## EkoPlayer
Initialize an instance of the `EkoPlayer` to play an [eko](https://eko.com) video.

### Static
#### isSupported()
Will return true if playing eko projects is supported in your current web browser.

#### getProjectInfo(projectId)
Retrieves delivery information about the project. See our [project schema documentation](https://developer.eko.com/docs/embedding/http.html#project-overrides-schema) for more information about what is delivered.

| Param           | Type           | Description  |
| :-------------: |:--------------:| :------------|
| projectId | `String` | The id of the project to retrieve information for. |

### Methods
#### EkoPlayer(el)
Creates an instance of an EkoPlayer.
| Param           | Type           | Description  |
| :-------------: |:--------------:| :------------|
| el | `Element, String` | The container element to be used by the player, or a DOM selector string for the container element. |

#### load(projectId, options) &rarr; Promise
Will load and display an eko project. The EkoPlayerView will display the loading animation while it prepares the project for playback. Returns a promise that will fail if the project id is invalid.

| Param           | Type           | Description  |
| :-------------: |:--------------:| :------------|
| projectId | `String` | The id of a project to load and display. |
| options | `Object` | Options for project delivery. |
| options.params | `Object` | A dictionary of embed params that will affect the delivery. Default includes `{autoplay: true}`.|
| options.events | `String[]` | A list of events that should be forwarded. |
| options.cover | `Element, string` | An element or the query selector string for a loading cover. When loading happens, a `"eko-player-loading"` class will be added to the element. When loading finishes, the class will be removed. If no cover is provided, the default eko loading cover will be shown. |
| options.frameTitle | `String` | The title for the iframe. |
| options.pageParams | `String[]` | Any query params from the page url that should be forwarded to the iframe. Can supply regex and strings. By default, the following query params will automatically be forwarded: autoplay, debug, utm_*, headnodeid. |

**Example**
```
let ekoPlayer = new EkoPlayer('#myContainer');
ekoPlayer.load('AWLLK1', {
    params: {
        autoplay: false,
        clearcheckpoints: true,
        debug: true
    },
    events: ['nodestart', 'nodeend', 'playing', 'pause'],
    cover: '#myCoverId',
    frameTitle: 'My Eko Player',
    pageParams: ['myCustomQueryParam']
});
```

#### play()
Will attempt to begin playing an eko project. 
#### pause()
Will attempt to pause an eko project. 
#### invoke(method, ...args)
Will call any player function defined on the developer site. Can also be used to set properties.

| Param           | Type           | Description  |
| :-------------: |:--------------:| :------------|
| method | `String` | The player method to call. |
| args | `Any` | Any arguments that should be passed into the method (must be serializable to json) |

**Example**
```
ekoPlayer.invoke('play'); // Plays the eko project
ekoPlayer.invoke('audio.play', 'ping'); // Plays the "ping" sound effect via the audio plugin
ekoPlayer.invoke('seek', 'myNodeId', 10); // Seeks 10s into myNodeId
```
> The args array is serialized using the [structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm). This means that functions cannot be sent. type cannot be one which expectes to receive a function as an argument, such as player.on.

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
If you wish to handle opening urls or social sharing yourself, simply add the following events to the options in the load call:
* `urls.intent`
* `share.intent`
