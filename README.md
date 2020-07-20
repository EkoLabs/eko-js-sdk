# js-web-sdk
A lightweight SDK that allows for easy integration of eko videos into webpages

# API
## EkoPlayer
Initialize an instance of the `EkoPlayer` to play an [eko](https://eko.com) video.
### Properties
#### onEvent : `Function`
The eko player triggers a number of events. The app can listen to these events by providing the event name in the load call. This function will be called whenever an event passed in to `load()` is triggered.
| Param           | Type           | Description  |
| :-------------: |:--------------:| :------------|
| msg | `Object` | The event object from the player. |
| msg.type | `String` | The name of the event. |
| msg.embedApiVersion | `String` | API Version |
| msg.embedId | `String` | iframe ID |
| msg.args | `[]` | An array of the params sent with the event. |


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

# Default Player Events
#### eko.canplay
Triggered when the player has buffered enough media to begin playback. Only added if a cover exists and `autoplay=false`
#### eko.playing
Only added if a cover exists and `autoplay=true`

# URLs and Sharing
If you wish to handle opening urls or social sharing yourself, simple add the following events to the options in the load call:
* urls.intent
* share.intent

