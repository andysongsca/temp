| Attribute    | Type               | Description                                  |
| ------------ | ------------------ | -------------------------------------------- |
| className    | string             | classname to attach to main parent component |
| coverText    | string             | Text on the upload btn                       |
| image        | url                | old image. Defaults to upload image if empty |
| previewType  | `circle`, `square` | Preview image shape. Default: ""             |
| previewWidth | number             | Preview container width. Default: 400        |
| allowReselect| boolean            | Show upload btn during preview: Default: true|
| aspectRatio  | number             | aspect ratio of cropped image. Defaut: NaN   |
| outputHeight | number             | Height of cropped image                      |
| outputWidth  | number             | Width of cropped image                       |
| maxWidth     | number             | Max width of cropped image. Default: 4096    |
| maxHeight    | number             | Max height of cropped image. Default: 4096   |
| minWidth     | number             | Min width of cropped image. Default: 100     |
| minHeight    | number             | Min height of cropped image. Default: 100    |
| sizeLimit    | number             | file size limit in bytes. Default: 5M        |
| theme        | `default`, `dark`  | Base theme for component. Default: "default" |
| onUpload     | `(blob) => {}`     | handler when submit button is clicked        |
| onCancel     | `() => {}`         | handler when cancel button is clicked        |
| onPreview    | `() => {}`         | handler when image preview is loaded         |
| onError      | `(err) => {}`      | err: {code, message} Default: console log    |
