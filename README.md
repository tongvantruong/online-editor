## Main Features

- [x] User must see the existing images from folder `images` to the images list
  - Set `loading="lazy"` to lazy load the images
- [x] User can _upload image_ to folder `images` and the list must update accordingly
  - Only render the newly uploaded image, not re-render the list
- [x] User can _add image / text_ from the sidebar to the canvas
  - Support only image, text will be done later if have more time
- [x] User can _move and delete the image / text_ inside the canvas
  - Right click to see context menu
  - Support both mouse and keyboard
  - Apply throttle to improve performance
- [x] The created objects on canvas can be saved and repopulated even if we refresh the browser!
  - Take advantages of VueUse - useLocalStorage

## Additional Features

- [x] Throttle the drag event to improve performance but still keep the movement smooth (16ms ~ 60FPS)
- [x] Delete an image by Pressing Delete/Backspace key
- [x] Move an image by pressing arrow keys (move faster if holding Shift key)
- [ ] Delete uploaded images
- [ ] Hold Cmd/Control + click to select multi images then can move or delete multi images
- [ ] Select multi images by mouse
- [ ] Right click should show list of actions on as a context menu
- [x] Duplicate feature (right click to see the action): allow duplicate a selected image, don't need to copy & paste
- [x] Bring to front feature
